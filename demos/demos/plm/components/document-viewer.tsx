"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FileText, Highlighter, X } from "lucide-react";
import type { SpecDoc } from "../lib/types";
import { SpecDocument } from "./spec-document";

export type ViewerState = {
  doc: SpecDoc;
  label: string;
  highlightedLineIds: string[];
};

export function DocumentViewer({
  viewer,
  onClose,
}: {
  viewer: ViewerState | null;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {viewer ? (
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-forest/40 p-4 backdrop-blur-sm"
        >
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            onClick={(event) => event.stopPropagation()}
            className="flex h-[86vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-line-strong bg-surface shadow-[0_24px_60px_-24px_rgba(26,24,21,0.4)]"
          >
            <div className="flex items-center gap-3 border-b border-line px-4 py-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-amber-soft text-amber">
                <FileText className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[0.82rem] font-medium text-ink">
                  {viewer.label}
                </p>
                <p className="font-mono text-[0.64rem] uppercase tracking-[0.1em] text-muted">
                  {viewer.doc.file}
                </p>
              </div>
              {viewer.highlightedLineIds.length > 0 ? (
                <span className="hidden items-center gap-1.5 rounded-full border border-gold/50 bg-gold/10 px-2.5 py-1 font-mono text-[0.58rem] uppercase tracking-[0.1em] text-amber sm:inline-flex">
                  <Highlighter className="h-3 w-3" />
                  Source traced
                </span>
              ) : null}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close document"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-line text-muted transition-colors hover:bg-elevated hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="min-h-0 flex-1 bg-canvas p-3 sm:p-4">
              <SpecDocument
                doc={viewer.doc}
                highlightedLineIds={viewer.highlightedLineIds}
                showHeader={false}
              />
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
