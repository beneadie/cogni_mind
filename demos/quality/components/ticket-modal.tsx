"use client";

// PURPOSE: Citation-style modal showing a ticket's original text with the matched words highlighted, plus tags and provenance.
// ROLE: component. USED BY: demos/quality/page.tsx (opened from alert examples and the Evidence rail).
// Look-alike of Support's PdfModal; client component for the Escape key listener and enter/exit motion.

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FileText, X } from "lucide-react";
import type { Ticket } from "../lib/contracts";
import { companyName, failureLabel, modelById, productName } from "../lib/data/catalog";
import { formatDay } from "../lib/time";
import { Chip, HighlightedText, SectionLabel, StatusTag } from "./ui";

/** Modal for one ticket; renders nothing when ticket is null. */
export function TicketModal({ ticket, onClose }: { ticket: Ticket | null; onClose: () => void }) {
  useEffect(() => {
    if (!ticket) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [ticket, onClose]);

  return (
    <AnimatePresence>
      {ticket ? (
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-forest/40 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            key="panel"
            role="dialog"
            aria-modal="true"
            aria-label={`Ticket ${ticket.id}`}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            onClick={(event) => event.stopPropagation()}
            className="flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-line-strong bg-surface shadow-[0_24px_60px_-24px_rgba(26,24,21,0.4)]"
          >
            <div className="flex items-center gap-3 border-b border-line px-4 py-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-amber-soft text-amber">
                <FileText className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[0.82rem] font-medium text-ink">
                  {ticket.id} · {companyName(ticket.companyId)}
                </p>
                <p className="font-mono text-[0.64rem] uppercase tracking-[0.1em] text-muted">
                  {formatDay(ticket.date, true)} · {ticket.kind} · {ticket.intake === "forced_choice" ? "Forced-choice form" : "Free text"}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                autoFocus
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-line text-muted transition-colors hover:bg-elevated hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                aria-label="Close ticket"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="scroll-soft space-y-4 overflow-y-auto bg-canvas px-5 py-6 sm:px-8">
              <article className="space-y-3 rounded-lg border border-line bg-surface px-6 py-6">
                <SectionLabel>Original words (unchanged)</SectionLabel>
                <HighlightedText text={ticket.text} evidence={ticket.classification?.evidence ?? []} className="font-serif text-[1.02rem] leading-relaxed text-ink" />
                {ticket.modelRaw ? <p className="font-mono text-[0.66rem] text-muted">Model field: {ticket.modelRaw}</p> : null}
                {ticket.supportCaseId ? <p className="font-mono text-[0.66rem] text-muted">Linked support case: {ticket.supportCaseId}</p> : null}
                {ticket.duplicateOf ? <p className="font-mono text-[0.66rem] text-muted">Duplicate of {ticket.duplicateOf}</p> : null}
              </article>

              <div className="flex flex-wrap items-center gap-1.5">
                <StatusTag status={ticket.tags.status} />
                <Chip>{ticket.tags.productId ? productName(ticket.tags.productId) : "Product unknown"}</Chip>
                <Chip>{ticket.tags.modelId ? modelById(ticket.tags.modelId).label : "Model unknown"}</Chip>
                <Chip>{ticket.tags.failureType ? failureLabel(ticket.tags.failureType) : "Failure unknown"}</Chip>
              </div>

              {ticket.classification ? (
                <ul className="space-y-1 font-mono text-[0.72rem] text-ink-soft">
                  {ticket.classification.evidence.map((item, index) => (
                    <li key={index}>
                      <mark className="rounded-sm bg-gold/20 px-0.5 text-ink">{item.span}</mark> → {item.cue}
                    </li>
                  ))}
                  <li className="pt-1 text-[0.64rem] uppercase tracking-[0.1em] text-muted">Demo classification · {ticket.classification.classifierVersion}</li>
                </ul>
              ) : (
                <p className="text-[0.74rem] text-muted">
                  {ticket.intake === "forced_choice" ? "Tags came from the forced-choice form; no classification step." : "Not classified yet."}
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
