import Link from "next/link";

const toc = [
  { id: "finops", label: "FinOps & pricing" },
  { id: "metrics", label: "PUE, WUE & carbon" },
  { id: "water", label: "Water footprint" },
  { id: "hardware", label: "Hardware & GPUs" },
  { id: "inference", label: "Training vs inference" },
  { id: "green-prompting", label: "Green prompting & RAG" },
  { id: "slms", label: "Small models & quantization" },
  { id: "pareto", label: "Pareto frontier & routing" },
  { id: "forecasting", label: "Forecasting & risk" },
  { id: "simulation-upgrades", label: "Simulation engine upgrades" },
  { id: "sources", label: "Sources" },
] as const;

function SectionCard({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <article
      id={id}
      className="scroll-mt-24 rounded-2xl border border-border/80 bg-card p-6 shadow-sm md:p-10"
    >
      <h2 className="border-b border-border/60 pb-3 text-2xl font-semibold tracking-tight text-foreground md:text-[1.65rem]">
        {title}
      </h2>
      <div className="mt-6 space-y-4 text-[17px] leading-[1.75] text-foreground/90 [&_a]:text-primary [&_a]:underline-offset-4 hover:[&_a]:underline">
        {children}
      </div>
    </article>
  );
}

function Callout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <aside className="rounded-xl border border-primary/20 bg-primary/5 px-5 py-4 md:px-6">
      <p className="text-sm font-semibold uppercase tracking-wide text-primary">{title}</p>
      <div className="mt-2 text-[15px] leading-relaxed text-foreground/90">{children}</div>
    </aside>
  );
}

