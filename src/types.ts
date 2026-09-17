export type EmissionCategory = 'transport' | 'energy' | 'food' | 'consumption';

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
