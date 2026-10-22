"use client";

import { useState } from "react";
import { Check, ShieldCheck, X } from "lucide-react";
import type {
  PermissionDecision,
  PermissionRequest,
} from "../lib/flow";

const DECISION_LABEL: Record<PermissionDecision, string> = {
  once: "Allowed once",
  always: "Always allowed",
  deny: "Declined",
};

export function PermissionCard({
  request,
  onDecision,
}: {
  request: PermissionRequest;
  onDecision: (decision: PermissionDecision) => void;
}) {
  const [decision, setDecision] = useState<PermissionDecision | null>(null);

  const decide = (next: PermissionDecision) => {
    if (decision) return;
    setDecision(next);
    onDecision(next);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gold/50 bg-surface">
      <div className="flex items-center gap-2.5 border-b border-line bg-gold/10 px-4 py-2.5">
        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-amber/30 bg-amber-soft text-amber">
          <ShieldCheck className="h-3.5 w-3.5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[0.58rem] font-medium uppercase tracking-[0.14em] text-amber">
            Permission requested
          </p>
          <p className="mt-0.5 truncate text-[0.84rem] font-medium text-ink">
            {request.title}
          </p>
        </div>
        {request.readOnly ? (
          <span className="hidden shrink-0 rounded-full border border-line-strong bg-canvas px-2.5 py-1 font-mono text-[0.52rem] uppercase tracking-[0.08em] text-muted sm:inline-flex">
            Read-only
          </span>
        ) : null}
      </div>

      <div className="space-y-3 px-4 py-3.5">
        <p className="text-[0.8rem] leading-relaxed text-ink-soft">
          {request.detail}
        </p>
        <ul className="space-y-1.5">
          {request.items.map((item) => (
            <li
              key={item}
              className="flex items-start gap-2 text-[0.78rem] leading-snug text-ink-soft"
            >
              <Check className="mt-0.5 h-3 w-3 shrink-0 text-online" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-line bg-elevated/40 px-4 py-3.5">
        {decision ? (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[0.58rem] font-medium uppercase tracking-[0.08em] ${
              decision === "deny"
                ? "border-line-strong bg-canvas text-muted"
                : "border-online/40 bg-online/10 text-online"
            }`}
          >
            {decision === "deny" ? (
              <X className="h-3 w-3" />
            ) : (
              <Check className="h-3 w-3" />
            )}
            {DECISION_LABEL[decision]}
          </span>
        ) : (
          <>
            <button
              type="button"
              onClick={() => decide("once")}
              className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 font-mono text-[0.62rem] font-medium uppercase tracking-[0.1em] text-canvas transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            >
              Allow once
            </button>
            <button
              type="button"
              onClick={() => decide("always")}
              className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-canvas px-3.5 py-2 font-mono text-[0.62rem] font-medium uppercase tracking-[0.1em] text-ink transition-colors hover:bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            >
              Allow always
            </button>
            <button
              type="button"
              onClick={() => decide("deny")}
              className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-canvas px-3.5 py-2 font-mono text-[0.62rem] font-medium uppercase tracking-[0.1em] text-danger transition-colors hover:bg-danger-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/40"
            >
              Don&apos;t allow
            </button>
          </>
        )}
      </div>
    </div>
  );
}
