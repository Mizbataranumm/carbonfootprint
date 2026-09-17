import { ActivityLog, EmissionCategory, PresetEmissionTemplate } from '../types';

export const BENCHMARKS = {
  paris_target: { label: 'Paris 1.5°C Climate Goal', dailyKg: 5.5, annualKg: 2000, color: '#16a34a' },
  global_avg: { label: 'Global Citizen Average', dailyKg: 13.0, annualKg: 4750, color: '#0284c7' },
  eu_avg: { label: 'European Union Average', dailyKg: 21.0, annualKg: 7660, color: '#d97706' },
  us_avg: { label: 'US Citizen Average', dailyKg: 41.5, annualKg: 15150, color: '#dc2626' },
};

export const CATEGORY_CONFIG: Record<
  EmissionCategory,
  { label: string; color: string; bgLight: string; borderColor: string; icon: string; description: string }
> = {
  transport: {
    label: 'Transport',
    color: '#0284c7', // Sky blue
    bgLight: '#f0f9ff',
    borderColor: '#bae6fd',
    icon: 'Car',
    description: 'Vehicles, commuting, trains, and flights',
  },
  energy: {
    label: 'Home & Energy',
    color: '#eab308', // Amber/gold
    bgLight: '#fefce8',
    borderColor: '#fef08a',
    icon: 'Zap',
    description: 'Electricity grid, heating, natural gas, hot water',
  },
  food: {
    label: 'Food & Diet',
    color: '#16a34a', // Leaf green
    bgLight: '#f0fdf4',
    borderColor: '#bbf7d0',
    icon: 'Salad',
    description: 'Meals, meat, dairy, local vs imported groceries',
  },
  consumption: {
    label: 'Goods & Living',
    color: '#9333ea', // Violet
    bgLight: '#faf5ff',
    borderColor: '#e9d5ff',
    icon: 'ShoppingBag',
    description: 'Purchases, clothing, electronics, packaging',
  },
};

export const PRESET_ACTIVITIES: PresetEmissionTemplate[] = [
  // Transport
  {
    id: 'car-petrol',
    title: 'Gasoline / Petrol Car',
    category: 'transport',
    subType: 'Combustion Car',
    defaultUnit: 'km',
    factorKgPerUnit: 0.192, // ~192g CO2/km average passenger car
    iconName: 'Car',
    quickAmounts: [10, 25, 50, 100],
  },
  {
    id: 'car-ev',
    title: 'Electric Vehicle (EV)',
    category: 'transport',
    subType: 'EV with Grid Mix',
    defaultUnit: 'km',
    factorKgPerUnit: 0.053, // ~53g CO2/km average grid mix
    iconName: 'Zap',
    quickAmounts: [15, 30, 60, 120],
  },
  {
    id: 'public-bus',
    title: 'City Bus / Transit',
    category: 'transport',
    subType: 'Public Bus',
    defaultUnit: 'km',
    factorKgPerUnit: 0.089, // ~89g CO2/passenger-km
    iconName: 'Bus',
    quickAmounts: [5, 12, 25, 40],
  },
  {
    id: 'train-metro',
    title: 'Train / Subway / Metro',
    category: 'transport',
    subType: 'Electric Rail',
    defaultUnit: 'km',
    factorKgPerUnit: 0.035, // ~35g CO2/passenger-km
    iconName: 'Train',
    quickAmounts: [10, 25, 50, 150],
  },
  {
    id: 'flight-domestic',
    title: 'Flight (Short/Domestic)',
    category: 'transport',
    subType: 'Air Travel',
    defaultUnit: 'km',
    factorKgPerUnit: 0.255, // ~255g CO2e/km with radiative forcing
    iconName: 'Plane',
    quickAmounts: [400, 800, 1200, 2500],
  },
  {
    id: 'active-mobility',
    title: 'Walk / Bicycle / E-Bike',
    category: 'transport',
    subType: 'Zero-Emission',
    defaultUnit: 'km',
    factorKgPerUnit: 0.005, // virtually negligible
    iconName: 'Bike',
    quickAmounts: [3, 8, 15, 30],
  },

  // Energy
  {
    id: 'grid-electricity',
    title: 'Grid Electricity',
    category: 'energy',
    subType: 'Household Power',
    defaultUnit: 'kWh',
    factorKgPerUnit: 0.385, // global average ~385g CO2/kWh
    iconName: 'Zap',
    quickAmounts: [5, 12, 20, 40],
  },
  {
    id: 'natural-gas-heating',
    title: 'Natural Gas Heating',
    category: 'energy',
    subType: 'Thermal Energy',
    defaultUnit: 'm³',
    factorKgPerUnit: 2.03, // ~2.03 kg CO2/m³ natural gas
    iconName: 'Flame',
    quickAmounts: [2, 5, 10, 20],
  },
  {
    id: 'hot-shower',
    title: 'Long Hot Shower (10 min)',
    category: 'energy',
    subType: 'Water Heating',
    defaultUnit: 'showers',
    factorKgPerUnit: 1.45,
    iconName: 'Droplets',
    quickAmounts: [1, 2, 3, 5],
  },

  // Food
  {
    id: 'meal-beef',
    title: 'High-Carbon Meal (Beef / Lamb)',
    category: 'food',
    subType: 'Ruminant Meat',
    defaultUnit: 'meal',
    factorKgPerUnit: 7.2, // ~7.2 kg CO2e per beef-focused serving
    iconName: 'Beef',
    quickAmounts: [1, 2, 3],
  },
  {
    id: 'meal-poultry-pork',
    title: 'Medium-Carbon Meal (Chicken / Pork)',
    category: 'food',
    subType: 'Poultry / Pork',
    defaultUnit: 'meal',
    factorKgPerUnit: 2.1,
    iconName: 'Drumstick',
    quickAmounts: [1, 2, 3],
  },
  {
    id: 'meal-vegetarian',
    title: 'Vegetarian Meal (Eggs / Dairy)',
    category: 'food',
    subType: 'Vegetarian',
    defaultUnit: 'meal',
    factorKgPerUnit: 1.25,
    iconName: 'Egg',
    quickAmounts: [1, 2, 3],
  },
  {
    id: 'meal-vegan',
    title: 'Plant-Based / Vegan Meal',
    category: 'food',
    subType: '100% Plant-Based',
    defaultUnit: 'meal',
    factorKgPerUnit: 0.55,
    iconName: 'Salad',
    quickAmounts: [1, 2, 3],
  },
  {
    id: 'coffee-dairy',
    title: 'Dairy Latte / Cappuccino',
    category: 'food',
    subType: 'Beverage',
    defaultUnit: 'cups',
    factorKgPerUnit: 0.45,
    iconName: 'Coffee',
    quickAmounts: [1, 2, 3, 4],
  },

  // Consumption
  {
    id: 'goods-clothing',
    title: 'New Fast-Fashion Garment',
    category: 'consumption',
    subType: 'Apparel',
    defaultUnit: 'items',
    factorKgPerUnit: 8.5,
    iconName: 'Shirt',
    quickAmounts: [1, 2, 3, 5],
  },
  {
    id: 'goods-electronics',
    title: 'Small Tech Device / Accessory',
    category: 'consumption',
    subType: 'Consumer Electronics',
    defaultUnit: 'items',
    factorKgPerUnit: 18.0,
    iconName: 'Smartphone',
    quickAmounts: [1, 2],
  },
  {
    id: 'goods-online-delivery',
    title: 'Express Parcel Delivery & Packaging',
    category: 'consumption',
    subType: 'Shipping & Box',
    defaultUnit: 'deliveries',
    factorKgPerUnit: 2.3,
    iconName: 'Package',
    quickAmounts: [1, 2, 3, 5],
  },
];

