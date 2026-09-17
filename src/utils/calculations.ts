import { ActivityLog, EmissionCategory, CategorySummary } from '../types';

export function calculateTotalEmissions(activities: ActivityLog[]): number {
  return activities.reduce((acc, curr) => acc + (curr.co2Kg || 0), 0);
}

export function calculateTodayEmissions(activities: ActivityLog[]): number {
  const todayStr = new Date().toISOString().split('T')[0];
  return activities
    .filter((a) => a.date === todayStr)
    .reduce((acc, curr) => acc + (curr.co2Kg || 0), 0);
}

export function calculateLastNDaysEmissions(activities: ActivityLog[], days: number = 7): { date: string; label: string; totalKg: number }[] {
  const result: { date: string; label: string; totalKg: number }[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString(undefined, { weekday: 'short', month: 'numeric', day: 'numeric' });

    const totalKg = activities
      .filter((a) => a.date === dateStr)
      .reduce((sum, item) => sum + (item.co2Kg || 0), 0);

    result.push({
      date: dateStr,
      label: dayName,
      totalKg: Math.round(totalKg * 100) / 100,
    });
  }

  return result;
}

export function getCategorySummaries(activities: ActivityLog[]): CategorySummary[] {
  const categories: EmissionCategory[] = ['transport', 'energy', 'food', 'consumption'];
  const total = calculateTotalEmissions(activities);

  return categories.map((cat) => {
    const items = activities.filter((a) => a.category === cat);
    const totalKg = items.reduce((sum, item) => sum + (item.co2Kg || 0), 0);
    const percentage = total > 0 ? (totalKg / total) * 100 : 0;

    return {
      category: cat,
      totalKg: Math.round(totalKg * 100) / 100,
      percentage: Math.round(percentage * 10) / 10,
      count: items.length,
    };
  });
}

// Tangible real-world equivalencies for human comprehension
export function calculateEquivalencies(kgCO2e: number) {
  // 1 gallon of gasoline ≈ 8.887 kg CO2
  // 1 mile in average passenger car ≈ 0.39 kg CO2
  // 1 smartphone charge ≈ 0.00822 kg CO2 (8.22 grams)
  // 1 mature urban tree absorbs ≈ 21.8 kg CO2 per year (0.0597 kg/day)
  // 1 domestic flight hour ≈ 130 kg CO2e
  return {
    milesDriven: Math.round(kgCO2e / 0.39),
    smartphonesCharged: Math.round(kgCO2e / 0.00822),
    treeDaysNeeded: Math.round((kgCO2e / 0.0597) * 10) / 10,
    gasolineGallons: Math.round((kgCO2e / 8.887) * 10) / 10,
  };
}
