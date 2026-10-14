"use client";

import { Check } from "lucide-react";

export const PIPELINE_STAGES = [
  { id: "connect", label: "Connect", hint: "Where the data lives" },
  { id: "survey", label: "Survey", hint: "What am I dealing with?" },
  { id: "understand", label: "Understand", hint: "Sample & confirm" },
  { id: "adapt", label: "Adapt", hint: "Per-source parsers" },
  { id: "reconcile", label: "Reconcile", hint: "Find overlap" },
  { id: "expand", label: "Expand", hint: "What it unlocks" },
] as const;

export function PipelineStepper({
  current,
  onSelect,
}: {
  current: number;
  onSelect: (index: number) => void;
}) {
  return (
    <ol className="scroll-soft flex items-center gap-1 overflow-x-auto">
      {PIPELINE_STAGES.map((stage, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <li key={stage.id} className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => onSelect(index)}
              aria-current={active ? "step" : undefined}
              className={`group flex items-center gap-2 rounded-full border px-2.5 py-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
                active
                  ? "border-transparent bg-accent text-canvas"
                  : done
                    ? "border-line bg-surface text-ink hover:bg-elevated"
                    : "border-line bg-transparent text-muted hover:bg-elevated"
              }`}
            >
              <span
                className={`inline-flex h-5 w-5 items-center justify-center rounded-full font-mono text-[0.6rem] ${
                  active
                    ? "bg-canvas/20 text-canvas"
                    : done
                      ? "bg-online/15 text-online"
                      : "bg-elevated text-muted"
                }`}
              >
                {done ? <Check className="h-3 w-3" /> : index + 1}
              </span>
              <span className="font-mono text-[0.62rem] font-medium uppercase tracking-[0.1em]">
                {stage.label}
              </span>
            </button>
            {index < PIPELINE_STAGES.length - 1 ? (
              <span
                className={`h-px w-4 sm:w-6 ${
                  done ? "bg-online/50" : "bg-line-strong"
                }`}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
