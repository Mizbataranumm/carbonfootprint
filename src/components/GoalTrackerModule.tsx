import React, { useState } from 'react';
import { ActivityLog, CarbonGoal, GoalType } from '../types';
import { computeGoalProgress, PRESET_GOALS } from '../utils/goalCalculations';
import {
  Target,
  Sliders,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Sparkles,
  Award,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';

interface GoalTrackerModuleProps {
  activities: ActivityLog[];
  currentGoal: CarbonGoal;
  onUpdateGoal: (goal: CarbonGoal) => void;
}

export const GoalTrackerModule: React.FC<GoalTrackerModuleProps> = ({
  activities,
  currentGoal,
  onUpdateGoal,
}) => {
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalType, setGoalType] = useState<GoalType>(currentGoal.type);
  const [targetValue, setTargetValue] = useState<number>(currentGoal.targetValue);
  const [baselineMonthlyKg, setBaselineMonthlyKg] = useState<number>(currentGoal.baselineMonthlyKg);

  const progress = computeGoalProgress(activities, currentGoal);

  const calculateEffectiveTarget = (type: GoalType, val: number, baseline: number): number => {
    if (type === 'monthly_max_kg') {
      return val;
    } else {
      // reduction percentage
      return parseFloat((baseline * (1 - val / 100)).toFixed(1));
    }
  };

  const handleSaveGoal = () => {
    const effective = calculateEffectiveTarget(goalType, targetValue, baselineMonthlyKg);
    const newTitle =
      goalType === 'monthly_max_kg'
        ? `Monthly Limit: ${targetValue} kg CO₂e`
        : `${targetValue}% Reduction Goal`;

    onUpdateGoal({
      id: `goal-${Date.now()}`,
      type: goalType,
      targetValue,
      baselineMonthlyKg,
      effectiveMonthlyTargetKg: effective,
      title: newTitle,
      createdAt: new Date().toISOString(),
    });
    setIsEditingGoal(false);
  };

  const handleSelectPreset = (preset: (typeof PRESET_GOALS)[0]) => {
    setGoalType(preset.type);
    setTargetValue(preset.targetValue);
    setBaselineMonthlyKg(preset.baselineMonthlyKg);
  };

  // Chart data comparing Baseline, Target, Current Logged, and Projected
  const chartData = [
    {
      name: 'Baseline Avg',
      kg: currentGoal.baselineMonthlyKg,
      color: '#94a3b8',
    },
    {
      name: 'Monthly Target',
      kg: currentGoal.effectiveMonthlyTargetKg,
      color: '#059669',
    },
    {
      name: 'Month-to-Date',
      kg: progress.currentMonthKg,
      color: progress.percentUsed > 100 ? '#ef4444' : '#10b981',
    },
    {
      name: 'Projected End',
      kg: progress.projectedMonthEndKg,
      color:
        progress.projectionStatus === 'exceeded'
          ? '#ef4444'
          : progress.projectionStatus === 'caution'
          ? '#f59e0b'
          : '#3b82f6',
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-[#e2e8e3] p-5 shadow-xs flex flex-col space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#edf2ee]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#ecfdf5] text-[#059669] flex items-center justify-center">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#1b4332]">Carbon Goal &amp; Reduction Tracker</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0]">
                {currentGoal.title}
              </span>
            </div>
            <p className="text-xs text-[#52796f]">
              Monthly carbon emission caps, reduction targets, and trajectory forecasting
            </p>
          </div>
        </div>

        <button
          id="toggle-edit-goal-btn"
          type="button"
          onClick={() => setIsEditingGoal(!isEditingGoal)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#f1f5f2] text-[#1b4332] hover:bg-[#e4eae5] transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>{isEditingGoal ? 'Close Settings' : 'Customize Goal'}</span>
        </button>
      </div>

      {/* Inline Goal Customizer Drawer */}
      {isEditingGoal && (
        <div className="p-4 rounded-xl bg-[#f8faf9] border border-[#ccd7cf] space-y-4 animate-fade-in text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e2e8e3] pb-2">
            <span className="font-bold text-[#1b4332]">Configure Your Climate Target:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setGoalType('monthly_max_kg')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  goalType === 'monthly_max_kg'
                    ? 'bg-[#1b4332] text-white'
                    : 'bg-white text-[#52796f] border border-[#ccd7cf]'
                }`}
              >
                Max Output (kg/mo)
              </button>
              <button
                type="button"
                onClick={() => setGoalType('reduction_percentage')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  goalType === 'reduction_percentage'
                    ? 'bg-[#1b4332] text-white'
                    : 'bg-white text-[#52796f] border border-[#ccd7cf]'
                }`}
              >
                Reduction Percentage (%)
              </button>
            </div>
          </div>

          {/* Preset Buttons */}
          <div>
            <span className="block text-[11px] font-semibold text-[#52796f] mb-1.5">
              Quick Target Presets:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PRESET_GOALS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className="p-2 text-left rounded-lg bg-white border border-[#dce6df] hover:border-[#059669] transition-all"
                >
                  <div className="font-bold text-xs truncate">{preset.title}</div>
                  <div className="text-[10px] text-[#52796f] mt-0.5">
                    Target: {preset.effectiveMonthlyTargetKg} kg/mo
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Sliders & Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {goalType === 'monthly_max_kg' ? (
              <div>
                <label htmlFor="goal-max-kg-input" className="block text-xs font-semibold text-[#1b4332] mb-1">
                  Maximum Carbon Allowance (kg CO₂e / month):
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id="goal-max-kg-input"
                    type="range"
                    min="50"
                    max="800"
                    step="5"
                    value={targetValue}
                    onChange={(e) => setTargetValue(parseFloat(e.target.value))}
                    className="flex-1 accent-[#059669]"
                  />
                  <input
                    type="number"
                    min="10"
                    max="2000"
                    value={targetValue}
                    onChange={(e) => setTargetValue(Math.max(10, parseFloat(e.target.value) || 10))}
                    className="w-20 px-2 py-1 text-xs font-bold text-center rounded border border-[#ccd7cf] bg-white"
                  />
                </div>
                <span className="text-[11px] text-[#52796f] mt-1 block">
                  ≈ {(targetValue / 30).toFixed(1)} kg CO₂e / day average allowance
                </span>
              </div>
            ) : (
              <div>
                <label htmlFor="goal-reduction-pct-input" className="block text-xs font-semibold text-[#1b4332] mb-1">
                  Target Reduction Percentage (% reduction):
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id="goal-reduction-pct-input"
                    type="range"
                    min="5"
                    max="75"
                    step="1"
                    value={targetValue}
                    onChange={(e) => setTargetValue(parseFloat(e.target.value))}
                    className="flex-1 accent-[#059669]"
                  />
                  <span className="font-extrabold text-sm text-[#059669] w-14 text-right">
                    {targetValue}%
                  </span>
                </div>
                <span className="text-[11px] text-[#52796f] mt-1 block">
                  Effective monthly target:{' '}
                  <strong>
                    {calculateEffectiveTarget(goalType, targetValue, baselineMonthlyKg)} kg CO₂e/mo
                  </strong>
                </span>
              </div>
            )}

            <div>
              <label htmlFor="goal-baseline-kg-input" className="block text-xs font-semibold text-[#1b4332] mb-1">
                Your Monthly Baseline Comparison (kg CO₂e / month):
              </label>
              <input
                id="goal-baseline-kg-input"
                type="number"
                min="100"
                step="25"
                value={baselineMonthlyKg}
                onChange={(e) => setBaselineMonthlyKg(Math.max(50, parseFloat(e.target.value) || 50))}
                className="w-full px-3 py-1.5 rounded-lg border border-[#ccd7cf] bg-white text-xs font-semibold"
              />
              <span className="text-[11px] text-[#52796f] mt-1 block">
                Standard US baseline is ~1,330 kg/mo; EU average is ~560 kg/mo; Global average is ~390 kg/mo.
              </span>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditingGoal(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#52796f] hover:bg-[#e4eae5]"
            >
              Cancel
            </button>
            <button
              id="save-custom-goal-btn"
              type="button"
              onClick={handleSaveGoal}
              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#059669] text-white hover:bg-[#047857] shadow-xs cursor-pointer"
            >
              Save Climate Target
            </button>
          </div>
        </div>
      )}

      {/* Progress Cards & Indicators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Card 1: Monthly Budget Progress */}
        <div className="p-4 rounded-xl bg-[#fafcfa] border border-[#e2e8e3] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-[#52796f] mb-1">
              <span className="font-semibold">Month-to-Date Used</span>
              <span className="font-bold text-[#1b4332]">
                Day {progress.daysPassedInMonth} of {progress.daysInMonth}
              </span>
            </div>

            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-[#1b4332]">
                {progress.currentMonthKg}
              </span>
              <span className="text-xs text-[#52796f]">
                / {progress.monthlyTargetKg} kg CO₂e
              </span>
            </div>

            {/* Visual Progress Bar */}
            <div className="h-3 w-full bg-[#e8efe9] rounded-full overflow-hidden mt-3">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  progress.percentUsed > 100
                    ? 'bg-[#ef4444]'
                    : progress.percentUsed > 80
                    ? 'bg-[#f59e0b]'
                    : 'bg-[#10b981]'
                }`}
                style={{ width: `${Math.min(100, progress.percentUsed)}%` }}
              />
            </div>
          </div>

          <div className="pt-3 text-[11px] text-[#52796f] flex items-center justify-between border-t border-[#edf2ee] mt-3">
            <span>{progress.percentUsed}% of budget consumed</span>
            <span
              className={`font-bold ${
                progress.remainingKg < 0 ? 'text-[#b91c1c]' : 'text-[#059669]'
              }`}
            >
              {progress.remainingKg >= 0
                ? `${progress.remainingKg} kg remaining`
                : `${Math.abs(progress.remainingKg)} kg over budget`}
            </span>
          </div>
        </div>

        {/* Card 2: Run-Rate Forecast */}
        <div className="p-4 rounded-xl bg-[#fafcfa] border border-[#e2e8e3] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-[#52796f] mb-1">
              <span className="font-semibold">Projected Month-End</span>
              {progress.projectionStatus === 'on_track' && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ecfdf5] text-[#059669]">
                  <CheckCircle2 className="w-3 h-3 text-[#059669]" /> On Track
                </span>
              )}
              {progress.projectionStatus === 'caution' && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#fffbeb] text-[#b45309]">
                  <AlertCircle className="w-3 h-3 text-[#f59e0b]" /> Near Limit
                </span>
              )}
              {progress.projectionStatus === 'exceeded' && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#fef2f2] text-[#b91c1c]">
                  <ShieldAlert className="w-3 h-3 text-[#ef4444]" /> Will Exceed
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-1 mt-1">
              <span
                className={`text-2xl font-black ${
                  progress.projectionStatus === 'exceeded'
                    ? 'text-[#b91c1c]'
                    : progress.projectionStatus === 'caution'
                    ? 'text-[#b45309]'
                    : 'text-[#059669]'
                }`}
              >
                {progress.projectedMonthEndKg}
              </span>
              <span className="text-xs text-[#52796f]">kg projected</span>
            </div>

            <p className="text-xs text-[#52796f] mt-2 leading-relaxed">
              At your current rate of {(progress.currentMonthKg / Math.max(1, progress.daysPassedInMonth)).toFixed(1)} kg/day, you are projected to end the month at{' '}
              <strong>{progress.projectedMonthEndKg} kg</strong>.
            </p>
          </div>

          <div className="pt-2 text-[11px] text-[#52796f] border-t border-[#edf2ee] mt-3">
            <span>
              Target vs Baseline:{' '}
              <strong>
                {(((currentGoal.baselineMonthlyKg - currentGoal.effectiveMonthlyTargetKg) /
                  currentGoal.baselineMonthlyKg) *
                  100).toFixed(0)}
                % reduction
              </strong>
            </span>
          </div>
        </div>

        {/* Card 3: Daily Allowance Run-Rate */}
        <div className="p-4 rounded-xl bg-[#fafcfa] border border-[#e2e8e3] flex flex-col justify-between">
          <div>
            <div className="text-xs font-semibold text-[#52796f] mb-1">
              Remaining Daily Allowance
            </div>

            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-[#1b4332]">
                {progress.dailyBudgetRemainingKg}
              </span>
              <span className="text-xs text-[#52796f]">kg CO₂e / day</span>
            </div>

            <p className="text-xs text-[#52796f] mt-2 leading-relaxed">
              To remain strictly within your {progress.monthlyTargetKg} kg monthly target, limit total daily emissions to{' '}
              <strong>{progress.dailyBudgetRemainingKg} kg</strong> for the remaining {progress.daysInMonth - progress.daysPassedInMonth} days.
            </p>
          </div>

          <div className="pt-2 text-[11px] text-[#059669] font-medium border-t border-[#edf2ee] mt-3 flex items-center gap-1">
            <Award className="w-3.5 h-3.5" />
            <span>Paris 1.5°C threshold: 5.5 kg/day</span>
          </div>
        </div>
      </div>

      {/* Visual Chart Comparison: Target vs Month-to-Date vs Projected */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-[#1b4332]">
            Goal Trajectory vs Historical Baseline
          </span>
          <span className="text-[11px] text-[#52796f]">Values in kg CO₂ equivalent</span>
        </div>

        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#52796f' }} />
              <YAxis tick={{ fontSize: 11, fill: '#52796f' }} />
              <Tooltip
                formatter={(val: any) => [`${val} kg CO₂e`, 'Emissions']}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid #e2e8e3',
                  fontSize: '12px',
                }}
              />
              <ReferenceLine
                y={currentGoal.effectiveMonthlyTargetKg}
                stroke="#059669"
                strokeDasharray="3 3"
                label={{
                  value: `Target: ${currentGoal.effectiveMonthlyTargetKg} kg`,
                  fill: '#059669',
                  fontSize: 10,
                  position: 'top',
                }}
              />
              <Bar dataKey="kg" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
