"use client";

import { AlertCircle, BellPlus, Clock, ShieldAlert } from "lucide-react";
import type { QueueItem } from "../lib/types";

const SEVERITY_META = {
  red: {
    icon: ShieldAlert,
    wrap: "border-danger/40 bg-danger-soft",
    iconClass: "text-danger",
    label: "Action needed",
  },
  amber: {
    icon: AlertCircle,
    wrap: "border-amber/40 bg-amber-soft",
    iconClass: "text-amber",
    label: "Review",
  },
  green: {
    icon: Clock,
    wrap: "border-online/30 bg-online/10",
    iconClass: "text-online",
    label: "Resolved",
  },
} as const;

export function AlertCreatedCard({ item }: { item: QueueItem }) {
  const meta = SEVERITY_META[item.severity];
  const Icon = meta.icon;

  return (
    <div className={`rounded-2xl border px-4 py-3 ${meta.wrap}`}>
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line/60 bg-surface/70">
          <Icon className={`h-4 w-4 ${meta.iconClass}`} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 font-mono text-[0.58rem] font-medium uppercase tracking-[0.12em] text-ink-soft">
            <BellPlus className="h-3 w-3" />
            New alert created
          </p>
          <p className="mt-0.5 text-[0.84rem] font-medium text-ink">
            {item.type} · {item.scope}
          </p>
        </div>
        <span className="font-mono text-[0.56rem] uppercase tracking-[0.08em] text-muted">
          {meta.label}
        </span>
      </div>
      <p className="mt-2 text-[0.8rem] leading-relaxed text-ink-soft">
        {item.summary}
      </p>
      <p className="mt-2.5 font-mono text-[0.56rem] uppercase tracking-[0.08em] text-muted">
        Added to Alerts
      </p>
    </div>
  );
}