// Helper to generate past dates in YYYY-MM-DD
function getRelativeDateStr(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

export const INITIAL_SAMPLE_ACTIVITIES: ActivityLog[] = [
  {
    id: 'sample-1',
    title: 'Commute by Petrol Car (22 km)',
    category: 'transport',
    co2Kg: 4.22,
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    date: getRelativeDateStr(0),
    details: { subType: 'Combustion Car', value: 22, unit: 'km' },
  },
  {
    id: 'sample-2',
    title: 'Plant-Based Quinoa Bowl Lunch',
    category: 'food',
    co2Kg: 0.55,
    timestamp: new Date(Date.now() - 1000 * 60 * 320).toISOString(),
    date: getRelativeDateStr(0),
    details: { subType: '100% Plant-Based', value: 1, unit: 'meal' },
  },
  {
    id: 'sample-3',
    title: 'Household Power & Air Conditioning (14 kWh)',
    category: 'energy',
    co2Kg: 5.39,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    date: getRelativeDateStr(1),
    details: { subType: 'Household Power', value: 14, unit: 'kWh' },
  },
  {
    id: 'sample-4',
    title: 'Chicken Caesar Salad Dinner',
    category: 'food',
    co2Kg: 2.1,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    date: getRelativeDateStr(1),
    details: { subType: 'Poultry / Pork', value: 1, unit: 'meal' },
  },
  {
    id: 'sample-5',
    title: 'Metro Commute Roundtrip (30 km)',
    category: 'transport',
    co2Kg: 1.05,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    date: getRelativeDateStr(1),
    details: { subType: 'Electric Rail', value: 30, unit: 'km' },
  },
  {
    id: 'sample-6',
    title: 'Online Package Next-Day Delivery',
    category: 'consumption',
    co2Kg: 2.3,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    date: getRelativeDateStr(2),
    details: { subType: 'Shipping & Box', value: 1, unit: 'deliveries' },
  },
  {
    id: 'sample-7',
    title: 'Grilled Beef Steak Dinner with Wine',
    category: 'food',
    co2Kg: 7.2,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 52).toISOString(),
    date: getRelativeDateStr(2),
    details: { subType: 'Ruminant Meat', value: 1, unit: 'meal' },
  },
  {
    id: 'sample-8',
    title: 'Train to Nearby City for Weekend (110 km)',
    category: 'transport',
    co2Kg: 3.85,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 75).toISOString(),
    date: getRelativeDateStr(3),
    details: { subType: 'Electric Rail', value: 110, unit: 'km' },
  },
  {
    id: 'sample-9',
    title: 'Household Power (9 kWh)',
    category: 'energy',
    co2Kg: 3.46,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 78).toISOString(),
    date: getRelativeDateStr(3),
    details: { subType: 'Household Power', value: 9, unit: 'kWh' },
  },
];
