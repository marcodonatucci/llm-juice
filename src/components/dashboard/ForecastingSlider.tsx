"use client";

import { useTokenomics } from "@/app/TokenomicsContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { Layers } from "lucide-react";

export function ForecastingSlider() {
  const { state } = useTokenomics();
  const [multiplier, setMultiplier] = useState(1000);

  if (state.inputTokens === 0 || !state.footprintP50) return null;

  if (state.reportLoading) {
    return (
      <Card className="mt-10 overflow-hidden rounded-2xl border-border/80 shadow-sm ring-1 ring-black/[0.03] dark:ring-white/[0.06]">
        <CardHeader className="border-b border-border/60 bg-muted/15 px-5 py-4 md:px-6">
          <div className="flex items-center gap-2">
            <Skeleton className="size-4 rounded" />
            <Skeleton className="h-5 w-48" />
          </div>
          <Skeleton className="mt-2 h-4 w-full max-w-lg" />
        </CardHeader>
        <CardContent className="space-y-6 p-5 md:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-9 flex-1 rounded-lg" />
            <Skeleton className="h-8 w-24" />
          </div>
          <div className="grid gap-4 border-t border-border/50 pt-6 sm:grid-cols-2">
            <Skeleton className="h-24 rounded-lg" />
            <Skeleton className="h-24 rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalCostP50 = state.cost.totalCostP50 * multiplier;
  const totalCostP90 = state.cost.totalCostP90 * multiplier;
  const carbonP50Kg = (state.footprintP50.carbon_g * multiplier) / 1000;
  const carbonP90Kg = ((state.footprintP90?.carbon_g ?? state.footprintP50.carbon_g) * multiplier) / 1000;

  const fmtCost = (n: number) =>
    n > 100 ? Math.round(n).toLocaleString() : n.toFixed(2);

  const fmtCarbonKg = (kg: number) =>
    kg < 1 ? `${(kg * 1000).toFixed(0)} g` : `${kg.toFixed(1)} kg`;

  return (
    <Card className="mt-10 overflow-hidden rounded-2xl border-border/80 shadow-sm ring-1 ring-black/[0.03] dark:ring-white/[0.06]">
      <CardHeader className="border-b border-border/60 bg-muted/15 px-5 py-4 md:px-6">
        <CardTitle className="flex items-center gap-2 text-base font-semibold tracking-tight">
          <Layers className="size-4 text-muted-foreground" aria-hidden />
          Monthly projection
        </CardTitle>
        <CardDescription className="text-sm leading-relaxed">
          Same two scenarios as the report, a <strong className="font-medium text-foreground/90">typical</strong>{" "}
          reply length and a <strong className="font-medium text-foreground/90">higher estimate</strong> if
          replies run long — scaled by how many similar requests you expect per month.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 p-5 md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <span className="w-36 shrink-0 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Completions / mo
          </span>
          <Slider
            value={[multiplier]}
            min={100}
            max={500_000}
            step={100}
            className="flex-1"
            onValueChange={(vals) => {
              const next = Array.isArray(vals) ? (vals[0] ?? 100) : vals;
              setMultiplier(typeof next === "number" ? next : 100);
            }}
          />
          <span className="w-28 shrink-0 text-right font-mono text-lg font-semibold tabular-nums sm:text-xl">
            {multiplier.toLocaleString()}
          </span>
        </div>

        <div className="grid gap-6 border-t border-border/50 pt-6 sm:grid-cols-2">
          <div className="space-y-3">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Monthly cost (USD)
            </p>
            <p className="font-mono text-2xl font-semibold tabular-nums tracking-tight">
              ${fmtCost(totalCostP50)}{" "}
              <span className="text-xs font-sans font-normal text-muted-foreground">typical</span>
            </p>
            <p className="font-mono text-lg tabular-nums text-muted-foreground">
              ${fmtCost(totalCostP90)}{" "}
              <span className="text-xs font-sans text-muted-foreground">higher estimate</span>
            </p>
          </div>
          <div className="space-y-3">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Monthly CO₂e
            </p>
            <p className="font-mono text-2xl font-semibold tabular-nums tracking-tight">
              {fmtCarbonKg(carbonP50Kg)}{" "}
              <span className="text-xs font-sans font-normal text-muted-foreground">typical</span>
            </p>
            <p className="font-mono text-lg tabular-nums text-muted-foreground">
              {fmtCarbonKg(carbonP90Kg)}{" "}
              <span className="text-xs font-sans text-muted-foreground">higher estimate</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
