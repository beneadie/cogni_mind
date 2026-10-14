"use client";

import { RotateCcw, Terminal } from "lucide-react";
import { Brand } from "@/components/brand";
import { DemoNav } from "@/components/demo-nav";
import { PipelineStepper } from "./pipeline-stepper";
import { useCommands } from "./command-context";

function CommandsToggle() {
  const { showCommands, toggle } = useCommands();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={showCommands}
      title="Reveal the agent's commands"
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[0.62rem] uppercase tracking-[0.12em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
        showCommands
          ? "border-amber/40 bg-amber-soft text-amber"
          : "border-line text-muted hover:text-ink"
      }`}
    >
      <Terminal className="h-3 w-3" />
      Commands
    </button>
  );
}

export function IngestHeader({
  stage,
  onStage,
  onReset,
}: {
  stage: number;
  onStage: (index: number) => void;
  onReset: () => void;
}) {
  return (
    <header className="relative z-50 shrink-0 border-b border-line bg-surface/90 backdrop-blur">
      <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-3">
          <DemoNav />
          <span className="h-6 w-px bg-line-strong" />
          <Brand />
          <span className="hidden h-6 w-px bg-line-strong sm:block" />
          <div className="hidden sm:block">
            <p className="text-[0.86rem] font-medium leading-none text-ink">
              Multisource Data Consolidation
            </p>
            <p className="mt-0.5 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-muted">
              Data Harmonization Workbench
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <CommandsToggle />
          <span className="hidden items-center gap-1.5 rounded-full border border-line px-2.5 py-1 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-ink-soft md:inline-flex">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-online/60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-online" />
            </span>
            Agent online
          </span>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 rounded-full border border-line-strong px-3 py-1.5 font-mono text-[0.62rem] font-medium uppercase tracking-[0.12em] text-ink transition-colors hover:bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>
      </div>

      <div className="border-t border-line px-4 py-2.5 sm:px-5">
        <PipelineStepper current={stage} onSelect={onStage} />
      </div>
    </header>
  );
}
