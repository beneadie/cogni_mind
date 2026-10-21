"use client";

// PURPOSE: Step list showing how a ticket was classified: rules fired, words matched, classifier version.
// ROLE: component. USED BY: ticket-review.tsx.
// Look-alike of Support's ActivityBlock, but rendered at once from the real classifier output: no timers, no fake durations.

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, ListChecks, Quote } from "lucide-react";
import type { ClassifyResponse } from "../lib/contracts";

/** Collapsible "How was this identified?" block; closed by default so the matching detail is there only when asked for. */
export function ClassificationSteps({ response }: { response: ClassifyResponse }) {
  const [open, setOpen] = useState(false);
  const stepCount = response.rulesFired.length + response.evidence.length;

  return (
    <div className="overflow-hidden rounded-2xl border border-dashed border-line-strong bg-elevated/70">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 px-4 py-2.5 text-left transition-colors hover:bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
      >
        <ListChecks className="h-4 w-4 text-amber" />
        <span className="font-mono text-[0.72rem] font-medium uppercase tracking-[0.1em] text-muted">How was this identified?</span>
        <span className="ml-auto inline-flex items-center gap-1 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-muted">
          {open ? "Collapse" : `${stepCount} steps`}
          <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="steps"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <ol className="space-y-1 border-t border-line px-4 py-3 font-mono text-[0.74rem] leading-relaxed">
              {response.evidence.map((item, index) => (
                <li key={`evidence-${index}`} className="flex items-start gap-2.5">
                  <Quote className="mt-1 h-3 w-3 shrink-0 text-gold" />
                  <span className="text-ink-soft">
                    matched <mark className="rounded-sm bg-gold/20 px-0.5 text-ink">{item.span}</mark> → {item.cue}
                  </span>
                </li>
              ))}
              {response.rulesFired.map((rule, index) => (
                <li key={`rule-${index}`} className="flex items-start gap-2.5">
                  <Check className="mt-1 h-3 w-3 shrink-0 text-online" />
                  <span className="text-ink-soft">{rule}</span>
                </li>
              ))}
              <li className="pt-1 text-[0.66rem] uppercase tracking-[0.1em] text-muted">Rule-based demo classifier · {response.classifierVersion}</li>
            </ol>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
