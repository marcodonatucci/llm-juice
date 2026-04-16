const OUT_CAP = 8192;
const REASONING_OUT_CAP = 16384;
const OUT_FLOOR = 32;

export type OutputTokenQuantiles = {
  /** Central planning scenario: typical completion length prior. */
  p50: number;
  /** Upper planning guardrail: high-but-plausible completion length (not a hard max). */
  p90: number;
};

type IntentFlags = {
  longForm: boolean;
  shortForm: boolean;
  codeHeavy: boolean;
  reasoningHeavy: boolean;
};

function intentFromPrompt(prompt: string): IntentFlags {
  const t = prompt.trim().toLowerCase();
  return {
    longForm: /\b(list|enumerate|bullet|outline|detailed|comprehensive|step[\s-]by[\s-]step|essay|explain\s+in\s+detail)\b/.test(
      t
    ),
    shortForm: /\b(translate|summarize|summary|tldr|one\s+sentence|yes\s+or\s+no|single\s+word)\b/.test(
      t
    ),
    codeHeavy: /\b(code|function|implement|refactor|debug)\b/.test(t),
    reasoningHeavy:
      /\b(reason|reasoning|think\s+step|step[\s-]by[\s-]step|prove|formal|derivation)\b/.test(t),
  };
}

function isReasoningModel(modelId?: string): boolean {
  if (!modelId) return false;
  const id = modelId.toLowerCase();
  return (
    /\bo1\b|\bo3\b|r1|reasoner|reasoning/.test(id) ||
    (id.includes("deepseek") && id.includes("r1"))
  );
}

/** Base output / input ratio from context length (long prompts often imply summarization / extraction). */
function baseRatio(inputTokens: number): number {
  if (inputTokens < 35) return 0.58;
  if (inputTokens < 160) return 0.48;
  if (inputTokens > 2800) return 0.26;
  if (inputTokens > 1200) return 0.32;
  return 0.42;
}

function intentBoost(flags: IntentFlags): number {
  let boost = 1;
  if (flags.longForm) boost *= 1.22;
  if (flags.shortForm) boost *= 0.72;
  if (flags.codeHeavy) boost = Math.max(boost, 1.12);
  return boost;
}

/**
 * p50: central estimate from prompt length + intent keywords (planning prior, not a model prediction).
 * p90: multiplicative tail on top of p50, widened or narrowed by intent — mimics reporting
 * output-token p90 / p50 ratios seen in generic chat workloads when traces are unavailable.
 */
export function estimateOutputTokenQuantiles(
  inputTokens: number,
  prompt: string,
  modelId?: string
): OutputTokenQuantiles {
  if (inputTokens <= 0) return { p50: 0, p90: 0 };

  const flags = intentFromPrompt(prompt);
  const reasoningMode = isReasoningModel(modelId) || flags.reasoningHeavy;
  const ratio = baseRatio(inputTokens) * intentBoost(flags);
  const cap = reasoningMode ? REASONING_OUT_CAP : OUT_CAP;
  let p50 = Math.min(cap, Math.max(OUT_FLOOR, Math.round(inputTokens * ratio)));
  if (reasoningMode) {
    p50 = Math.min(cap, Math.round(p50 * 1.45));
  }

  // Tail multiplier: ~1.7× median-style output is a common conservative band for undifferentiated chat;
  // long-form tasks widen tail; short answers tighten it.
  let tail = 1.72;
  if (flags.longForm) tail += 0.38;
  if (flags.shortForm) tail -= 0.28;
  if (flags.codeHeavy) tail += 0.22;
  if (reasoningMode) tail += 0.46;
  tail = Math.min(2.45, Math.max(1.38, tail));

  const p90Raw = Math.max(p50 + 48, Math.round(p50 * tail));
  const p90 = Math.min(cap, Math.max(p50, p90Raw));

  return { p50, p90 };
}

/** @deprecated Prefer {@link estimateOutputTokenQuantiles} for explicit uncertainty bands. */
export function estimateOutputTokens(inputTokens: number, prompt: string): number {
  return estimateOutputTokenQuantiles(inputTokens, prompt).p50;
}
