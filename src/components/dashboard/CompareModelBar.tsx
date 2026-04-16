"use client";

import { useTokenomics } from "@/app/TokenomicsContext";
import { Button, buttonVariants } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";
import { ChevronsUpDown, Plus, X } from "lucide-react";
import { useState } from "react";

export function CompareModelBar() {
  const { state, setComparisonModel } = useTokenomics();
  const [open, setOpen] = useState(false);

  const list = state.modelsList ?? [];
  const cmp = state.comparison;
  const compareLabel =
    list.find((m) => m.id === cmp?.modelId)?.name ?? cmp?.modelId ?? "Compare";

  return (
    <div className="mb-3 flex flex-wrap items-center justify-end gap-2 md:mb-4">
      {cmp ? (
        <>
          <span className="max-w-[min(100%,14rem)] truncate rounded-lg border border-border/70 bg-muted/30 px-2.5 py-1 text-xs text-muted-foreground">
            vs{" "}
            <span className="font-medium text-foreground">{compareLabel}</span>
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-1 rounded-lg text-xs"
            onClick={() => setComparisonModel(null)}
          >
            <X className="size-3.5" aria-hidden />
            Clear compare
          </Button>
        </>
      ) : null}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          type="button"
          disabled={state.inputTokens === 0}
          className={cn(
            buttonVariants({
              variant: cmp ? "secondary" : "outline",
              size: "sm",
            }),
            "h-8 gap-1.5 px-3 text-xs font-semibold shadow-sm disabled:opacity-50"
          )}
        >
          <Plus className="size-3.5" strokeWidth={2.5} aria-hidden />
          Compare +
          <ChevronsUpDown className="size-3 opacity-60" aria-hidden />
        </PopoverTrigger>
        <PopoverContent align="end" className="w-[min(calc(100vw-2rem),22rem)] p-0 shadow-lg">
          <Command shouldFilter>
            <CommandInput placeholder="Search model to compare…" className="h-9" />
            <CommandList>
              <CommandEmpty>No model found.</CommandEmpty>
              <CommandGroup heading="Same prompt, different model">
                {list
                  .filter((m) => m.id !== state.selectedModel)
                  .map((m) => (
                    <CommandItem
                      key={m.id}
                      value={m.id}
                      keywords={[m.name, m.id]}
                      onSelect={() => {
                        setComparisonModel(m.id);
                        setOpen(false);
                      }}
                      className={cn(cmp?.modelId === m.id && "bg-muted/80 font-medium")}
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

      {cmp ? (
        <p className="w-full text-right text-[10px] leading-snug text-muted-foreground">
          Colored compare rows:{" "}
          <span className="font-medium text-emerald-600 dark:text-emerald-400">green</span>{" "}
          = lower cost or footprint than current;{" "}
          <span className="font-medium text-red-600 dark:text-red-400">red</span> = higher. Arena
          Elo / Intelligence: higher is better.
        </p>
      ) : null}
    </div>
  );
}
