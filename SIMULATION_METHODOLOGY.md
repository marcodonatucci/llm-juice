# Simulation Methodology, Formulas, and Data Sources

This document explains how the app computes **cost**, **token ranges**, **energy/CO2/water**, **benchmarks**, and **monthly projections**.

Goal: make every assumption auditable, so you can replace weak approximations with better ones.

---

## 1) Scope and Architecture

Main orchestration is in `src/app/TokenomicsContext.tsx`:

1. Count input tokens from prompt text.
2. Estimate output token uncertainty (`p50`, `p90`).
3. Compute cost for both scenarios.
4. Compute footprint for both scenarios.
5. Optionally compute a second model comparison with the same prompt.
6. Scale to monthly values in the forecasting slider.

The app is a **planning simulator**, not a metering tool:

- no provider-side true token usage logs,
- no hardware telemetry,
- no regional runtime routing.

---

## 2) Token Counting

**File:** `src/app/TokenomicsContext.tsx` (`countInputTokens`)

### Formula

- Primary:
  - `input_tokens = cl100k_base.encode(prompt).length`
- Fallback if tokenizer fails:
  - `input_tokens ≈ ceil(prompt.length / 4)`

### Approximation Notes

- `cl100k_base` is a practical proxy for many modern chat models, but not universal.
- Character-based fallback (`/4`) is coarse and can be significantly wrong for non-English, code-heavy, or symbol-heavy text.

### Better Alternatives to Research

- Model-specific tokenizers per selected model (when available).
- Provider-side token counting endpoints (if exposed).

---

## 3) Output Token Simulation (Typical + Higher Estimate)

**File:** `src/lib/finops/estimate-output.ts`

### Purpose

Estimate two output scenarios:

- `p50`: typical completion length
- `p90`: high-but-plausible completion length

### Formula

1. Detect intent flags from regex keywords:
   - `longForm`, `shortForm`, `codeHeavy`, `reasoningHeavy`
2. Base output/input ratio by input length:
   - `<35 -> 0.58`
   - `<160 -> 0.48`
   - `>2800 -> 0.26`
   - `>1200 -> 0.32`
   - otherwise `0.42`
3. Intent multiplier:
   - `longForm: x1.22`
   - `shortForm: x0.72`
   - `codeHeavy: at least x1.12`
4. Reasoning-aware adjustment:
   - if model ID suggests reasoning class (`o1`, `o3`, `r1`, etc.) or prompt requests explicit reasoning:
   - increase central estimate by `x1.45`
   - use cap `16384` instead of `8192`
5. Typical output:
   - `p50 = clamp(round(input_tokens * ratio), min=32, max=cap)`
6. Tail multiplier:
   - base `1.72`
   - `+0.38` if longForm
   - `-0.28` if shortForm
   - `+0.22` if codeHeavy
   - then clamp to `[1.38, 2.45]`
   - `+0.46` if reasoning mode
7. Higher estimate:
   - `p90_raw = max(p50 + 48, round(p50 * tail))`
   - `p90 = clamp(p90_raw, min=p50, max=cap)`

### Approximation Notes

- This is a heuristic prior, not a probabilistic model calibrated on your real traces.
- Regex intent extraction is brittle and English-centric.
- This is still a heuristic prior, not calibrated to tenant-specific historical traces.

### Better Alternatives to Research

- Fit a quantile regression from production telemetry (`input_tokens`, prompt class, model, temperature, etc.).
- Use per-model empirical distributions and truncation by model max output tokens.

---

## 4) Pricing and Cost Simulation

**Files:**
- `src/app/api/models/route.ts`
- `src/lib/finops/pricing.ts`

### Data Source

Primary live catalog:

- OpenRouter Models API: `https://openrouter.ai/api/v1/models`

Fallback:

- Static `FALLBACK_PRICING_MAP` embedded in code.

### Formula

For a model with:

- `input_cost_per_token` (USD/token)
- `output_cost_per_token` (USD/token)

Costs are:

- `input_cost = input_tokens * input_cost_per_token`
- `output_cost = output_tokens * output_cost_per_token`
- `total_cost = input_cost + output_cost`

Computed twice:

- `total_cost_p50` with `output_tokens = p50`
- `total_cost_p90` with `output_tokens = p90`

