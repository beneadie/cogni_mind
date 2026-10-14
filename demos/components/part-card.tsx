import { Package, Search } from "lucide-react";

export function PartCard({
  partNumber,
  description,
  onCheckAvailability,
}: {
  partNumber: string;
  description: string;
  onCheckAvailability?: () => void;
}) {
  return (
    <div className="rounded-2xl border border-line-strong bg-surface p-4">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-soft text-amber">
          <Package className="h-4.5 w-4.5" />
        </span>
        <div className="min-w-0">
          <p className="font-mono text-[0.62rem] font-medium uppercase tracking-[0.14em] text-muted">
            Identified Part
          </p>
          <p className="mt-1 font-mono text-[0.95rem] font-semibold tracking-[0.02em] text-ink">
            {partNumber}
          </p>
          <p className="mt-0.5 text-[0.82rem] text-ink-soft">{description}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onCheckAvailability?.()}
        className="mt-3.5 inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-canvas px-3.5 py-1.5 font-mono text-[0.66rem] font-medium uppercase tracking-[0.12em] text-ink transition-colors hover:bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
      >
        <Search className="h-3.5 w-3.5" />
        Check Availability
      </button>
    </div>
  );
}
