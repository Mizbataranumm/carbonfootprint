import { FoodEmissionBreakdown } from '../types';

export interface DietaryPatternPreset {
  id: string;
  name: string;
  description: string;
  dailyCo2Kg: number;
  breakdown: FoodEmissionBreakdown;
  tags: string[];
}

export interface MealPreset {
  id: string;
  name: string;
  description: string;
  servingCo2Kg: number;
  breakdown: FoodEmissionBreakdown;
  categoryTag: 'beef' | 'poultry' | 'seafood' | 'vegetarian' | 'vegan';
}

export const DIETARY_PATTERNS: DietaryPatternPreset[] = [
  {
    id: 'heavy_meat_eater',
    name: 'Heavy Meat Eater (Red meat daily)',
    description: 'Consumes beef, lamb, pork, and dairy on a daily basis with high ruminant proportion.',
    dailyCo2Kg: 7.2,
    breakdown: {
      meatProductionKg: 5.1,
      agricultureKg: 1.6,
      foodMilesKg: 0.5,
    },
    tags: ['High Methane', 'Ruminant Intensive', '7.2 kg/day'],
  },
  {
    id: 'average_omnivore',
    name: 'Standard Omnivore (Mixed meat & plants)',
    description: 'Typical Western diet: meat 4-5 times/week, dairy, eggs, and mixed vegetables.',
    dailyCo2Kg: 5.4,
    breakdown: {
      meatProductionKg: 3.2,
      agricultureKg: 1.7,
      foodMilesKg: 0.5,
    },
    tags: ['Baseline Diet', '5.4 kg/day'],
  },
  {
    id: 'mostly_vegetarian',
    name: 'Mostly Vegetarian (Flexitarian)',
    description: 'Plant-forward diet; eats poultry or fish occasionally (1-2x/week), avoids red meat.',
    dailyCo2Kg: 3.5,
    breakdown: {
      meatProductionKg: 0.8,
      agricultureKg: 2.2,
      foodMilesKg: 0.5,
    },
    tags: ['Low Methane', 'Flexitarian', '3.5 kg/day'],
  },
  {
    id: 'pescatarian',
    name: 'Pescatarian (Fish & Seafood)',
    description: 'Consumes fish, mollusks, plant foods, dairy, and eggs; zero land-animal meats.',
    dailyCo2Kg: 3.8,
    breakdown: {
      meatProductionKg: 1.5,
      agricultureKg: 1.8,
      foodMilesKg: 0.5,
    },
    tags: ['Marine Protein', '3.8 kg/day'],
  },
  {
    id: 'vegetarian',
    name: 'Strict Vegetarian (Lacto-Ovo)',
    description: '100% meat-free; consumes dairy cheese, butter, eggs, legumes, grains, and produce.',
    dailyCo2Kg: 3.1,
    breakdown: {
      meatProductionKg: 0.0,
      agricultureKg: 2.6,
      foodMilesKg: 0.5,
    },
    tags: ['Zero Livestock Slaughters', 'Dairy Dominant', '3.1 kg/day'],
  },
  {
    id: 'vegan',
    name: 'Vegan (100% Plant-Based)',
    description: 'Entirely plant-derived: beans, lentils, tofu, nuts, grains, fruits, and vegetables.',
    dailyCo2Kg: 2.3,
    breakdown: {
      meatProductionKg: 0.0,
      agricultureKg: 1.9,
      foodMilesKg: 0.4,
    },
    tags: ['Lowest Carbon', 'Zero Animal Agriculture', '2.3 kg/day'],
  },
];