export default function LearnPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-muted/30 to-background">
      <div className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-16 lg:max-w-[42rem]">
        <header className="mb-10 md:mb-14">
          <p className="text-sm font-medium text-muted-foreground">Learning hub</p>
          <h1 className="mt-2 text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            LLM FinOps, GreenOps &amp; responsible AI
          </h1>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
            A practical guide for builders and decision-makers: how{" "}
            <strong className="font-medium text-foreground/90">LLM token pricing</strong> and FinOps
            connect to <strong className="font-medium text-foreground/90">energy, water, and CO₂</strong>{" "}
            in data centers, and how to reduce cost and environmental footprint without sacrificing
            quality. Includes green prompting, small models, routing, forecasting risk, and curated
            primary sources, plus implementation notes from this app&apos;s simulation engine.
          </p>
        </header>

        <nav
          aria-label="On this page"
          className="mb-12 rounded-xl border border-border/70 bg-muted/40 p-4 md:p-5"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            On this page
          </p>
          <ul className="mt-3 flex flex-wrap gap-x-1 gap-y-2 text-sm">
            {toc.map((item, i) => (
              <li key={item.id} className="flex items-center">
                {i > 0 ? <span className="mx-1.5 text-muted-foreground/50" aria-hidden>|</span> : null}
                <a
                  href={`#${item.id}`}
                  className="rounded-md px-1.5 py-0.5 text-foreground/80 underline-offset-4 hover:bg-background hover:text-foreground hover:underline"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex flex-col gap-12 md:gap-16">
          <SectionCard id="finops" title="FinOps: why token economics are not linear">
            <p>
              API pricing is no longer a simple &quot;price per token&quot; line item. Providers split{" "}
              <strong>input</strong> and <strong>output</strong> rates because autoregressive generation
              is typically more expensive than reading the prompt. Some models also use tiered
              context pricing, batch discounts, and cached-input rates when repeated prefixes skip
              redundant compute.
            </p>
            <ul className="list-disc space-y-2 pl-5 marker:text-muted-foreground">
              <li>
                <strong>Unit economics</strong> means tracking cost per query, per workflow, and per
                customer—not only per million tokens in aggregate.
              </li>
              <li>
                <strong>Live catalogs</strong> (for example OpenRouter or community-maintained LiteLLM
                metadata) help you avoid stale spreadsheets when prices move weekly.
              </li>
              <li>
                <strong>Observability</strong> tools (Portkey, Weave, enterprise FinOps suites) attach
                metadata so you can allocate spend by product, environment, or team.
              </li>
            </ul>
            <p className="text-[15px] text-muted-foreground">
              See also:{" "}
              <a href="https://developers.openai.com/api/docs/pricing" rel="noreferrer">
                OpenAI pricing
              </a>
              ,{" "}
              <a href="https://docs.litellm.ai/docs/provider_registration/add_model_pricing" rel="noreferrer">
                LiteLLM model pricing docs
              </a>
              ,{" "}
              <a href="https://www.finops.org/wg/how-to-forecast-ai-services-costs-in-cloud/" rel="noreferrer">
                FinOps Foundation on forecasting AI spend
              </a>
              .
            </p>
          </SectionCard>

          <SectionCard id="metrics" title="GreenOps metrics: PUE, WUE, and carbon intensity">
            <p>
              Sustainability dashboards translate software into physical quantities: watt-hours of
              electricity, millilitres of water, and grams of CO₂ equivalent. Three metrics appear
              constantly in data-centre science and vendor sustainability reports.
            </p>
            <Callout title="Quick definitions">
              <ul className="mt-0 list-none space-y-2 pl-0">
                <li>
                  <strong>PUE</strong> (Power Usage Effectiveness): total facility power divided by IT
                  equipment power. A PUE of 1.0 is ideal; hyperscalers such as Google publish fleet-wide
                  averages around 1.09, while industry averages are higher.
                </li>
                <li>
                  <strong>WUE</strong> (Water Usage Effectiveness): litres of freshwater per kWh of IT
                  load—highly dependent on cooling design and climate.
                </li>
                <li>
                  <strong>Grid carbon intensity</strong>: grams CO₂e per kWh varies by region and time;
                  it is what turns electricity into a Scope 2 emissions estimate.
                </li>
              </ul>
            </Callout>
            <p>
              Academic work on LLM inference often models prompt energy as a function of GPU power,
              GPU count, processing time, and PUE—making infrastructure and geography first-class
              variables, not afterthoughts.
            </p>
            <p className="text-[15px] text-muted-foreground">
              Further reading:{" "}
              <a href="https://datacenters.google/efficiency" rel="noreferrer">
                Google data centre efficiency (PUE)
              </a>
              ;{" "}
              <a
                href="https://digitalcommons.calpoly.edu/cgi/viewcontent.cgi?filename=0&article=1117&context=ceng_surp&type=additional"
                rel="noreferrer"
              >
                Behind the Prompt (student supplement, Cal Poly)
              </a>
              ;{" "}
              <a href="https://arxiv.org/html/2505.09598v5" rel="noreferrer">
                How Hungry is AI? (arXiv)
              </a>
              .
            </p>
          </SectionCard>

          <SectionCard id="water" title="The invisible water crisis">
            <Callout title="Withdrawal vs consumption">
              <p className="mt-0">
                <strong>Withdrawal</strong> is water taken from a source and often returned warmer.
                <strong> Consumption</strong> is water lost to evaporation—for example in cooling towers
                or through the water embedded in off-site electricity generation.
              </p>
            </Callout>
            <p>
              For AI workloads, water shows up twice: <strong>on-site cooling</strong> (Scope 1 style)
              and <strong>off-site thermoelectric generation</strong> (Scope 2). Literature cited in
              industry discussions suggests off-site electricity can dominate the water footprint in
              typical grids—often well over half of the total—while on-site evaporation still matters
              in dry climates.
            </p>
            <blockquote className="border-l-4 border-primary/40 pl-4 text-[16px] italic text-muted-foreground">
              Research at UC Riverside has helped quantify conversational AI water use: a session on
              the order of tens of queries can approach hundreds of millilitres of freshwater
              equivalent—roughly a small drink of water for a conversation you might barely notice.
            </blockquote>
            <p>
              Forward-looking projections in the research literature warn that AI-driven water demand
              could reach multi-billion cubic metres annually by the end of the decade—large enough to
              compare with national water budgets. That is not a reason to panic, but a reason to{" "}
              <strong>measure, schedule, and route</strong> workloads (for example shifting flexible
              batch jobs to cooler hours or regions with cleaner grids and lower evaporative stress).
            </p>
            <p className="text-[15px] text-muted-foreground">
              Sources:{" "}
              <a href="https://arxiv.org/abs/2304.03271" rel="noreferrer">
                Making AI Less &quot;Thirsty&quot; (arXiv)
              </a>
              ;{" "}
              <a href="https://news.ucr.edu/articles/2023/04/28/ai-programs-consume-large-volumes-scarce-water" rel="noreferrer">
                UCR News on AI and water
              </a>
              ;{" "}
              <a href="https://news.ucr.edu/articles/2025/03/05/professors-ted-talk-warns-ais-hidden-water-costs" rel="noreferrer">
                UCR on hidden water costs
              </a>
              .
            </p>
          </SectionCard>

          <SectionCard id="hardware" title="Hardware matters: H100 vs A100 (and why smaller models are not always greener)">
            <p>
              Peak power is not the same as energy per useful token. A newer GPU can draw more watts
              at the wall yet finish the same generation in less time—or move more tokens per second
              at better efficiency—especially when tensor cores target reduced-precision formats used in
              inference.
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong>H100 vs A100:</strong> comparisons in vendor and third-party write-ups highlight
                large inference throughput gains; the practical lesson is to look at{" "}
                <em>tokens per second per watt</em>, not TDP alone.
              </li>
              <li>
                <strong>Routing paradox:</strong> a compact model run on older clusters can cost more
                energy per query than a flagship model on the newest silicon—so FinOps and GreenOps
                both need <em>where</em> and <em>how</em> a model runs, not only its parameter count.
              </li>
            </ul>
            <p className="text-[15px] text-muted-foreground">
              Background:{" "}
              <a href="https://lyceum.technology/magazine/a100-vs-h100-for-llm-inference/" rel="noreferrer">
                A100 vs H100 for LLM inference
              </a>
              ;{" "}
              <a href="https://gcore.com/blog/nvidia-h100-a100" rel="noreferrer">
                Gcore GPU comparison
              </a>
              .
            </p>
          </SectionCard>

          <SectionCard id="inference" title="Training vs inference—and the Jevons effect">
            <p>
              Training a frontier model can be enormous in absolute energy and water. But for successful
              products, <strong>day-to-day inference</strong> often dominates lifetime footprint because
              queries repeat at planetary scale.
            </p>
            <p>
              Efficiency gains can be partly offset by demand growth: cheaper and faster models invite
              more automation, longer contexts, and more agents. That dynamic is sometimes discussed
              alongside the <strong>Jevons paradox</strong> in economics—better efficiency does not
              automatically mean lower total resource use unless you pair it with governance.
            </p>
            <p>
              Finally, <strong>Scope 3</strong> (supply chain) matters for semiconductors: fabs, rare
              materials, logistics, and end-of-life pathways carry embodied carbon and water that
              precede your first API call.
            </p>
            <p className="text-[15px] text-muted-foreground">
              Pointers:{" "}
              <a href="https://jmoiron.net/blog/on-ai-environmental-impact" rel="noreferrer">
                On AI: environmental impact
              </a>
              ;{" "}
              <a href="https://www.interface-eu.org/publications/chip-productions-ecological-footprint" rel="noreferrer">
                Chip production ecological footprint (Interface EU)
              </a>
              ;{" "}
              <a
                href="https://images.nvidia.com/aem-dam/Solutions/documents/NVIDIA-Sustainability-Report-Fiscal-Year-2025.pdf"
                rel="noreferrer"
              >
                NVIDIA sustainability report (PDF)
              </a>
              .
            </p>
          </SectionCard>

          <SectionCard id="green-prompting" title="Green prompting, caching, and lean RAG">
            <p>
              Prompt shape changes compute: clearer constraints and structured sections reduce wasted
              decoding. Provider <strong>prompt caching</strong> rewards stable system prefixes—cutting
              both billable tokens and repeated forward passes.
        </p>
        <p>
              For retrieval-augmented generation, the classic failure mode is stuffing the context
              window with low-signal chunks. Better embeddings, reranking, and tighter chunking reduce
              tokens, latency, and energy in one move. Industry write-ups on structured data compression
              show that aggressive token reduction can coexist with accuracy when the representation
              matches the task.
            </p>
            <p className="text-[15px] text-muted-foreground">
              Practice guides:{" "}
              <a
                href="https://www.capgemini.com/insights/expert-perspectives/from-words-to-watts-how-prompting-patterns-shape-ais-environmental-impact/"
                rel="noreferrer"
              >
                Capgemini: from words to watts
              </a>
              ;{" "}
              <a href="https://arxiv.org/html/2501.05899v1" rel="noreferrer">
                Prompt engineering and energy (arXiv)
              </a>
              ;{" "}
              <a
                href="https://daloopa.com/blog/analyst-best-practices/structured-financial-data-analysis-when-llms-meet-excel-spreadsheets"
                rel="noreferrer"
              >
                Spreadsheet-style structured compression (example case study)
              </a>
              .
            </p>
          </SectionCard>

          <SectionCard id="slms" title="SLMs: distillation, quantization, and where they fit">
            <p>
              <strong>Small language models</strong> (SLMs) and compressed checkpoints exist because most
              products do not need frontier reasoning on every call. Knowledge distillation transfers
              behaviour from a teacher model into a smaller student; quantization reduces numeric
              precision to shrink memory bandwidth and speed up matmuls on modern accelerators.
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Use SLMs for classification, extraction, formatting, and guardrails.</li>
              <li>
                Reserve frontier models for ambiguity, multi-step reasoning, and high-stakes drafting
                with human review.
              </li>
            </ul>
            <p className="text-[15px] text-muted-foreground">
              Introductory material:{" "}
              <a href="https://arxiv.org/abs/2509.09947" rel="noreferrer">
                Toward green code with SLMs (arXiv)
              </a>
              ;{" "}
              <a href="https://datamites.com/blog/green-ai-guide-quantization-and-finops-to-reduce-llm-costs/" rel="noreferrer">
                Green AI, quantization, and FinOps (Datamites)
              </a>
              .
            </p>
          </SectionCard>

          <SectionCard id="pareto" title="The AI Pareto frontier and dynamic routing">
            <p>
              The <strong>Pareto frontier</strong> here means choosing models that sit on the sweet
              spot of your three-way trade-off: quality, cost, and environmental impact. Pushing for the
              last 2–5% of benchmark score often pays a disproportionate price in dollars and kWh.
            </p>
            <p>
              <strong>Dynamic routing</strong> (conceptually similar to products like RouteLLM) sends
              easy traffic to cheaper, cooler models while escalating only when classifiers or heuristics
              detect complexity. Well-tuned routing routinely cuts aggregate spend and emissions without
              users noticing—provided you measure quality on real tasks, not only on leaderboards.
            </p>
            <Callout title="Design checklist">
              <ol className="mt-2 list-decimal space-y-2 pl-5 marker:font-medium">
                <li>Log task labels and difficulty signals alongside model choice.</li>
                <li>Track cost, latency, and error rates per route—not only aggregate tokens.</li>
                <li>Re-evaluate routes monthly as models and prices change.</li>
              </ol>
            </Callout>
          </SectionCard>

          <SectionCard id="forecasting" title="Forecasting, guardrails, and probabilistic budgets">
            <p>
              Startups rarely fail because a single prompt is expensive—they fail because{" "}
              <strong>agent loops</strong>, retries, and viral growth multiply unit economics faster than
              finance can see them. A forecasting slider is not magic; it is a reminder to multiply{" "}
              <em>per-query cost</em> by realistic monthly active users and queries per user.
            </p>
            <p>
              Mature FinOps teams pair point estimates with ranges: scenario bands, anomaly detection,
              and budgets per feature flag. Research on LLM-based uncertainty and quantile methods points
              toward richer forecasts than a single deterministic line—useful when API prices and
              traffic are both volatile.
            </p>
            <p className="text-[15px] text-muted-foreground">
              Reading:{" "}
              <a href="https://amnic.com/blogs/finops-for-startups-in-the-ai-era" rel="noreferrer">
                FinOps for startups in the AI era
              </a>
              ;{" "}
              <a href="https://www.askantech.com/llm-integration-production-latency-cost-reliability-patterns/" rel="noreferrer">
                Production LLM cost and reliability patterns
              </a>
              ;{" "}
              <a
                href="https://proceedings.neurips.cc/paper_files/paper/2024/file/c5ec22711f3a4a2f4a0a8ffd92167190-Paper-Conference.pdf"
                rel="noreferrer"
              >
                LLM Processes (NeurIPS PDF)
              </a>
              .
            </p>
          </SectionCard>

          <SectionCard id="simulation-upgrades" title="Simulation engine upgrades in LLM Juice">
            <p>
              We upgraded the simulator from static heuristics to a more infrastructure-aware model.
              The goal is still planning (not metering), but the mechanisms now better reflect known
              FinOps and GreenOps behavior in production LLM systems.
            </p>
            <Callout title="What changed in the formulas">
              <ul className="mt-0 list-disc space-y-2 pl-5 marker:text-muted-foreground">
                <li>
                  <strong>Reasoning-aware output uncertainty:</strong> token quantiles now detect
                  reasoning-heavy prompts and model IDs (for example o1/o3/r1 style), widening p50/p90
                  output bands and using a larger output cap.
                </li>
                <li>
                  <strong>Dynamic throughput:</strong> energy no longer assumes one fixed tokens/sec
                  rate; it varies by inferred model class and batch-size regime.
                </li>
                <li>
                  <strong>Dynamic GPU power:</strong> we interpolate between idle-like and active-like
                  power ranges rather than treating every run as a fixed watt draw.
                </li>
                <li>
                  <strong>Region-aware cooling and water:</strong> PUE and WUE use regional lookup
                  defaults (with a global fallback) so geography can materially change results.
                </li>
              </ul>
            </Callout>
            <p>
              Remaining caveat: these are still estimators. We do not yet ingest provider-side runtime
              telemetry (real deployment region, actual hardware, cache-hit rates, or queue/batch traces),
              so values should be read as decision-support ranges rather than audited inventory numbers.
            </p>
            <p className="text-[15px] text-muted-foreground">
              See the methodology doc in this repo for exact equations and assumptions:
              {" "}
              <code>SIMULATION_METHODOLOGY.md</code>.
            </p>
          </SectionCard>

          <SectionCard id="sources" title="Sources &amp; further reading">
            <p className="text-[15px] leading-relaxed text-muted-foreground">

              Links open in a new context; prefer primary papers and official reports when auditing
              claims.
            </p>
            <ol className="mt-4 list-decimal space-y-2.5 pl-5 text-[15px] leading-relaxed marker:font-medium">
              <li>
                <a href="https://arxiv.org/html/2505.09598v5" rel="noreferrer">
                  How Hungry is AI? (energy, water, carbon of LLM inference)
                </a>
              </li>
              <li>
                <a href="https://arxiv.org/abs/2304.03271" rel="noreferrer">
                  Making AI Less &quot;Thirsty&quot; (water footprint framing)
                </a>
              </li>
              <li>
                <a href="https://ecologits.ai/latest/" rel="noreferrer">
                  EcoLogits (LCA-style inference estimates)
                </a>
              </li>
              <li>
                <a href="https://github.com/mlco2/codecarbon" rel="noreferrer">
                  CodeCarbon (local compute emissions)
                </a>
              </li>
              <li>
                <a href="https://thenewstack.io/greenops-and-finops-a-dual-strategy-for-sustainable-ai/" rel="noreferrer">
                  GreenOps + FinOps strategy (The New Stack)
                </a>
              </li>
              <li>
                <a href="https://www.oxygenit.io/blogs/deploying-ai-responsibly-with-finops-and-greenops-a-guide-for-ctos-cios-and-product-leaders" rel="noreferrer">
                  Deploying AI responsibly with FinOps and GreenOps
                </a>
              </li>
              <li>
                <a href="https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json" rel="noreferrer">
                  LiteLLM community model price JSON
                </a>
              </li>
              <li>
                <a href="https://www.spglobal.com/ratings/en/regulatory/article/sustainability-insights-behind-the-shades-data-centers-s101675322" rel="noreferrer">
                  S&amp;P Global: data centre sustainability insights
                </a>
              </li>
              <li>
                <a href="https://developers.thegreenwebfoundation.org/grid-intensity-cli/explainer/providers/" rel="noreferrer">
                  Green Web Foundation: grid intensity providers
                </a>
              </li>
            </ol>
          </SectionCard>
        </div>

        <div className="mt-14 rounded-2xl border border-dashed border-border bg-muted/30 p-6 md:p-8">
          <h2 className="text-lg font-semibold text-foreground">Try the calculator</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
            Put these ideas into numbers: open the home page to compare live model pricing, token counts,
            and footprint estimates side by side.
          </p>
          <Link
            href="/"
            className="mt-5 inline-flex h-10 items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          >
            Open the calculator
           </Link>
        </div>
      </div>
    </div>
  );
}
