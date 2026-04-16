"use client";

import { countInputTokens, useTokenomics } from "@/app/TokenomicsContext";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ArrowUp, ChevronsUpDown, CornerDownLeft, Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

export function PromptInput() {
  const { state, setSelectedModel, commitPromptAnalysis, fetchInitialData, isDataLoaded } =
    useTokenomics();
  const formRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (!isDataLoaded) {
      fetchInitialData();
    }
  }, [isDataLoaded, fetchInitialData]);

  const adjustTextareaHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "0px";
    const max = typeof window !== "undefined" ? Math.min(window.innerHeight * 0.38, 360) : 360;
    el.style.height = `${Math.min(Math.max(el.scrollHeight, 112), max)}px`;
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [draft, adjustTextareaHeight]);

  const revealReport = useCallback(() => {
    const scrollToReport = () => {
      const report = document.getElementById("metrics-export-capture");
      if (!report) return false;

      const top = report.getBoundingClientRect().top + window.scrollY - 20;
      window.scrollTo({
        top: Math.max(0, top),
        behavior: "smooth",
      });
      return true;
    };

    if (scrollToReport()) return;

    requestAnimationFrame(() => {
      if (scrollToReport()) return;
      window.setTimeout(scrollToReport, 120);
    });
  }, []);

  const revealComposer = useCallback(() => {
    const composer = formRef.current;
    if (!composer) return;

    const rect = composer.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const margin = 20;
    const isFullyVisible = rect.top >= margin && rect.bottom <= viewportHeight - margin;

    if (isFullyVisible) return;

    const targetTop = rect.top + window.scrollY - Math.max(24, (viewportHeight - rect.height) / 2);
    window.scrollTo({
      top: Math.max(0, targetTop),
      behavior: "smooth",
    });
  }, []);

  const list = state.modelsList ?? [];
  const selectedLabel =
    list.find((m) => m.id === state.selectedModel)?.name ?? state.selectedModel;
  const draftInputTokens = countInputTokens(draft);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    commitPromptAnalysis(text);
    revealReport();
  };

  const pricingLabel =
    state.pricingSource === "openrouter"
      ? "OpenRouter"
      : state.pricingSource === "fallback"
        ? "Fallback rates"
        : "…";

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-3 mt-8 md:mt-14 px-4">
      <div className="flex items-end justify-between gap-3">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Prompt Analyzer</h1>
      </div>

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className={cn(
          "relative flex w-full flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm",
          "ring-offset-background transition-[box-shadow,border-color]",
          "focus-within:border-ring/60 focus-within:shadow-md focus-within:ring-2 focus-within:ring-ring/20"
        )}
      >
        <div className="relative bg-muted/20">
          <textarea
            ref={textareaRef}
            name="prompt"
            value={draft}
            rows={3}
            spellCheck={false}
            placeholder="Describe your task or paste a prompt…"
            className={cn(
              "w-full resize-none border-0 bg-transparent px-4 pt-4 pb-3 text-[15px] leading-relaxed",
              "text-foreground placeholder:text-muted-foreground/70",
              "outline-none focus-visible:ring-0",
              "min-h-[7.5rem] max-h-[min(40vh,22rem)] overflow-y-auto"
            )}
            onChange={(e) => {
              setDraft(e.target.value);
              requestAnimationFrame(adjustTextareaHeight);
            }}
            onFocus={revealComposer}
            onClick={revealComposer}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                const value = (e.target as HTMLTextAreaElement).value.trim();
                if (!value) return;
                commitPromptAnalysis(value);
                revealReport();
              }
            }}
          />
        </div>

        <div className="flex flex-col gap-0 border-t border-border/60 bg-muted/30">
          <div className="flex items-center justify-between gap-2 px-2 py-2 md:px-3">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger
                  type="button"
                  className={cn(
                    "inline-flex h-9 max-w-[min(100%,14rem)] shrink-0 items-center justify-between gap-2 rounded-xl border border-border/80 bg-background px-2.5 text-xs font-medium shadow-sm",
                    "hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  )}
                >
                  <span className="truncate">{selectedLabel}</span>
                  <ChevronsUpDown className="size-3.5 shrink-0 opacity-50" />
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  className="w-[min(calc(100vw-2rem),22rem)] p-0 shadow-lg"
                >
                  <Command shouldFilter>
                    <CommandInput placeholder="Search models…" className="h-9" />
                    <CommandList>
                      <CommandEmpty>No model found.</CommandEmpty>
                      <CommandGroup heading="OpenRouter">
                        {list.map((m) => (
                          <CommandItem
                            key={m.id}
                            value={m.id}
                            keywords={[m.name, m.id]}
                            onSelect={() => {
                              setSelectedModel(m.id);
                              setOpen(false);
                            }}
                            className={cn(
                              state.selectedModel === m.id && "bg-muted/80 font-medium"
                            )}
                          >
                            <span className="truncate">{m.name}</span>
                            <span className="ml-2 shrink-0 text-[10px] text-muted-foreground">
                              {m.id}
                            </span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              <div className="hidden min-w-0 items-center gap-1.5 text-[11px] text-muted-foreground sm:flex">
                <span className="truncate rounded-md bg-background/80 px-2 py-0.5 font-mono tabular-nums ring-1 ring-border/50">
                  {draftInputTokens.toLocaleString()} tok
                </span>
                <span className="truncate text-muted-foreground/80">{pricingLabel}</span>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <span className="hidden items-center gap-1 text-muted-foreground sm:inline-flex">
                <kbd className="pointer-events-none rounded-md border border-border/80 bg-background px-1.5 py-0.5 font-mono text-[10px] font-medium">
                  <CornerDownLeft className="mb-px inline size-3 align-middle" />
                  Enter
                </kbd>
                <span className="text-[10px] opacity-70">analyze</span>
                <span className="text-[10px] opacity-40">·</span>
                <kbd className="pointer-events-none rounded-md border border-border/80 bg-background px-1.5 py-0.5 font-mono text-[10px] font-medium">
                  Shift+Enter
                </kbd>
                <span className="text-[10px] opacity-70">newline</span>
              </span>

              <Tooltip>
                <TooltipTrigger
                  render={(triggerProps) => (
                    <Button
                      {...triggerProps}
                      type="submit"
                      size="icon"
                      className={cn(
                        "size-9 shrink-0 rounded-xl shadow-sm",
                        triggerProps.className
                      )}
                      disabled={!draft.trim() || state.reportLoading}
                      aria-label="Run analysis"
                    >
                      {state.reportLoading ? (
                        <Loader2 className="size-4 animate-spin" strokeWidth={2.25} />
                      ) : (
                        <ArrowUp className="size-4" strokeWidth={2.25} />
                      )}
                    </Button>
                  )}
                />
                <TooltipContent side="top">Run analysis (same as Enter)</TooltipContent>
              </Tooltip>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/40 px-3 py-1.5 text-[10px] text-muted-foreground sm:hidden">
            <span className="font-mono tabular-nums">{draftInputTokens.toLocaleString()} tokens</span>
            <span>
              {pricingLabel} · use the arrow to analyze
            </span>
          </div>
        </div>
      </form>
    </div>
  );
}
