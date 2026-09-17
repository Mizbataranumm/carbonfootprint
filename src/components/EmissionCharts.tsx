import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { ActivityLog } from '../types';
import { BENCHMARKS, CATEGORY_CONFIG } from '../data/emissionPresets';
import { calculateLastNDaysEmissions, getCategorySummaries } from '../utils/calculations';
import { PieChart as PieIcon, BarChart3 } from 'lucide-react';

interface EmissionChartsProps {
  activities: ActivityLog[];
  benchmarkKey: keyof typeof BENCHMARKS;
}

export const EmissionCharts: React.FC<EmissionChartsProps> = ({ activities, benchmarkKey }) => {
  const benchmark = BENCHMARKS[benchmarkKey];
  const categoryData = getCategorySummaries(activities).map((item) => ({
    name: CATEGORY_CONFIG[item.category].label,
    categoryKey: item.category,
    value: item.totalKg,
    percentage: item.percentage,
    color: CATEGORY_CONFIG[item.category].color,
  }));

  const trendData = calculateLastNDaysEmissions(activities, 7);

  const customPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg border border-[#e2e8e3] shadow-md text-xs">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
            <span className="font-semibold text-[#1b4332]">{data.name}</span>
          </div>
          <div className="text-[#52796f]">
            Emissions:{' '}
            <strong className="text-[#1b4332]">{data.value.toFixed(2)} kg CO₂e</strong>
          </div>
          <div className="text-[#52796f]">
            Share: <strong className="text-[#1b4332]">{data.percentage}%</strong>
          </div>
        </div>
      );
    }
    return null;
  };

  const customBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const val = payload[0].value;
      const diff = val - benchmark.dailyKg;
      return (
        <div className="bg-white p-3 rounded-lg border border-[#e2e8e3] shadow-md text-xs">
          <div className="font-semibold text-[#1b4332] mb-1">{label}</div>
          <div className="text-[#52796f]">
            Total: <strong className="text-[#1b4332]">{val.toFixed(2)} kg CO₂e</strong>
          </div>
          <div
            className={`mt-1 font-medium ${
              diff > 0 ? 'text-[#dc2626]' : 'text-[#16a34a]'
            }`}
          >
            {diff > 0
              ? `+${diff.toFixed(2)} kg over benchmark`
              : `${Math.abs(diff).toFixed(2)} kg under benchmark`}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* 1. Category Breakdown Donut */}
      <div className="bg-white rounded-xl border border-[#e2e8e3] p-5 shadow-xs flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-[#2d6a4f]" />
            <h3 className="text-sm font-bold text-[#1b4332]">Emissions by Category</h3>
          </div>
          <span className="text-xs text-[#52796f]">Cumulative distribution</span>
        </div>

        <div className="h-64 w-full">
          {categoryData.some((d) => d.value > 0) ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={customPieTooltip} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-[#52796f]">
              No emission activities recorded yet
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-[#f0f4f1]">
          {categoryData.map((cat) => (
            <div
              key={cat.categoryKey}
              className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg bg-[#f7faf8] border border-[#edf3ee]"
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="font-medium text-[#2d3748] truncate">{cat.name}</span>
              </div>
              <span className="font-bold text-[#1b4332] ml-2 shrink-0">{cat.percentage}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. 7-Day Trend vs Benchmark */}
      <div className="bg-white rounded-xl border border-[#e2e8e3] p-5 shadow-xs flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#2d6a4f]" />
            <h3 className="text-sm font-bold text-[#1b4332]">7-Day Emissions Trend</h3>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#52796f]">
            <span className="w-3 h-0.5 bg-[#dc2626] inline-block" />
            <span>Target: {benchmark.dailyKg} kg/day</span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData} margin={{ top: 15, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5ebe7" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#52796f' }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#52796f' }} tickLine={false} unit="kg" />
              <Tooltip content={customBarTooltip} />
              <ReferenceLine
                y={benchmark.dailyKg}
                stroke="#dc2626"
                strokeDasharray="4 4"
                label={{
                  value: `${benchmark.dailyKg} kg`,
                  position: 'top',
                  fill: '#dc2626',
                  fontSize: 10,
                  fontWeight: 600,
                }}
              />
              <Bar dataKey="totalKg" fill="#2d6a4f" radius={[4, 4, 0, 0]}>
                {trendData.map((entry, index) => {
                  const isOver = entry.totalKg > benchmark.dailyKg;
                  return (
                    <Cell
                      key={`bar-${index}`}
                      fill={isOver ? '#e11d48' : '#2d6a4f'}
                      opacity={0.9}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-2 pt-3 border-t border-[#f0f4f1] flex items-center justify-between text-xs text-[#52796f]">
          <span>Red bars exceed your selected {benchmark.label}</span>
          <span className="font-semibold text-[#1b4332]">
            {trendData.filter((d) => d.totalKg <= benchmark.dailyKg).length} of 7 days on target
          </span>
        </div>
      </div>
    </div>
  );
};
