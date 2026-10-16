"use client";

import { AlertTriangle } from "lucide-react";

function Emphasized({ text, emphasis }: { text: string; emphasis?: string }) {
  const index = emphasis ? text.indexOf(emphasis) : -1;
  if (index < 0 || !emphasis) return <>{text}</>;
  const before = text.slice(0, index);
  const match = text.slice(index, index + emphasis.length);
  const after = text.slice(index + emphasis.length);
  return (
    <>
      {before}
      <strong className="font-semibold text-ink">{match}</strong>
      {after}
    </>
  );
}

export function WarningBlock({
  title = "Warning",
  text,
  emphasis,
  items,
}: {
  title?: string;
  text: string;
  emphasis?: string;
  items?: string[];
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-amber/50 bg-amber-soft">
      <div className="flex items-start gap-3.5 px-4 py-3.5">
        <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber/15 text-amber">
          <AlertTriangle className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="font-mono text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-amber">
            {title}
          </p>
          <p className="mt-1 text-[0.92rem] leading-relaxed text-ink-soft">
            <Emphasized text={text} emphasis={emphasis} />
          </p>
          {items && items.length > 0 ? (
            <ul className="mt-2.5 flex flex-wrap gap-1.5">
              {items.map((item) => (
                <li
                  key={item}
                  className="inline-flex items-center rounded-full border border-amber/40 bg-canvas/60 px-2.5 py-1 font-mono text-[0.58rem] font-medium uppercase tracking-[0.08em] text-amber"
                >
                  {item}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </div>
  );
}
