"use client";

import { useTokenomics } from "@/app/TokenomicsContext";
import { Badge } from "@/components/ui/badge";
import {
  Leaf,
  DollarSign,
  Binary,
  Zap,
  Droplets,
  Gauge,
  Info,
  Activity,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { matchBenchmarkForModel } from "@/lib/benchmarks/match-benchmark";
import { MetricsReportSkeleton } from "@/components/dashboard/MetricsReportSkeleton";
import { CompareModelBar } from "@/components/dashboard/CompareModelBar";
import { FootprintComparisonTooltip } from "@/components/dashboard/FootprintComparisonTooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { compareToneWrapper } from "@/lib/metrics/compare-style";

export function MetricsDashboard() {
  const { state } = useTokenomics();

  if (state.inputTokens === 0 && !state.reportLoading) return null;

  if (state.inputTokens === 0 && state.reportLoading) {
    return <MetricsReportSkeleton />;
  }

  const benchmark = matchBenchmarkForModel(state.selectedModel, state.arenaData);
  const benchmarkRowCount = state.arenaData?.length ?? 0;
  const cmp = state.comparison;
  const benchmarkB = cmp ? matchBenchmarkForModel(cmp.modelId, state.arenaData) : null;

  const modelLabel = benchmark?.name ?? state.selectedModel;
  const modelLabelB = cmp ? benchmarkB?.name ?? cmp.modelId : "";
  const totalTokensP50 = state.inputTokens + state.outputTokensP50;
  const totalTokensP90 = state.inputTokens + state.outputTokensP90;

  return (
    <div
      id="metrics-export-capture"
      className="relative mx-auto mt-12 w-full max-w-4xl px-4 pb-8"
      aria-busy={state.reportLoading}
    >
      <CompareModelBar />

      <div
        key={state.reportRunId}
        className={cn(
          "relative overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm ring-1 ring-black/[0.03] dark:ring-white/[0.06]",
          state.reportRunId > 0 &&
            "motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-[0.99] motion-safe:duration-500 motion-safe:ease-out"
        )}
      >
        {/* Report header */}
        <div className="border-b border-border/60 bg-muted/20 px-5 py-4 md:px-6 md:py-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Analysis report
              </p>
              <h2 className="text-lg font-semibold tracking-tight text-foreground md:text-xl">
                FinOps &amp; footprint for one completion
              </h2>
              <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
                Input tokens use BPE (cl100k_base). We show two guesses for how long the
                model&apos;s reply might be: a <strong className="font-medium text-foreground/90">typical</strong>{" "}
                length and a <strong className="font-medium text-foreground/90">higher estimate</strong> if the
                answer runs long (based on your prompt size and wording, not a live prediction).
                Cost and footprint use the same two scenarios.
              </p>
            </div>
            <Badge
              variant="secondary"
              className="w-fit shrink-0 border border-border/60 bg-background/80 font-normal text-muted-foreground"
            >
              <span className="max-w-[220px] truncate font-mono text-xs">{modelLabel}</span>
            </Badge>
          </div>
        </div>

        {/* Metric columns */}
        <div className="grid divide-y divide-border/60 md:grid-cols-3 md:divide-x md:divide-y-0">
          <section className="p-5 md:p-6">
            <div className="mb-4 flex items-center gap-2 text-muted-foreground">
              <Binary className="size-4 shrink-0 opacity-80" aria-hidden />
              <span className="text-xs font-medium uppercase tracking-wider">Tokens</span>
              <Tooltip>
                <TooltipTrigger
                  render={(triggerProps) => (
                    <button
                      {...triggerProps}
                      type="button"
                      className={cn(
                        "ml-auto inline-flex text-muted-foreground/70 hover:text-foreground",
                        triggerProps.className
                      )}
                      aria-label="About token counts"
                    >
                      <Info className="size-3.5" />
                    </button>
                  )}
                />
                <TooltipContent className="max-w-xs">
                  Smaller payloads reduce memory, latency, and energy per request.
                </TooltipContent>
              </Tooltip>
            </div>
            <p className="font-mono text-3xl font-semibold tabular-nums tracking-tight md:text-4xl">
              {state.inputTokens.toLocaleString()}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">Prompt (in)</p>
            <div className="mt-5 border-t border-border/50 pt-5">
              <p className="font-mono text-2xl font-medium tabular-nums text-foreground/85 md:text-3xl">
                +{state.outputTokensP50.toLocaleString()}
                <span className="ml-2 text-lg font-normal text-muted-foreground md:text-xl">
                  <span className="text-xs font-sans font-normal tracking-normal text-muted-foreground">
                  typical reply
                </span>
                </span>
              </p>
              <p className="mt-2 font-mono text-lg tabular-nums text-muted-foreground md:text-xl">
                +{state.outputTokensP90.toLocaleString()}{" "}
                <span className="text-xs font-sans font-normal tracking-normal text-muted-foreground">
                  if the answer runs long
                </span>
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Estimated completion length (not measured from a real run)
              </p>
              {cmp && (
                <p className="mt-3 rounded-md bg-muted/40 px-2 py-1.5 text-xs leading-snug text-muted-foreground">
                  Same token-length guess for both models (prompt-based only). Compare cost
                  and footprint below — those change by model.
                </p>
              )}
            </div>
            <p className="mt-4 text-xs text-muted-foreground/90">
              Total tokens (in + out), same two scenarios:{" "}
              <span className="font-mono tabular-nums text-foreground/80">
                {totalTokensP50.toLocaleString()}
              </span>
              <span className="text-muted-foreground"> — </span>
              <span className="font-mono tabular-nums text-foreground/80">
                {totalTokensP90.toLocaleString()}
              </span>
            </p>
          </section>

          <section className="p-5 md:p-6">
            <div className="mb-4 flex items-center gap-2 text-muted-foreground">
              <DollarSign className="size-4 shrink-0 opacity-80" aria-hidden />
              <span className="text-xs font-medium uppercase tracking-wider">Cost</span>
              <Tooltip>
                <TooltipTrigger
                  render={(triggerProps) => (
                    <button
                      {...triggerProps}
                      type="button"
                      className={cn(
                        "ml-auto inline-flex text-muted-foreground/70 hover:text-foreground",
                        triggerProps.className
                      )}
                      aria-label="About pricing"
                    >
                      <Info className="size-3.5" />
                    </button>
                  )}
                />
                <TooltipContent className="max-w-xs">
                  List pricing × input tokens + estimated completion length (typical vs
                  longer-reply case).
                </TooltipContent>
              </Tooltip>
            </div>
            <p className="font-mono text-3xl font-semibold tabular-nums tracking-tight text-foreground md:text-4xl">
              ${state.cost.totalCostP50.toFixed(5)}
              <span className="ml-1.5 align-top text-xs font-sans font-normal text-muted-foreground">
                typical
              </span>
            </p>
            {cmp && (
              <p
                className={cn(
                  "mt-1 font-mono text-2xl font-semibold tabular-nums",
                  compareToneWrapper(cmp.cost.totalCostP50 - state.cost.totalCostP50, true)
                )}
              >
                ${cmp.cost.totalCostP50.toFixed(5)}
              </p>
            )}
            <p className="mt-1 font-mono text-lg text-muted-foreground tabular-nums md:text-xl">
              ${state.cost.totalCostP90.toFixed(5)}{" "}
              <span className="text-xs font-sans text-muted-foreground">higher estimate</span>
            </p>
            {cmp && (
              <p
                className={cn(
                  "mt-0.5 font-mono text-base font-medium tabular-nums md:text-lg",
                  compareToneWrapper(cmp.cost.totalCostP90 - state.cost.totalCostP90, true)
                )}
              >
                ${cmp.cost.totalCostP90.toFixed(5)}
              </p>
            )}
            <p className="mt-1 text-sm text-muted-foreground">Per request (USD)</p>
            <dl className="mt-5 space-y-3 border-t border-border/50 pt-5 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Input</dt>
                <div className="text-right">
                  <dd className="font-mono tabular-nums text-foreground">
                    ${state.cost.inputCost.toFixed(6)}
                  </dd>
                  {cmp && (
                    <dd
                      className={cn(
                        "mt-0.5 font-mono text-xs tabular-nums",
                        compareToneWrapper(cmp.cost.inputCost - state.cost.inputCost, true)
                      )}
                    >
                      ${cmp.cost.inputCost.toFixed(6)}
                    </dd>
                  )}
                </div>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Output (typical)</dt>
                <div className="text-right">
                  <dd className="font-mono tabular-nums text-foreground">
                    ${state.cost.outputCostP50.toFixed(6)}
                  </dd>
                  {cmp && (
                    <dd
                      className={cn(
                        "mt-0.5 font-mono text-xs tabular-nums",
                        compareToneWrapper(cmp.cost.outputCostP50 - state.cost.outputCostP50, true)
                      )}
                    >
                      ${cmp.cost.outputCostP50.toFixed(6)}
                    </dd>
                  )}
                </div>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Output (longer reply)</dt>
                <div className="text-right">
                  <dd className="font-mono tabular-nums text-foreground">
                    ${state.cost.outputCostP90.toFixed(6)}
                  </dd>
                  {cmp && (
                    <dd
                      className={cn(
                        "mt-0.5 font-mono text-xs tabular-nums",
                        compareToneWrapper(cmp.cost.outputCostP90 - state.cost.outputCostP90, true)
                      )}
                    >
                      ${cmp.cost.outputCostP90.toFixed(6)}
                    </dd>
                  )}
                </div>
              </div>
            </dl>
          </section>

          <section className="p-5 md:p-6">
            <div className="mb-4 flex items-center gap-2 text-muted-foreground">
              <Leaf className="size-4 shrink-0 opacity-80" aria-hidden />
              <span className="text-xs font-medium uppercase tracking-wider">Footprint</span>
              <Tooltip>
                <TooltipTrigger
                  render={(triggerProps) => (
                    <button
                      {...triggerProps}
                      type="button"
                      className={cn(
                        "ml-auto inline-flex text-muted-foreground/70 hover:text-foreground",
                        triggerProps.className
                      )}
                      aria-label="About environmental estimates"
                    >
                      <Info className="size-3.5" />
                    </button>
                  )}
                />
                <TooltipContent className="max-w-xs">
                  Order-of-magnitude indicators from CO2.js–style factors; useful for
                  comparisons, not compliance reporting.
                </TooltipContent>
              </Tooltip>
            </div>
            <ul className="space-y-4">
              <li>
                <div className="flex w-full min-w-0 items-center gap-2 text-muted-foreground">
                  <Zap className="size-3.5 shrink-0 text-amber-600/90 dark:text-amber-400/90" aria-hidden />
                  <span className="text-xs">Energy</span>
                  {state.footprintP50 && (
                    <FootprintComparisonTooltip footprint={state.footprintP50} metric="energy" />
                  )}
                </div>
                <p className="mt-1 font-mono text-xl font-semibold tabular-nums text-foreground md:text-2xl">
                  {state.footprintP50?.energy_wh.toFixed(3)}
                  <span className="ml-1 text-xs font-sans font-normal text-muted-foreground">
                    Wh
                  </span>
                </p>
                {cmp && state.footprintP50 && (
                  <p
                    className={cn(
                      "mt-0.5 font-mono text-lg font-semibold tabular-nums",
                      compareToneWrapper(
                        cmp.footprintP50.energy_wh - state.footprintP50.energy_wh,
                        true
                      )
                    )}
                  >
                    {cmp.footprintP50.energy_wh.toFixed(3)} Wh
                  </p>
                )}
                <p className="mt-0.5 font-mono text-sm tabular-nums text-muted-foreground">
                  Longer reply: {state.footprintP90?.energy_wh.toFixed(3)} Wh
                </p>
                {cmp && state.footprintP90 && (
                  <p
                    className={cn(
                      "mt-0.5 font-mono text-xs tabular-nums",
                      compareToneWrapper(
                        cmp.footprintP90.energy_wh - state.footprintP90.energy_wh,
                        true
                      )
                    )}
                  >
                    {cmp.footprintP90.energy_wh.toFixed(3)} Wh
                  </p>
                )}
              </li>
              <li>
                <div className="flex w-full min-w-0 items-center gap-2 text-muted-foreground">
                  <Droplets className="size-3.5 shrink-0 text-sky-600/80 dark:text-sky-400/80" aria-hidden />
                  <span className="text-xs">Water (evap.)</span>
                  {state.footprintP50 && (
                    <FootprintComparisonTooltip footprint={state.footprintP50} metric="water" />
                  )}
                </div>
                <p className="mt-1 font-mono text-xl font-semibold tabular-nums text-foreground md:text-2xl">
                  {state.footprintP50?.water_ml.toFixed(2)}
                  <span className="ml-1 text-xs font-sans font-normal text-muted-foreground">
                    ml
                  </span>
                </p>
                {cmp && state.footprintP50 && (
                  <p
                    className={cn(
                      "mt-0.5 font-mono text-lg font-semibold tabular-nums",
                      compareToneWrapper(
                        cmp.footprintP50.water_ml - state.footprintP50.water_ml,
                        true
                      )
                    )}
                  >
                    {cmp.footprintP50.water_ml.toFixed(2)} ml
                  </p>
                )}
                <p className="mt-0.5 font-mono text-sm tabular-nums text-muted-foreground">
                  Longer reply: {state.footprintP90?.water_ml.toFixed(2)} ml
                </p>
                {cmp && state.footprintP90 && (
                  <p
                    className={cn(
                      "mt-0.5 font-mono text-xs tabular-nums",
                      compareToneWrapper(
                        cmp.footprintP90.water_ml - state.footprintP90.water_ml,
                        true
                      )
                    )}
                  >
                    {cmp.footprintP90.water_ml.toFixed(2)} ml
                  </p>
                )}
              </li>
              <li>
                <div className="flex w-full min-w-0 items-center gap-2 text-muted-foreground">
                  <Activity
                    className="size-3.5 shrink-0 text-emerald-600/85 dark:text-emerald-400/85"
                    aria-hidden
                  />
                  <span className="text-xs">CO₂e</span>
                  {state.footprintP50 && (
                    <FootprintComparisonTooltip footprint={state.footprintP50} metric="carbon" />
                  )}
                </div>
                <p className="mt-1 font-mono text-xl font-semibold tabular-nums text-foreground md:text-2xl">
                  {state.footprintP50?.carbon_g.toFixed(4)}
                  <span className="ml-1 text-xs font-sans font-normal text-muted-foreground">
                    g
                  </span>
                </p>
                {cmp && state.footprintP50 && (
                  <p
                    className={cn(
                      "mt-0.5 font-mono text-lg font-semibold tabular-nums",
                      compareToneWrapper(
                        cmp.footprintP50.carbon_g - state.footprintP50.carbon_g,
                        true
                      )
                    )}
                  >
                    {cmp.footprintP50.carbon_g.toFixed(4)} g
                  </p>
                )}
                <p className="mt-0.5 font-mono text-sm tabular-nums text-muted-foreground">
                  Longer reply: {state.footprintP90?.carbon_g.toFixed(4)} g
                </p>
                {cmp && state.footprintP90 && (
                  <p
                    className={cn(
                      "mt-0.5 font-mono text-xs tabular-nums",
                      compareToneWrapper(
                        cmp.footprintP90.carbon_g - state.footprintP90.carbon_g,
                        true
                      )
                    )}
                  >
                    {cmp.footprintP90.carbon_g.toFixed(4)} g
                  </p>
                )}
              </li>
            </ul>
          </section>
        </div>

        {/* Benchmarks */}
        <div className="border-t border-border/60 bg-muted/10 px-5 py-5 md:px-6 md:py-6">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Gauge className="size-4 text-muted-foreground" aria-hidden />
            <h3 className="text-sm font-semibold tracking-tight">Throughput &amp; quality</h3>
            <span className="text-xs text-muted-foreground">
              Artificial Analysis benchmarks
            </span>
          </div>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch lg:gap-8">
            <div className="min-w-0 flex-1 space-y-3">
              <p className="text-sm leading-relaxed text-muted-foreground">
                <span className="font-medium text-foreground">{modelLabel}</span>
                {benchmark ? (
                  <>
                    {" "}
                    — median output speed{" "}
                    <span className="font-mono tabular-nums text-foreground/90">
                      {benchmark.median_output_tokens_per_second}
                    </span>{" "}
                    tokens/s; time to first token{" "}
                    <span className="font-mono tabular-nums text-foreground/90">
                      {benchmark.time_to_first_token}
                    </span>
                    s.
                  </>
                ) : (
                  <> — speed and Arena scores are not shown until a catalog match exists.</>
                )}
              </p>
              {!benchmark && (
                <div className="rounded-lg border border-border/60 bg-background/60 px-3 py-2.5 text-sm leading-relaxed text-muted-foreground">
                  {state.benchmarksStatus === "disabled" && (
                    <p>{state.benchmarksMessage}</p>
                  )}
                  {state.benchmarksStatus === "error" && (
                    <p>{state.benchmarksMessage}</p>
                  )}
                  {state.benchmarksStatus === "ready" && benchmarkRowCount === 0 && (
                    <p>
                      No performance data was returned. If you use an API key, check that the
                      Artificial Analysis endpoint is reachable.
                    </p>
                  )}
                  {state.benchmarksStatus === "ready" && benchmarkRowCount > 0 && (
                    <p>
                      We loaded {benchmarkRowCount} models from Artificial Analysis, but none
                      lined up with{" "}
                      <span className="font-mono text-foreground/90">{state.selectedModel}</span>.
                      Their names and ids differ from OpenRouter; try a mainstream variant (e.g.{" "}
                      <span className="font-mono">openai/gpt-4o</span>) or check their catalog.
                    </p>
                  )}
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="font-mono text-xs font-normal tabular-nums">
                  {benchmark
                    ? `${benchmark.median_output_tokens_per_second} tok/s`
                    : "Speed n/a"}
                </Badge>
                <Badge variant="outline" className="font-mono text-xs font-normal tabular-nums">
                  {benchmark?.time_to_first_token != null
                    ? `${benchmark.time_to_first_token}s to first token`
                    : "First token n/a"}
                </Badge>
              </div>
            </div>

            {cmp && (
              <div className="min-w-0 flex-1 space-y-3 border-t border-border/50 pt-6 lg:border-t-0 lg:border-l lg:border-border/50 lg:pl-8 lg:pt-0">
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Compare model
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  <span className="font-medium text-foreground">{modelLabelB}</span>
                  {benchmarkB ? (
                    <>
                      {" "}
                      — median output speed{" "}
                      <span className="font-mono tabular-nums text-foreground/90">
                        {benchmarkB.median_output_tokens_per_second}
                      </span>{" "}
                      tokens/s; time to first token{" "}
                      <span className="font-mono tabular-nums text-foreground/90">
                        {benchmarkB.time_to_first_token}
                      </span>
                      s.
                    </>
                  ) : (
                    <> — no public benchmark row matched this model id.</>
                  )}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="font-mono text-xs font-normal tabular-nums">
                    {benchmarkB
                      ? `${benchmarkB.median_output_tokens_per_second} tok/s`
                      : "Speed n/a"}
                  </Badge>
                  <Badge variant="outline" className="font-mono text-xs font-normal tabular-nums">
                    {benchmarkB?.time_to_first_token != null
                      ? `${benchmarkB.time_to_first_token}s to first token`
                      : "First token n/a"}
                  </Badge>
                </div>
              </div>
            )}

            <div className="flex shrink-0 flex-col gap-4 lg:w-[min(100%,280px)]">
              <div className="rounded-xl border border-border/70 bg-background/80 px-4 py-4">
                <p className="mb-3 border-b border-border/50 pb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Benchmark (current)
                </p>
                <div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      Intelligence
                    </p>
                    <p className="mt-1 font-mono text-lg font-semibold tabular-nums">
                      {benchmark?.intelligence_index != null
                        ? benchmark.intelligence_index.toFixed(1)
                        : "—"}
                    </p>
                  </div>
                </div>
              </div>
              {cmp && (
                <div className="rounded-xl border border-border/70 bg-background/80 px-4 py-4">
                  <p className="mb-3 border-b border-border/50 pb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Benchmark (compare)
                  </p>
                  <div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                        Intelligence
                      </p>
                      <p
                        className={cn(
                          "mt-1 font-mono text-lg font-semibold tabular-nums",
                          benchmark && benchmarkB &&
                            benchmark.intelligence_index != null &&
                            benchmarkB.intelligence_index != null
                            ? compareToneWrapper(
                                benchmarkB.intelligence_index - benchmark.intelligence_index,
                                false
                              )
                            : "text-foreground"
                        )}
                      >
                        {benchmarkB?.intelligence_index != null
                          ? benchmarkB.intelligence_index.toFixed(1)
                          : "—"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {state.reportLoading && (
          <div
            className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-background/80 px-6 backdrop-blur-[2px] dark:bg-background/85"
            aria-live="polite"
          >
            <div className="flex w-full max-w-sm flex-col gap-3">
              <Skeleton className="h-4 w-[68%]" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[82%]" />
              <Skeleton className="mt-2 h-10 w-40" />
            </div>
            <p className="text-center text-xs font-medium tracking-wide text-muted-foreground">
              Updating your report…
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
