export type EmissionCategory = 'transport' | 'energy' | 'food' | 'consumption';

export interface FoodEmissionBreakdown {
  meatProductionKg: number;
  agricultureKg: number;
  foodMilesKg: number;
}

export interface ActivityLog {
  id: string;
  title: string;
  category: EmissionCategory;
  co2Kg: number;
  timestamp: string; // ISO string
  date: string; // YYYY-MM-DD
  details?: {
    subType?: string;
    value?: number;
    unit?: string;
    notes?: string;
    foodBreakdown?: FoodEmissionBreakdown;
    transportDetails?: {
      mode: 'car' | 'transit' | 'flight';
      fuelOrType: string;
      distanceKm: number;
      passengers?: number;
      includeRadiativeForcing?: boolean;
    };
  };
  isAiEstimated?: boolean;
}

export interface EmissionBudget {
  dailyTargetKg: number;
  period: 'day' | 'week' | 'month';
  benchmarkRegion: 'paris_target' | 'global_avg' | 'eu_avg' | 'us_avg';
}

export interface CategorySummary {
  category: EmissionCategory;
  totalKg: number;
  percentage: number;
  count: number;
}

export interface PresetEmissionTemplate {
  id: string;
  title: string;
  category: EmissionCategory;
  subType: string;
  defaultUnit: string;
  factorKgPerUnit: number; // kg CO2e per unit
  iconName: string;
  quickAmounts: number[];
}

// Transportation types
export type CarFuelType = 'gasoline' | 'diesel' | 'hybrid' | 'phev' | 'electric';
export type PublicTransitType =
  | 'city_bus'
  | 'coach_bus'
  | 'subway_metro'
  | 'intercity_train'
  | 'high_speed_rail';
export type FlightHaulType = 'short_haul' | 'medium_haul' | 'long_haul';

export interface TransportCalculationResult {
  mode: 'car' | 'transit' | 'flight';
  title: string;
  distanceKm: number;
  co2Kg: number;
  factorUsed: number;
  factorUnit: string;
  comparisonVsCarKg?: number;
}

// Goal Setting Types
export type GoalType = 'monthly_max_kg' | 'reduction_percentage';

export interface CarbonGoal {
  id: string;
  type: GoalType;
  targetValue: number; // either max kg per month (e.g. 300) or reduction percent (e.g. 25)
  baselineMonthlyKg: number; // e.g. historical monthly average or benchmark equivalent (e.g. 500)
  effectiveMonthlyTargetKg: number; // calculated max monthly budget
  title: string;
  createdAt: string;
}

export interface GoalProgress {
  currentMonthKg: number;
  monthlyTargetKg: number;
  remainingKg: number;
  percentUsed: number;
  projectedMonthEndKg: number;
  projectionStatus: 'on_track' | 'caution' | 'exceeded';
  daysPassedInMonth: number;
  daysInMonth: number;
  dailyBudgetRemainingKg: number;
}

export interface ThinkingPlanResult {
  markdownAnalysis: string;
  executiveSummary: string;
  topHotspots: {
    category: EmissionCategory;
    sharePercent: number;
    observation: string;
  }[];
  strategicActions: {
    title: string;
    impactLevel: 'Transformative' | 'High' | 'Moderate';
    estimatedAnnualSavingKg: number;
    timeline: string;
    reasoning: string;
  }[];
  reboundRisks: string[];
}
