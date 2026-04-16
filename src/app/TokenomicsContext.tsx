"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";
import { flushSync } from "react-dom";
import {
  ModelPricing,
  ModelListEntry,
  calculateCost,
  fetchModelsCatalog,
} from "@/lib/finops/pricing";
import { calculateEmissions, EcoFootprint } from "@/lib/greenops/emissions";
import { estimateOutputTokenQuantiles } from "@/lib/finops/estimate-output";
import { getEncoding } from "js-tiktoken";

export interface BenchmarkData {
  id: string;
  name: string;
  intelligence_index: number;
  median_output_tokens_per_second: number;
  time_to_first_token: number;
}

export type ComparisonSnapshot = {
  modelId: string;
  cost: {
    inputCost: number;
    outputCostP50: number;
    outputCostP90: number;
    totalCostP50: number;
    totalCostP90: number;
  };
  footprintP50: EcoFootprint;
  footprintP90: EcoFootprint;
};

export interface TokenomicsState {
  promptText: string;
  selectedModel: string;
  inputTokens: number;
  outputTokensP50: number;
  outputTokensP90: number;
  cost: {
    inputCost: number;
    outputCostP50: number;
    outputCostP90: number;
    totalCostP50: number;
    totalCostP90: number;
  };
  footprintP50: EcoFootprint | null;
  footprintP90: EcoFootprint | null;
  modelsData: Record<string, ModelPricing> | null;
  modelsList: ModelListEntry[] | null;
  arenaData: BenchmarkData[] | null;
  benchmarksStatus: "idle" | "disabled" | "error" | "ready";
  benchmarksMessage: string | null;
  pricingSource: string | null;
  reportLoading: boolean;
  reportRunId: number;
  /** Second model for same prompt; cost & footprint differ by model. */
  comparison: ComparisonSnapshot | null;
}

type MetricsSlice = Pick<
  TokenomicsState,
  | "promptText"
  | "selectedModel"
  | "inputTokens"
  | "outputTokensP50"
  | "outputTokensP90"
  | "cost"
  | "footprintP50"
  | "footprintP90"
>;

/** Count prompt tokens for display; same encoding as analysis. */
export function countInputTokens(text: string): number {
  try {
    const enc = getEncoding("cl100k_base");
    return enc.encode(text).length;
  } catch {
    return Math.ceil(text.length / 4);
  }
}

function buildMetricsSlice(
  text: string,
  model: string,
  pricingData: Record<string, ModelPricing> | null
): MetricsSlice {
  const tokens = countInputTokens(text);
  const { p50: outP50, p90: outP90 } = estimateOutputTokenQuantiles(tokens, text, model);

  let cost = {
    inputCost: 0,
    outputCostP50: 0,
    outputCostP90: 0,
    totalCostP50: 0,
    totalCostP90: 0,
  };
  if (pricingData) {
    const c50 = calculateCost(model, tokens, outP50, pricingData);
    const c90 = calculateCost(model, tokens, outP90, pricingData);
    cost = {
      inputCost: c50.inputCost,
      outputCostP50: c50.outputCost,
      outputCostP90: c90.outputCost,
      totalCostP50: c50.totalCost,
      totalCostP90: c90.totalCost,
    };
  }

  const footprintP50 = calculateEmissions(model, tokens + outP50);
  const footprintP90 = calculateEmissions(model, tokens + outP90);

  return {
    promptText: text,
    selectedModel: model,
    inputTokens: tokens,
    outputTokensP50: outP50,
    outputTokensP90: outP90,
    cost,
    footprintP50,
    footprintP90,
  };
}

function buildComparisonSnapshot(
  text: string,
  comparisonModelId: string,
  pricingData: Record<string, ModelPricing> | null
): ComparisonSnapshot {
  const slice = buildMetricsSlice(text, comparisonModelId, pricingData);
  return {
    modelId: comparisonModelId,
    cost: slice.cost,
    footprintP50: slice.footprintP50!,
    footprintP90: slice.footprintP90!,
  };
}

/** Merge primary metrics slice and refresh or drop comparison. */
function applyPrimaryMetrics(prev: TokenomicsState, slice: MetricsSlice): TokenomicsState {
  if (slice.inputTokens === 0) {
    return { ...prev, ...slice, comparison: null };
  }
  if (!prev.comparison) {
    return { ...prev, ...slice };
  }
  if (prev.comparison.modelId === slice.selectedModel) {
    return { ...prev, ...slice, comparison: null };
  }
  if (!prev.modelsData) {
    return { ...prev, ...slice };
  }
  return {
    ...prev,
    ...slice,
    comparison: buildComparisonSnapshot(slice.promptText, prev.comparison.modelId, prev.modelsData),
  };
}

const MIN_REPORT_SKELETON_MS = 420;

interface TokenomicsContextType {
  state: TokenomicsState;
  setPromptText: (text: string) => void;
  setSelectedModel: (model: string) => void;
  commitPromptAnalysis: (text: string) => void;
  setComparisonModel: (modelId: string | null) => void;
  fetchInitialData: () => Promise<void>;
  isDataLoaded: boolean;
}

const TokenomicsContext = createContext<TokenomicsContextType | undefined>(undefined);

