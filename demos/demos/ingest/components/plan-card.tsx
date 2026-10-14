"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, GitBranch, ListChecks } from "lucide-react";
import { plan } from "@/demos/ingest/lib/data";

export function PlanCard({ current }: { current: number }) {
  const [open, setOpen] = useState(true);
  const revised = plan.some(
    (phase, index) =>
      index <= current && phase.tasks.some((task) => task.revisedFrom),
  );

  return (
    <div className="rounded-2xl border border-line-strong bg-surface">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
      >
        <ListChecks className="h-4 w-4 text-amber" />
        <span className="font-mono text-[0.62rem] font-medium uppercase tracking-[0.14em] text-muted">
          Agent plan
        </span>
        {revised ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber/40 bg-amber-soft px-2 py-0.5 font-mono text-[0.54rem] uppercase tracking-[0.1em] text-amber">
            <GitBranch className="h-3 w-3" />
            revised
          </span>
        ) : null}
        <span className="ml-auto font-mono text-[0.6rem] text-muted">
          Phase {current + 1}/{plan.length}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-muted transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <ol className="space-y-1.5 px-3.5 pb-3.5 pt-0.5">
              {plan.map((phase, index) => {
                const state =
                  index < current
                    ? "done"
                    : index === current
                      ? "active"
                      : "pending";
                return (
                  <li key={phase.id}>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex h-4 w-4 items-center justify-center rounded-full font-mono text-[0.56rem] ${
                          state === "done"
                            ? "bg-online/15 text-online"
                            : state === "active"
                              ? "bg-accent text-canvas"
                              : "bg-elevated text-muted"
                        }`}
                      >
                        {state === "done" ? (
                          <Check className="h-2.5 w-2.5" />
                        ) : (
                          index + 1
                        )}
                      </span>
                      <span
                        className={`font-mono text-[0.66rem] uppercase tracking-[0.08em] ${
                          state === "pending" ? "text-muted" : "text-ink"
                        }`}
                      >
                        {phase.title}
                      </span>
                    </div>

                    {state === "active" ? (
                      <ul className="ml-2 mt-1.5 space-y-1 border-l border-line pl-3.5">
                        {phase.tasks.map((task) => (
                          <li
                            key={task.id}
                            className="text-[0.78rem] leading-snug text-ink-soft"
                          >
                            {task.revisedFrom ? (
                              <>
                                <span className="text-muted line-through decoration-amber/70">
                                  {task.revisedFrom}
                                </span>
                                <span className="ml-1.5 text-ink">
                                  → {task.text}
                                </span>
                              </>
                            ) : (
                              task.text
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                );
              })}
            </ol>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
