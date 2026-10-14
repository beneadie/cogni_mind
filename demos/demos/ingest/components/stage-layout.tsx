import type { ReactNode } from "react";

export function StageLayout({
  stream,
  artifact,
  artifactLabel,
}: {
  stream: ReactNode;
  artifact: ReactNode;
  artifactLabel: string;
}) {
  return (
    <div className="grid h-full min-h-0 grid-cols-1 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
      <section className="scroll-soft min-h-0 overflow-y-auto px-4 py-6 sm:px-8">
        <div className="mx-auto w-full max-w-xl space-y-4">{stream}</div>
      </section>
      <aside className="scroll-soft min-h-0 overflow-y-auto border-t border-line bg-elevated/40 px-4 py-6 sm:px-8 lg:border-l lg:border-t-0">
        <div className="mx-auto w-full max-w-xl space-y-4">
          <p className="font-mono text-[0.62rem] font-medium uppercase tracking-[0.16em] text-muted">
            {artifactLabel}
          </p>
          {artifact}
        </div>
      </aside>
    </div>
  );
}
