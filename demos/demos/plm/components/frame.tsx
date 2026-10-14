import type { PlmScreen } from "../lib/types";
import {
  ArrowRight,
  FileSpreadsheet,
  ScanSearch,
  ShieldAlert,
  TriangleAlert,
} from "lucide-react";

export function Frame({
  onStartSpec,
  onStartDocs,
  onNavigate,
}: {
  onStartSpec: () => void;
  onStartDocs: () => void;
  onNavigate: (screen: PlmScreen) => void;
}) {
  return (
    <div className="scroll-soft mx-auto flex h-full max-w-3xl flex-col justify-center overflow-y-auto py-2">
      <p className="font-mono text-[0.62rem] font-medium uppercase tracking-[0.16em] text-muted">
        ACS · Product Lifecycle
      </p>
      <h1 className="mt-3 font-serif text-[2.1rem] leading-[1.15] text-ink sm:text-[2.5rem]">
        Turn a 1987 spec into governed product data
      </h1>
      <p className="mt-3 max-w-2xl text-[0.98rem] leading-relaxed text-ink-soft">
        ACS still builds the DL-2400 brass latch from a scanned spec. Watch the
        spec become a checked data sheet — then keep every downstream document
        current.
      </p>

      <div className="mt-7 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={onStartSpec}
          className="group flex flex-col rounded-2xl border border-gold/60 bg-amber-soft/60 p-4 text-left transition-colors hover:bg-amber-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gold/15 text-amber">
            <FileSpreadsheet className="h-4.5 w-4.5" />
          </span>
          <span className="mt-3 text-[0.95rem] font-medium text-ink">
            Spec → Data Sheet
          </span>
          <span className="mt-1 text-[0.82rem] leading-relaxed text-ink-soft">
            Turn a scanned 1987 spec into a checked, approved data sheet.
          </span>
          <span className="mt-2.5 inline-flex items-center gap-1.5 font-mono text-[0.62rem] font-medium uppercase tracking-[0.12em] text-ink">
            Start walkthrough
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </button>

        <button
          type="button"
          onClick={onStartDocs}
          className="group flex flex-col rounded-2xl border border-line-strong bg-surface p-4 text-left transition-colors hover:bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-danger-soft text-danger">
            <TriangleAlert className="h-4.5 w-4.5" />
          </span>
          <span className="mt-3 text-[0.95rem] font-medium text-ink">
            Documentation Health
          </span>
          <span className="mt-1 text-[0.82rem] leading-relaxed text-ink-soft">
            See what&apos;s out of date and fix it in one flow.
          </span>
          <span className="mt-2.5 inline-flex items-center gap-2 font-mono text-[0.62rem] font-medium uppercase tracking-[0.12em] text-ink">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-danger/40 bg-danger-soft px-2 py-0.5 text-danger">
              <span className="h-1.5 w-1.5 rounded-full bg-danger" />3 need
              updating
            </span>
          </span>
        </button>
      </div>

      <button
        type="button"
        onClick={onStartDocs}
        className="mt-3 flex flex-wrap items-center gap-3 rounded-2xl border border-danger/40 bg-danger-soft px-4 py-3 text-left transition-colors hover:bg-danger/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
      >
        <TriangleAlert className="h-4 w-4 shrink-0 text-danger" />
        <span className="min-w-0 flex-1 text-[0.84rem] text-ink">
          <span className="font-medium">3 documents need updating</span> across
          DL Series. Oldest is 4 revisions behind.
        </span>
        <span className="inline-flex items-center gap-1.5 font-mono text-[0.62rem] font-medium uppercase tracking-[0.12em] text-danger">
          Review and update
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </button>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <span className="font-mono text-[0.56rem] uppercase tracking-[0.12em] text-muted">
          Explore
        </span>
        <button
          type="button"
          onClick={() => onNavigate("regulation")}
          className="inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-canvas px-3 py-1.5 font-mono text-[0.6rem] font-medium uppercase tracking-[0.08em] text-ink-soft transition-colors hover:bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          <ShieldAlert className="h-3.5 w-3.5" />
          Portfolio risk
        </button>
        <button
          type="button"
          onClick={() => onNavigate("legacy")}
          className="inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-canvas px-3 py-1.5 font-mono text-[0.6rem] font-medium uppercase tracking-[0.08em] text-ink-soft transition-colors hover:bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          <ScanSearch className="h-3.5 w-3.5" />
          Legacy search
        </button>
      </div>
    </div>
  );
}
