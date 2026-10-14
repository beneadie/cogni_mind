import { flowSteps } from "../lib/demoData";
import type { PlmFlow, PlmScreen } from "../lib/types";
import { Check, CornerUpLeft, Repeat } from "lucide-react";

const DETOURS: { id: PlmScreen; label: string }[] = [
  { id: "regulation", label: "Portfolio risk" },
  { id: "legacy", label: "Legacy search" },
];

export function WalkthroughRail({
  flow,
  current,
  onNavigate,
}: {
  flow: PlmFlow;
  current: PlmScreen;
  onNavigate: (screen: PlmScreen) => void;
}) {
  const steps = flowSteps[flow];
  const stepIndex = steps.findIndex((step) => step.id === current);
  const isDetour = stepIndex === -1;

  const otherFlow: PlmFlow = flow === "spec" ? "docs" : "spec";
  const otherLabel = flow === "spec" ? "Documentation health" : "Spec → Data sheet";
  const otherTarget = flowSteps[otherFlow][0].id;

  return (
    <div className="relative z-40 border-b border-line bg-surface/80 backdrop-blur">
      <div className="scroll-soft mx-auto flex max-w-6xl items-center gap-0.5 overflow-x-auto px-4 py-2 sm:px-6">
        {steps.map((step, index) => {
          const done = stepIndex > index;
          const active = stepIndex === index;
          return (
            <div key={step.id} className="flex shrink-0 items-center">
              {index > 0 ? (
                <span
                  className={`mx-1.5 h-px w-3 sm:w-6 ${
                    done || active ? "bg-line-strong" : "bg-line"
                  }`}
                />
              ) : null}
              <button
                type="button"
                onClick={() => onNavigate(step.id)}
                className="group flex items-center gap-2 rounded-full py-0.5 pr-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                <span
                  className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border font-mono text-[0.62rem] font-medium transition-colors ${
                    active
                      ? "border-accent bg-accent text-canvas"
                      : done
                        ? "border-online/40 bg-online/15 text-online"
                        : "border-line-strong text-muted group-hover:text-ink-soft"
                  }`}
                >
                  {done ? <Check className="h-3.5 w-3.5" /> : index + 1}
                </span>
                <span
                  className={`hidden font-mono text-[0.62rem] uppercase tracking-[0.08em] sm:inline ${
                    active ? "text-ink" : "text-muted group-hover:text-ink-soft"
                  }`}
                >
                  {step.label}
                </span>
              </button>
            </div>
          );
        })}

        <div className="ml-auto flex shrink-0 items-center gap-2 pl-4">
          {isDetour ? (
            <button
              type="button"
              onClick={() => onNavigate(steps[0].id)}
              className="inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-canvas px-2.5 py-1 font-mono text-[0.6rem] font-medium uppercase tracking-[0.08em] text-ink transition-colors hover:bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            >
              <CornerUpLeft className="h-3.5 w-3.5" />
              Back to walkthrough
            </button>
          ) : (
            <>
              <span className="hidden font-mono text-[0.56rem] uppercase tracking-[0.12em] text-muted lg:inline">
                Explore
              </span>
              {DETOURS.map((detour) => (
                <button
                  key={detour.id}
                  type="button"
                  onClick={() => onNavigate(detour.id)}
                  className="inline-flex items-center rounded-full border border-line px-2.5 py-1 font-mono text-[0.6rem] uppercase tracking-[0.08em] text-muted transition-colors hover:border-line-strong hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                >
                  {detour.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => onNavigate(otherTarget)}
                className="inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-canvas px-2.5 py-1 font-mono text-[0.6rem] font-medium uppercase tracking-[0.08em] text-ink transition-colors hover:bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                <Repeat className="h-3.5 w-3.5" />
                {otherLabel}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
