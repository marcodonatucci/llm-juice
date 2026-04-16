import type { EcoFootprint } from "@/lib/greenops/emissions";

/** Short footnote strings — rounded “ballpark” figures for intuition, not compliance reporting. */
export const COMPARISON_SOURCE_NOTES = {
  ledMinute: "9 W × 1 min ≈ 0.15 Wh (rated power × time).",
  smartphone:
    "Typical smartphone usable battery capacity is often ~10–18 Wh (varies by model).",
  laptopHour:
    "Order-of-magnitude for light laptop use (~40–60 Wh/h varies widely by load).",
  usHomeDay:
    "U.S. residential electricity ≈10.3–10.8 MWh/year (EIA residential surveys) → ~28–30 kWh/day average.",
  usHomeHourSlice:
    "Annual U.S. residential kWh ÷ 8,760 h ≈ 1.2 kWh as a rough “average clock-hour” slice of yearly use (EIA).",
  germanyYear:
    "Germany public net grid load ≈457 TWh in 2023 (Bundesnetzagentur / SMARD annual reporting).",
  germanyHour:
    "457 TWh/year ÷ 8,760 h ≈ 52 GWh average energy moved each hour (same Bundesnetzagentur total).",
  carCo2Km:
    "EEA: average CO₂ emissions of new passenger cars in the EEA ≈108 g/km (2022 monitoring).",
  flightOneWay:
    "Economy one-way transatlantic often ~200–400 kg CO₂e per passenger (ICAO calculators & literature vary).",
  shower10:
    "~9.5 L/min × 10 min ≈ 95 L (EPA WaterSense typical showerhead flow examples).",
  poolOlympic:
    "FINA minimum Olympic pool 50 m × 25 m × 2 m → 2,500 m³ ≈ 2.5 million litres.",
  bottle500: "500 ml ≈ one nominal retail water bottle.",
} as const;

export type FootprintAnalogy = {
  sentence: string;
  sourceKey: keyof typeof COMPARISON_SOURCE_NOTES;
};

const LED_MINUTE_WH = 0.15;
const SMARTPHONE_WH = 13;
const LAPTOP_HOUR_WH = 50;
const US_HOME_DAY_WH = 28_300;
const US_HOME_HOUR_SLICE_WH = 1180;
const GERMANY_YEAR_WH = 457e12;
const GERMANY_HOUR_WH = GERMANY_YEAR_WH / 8760;

const CAR_G_PER_KM = 108;
const FLIGHT_ONE_WAY_G = 280_000;

const BOTTLE_ML = 500;
const SHOWER_10MIN_ML = 95_000;
const POOL_OLYMPIC_ML = 2_500_000_000;

function logDist(a: number, b: number): number {
  return Math.abs(Math.log10(a + 1e-12) - Math.log10(b + 1e-12));
}

function ratioPhrase(
  metric: "energy" | "carbon" | "water",
  value: number,
  ref: number,
  noun: string
): string {
  const qual =
    metric === "energy"
      ? "electricity"
      : metric === "carbon"
        ? "CO₂e"
        : "evaporative cooling water";
  const r = value / ref;
  if (r >= 0.7 && r <= 1.35) {
    return `About as much ${qual} as ${noun} (same ballpark).`;
  }
  if (r > 1.35) {
    const x = r < 10 ? r.toFixed(1) : r < 100 ? String(Math.round(r)) : r.toPrecision(2);
    return `Roughly ${x}× as much ${qual} as ${noun}.`;
  }
  const inv = ref / value;
  if (inv > 2500) {
    const pct = (value / ref) * 100;
    const pctStr = pct < 0.01 ? `${pct.toExponential(1)}%` : `${pct < 0.1 ? pct.toFixed(3) : pct.toFixed(2)}%`;
    return `Far less ${qual} than ${noun} — on the order of ${pctStr} of that benchmark.`;
  }
  const invR = inv < 15 ? Math.round(inv) : Math.round(inv / 5) * 5;
  return `Roughly 1/${invR} as much ${qual} as ${noun}.`;
}

