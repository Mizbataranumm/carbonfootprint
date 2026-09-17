/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ActivityLog } from './types';
import { BENCHMARKS, INITIAL_SAMPLE_ACTIVITIES } from './data/emissionPresets';
import {
  loadStoredActivities,
  saveStoredActivities,
  loadStoredBenchmark,
  saveStoredBenchmark,
} from './utils/storage';
import { Header } from './components/Header';
import { MetricsOverview } from './components/MetricsOverview';
import { EmissionCharts } from './components/EmissionCharts';
import { ActivityLogger } from './components/ActivityLogger';
import { ActivityList } from './components/ActivityList';
import { DeepThinkingAdvisor } from './components/DeepThinkingAdvisor';
import { Sparkles, Brain, ShieldCheck, Compass } from 'lucide-react';

export default function App() {
  const [activities, setActivities] = useState<ActivityLog[]>(() => loadStoredActivities());
  const [benchmarkKey, setBenchmarkKey] = useState<keyof typeof BENCHMARKS>(() => {
    const stored = loadStoredBenchmark();
    return (stored in BENCHMARKS ? stored : 'paris_target') as keyof typeof BENCHMARKS;
  });
  const [isAdvisorOpen, setIsAdvisorOpen] = useState(false);

  // Sync state to localStorage whenever activities change
  useEffect(() => {
    saveStoredActivities(activities);
  }, [activities]);

  // Sync benchmark to localStorage
  useEffect(() => {
    saveStoredBenchmark(benchmarkKey);
  }, [benchmarkKey]);

  const handleAddActivity = (newAct: Omit<ActivityLog, 'id' | 'timestamp'>) => {
    const entry: ActivityLog = {
      ...newAct,
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
    };
    setActivities((prev) => [entry, ...prev]);
  };

  const handleDeleteActivity = (id: string) => {
    setActivities((prev) => prev.filter((a) => a.id !== id));
  };

  const handleClearAll = () => {
    setActivities([]);
  };

  const handleResetData = () => {
    if (window.confirm('Reset tracker with realistic starter activities?')) {
      setActivities(INITIAL_SAMPLE_ACTIVITIES);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7faf8] flex flex-col font-sans text-[#1c2826]">
      {/* 1. Header */}
      <Header
        currentBenchmark={benchmarkKey}
        onBenchmarkChange={(key) => setBenchmarkKey(key)}
        onResetData={handleResetData}
        onOpenAdvisor={() => setIsAdvisorOpen(true)}
      />

      {/* 2. Main Content Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Callout Banner: Thinking Mode Advisor CTA */}
        <section aria-label="Decarbonization banner" className="rounded-2xl bg-linear-to-r from-[#1b4332] via-[#245a43] to-[#2d6a4f] text-white p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#34d399]/20 text-[#a7f3d0] border border-[#34d399]/30">
              <Brain className="w-3.5 h-3.5 text-[#34d399]" />
              <span>AI Thinking Mode Active (gemini-3.1-pro-preview)</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight">
              Need deep lifecycle guidance or scenario simulations?
            </h2>
            <p className="text-xs sm:text-sm text-[#d8f3dc] leading-relaxed">
              Use Gemini 3.1 Pro with high-reasoning thinking mode to analyze Scope 1–3 emissions,
              audit personal carbon drivers, evaluate rebound risks, and simulate lifestyle shifts.
            </p>
          </div>

          <button
            onClick={() => setIsAdvisorOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#34d399] text-[#0f2e21] hover:bg-[#6ee7b7] shadow-sm transition-all shrink-0 hover:scale-[1.02]"
          >
            <Sparkles className="w-4 h-4 text-[#0f2e21]" />
            <span>Launch Deep Reasoning Audit</span>
          </button>
        </section>

        {/* 3. Metrics Overview Cards */}
        <MetricsOverview activities={activities} benchmarkKey={benchmarkKey} />

        {/* 4. Visual Charts: Distribution & 7-Day Trend */}
        <EmissionCharts activities={activities} benchmarkKey={benchmarkKey} />

        {/* 5. Two-column Interactive Workspace: Activity Logger & Activity List */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <ActivityLogger onAddActivity={handleAddActivity} />
          </div>

          <div className="lg:col-span-5">
            <ActivityList
              activities={activities}
              onDeleteActivity={handleDeleteActivity}
              onClearAll={handleClearAll}
            />
          </div>
        </div>
      </main>

      {/* 6. Footer */}
      <footer className="border-t border-[#e2e8e3] bg-white py-6 mt-12 text-xs text-[#52796f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#2d6a4f]" />
            <span>
              Standardized emission factors adapted from IPCC, EPA &amp; UK DEFRA greenhouse gas conversion databases.
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Target: 2.0 tonnes CO₂e/yr (Paris 1.5°C)</span>
            <span>•</span>
            <button
              onClick={() => setIsAdvisorOpen(true)}
              className="font-semibold text-[#1b4332] hover:underline flex items-center gap-1"
            >
              <Compass className="w-3 h-3" />
              <span>Decarbonization Advisor</span>
            </button>
          </div>
        </div>
      </footer>

      {/* 7. Deep Thinking Advisor Modal */}
      <DeepThinkingAdvisor
        activities={activities}
        benchmarkKey={benchmarkKey}
        isOpen={isAdvisorOpen}
        onClose={() => setIsAdvisorOpen(false)}
      />
    </div>
  );
}

