import type { Bookmark, Manual } from "@/lib/mock-data";
import {
  Bookmark as BookmarkIcon,
  Check,
  ExternalLink,
  FileText,
  PanelRightClose,
} from "lucide-react";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[0.62rem] font-medium uppercase tracking-[0.16em] text-muted">
      {children}
    </p>
  );
}

export function ContextSidebar({
  availableManuals,
  activeManuals,
  bookmarks,
  selectedManualIds = [],
  selectionEnabled = false,
  onToggleManual,
  onOpenBookmark,
  onCollapse,
}: {
  availableManuals: Manual[];
  activeManuals: Manual[];
  bookmarks: Bookmark[];
  selectedManualIds?: string[];
  selectionEnabled?: boolean;
  onToggleManual?: (id: string) => void;
  onOpenBookmark?: (page: number) => void;
  onCollapse?: () => void;
}) {
  return (
    <aside className="flex h-full flex-col border-l border-line bg-elevated/40">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <p className="font-mono text-[0.68rem] font-medium uppercase tracking-[0.16em] text-ink">
          Loaded Context
        </p>
        <div className="flex items-center gap-2">
          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full border border-line-strong px-1.5 font-mono text-[0.6rem] text-muted">
            {activeManuals.length + bookmarks.length}
          </span>
          {onCollapse ? (
            <button
              type="button"
              onClick={onCollapse}
              aria-label="Hide context"
              className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            >
              <PanelRightClose className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>

      <div className="scroll-soft flex-1 space-y-6 overflow-y-auto px-4 py-4">
        <div className="space-y-2.5">
          <SectionLabel>Available Manuals</SectionLabel>
          {availableManuals.length === 0 ? (
            <p className="text-[0.76rem] leading-relaxed text-muted">
              No manuals discovered yet.
            </p>
          ) : (
            <ul className="space-y-2">
              {availableManuals.map((manual) => {
                const selected = selectedManualIds.includes(manual.id);
                return (
                  <li key={manual.id}>
                    <button
                      type="button"
                      onClick={() => onToggleManual?.(manual.id)}
                      disabled={!selectionEnabled}
                      aria-pressed={selected}
                      className={`flex w-full items-start gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
                        selected
                          ? "border-accent/50 bg-accent-soft"
                          : "border-line bg-surface enabled:hover:border-line-strong enabled:hover:bg-canvas"
                      } disabled:cursor-default`}
                    >
                      <span
                        className={`mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                          selected
                            ? "border-accent bg-accent text-canvas"
                            : "border-line-strong text-transparent"
                        }`}
                      >
                        <Check className="h-3 w-3" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[0.78rem] font-medium text-ink">
                          {manual.title}
                        </span>
                        <span className="mt-0.5 block font-mono text-[0.62rem] uppercase tracking-[0.08em] text-muted">
                          {manual.type}
                        </span>
                      </span>
                      <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="space-y-2.5">
          <SectionLabel>Active Manuals</SectionLabel>
          {activeManuals.length === 0 ? (
            <p className="text-[0.76rem] leading-relaxed text-muted">
              Nothing loaded into context.
            </p>
          ) : (
            <ul className="space-y-3">
              {activeManuals.map((manual) => {
                const manualBookmarks = bookmarks.filter(
                  (bookmark) => bookmark.manualId === manual.id,
                );
                return (
                  <li
                    key={manual.id}
                    className="rounded-lg border border-line-strong bg-surface p-3"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="mt-0.5 inline-flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-online/15 text-online">
                        <Check className="h-3 w-3" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[0.78rem] font-medium leading-snug text-ink">
                          {manual.title}
                        </span>
                        <span className="mt-0.5 block font-mono text-[0.62rem] uppercase tracking-[0.08em] text-muted">
                          In context
                        </span>
                      </span>
                      <a
                        href={`/manuals/${manual.file}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open ${manual.title}`}
                        className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-elevated hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>

                    <ul className="mt-2.5 space-y-1 border-t border-line pt-2.5">
                      {manualBookmarks.length === 0 ? (
                        <li className="text-[0.72rem] text-muted">
                          No pages referenced yet.
                        </li>
                      ) : (
                        manualBookmarks.map((bookmark) => (
                          <li
                            key={bookmark.page}
                            className="flex items-center gap-1"
                          >
                            <button
                              type="button"
                              onClick={() => onOpenBookmark?.(bookmark.page)}
                              className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-left font-mono text-[0.7rem] text-ink-soft transition-colors hover:bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                            >
                              <BookmarkIcon className="h-3.5 w-3.5 shrink-0 text-gold" />
                              <span className="truncate">
                                Page {bookmark.page} ({bookmark.label})
                              </span>
                            </button>
                            <a
                              href={`/manuals/${manual.file}#page=${bookmark.page}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`Open page ${bookmark.page} in ${manual.title}`}
                              className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-elevated hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </li>
                        ))
                      )}
                    </ul>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </aside>
  );
}
