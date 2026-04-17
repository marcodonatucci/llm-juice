# LLM Juice

LLM Juice is a polished **AI FinOps + GreenOps simulator** for LLM prompts.

Paste a prompt, choose a model from the live catalog, and the app estimates:

- input tokens
- likely completion ranges (`p50` and `p90`)
- per-request cost
- rough energy, CO2e, and water footprint
- throughput and intelligence benchmarks when available
- monthly scaling scenarios for budgeting and planning

It is designed for founders, operators, researchers, and AI teams who want a clearer answer to a simple question:

**What does one model request cost us financially and environmentally?**

## What the app does

LLM Juice is not a passive dashboard. It is an interactive planning tool with a clean report flow:

- **Prompt analyzer**: estimates token counts and likely completion size from the prompt itself
- **Live model catalog**: loads models, context windows, and pricing from OpenRouter
- **Cost simulator**: computes input, output, and total request cost for typical and higher-output cases
- **GreenOps estimator**: approximates electricity use, CO2e, and water footprint from inferred model class and regional assumptions
- **Benchmark view**: shows throughput, latency, and intelligence data from Artificial Analysis when configured
- **Compare mode**: lets you contrast the selected model with another model for the same prompt
- **Forecasting slider**: scales one request into monthly demand scenarios
- **Export card**: captures a presentation-friendly report image for decks and case studies
- **Learning hub**: ships with a long-form educational guide on FinOps, GreenOps, water, GPUs, routing, and forecasting

## Product framing

The app is a **simulation layer**, not a billing or telemetry product.

That means it is intentionally fast and explorable, but it does not use:

- provider-side true token usage logs
- live GPU telemetry
- real-time inference geography
- production trace calibration

Instead, it gives teams a transparent, auditable estimate they can use for:

- early pricing decisions
- architecture trade-off discussions
- stakeholder education
- sustainability storytelling
- rough budgeting before production instrumentation exists

## Data sources

### Pricing and model metadata

Live model IDs, context windows, and per-token USD pricing are loaded from the public OpenRouter API.

- Route: [`src/app/api/models/route.ts`](src/app/api/models/route.ts)
- Upstream: `GET https://openrouter.ai/api/v1/models`
- Cost logic: [`src/lib/finops/pricing.ts`](src/lib/finops/pricing.ts)

If OpenRouter is unavailable, the app falls back to a small embedded pricing map so the interface remains usable.

### Performance benchmarks

Optional performance metrics come from Artificial Analysis.

- Route: [`src/app/api/benchmarks/route.ts`](src/app/api/benchmarks/route.ts)
- Upstream: `GET https://artificialanalysis.ai/api/v2/data/llms/models`

When configured, the app currently uses:

- intelligence index
- median output tokens per second
- median time to first token

If the API key is missing, the benchmark panel gracefully degrades and the rest of the product still works.

### Simulation methodology

The detailed logic, formulas, assumptions, and approximation notes are documented in:

- [`SIMULATION_METHODOLOGY.md`](SIMULATION_METHODOLOGY.md)

That file explains token counting, output estimation, pricing math, emissions logic, water approximations, and monthly forecasting assumptions in audit-friendly language.

## Stack

- **Next.js 16**
- **React 19**
- **TypeScript**
- **Tailwind CSS 4**
- **shadcn/ui**
- **js-tiktoken**
- **@tgwf/co2**

## Local development

Install dependencies:

```bash
npm install
```

Start the app:

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

Quality checks:

```bash
npm run lint
npm run build
```

## Environment variables

Create a `.env.local` file for local development.

```bash
ARTIFICIAL_ANALYSIS_API_KEY=your_key_here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Notes:

- `ARTIFICIAL_ANALYSIS_API_KEY` is optional. Without it, benchmark cards show no external performance data.
- `NEXT_PUBLIC_SITE_URL` is recommended for production metadata. On Vercel, `VERCEL_URL` is used as a fallback.

## Deploying to Vercel

This project is a good fit for Vercel because it is a Next.js app with lightweight server routes.

Recommended production environment variables:

- `ARTIFICIAL_ANALYSIS_API_KEY`
- `NEXT_PUBLIC_SITE_URL`

Typical deploy flow:

```bash
npx vercel
```

For production:

```bash
npx vercel --prod
```

After deployment, set:

- `NEXT_PUBLIC_SITE_URL=https://your-project-name.vercel.app`

## Project structure

```text
src/
  app/
    api/
      benchmarks/
      models/
    learn/
  components/
    dashboard/
  lib/
    benchmarks/
    finops/
    greenops/
    metrics/
```

High-signal files:

- [`src/app/page.tsx`](src/app/page.tsx): landing page composition
- [`src/app/LLMJuiceContext.tsx`](src/app/LLMJuiceContext.tsx): orchestration for prompt analysis state
- [`src/lib/finops/estimate-output.ts`](src/lib/finops/estimate-output.ts): output-length estimation heuristics
- [`src/lib/finops/pricing.ts`](src/lib/finops/pricing.ts): pricing normalization and request cost math
- [`src/lib/greenops/emissions.ts`](src/lib/greenops/emissions.ts): environmental estimation logic
- [`src/components/dashboard/MetricsDashboard.tsx`](src/components/dashboard/MetricsDashboard.tsx): main analysis report

## Why this exists

Most AI cost tooling explains dollars.

Most sustainability discussion explains emissions at a very high level.

Very little productized software makes both visible at the same time, in a way that is:

- understandable to non-specialists
- useful in architecture conversations
- grounded enough to be auditable
- visually strong enough to share

LLM Juice aims to sit in that gap.
