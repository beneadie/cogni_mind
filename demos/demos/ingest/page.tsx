"use client";

import { useCallback, useState } from "react";
import type { ComponentType } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { CommandProvider } from "./components/command-context";
import { IngestHeader } from "./components/ingest-header";
import { PIPELINE_STAGES } from "./components/pipeline-stepper";
import { StageConnect } from "./stages/stage-connect";
import { StageSurvey } from "./stages/stage-survey";
import { StageUnderstand } from "./stages/stage-understand";
import { StageAdapt } from "./stages/stage-adapt";
import { StageReconcile } from "./stages/stage-reconcile";
import { StageExpand } from "./stages/stage-expand";

const STAGES: ComponentType<{ stageIndex: number }>[] = [
  StageConnect,
  StageSurvey,
  StageUnderstand,
  StageAdapt,
  StageReconcile,
  StageExpand,
];

export default function IngestDemo() {
  const [stage, setStage] = useState(0);
  const [runKey, setRunKey] = useState(0);

  const goTo = useCallback((next: number) => {
    setStage(Math.max(0, Math.min(STAGES.length - 1, next)));
  }, []);

  const replay = useCallback(() => setRunKey((key) => key + 1), []);

  const reset = useCallback(() => {
    setStage(0);
    setRunKey((key) => key + 1);
  }, []);

  const Stage = STAGES[stage];
  const atStart = stage === 0;
  const atEnd = stage === STAGES.length - 1;

  return (
    <CommandProvider>
      <div className="flex h-dvh flex-col bg-canvas">
        <IngestHeader stage={stage} onStage={goTo} onReset={reset} />

        <div className="min-h-0 flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${stage}-${runKey}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="h-full"
            >
              <Stage stageIndex={stage} />
            </motion.div>
          </AnimatePresence>
        </div>

        <footer className="shrink-0 border-t border-line bg-surface/90 px-4 py-3 backdrop-blur sm:px-5">
          <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => goTo(stage - 1)}
              disabled={atStart}
              className="inline-flex items-center gap-1.5 rounded-full border border-line-strong px-3.5 py-1.5 font-mono text-[0.62rem] font-medium uppercase tracking-[0.12em] text-ink transition-colors hover:bg-elevated disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Back
            </button>

            <div className="flex items-center gap-3">
              <span className="hidden font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted sm:inline">
                Step {stage + 1} / {STAGES.length} · {PIPELINE_STAGES[stage].hint}
              </span>
              <button
                type="button"
                onClick={replay}
                className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-muted transition-colors hover:bg-elevated hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Replay
              </button>
            </div>

            <button
              type="button"
              onClick={() => goTo(stage + 1)}
              disabled={atEnd}
              className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-1.5 font-mono text-[0.62rem] font-medium uppercase tracking-[0.12em] text-canvas transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            >
              Continue
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </footer>
      </div>
    </CommandProvider>
  );
}