export const POPULAR_MEAL_PRESETS: MealPreset[] = [
  {
    id: 'beef_steak_dinner',
    name: 'Ribeye / Beef Steak Dinner (250g)',
    description: 'Ruminant beef with potatoes and side vegetables; enteric methane intensive.',
    servingCo2Kg: 14.2,
    breakdown: { meatProductionKg: 12.6, agricultureKg: 1.1, foodMilesKg: 0.5 },
    categoryTag: 'beef',
  },
  {
    id: 'cheeseburger_fries',
    name: 'Beef Cheeseburger & French Fries',
    description: 'Quarter-pound beef patty with cheddar cheese, bun, and fries.',
    servingCo2Kg: 4.6,
    breakdown: { meatProductionKg: 3.6, agricultureKg: 0.7, foodMilesKg: 0.3 },
    categoryTag: 'beef',
  },
  {
    id: 'chicken_rice_bowl',
    name: 'Grilled Chicken Breast Bowl',
    description: 'Monogastric poultry (significantly lower emissions than ruminants) with brown rice.',
    servingCo2Kg: 2.3,
    breakdown: { meatProductionKg: 1.5, agricultureKg: 0.6, foodMilesKg: 0.2 },
    categoryTag: 'poultry',
  },
  {
    id: 'salmon_veggies',
    name: 'Pan-seared Salmon & Steamed Veggies',
    description: 'Wild or farmed salmon fillet with seasonal green vegetables.',
    servingCo2Kg: 2.1,
    breakdown: { meatProductionKg: 1.3, agricultureKg: 0.5, foodMilesKg: 0.3 },
    categoryTag: 'seafood',
  },
  {
    id: 'cheese_pasta',
    name: 'Creamy Cheese & Egg Carbonara',
    description: 'Dairy cheese and egg based pasta meal; dairy farming footprint.',
    servingCo2Kg: 2.0,
    breakdown: { meatProductionKg: 0.0, agricultureKg: 1.7, foodMilesKg: 0.3 },
    categoryTag: 'vegetarian',
  },
  {
    id: 'lentil_dahl_rice',
    name: 'Lentil Dahl & Basmati Rice',
    description: 'Nitrogen-fixing pulse with spices and rice; exceptional agricultural efficiency.',
    servingCo2Kg: 0.7,
    breakdown: { meatProductionKg: 0.0, agricultureKg: 0.5, foodMilesKg: 0.2 },
    categoryTag: 'vegan',
  },
  {
    id: 'tofu_stir_fry',
    name: 'Crispy Tofu & Vegetable Stir-Fry',
    description: 'Soybean curd with bell peppers, broccoli, sesame, and soba noodles.',
    servingCo2Kg: 0.8,
    breakdown: { meatProductionKg: 0.0, agricultureKg: 0.6, foodMilesKg: 0.2 },
    categoryTag: 'vegan',
  },
  {
    id: 'plant_burger',
    name: 'Plant-Based Burger (Pea / Soy Protein)',
    description: 'Formulated plant-protein patty with vegan toppings and bun.',
    servingCo2Kg: 1.3,
    breakdown: { meatProductionKg: 0.0, agricultureKg: 1.1, foodMilesKg: 0.2 },
    categoryTag: 'vegan',
  },
];

export function applySourcingModifier(
  breakdown: FoodEmissionBreakdown,
  sourcing: 'local_seasonal' | 'average' | 'air_freight'
): { modifiedBreakdown: FoodEmissionBreakdown; totalKg: number } {
  let multiplier = 1.0;
  if (sourcing === 'local_seasonal') {
    multiplier = 0.35; // 65% reduction in transport/freight emissions
  } else if (sourcing === 'air_freight') {
    multiplier = 3.5; // High-altitude aviation cargo cold-chain
  }

  const newMiles = parseFloat((breakdown.foodMilesKg * multiplier).toFixed(2));
  const total = parseFloat((breakdown.meatProductionKg + breakdown.agricultureKg + newMiles).toFixed(2));

  return {
    modifiedBreakdown: {
      meatProductionKg: breakdown.meatProductionKg,
      agricultureKg: breakdown.agricultureKg,
      foodMilesKg: newMiles,
    },
    totalKg: total,
  };
}
