import { ActivityLog } from '../types';
import { INITIAL_SAMPLE_ACTIVITIES } from '../data/emissionPresets';

const STORAGE_KEY_ACTIVITIES = 'carbon_tracker_activities_v1';
const STORAGE_KEY_BENCHMARK = 'carbon_tracker_benchmark_v1';

export function loadStoredActivities(): ActivityLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACTIVITIES);
    if (!raw) {
      // Seed with initial sample activities for immediate delight
      saveStoredActivities(INITIAL_SAMPLE_ACTIVITIES);
      return INITIAL_SAMPLE_ACTIVITIES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return INITIAL_SAMPLE_ACTIVITIES;
  } catch (e) {
    console.error('Error loading stored activities:', e);
    return INITIAL_SAMPLE_ACTIVITIES;
  }
}

export function saveStoredActivities(activities: ActivityLog[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVITIES, JSON.stringify(activities));
  } catch (e) {
    console.error('Error saving activities to localStorage:', e);
  }
}

export function loadStoredBenchmark(): string {
  try {
    return localStorage.getItem(STORAGE_KEY_BENCHMARK) || 'paris_target';
  } catch {
    return 'paris_target';
  }
}

export function saveStoredBenchmark(benchmarkKey: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_BENCHMARK, benchmarkKey);
  } catch (e) {
    console.error('Error saving benchmark:', e);
  }
}
