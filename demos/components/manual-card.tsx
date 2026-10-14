import type { Manual } from "@/lib/mock-data";
import { Check, FileText, Star } from "lucide-react";

export function ManualCard({
  manual,
  selected = false,
  recommended = false,
  disabled = false,
  hint = false,
  onToggle,
}: {
  manual: Manual;
  selected?: boolean;
  recommended?: boolean;
  disabled?: boolean;
  hint?: boolean;
  onToggle?: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onToggle?.(manual.id)}
      disabled={disabled}
      aria-pressed={selected}
      className={`flex flex-col rounded-xl border p-3.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:cursor-default ${
        hint && !disabled ? "hint-pulse" : ""
      } ${
        selected
          ? "border-accent/50 bg-accent-soft"
          : "border-line bg-surface enabled:hover:border-line-strong enabled:hover:bg-elevated"
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-amber-soft text-amber">
          <FileText className="h-3.5 w-3.5" />
        </span>
        <span className="font-mono text-[0.62rem] font-medium uppercase tracking-[0.12em] text-amber">
          {manual.type}
        </span>
        <span
          className={`ml-auto inline-flex h-5 w-5 items-center justify-center rounded-md border transition-colors ${
            selected
              ? "border-accent bg-accent text-canvas"
              : "border-line-strong text-transparent"
          }`}
        >
          <Check className="h-3 w-3" />
        </span>
      </div>

      {recommended ? (
        <span className="mt-2 inline-flex w-fit items-center gap-1 rounded-full border border-gold/50 bg-gold/10 px-2 py-0.5 font-mono text-[0.56rem] font-medium uppercase tracking-[0.1em] text-amber">
          <Star className="h-3 w-3" />
          Recommended
        </span>
      ) : null}

      <p className="mt-2 text-[0.82rem] font-medium leading-snug text-ink">
        {manual.title}
      </p>

      <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[0.66rem] uppercase tracking-[0.08em] text-muted">
        <span>{manual.brand}</span>
        <span>{manual.model}</span>
        <span>{manual.year}</span>
      </div>
    </button>
  );
}
