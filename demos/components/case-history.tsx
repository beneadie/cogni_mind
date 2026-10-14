import type { MockCase } from "@/lib/mock-data";
import { MessageSquarePlus, PanelLeftClose } from "lucide-react";

export function CaseHistory({
  cases,
  activeCaseId,
  onSelectCase,
  onNewCase,
  onCollapse,
}: {
  cases: MockCase[];
  activeCaseId: string;
  onSelectCase: (id: string) => void;
  onNewCase: () => void;
  onCollapse?: () => void;
}) {
  const groups: MockCase["group"][] = ["Today", "Previous 7 days"];

  return (
    <aside className="flex h-full flex-col border-r border-line bg-elevated/40">
      <div className="flex items-center justify-between border-b border-line px-3 py-2.5">
        <span className="font-mono text-[0.6rem] font-medium uppercase tracking-[0.16em] text-muted">
          Cases
        </span>
        {onCollapse ? (
          <button
            type="button"
            onClick={onCollapse}
            aria-label="Hide cases"
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

      <div className="scroll-soft flex-1 space-y-5 overflow-y-auto px-3 py-4">
        {groups.map((group) => {
          const groupCases = cases.filter((item) => item.group === group);
          if (groupCases.length === 0) return null;
          return (
            <div key={group} className="space-y-1.5">
              <p className="px-1 font-mono text-[0.6rem] font-medium uppercase tracking-[0.16em] text-muted">
                {group}
              </p>
              <ul className="space-y-1">
                {groupCases.map((item) => {
                  const active = item.id === activeCaseId;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => onSelectCase(item.id)}
                        className={`w-full rounded-lg border px-2.5 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
                          active
                            ? "border-accent/40 bg-surface"
                            : "border-transparent hover:bg-elevated"
                        }`}
                      >
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="truncate text-[0.78rem] font-medium text-ink">
                            {item.title}
                          </span>
                          <span className="shrink-0 font-mono text-[0.58rem] uppercase tracking-[0.08em] text-muted">
                            {item.tag}
                          </span>
                        </div>
                        {item.subtitle ? (
                          <p className="mt-0.5 truncate text-[0.72rem] text-muted">
                            {item.subtitle}
                          </p>
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
