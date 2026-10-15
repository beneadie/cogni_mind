// PURPOSE: Quality's top bar: demo switcher, brand, title, "Demo data / Illustrative" badge, hint and Reset Demo.
// ROLE: component. USED BY: demos/quality/page.tsx.
// Look-alike of Support's AppHeader (its title and "Online" badge are hardcoded); imports only the shared Brand and DemoNav.

import { Info, RotateCcw } from "lucide-react";
import { Brand } from "@/components/brand";
import { DemoNav } from "@/components/demo-nav";
import { BUTTON } from "./ui";

/** Header with Reset Demo; the badge never claims a live connection. */
export function QualityHeader({ onReset }: { onReset: () => void }) {
  return (
    <header className="relative z-50 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-line bg-surface/90 px-4 py-3 backdrop-blur sm:px-5">
      <div className="flex items-center gap-3">
        <DemoNav />
        <span className="h-6 w-px bg-line-strong" />
        <Brand />
        <span className="hidden h-6 w-px bg-line-strong sm:block" />
        <div className="hidden sm:block">
          <p className="text-[0.86rem] font-medium leading-none text-ink">Quality Intelligence</p>
          <p className="mt-0.5 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-muted">Quality Control Console</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {/* DEMO-ONLY: fictional records; the badge says so instead of "Online". */}
        <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-ink-soft">
          <span className="inline-flex h-2 w-2 rounded-full bg-gold" />
          Demo data / Illustrative
        </span>

        <span className="hidden items-center gap-1.5 rounded-full border border-line px-2.5 py-1 font-mono text-[0.62rem] tracking-[0.04em] text-muted xl:inline-flex">
          <Info className="h-3 w-3 text-gold" />
          Try a sample complaint, confirm its tags, then classify historical tickets
        </span>

        <button type="button" onClick={onReset} className={BUTTON.secondary}>
          <RotateCcw className="h-3.5 w-3.5" />
          Reset Demo
        </button>
      </div>
    </header>
  );
}
