import type { ManualState } from "../lib/types";
import { CirclePlus, Minus, PenLine, Equal } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const MANUAL_STATE_META: Record<
  ManualState,
  { label: string; icon: LucideIcon; className: string; chip: string; dot: string }
> = {
  unchanged: {
    label: "Unchanged",
    icon: Equal,
    className: "text-online",
    chip: "border-online/40 bg-online/10 text-online",
    dot: "bg-online",
  },
  changed: {
    label: "Changed",
    icon: PenLine,
    className: "text-amber",
    chip: "border-amber/40 bg-amber-soft text-amber",
    dot: "bg-amber",
  },
  added: {
    label: "Added",
    icon: CirclePlus,
    className: "text-amber",
    chip: "border-gold/50 bg-gold/10 text-amber",
    dot: "bg-gold",
  },
  removed: {
    label: "Removed",
    icon: Minus,
    className: "text-danger",
    chip: "border-danger/40 bg-danger-soft text-danger",
    dot: "bg-danger",
  },
};

export function ManualStateChip({ state }: { state: ManualState }) {
  const meta = MANUAL_STATE_META[state];
  const Icon = meta.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[0.56rem] font-medium uppercase tracking-[0.08em] ${meta.chip}`}
    >
      <Icon className="h-3 w-3" />
      {meta.label}
    </span>
  );
}

export function ManualStateLegend() {
  const order: ManualState[] = ["unchanged", "changed", "added", "removed"];
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
      {order.map((state) => (
        <span
          key={state}
          className="inline-flex items-center gap-1.5 font-mono text-[0.58rem] uppercase tracking-[0.08em] text-muted"
        >
          <span className={`h-2 w-2 rounded-full ${MANUAL_STATE_META[state].dot}`} />
          {MANUAL_STATE_META[state].label}
        </span>
      ))}
    </div>
  );
}
