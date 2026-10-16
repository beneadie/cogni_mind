"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CircleDot, X } from "lucide-react";
import type { FlagAction, FlagActionOutcome, FlagDetail } from "../lib/types";
import { STATE_META } from "./field-state";
import { MANUAL_STATE_META } from "./manual-state";

function headerMeta(detail: FlagDetail) {
  if (detail.kind === "manual-change") {
    const meta = MANUAL_STATE_META[detail.changeType];
    return {
      label: meta.label,
      icon: meta.icon,
      chip: meta.chip,
      className: meta.className,
    };
  }
  return STATE_META[detail.kind];
}

function CompareRow({ label, value, source }: { label: string; value: string; source: string }) {
  return (
    <div className="rounded-xl border border-line bg-elevated/50 px-3.5 py-3">
      <p className="font-mono text-[0.6rem] font-medium uppercase tracking-[0.14em] text-muted">
        {label}
      </p>
      <p className="mt-1 text-[0.92rem] font-medium text-ink">{value}</p>
      <p className="mt-0.5 font-mono text-[0.66rem] text-muted">Source: {source}</p>
    </div>
  );
}

export function FlagDrawer({
  detail,
  onClose,
  onAction,
}: {
  detail: FlagDetail | null;
  onClose: () => void;
  onAction: (
    flagId: string,
    outcome: FlagActionOutcome,
    value?: string,
  ) => void;
}) {
  const meta = detail ? headerMeta(detail) : null;
  const Icon = meta?.icon;
  const [entry, setEntry] = useState<{ id: string; action: FlagAction } | null>(
    null,
  );
  const [draft, setDraft] = useState("");
  const entering = detail && entry && entry.id === detail.id ? entry.action : null;

  return (
    <AnimatePresence>
      {detail && meta && Icon ? (
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex justify-end bg-forest/30 backdrop-blur-sm"
        >
          <motion.aside
            key="panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            onClick={(event) => event.stopPropagation()}
            className="flex h-full w-full max-w-md flex-col border-l border-line-strong bg-surface shadow-[0_24px_60px_-24px_rgba(26,24,21,0.45)]"
            role="dialog"
            aria-modal="true"
            aria-label={`${detail.field} flag`}
          >
            <header className="flex items-center gap-3 border-b border-line px-4 py-3">
              <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${meta.chip}`}>
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className={`font-mono text-[0.62rem] font-medium uppercase tracking-[0.16em] ${meta.className}`}>
                  {meta.label}
                </p>
                <p className="truncate text-[0.9rem] font-medium text-ink">
                  {detail.field}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close flag"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-line text-muted transition-colors hover:bg-elevated hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="scroll-soft flex-1 space-y-5 overflow-y-auto px-5 py-5">
              {detail.kind === "conflict" ? (
                <div className="space-y-3">
                  <CompareRow
                    label="Published data sheet says"
                    value={detail.published.value}
                    source={detail.published.source}
                  />
                  <CompareRow
                    label="Engineering spec says"
                    value={detail.spec.value}
                    source={detail.spec.source}
                  />
                </div>
              ) : null}

              {detail.kind === "manual-change" ? (
                <div className="space-y-3">
                  {detail.from ? (
                    <CompareRow
                      label="Current manual says"
                      value={detail.from.value}
                      source={detail.from.source}
                    />
                  ) : null}
                  {detail.to ? (
                    <CompareRow
                      label="Drafted update"
                      value={detail.to.value}
                      source={detail.to.source}
                    />
                  ) : null}
                </div>
              ) : null}

              {detail.kind === "carried-over" ? (
                <CompareRow
                  label="Published data sheet carries"
                  value={detail.published.value}
                  source={detail.published.source}
                />
              ) : null}

              {detail.kind === "low-confidence" ? (
                <div>
                  <p className="font-mono text-[0.6rem] font-medium uppercase tracking-[0.14em] text-muted">
                    Candidate readings
                  </p>
                  <ul className="mt-2 space-y-2">
                    {detail.candidates.map((candidate) => (
                      <li
                        key={candidate.value}
                        className="rounded-xl border border-line bg-elevated/50 px-3.5 py-2.5"
                      >
                        <div className="flex items-baseline justify-between gap-3">
                          <span className="text-[0.9rem] font-medium text-ink">
                            {candidate.value}
                          </span>
                          <span className="font-mono text-[0.66rem] text-ink-soft">
                            {Math.round(candidate.confidence * 100)}%
                          </span>
                        </div>
                        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-line">
                          <div
                            className="h-full rounded-full bg-gold"
                            style={{ width: `${candidate.confidence * 100}%` }}
                          />
                        </div>
                        <p className="mt-1 font-mono text-[0.62rem] text-muted">
                          {candidate.source}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <p className="whitespace-pre-line text-[0.86rem] leading-relaxed text-ink-soft">
                {detail.body}
              </p>

              {detail.kind === "missing" ? (
                <div>
                  <p className="font-mono text-[0.6rem] font-medium uppercase tracking-[0.14em] text-muted">
                    Suggested sources
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {detail.sources.map((source) => (
                      <li
                        key={source}
                        className="flex items-start gap-2 text-[0.82rem] leading-snug text-ink-soft"
                      >
                        <CircleDot className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
                        {source}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>

            <footer className="border-t border-line bg-elevated/40 px-5 py-3.5">
              {entering ? (
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    const value = draft.trim();
                    if (!value) return;
                    onAction(detail.id, "resolve", value);
                    setEntry(null);
                  }}
                  className="space-y-2.5"
                >
                  <label className="block font-mono text-[0.6rem] font-medium uppercase tracking-[0.14em] text-muted">
                    {entering.label} · {detail.field}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      autoFocus
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      placeholder="Type a value…"
                      className="min-w-0 flex-1 rounded-xl border border-line-strong bg-canvas px-3 py-2 text-[0.84rem] text-ink placeholder:text-muted focus:border-accent/40 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={!draft.trim()}
                      className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 font-mono text-[0.66rem] font-medium uppercase tracking-[0.12em] text-canvas transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                    >
                      Apply
                    </button>
                    <button
                      type="button"
                      onClick={() => setEntry(null)}
                      className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-canvas px-3.5 py-2 font-mono text-[0.66rem] font-medium uppercase tracking-[0.12em] text-ink transition-colors hover:bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  {detail.actions.map((action) => (
                    <button
                      key={action.label}
                      type="button"
                      onClick={() => {
                        if (action.input) {
                          setEntry({ id: detail.id, action });
                          setDraft("");
                          return;
                        }
                        onAction(detail.id, action.outcome ?? "resolve", action.value);
                      }}
                      className={
                        action.primary
                          ? "inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 font-mono text-[0.66rem] font-medium uppercase tracking-[0.12em] text-canvas transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                          : "inline-flex items-center gap-2 rounded-full border border-line-strong bg-canvas px-3.5 py-2 font-mono text-[0.66rem] font-medium uppercase tracking-[0.12em] text-ink transition-colors hover:bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                      }
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </footer>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
