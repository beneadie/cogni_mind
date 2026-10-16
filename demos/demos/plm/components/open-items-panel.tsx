"use client";

import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  CircleSlash,
  Clock,
  PanelRightClose,
  ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { QueueItem, QueueSeverity, QueueStatus } from "../lib/types";

const STATUS_META: Record<
  Exclude<QueueStatus, "open">,
  { label: string; icon: LucideIcon; className: string }
> = {
  tracking: { label: "Tracking", icon: Clock, className: "text-amber" },
  resolved: { label: "Resolved", icon: CheckCircle2, className: "text-online" },
  declined: { label: "Declined", icon: CircleSlash, className: "text-muted" },
  acknowledged: {
    label: "Acknowledged",
    icon: ShieldCheck,
    className: "text-muted",
  },
};

const SEVERITY_META: Record<
  QueueSeverity,
  { icon: LucideIcon; dot: string; label: string; className: string }
> = {
  red: {
    icon: AlertCircle,
    dot: "bg-danger",
    label: "Action needed",
    className: "text-danger",
  },
  amber: {
    icon: Clock,
    dot: "bg-amber",
    label: "Review",
    className: "text-amber",
  },
  green: {
    icon: CheckCircle2,
    dot: "bg-online",
    label: "Resolved",
    className: "text-online",
  },
};

function ItemCard({
  item,
  active,
  onSelect,
}: {
  item: QueueItem;
  active: boolean;
  onSelect: (item: QueueItem) => void;
}) {
  const meta = SEVERITY_META[item.severity];
  const closed = item.status !== "open";
  const status = closed
    ? STATUS_META[item.status as Exclude<QueueStatus, "open">]
    : null;
  const StatusIcon = status?.icon;

  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(item)}
        aria-current={active ? "true" : undefined}
        className={`w-full rounded-xl border px-3 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
          active
            ? "border-accent/50 bg-surface"
            : "border-line bg-surface/70 hover:border-line-strong hover:bg-surface"
        } ${closed ? "opacity-70" : ""}`}
      >
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex h-4 w-4 shrink-0 items-center justify-center ${
              status ? status.className : meta.className
            }`}
          >
            {StatusIcon ? (
              <StatusIcon className="h-3.5 w-3.5" />
            ) : (
              <span className={`h-2.5 w-2.5 rounded-full ${meta.dot}`} />
            )}
          </span>
          <span
            className={`font-mono text-[0.56rem] font-medium uppercase tracking-[0.12em] ${
              closed ? "text-muted" : meta.className
            }`}
          >
            {item.type}
          </span>
          <span className="ml-auto font-mono text-[0.56rem] uppercase tracking-[0.1em] text-muted">
            {item.scope}
          </span>
        </div>

        <p className="mt-1.5 text-[0.8rem] leading-snug text-ink">
          {item.summary}
        </p>

        <div className="mt-2 flex items-center gap-1.5 font-mono text-[0.58rem] font-medium uppercase tracking-[0.1em] text-ink-soft">
          {status && StatusIcon ? (
            <>
              <StatusIcon className={`h-3 w-3 ${status.className}`} />
              {status.label}
            </>
          ) : (
            <>
              {item.action}
              <ArrowRight className="h-3 w-3" />
            </>
          )}
        </div>
      </button>
    </li>
  );
}

export function OpenItemsPanel({
  items,
  activeId,
  onSelect,
  onCollapse,
}: {
  items: QueueItem[];
  activeId: string | null;
  onSelect: (item: QueueItem) => void;
  onCollapse?: () => void;
}) {
  const open = items.filter((item) => item.status === "open");
  const done = items.filter((item) => item.status !== "open");

  return (
    <aside className="flex h-full flex-col border-l border-line bg-elevated/40">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <div className="flex items-center gap-2">
          <p className="font-mono text-[0.68rem] font-medium uppercase tracking-[0.16em] text-ink">
            Open items
          </p>
          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full border border-line-strong px-1.5 font-mono text-[0.6rem] text-muted">
            {open.length}
          </span>
        </div>
        {onCollapse ? (
          <button
            type="button"
            onClick={onCollapse}
            aria-label="Hide open items"
            className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            <PanelRightClose className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <div className="scroll-soft flex-1 space-y-4 overflow-y-auto px-3 py-4">
        {open.length > 0 ? (
          <ul className="space-y-2">
            {open.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                active={item.id === activeId}
                onSelect={onSelect}
              />
            ))}
          </ul>
        ) : (
          <p className="px-1 text-[0.78rem] leading-relaxed text-muted">
            Nothing open. Nice work.
          </p>
        )}

        {done.length > 0 ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-1">
              <span className="font-mono text-[0.58rem] font-medium uppercase tracking-[0.16em] text-muted">
                Closed
              </span>
              <span className="h-px flex-1 bg-line" />
            </div>
            <ul className="space-y-2">
              {done.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  active={item.id === activeId}
                  onSelect={onSelect}
                />
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