const DEFAULT_MODEL = "openai/gpt-4o";

export const TokenomicsProvider = ({ children }: { children: ReactNode }) => {
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [state, setState] = useState<TokenomicsState>({
    promptText: "",
    selectedModel: DEFAULT_MODEL,
    inputTokens: 0,
    outputTokensP50: 0,
    outputTokensP90: 0,
    cost: {
      inputCost: 0,
      outputCostP50: 0,
      outputCostP90: 0,
      totalCostP50: 0,
      totalCostP90: 0,
    },
    footprintP50: null,
    footprintP90: null,
    modelsData: null,
    modelsList: null,
    arenaData: null,
    benchmarksStatus: "idle",
    benchmarksMessage: null,
    pricingSource: null,
    reportLoading: false,
    reportRunId: 0,
    comparison: null,
  });

  const reportLoadingEndRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (reportLoadingEndRef.current) clearTimeout(reportLoadingEndRef.current);
    };
  }, []);

  const fetchInitialData = async () => {
    try {
      const [catalog, benchmarks] = await Promise.all([
        fetchModelsCatalog(),
        fetch("/api/benchmarks")
          .then((res) => res.json())
          .catch(() => ({
            models: [],
            status: "error",
            message: "Could not reach the benchmarks API from the browser.",
          })),
      ]);

      const map = catalog.map;

      const benchModels = Array.isArray(benchmarks.models) ? benchmarks.models : [];
      const benchStatus = benchmarks.status as string | undefined;
      const benchmarksStatus =
        benchStatus === "disabled"
          ? "disabled"
          : benchStatus === "error"
            ? "error"
            : "ready";
      const benchmarksMessage =
        typeof benchmarks.message === "string"
          ? benchmarks.message
          : typeof benchmarks.error === "string"
            ? benchmarks.error
            : null;

      setIsDataLoaded(true);

      setState((prev) => {
        let sel = prev.selectedModel;
        if (!map[sel]) {
          sel = map[DEFAULT_MODEL] ? DEFAULT_MODEL : catalog.list[0]?.id ?? DEFAULT_MODEL;
        }
        const slice = buildMetricsSlice(prev.promptText, sel, map);
        return applyPrimaryMetrics(
          {
            ...prev,
            modelsData: map,
            modelsList: catalog.list,
            arenaData: benchModels,
            benchmarksStatus,
            benchmarksMessage,
            pricingSource: catalog.source ?? null,
            selectedModel: sel,
            reportLoading: false,
          },
          slice
        );
      });
    } catch (err) {
      console.error("Initialization error:", err);
    }
  };

  const setPromptText = useCallback((text: string) => {
    setState((prev) => {
      const slice = buildMetricsSlice(text, prev.selectedModel, prev.modelsData);
      return applyPrimaryMetrics({ ...prev, reportLoading: false }, slice);
    });
  }, []);

  const setSelectedModel = useCallback((model: string) => {
    setState((prev) => {
      const slice = buildMetricsSlice(prev.promptText, model, prev.modelsData);
      return applyPrimaryMetrics({ ...prev, reportLoading: false }, slice);
    });
  }, []);

  const setComparisonModel = useCallback((modelId: string | null) => {
    setState((prev) => {
      if (!modelId || !prev.modelsData || prev.inputTokens === 0) {
        return { ...prev, comparison: null };
      }
      if (modelId === prev.selectedModel) {
        return { ...prev, comparison: null };
      }
      return {
        ...prev,
        comparison: buildComparisonSnapshot(prev.promptText, modelId, prev.modelsData),
      };
    });
  }, []);

  const commitPromptAnalysis = useCallback((text: string) => {
    if (reportLoadingEndRef.current) {
      clearTimeout(reportLoadingEndRef.current);
      reportLoadingEndRef.current = null;
    }

    flushSync(() => {
      setState((prev) => ({ ...prev, reportLoading: true }));
    });

    const t0 = typeof performance !== "undefined" ? performance.now() : 0;

    setState((prev) => {
      const slice = buildMetricsSlice(text, prev.selectedModel, prev.modelsData);
      const merged = applyPrimaryMetrics({ ...prev, reportLoading: true }, slice);
      return { ...merged, reportLoading: true };
    });

    const elapsed =
      typeof performance !== "undefined" ? performance.now() - t0 : MIN_REPORT_SKELETON_MS;
    const remaining = Math.max(0, MIN_REPORT_SKELETON_MS - elapsed);

    reportLoadingEndRef.current = setTimeout(() => {
      reportLoadingEndRef.current = null;
      setState((prev) => ({
        ...prev,
        reportLoading: false,
        reportRunId: prev.inputTokens > 0 ? prev.reportRunId + 1 : prev.reportRunId,
      }));
    }, remaining);
  }, []);

  return (
    <TokenomicsContext.Provider
      value={{
        state,
        setPromptText,
        setSelectedModel,
        commitPromptAnalysis,
        setComparisonModel,
        fetchInitialData,
        isDataLoaded,
      }}
    >
      {children}
    </TokenomicsContext.Provider>
  );
};

export const useTokenomics = () => {
  const context = useContext(TokenomicsContext);
  if (!context) throw new Error("useTokenomics must be used within a TokenomicsProvider");
  return context;
};
