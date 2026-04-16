import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.ARTIFICIAL_ANALYSIS_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        models: [],
        status: "disabled",
        message:
          "Performance scores are turned off until you add ARTIFICIAL_ANALYSIS_API_KEY to your environment. Pricing and token math still work.",
      },
      { status: 200 }
    );
  }

  try {
    const res = await fetch('https://artificialanalysis.ai/api/v2/data/llms/models', {
      headers: {
        'x-api-key': apiKey,
        'Accept': 'application/json'
      },
      next: { revalidate: 86400 } // Cache performance data for 24h
    });

    if (!res.ok) {
        // Fallback or detailed error logging
        console.error("Artificial Analysis API Error:", res.status, await res.text());
        throw new Error("API Request Failed");
    }

    const data = await res.json();

    // Artificial Analysis returns rows in `data`; older assumptions used `models`.
    const rawModels = Array.isArray(data)
      ? data
      : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.models)
          ? data.models
          : [];

    // Normalize and map to our internal IDs for consistent UI display
    type AARaw = {
      id?: string;
      model_id?: string;
      slug?: string;
      name?: string;
      model_name?: string;
      evaluations?: {
        artificial_analysis_intelligence_index?: number;
      };
      intelligence_index?: number;
      artificial_analysis_intelligence_index?: number;
      median_output_tokens_per_second?: number;
      output_speed?: number;
      median_time_to_first_token_seconds?: number;
      time_to_first_token?: number;
      ttft?: number;
    };

    const mappedModels = (rawModels as AARaw[]).map((m) => ({
      id: m.slug || m.id || m.model_id,
      name: m.name || m.model_name || m.slug || m.id,
      intelligence_index:
        m.intelligence_index ??
        m.artificial_analysis_intelligence_index ??
        m.evaluations?.artificial_analysis_intelligence_index ??
        null,
      median_output_tokens_per_second:
        m.median_output_tokens_per_second ?? m.output_speed ?? null,
      time_to_first_token:
        m.time_to_first_token ?? m.median_time_to_first_token_seconds ?? m.ttft ?? null,
    })).filter((m) => m.id && m.name);

    return NextResponse.json({
      models: mappedModels,
      status: "ok",
      message: null,
    });
  } catch (error) {
    console.error("Benchmark Fetch Error:", error);
    return NextResponse.json({
      models: [],
      status: "error",
      message:
        "Could not load Artificial Analysis benchmarks (network or API error). Try again later or check the server log.",
    });
  }
}

