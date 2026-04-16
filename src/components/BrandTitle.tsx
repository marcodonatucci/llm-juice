import { cn } from "@/lib/utils";
export function BrandTitle({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex select-none items-center gap-2.5 font-bold text-2xl tracking-tight text-primary md:text-[1.7rem]",
        className
      )}
    >
      <img
        src="/image.png"
        alt="LLM Juice icon"
        className="size-10 shrink-0 object-contain"
      />
      <span className="inline-block">LLM Juice</span>
    </span>
  );
}