### Approximation Notes

- Assumes linear token pricing with no tiering, cache hits, priority routing, or provider discounts.
- If selected model ID is missing, fuzzy key matching may pick a near string match.
- If no match, defaults to fallback `openai/gpt-4o-mini`.

### Better Alternatives to Research

- Explicit support for cached input pricing and tiered context windows.
- Provider-specific billing rules and minimum billable increments.
- Model ID normalization table with version pinning.

---

## 5) Environmental Simulation (Energy, CO2e, Water)

**File:** `src/lib/greenops/emissions.ts`

### Core Formula

From code and implementation:

- `E_prompt_Wh = ((P_dynamic * N_gpu * T_processing_sec) / 3600) * PUE_region`

Where:

- `PUE_region` from lookup (fallback `1.15`)
- `T_processing_sec = max(total_tokens / effective_tps, 0.35)`
- `effective_tps = base_tps * batch_factor * backend_optimization_factor * reasoning_factor`
- `P_dynamic = Pmin + (Pmax - Pmin) * utilization`
- `N_gpu` and hardware profile depend on inferred model class

### Model Class Heuristic

`determineModelClass(modelId)`:

- HEAVY if contains patterns like `"4"` (excluding mini/8b), `"opus"`, `"large"`
- LIGHT if contains `"mini"`, `"haiku"`, `"8b"`, `"flash"`
- otherwise MEDIUM

Class parameters:

- HEAVY: `Pmin/Pmax = 59/416 W`, `N_gpu = 8`, `base_tps = 90`
- MEDIUM: `Pmin/Pmax = 72/400 W`, `N_gpu = 2`, `base_tps = 180`
- LIGHT: `Pmin/Pmax = 17/73 W`, `N_gpu = 1`, `base_tps = 480`

Batch-size efficiency approximation:

- `<300 tokens -> 0.72`
- `<1200 tokens -> 0.90`
- `<3200 tokens -> 1.00`
- `>=3200 tokens -> 1.10`

### CO2e Formula

- `energy_kWh = energy_Wh / 1000`
- `grid_intensity = averageIntensity.data[normalizedRegion] or WORLD or 475` (gCO2e/kWh)
- `carbon_g = energy_kWh * grid_intensity`

Grid intensity comes from `@tgwf/co2` (`averageIntensity` dataset).

### Water Formula

- `water_ml = energy_kWh * WUE_region (L/kWh) * 1000`

Region-aware defaults currently embedded:

- PUE: `WORLD 1.15`, `US 1.14`, `IT 1.16`, `SE 1.08`, `IE 1.10`, `SG 1.30`, `ID 1.39`
- WUE (L/kWh): `WORLD 0.15`, `US 0.55`, `IT 0.10`, `SE 0.02`, `IE 0.03`, `SG 1.68`, `ID 2.75`

### Approximation Notes

- Throughput remains modeled (not measured), but is now dynamic by model class and workload size.
- Hardware mapping from string patterns is very rough.
- Region defaults to `"WORLD"`; app does not currently infer user/runtime region.
- PUE/WUE are regional lookup values, but still static averages per region.

### Better Alternatives to Research

- Model/provider-specific throughput and serving architecture benchmarks.
- Region-aware runtime intensity using actual deployment geography.
- Confidence intervals for energy and water coefficients.
- Separation of prompt-prefill vs decode phases.

---

## 6) Real-World Comparison Tooltips

**File:** `src/lib/greenops/real-world-comparisons.ts`

### Method

For each metric (energy, carbon, water):

1. Define fixed benchmark tiers (e.g., phone charge, shower, car km, Germany hourly grid load).
2. Compute nearest benchmark by log-distance:
   - `argmin |log10(value) - log10(reference)|`
3. Generate phrase:
   - same ballpark (`0.7x` to `1.35x`)
   - `Nx` larger
   - `1/N` smaller
   - if extremely smaller (`N > 2500`), show percentage order.

### Data Anchors Included

- EIA household electricity (annual -> daily/hourly derived)
- Bundesnetzagentur / SMARD annual German grid load
- EEA gCO2/km for new passenger cars
- EPA WaterSense shower flow
- FINA Olympic pool dimensions
- Ballpark phone/laptop energy assumptions

### Approximation Notes

