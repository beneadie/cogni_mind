"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Highlighter,
  X,
} from "lucide-react";
import { getPdfFile } from "../lib/pdf-pages";

export type PdfView = { docId: string; page: number };

export function PdfModal({
  view,
  onClose,
  onPage,
}: {
  view: PdfView | null;
  onClose: () => void;
  onPage: (page: number) => void;
}) {
  const file = view ? getPdfFile(view.docId) : null;
  const content =
    file && view
      ? file.pages.find((entry) => entry.page === view.page) ?? file.pages[0]
      : null;
  const index = file && content ? file.pages.indexOf(content) : 0;

  return (
    <AnimatePresence>
      {file && content && view ? (
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-forest/40 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            onClick={(event) => event.stopPropagation()}
            className="flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-line-strong bg-surface shadow-[0_24px_60px_-24px_rgba(26,24,21,0.4)]"
          >
            <div className="flex items-center gap-3 border-b border-line px-4 py-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-amber-soft text-amber">
                <FileText className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[0.82rem] font-medium text-ink">
                  {file.title}
                </p>
                <p className="font-mono text-[0.64rem] uppercase tracking-[0.1em] text-muted">
                  {file.file} · Page {content.page} of {file.pages.length}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close document"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-line text-muted transition-colors hover:bg-elevated hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="scroll-soft overflow-y-auto bg-canvas px-5 py-6 sm:px-8">
              <article className="mx-auto max-w-prose rounded-lg border border-line bg-white px-6 py-7 shadow-[0_1px_2px_rgba(26,24,21,0.04)]">
                <p className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted">
                  {content.subheading}
                </p>
                <h3 className="mt-2 font-serif text-xl text-ink">
                  {content.heading}
                </h3>

                {content.highlight ? (
                  <div className="mt-4 flex items-start gap-2 rounded-md border border-gold/40 bg-gold/10 px-3 py-2.5">
                    <Highlighter className="mt-0.5 h-4 w-4 shrink-0 text-amber" />
                    <p className="font-mono text-[0.76rem] leading-relaxed text-amber">
                      {content.highlight}
                    </p>
                  </div>
                ) : null}

                <div className="mt-4 space-y-3 text-[0.85rem] leading-[1.75] text-ink-soft">
                  {content.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>

                <p className="mt-6 border-t border-line pt-3 text-center font-mono text-[0.6rem] uppercase tracking-[0.2em] text-muted">
                  {file.file} · Page {content.page}
                </p>
              </article>
            </div>

            {file.pages.length > 1 ? (
              <div className="flex items-center justify-between border-t border-line bg-elevated/40 px-4 py-3">
                <button
                  type="button"
                  onClick={() => onPage(file.pages[Math.max(0, index - 1)].page)}
                  disabled={index === 0}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-canvas px-3.5 py-2 font-mono text-[0.62rem] font-medium uppercase tracking-[0.1em] text-ink transition-colors hover:bg-elevated disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Prev
                </button>
                <span className="font-mono text-[0.62rem] uppercase tracking-[0.1em] text-muted">
                  Page {content.page} / {file.pages.length}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    onPage(
                      file.pages[Math.min(file.pages.length - 1, index + 1)].page,
                    )
                  }
                  disabled={index === file.pages.length - 1}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-canvas px-3.5 py-2 font-mono text-[0.62rem] font-medium uppercase tracking-[0.1em] text-ink transition-colors hover:bg-elevated disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