export function energyAnalogyWh(wh: number): FootprintAnalogy | null {
  if (!Number.isFinite(wh) || wh <= 0) return null;

  const tiers: { ref: number; noun: string; key: keyof typeof COMPARISON_SOURCE_NOTES }[] = [
    { ref: LED_MINUTE_WH, noun: "a 9 W LED bulb on for one minute (~0.15 Wh)", key: "ledMinute" },
    { ref: SMARTPHONE_WH, noun: "fully charging a typical smartphone from empty (~13 Wh)", key: "smartphone" },
    { ref: LAPTOP_HOUR_WH, noun: "a light laptop running at mixed load for about an hour (~50 Wh)", key: "laptopHour" },
    {
      ref: US_HOME_HOUR_SLICE_WH,
      noun: 'one “average clock-hour” slice of a U.S. home’s annual electricity (~1.2 kWh)',
      key: "usHomeHourSlice",
    },
    { ref: US_HOME_DAY_WH, noun: "the electricity the average U.S. home uses in about one day (~28 kWh)", key: "usHomeDay" },
    {
      ref: GERMANY_HOUR_WH,
      noun: "the electricity Germany’s public grid moves in about one hour on average (~52 GWh)",
      key: "germanyHour",
    },
    { ref: GERMANY_YEAR_WH, noun: "Germany’s annual public electricity demand (~457 TWh)", key: "germanyYear" },
  ];

  let best = tiers[0];
  let bestD = Infinity;
  for (const t of tiers) {
    const d = logDist(wh, t.ref);
    if (d < bestD) {
      bestD = d;
      best = t;
    }
  }

  return {
    sentence: ratioPhrase("energy", wh, best.ref, best.noun),
    sourceKey: best.key,
  };
}

export function carbonAnalogyG(g: number): FootprintAnalogy | null {
  if (!Number.isFinite(g) || g <= 0) return null;

  const tiers: { ref: number; noun: string; key: keyof typeof COMPARISON_SOURCE_NOTES }[] = [
    {
      ref: CAR_G_PER_KM,
      noun: "tailpipe CO₂ from driving ~1 km in an average new EEA passenger car (~108 g/km)",
      key: "carCo2Km",
    },
    {
      ref: FLIGHT_ONE_WAY_G,
      noun: "CO₂e from one economy transatlantic flight (order-of-magnitude ~0.25–0.35 t per passenger one way)",
      key: "flightOneWay",
    },
  ];

  let best = tiers[0];
  let bestD = Infinity;
  for (const t of tiers) {
    const d = logDist(g, t.ref);
    if (d < bestD) {
      bestD = d;
      best = t;
    }
  }
  return { sentence: ratioPhrase("carbon", g, best.ref, best.noun), sourceKey: best.key };
}

export function waterAnalogyMl(ml: number): FootprintAnalogy | null {
  if (!Number.isFinite(ml) || ml <= 0) return null;

  const tiers: { ref: number; noun: string; key: keyof typeof COMPARISON_SOURCE_NOTES }[] = [
    { ref: BOTTLE_ML, noun: "a 500 ml bottle of water", key: "bottle500" },
    {
      ref: SHOWER_10MIN_ML,
      noun: "water down the drain during ~10 min with a typical ~9.5 L/min shower (~95 L)",
      key: "shower10",
    },
    {
      ref: POOL_OLYMPIC_ML,
      noun: "the water in a minimum-depth Olympic swimming pool (~2.5 million litres)",
      key: "poolOlympic",
    },
  ];

  let best = tiers[0];
  let bestD = Infinity;
  for (const t of tiers) {
    const d = logDist(ml, t.ref);
    if (d < bestD) {
      bestD = d;
      best = t;
    }
  }

  return { sentence: ratioPhrase("water", ml, best.ref, best.noun), sourceKey: best.key };
}

export function footprintAnalogies(fp: EcoFootprint): {
  energy: FootprintAnalogy | null;
  carbon: FootprintAnalogy | null;
  water: FootprintAnalogy | null;
} {
  return {
    energy: energyAnalogyWh(fp.energy_wh),
    carbon: carbonAnalogyG(fp.carbon_g),
    water: waterAnalogyMl(fp.water_ml),
  };
}
