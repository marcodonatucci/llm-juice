import { Skeleton } from "@/components/ui/skeleton";

/** Shimmer placeholder while an explicit “run analysis” is in flight. */
export function MetricsReportSkeleton() {
  return (
    <div
      className="mx-auto mt-12 w-full max-w-4xl px-4 pb-8"
      aria-hidden
    >
      <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm ring-1 ring-black/[0.03] dark:ring-white/[0.06]">
        <div className="border-b border-border/60 bg-muted/20 px-5 py-4 md:px-6 md:py-5">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="mt-3 h-6 w-full max-w-md" />
          <div className="mt-3 space-y-2">
            <Skeleton className="h-3 w-full max-w-xl" />
            <Skeleton className="h-3 w-full max-w-lg" />
          </div>
          <Skeleton className="mt-4 h-8 w-40 rounded-lg" />
        </div>
        <div className="grid divide-y divide-border/60 md:grid-cols-3 md:divide-x md:divide-y-0">
          {["a", "b", "c"].map((k) => (
            <section key={k} className="space-y-4 p-5 md:p-6">
              <div className="flex items-center gap-2">
                <Skeleton className="size-4 shrink-0 rounded" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-8 w-28" />
              <Skeleton className="h-3 w-36" />
            </section>
          ))}
        </div>
        <div className="border-t border-border/60 bg-muted/10 px-5 py-5 md:px-6 md:py-6">
          <div className="mb-4 flex gap-2">
            <Skeleton className="size-4 rounded" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-[85%]" />
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-28 rounded-full" />
              </div>
            </div>
            <Skeleton className="h-28 w-full shrink-0 rounded-xl lg:w-72" />
          </div>
        </div>
      </div>
    </div>
  );
}
