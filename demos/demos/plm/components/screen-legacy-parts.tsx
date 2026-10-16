import { Camera, DoorClosed, Search } from "lucide-react";
import { legacyParts, legacyQuery } from "../lib/demoData";
import type { LegacyPartRow } from "../lib/types";

export function ScreenLegacyParts({
  rows = legacyParts,
  query = legacyQuery,
  onSelect,
}: {
  rows?: LegacyPartRow[];
  query?: string;
  onSelect?: (partNumber: string) => void;
}) {
  return (
    <div className="scroll-soft flex h-full min-h-0 flex-col gap-4 overflow-y-auto">
      <div className="shrink-0">
        <h1 className="font-serif text-[1.5rem] leading-tight text-ink">
          Find a Legacy Part
        </h1>
        <p className="mt-1.5 text-[0.88rem] text-ink-soft">
          Search by description, part number, or a photo of the old drawing.
        </p>
      </div>

      <div className="flex items-center gap-2 rounded-2xl border border-line-strong bg-surface p-1.5 pl-4">
        <Search className="h-4 w-4 shrink-0 text-muted" />
        <input
          type="text"
          defaultValue={query}
          placeholder='Try "brass latch 2-3/8 backset 1980s"'
          aria-label="Search legacy parts"
          className="min-w-0 flex-1 bg-transparent py-2 text-[0.9rem] text-ink placeholder:text-muted focus:outline-none"
        />
        <button
          type="button"
          aria-label="Search by photo"
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl border border-line-strong bg-canvas px-3 font-mono text-[0.62rem] font-medium uppercase tracking-[0.1em] text-ink-soft transition-colors hover:bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          <Camera className="h-3.5 w-3.5" />
          Photo
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line-strong bg-surface">
        <div className="flex items-center justify-between border-b border-line bg-elevated/50 px-4 py-2.5">
          <span className="font-mono text-[0.6rem] font-medium uppercase tracking-[0.14em] text-muted">
            Results
          </span>
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.1em] text-muted">
            {rows.length} matches
          </span>
        </div>

        <ul className="divide-y divide-line">
          {rows.map((part) => (
            <li
              key={part.partNumber}
              className="flex flex-wrap items-center gap-4 px-4 py-3.5 transition-colors hover:bg-elevated/50"
            >
              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-line-strong bg-canvas text-ink-soft">
                <DoorClosed className="h-5 w-5" />
              </span>

              <div className="min-w-0 flex-1">
                <p className="font-mono text-[0.84rem] font-semibold tracking-[0.02em] text-ink">
                  {part.partNumber}
                </p>
                <p className="mt-0.5 truncate text-[0.82rem] text-ink-soft">
                  {part.description}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {part.matchedOn.map((reason) => (
                    <span
                      key={reason}
                      className="inline-flex items-center rounded-full border border-line px-2 py-0.5 font-mono text-[0.54rem] uppercase tracking-[0.06em] text-muted"
                    >
                      {reason}
                    </span>
                  ))}
                </div>
              </div>

              <div className="hidden w-28 shrink-0 sm:block">
                <div className="flex items-center justify-between font-mono text-[0.62rem] uppercase tracking-[0.08em] text-muted">
                  <span>Match</span>
                  <span className="text-ink-soft">{part.matchPct}%</span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-line">
                  <div
                    className="h-full rounded-full bg-gold"
                    style={{ width: `${part.matchPct}%` }}
                  />
                </div>
              </div>

              <span className="shrink-0 font-mono text-[0.68rem] uppercase tracking-[0.08em] text-muted">
                {part.year}
              </span>

              {onSelect ? (
                <button
                  type="button"
                  onClick={() => onSelect(part.partNumber)}
                  className="shrink-0 rounded-full bg-accent px-3.5 py-1.5 font-mono text-[0.6rem] font-medium uppercase tracking-[0.1em] text-canvas transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                >
                  Select this part
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
