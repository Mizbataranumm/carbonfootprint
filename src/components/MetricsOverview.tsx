import React from 'react';
import { ActivityLog } from '../types';
import { BENCHMARKS, CATEGORY_CONFIG } from '../data/emissionPresets';
import {
  calculateTodayEmissions,
  calculateLastNDaysEmissions,
  calculateTotalEmissions,
  calculateEquivalencies,
  getCategorySummaries,
} from '../utils/calculations';
import {
  AlertTriangle,
  CheckCircle2,
  TreePine,
  Car,
  Smartphone,
  Flame,
  ArrowUpRight,
  TrendingDown,
} from 'lucide-react';

interface MetricsOverviewProps {
  activities: ActivityLog[];
  benchmarkKey: keyof typeof BENCHMARKS;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({ activities, benchmarkKey }) => {
  const benchmark = BENCHMARKS[benchmarkKey];
  const todayKg = calculateTodayEmissions(activities);
  const totalKg = calculateTotalEmissions(activities);
  const last7Days = calculateLastNDaysEmissions(activities, 7);
  const sum7Days = last7Days.reduce((acc, curr) => acc + curr.totalKg, 0);
  const avg7Days = Math.round((sum7Days / 7) * 10) / 10;

  const percentOfDailyBudget = Math.round((todayKg / benchmark.dailyKg) * 100);
  const isBudgetExceeded = todayKg > benchmark.dailyKg;

  const equivalencies = calculateEquivalencies(todayKg || avg7Days);
  const categorySummaries = getCategorySummaries(activities);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {/* 1. Today's Carbon Budget Card */}
      <div className="bg-white rounded-xl border border-[#e2e8e3] p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#52796f]">
              Today's Footprint
            </span>
            {isBudgetExceeded ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md bg-[#fef2f2] text-[#b91c1c] border border-[#fecaca]">
                <AlertTriangle className="w-3 h-3" />
                Over Budget
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md bg-[#f0fdf4] text-[#15803d] border border-[#bbf7d0]">
                <CheckCircle2 className="w-3 h-3" />
                Within Target
              </span>
            )}
          </div>

          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#1b4332] tracking-tight">
              {todayKg.toFixed(2)}
            </span>
            <span className="text-sm font-medium text-[#52796f]">kg CO₂e</span>
          </div>

          <p className="mt-1 text-xs text-[#52796f]">
            Target limit: <strong className="text-[#1b4332]">{benchmark.dailyKg} kg</strong> (
            {percentOfDailyBudget}% used)
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="h-2 w-full bg-[#e9ecef] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                percentOfDailyBudget > 100
                  ? 'bg-[#dc2626]'
                  : percentOfDailyBudget > 75
                  ? 'bg-[#ea580c]'
                  : 'bg-[#16a34a]'
              }`}
              style={{ width: `${Math.min(percentOfDailyBudget, 100)}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-[#52796f]">
            <span>0 kg</span>
            <span className="font-semibold text-[#1b4332]">{benchmark.label}</span>
            <span>{benchmark.dailyKg} kg</span>
          </div>
        </div>
      </div>

      {/* 2. 7-Day Velocity & Average */}
      <div className="bg-white rounded-xl border border-[#e2e8e3] p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#52796f]">
              7-Day Daily Average
            </span>
            <span className="text-xs font-medium text-[#2d6a4f] bg-[#eefaf3] px-2 py-0.5 rounded-md">
              {activities.length} total logs
            </span>
          </div>

          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#1b4332] tracking-tight">
              {avg7Days.toFixed(1)}
            </span>
            <span className="text-sm font-medium text-[#52796f]">kg / day</span>
          </div>

          <p className="mt-1 text-xs text-[#52796f]">
            Projected annual:{' '}
            <strong className="text-[#1b4332]">
              {((avg7Days * 365) / 1000).toFixed(2)} tonnes
            </strong>{' '}
            CO₂e
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-[#f0f4f1] flex items-center justify-between text-xs">
          <span className="text-[#52796f]">Total recorded:</span>
          <span className="font-bold text-[#1b4332]">{totalKg.toFixed(1)} kg CO₂e</span>
        </div>
      </div>

      {/* 3. Real-world Equivalency */}
      <div className="bg-white rounded-xl border border-[#e2e8e3] p-5 shadow-xs md:col-span-1 lg:col-span-2 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#52796f]">
            Real-World Impact Equivalency
          </span>
          <span className="text-[11px] text-[#52796f]">
            Based on {todayKg > 0 ? "today's" : '7-day avg'} emissions ({todayKg > 0 ? todayKg.toFixed(1) : avg7Days} kg)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-[#f7faf8] p-3 rounded-lg border border-[#e8efe9] flex flex-col">
            <div className="flex items-center gap-1.5 text-[#0284c7] mb-1">
              <Car className="w-4 h-4" />
              <span className="text-xs font-medium text-[#52796f]">Car Travel</span>
            </div>
            <span className="text-lg font-bold text-[#1b4332]">
              {equivalencies.milesDriven}{' '}
              <span className="text-xs font-normal text-[#52796f]">miles</span>
            </span>
          </div>

          <div className="bg-[#f7faf8] p-3 rounded-lg border border-[#e8efe9] flex flex-col">
            <div className="flex items-center gap-1.5 text-[#16a34a] mb-1">
              <TreePine className="w-4 h-4" />
              <span className="text-xs font-medium text-[#52796f]">Tree Absorption</span>
            </div>
            <span className="text-lg font-bold text-[#1b4332]">
              {equivalencies.treeDaysNeeded}{' '}
              <span className="text-xs font-normal text-[#52796f]">tree-days</span>
            </span>
          </div>

          <div className="bg-[#f7faf8] p-3 rounded-lg border border-[#e8efe9] flex flex-col">
            <div className="flex items-center gap-1.5 text-[#9333ea] mb-1">
              <Smartphone className="w-4 h-4" />
              <span className="text-xs font-medium text-[#52796f]">Phones</span>
            </div>
            <span className="text-lg font-bold text-[#1b4332]">
              {equivalencies.smartphonesCharged.toLocaleString()}{' '}
              <span className="text-xs font-normal text-[#52796f]">charges</span>
            </span>
          </div>

          <div className="bg-[#f7faf8] p-3 rounded-lg border border-[#e8efe9] flex flex-col">
            <div className="flex items-center gap-1.5 text-[#eab308] mb-1">
              <Flame className="w-4 h-4" />
              <span className="text-xs font-medium text-[#52796f]">Gasoline</span>
            </div>
            <span className="text-lg font-bold text-[#1b4332]">
              {equivalencies.gasolineGallons}{' '}
              <span className="text-xs font-normal text-[#52796f]">gallons</span>
            </span>
          </div>
        </div>

        {/* Category Share mini bar */}
        <div className="mt-3.5 pt-2.5 border-t border-[#f0f4f1] flex flex-wrap items-center gap-3">
          {categorySummaries.map((cat) => (
            <div key={cat.category} className="flex items-center gap-1.5 text-xs">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: CATEGORY_CONFIG[cat.category].color }}
              />
              <span className="text-[#52796f]">{CATEGORY_CONFIG[cat.category].label}:</span>
              <span className="font-semibold text-[#1b4332]">{cat.totalKg.toFixed(1)} kg</span>
              <span className="text-[#839788] text-[11px]">({cat.percentage}%)</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
