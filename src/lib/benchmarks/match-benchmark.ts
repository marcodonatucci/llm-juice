/** Row shape returned by `/api/benchmarks` (aligned with `BenchmarkData` in context). */
export type BenchmarkMatchRow = {
  id: string;
  name: string;
  intelligence_index: number;
  median_output_tokens_per_second: number;
  time_to_first_token: number;
};

/** Part after `org/` in OpenRouter-style ids, lowercased. */
function openRouterTail(modelId: string): string {
  const lower = modelId.toLowerCase().trim();
  const slash = lower.indexOf("/");
  return slash >= 0 ? lower.slice(slash + 1) : lower;
}

function compactKey(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Map OpenRouter slugs to substrings that often appear in Artificial Analysis ids/names.
 */
const ALIAS_NEEDLES: [RegExp, string[]][] = [
  [/gpt-4o(?!-mini)/i, ["gpt-4o", "gpt4o", "gpt-4-o"]],
  [/gpt-4o-mini/i, ["gpt-4o-mini", "gpt4omini", "4o-mini"]],
  [/claude-3\.5-sonnet|claude-3-5-sonnet/i, ["claude-3.5-sonnet", "claude35sonnet", "3.5-sonnet"]],
  [/claude-3\.5-haiku|claude-3-5-haiku/i, ["claude-3.5-haiku", "3.5-haiku"]],
  [/llama-3\.1-70b/i, ["llama-3.1-70b", "llama31-70b", "3.1-70b"]],
  [/llama-3\.1-8b/i, ["llama-3.1-8b", "3.1-8b"]],
];

function needlesForModel(modelId: string): string[] {
  const tail = openRouterTail(modelId);
  const out = new Set<string>([tail, tail.replace(/-/g, " ")]);
  for (const [re, needles] of ALIAS_NEEDLES) {
    if (re.test(modelId)) needles.forEach((n) => out.add(n));
  }
  return [...out].filter((n) => n.length >= 2);
}

/**
 * Best-effort row for Artificial Analysis payloads, which rarely use OpenRouter ids verbatim.
 */
export function matchBenchmarkForModel(
  openRouterModelId: string,
  rows: BenchmarkMatchRow[] | null | undefined
): BenchmarkMatchRow | undefined {
  if (!rows?.length) return undefined;

  const slug = openRouterModelId.toLowerCase().trim();

  const direct = rows.find((m) => {
    const mid = String(m.id).toLowerCase();
    if (mid.length < 5 || slug.length < 5) return false;
    return mid.includes(slug) || slug.includes(mid);
  });
  if (direct) return direct;

  const tail = openRouterTail(openRouterModelId);
  if (tail.length >= 3) {
    const byTail = rows.find((m) => {
      const id = String(m.id ?? "").toLowerCase();
      const name = String(m.name ?? "").toLowerCase();
      return id.includes(tail) || name.includes(tail) || name.includes(tail.replace(/-/g, " "));
    });
    if (byTail) return byTail;
  }

  const cSlug = compactKey(openRouterTail(openRouterModelId));
  if (cSlug.length >= 4) {
    const byCompact = rows.find((m) => {
      const id = compactKey(String(m.id ?? ""));
      const name = compactKey(String(m.name ?? ""));
      return id.includes(cSlug) || cSlug.includes(id) || name.includes(cSlug) || cSlug.includes(name);
    });
    if (byCompact) return byCompact;
  }

  for (const needle of needlesForModel(openRouterModelId)) {
    if (needle.length < 3) continue;
    const hit = rows.find((m) => {
      const hay = `${m.id} ${m.name}`.toLowerCase();
      return hay.includes(needle.toLowerCase());
    });
    if (hit) return hit;
  }

  return undefined;
}
