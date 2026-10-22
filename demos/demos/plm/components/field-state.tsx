import type { FieldState } from "../lib/types";
import {
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  MinusCircle,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const STATE_META: Record<
  FieldState,
  { label: string; icon: LucideIcon; className: string; chip: string; dot: string }
> = {
  extracted: {
    label: "Extracted",
    icon: CheckCircle2,
    className: "text-online",
    chip: "border-online/40 bg-online/10 text-online",
    dot: "bg-online",
  },
  "low-confidence": {
    label: "Low confidence",
    icon: HelpCircle,
    className: "text-amber",
    chip: "border-gold/50 bg-gold/10 text-amber",
    dot: "bg-gold",
  },
  conflict: {
    label: "Conflict",
    icon: AlertTriangle,
    className: "text-amber",
    chip: "border-amber/40 bg-amber-soft text-amber",
    dot: "bg-amber",
  },
  missing: {
    label: "Missing",
    icon: XCircle,
    className: "text-danger",
    chip: "border-danger/40 bg-danger-soft text-danger",
    dot: "bg-danger",
  },
  "carried-over": {
    label: "From last sheet",
    icon: MinusCircle,
    className: "text-muted",
    chip: "border-line-strong bg-elevated text-muted",
    dot: "bg-line-strong",
  },
};

export function StateChip({
  state,
  className = "",
}: {
  state: FieldState;
  className?: string;
}) {
  const meta = STATE_META[state];
  const Icon = meta.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[0.56rem] font-medium uppercase tracking-[0.08em] ${meta.chip} ${className}`}
    >
      <Icon className="h-3 w-3" />
      {meta.label}
    </span>
  );
}

export function StateLegend() {
  const order: FieldState[] = [
    "extracted",
    "low-confidence",
    "conflict",
    "missing",
    "carried-over",
  ];
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
      {order.map((state) => (
        <span
          key={state}
          className="inline-flex items-center gap-1.5 font-mono text-[0.58rem] uppercase tracking-[0.08em] text-muted"
        >
          <span className={`h-2 w-2 rounded-full ${STATE_META[state].dot}`} />
          {STATE_META[state].label}
        </span>
      ))}
    </div>
  );
}
