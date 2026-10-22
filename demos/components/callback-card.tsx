"use client";

import { useState } from "react";
import type { Callback } from "@/lib/types";
import { CheckCircle2, PhoneCall } from "lucide-react";

export function CallbackCard({
  callback,
  onConfirm,
}: {
  callback: Callback;
  onConfirm?: (choice: "yes" | "no", phone: string) => void;
}) {
  const [entering, setEntering] = useState(false);
  const [draft, setDraft] = useState("");

  const digits = draft.replace(/\D/g, "");
  const canConfirm = digits.length >= 7;

  if (callback.status === "done") {
    const confirmed = callback.confirmedPhone ?? callback.phone;
    return (
      <div className="overflow-hidden rounded-2xl border border-line-strong bg-surface">
        <div className="flex items-center justify-between border-b border-line bg-elevated/60 px-4 py-2.5">
          <span className="font-mono text-[0.66rem] font-medium uppercase tracking-[0.14em] text-muted">
            Callback Request
          </span>
          <span className="inline-flex items-center gap-1.5 font-mono text-[0.66rem] uppercase tracking-[0.1em] text-online">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Scheduled
          </span>
        </div>
        <div className="flex items-start gap-3 px-4 py-3.5">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-online/15 text-online">
            <PhoneCall className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-[0.9rem] font-medium text-ink">
              A senior controls specialist will call {confirmed}
            </p>
            <p className="mt-0.5 text-[0.8rem] text-ink-soft">
              Usually within {callback.sla}. The briefing is attached to this
              case.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-line-strong bg-surface">
      <div className="flex items-center justify-between border-b border-line bg-elevated/60 px-4 py-2.5">
        <span className="font-mono text-[0.66rem] font-medium uppercase tracking-[0.14em] text-muted">
          Callback Request
        </span>
        <span className="inline-flex items-center gap-1.5 font-mono text-[0.66rem] uppercase tracking-[0.1em] text-amber">
          <PhoneCall className="h-3.5 w-3.5" />
          Awaiting Confirmation
        </span>
      </div>

      <div className="space-y-3 px-4 py-3.5">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-soft text-amber">
            <PhoneCall className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-[0.9rem] font-medium text-ink">
              Is this the best number to reach you on right now?
            </p>
            <p className="mt-0.5 font-mono text-[0.95rem] font-semibold tracking-[0.02em] text-ink">
              {callback.phone}
            </p>
          </div>
        </div>

        {!entering ? (
          <div className="flex flex-wrap gap-2 border-t border-line pt-3">
            <button
              type="button"
              onClick={() => onConfirm?.("yes", callback.phone)}
              className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 font-mono text-[0.68rem] font-medium uppercase tracking-[0.12em] text-canvas transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            >
              <PhoneCall className="h-3.5 w-3.5" />
              Yes, call this number
            </button>
            <button
              type="button"
              onClick={() => setEntering(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-canvas px-3.5 py-1.5 font-mono text-[0.66rem] font-medium uppercase tracking-[0.12em] text-ink transition-colors hover:bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            >
              No, use a different number
            </button>
          </div>
        ) : (
          <div className="space-y-2 border-t border-line pt-3">
            <label
              htmlFor="callback-number"
              className="block font-mono text-[0.62rem] font-medium uppercase tracking-[0.14em] text-muted"
            >
              Best callback number
            </label>
            <div className="flex flex-wrap gap-2">
              <input
                id="callback-number"
                type="tel"
                inputMode="tel"
                autoFocus
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && canConfirm) {
                    event.preventDefault();
                    onConfirm?.("no", draft.trim());
                  }
                }}
                placeholder="+1 (555) 000-0000"
                className="min-w-0 flex-1 rounded-lg border border-line-strong bg-canvas px-3 py-2 font-mono text-[0.9rem] text-ink placeholder:text-muted focus:border-accent/40 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => onConfirm?.("no", draft.trim())}
                disabled={!canConfirm}
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 font-mono text-[0.68rem] font-medium uppercase tracking-[0.12em] text-canvas transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                Confirm number
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
