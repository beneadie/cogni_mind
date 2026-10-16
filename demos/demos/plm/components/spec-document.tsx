import type { SpecDoc } from "../lib/types";
import { specTitleLineId } from "../lib/demoData";
import { FileText } from "lucide-react";

export function SpecDocument({
  doc,
  highlightedLineIds,
  label = "Engineering Spec",
  showHeader = true,
}: {
  doc: SpecDoc;
  highlightedLineIds: string[];
  label?: string;
  showHeader?: boolean;
}) {
  const isLit = (id: string) => highlightedLineIds.includes(id);

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-line-strong bg-surface">
      {showHeader ? (
        <header className="flex items-center gap-2.5 border-b border-line bg-elevated/60 px-4 py-3">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-amber-soft text-amber">
            <FileText className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[0.82rem] font-medium text-ink">{label}</p>
            <p className="font-mono text-[0.62rem] uppercase tracking-[0.1em] text-muted">
              {doc.file} · {doc.revision} · {doc.date}
            </p>
          </div>
        </header>
      ) : null}

      <div className="scroll-soft min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
        <article className="rounded-lg border border-line bg-canvas px-5 py-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line pb-3">
            <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-muted">
              Engineering Specification
            </p>
            <p
              className={`rounded px-1 font-mono text-[0.6rem] uppercase tracking-[0.1em] text-muted transition-colors ${
                isLit(specTitleLineId) ? "bg-gold/25 text-ink" : ""
              }`}
            >
              p.1
            </p>
          </div>

          <h3
            className={`mt-4 rounded px-1 -mx-1 font-serif text-[1.15rem] leading-snug text-ink transition-colors ${
              isLit(specTitleLineId) ? "bg-gold/25" : ""
            }`}
          >
            {doc.title}
          </h3>
          <p className="mt-1 font-mono text-[0.72rem] tracking-[0.02em] text-ink-soft">
            {doc.revision} — {doc.date}
          </p>

          <div className="mt-5 space-y-5">
            {doc.sections.map((section) => (
              <div key={section.id}>
                <div className="flex items-baseline justify-between gap-2">
                  <p className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-ink-soft">
                    {section.heading}
                  </p>
                  <p className="font-mono text-[0.6rem] uppercase tracking-[0.08em] text-muted">
                    p.{section.page}
                  </p>
                </div>
                <div className="mt-1.5 space-y-0.5">
                  {section.lines.map((line) => (
                    <p
                      key={line.id}
                      className={`rounded px-1 -mx-1 font-mono text-[0.82rem] leading-relaxed transition-colors ${
                        isLit(line.id)
                          ? "bg-gold/25 text-ink"
                          : "text-ink-soft"
                      }`}
                    >
                      {line.text}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
