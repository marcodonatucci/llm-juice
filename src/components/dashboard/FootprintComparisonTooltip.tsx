"use client";

import type { EcoFootprint } from "@/lib/greenops/emissions";
import {
  COMPARISON_SOURCE_NOTES,
  carbonAnalogyG,
  energyAnalogyWh,
  waterAnalogyMl,
} from "@/lib/greenops/real-world-comparisons";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";

type Metric = "energy" | "water" | "carbon";

type Props = {
  footprint: EcoFootprint;
  metric: Metric;
};

function analogyFor(footprint: EcoFootprint, metric: Metric) {
  switch (metric) {
    case "energy":
      return energyAnalogyWh(footprint.energy_wh);
    case "water":
      return waterAnalogyMl(footprint.water_ml);
    case "carbon":
      return carbonAnalogyG(footprint.carbon_g);
  }
}

const label: Record<Metric, string> = {
  energy: "energy (typical reply)",
  water: "evaporative water (typical reply)",
  carbon: "CO₂e (typical reply)",
};

export function FootprintComparisonTooltip({ footprint, metric }: Props) {
  const analogy = analogyFor(footprint, metric);
  if (!analogy) return null;

  return (
    <Tooltip>
      <TooltipTrigger
        render={(triggerProps) => (
          <button
            {...triggerProps}
            type="button"
            className={cn(
              "ml-auto inline-flex shrink-0 text-muted-foreground/70 hover:text-foreground",
              triggerProps.className
            )}
            aria-label={`Real-world comparison for ${label[metric]}`}
          >
            <Info className="size-3.5" strokeWidth={2.25} aria-hidden />
          </button>
        )}
      />
      <TooltipContent
        side="top"
        className="!flex !max-w-[min(22rem,calc(100vw-2rem))] !flex-col !items-stretch !gap-2 !text-left"
      >
        <p className="text-sm leading-snug text-background">{analogy.sentence}</p>
        <p className="border-t border-background/25 pt-2 text-[11px] leading-relaxed text-background/70">
          {COMPARISON_SOURCE_NOTES[analogy.sourceKey]}
        </p>
        <p className="text-[10px] leading-relaxed text-background/60">
          Ballpark only (EIA, Bundesnetzagentur, EEA, EPA WaterSense, FINA). Longer-reply values
          scale about proportionally.
        </p>
      </TooltipContent>
    </Tooltip>
  );
}
