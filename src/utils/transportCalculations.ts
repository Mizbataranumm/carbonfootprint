import { CarFuelType, PublicTransitType, FlightHaulType, TransportCalculationResult } from '../types';

export const CAR_FACTORS_KG_PER_KM: Record<CarFuelType, { factor: number; label: string; details: string }> = {
  gasoline: {
    factor: 0.192,
    label: 'Gasoline / Petrol',
    details: 'EPA standard internal combustion passenger car (approx 28 MPG)',
  },
  diesel: {
    factor: 0.171,
    label: 'Diesel',
    details: 'Higher thermodynamic efficiency, slightly lower CO2 per km',
  },
  hybrid: {
    factor: 0.109,
    label: 'Full Hybrid (HEV)',
    details: 'Regenerative braking with internal combustion assist (e.g. Prius)',
  },
  phev: {
    factor: 0.065,
    label: 'Plug-in Hybrid (PHEV)',
    details: 'Blended electric + gasoline operation based on utility factor',
  },
  electric: {
    factor: 0.043,
    label: 'Battery Electric (BEV)',
    details: 'Average national grid generation intensity (Scope 2 electricity)',
  },
};

export const TRANSIT_FACTORS_KG_PER_KM: Record<
  PublicTransitType,
  { factor: number; label: string; icon: string }
> = {
  city_bus: {
    factor: 0.089,
    label: 'City Transit Bus',
    icon: 'Bus',
  },
  coach_bus: {
    factor: 0.027,
    label: 'Intercity / Coach Bus',
    icon: 'Bus',
  },
  subway_metro: {
    factor: 0.028,
    label: 'Subway / Metro / Underground',
    icon: 'Train',
  },
  intercity_train: {
    factor: 0.035,
    label: 'Intercity Passenger Train',
    icon: 'Train',
  },
  high_speed_rail: {
    factor: 0.005,
    label: 'Electric High-Speed Rail (TGV / Shinkansen)',
    icon: 'Zap',
  },
};

export const FLIGHT_FACTORS_KG_PER_KM: Record<
  FlightHaulType,
  { factor: number; label: string; defaultDistanceKm: number; description: string }
> = {
  short_haul: {
    factor: 0.255,
    label: 'Short-Haul Flight (< 500 km)',
    defaultDistanceKm: 400,
    description: 'High climb/descent fuel burns over short distance (e.g., London to Paris, LA to SF)',
  },
  medium_haul: {
    factor: 0.156,
    label: 'Medium-Haul Flight (500 – 3,000 km)',
    defaultDistanceKm: 1400,
    description: 'Domestic continental flights (e.g., NYC to Miami, Chicago to Denver)',
  },
  long_haul: {
    factor: 0.150,
    label: 'Long-Haul Flight (> 3,000 km)',
    defaultDistanceKm: 5800,
    description: 'Intercontinental routes with cruising efficiency (e.g., NYC to London, LA to Tokyo)',
  },
};

export function calculateCarTrip(
  distance: number,
  unit: 'km' | 'miles',
  fuelType: CarFuelType,
  passengers = 1
): TransportCalculationResult {
  const distanceKm = unit === 'miles' ? distance * 1.60934 : distance;
  const factor = CAR_FACTORS_KG_PER_KM[fuelType].factor;
  const totalCo2 = (distanceKm * factor) / Math.max(1, passengers);

  return {
    mode: 'car',
    title: `${CAR_FACTORS_KG_PER_KM[fuelType].label} Car (${distance.toFixed(1)} ${unit}${
      passengers > 1 ? `, ${passengers} carpool` : ''
    })`,
    distanceKm,
    co2Kg: parseFloat(totalCo2.toFixed(2)),
    factorUsed: factor,
    factorUnit: 'kg CO2e / km',
  };
}

export function calculateTransitTrip(
  distance: number,
  unit: 'km' | 'miles',
  transitType: PublicTransitType
): TransportCalculationResult {
  const distanceKm = unit === 'miles' ? distance * 1.60934 : distance;
  const factor = TRANSIT_FACTORS_KG_PER_KM[transitType].factor;
  const totalCo2 = distanceKm * factor;

  // Comparison vs solo gasoline car
  const gasCarCo2 = distanceKm * CAR_FACTORS_KG_PER_KM.gasoline.factor;
  const savedKg = Math.max(0, gasCarCo2 - totalCo2);

  return {
    mode: 'transit',
    title: `${TRANSIT_FACTORS_KG_PER_KM[transitType].label} (${distance.toFixed(1)} ${unit})`,
    distanceKm,
    co2Kg: parseFloat(totalCo2.toFixed(2)),
    factorUsed: factor,
    factorUnit: 'kg CO2e / passenger-km',
    comparisonVsCarKg: parseFloat(savedKg.toFixed(2)),
  };
}

export function calculateFlightTrip(
  haulType: FlightHaulType,
  distanceKm: number,
  applyRadiativeForcing: boolean,
  roundTrip: boolean
): TransportCalculationResult {
  const baseFactor = FLIGHT_FACTORS_KG_PER_KM[haulType].factor;
  const rfiMultiplier = applyRadiativeForcing ? 1.9 : 1.0;
  const effectiveDistance = roundTrip ? distanceKm * 2 : distanceKm;
  const totalCo2 = effectiveDistance * baseFactor * rfiMultiplier;

  return {
    mode: 'flight',
    title: `${FLIGHT_FACTORS_KG_PER_KM[haulType].label} (${effectiveDistance.toLocaleString()} km${
      roundTrip ? ' round-trip' : ' one-way'
    }${applyRadiativeForcing ? ', +RFI non-CO2' : ''})`,
    distanceKm: effectiveDistance,
    co2Kg: parseFloat(totalCo2.toFixed(2)),
    factorUsed: parseFloat((baseFactor * rfiMultiplier).toFixed(3)),
    factorUnit: 'kg CO2e / passenger-km',
  };
}
