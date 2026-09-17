import React, { useState } from 'react';
import { ActivityLog, CarFuelType, PublicTransitType, FlightHaulType } from '../types';
import {
  CAR_FACTORS_KG_PER_KM,
  TRANSIT_FACTORS_KG_PER_KM,
  FLIGHT_FACTORS_KG_PER_KM,
  calculateCarTrip,
  calculateTransitTrip,
  calculateFlightTrip,
} from '../utils/transportCalculations';
import {
  Car,
  Bus,
  Train,
  Plane,
  Plus,
  Compass,
  ArrowRight,
  ShieldCheck,
  Zap,
  Users,
  Calendar,
  Sparkles,
  Info,
} from 'lucide-react';

interface TransportLoggerModuleProps {
  onAddActivity: (activity: Omit<ActivityLog, 'id' | 'timestamp'>) => void;
}

export const TransportLoggerModule: React.FC<TransportLoggerModuleProps> = ({ onAddActivity }) => {
  const [activeTransportMode, setActiveTransportMode] = useState<'car' | 'transit' | 'flight'>('car');
  const [unit, setUnit] = useState<'km' | 'miles'>('km');
  const [activityDate, setActivityDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  // 1. Car State
  const [carFuelType, setCarFuelType] = useState<CarFuelType>('gasoline');
  const [carDistance, setCarDistance] = useState<number>(25);
  const [carPassengers, setCarPassengers] = useState<number>(1);

  // 2. Public Transit State
  const [transitType, setTransitType] = useState<PublicTransitType>('subway_metro');
  const [transitDistance, setTransitDistance] = useState<number>(15);

  // 3. Flight State
  const [flightHaul, setFlightHaul] = useState<FlightHaulType>('medium_haul');
  const [flightDistanceKm, setFlightDistanceKm] = useState<number>(1400);
  const [isRoundTrip, setIsRoundTrip] = useState<boolean>(true);
  const [includeRadiativeForcing, setIncludeRadiativeForcing] = useState<boolean>(true);

  // Computed results
  const carResult = calculateCarTrip(carDistance, unit, carFuelType, carPassengers);
  const transitResult = calculateTransitTrip(transitDistance, unit, transitType);
  const flightResult = calculateFlightTrip(
    flightHaul,
    flightDistanceKm,
    includeRadiativeForcing,
    isRoundTrip
  );

  const handleLogCarTrip = () => {
    onAddActivity({
      title: carResult.title,
      category: 'transport',
      co2Kg: carResult.co2Kg,
      date: activityDate,
      details: {
        subType: 'Car Trip',
        value: carDistance,
        unit,
        notes: `Fuel: ${CAR_FACTORS_KG_PER_KM[carFuelType].label}. Factor: ${carResult.factorUsed} ${
          carResult.factorUnit
        }.${carPassengers > 1 ? ` Shared among ${carPassengers} passengers.` : ''}`,
        transportDetails: {
          mode: 'car',
          fuelOrType: carFuelType,
          distanceKm: carResult.distanceKm,
          passengers: carPassengers,
        },
      },
    });
  };

  const handleLogTransitTrip = () => {
    onAddActivity({
      title: transitResult.title,
      category: 'transport',
      co2Kg: transitResult.co2Kg,
      date: activityDate,
      details: {
        subType: 'Public Transit',
        value: transitDistance,
        unit,
        notes: `Transit type: ${TRANSIT_FACTORS_KG_PER_KM[transitType].label}. Saved ~${
          transitResult.comparisonVsCarKg
        } kg CO₂e compared to solo driving.`,
        transportDetails: {
          mode: 'transit',
          fuelOrType: transitType,
          distanceKm: transitResult.distanceKm,
        },
      },
    });
  };

  const handleLogFlightTrip = () => {
    onAddActivity({
      title: flightResult.title,
      category: 'transport',
      co2Kg: flightResult.co2Kg,
      date: activityDate,
      details: {
        subType: 'Aviation',
        value: flightResult.distanceKm,
        unit: 'km',
        notes: `${FLIGHT_FACTORS_KG_PER_KM[flightHaul].label}. ${
          isRoundTrip ? 'Round-trip' : 'One-way'
        }. ${includeRadiativeForcing ? 'Includes 1.9x high-altitude RFI non-CO2 multiplier.' : ''}`,
        transportDetails: {
          mode: 'flight',
          fuelOrType: flightHaul,
          distanceKm: flightResult.distanceKm,
          includeRadiativeForcing,
        },
      },
    });
  };

  return (
    <div className="bg-white rounded-xl border border-[#e2e8e3] p-5 shadow-xs flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#edf2ee]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#eff6ff] text-[#2563eb] flex items-center justify-center">
            <Car className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1b4332]">Transportation &amp; Journey Logger</h3>
            <p className="text-xs text-[#52796f]">
              Precise DEFRA &amp; EPA calculations for cars, transit systems, and commercial aviation
            </p>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center p-1 bg-[#f1f5f2] rounded-lg border border-[#e4eae5] self-start sm:self-auto">
          <button
            id="transport-tab-car-btn"
            type="button"
            onClick={() => setActiveTransportMode('car')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeTransportMode === 'car'
                ? 'bg-white text-[#1b4332] shadow-xs'
                : 'text-[#52796f] hover:text-[#1b4332]'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>Personal Car</span>
          </button>

          <button
            id="transport-tab-transit-btn"
            type="button"
            onClick={() => setActiveTransportMode('transit')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeTransportMode === 'transit'
                ? 'bg-white text-[#1b4332] shadow-xs'
                : 'text-[#52796f] hover:text-[#1b4332]'
            }`}
          >
            <Bus className="w-3.5 h-3.5" />
            <span>Public Transit</span>
          </button>

          <button
            id="transport-tab-flight-btn"
            type="button"
            onClick={() => setActiveTransportMode('flight')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeTransportMode === 'flight'
                ? 'bg-white text-[#1b4332] shadow-xs'
                : 'text-[#52796f] hover:text-[#1b4332]'
            }`}
          >
            <Plane className="w-3.5 h-3.5" />
            <span>Flights</span>
          </button>
        </div>
      </div>

      {/* Global Date & Unit Toolbar */}
      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3 p-3 bg-[#f8faf9] rounded-lg border border-[#e8efe9] text-xs">
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-[#52796f]" />
          <span className="text-[11px] font-semibold text-[#52796f]">Trip Date:</span>
          <input
            id="transport-trip-date-input"
            type="date"
            value={activityDate}
            onChange={(e) => setActivityDate(e.target.value)}
            className="px-2 py-1 rounded-md border border-[#ccd7cf] bg-white text-xs text-[#1b4332]"
          />
        </div>

        {activeTransportMode !== 'flight' && (
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-[#52796f]">Distance Units:</span>
            <div className="inline-flex rounded-md border border-[#ccd7cf] bg-white p-0.5">
              <button
                type="button"
                onClick={() => setUnit('km')}
                className={`px-2 py-0.5 text-xs font-semibold rounded ${
                  unit === 'km' ? 'bg-[#1b4332] text-white' : 'text-[#52796f]'
                }`}
              >
                Kilometers (km)
              </button>
              <button
                type="button"
                onClick={() => setUnit('miles')}
                className={`px-2 py-0.5 text-xs font-semibold rounded ${
                  unit === 'miles' ? 'bg-[#1b4332] text-white' : 'text-[#52796f]'
                }`}
              >
                Miles (mi)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 1. CAR MODE */}
      {activeTransportMode === 'car' && (
        <div className="mt-4 space-y-4">
          {/* Fuel Type Selection */}
          <div>
            <label className="block text-xs font-bold text-[#1b4332] mb-1.5">
              Select Vehicle Fuel Type:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {(Object.keys(CAR_FACTORS_KG_PER_KM) as CarFuelType[]).map((fuel) => {
                const isSelected = fuel === carFuelType;
                const info = CAR_FACTORS_KG_PER_KM[fuel];
                return (
                  <button
                    key={fuel}
                    id={`car-fuel-${fuel}`}
                    type="button"
                    onClick={() => setCarFuelType(fuel)}
                    className={`text-left p-2.5 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#2563eb] bg-[#eff6ff] text-[#1e40af] ring-1 ring-[#2563eb] shadow-xs'
                        : 'border-[#e5ebe7] bg-white text-[#2d3748] hover:bg-[#fafcfa]'
                    }`}
                  >
                    <div className="font-bold text-xs truncate">{info.label}</div>
                    <div className="text-[11px] text-[#52796f] mt-0.5">
                      {info.factor.toFixed(3)} kg / km
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Distance and Passengers Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="car-distance-input" className="block text-xs font-semibold text-[#52796f] mb-1">
                Trip Distance ({unit}):
              </label>
              <input
                id="car-distance-input"
                type="number"
                min="0.5"
                step="any"
                value={carDistance}
                onChange={(e) => setCarDistance(Math.max(0.1, parseFloat(e.target.value) || 0))}
                className="w-full px-3 py-2 text-sm font-bold rounded-lg border border-[#ccd7cf] bg-white"
              />
            </div>

            <div>
              <label htmlFor="car-passengers-input" className="block text-xs font-semibold text-[#52796f] mb-1">
                Vehicle Occupants (Carpool):
              </label>
              <div className="flex items-center gap-1">
                <input
                  id="car-passengers-input"
                  type="number"
                  min="1"
                  max="8"
                  value={carPassengers}
                  onChange={(e) => setCarPassengers(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 px-3 py-2 text-sm font-bold rounded-lg border border-[#ccd7cf] bg-white text-center"
                />
                <span className="text-xs text-[#52796f]">
                  {carPassengers > 1 ? 'Splits emissions equally' : 'Solo driver'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#52796f] mb-1">
                Quick Shortcuts:
              </label>
              <div className="flex flex-wrap gap-1">
                {[10, 25, 50, 100].map((quick) => (
                  <button
                    key={quick}
                    type="button"
                    onClick={() => setCarDistance(quick)}
                    className="px-2.5 py-1 text-xs font-medium rounded-md bg-[#f1f5f2] hover:bg-[#e4eae5] text-[#2d3748]"
                  >
                    {quick} {unit}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Real-time Calculation Result Bar */}
          <div className="p-4 rounded-xl bg-[#eff6ff] border border-[#bfdbfe] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="text-xs text-[#1e40af] font-medium">
                Emissions for this trip:{' '}
                <span className="text-xl font-extrabold text-[#1d4ed8] ml-1">
                  {carResult.co2Kg.toFixed(2)} kg CO₂e
                </span>
              </div>
              <p className="text-[11px] text-[#3b82f6] mt-0.5">
                Math: {carResult.distanceKm.toFixed(1)} km × {carResult.factorUsed} kg/km
                {carPassengers > 1 ? ` ÷ ${carPassengers} passengers` : ''}
              </p>
            </div>

            <button
              id="log-car-trip-btn"
              type="button"
              onClick={handleLogCarTrip}
              className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-lg text-xs font-bold bg-[#1d4ed8] text-white hover:bg-[#1e40af] transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Log Car Trip</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. PUBLIC TRANSIT MODE */}
      {activeTransportMode === 'transit' && (
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#1b4332] mb-1.5">
              Select Public Transit Mode:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {(Object.keys(TRANSIT_FACTORS_KG_PER_KM) as PublicTransitType[]).map((t) => {
                const isSelected = t === transitType;
                const info = TRANSIT_FACTORS_KG_PER_KM[t];
                return (
                  <button
                    key={t}
                    id={`transit-type-${t}`}
                    type="button"
                    onClick={() => setTransitType(t)}
                    className={`text-left p-3 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#2563eb] bg-[#eff6ff] text-[#1e40af] ring-1 ring-[#2563eb] shadow-xs'
                        : 'border-[#e5ebe7] bg-white text-[#2d3748] hover:bg-[#fafcfa]'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center gap-1.5">
                      {info.icon === 'Train' ? (
                        <Train className="w-3.5 h-3.5 text-[#2563eb]" />
                      ) : (
                        <Bus className="w-3.5 h-3.5 text-[#2563eb]" />
                      )}
                      <span>{info.label}</span>
                    </div>
                    <div className="text-[11px] text-[#52796f] mt-1">
                      Factor: {info.factor.toFixed(3)} kg CO₂e / passenger-km
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="transit-distance-input" className="block text-xs font-semibold text-[#52796f] mb-1">
                Distance Traveled ({unit}):
              </label>
              <input
                id="transit-distance-input"
                type="number"
                min="0.5"
                step="any"
                value={transitDistance}
                onChange={(e) => setTransitDistance(Math.max(0.1, parseFloat(e.target.value) || 0))}
                className="w-full px-3 py-2 text-sm font-bold rounded-lg border border-[#ccd7cf] bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#52796f] mb-1">
                Common Commutes:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[5, 15, 30, 75].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setTransitDistance(amt)}
                    className="px-3 py-1.5 text-xs font-medium rounded-md bg-[#f1f5f2] hover:bg-[#e4eae5]"
                  >
                    {amt} {unit}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Transit Calculation Bar */}
          <div className="p-4 rounded-xl bg-[#f0fdf4] border border-[#bbf7d0] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="text-xs text-[#166534] font-medium">
                Public Transit Emissions:{' '}
                <span className="text-xl font-extrabold text-[#14532d] ml-1">
                  {transitResult.co2Kg.toFixed(2)} kg CO₂e
                </span>
              </div>
              <p className="text-[11px] text-[#15803d] mt-0.5">
                🎉 Taking transit saved approximately{' '}
                <strong>{transitResult.comparisonVsCarKg} kg CO₂e</strong> compared to driving solo!
              </p>
            </div>

            <button
              id="log-transit-trip-btn"
              type="button"
              onClick={handleLogTransitTrip}
              className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-lg text-xs font-bold bg-[#166534] text-white hover:bg-[#14532d] transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Log Transit Journey</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. FLIGHTS MODE */}
      {activeTransportMode === 'flight' && (
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#1b4332] mb-1.5">
              Select Flight Haul Type:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {(Object.keys(FLIGHT_FACTORS_KG_PER_KM) as FlightHaulType[]).map((h) => {
                const isSelected = h === flightHaul;
                const info = FLIGHT_FACTORS_KG_PER_KM[h];
                return (
                  <button
                    key={h}
                    id={`flight-haul-${h}`}
                    type="button"
                    onClick={() => {
                      setFlightHaul(h);
                      setFlightDistanceKm(info.defaultDistanceKm);
                    }}
                    className={`text-left p-3 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#2563eb] bg-[#eff6ff] text-[#1e40af] ring-1 ring-[#2563eb] shadow-xs'
                        : 'border-[#e5ebe7] bg-white text-[#2d3748] hover:bg-[#fafcfa]'
                    }`}
                  >
                    <div className="font-bold text-xs">{info.label}</div>
                    <p className="text-[11px] text-[#52796f] mt-1 leading-tight">
                      {info.description}
                    </p>
                    <div className="text-[11px] font-semibold text-[#1e40af] mt-2">
                      Base factor: {info.factor.toFixed(3)} kg / passenger-km
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="flight-distance-input" className="block text-xs font-semibold text-[#52796f] mb-1">
                One-Way Flight Distance (km):
              </label>
              <input
                id="flight-distance-input"
                type="number"
                min="50"
                step="50"
                value={flightDistanceKm}
                onChange={(e) => setFlightDistanceKm(Math.max(50, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 text-sm font-bold rounded-lg border border-[#ccd7cf] bg-white"
              />
            </div>

            <div className="flex flex-col justify-center gap-2 pt-2">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  id="flight-round-trip-checkbox"
                  type="checkbox"
                  checked={isRoundTrip}
                  onChange={(e) => setIsRoundTrip(e.target.checked)}
                  className="rounded text-[#2563eb] focus:ring-[#2563eb] w-4 h-4"
                />
                <span className="text-xs font-bold text-[#1b4332]">Round-Trip Flight (×2 distance)</span>
              </label>

              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  id="flight-rfi-checkbox"
                  type="checkbox"
                  checked={includeRadiativeForcing}
                  onChange={(e) => setIncludeRadiativeForcing(e.target.checked)}
                  className="rounded text-[#2563eb] focus:ring-[#2563eb] w-4 h-4"
                />
                <span className="text-xs font-bold text-[#1b4332]">
                  Include High-Altitude Contrail Multiplier (1.9× RFI)
                </span>
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#52796f] mb-1">
                Sample Route Presets:
              </label>
              <div className="flex flex-col gap-1 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setFlightHaul('short_haul');
                    setFlightDistanceKm(340);
                  }}
                  className="text-left text-[#2563eb] hover:underline"
                >
                  • London ↔ Paris (~340 km)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFlightHaul('medium_haul');
                    setFlightDistanceKm(1750);
                  }}
                  className="text-left text-[#2563eb] hover:underline"
                >
                  • New York ↔ Miami (~1,750 km)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFlightHaul('long_haul');
                    setFlightDistanceKm(5570);
                  }}
                  className="text-left text-[#2563eb] hover:underline"
                >
                  • New York ↔ London (~5,570 km)
                </button>
              </div>
            </div>
          </div>

          {/* Flight Calculation Bar */}
          <div className="p-4 rounded-xl bg-[#fef2f2] border border-[#fecaca] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="text-xs text-[#991b1b] font-medium">
                Flight Carbon Impact:{' '}
                <span className="text-xl font-extrabold text-[#7f1d1d] ml-1">
                  {flightResult.co2Kg.toLocaleString()} kg CO₂e
                </span>
              </div>
              <p className="text-[11px] text-[#b91c1c] mt-0.5">
                Total distance: {flightResult.distanceKm.toLocaleString()} km. Commercial aviation produces significant warming from high-altitude nitrous oxides &amp; persistent cirrus contrails.
              </p>
            </div>

            <button
              id="log-flight-trip-btn"
              type="button"
              onClick={handleLogFlightTrip}
              className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-lg text-xs font-bold bg-[#b91c1c] text-white hover:bg-[#991b1b] transition-colors shadow-xs cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Log Flight Trip</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
