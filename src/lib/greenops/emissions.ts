// src/lib/greenops/emissions.ts
import { co2, averageIntensity } from '@tgwf/co2';

export interface EcoFootprint {
  energy_wh: number;        // Energy consumed in Watt-hours
  carbon_g: number;         // Carbon emissions in grams of CO2e
  water_ml: number;         // Water evaporated in milliliters
}

type ModelClass = 'HEAVY' | 'MEDIUM' | 'LIGHT';

type HardwareProfile = {
  pMinW: number;
  pMaxW: number;
  nGpu: number;
  baseTokensPerSecond: number;
};

const PROFILES: Record<ModelClass, HardwareProfile> = {
  // Approximate active operating ranges inspired by modern inference benchmarks.
  HEAVY: { pMinW: 59, pMaxW: 416, nGpu: 8, baseTokensPerSecond: 90 },
  MEDIUM: { pMinW: 72, pMaxW: 400, nGpu: 2, baseTokensPerSecond: 180 },
  LIGHT: { pMinW: 17, pMaxW: 73, nGpu: 1, baseTokensPerSecond: 480 },
};

const DEFAULTS = {
  PUE: 1.15,
  WUE_L_PER_KWH: 0.15,
  UTILIZATION_BASE: 0.5,
  WORLD_GRID_INTENSITY_G_PER_KWH: 475,
};

const REGION_PUE: Record<string, number> = {
  WORLD: 1.15,
  US: 1.14,
  IT: 1.16,
  SE: 1.08,
  IE: 1.10,
  SG: 1.30,
  ID: 1.39,
};

const REGION_WUE_L_PER_KWH: Record<string, number> = {
  WORLD: 0.15,
  US: 0.55,
  IT: 0.1,
  SE: 0.02,
  IE: 0.03,
  SG: 1.68,
  ID: 2.75,
};

function normalizeRegion(isoRegion: string): string {
  const key = (isoRegion || "WORLD").toUpperCase();
  if (REGION_PUE[key]) return key;
  if (key.includes("-")) {
    const country = key.split("-")[0];
    if (REGION_PUE[country]) return country;
  }
  return "WORLD";
}

function determineModelClass(modelId: string): ModelClass {
  const lowercaseId = modelId.toLowerCase();
  
  if (lowercaseId.includes("4") && !lowercaseId.includes("mini") && !lowercaseId.includes("8b")) return 'HEAVY';
  if (lowercaseId.includes("opus") || lowercaseId.includes("large")) return 'HEAVY';
  
  if (lowercaseId.includes("mini") || lowercaseId.includes("haiku") || lowercaseId.includes("8b") || lowercaseId.includes("flash")) return 'LIGHT';

  return 'MEDIUM'; // Sonnet, GPT-3.5, 70b
}

function isReasoningModel(modelId: string): boolean {
  const id = modelId.toLowerCase();
  return (
    /\bo1\b|\bo3\b|r1|reasoner|reasoning/.test(id) ||
    (id.includes("deepseek") && id.includes("r1"))
  );
}

function estimateBatchFactor(tokensProcessing: number): number {
  // Captures non-linear efficiency gains from larger concurrent workloads.
  if (tokensProcessing < 300) return 0.72;
  if (tokensProcessing < 1200) return 0.9;
  if (tokensProcessing < 3200) return 1.0;
  return 1.1;
}

export function calculateHardwareEnergy(modelId: string, tokensProcessing: number, isoRegion: string = "WORLD"): number {
  const modelClass = determineModelClass(modelId);
  const profile = PROFILES[modelClass];
  const region = normalizeRegion(isoRegion);
  const pue = REGION_PUE[region] ?? DEFAULTS.PUE;
  const batchFactor = estimateBatchFactor(tokensProcessing);
  const reasoningFactor = isReasoningModel(modelId) ? 0.6 : 1;
  const backendOptimizationFactor = 1.15;
  const effectiveTps = profile.baseTokensPerSecond * batchFactor * backendOptimizationFactor * reasoningFactor;
  const processingTimeSeconds = Math.max(tokensProcessing / effectiveTps, 0.35);

  const utilization = Math.max(
    0.35,
    Math.min(0.95, DEFAULTS.UTILIZATION_BASE + (batchFactor - 0.75) * 0.35)
  );
  const dynamicPowerW = profile.pMinW + (profile.pMaxW - profile.pMinW) * utilization;

  return ((dynamicPowerW * profile.nGpu * processingTimeSeconds) / 3600) * pue;
}

export function calculateEmissions(modelId: string, totalTokens: number, isoRegion: string = "WORLD"): EcoFootprint {
  const region = normalizeRegion(isoRegion);
  const energyWh = calculateHardwareEnergy(modelId, totalTokens, region);
  const energyKwh = energyWh / 1000;

  // Use CO2.js for built-in average grid carbon intensity calculation
  // Falls back to global average if region not perfectly mapped
  const { data } = averageIntensity;
  const gridIntensity = data[region] || data["WORLD"] || DEFAULTS.WORLD_GRID_INTENSITY_G_PER_KWH; // gCO2e/kWh
  
  const carbonGrams = energyKwh * gridIntensity;
  
  // Water consumption (milliliters)
  const wue = REGION_WUE_L_PER_KWH[region] ?? DEFAULTS.WUE_L_PER_KWH;
  const waterMl = (energyKwh * wue) * 1000;

  return {
    energy_wh: energyWh,
    carbon_g: carbonGrams,
    water_ml: waterMl
  };
}

export function calculateCO2JSDataTransferImpact(bytes: number) {
   // Alternative estimation strictly using co2.js native function for HTTP transfer mapping
   const emissions = new co2();
   const calc = emissions.perByte(bytes, false);
   return calc;
}
