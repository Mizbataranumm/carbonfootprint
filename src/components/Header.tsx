import React from 'react';
import { Leaf, Sparkles, RotateCcw, Target } from 'lucide-react';
import { BENCHMARKS } from '../data/emissionPresets';

interface HeaderProps {
  currentBenchmark: keyof typeof BENCHMARKS;
  onBenchmarkChange: (key: keyof typeof BENCHMARKS) => void;
  onResetData: () => void;
  onOpenAdvisor: () => void;
  onOpenTechModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentBenchmark,
  onBenchmarkChange,
  onResetData,
  onOpenAdvisor,
  onOpenTechModal,
}) => {
  return (
    <header className="border-b border-[#e2e8e3] bg-white sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Brand and App Title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#2d6a4f] text-white flex items-center justify-center shadow-xs">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-[#1b4332] tracking-tight">
                  Carbon Footprint Tracker
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]">
                  <Sparkles className="w-3 h-3 text-[#10b981]" />
                  Thinking Mode AI
                </span>
              </div>
              <p className="text-xs text-[#52796f]">
                Measure emissions, benchmark targets &amp; simulate decarbonization
              </p>
            </div>
          </div>

          {/* Mobile Advisor trigger */}
          <button
            id="mobile-advisor-trigger-btn"
            onClick={onOpenAdvisor}
            className="md:hidden inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#1b4332] text-white shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#34d399]" />
            AI Audit
          </button>
        </div>

        {/* Controls: Target Benchmark & Actions */}
        <div className="flex items-center flex-wrap gap-2.5 justify-between md:justify-end">
          <div className="flex items-center gap-1.5 bg-[#f3f6f4] px-2.5 py-1 rounded-lg border border-[#e5ebe7]">
            <Target className="w-3.5 h-3.5 text-[#52796f]" />
            <span className="text-xs font-medium text-[#52796f] whitespace-nowrap">Benchmark:</span>
            <select
              id="benchmark-region-select"
              value={currentBenchmark}
              onChange={(e) => onBenchmarkChange(e.target.value as keyof typeof BENCHMARKS)}
              className="text-xs font-semibold text-[#1b4332] bg-transparent border-0 focus:ring-0 cursor-pointer outline-hidden pr-2"
            >
              {Object.entries(BENCHMARKS).map(([key, item]) => (
                <option key={key} value={key}>
                  {item.label} ({item.dailyKg} kg/day)
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="header-tech-stack-btn"
              onClick={onOpenTechModal}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#f0fdf4] text-[#166534] border border-[#bbf7d0] hover:bg-[#dcfce7] transition-colors cursor-pointer"
              title="View AI, ML, NLP & LLM Technology Architecture"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#10b981]" />
              <span className="hidden sm:inline">AI / ML Tech Stack</span>
              <span className="sm:hidden">AI Tech</span>
            </button>

            <button
              id="desktop-advisor-btn"
              onClick={onOpenAdvisor}
              className="hidden md:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#1b4332] text-white hover:bg-[#2d6a4f] transition-colors shadow-xs cursor-pointer"
              title="Launch Gemini 3.1 Pro High-Thinking Carbon Audit"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#34d399]" />
              <span>Deep Reasoning Advisor</span>
            </button>

            <button
              id="reset-sample-data-btn"
              onClick={onResetData}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#52796f] hover:text-[#1b4332] hover:bg-[#f3f6f4] border border-[#e5ebe7] transition-colors cursor-pointer"
              title="Reset to default sample activities"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Sample</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
