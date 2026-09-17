import React, { useState } from 'react';
import { ActivityLog, FoodEmissionBreakdown } from '../types';
import {
  DIETARY_PATTERNS,
  POPULAR_MEAL_PRESETS,
  DietaryPatternPreset,
  MealPreset,
  applySourcingModifier,
} from '../utils/foodCalculations';
import {
  Salad,
  Sparkles,
  Truck,
  Tractor,
  Beef,
  Plus,
  Info,
  Calendar,
  Loader2,
  Check,
  Compass,
  ArrowRight,
} from 'lucide-react';

interface FoodLoggerModuleProps {
  onAddActivity: (activity: Omit<ActivityLog, 'id' | 'timestamp'>) => void;
}

export const FoodLoggerModule: React.FC<FoodLoggerModuleProps> = ({ onAddActivity }) => {
  const [activeTab, setActiveTab] = useState<'dietary_pattern' | 'single_meal' | 'ai_analyzer'>(
    'dietary_pattern'
  );
  const [selectedPattern, setSelectedPattern] = useState<DietaryPatternPreset>(DIETARY_PATTERNS[1]);
  const [selectedMeal, setSelectedMeal] = useState<MealPreset>(POPULAR_MEAL_PRESETS[1]);
  const [sourcingOption, setSourcingOption] = useState<'local_seasonal' | 'average' | 'air_freight'>(
    'average'
  );
  const [activityDate, setActivityDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [customServings, setCustomServings] = useState<number>(1);

  // AI Analyzer state
  const [aiFoodInput, setAiFoodInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<{
    activityName: string;
    totalCo2Kg: number;
    meatProductionKg: number;
    agricultureKg: number;
    foodMilesKg: number;
    period: string;
    dietClassification: string;
    scientificRationale: string;
    lowerCarbonSwaps: string[];
  } | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // Calculate current effective footprint for Pattern tab
  const patternModified = applySourcingModifier(selectedPattern.breakdown, sourcingOption);
  const patternTotalKg = parseFloat((patternModified.totalKg * customServings).toFixed(2));

  // Calculate current effective footprint for Meal tab
  const mealModified = applySourcingModifier(selectedMeal.breakdown, sourcingOption);
  const mealTotalKg = parseFloat((mealModified.totalKg * customServings).toFixed(2));

  const handleLogDietaryPattern = () => {
    onAddActivity({
      title: `${selectedPattern.name}${customServings > 1 ? ` (${customServings} days)` : ''}`,
      category: 'food',
      co2Kg: patternTotalKg,
      date: activityDate,
      details: {
        subType: 'Dietary Pattern',
        value: customServings,
        unit: 'days',
        notes: `Dietary baseline: ${selectedPattern.name}. Meat: ${(
          patternModified.modifiedBreakdown.meatProductionKg * customServings
        ).toFixed(2)} kg, Agri: ${(
          patternModified.modifiedBreakdown.agricultureKg * customServings
        ).toFixed(2)} kg, Food Miles: ${(
          patternModified.modifiedBreakdown.foodMilesKg * customServings
        ).toFixed(2)} kg. Sourcing: ${sourcingOption.replace('_', ' ')}.`,
        foodBreakdown: {
          meatProductionKg: patternModified.modifiedBreakdown.meatProductionKg * customServings,
          agricultureKg: patternModified.modifiedBreakdown.agricultureKg * customServings,
          foodMilesKg: patternModified.modifiedBreakdown.foodMilesKg * customServings,
        },
      },
    });
  };

  const handleLogMeal = () => {
    onAddActivity({
      title: `${selectedMeal.name}${customServings > 1 ? ` (×${customServings} servings)` : ''}`,
      category: 'food',
      co2Kg: mealTotalKg,
      date: activityDate,
      details: {
        subType: 'Single Meal',
        value: customServings,
        unit: 'servings',
        notes: `Meal log: ${selectedMeal.name}. Meat: ${(
          mealModified.modifiedBreakdown.meatProductionKg * customServings
        ).toFixed(2)} kg, Agri: ${(
          mealModified.modifiedBreakdown.agricultureKg * customServings
        ).toFixed(2)} kg, Food Miles: ${(
          mealModified.modifiedBreakdown.foodMilesKg * customServings
        ).toFixed(2)} kg. Sourcing: ${sourcingOption.replace('_', ' ')}.`,
        foodBreakdown: {
          meatProductionKg: mealModified.modifiedBreakdown.meatProductionKg * customServings,
          agricultureKg: mealModified.modifiedBreakdown.agricultureKg * customServings,
          foodMilesKg: mealModified.modifiedBreakdown.foodMilesKg * customServings,
        },
      },
    });
  };

  const handleRunAiFoodAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiFoodInput.trim()) return;

    setIsAiLoading(true);
    setAiError(null);
    setAiResult(null);

    try {
      const response = await fetch('/api/estimate-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          foodInput: aiFoodInput,
          inputType: aiFoodInput.toLowerCase().includes('diet') || aiFoodInput.toLowerCase().includes('mostly') || aiFoodInput.toLowerCase().includes('daily') ? 'dietary_pattern' : 'single_meal',
          sourcingOption,
        }),
      });

      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Failed to estimate food footprint.');
      }

      setAiResult(json.data);
    } catch (err: any) {
      setAiError(err.message || 'Error communicating with food LCA analysis model.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleLogAiResult = () => {
    if (!aiResult) return;

    onAddActivity({
      title: aiResult.activityName,
      category: 'food',
      co2Kg: aiResult.totalCo2Kg,
      date: activityDate,
      details: {
        subType: aiResult.period === 'daily_pattern' ? 'Dietary Pattern' : 'Single Meal',
        notes: `${aiResult.dietClassification} • ${aiResult.scientificRationale}`,
        foodBreakdown: {
          meatProductionKg: aiResult.meatProductionKg,
          agricultureKg: aiResult.agricultureKg,
          foodMilesKg: aiResult.foodMilesKg,
        },
      },
      isAiEstimated: true,
    });

    setAiFoodInput('');
    setAiResult(null);
  };

  return (
    <div className="bg-white rounded-xl border border-[#e2e8e3] p-5 shadow-xs flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#edf2ee]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#ecfdf5] text-[#059669] flex items-center justify-center">
            <Salad className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1b4332]">Food &amp; Diet Footprint Logger</h3>
            <p className="text-xs text-[#52796f]">
              LCA modeling for meat production, farming practices, and food miles
            </p>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center p-1 bg-[#f1f5f2] rounded-lg border border-[#e4eae5] self-start sm:self-auto">
          <button
            id="food-tab-pattern-btn"
            type="button"
            onClick={() => setActiveTab('dietary_pattern')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === 'dietary_pattern'
                ? 'bg-white text-[#1b4332] shadow-xs'
                : 'text-[#52796f] hover:text-[#1b4332]'
            }`}
          >
            Dietary Patterns
          </button>
          <button
            id="food-tab-meal-btn"
            type="button"
            onClick={() => setActiveTab('single_meal')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === 'single_meal'
                ? 'bg-white text-[#1b4332] shadow-xs'
                : 'text-[#52796f] hover:text-[#1b4332]'
            }`}
          >
            Specific Meals
          </button>
          <button
            id="food-tab-ai-btn"
            type="button"
            onClick={() => setActiveTab('ai_analyzer')}
            className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === 'ai_analyzer'
                ? 'bg-white text-[#1b4332] shadow-xs'
                : 'text-[#52796f] hover:text-[#1b4332]'
            }`}
          >
            <Sparkles className="w-3 h-3 text-[#10b981]" />
            AI Food NLP
          </button>
        </div>
      </div>

      {/* Global Sourcing & Date bar */}
      <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-[#f8faf9] rounded-lg border border-[#e8efe9] text-xs">
        <div>
          <label htmlFor="food-sourcing-select" className="block text-[11px] font-semibold text-[#52796f] mb-1">
            Produce &amp; Sourcing (Food Miles Factor):
          </label>
          <select
            id="food-sourcing-select"
            value={sourcingOption}
            onChange={(e) => setSourcingOption(e.target.value as any)}
            className="w-full px-2.5 py-1.5 rounded-md border border-[#ccd7cf] bg-white text-xs text-[#1b4332] font-medium"
          >
            <option value="local_seasonal">Local &amp; In-Season (-65% Transport Freight CO₂)</option>
            <option value="average">Commercial Supermarket Baseline (Average Freight)</option>
            <option value="air_freight">Imported / Air-Freighted Out-of-Season (+350% Cold Chain)</option>
          </select>
        </div>

        <div className="flex gap-2">
          <div className="flex-1">
            <label htmlFor="food-log-date-input" className="block text-[11px] font-semibold text-[#52796f] mb-1">
              Date:
            </label>
            <input
              id="food-log-date-input"
              type="date"
              value={activityDate}
              onChange={(e) => setActivityDate(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-md border border-[#ccd7cf] bg-white text-xs text-[#1b4332]"
            />
          </div>

          <div className="w-24">
            <label htmlFor="food-servings-input" className="block text-[11px] font-semibold text-[#52796f] mb-1">
              {activeTab === 'dietary_pattern' ? 'Days:' : 'Servings:'}
            </label>
            <input
              id="food-servings-input"
              type="number"
              min="1"
              max="30"
              value={customServings}
              onChange={(e) => setCustomServings(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-2.5 py-1.5 rounded-md border border-[#ccd7cf] bg-white text-xs text-[#1b4332] font-semibold text-center"
            />
          </div>
        </div>
      </div>

      {/* TAB 1: Dietary Patterns */}
      {activeTab === 'dietary_pattern' && (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {DIETARY_PATTERNS.map((p) => {
              const isSelected = p.id === selectedPattern.id;
              return (
                <button
                  key={p.id}
                  id={`diet-pattern-${p.id}`}
                  type="button"
                  onClick={() => setSelectedPattern(p)}
                  className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#059669] bg-[#ecfdf5] text-[#065f46] shadow-xs ring-1 ring-[#059669]'
                      : 'border-[#e5ebe7] bg-white text-[#2d3748] hover:border-[#ccd7cf] hover:bg-[#fafcfa]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs">{p.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#059669] shrink-0" />}
                  </div>
                  <p className="text-[11px] text-[#52796f] line-clamp-2 leading-tight mb-2">
                    {p.description}
                  </p>
                  <div className="flex items-center justify-between pt-1 border-t border-[#d1fae5]/60 text-[11px]">
                    <span className="font-semibold">{p.dailyCo2Kg.toFixed(1)} kg CO₂e/day</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/80 font-medium">
                      {p.tags[0]}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* 3-Pillar Factor Breakdown Card */}
          <div className="p-4 rounded-xl bg-[#fafcfa] border border-[#dce6df] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#1b4332]">
                  Scientific Emission Breakdown: {selectedPattern.name}
                </span>
                <p className="text-[11px] text-[#52796f]">
                  Peer-reviewed LCA factors (enteric fermentation, agricultural fertilizer, food freight)
                </p>
              </div>
              <div className="text-right">
                <span className="text-lg font-black text-[#059669]">{patternTotalKg}</span>
                <span className="text-xs text-[#52796f] ml-1">kg CO₂e</span>
              </div>
            </div>

            {/* Horizontal Factor Bars */}
            <div className="space-y-2 pt-1 text-xs">
              <div>
                <div className="flex justify-between text-[11px] text-[#52796f] mb-0.5">
                  <span className="flex items-center gap-1 font-medium text-[#b91c1c]">
                    <Beef className="w-3.5 h-3.5" /> Meat Production &amp; Enteric Methane
                  </span>
                  <span className="font-semibold">
                    {(patternModified.modifiedBreakdown.meatProductionKg * customServings).toFixed(2)} kg
                  </span>
                </div>
                <div className="h-2 w-full bg-[#f1f5f2] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#ef4444] rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        (patternModified.modifiedBreakdown.meatProductionKg /
                          Math.max(0.1, patternModified.totalKg)) *
                          100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-[#52796f] mb-0.5">
                  <span className="flex items-center gap-1 font-medium text-[#d97706]">
                    <Tractor className="w-3.5 h-3.5" /> Agriculture, Fertilizer &amp; Dairy Processing
                  </span>
                  <span className="font-semibold">
                    {(patternModified.modifiedBreakdown.agricultureKg * customServings).toFixed(2)} kg
                  </span>
                </div>
                <div className="h-2 w-full bg-[#f1f5f2] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#f59e0b] rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        (patternModified.modifiedBreakdown.agricultureKg /
                          Math.max(0.1, patternModified.totalKg)) *
                          100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-[#52796f] mb-0.5">
                  <span className="flex items-center gap-1 font-medium text-[#2563eb]">
                    <Truck className="w-3.5 h-3.5" /> Food Miles &amp; Cold-Chain Freight
                  </span>
                  <span className="font-semibold">
                    {(patternModified.modifiedBreakdown.foodMilesKg * customServings).toFixed(2)} kg
                  </span>
                </div>
                <div className="h-2 w-full bg-[#f1f5f2] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#3b82f6] rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        (patternModified.modifiedBreakdown.foodMilesKg /
                          Math.max(0.1, patternModified.totalKg)) *
                          100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-[#e2e8e3]">
              <div className="text-[11px] text-[#52796f] flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-[#059669]" />
                <span>
                  Switching from Heavy Meat to Mostly Vegetarian saves ~1,350 kg CO₂e annually.
                </span>
              </div>

              <button
                id="log-dietary-pattern-btn"
                type="button"
                onClick={handleLogDietaryPattern}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-[#059669] text-white hover:bg-[#047857] transition-colors shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log Dietary Pattern</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Specific Meals */}
      {activeTab === 'single_meal' && (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {POPULAR_MEAL_PRESETS.map((m) => {
              const isSelected = m.id === selectedMeal.id;
              return (
                <button
                  key={m.id}
                  id={`meal-preset-${m.id}`}
                  type="button"
                  onClick={() => setSelectedMeal(m)}
                  className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#059669] bg-[#ecfdf5] text-[#065f46] shadow-xs ring-1 ring-[#059669]'
                      : 'border-[#e5ebe7] bg-white text-[#2d3748] hover:border-[#ccd7cf] hover:bg-[#fafcfa]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs truncate">{m.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#059669] shrink-0 ml-1" />}
                  </div>
                  <p className="text-[11px] text-[#52796f] line-clamp-2 leading-tight mb-2">
                    {m.description}
                  </p>
                  <div className="flex items-center justify-between pt-1 border-t border-[#d1fae5]/60 text-[11px]">
                    <span className="font-bold">{m.servingCo2Kg.toFixed(1)} kg CO₂e</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider bg-white/80">
                      {m.categoryTag}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Factor Breakdown Card for Meal */}
          <div className="p-4 rounded-xl bg-[#fafcfa] border border-[#dce6df] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#1b4332]">
                  Meal Footprint: {selectedMeal.name}
                </span>
                <p className="text-[11px] text-[#52796f]">
                  Meat production ({mealModified.modifiedBreakdown.meatProductionKg} kg) + Agriculture (
                  {mealModified.modifiedBreakdown.agricultureKg} kg) + Freight (
                  {mealModified.modifiedBreakdown.foodMilesKg} kg)
                </p>
              </div>
              <div className="text-right">
                <span className="text-lg font-black text-[#059669]">{mealTotalKg}</span>
                <span className="text-xs text-[#52796f] ml-1">kg CO₂e</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-[#e2e8e3]">
              <div className="text-[11px] text-[#52796f]">
                Ruminant beef has ~15x higher carbon intensity per calorie than legumes or grains.
              </div>

              <button
                id="log-single-meal-btn"
                type="button"
                onClick={handleLogMeal}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-[#059669] text-white hover:bg-[#047857] transition-colors shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log Meal to Tracker</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AI Food NLP Estimator */}
      {activeTab === 'ai_analyzer' && (
        <div className="mt-4 space-y-4">
          <form onSubmit={handleRunAiFoodAnalysis} className="space-y-3">
            <div>
              <label htmlFor="ai-food-input-text" className="block text-xs font-semibold text-[#1b4332] mb-1">
                Describe your meal or general dietary pattern in natural language:
              </label>
              <textarea
                id="ai-food-input-text"
                rows={3}
                value={aiFoodInput}
                onChange={(e) => setAiFoodInput(e.target.value)}
                placeholder="e.g. 'I eat mostly vegetarian on weekdays but have red meat twice on weekends', or '250g grilled lamb chops with Greek salad and imported olives'..."
                className="w-full p-3 text-xs rounded-xl border border-[#ccd7cf] bg-white focus:ring-2 focus:ring-[#059669] outline-hidden resize-none"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-[11px] text-[#52796f]">
                <Sparkles className="w-3.5 h-3.5 text-[#059669]" />
                <span>
                  Uses <strong>gemini-3.8-flash</strong> NLP to deconstruct enteric methane, fertilizers, and logistics.
                </span>
              </div>

              <button
                id="run-ai-food-nlp-btn"
                type="submit"
                disabled={isAiLoading || !aiFoodInput.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-[#059669] text-white hover:bg-[#047857] disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
              >
                {isAiLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing Food LCA...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-[#a7f3d0]" />
                    <span>Analyze Food Carbon</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {aiError && (
            <div className="p-3 rounded-lg bg-[#fef2f2] border border-[#fecaca] text-xs text-[#991b1b]">
              {aiError}
            </div>
          )}

          {aiResult && (
            <div className="p-4 rounded-xl border border-[#a7f3d0] bg-[#f0fdf4] space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#065f46]">
                      {aiResult.dietClassification}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#dcfce7] text-[#15803d] font-semibold">
                      {aiResult.period === 'daily_pattern' ? 'Daily Pattern' : 'Single Meal'}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-[#14532d] mt-0.5">
                    {aiResult.activityName}
                  </h4>
                </div>

                <div className="text-right">
                  <span className="text-2xl font-black text-[#059669]">
                    {aiResult.totalCo2Kg.toFixed(2)}
                  </span>
                  <span className="text-xs text-[#15803d] ml-1">kg CO₂e</span>
                </div>
              </div>

              {/* Breakdown Grid */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 bg-white/80 rounded-lg border border-[#bbf7d0]">
                  <div className="text-[10px] text-[#b91c1c] font-bold">Meat &amp; Methane</div>
                  <div className="text-xs font-bold text-[#1b4332]">{aiResult.meatProductionKg.toFixed(2)} kg</div>
                </div>
                <div className="p-2 bg-white/80 rounded-lg border border-[#bbf7d0]">
                  <div className="text-[10px] text-[#d97706] font-bold">Agriculture &amp; Soil</div>
                  <div className="text-xs font-bold text-[#1b4332]">{aiResult.agricultureKg.toFixed(2)} kg</div>
                </div>
                <div className="p-2 bg-white/80 rounded-lg border border-[#bbf7d0]">
                  <div className="text-[10px] text-[#2563eb] font-bold">Food Miles Freight</div>
                  <div className="text-xs font-bold text-[#1b4332]">{aiResult.foodMilesKg.toFixed(2)} kg</div>
                </div>
              </div>

              <div className="text-xs text-[#14532d] bg-white/70 p-2.5 rounded-lg border border-[#bbf7d0]">
                <strong>Scientific Rationale:</strong> {aiResult.scientificRationale}
              </div>

              {aiResult.lowerCarbonSwaps && aiResult.lowerCarbonSwaps.length > 0 && (
                <div className="text-xs text-[#14532d]">
                  <span className="font-semibold">💡 Recommended Low-Carbon Swaps:</span>
                  <ul className="list-disc list-inside mt-1 space-y-0.5 text-[11px] text-[#166534]">
                    {aiResult.lowerCarbonSwaps.map((swap, idx) => (
                      <li key={idx}>{swap}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  id="log-ai-food-result-btn"
                  type="button"
                  onClick={handleLogAiResult}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-[#059669] text-white hover:bg-[#047857] transition-colors shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add to Carbon Log</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
