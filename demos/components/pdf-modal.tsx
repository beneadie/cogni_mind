"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, FileText, Highlighter, X } from "lucide-react";
import type { PdfPage } from "@/lib/mock-data";

export function PdfModal({
  page,
  onClose,
}: {
  page: PdfPage | null;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {page ? (
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
                  {page.manualTitle}
                </p>
                <p className="font-mono text-[0.64rem] uppercase tracking-[0.1em] text-muted">
                  Page {page.page}
                </p>
              </div>
              <a
                href={`/manuals/${page.file}#page=${page.page}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-canvas px-3 py-1.5 font-mono text-[0.62rem] font-medium uppercase tracking-[0.1em] text-ink transition-colors hover:bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Open source
              </a>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-line text-muted transition-colors hover:bg-elevated hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                aria-label="Close document"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="scroll-soft overflow-y-auto bg-canvas px-5 py-6 sm:px-8">
              <article className="mx-auto max-w-prose rounded-lg border border-line bg-white px-6 py-7 shadow-[0_1px_2px_rgba(26,24,21,0.04)]">
                <p className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted">
                  {page.subheading}
                </p>
                <h3 className="mt-2 font-serif text-xl text-ink">
                  {page.heading}
                </h3>

                <div className="mt-4 flex items-start gap-2 rounded-md border border-gold/40 bg-gold/10 px-3 py-2.5">
                  <Highlighter className="mt-0.5 h-4 w-4 shrink-0 text-amber" />
                  <p className="font-mono text-[0.76rem] leading-relaxed text-amber">
                    {page.highlight}
                  </p>
                </div>

                <div className="mt-4 space-y-3 text-[0.85rem] leading-[1.75] text-ink-soft">
                  {page.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>

                <p className="mt-6 border-t border-line pt-3 text-center font-mono text-[0.6rem] uppercase tracking-[0.2em] text-muted">
                  {page.manualTitle}
                </p>
              </article>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
