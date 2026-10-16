"use client";

import { Check } from "lucide-react";
import {
  FLOW_STEPS,
  STAGE_FLOW,
  STAGE_STEP,
  type PlmFlowKind,
  type PlmStage,
} from "../lib/flow";

const FLOW_LABEL: Record<PlmFlowKind, string> = {
  spec: "Spec → Data Sheet",
  docs: "Documentation Health",
  ingest: "Ingest & Connect",
  care: "Product Care",
};

export function ProgressStrip({ stage }: { stage: PlmStage }) {
  const flow = STAGE_FLOW[stage];
  if (!flow) return null;

  const steps = FLOW_STEPS[flow];
  const currentId = STAGE_STEP[stage];
  const currentIndex = steps.findIndex((step) => step.id === currentId);

  return (
    <div className="border-b border-line bg-surface/80 backdrop-blur">
      <div className="scroll-soft mx-auto flex w-full max-w-3xl items-center gap-0.5 overflow-x-auto px-4 py-2 sm:px-6">
        <span className="shrink-0 pr-2 font-mono text-[0.58rem] font-medium uppercase tracking-[0.14em] text-muted">
          {FLOW_LABEL[flow]}
        </span>
        {steps.map((step, index) => {
          const done = currentIndex > index;
          const active = currentIndex === index;
          return (
            <div key={step.id} className="flex shrink-0 items-center">
              {index > 0 ? (
                <span
                  className={`mx-1.5 h-px w-3 sm:w-5 ${
                    done || active ? "bg-line-strong" : "bg-line"
                  }`}
                />
              ) : null}
              <span className="flex items-center gap-1.5">
                <span
                  className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border font-mono text-[0.56rem] font-medium ${
                    active
                      ? "border-accent bg-accent text-canvas"
                      : done
                        ? "border-online/40 bg-online/15 text-online"
                        : "border-line-strong text-muted"
                  }`}
                >
                  {done ? <Check className="h-3 w-3" /> : index + 1}
                </span>
                <span
                  className={`hidden font-mono text-[0.58rem] uppercase tracking-[0.08em] sm:inline ${
                    active ? "text-ink" : "text-muted"
                  }`}
                >
                  {step.label}
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
