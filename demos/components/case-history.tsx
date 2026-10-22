import { MessageSquarePlus, PanelLeftClose } from "lucide-react";

export function CaseHistory({
  onNewCase,
  onCollapse,
}: {
  onNewCase: () => void;
  onCollapse?: () => void;
}) {
  return (
    <aside className="flex h-full flex-col border-r border-line bg-elevated/40">
      <div className="flex items-center justify-between border-b border-line px-3 py-2.5">
        <span className="font-mono text-[0.6rem] font-medium uppercase tracking-[0.16em] text-muted">
          Chat History
        </span>
        {onCollapse ? (
          <button
            type="button"
            onClick={onCollapse}
            aria-label="Hide chat history"
            className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <div className="border-b border-line px-3 py-3">
        <button
          type="button"
          onClick={onNewCase}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-line-strong bg-surface px-3 py-2 font-mono text-[0.66rem] font-medium uppercase tracking-[0.12em] text-ink transition-colors hover:bg-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          <MessageSquarePlus className="h-3.5 w-3.5" />
          New case
        </button>
      </div>

      <div className="scroll-soft flex-1 overflow-y-auto px-3 py-4" />
    </aside>
  );
}
