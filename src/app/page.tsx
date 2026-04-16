import { PromptInput } from "@/components/dashboard/PromptInput";
import { MetricsDashboard } from "@/components/dashboard/MetricsDashboard";
import { ForecastingSlider } from "@/components/dashboard/ForecastingSlider";
import { ExportCard } from "@/components/dashboard/ExportCard";

export default function Home() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      <section className="border-b border-border/60 bg-gradient-to-b from-muted/40 to-background">
        <div className="container mx-auto max-w-4xl px-4 py-10 md:px-8 md:py-14">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            AI FinOps &amp; GreenOps
          </p>
          <h1 className="mt-3 text-balance font-semibold tracking-tight text-3xl md:text-4xl lg:text-[2.5rem] lg:leading-[1.12]">
            See what one LLM request costs, in dollars and rough environmental terms.
          </h1>
          <p className="mt-4 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
            Pick a model from the live OpenRouter catalog, paste a prompt, and get token
            counts, matching cost
            and footprint ranges. Scale monthly with the slider; export a share card for decks
            or case studies.
          </p>
          <ul className="mt-8 flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-x-8 sm:gap-y-2">
            <li className="flex items-center gap-2">
              <span className="size-1.5 shrink-0 rounded-full bg-foreground/40" aria-hidden />
              Live list pricing
            </li>
            <li className="flex items-center gap-2">
              <span className="size-1.5 shrink-0 rounded-full bg-foreground/40" aria-hidden />
              Typical vs higher-estimate reply length (for budgeting)
            </li>
            <li className="flex items-center gap-2">
              <span className="size-1.5 shrink-0 rounded-full bg-foreground/40" aria-hidden />
              Optional Arena benchmarks
            </li>
          </ul>
        </div>
      </section>

      <section className="relative flex-1 bg-background pb-16">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-muted/50 to-transparent" />
        <div className="relative z-10 mx-auto max-w-4xl">
          <PromptInput />
          <MetricsDashboard />
          <div className="mx-auto max-w-4xl px-4">
            <ForecastingSlider />
          </div>
          <ExportCard />
        </div>
      </section>
    </div>
  );
}
