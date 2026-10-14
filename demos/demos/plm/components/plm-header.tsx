import { Brand } from "@/components/brand";
import { DemoNav } from "@/components/demo-nav";
import { Boxes, RotateCcw } from "lucide-react";

export function PlmHeader({
  showRestart,
  onRestart,
}: {
  showRestart: boolean;
  onRestart: () => void;
}) {
  return (
    <header className="relative z-50 flex items-center justify-between gap-4 border-b border-line bg-surface/90 px-4 py-2 backdrop-blur sm:px-5">
      <div className="flex items-center gap-3">
        <DemoNav />
        <span className="h-6 w-px bg-line-strong" />
        <Brand />
        <span className="hidden h-6 w-px bg-line-strong sm:block" />
        <div className="hidden sm:block">
          <p className="text-[0.86rem] font-medium leading-none text-ink">
            PLM Document Intelligence
          </p>
          <p className="mt-0.5 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-muted">
            ACS · Door Hardware
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="hidden items-center gap-1.5 rounded-full border border-line px-2.5 py-1 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-muted lg:inline-flex">
          <Boxes className="h-3 w-3 text-gold" />
          Prototype · Mock data
        </span>

        {showRestart ? (
          <button
            type="button"
            onClick={onRestart}
            className="inline-flex items-center gap-1.5 rounded-full border border-line-strong px-3 py-1.5 font-mono text-[0.62rem] font-medium uppercase tracking-[0.12em] text-ink transition-colors hover:bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Restart
          </button>
        ) : null}
      </div>
    </header>
  );
}
