/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ActivityLog, CarbonGoal } from './types';
import { BENCHMARKS, INITIAL_SAMPLE_ACTIVITIES } from './data/emissionPresets';
import {
  loadStoredActivities,
  saveStoredActivities,
  loadStoredBenchmark,
  saveStoredBenchmark,
} from './utils/storage';
import { loadStoredGoal, saveStoredGoal, computeGoalProgress } from './utils/goalCalculations';
import { Header } from './components/Header';
import { MetricsOverview } from './components/MetricsOverview';
import { EmissionCharts } from './components/EmissionCharts';
import { ActivityLogger } from './components/ActivityLogger';
import { ActivityList } from './components/ActivityList';
import { FoodLoggerModule } from './components/FoodLoggerModule';
import { TransportLoggerModule } from './components/TransportLoggerModule';
import { GoalTrackerModule } from './components/GoalTrackerModule';
import { DeepThinkingAdvisor } from './components/DeepThinkingAdvisor';
import { TechArchitectureModal } from './components/TechArchitectureModal';
import {
  Sparkles,
  Brain,
  ShieldCheck,
  Compass,
  Utensils,
  Car,
  PlusCircle,
  Target,
  BarChart3,
  Cpu,
} from 'lucide-react';

export default function App() {
  const [activities, setActivities] = useState<ActivityLog[]>(() => loadStoredActivities());
  const [benchmarkKey, setBenchmarkKey] = useState<keyof typeof BENCHMARKS>(() => {
    const stored = loadStoredBenchmark();
    return (stored in BENCHMARKS ? stored : 'paris_target') as keyof typeof BENCHMARKS;
  });
  const [currentGoal, setCurrentGoal] = useState<CarbonGoal>(() => loadStoredGoal());
  const [isAdvisorOpen, setIsAdvisorOpen] = useState(false);
  const [isTechModalOpen, setIsTechModalOpen] = useState(false);

  // Active Logger module tab
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<
    'food' | 'transport' | 'goals' | 'general'
  >('food');

  // Sync activities to localStorage
  useEffect(() => {
    saveStoredActivities(activities);
  }, [activities]);

  // Sync benchmark to localStorage
  useEffect(() => {
    saveStoredBenchmark(benchmarkKey);
  }, [benchmarkKey]);

  // Sync goal to localStorage
  useEffect(() => {
    saveStoredGoal(currentGoal);
  }, [currentGoal]);

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

  const goalProgress = computeGoalProgress(activities, currentGoal);

  return (
    <div className="min-h-screen bg-[#f7faf8] flex flex-col font-sans text-[#1c2826]">
      {/* 1. Header */}
      <Header
        currentBenchmark={benchmarkKey}
        onBenchmarkChange={(key) => setBenchmarkKey(key)}
        onResetData={handleResetData}
        onOpenAdvisor={() => setIsAdvisorOpen(true)}
        onOpenTechModal={() => setIsTechModalOpen(true)}
      />

      {/* 2. Main Content Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Banner: Thinking Mode Advisor CTA + Tech Architecture pill */}
        <section
          aria-label="Decarbonization banner"
          className="rounded-2xl bg-linear-to-r from-[#1b4332] via-[#245a43] to-[#2d6a4f] text-white p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#34d399]/20 text-[#a7f3d0] border border-[#34d399]/30">
                <Brain className="w-3.5 h-3.5 text-[#34d399]" />
                <span>AI Extended Thinking Active (gemini-3.1-pro-preview)</span>
              </div>
              <button
                type="button"
                onClick={() => setIsTechModalOpen(true)}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/10 hover:bg-white/20 text-[#d8f3dc] border border-white/20 transition-colors cursor-pointer"
              >
                <Cpu className="w-3 h-3 text-[#a7f3d0]" />
                <span>AI/ML/NLP Tech Specs</span>
              </button>
            </div>

            <h2 className="text-lg sm:text-xl font-bold tracking-tight">
              Carbon Footprint Engine with Agri-Food LCA &amp; Transport Modeling
            </h2>
            <p className="text-xs sm:text-sm text-[#d8f3dc] leading-relaxed">
              Log complex dietary patterns (meat production, agriculture, food miles) and journeys (car fuel types, transit, flights). Monitor monthly reduction goals and run high-depth reasoning carbon audits with Gemini 3.1 Pro.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              id="hero-open-advisor-btn"
              onClick={() => setIsAdvisorOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#34d399] text-[#0f2e21] hover:bg-[#6ee7b7] shadow-sm transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#0f2e21]" />
              <span>Launch Thinking Audit</span>
            </button>
          </div>
        </section>

        {/* 3. Metrics Overview Cards */}
        <MetricsOverview activities={activities} benchmarkKey={benchmarkKey} />

        {/* 4. Goal Tracker Module */}
        <GoalTrackerModule
          activities={activities}
          currentGoal={currentGoal}
          onUpdateGoal={(newGoal) => setCurrentGoal(newGoal)}
        />

        {/* 5. Visual Charts: Distribution & 7-Day Trend */}
        <EmissionCharts activities={activities} benchmarkKey={benchmarkKey} />

        {/* 6. Dedicated Interactive Logging Workspace */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-[#1b4332]">Carbon Emission Logging Center</h2>
              <p className="text-xs text-[#52796f]">
                Select a dedicated domain module to calculate and log emissions
              </p>
            </div>

            {/* Navigation Tabs for Modules */}
            <div className="inline-flex p-1 bg-[#e8efe9] rounded-xl border border-[#d3ded5] self-start sm:self-auto">
              <button
                id="workspace-tab-food-btn"
                type="button"
                onClick={() => setActiveWorkspaceTab('food')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeWorkspaceTab === 'food'
                    ? 'bg-white text-[#065f46] shadow-xs'
                    : 'text-[#52796f] hover:text-[#1b4332]'
                }`}
              >
                <Utensils className="w-3.5 h-3.5" />
                <span>Food &amp; Diet</span>
              </button>

              <button
                id="workspace-tab-transport-btn"
                type="button"
                onClick={() => setActiveWorkspaceTab('transport')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeWorkspaceTab === 'transport'
                    ? 'bg-white text-[#1e40af] shadow-xs'
                    : 'text-[#52796f] hover:text-[#1b4332]'
                }`}
              >
                <Car className="w-3.5 h-3.5" />
                <span>Transportation</span>
              </button>

              <button
                id="workspace-tab-general-btn"
                type="button"
                onClick={() => setActiveWorkspaceTab('general')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeWorkspaceTab === 'general'
                    ? 'bg-white text-[#1b4332] shadow-xs'
                    : 'text-[#52796f] hover:text-[#1b4332]'
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Energy &amp; General</span>
              </button>
            </div>
          </div>

          {/* Two-column layout: Active logging module on left, Activity ledger on right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7">
              {activeWorkspaceTab === 'food' && (
                <FoodLoggerModule onAddActivity={handleAddActivity} />
              )}

              {activeWorkspaceTab === 'transport' && (
                <TransportLoggerModule onAddActivity={handleAddActivity} />
              )}

              {activeWorkspaceTab === 'general' && (
                <ActivityLogger onAddActivity={handleAddActivity} />
              )}
            </div>

            <div className="lg:col-span-5">
              <ActivityList
                activities={activities}
                onDeleteActivity={handleDeleteActivity}
                onClearAll={handleClearAll}
              />
            </div>
          </div>
        </div>
      </main>

      {/* 7. Footer */}
      <footer className="border-t border-[#e2e8e3] bg-white py-6 mt-12 text-xs text-[#52796f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#2d6a4f]" />
            <span>
              LCA modeling calibrated with Poore &amp; Nemecek (Science 2018), IPCC, EPA &amp; UK DEFRA databases.
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setIsTechModalOpen(true)}
              className="font-semibold text-[#1b4332] hover:underline flex items-center gap-1"
            >
              <Cpu className="w-3 h-3" />
              <span>Tech Stack (AI/ML)</span>
            </button>
            <span>•</span>
            <button
              onClick={() => setIsAdvisorOpen(true)}
              className="font-semibold text-[#1b4332] hover:underline flex items-center gap-1"
            >
              <Compass className="w-3 h-3" />
              <span>Thinking Mode Advisor</span>
            </button>
          </div>
        </div>
      </footer>

      {/* 8. Modals */}
      <DeepThinkingAdvisor
        activities={activities}
        benchmarkKey={benchmarkKey}
        isOpen={isAdvisorOpen}
        onClose={() => setIsAdvisorOpen(false)}
      />

      <TechArchitectureModal
        isOpen={isTechModalOpen}
        onClose={() => setIsTechModalOpen(false)}
      />
    </div>
  );
}


