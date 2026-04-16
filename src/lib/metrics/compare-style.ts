import { cn } from "@/lib/utils";

/** For cost / footprint: lower is better → comparison lower than primary is green. */
export function compareToneClass(delta: number, lowerIsBetter: boolean): string {
  if (!Number.isFinite(delta) || Math.abs(delta) < 1e-14) {
    return "text-muted-foreground";
  }
  const better = lowerIsBetter ? delta < 0 : delta > 0;
  return better
    ? "text-emerald-600 dark:text-emerald-400"
    : "text-red-600 dark:text-red-500";
}

export function compareToneWrapper(delta: number, lowerIsBetter: boolean): string {
  return cn("rounded-md px-1.5 py-0.5 font-mono tabular-nums", compareToneClass(delta, lowerIsBetter));
}
