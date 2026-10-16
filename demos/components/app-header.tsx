import type { ReactNode } from "react";
import { AtSign, RotateCcw } from "lucide-react";
import { Brand } from "./brand";
import { DemoNav } from "./demo-nav";

function HumanHint() {
  return (
    <>
      <AtSign className="h-3 w-3 text-gold" />
      Type <span className="text-ink-soft">@human</span> to send this
      conversation to a human — we&apos;ll call you
    </>
  );
}

export function AppHeader({
  onReset,
  title = "HVAC Tech Support Copilot",
  subtitle = "Technical Support Console",
  hint,
  resetLabel = "Reset Demo",
}: {
  onReset: () => void;
  title?: string;
  subtitle?: string;
  hint?: ReactNode;
  resetLabel?: string;
}) {
  const hintContent = hint === undefined ? <HumanHint /> : hint;

  return (
    <header className="relative z-50 flex items-center justify-between gap-4 border-b border-line bg-surface/90 px-4 py-3 backdrop-blur sm:px-5">
      <div className="flex items-center gap-3">
        <DemoNav />
        <span className="h-6 w-px bg-line-strong" />
        <Brand />
        <span className="hidden h-6 w-px bg-line-strong sm:block" />
        <div className="hidden sm:block">
          <p className="text-[0.86rem] font-medium leading-none text-ink">
            {title}
          </p>
          <p className="mt-0.5 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-muted">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-ink-soft">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-online/60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-online" />
          </span>
          Online
        </span>

        {hintContent ? (
          <span className="hidden items-center gap-1.5 rounded-full border border-line px-2.5 py-1 font-mono text-[0.62rem] tracking-[0.04em] text-muted lg:inline-flex">
            {hintContent}
          </span>
        ) : null}

        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 rounded-full border border-line-strong px-3 py-1.5 font-mono text-[0.62rem] font-medium uppercase tracking-[0.12em] text-ink transition-colors hover:bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          {resetLabel}
        </button>
      </div>
    </header>
  );
}
