import { NextResponse } from "next/server";

import type { ModelPricing } from "@/lib/finops/pricing";
import { FALLBACK_PRICING_MAP } from "@/lib/finops/pricing";

const OPENROUTER_MODELS = "https://openrouter.ai/api/v1/models";

type OpenRouterModel = {
  id: string;
  name?: string;
  context_length?: number;
  top_provider?: { max_completion_tokens?: number };
  pricing?: {
    prompt?: string;
    completion?: string;
  };
};

function parseUsdPerToken(value: string | undefined): number {
  if (value === undefined || value === null || value === "") return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function normalizeModels(data: OpenRouterModel[]): {
  map: Record<string, ModelPricing>;
  list: { id: string; name: string; max_input_tokens?: number }[];
} {
  const map: Record<string, ModelPricing> = {};
  const list: { id: string; name: string; max_input_tokens?: number }[] = [];

  for (const m of data) {
    if (!m?.id) continue;
    const input = parseUsdPerToken(m.pricing?.prompt);
    const output = parseUsdPerToken(m.pricing?.completion);
    if (input <= 0 && output <= 0) continue;

    const row: ModelPricing = {
      model_name: m.name || m.id,
      input_cost_per_token: input,
      output_cost_per_token: output,
      max_input_tokens: m.context_length,
    };
    map[m.id] = row;
    list.push({
      id: m.id,
      name: m.name || m.id,
      max_input_tokens: m.context_length,
    });
  }

  list.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));

  return { map, list };
}

export async function GET() {
  try {
    const res = await fetch(OPENROUTER_MODELS, {
      headers: {
        Accept: "application/json",
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("OpenRouter models error:", res.status, text);
      return NextResponse.json(
        {
          source: "fallback",
          map: FALLBACK_PRICING_MAP,
          list: Object.entries(FALLBACK_PRICING_MAP).map(([id, v]) => ({
            id,
            name: v.model_name,
            max_input_tokens: v.max_input_tokens,
          })),
        },
        { status: 200, headers: { "Cache-Control": "s-maxage=300" } }
      );
    }

    const body = (await res.json()) as { data?: OpenRouterModel[] };
    const raw = Array.isArray(body.data) ? body.data : [];
    const { map, list } = normalizeModels(raw);

    if (list.length === 0) {
      return NextResponse.json(
        {
          source: "fallback",
          map: FALLBACK_PRICING_MAP,
          list: Object.entries(FALLBACK_PRICING_MAP).map(([id, v]) => ({
            id,
            name: v.model_name,
            max_input_tokens: v.max_input_tokens,
          })),
        },
        { status: 200, headers: { "Cache-Control": "s-maxage=300" } }
      );
    }

    return NextResponse.json(
      { source: "openrouter", map, list },
      { status: 200, headers: { "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400" } }
    );
  } catch (e) {
    console.error("OpenRouter models fetch failed:", e);
    return NextResponse.json(
      {
        source: "fallback",
        map: FALLBACK_PRICING_MAP,
        list: Object.entries(FALLBACK_PRICING_MAP).map(([id, v]) => ({
          id,
          name: v.model_name,
          max_input_tokens: v.max_input_tokens,
        })),
      },
      { status: 200, headers: { "Cache-Control": "s-maxage=300" } }
    );
  }
}
