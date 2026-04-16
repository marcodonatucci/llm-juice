// src/lib/finops/pricing.ts

export interface ModelPricing {
  model_name: string;
  input_cost_per_token: number;
  output_cost_per_token: number;
  max_input_tokens?: number;
}

/** Used when OpenRouter is unreachable; IDs align with OpenRouter slugs where possible. */
export const FALLBACK_PRICING_MAP: Record<string, ModelPricing> = {
  "openai/gpt-4o": {
    model_name: "OpenAI: GPT-4o",
    input_cost_per_token: 5e-6,
    output_cost_per_token: 15e-6,
    max_input_tokens: 128000,
  },
  "openai/gpt-4o-mini": {
    model_name: "OpenAI: GPT-4o Mini",
    input_cost_per_token: 0.15e-6,
    output_cost_per_token: 0.6e-6,
    max_input_tokens: 128000,
  },
  "anthropic/claude-3.5-sonnet": {
    model_name: "Anthropic: Claude 3.5 Sonnet",
    input_cost_per_token: 3e-6,
    output_cost_per_token: 15e-6,
    max_input_tokens: 200000,
  },
  "anthropic/claude-3.5-haiku": {
    model_name: "Anthropic: Claude 3.5 Haiku",
    input_cost_per_token: 0.8e-6,
    output_cost_per_token: 4e-6,
    max_input_tokens: 200000,
  },
  "meta-llama/llama-3.1-70b-instruct": {
    model_name: "Meta: Llama 3.1 70B Instruct",
    input_cost_per_token: 0.6e-6,
    output_cost_per_token: 0.6e-6,
    max_input_tokens: 131072,
  },
  "meta-llama/llama-3.1-8b-instruct": {
    model_name: "Meta: Llama 3.1 8B Instruct",
    input_cost_per_token: 0.05e-6,
    output_cost_per_token: 0.05e-6,
    max_input_tokens: 131072,
  },
};

export type ModelListEntry = {
  id: string;
  name: string;
  max_input_tokens?: number;
};

export type ModelsCatalog = {
  map: Record<string, ModelPricing>;
  list: ModelListEntry[];
  source?: string;
};

/**
 * Loads the live model catalog and per-token pricing from OpenRouter (via `/api/models`).
 * Falls back to a small static map if the API route returns an error payload.
 */
export async function fetchModelsCatalog(): Promise<ModelsCatalog> {
  try {
    const res = await fetch("/api/models", { cache: "no-store" });
    const body = (await res.json()) as ModelsCatalog & { error?: string };

    if (!res.ok || !body.map || !body.list) {
      return {
        map: FALLBACK_PRICING_MAP,
        list: Object.entries(FALLBACK_PRICING_MAP).map(([id, v]) => ({
          id,
          name: v.model_name,
          max_input_tokens: v.max_input_tokens,
        })),
        source: "fallback",
      };
    }

    return {
      map: body.map,
      list: body.list,
      source: body.source,
    };
  } catch (error) {
    console.error("Failed to load models catalog:", error);
    return {
      map: FALLBACK_PRICING_MAP,
      list: Object.entries(FALLBACK_PRICING_MAP).map(([id, v]) => ({
        id,
        name: v.model_name,
        max_input_tokens: v.max_input_tokens,
      })),
      source: "fallback",
    };
  }
}

/** @deprecated Use fetchModelsCatalog */
export async function fetchLiteLLMPricing(): Promise<Record<string, ModelPricing>> {
  const { map } = await fetchModelsCatalog();
  return map;
}

export function calculateCost(
  modelId: string,
  inputTokens: number,
  outputTokens: number,
  pricingData: Record<string, ModelPricing>
): { inputCost: number; outputCost: number; totalCost: number } {
  let modelInfo = pricingData[modelId];

  if (!modelInfo) {
    const match = Object.keys(pricingData).find(
      (key) => key.includes(modelId) || modelId.includes(key)
    );
    if (match) modelInfo = pricingData[match];
  }

  if (!modelInfo) {
    modelInfo = FALLBACK_PRICING_MAP["openai/gpt-4o-mini"];
  }

  const inputCost = (modelInfo.input_cost_per_token || 0) * inputTokens;
  const outputCost = (modelInfo.output_cost_per_token || 0) * outputTokens;

  return {
    inputCost,
    outputCost,
    totalCost: inputCost + outputCost,
  };
}
