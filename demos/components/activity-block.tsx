"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Brain, Check, ChevronDown } from "lucide-react";
import { CubeLoader } from "./cube-loader";
import { Elapsed } from "./elapsed";
import type { ActivityStep } from "@/lib/types";

function StepRow({ step }: { step: ActivityStep }) {
  return (
    <div className="flex items-center gap-2.5 py-0.5 font-mono text-[0.74rem] leading-relaxed">
      <span className="flex h-4 w-4 shrink-0 items-center justify-center">
        {step.state === "done" ? (
          <Check className="h-3.5 w-3.5 text-online" />
        ) : step.state === "running" ? (
          <CubeLoader size={16} />
        ) : (
          <span className="h-2 w-2 rounded-full border border-line-strong" />
        )}
      </span>
      <span className={step.state === "pending" ? "text-muted/70" : "text-ink-soft"}>
        {step.label}
      </span>
      {step.state === "running" && step.startedAt ? (
        <Elapsed from={step.startedAt} className="ml-auto pl-3 text-muted" />
      ) : null}
      {step.state === "done" ? (
        <span className="ml-auto pl-3 text-muted">
          {(step.ms / 1000).toFixed(1)}s
        </span>
      ) : null}
    </div>
  );
}

export function ActivityBlock({
  steps,
  seconds,
  streaming = false,
}: {
  steps: ActivityStep[];
  seconds: number;
  streaming?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const expanded = streaming || open;

  if (streaming) {
    return (
      <div className="overflow-hidden rounded-2xl rounded-bl-md border border-dashed border-line-strong bg-elevated/70">
        <div className="flex items-center gap-2.5 px-4 py-2.5">
          <CubeLoader size={20} />
          <span className="font-mono text-[0.72rem] font-medium uppercase tracking-[0.1em] text-muted">
            Working…
          </span>
        </div>
        <div className="scroll-soft max-h-72 space-y-0.5 overflow-y-auto border-t border-line px-4 py-3">
          {steps.map((step, index) => (
            <StepRow key={`${index}-${step.label}`} step={step} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl rounded-bl-md border border-dashed border-line-strong bg-elevated/70">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 px-4 py-2.5 text-left transition-colors hover:bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
      >
        <Brain className="h-4 w-4 text-amber" />
        <span className="font-mono text-[0.72rem] font-medium uppercase tracking-[0.1em] text-muted">
          Worked for {seconds} {seconds === 1 ? "second" : "seconds"}
        </span>
        <span className="ml-auto inline-flex items-center gap-1 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-muted">
          {expanded ? "Collapse" : `${steps.length} steps`}
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform duration-200 ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </span>
      </button>

      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.div
            key="steps"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="scroll-soft max-h-72 space-y-0.5 overflow-y-auto border-t border-line px-4 py-3">
              {steps.map((step, index) => (
                <StepRow key={`${index}-${step.label}`} step={step} />
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
