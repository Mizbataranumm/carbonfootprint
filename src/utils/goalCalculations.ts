import { ActivityLog, CarbonGoal, GoalProgress } from '../types';

const STORAGE_KEY_GOAL = 'carbon_tracker_user_goal';

export const DEFAULT_GOAL: CarbonGoal = {
  id: 'goal-paris-1-5',
  type: 'monthly_max_kg',
  targetValue: 167, // ~2.0 tonnes/year ÷ 12 months = 166.7 kg/month
  baselineMonthlyKg: 450,
  effectiveMonthlyTargetKg: 167,
  title: 'Paris 1.5°C Climate Target',
  createdAt: new Date().toISOString(),
};

export const PRESET_GOALS: Omit<CarbonGoal, 'id' | 'createdAt'>[] = [
  {
    type: 'monthly_max_kg',
    targetValue: 167,
    baselineMonthlyKg: 450,
    effectiveMonthlyTargetKg: 167,
    title: 'Paris 1.5°C Alignment (167 kg/mo)',
  },
  {
    type: 'reduction_percentage',
    targetValue: 20,
    baselineMonthlyKg: 450,
    effectiveMonthlyTargetKg: 360,
    title: '20% Carbon Reduction',
  },
  {
    type: 'reduction_percentage',
    targetValue: 35,
    baselineMonthlyKg: 450,
    effectiveMonthlyTargetKg: 292.5,
    title: '35% Climate Acceleration',
  },
  {
    type: 'monthly_max_kg',
    targetValue: 250,
    baselineMonthlyKg: 450,
    effectiveMonthlyTargetKg: 250,
    title: 'EU Green Benchmark (250 kg/mo)',
  },
];

export function loadStoredGoal(): CarbonGoal {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_GOAL);
    if (!raw) return DEFAULT_GOAL;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load goal from storage:', e);
    return DEFAULT_GOAL;
  }
}

export function saveStoredGoal(goal: CarbonGoal): void {
  try {
    localStorage.setItem(STORAGE_KEY_GOAL, JSON.stringify(goal));
  } catch (e) {
    console.error('Failed to save goal to storage:', e);
  }
}

export function computeGoalProgress(
  activities: ActivityLog[],
  goal: CarbonGoal,
  referenceDate: Date = new Date()
): GoalProgress {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth(); // 0-indexed
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const currentDay = Math.max(1, referenceDate.getDate());

  // Filter activities belonging to current month
  const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
  const currentMonthActivities = activities.filter((act) => act.date.startsWith(monthPrefix));

  const currentMonthKg = parseFloat(
    currentMonthActivities.reduce((sum, act) => sum + act.co2Kg, 0).toFixed(2)
  );

  const monthlyTargetKg = goal.effectiveMonthlyTargetKg;
  const remainingKg = parseFloat((monthlyTargetKg - currentMonthKg).toFixed(2));
  const percentUsed = parseFloat(((currentMonthKg / monthlyTargetKg) * 100).toFixed(1));

  // Run-rate projection
  const dailyAverage = currentMonthKg / currentDay;
  const projectedMonthEndKg = parseFloat((dailyAverage * daysInMonth).toFixed(2));

  let projectionStatus: 'on_track' | 'caution' | 'exceeded' = 'on_track';
  if (projectedMonthEndKg > monthlyTargetKg * 1.15) {
    projectionStatus = 'exceeded';
  } else if (projectedMonthEndKg > monthlyTargetKg * 0.95) {
    projectionStatus = 'caution';
  }

  const remainingDays = Math.max(1, daysInMonth - currentDay);
  const dailyBudgetRemainingKg = Math.max(0, parseFloat((remainingKg / remainingDays).toFixed(2)));

  return {
    currentMonthKg,
    monthlyTargetKg,
    remainingKg,
    percentUsed,
    projectedMonthEndKg,
    projectionStatus,
    daysPassedInMonth: currentDay,
    daysInMonth,
    dailyBudgetRemainingKg,
  };
}