- These are communication analogies, not measured equivalences.
- Some anchors are official statistics; others are order-of-magnitude engineering assumptions.

---

## 7) Monthly Forecast Scaling

**File:** `src/components/dashboard/ForecastingSlider.tsx`

### Formula

With slider multiplier `M` (completions/month):

- `monthly_cost_p50 = total_cost_p50 * M`
- `monthly_cost_p90 = total_cost_p90 * M`
- `monthly_carbon_p50_kg = (carbon_g_p50 * M) / 1000`
- `monthly_carbon_p90_kg = (carbon_g_p90 * M) / 1000`

### Approximation Notes

- Linear scaling assumes identical request mix all month.
- No seasonality, caching effects, retries, prompt-length variance, or model-routing dynamics.

### Better Alternatives to Research

- Distribution-based simulation (Monte Carlo) over prompt lengths and task types.
- Separate multipliers per workflow/team/model.

---

## 8) Benchmark Mapping and Quality/Speed Metrics

**Files:**
- `src/app/api/benchmarks/route.ts`
- `src/lib/benchmarks/match-benchmark.ts`

### Data Source

- Artificial Analysis API (`/api/v2/data/llms/models`) if `ARTIFICIAL_ANALYSIS_API_KEY` exists.

### Mapping Method

OpenRouter model IDs are matched to benchmark rows by:

1. direct substring overlap of IDs,
2. OpenRouter tail match (`org/model` -> `model`),
3. compact alphanumeric comparison,
4. alias needle rules (e.g., `gpt-4o-mini`, `claude-3.5-sonnet`).

### Approximation Notes

- Matching is heuristic and may produce false positives/negatives when naming differs.

### Better Alternatives to Research

- Curated ID mapping table with unit tests.
- Version-aware model identity registry.

---

## 9) UX/State Decisions that Affect Simulation Perception

**File:** `src/app/TokenomicsContext.tsx`

- Analysis only updates on submit (`Enter`/send), not every keystroke.
- A minimum skeleton/loading duration (`420 ms`) is enforced for smooth visual feedback.
- Comparison mode re-runs the same formulas for second model with same prompt assumptions.

These do not change formulas, but they influence when numbers refresh and how users interpret stability.

---

## 10) Known Limitations (Current Version)

1. No true usage logs from providers.
2. No model-specific tokenizer; output cap is reasoning-aware but still heuristic.
3. No stochastic uncertainty propagation.
4. Region-aware PUE/WUE exists, but runtime region is not inferred from provider telemetry.
5. No hardware telemetry or provider-specific serving architecture.
6. Analogy tiers are static and manually curated.

---

## 11) Suggested Validation Checklist

If you want to evaluate “is this good enough?”, test these:

1. **Token estimation error** vs real API usage logs (MAPE for input/output p50/p90).
2. **Cost estimation error** against billing exports (by model and workflow).
3. **Footprint sensitivity** for:
   - throughput (tokens/s),
   - GPU count,
   - PUE,
   - grid intensity.
4. **Benchmark matching precision** (manual sample).
5. **Analogy usefulness** via user interviews (“did this make scale understandable?”).

---

## 12) Primary External Sources Currently Referenced

- OpenRouter Models API: <https://openrouter.ai/api/v1/models>
- The Green Web Foundation `co2.js` average grid intensity dataset: <https://www.thegreenwebfoundation.org/co2-js/>
- Artificial Analysis models endpoint: <https://artificialanalysis.ai/>
- EIA household electricity FAQ/data: <https://www.eia.gov/tools/faqs/faq.php?id=97&t=11>
- Bundesnetzagentur / SMARD annual electricity data: <https://www.bundesnetzagentur.de/SharedDocs/Pressemitteilungen/EN/2024/20240103_SMARD.html>
- EEA passenger car CO2 monitoring: <https://www.eea.europa.eu/en/analysis/indicators/co2-performance-of-new-passenger>
- EPA WaterSense showerhead flow references: <https://www.epa.gov/watersense/showerheads>
- FINA pool dimensions standard (used for Olympic pool volume baseline): <https://www.fina.org/>

---

If you want, next step I can add a second file: `SIMULATION_METHODOLOGY_V2_IDEAS.md` with concrete replacement models (quantile regression spec, telemetry schema, and an uncertainty framework).
