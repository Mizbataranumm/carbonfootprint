import React, { useState } from 'react';
import {
  Car,
  Zap,
  Salad,
  ShoppingBag,
  Plus,
  Sparkles,
  Calendar,
  Check,
  AlertCircle,
  Loader2,
  HelpCircle,
} from 'lucide-react';
import { ActivityLog, EmissionCategory, PresetEmissionTemplate } from '../types';
import { CATEGORY_CONFIG, PRESET_ACTIVITIES } from '../data/emissionPresets';

interface ActivityLoggerProps {
  onAddActivity: (activity: Omit<ActivityLog, 'id' | 'timestamp'>) => void;
}

export const ActivityLogger: React.FC<ActivityLoggerProps> = ({ onAddActivity }) => {
  const [activeTab, setActiveTab] = useState<'preset' | 'ai'>('preset');
  const [selectedCategory, setSelectedCategory] = useState<EmissionCategory>('transport');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('car-petrol');
  const [amountValue, setAmountValue] = useState<number>(20);
  const [activityDate, setActivityDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [customNotes, setCustomNotes] = useState<string>('');

  // AI Freeform state
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<{
    activityName: string;
    category: EmissionCategory;
    co2Kg: number;
    confidence: string;
    rationale: string;
    cleanerAlternative: string;
  } | null>(null);

  // Filter presets for the active category
  const categoryPresets = PRESET_ACTIVITIES.filter((p) => p.category === selectedCategory);
  const currentPreset =
    categoryPresets.find((p) => p.id === selectedPresetId) || categoryPresets[0] || PRESET_ACTIVITIES[0];

  const calculatedPresetKg =
    Math.round(amountValue * currentPreset.factorKgPerUnit * 100) / 100;

  const handlePresetCategorySelect = (cat: EmissionCategory) => {
    setSelectedCategory(cat);
    const firstInCat = PRESET_ACTIVITIES.find((p) => p.category === cat);
    if (firstInCat) {
      setSelectedPresetId(firstInCat.id);
      setAmountValue(firstInCat.quickAmounts[0] || 1);
    }
  };

  const handleSelectPreset = (preset: PresetEmissionTemplate) => {
    setSelectedPresetId(preset.id);
    if (!preset.quickAmounts.includes(amountValue)) {
      setAmountValue(preset.quickAmounts[0] || 1);
    }
  };

  const handleSubmitPreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (amountValue <= 0) return;

    onAddActivity({
      title: `${currentPreset.title} (${amountValue} ${currentPreset.defaultUnit})`,
      category: currentPreset.category,
      co2Kg: calculatedPresetKg,
      date: activityDate,
      details: {
        subType: currentPreset.subType,
        value: amountValue,
        unit: currentPreset.defaultUnit,
        notes: customNotes.trim() || undefined,
      },
      isAiEstimated: false,
    });

    setCustomNotes('');
  };

  const handleRunAiEstimation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setIsAiLoading(true);
    setAiError(null);
    setAiResult(null);

    try {
      const res = await fetch('/api/estimate-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activityDescription: aiPrompt.trim() }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to estimate carbon footprint.');
      }

      setAiResult(json.data);
    } catch (err: any) {
      setAiError(err.message || 'Something went wrong contacting the carbon estimation model.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAddAiResultToLog = () => {
    if (!aiResult) return;

    onAddActivity({
      title: aiResult.activityName,
      category: aiResult.category,
      co2Kg: aiResult.co2Kg,
      date: activityDate,
      details: {
        notes: `${aiResult.rationale} (Alt: ${aiResult.cleanerAlternative})`,
      },
      isAiEstimated: true,
    });

    setAiPrompt('');
    setAiResult(null);
  };

  return (
    <div className="bg-white rounded-xl border border-[#e2e8e3] p-5 shadow-xs">
      {/* Tab toggle */}
      <div className="flex items-center justify-between border-b border-[#edf2ee] pb-4 mb-4">
        <div>
          <h2 className="text-base font-bold text-[#1b4332]">Log Carbon Activity</h2>
          <p className="text-xs text-[#52796f]">
            Record daily actions or use AI to calculate non-standard items
          </p>
        </div>

        <div className="flex items-center p-1 bg-[#f1f5f2] rounded-lg border border-[#e4eae5]">
          <button
            id="tab-preset-logger-btn"
            type="button"
            onClick={() => setActiveTab('preset')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === 'preset'
                ? 'bg-white text-[#1b4332] shadow-xs'
                : 'text-[#52796f] hover:text-[#1b4332]'
            }`}
          >
            Standard Preset
          </button>
          <button
            id="tab-ai-estimator-btn"
            type="button"
            onClick={() => setActiveTab('ai')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === 'ai'
                ? 'bg-white text-[#1b4332] shadow-xs'
                : 'text-[#52796f] hover:text-[#1b4332]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#10b981]" />
            AI Estimator
          </button>
        </div>
      </div>

      {/* Tab 1: Standard Preset Activity Logger */}
      {activeTab === 'preset' && (
        <form onSubmit={handleSubmitPreset} className="space-y-4">
          {/* Category Selector Pills */}
          <div>
            <label className="block text-xs font-medium text-[#52796f] mb-1.5">
              Select Category:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['transport', 'energy', 'food', 'consumption'] as EmissionCategory[]).map((cat) => {
                const config = CATEGORY_CONFIG[cat];
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handlePresetCategorySelect(cat)}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs font-semibold transition-all ${
                      isSelected
                        ? 'border-[#2d6a4f] bg-[#eefaf3] text-[#1b4332] shadow-xs ring-1 ring-[#2d6a4f]'
                        : 'border-[#e4eae5] bg-[#fafcfa] text-[#4b6354] hover:bg-white hover:border-[#ccd7cf]'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: config.color }}
                    />
                    <span>{config.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Activity Presets Grid */}
          <div>
            <label className="block text-xs font-medium text-[#52796f] mb-1.5">
              Activity Type:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {categoryPresets.map((preset) => {
                const isSelected = preset.id === currentPreset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`text-left p-3 rounded-lg border transition-all ${
                      isSelected
                        ? 'border-[#1b4332] bg-[#f2f8f4] text-[#1b4332] shadow-xs'
                        : 'border-[#e5ebe7] bg-white text-[#2d3748] hover:border-[#cbd5e1]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-xs truncate">{preset.title}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#16a34a] shrink-0 ml-1" />}
                    </div>
                    <div className="text-[11px] text-[#52796f]">
                      {(preset.factorKgPerUnit * 1).toFixed(3)} kg CO₂e / {preset.defaultUnit}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amount and Quick Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div>
              <label htmlFor="activity-amount-input" className="block text-xs font-medium text-[#52796f] mb-1">
                Amount ({currentPreset.defaultUnit}):
              </label>
              <input
                id="activity-amount-input"
                type="number"
                min="0.1"
                step="any"
                value={amountValue}
                onChange={(e) => setAmountValue(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full px-3 py-2 text-sm font-semibold rounded-lg border border-[#ccd7cf] bg-white focus:outline-hidden focus:ring-2 focus:ring-[#2d6a4f]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[#52796f] mb-1">
                Quick amounts ({currentPreset.defaultUnit}):
              </label>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {currentPreset.quickAmounts.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAmountValue(amt)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors cursor-pointer ${
                      amountValue === amt
                        ? 'bg-[#1b4332] text-white border-[#1b4332]'
                        : 'bg-[#f4f7f5] text-[#2d3748] border-[#e1e7e3] hover:bg-white'
                    }`}
                  >
                    {amt} {currentPreset.defaultUnit}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Date & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="activity-date-input" className="block text-xs font-medium text-[#52796f] mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Date:
              </label>
              <input
                id="activity-date-input"
                type="date"
                value={activityDate}
                onChange={(e) => setActivityDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#ccd7cf] bg-white focus:outline-hidden focus:ring-2 focus:ring-[#2d6a4f]"
              />
            </div>

            <div>
              <label htmlFor="activity-notes-input" className="block text-xs font-medium text-[#52796f] mb-1">
                Optional note / tag:
              </label>
              <input
                id="activity-notes-input"
                type="text"
                placeholder="e.g. Morning commute, Grocery haul..."
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#ccd7cf] bg-white focus:outline-hidden focus:ring-2 focus:ring-[#2d6a4f]"
              />
            </div>
          </div>

          {/* Calculation Summary Bar & Submit */}
          <div className="mt-3 p-3.5 rounded-lg bg-[#f0fdf4] border border-[#bbf7d0] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="text-xs text-[#166534]">
                Calculated Footprint:{' '}
                <span className="text-lg font-extrabold text-[#14532d] ml-1">
                  {calculatedPresetKg.toFixed(2)} kg CO₂e
                </span>
              </div>
              <p className="text-[11px] text-[#15803d]">
                Math: {amountValue} {currentPreset.defaultUnit} × {currentPreset.factorKgPerUnit} kg CO₂e/{currentPreset.defaultUnit}
              </p>
            </div>

            <button
              id="submit-preset-activity-btn"
              type="submit"
              className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-lg text-xs font-bold bg-[#1b4332] text-white hover:bg-[#2d6a4f] shadow-xs transition-colors shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Log to Footprint</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: AI Freeform Natural Language Estimator */}
      {activeTab === 'ai' && (
        <div className="space-y-4">
          <form onSubmit={handleRunAiEstimation} className="space-y-3">
            <div>
              <label htmlFor="ai-activity-description-textarea" className="block text-xs font-medium text-[#52796f] mb-1">
                Describe any meal, purchase, trip, or action:
              </label>
              <div className="relative">
                <textarea
                  id="ai-activity-description-textarea"
                  rows={3}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g. 200g ribeye steak with french fries, or Bought 2 cotton hoodies from Zara, or 3-hour flight from Chicago to Miami..."
                  className="w-full p-3 text-xs rounded-lg border border-[#ccd7cf] bg-white focus:outline-hidden focus:ring-2 focus:ring-[#2d6a4f] resize-none"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1 text-[11px] text-[#52796f]">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Gemini parses lifecycle factors, embodied carbon, and supply chains.</span>
              </div>

              <button
                id="submit-ai-estimation-btn"
                type="submit"
                disabled={isAiLoading || !aiPrompt.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-[#1b4332] text-white hover:bg-[#2d6a4f] disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
              >
                {isAiLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Calculating LCA Math...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-[#34d399]" />
                    <span>Estimate Carbon</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {aiError && (
            <div id="ai-estimation-error" className="p-3 rounded-lg bg-[#fef2f2] border border-[#fecaca] text-xs text-[#991b1b] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{aiError}</span>
            </div>
          )}

          {aiResult && (
            <div id="ai-estimation-result-card" className="p-4 rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] space-y-3 animate-fade-in">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#166534]">
                      {aiResult.category}
                    </span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#dcfce7] text-[#15803d]">
                      {aiResult.confidence} Confidence
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-[#14532d] mt-0.5">
                    {aiResult.activityName}
                  </h4>
                </div>

                <div className="text-right">
                  <span className="text-2xl font-extrabold text-[#166534]">
                    {aiResult.co2Kg.toFixed(2)}
                  </span>
                  <span className="text-xs font-medium text-[#15803d] ml-1">kg CO₂e</span>
                </div>
              </div>

              <div className="text-xs text-[#166534] bg-white/70 p-2.5 rounded-lg border border-[#bbf7d0]">
                <strong>Scientific Rationale:</strong> {aiResult.rationale}
              </div>

              <div className="text-xs text-[#14532d] flex items-center gap-1.5">
                <span className="font-semibold">💡 Cleaner Alternative:</span>
                <span>{aiResult.cleanerAlternative}</span>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  id="add-ai-result-to-log-btn"
                  type="button"
                  onClick={handleAddAiResultToLog}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-[#166534] text-white hover:bg-[#14532d] transition-colors shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add This Result to Log</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
