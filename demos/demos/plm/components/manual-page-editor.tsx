"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  GitBranch,
  Highlighter,
  Italic,
  List,
  ListOrdered,
  MessageSquare,
  Minus,
  Printer,
  Redo2,
  RotateCcw,
  Save,
  Search,
  ShieldCheck,
  Square,
  Underline,
  Undo2,
  X,
  XCircle,
} from "lucide-react";
import type { ManualPageSpec } from "../lib/queue-data";
import type { DocChange } from "../lib/types";

const WIRE_DOT: Record<string, string> = {
  Red: "bg-[#c54242]",
  Blue: "bg-[#2b579a]",
  Green: "bg-[#4f8a4f]",
};

const RIBBON_TABS = [
  "File",
  "Home",
  "Insert",
  "Draw",
  "Design",
  "Layout",
  "References",
  "Review",
  "View",
  "Help",
];

const TOOLBAR_GROUPS = [
  [
    { icon: Undo2, label: "Undo" },
    { icon: Redo2, label: "Redo" },
  ],
  [
    { icon: Bold, label: "Bold" },
    { icon: Italic, label: "Italic" },
    { icon: Underline, label: "Underline" },
  ],
  [
    { icon: AlignLeft, label: "Align left" },
    { icon: AlignCenter, label: "Center" },
    { icon: AlignRight, label: "Align right" },
  ],
  [
    { icon: List, label: "Bullets" },
    { icon: ListOrdered, label: "Numbering" },
  ],
  [
    { icon: Highlighter, label: "Highlight" },
    { icon: MessageSquare, label: "New comment" },
  ],
];

function WiringFigure({ page }: { page: ManualPageSpec }) {
  return (
    <figure className="mt-5 border border-[#bfbfbf] bg-[#fafafa] p-3">
      <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
        <div className="border border-[#bfbfbf] bg-white p-2.5">
          <p className="text-[0.58rem] font-semibold uppercase tracking-[0.06em] text-[#605e5c]">
            Thermostat
          </p>
          <div className="mt-2 space-y-1">
            {page.terminals.map((terminal) => (
              <div
                key={terminal.terminal}
                className="flex items-center justify-between gap-2 border border-[#d1d1d1] px-2 py-1"
              >
                <span className="flex items-center gap-1.5 font-mono text-[0.66rem] font-semibold text-[#1f1f1f]">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${WIRE_DOT[terminal.color] ?? "bg-[#8a8886]"}`}
                  />
                  {terminal.terminal}
                </span>
                <span className="text-[0.62rem] text-[#605e5c]">
                  {terminal.function}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center gap-1.5">
          <span className="text-[0.5rem] uppercase tracking-[0.08em] text-[#8a8886]">
            Field wiring
          </span>
          <div className="space-y-1.5">
            {page.terminals.map((terminal) => (
              <div key={terminal.terminal} className="flex items-center gap-1">
                <span className="h-px w-6 bg-[#8a8886]" />
                <span
                  className={`h-1.5 w-1.5 rounded-full ${WIRE_DOT[terminal.color] ?? "bg-[#8a8886]"}`}
                />
                <span className="h-px w-6 bg-[#8a8886]" />
              </div>
            ))}
          </div>
          <span className="text-[0.5rem] uppercase tracking-[0.08em] text-[#8a8886]">
            24 VAC
          </span>
        </div>

        <div className="border border-[#bfbfbf] bg-white p-2.5">
          <p className="text-[0.58rem] font-semibold uppercase tracking-[0.06em] text-[#605e5c]">
            Control board
          </p>
          <div className="mt-2 space-y-1">
            {page.terminals.map((terminal) => (
              <div
                key={terminal.terminal}
                className="flex items-center justify-between gap-2 border border-[#d1d1d1] px-2 py-1"
              >
                <span className="font-mono text-[0.66rem] font-semibold text-[#1f1f1f]">
                  {terminal.terminal}
                </span>
                <span className="text-[0.62rem] text-[#605e5c]">
                  {terminal.note}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <figcaption className="mt-2 border-t border-[#d1d1d1] pt-2 text-center text-[0.62rem] italic text-[#605e5c]">
        Figure 7.2 — Low-voltage control wiring · R, C, G · 18 AWG minimum
      </figcaption>
    </figure>
  );
}

export function ManualPageEditor({
  open,
  page,
  change,
  draft,
  onDraftChange,
  onSave,
  onCancel,
  onOpenSource,
}: {
  open: boolean;
  page: ManualPageSpec;
  change: DocChange;
  draft: string;
  onDraftChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onOpenSource: (docId: string, page: number) => void;
}) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel, open]);

  const checks = [
    {
      label: "Three-wire callout present",
      pass: /three-wire|3-wire/i.test(draft),
    },
    {
      label: "R / C / G terminals specified",
      pass: /R,\s*C,\s*(?:and\s*)?G/i.test(draft),
    },
    {
      label: "Figure 7.2 updated",
      pass: /diagram\s*7\.2[^\n]*three-wire|three-wire[^\n]*diagram\s*7\.2/i.test(
        draft,
      ),
    },
    {
      label: "Grommet sealing retained",
      pass: /grommet/i.test(draft),
    },
  ];
  const reviewCount = checks.filter((check) => !check.pass).length;
  const wordCount = draft.trim() ? draft.trim().split(/\s+/).length : 0;
  const lineCount = draft.split("\n").length;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="manual-page-editor"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onCancel}
          className="fixed inset-0 z-50 flex items-center justify-center bg-forest/40 p-2 backdrop-blur-sm sm:p-4"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="manual-page-editor-title"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            onClick={(event) => event.stopPropagation()}
            className="flex max-h-[96vh] w-full max-w-6xl flex-col overflow-hidden rounded-md border border-[#b7b7b7] bg-[#f3f2f1] shadow-[0_24px_60px_-20px_rgba(26,24,21,0.5)]"
          >
            <div className="flex items-center gap-2 bg-[#2b579a] px-3 py-1.5 text-white">
              <span className="flex h-4 w-4 items-center justify-center rounded-[2px] bg-white text-[0.58rem] font-bold text-[#2b579a]">
                W
              </span>
              <p
                id="manual-page-editor-title"
                className="truncate text-[0.66rem] font-medium"
              >
                {page.document.title}.docx
              </p>
              <span className="text-[0.58rem] text-white/70">— Word</span>
              <div className="ml-auto flex items-center gap-2">
                <span className="hidden text-[0.56rem] text-white/75 sm:inline">
                  Saved to this device
                </span>
                <span className="flex items-center">
                  <span className="grid h-7 w-8 place-items-center text-white/80">
                    <Minus className="h-3 w-3" />
                  </span>
                  <span className="grid h-7 w-8 place-items-center text-white/80">
                    <Square className="h-2.5 w-2.5" />
                  </span>
                  <button
                    type="button"
                    onClick={onCancel}
                    aria-label="Close page editor"
                    className="grid h-7 w-8 place-items-center text-white/80 transition-colors hover:bg-[#c54242] hover:text-white focus-visible:outline-none"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 border-b border-[#d1d1d1] bg-[#f3f2f1] px-3 pt-1.5 text-[0.64rem] text-[#323130]">
              {RIBBON_TABS.map((tab) => (
                <span
                  key={tab}
                  className={`pb-1 ${
                    tab === "Home"
                      ? "border-b-2 border-[#2b579a] font-medium text-[#2b579a]"
                      : "text-[#605e5c]"
                  }`}
                >
                  {tab}
                </span>
              ))}
              <span className="ml-auto flex items-center gap-3 pb-1 text-[0.58rem] text-[#605e5c]">
                <span>Track Changes: On</span>
                <span className="h-3 w-px bg-[#c8c6c4]" />
                <span className="inline-flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  Comments
                </span>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-[#d1d1d1] bg-[#faf9f8] px-3 py-1.5 text-[#323130]">
              <span className="flex min-w-28 items-center justify-between gap-2 border border-[#c8c6c4] bg-white px-2 py-1 text-[0.6rem]">
                Times New Roman
                <ChevronDown className="h-2.5 w-2.5 text-[#605e5c]" />
              </span>
              <span className="flex w-14 items-center justify-between border border-[#c8c6c4] bg-white px-2 py-1 text-[0.6rem]">
                11
                <ChevronDown className="h-2.5 w-2.5 text-[#605e5c]" />
              </span>
              <span className="h-4 w-px bg-[#d1d1d1]" />
              {TOOLBAR_GROUPS.map((group, groupIndex) => (
                <div key={groupIndex} className="flex items-center gap-0.5">
                  {group.map(({ icon: Icon, label }) => (
                    <span
                      key={label}
                      title={label}
                      aria-hidden="true"
                      className="grid h-6 w-6 place-items-center text-[#444]"
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                  ))}
                  <span className="mx-1 h-4 w-px bg-[#d1d1d1]" />
                </div>
              ))}
              <span className="flex items-center gap-1 text-[0.6rem] text-[#605e5c]">
                <Search className="h-3.5 w-3.5" />
                Find
              </span>
              <span className="flex items-center gap-1 text-[0.6rem] text-[#605e5c]">
                <Printer className="h-3.5 w-3.5" />
                Print
              </span>
            </div>

            <div className="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto bg-[#e6e6e6] lg:grid-cols-[minmax(0,1fr)_18rem] lg:overflow-hidden">
              <div className="scroll-soft p-3 sm:p-6 lg:min-h-0 lg:overflow-y-auto">
                <article className="mx-auto w-full max-w-[48rem] border border-[#c8c6c4] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.18)]">
                  <div className="relative h-5 border-b border-[#d1d1d1] bg-[#faf9f8]">
                    <div
                      className="absolute inset-x-8 top-1 h-2"
                      style={{
                        backgroundImage:
                          "repeating-linear-gradient(to right, #b7b7b7 0 1px, transparent 1px 24px)",
                      }}
                    />
                    <div className="absolute inset-x-8 bottom-0 flex justify-between px-1 text-[0.42rem] text-[#8a8886]">
                      {["0", "1", "2", "3", "4", "5", "6"].map((mark) => (
                        <span key={mark}>{mark}</span>
                      ))}
                    </div>
                  </div>

                  <div className="px-8 py-7 sm:px-14 sm:py-9">
                    <div className="flex flex-wrap items-start justify-between gap-2 border-b border-[#d1d1d1] pb-2 text-[0.58rem] text-[#605e5c]">
                      <span className="font-semibold uppercase tracking-[0.04em]">
                        {page.document.title}
                      </span>
                      <span>
                        {page.document.revision} · {page.document.status}
                      </span>
                    </div>

                    <p className="mt-6 text-[0.62rem] font-semibold uppercase tracking-[0.08em] text-[#605e5c]">
                      {page.chapter}
                    </p>
                    <h2 className="mt-1 font-serif text-[1.6rem] font-semibold leading-tight text-[#1f1f1f]">
                      {page.title}
                    </h2>
                    <p className="mt-1 text-[0.64rem] text-[#605e5c]">
                      {page.context} · Proposed page
                    </p>

                    <p className="mt-5 font-serif text-[0.88rem] leading-7 text-[#2b2b2b]">
                      {page.scope}
                    </p>

                    <WiringFigure page={page} />

                    <h3 className="mt-6 font-serif text-[0.98rem] font-semibold text-[#1f1f1f]">
                      7.2.1 Terminal assignments
                    </h3>
                    <div className="mt-2 overflow-x-auto">
                      <table className="w-full min-w-[28rem] border-collapse text-left text-[0.74rem]">
                        <thead>
                          <tr className="border-y border-[#a6a6a6] bg-[#f3f2f1] text-[0.56rem] uppercase tracking-[0.06em] text-[#605e5c]">
                            <th className="px-2 py-1.5 font-semibold">Terminal</th>
                            <th className="px-2 py-1.5 font-semibold">Function</th>
                            <th className="px-2 py-1.5 font-semibold">Wire</th>
                            <th className="px-2 py-1.5 font-semibold">Notes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {page.terminals.map((terminal) => (
                            <tr
                              key={terminal.terminal}
                              className="border-b border-[#d1d1d1]"
                            >
                              <td className="px-2 py-1.5">
                                <span className="flex items-center gap-1.5 font-mono text-[0.68rem] font-semibold text-[#1f1f1f]">
                                  <span
                                    className={`h-1.5 w-1.5 rounded-full ${WIRE_DOT[terminal.color] ?? "bg-[#8a8886]"}`}
                                  />
                                  {terminal.terminal}
                                </span>
                              </td>
                              <td className="px-2 py-1.5 text-[#323130]">
                                {terminal.function}
                              </td>
                              <td className="px-2 py-1.5 text-[#605e5c]">
                                {terminal.color}
                              </td>
                              <td className="px-2 py-1.5 text-[#323130]">
                                {terminal.note}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="mt-2 font-serif text-[0.74rem] italic text-[#605e5c]">
                      {page.terminalNote}
                    </p>

                    <h3 className="mt-6 font-serif text-[0.98rem] font-semibold text-[#1f1f1f]">
                      7.2.2 Field wiring procedure
                    </h3>
                    <p className="mt-1 font-serif text-[0.8rem] leading-6 text-[#2b2b2b]">
                      Follow the steps below. Confirm the terminal labels and
                      torque values before restoring power.
                    </p>

                    <div className="mt-2 border-l-2 border-[#2b579a]/35 pl-3">
                      <textarea
                        value={draft}
                        onChange={(event) => onDraftChange(event.target.value)}
                        rows={Math.max(12, lineCount)}
                        aria-label={`Edit manual page ${page.page} procedure`}
                        className="w-full resize-none border-0 bg-transparent p-0 font-serif text-[0.88rem] leading-7 text-[#1f1f1f] focus:bg-[#fffdf4] focus:outline-none"
                      />
                    </div>

                    <div className="mt-4 space-y-2">
                      {page.notes.map((note) => (
                        <p
                          key={note.title}
                          className="font-serif text-[0.76rem] leading-6 text-[#323130]"
                        >
                          <span
                            className={`font-semibold ${
                              note.tone === "warning"
                                ? "text-[#9a5b00]"
                                : note.tone === "caution"
                                  ? "text-[#a4262c]"
                                  : "text-[#2b579a]"
                            }`}
                          >
                            {note.title}.
                          </span>{" "}
                          {note.text}
                        </p>
                      ))}
                    </div>

                    <div className="mt-6 grid gap-5 border-t border-[#d1d1d1] pt-4 sm:grid-cols-2">
                      <div>
                        <p className="text-[0.56rem] font-semibold uppercase tracking-[0.08em] text-[#605e5c]">
                          References
                        </p>
                        <ul className="mt-1.5 space-y-1">
                          {page.references.map((reference) => (
                            <li
                              key={reference.label}
                              className="flex items-baseline justify-between gap-3 font-serif text-[0.7rem]"
                            >
                              <span className="font-semibold text-[#323130]">
                                {reference.label}
                              </span>
                              <span className="text-right text-[#605e5c]">
                                {reference.value}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-[0.56rem] font-semibold uppercase tracking-[0.08em] text-[#605e5c]">
                          Revision history
                        </p>
                        <ul className="mt-1.5 space-y-1">
                          {page.revisionHistory.map((revision) => (
                            <li
                              key={revision.revision}
                              className="grid grid-cols-[3.5rem_4.5rem_minmax(0,1fr)] items-baseline gap-2 font-serif text-[0.68rem]"
                            >
                              <span className="font-semibold text-[#323130]">
                                {revision.revision}
                              </span>
                              <span className="text-[#605e5c]">
                                {revision.date}
                              </span>
                              <span className="text-[#605e5c]">
                                {revision.note}
                                {revision.revision === "Draft"
                                  ? ` · ${change.ecrId}`
                                  : ""}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-8 flex items-center justify-between border-t border-[#d1d1d1] pt-2 text-[0.56rem] text-[#8a8886]">
                      <span>{page.document.id}</span>
                      <span>Page {page.page}</span>
                      <span>{page.document.owner}</span>
                    </div>
                  </div>
                </article>
              </div>

              <aside className="scroll-soft border-t border-[#d1d1d1] bg-[#f3f2f1] p-3 lg:min-h-0 lg:overflow-y-auto lg:border-l lg:border-t-0">
                <div className="flex items-center justify-between">
                  <p className="text-[0.68rem] font-semibold text-[#323130]">
                    Comments
                  </p>
                  <span className="rounded-full bg-[#2b579a] px-1.5 py-0.5 text-[0.52rem] font-semibold text-white">
                    3
                  </span>
                </div>

                <div className="mt-2 space-y-2">
                  <div className="border border-[#d1d1d1] bg-white p-2 shadow-sm">
                    <div className="flex items-center gap-1.5">
                      <span className="grid h-4 w-4 place-items-center rounded-full bg-[#2b579a] text-[0.45rem] font-semibold text-white">
                        AI
                      </span>
                      <p className="text-[0.58rem] font-semibold text-[#323130]">
                        Compliance agent
                      </p>
                      <span className="ml-auto text-[0.5rem] text-[#8a8886]">
                        just now
                      </span>
                    </div>
                    <p className="mt-1 text-[0.64rem] leading-snug text-[#323130]">
                      Spec rev C requires three-wire control. Terminals R, C, and
                      G must be wired.
                    </p>
                  </div>
                  <div className="border border-[#d1d1d1] bg-white p-2 shadow-sm">
                    <div className="flex items-center gap-1.5">
                      <span className="grid h-4 w-4 place-items-center rounded-full bg-[#4f8a4f] text-[0.45rem] font-semibold text-white">
                        DT
                      </span>
                      <p className="text-[0.58rem] font-semibold text-[#323130]">
                        Docs team
                      </p>
                      <span className="ml-auto text-[0.5rem] text-[#8a8886]">
                        reply
                      </span>
                    </div>
                    <p className="mt-1 text-[0.64rem] leading-snug text-[#323130]">
                      Update Figure 7.2 and the procedure block. Keep the grommet
                      and torque callouts.
                    </p>
                  </div>
                  <div className="border border-[#d1d1d1] bg-white p-2 shadow-sm">
                    <p className="flex items-center gap-1.5 text-[0.58rem] font-semibold text-[#323130]">
                      <MessageSquare className="h-3 w-3 text-[#2b579a]" />
                      Change request {change.ecrId}
                    </p>
                    <p className="mt-1 text-[0.64rem] leading-snug text-[#605e5c]">
                      Current manual: {change.currentManual}. Target spec:{" "}
                      {change.currentSpec}.
                    </p>
                  </div>
                </div>

                <div className="mt-4 border-t border-[#d1d1d1] pt-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[0.62rem] font-semibold text-[#323130]">
                      Review checklist
                    </p>
                    <span
                      className={`text-[0.52rem] font-semibold ${
                        reviewCount === 0 ? "text-[#4f8a4f]" : "text-[#9a5b00]"
                      }`}
                    >
                      {reviewCount === 0
                        ? "All checks pass"
                        : `${reviewCount} item${reviewCount === 1 ? "" : "s"}`}
                    </span>
                  </div>
                  <ul className="mt-1.5 space-y-1">
                    {checks.map((check) => {
                      const Icon = check.pass ? CheckCircle2 : XCircle;
                      return (
                        <li
                          key={check.label}
                          className="flex items-start gap-1.5 text-[0.62rem] leading-snug"
                        >
                          <Icon
                            className={`mt-0.5 h-3 w-3 shrink-0 ${
                              check.pass ? "text-[#4f8a4f]" : "text-[#9a5b00]"
                            }`}
                          />
                          <span className="text-[#323130]">{check.label}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div className="mt-4 border-t border-[#d1d1d1] pt-3">
                  <p className="flex items-center gap-1.5 text-[0.62rem] font-semibold text-[#323130]">
                    <GitBranch className="h-3 w-3 text-[#9a5b00]" />
                    Downstream impact
                  </p>
                  <p className="mt-1 text-[0.6rem] text-[#605e5c]">
                    {change.whereUsed} documents reference §7.2
                  </p>
                  <ul className="mt-1 space-y-0.5 text-[0.6rem] text-[#605e5c]">
                    <li>MAA-200 Product Page · Web team</li>
                    <li>MAA-200 Installer Quick-Start Guide · Field team</li>
                    <li>MAA-200 Data Sheet · Docs team</li>
                  </ul>
                </div>

                <div className="mt-4 border-t border-[#d1d1d1] pt-3">
                  <button
                    type="button"
                    onClick={() =>
                      onOpenSource("maa-200-spec", page.source.page)
                    }
                    className="inline-flex items-center gap-1.5 text-[0.6rem] font-semibold text-[#2b579a] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b579a]/40"
                  >
                    <BookOpen className="h-3 w-3" />
                    Open source spec §7.2
                  </button>
                  <p className="mt-2 text-[0.58rem] leading-snug text-[#605e5c]">
                    {page.source.excerpt}
                  </p>
                </div>

                <div className="mt-4 space-y-1 border-t border-[#d1d1d1] pt-3 text-[0.58rem] text-[#605e5c]">
                  <p className="flex items-center gap-1.5">
                    <ShieldCheck className="h-3 w-3 text-[#4f8a4f]" />
                    {page.document.status}
                  </p>
                  <p>Owner: {page.document.owner}</p>
                  <p>Section: {page.heading}</p>
                  <p>ECR: {change.ecrId}</p>
                </div>
              </aside>
            </div>

            <div className="flex flex-wrap items-center gap-2 border-t border-[#d1d1d1] bg-[#faf9f8] px-3 py-2">
              <p className="text-[0.58rem] text-[#605e5c]">
                Local demo edit · nothing publishes automatically
              </p>
              <div className="ml-auto flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={onCancel}
                  className="border border-[#c8c6c4] bg-white px-3 py-1.5 text-[0.6rem] font-semibold text-[#323130] transition-colors hover:bg-[#f3f2f1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b579a]/40"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => onDraftChange(page.proposedLines.join("\n"))}
                  className="inline-flex items-center gap-1.5 border border-[#c8c6c4] bg-white px-3 py-1.5 text-[0.6rem] font-semibold text-[#323130] transition-colors hover:bg-[#f3f2f1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b579a]/40"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset to proposed
                </button>
                <button
                  type="button"
                  onClick={onSave}
                  disabled={!draft.trim()}
                  className="inline-flex items-center gap-1.5 bg-[#2b579a] px-3.5 py-1.5 text-[0.6rem] font-semibold text-white transition-colors hover:bg-[#1f4a8a] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b579a]/40"
                >
                  <Save className="h-3 w-3" />
                  Save & update diff
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-[#2b579a] px-3 py-1 text-[0.56rem] text-white/90">
              <span>Page 1 of 1</span>
              <span>{wordCount} words</span>
              <span>Track Changes: On</span>
              <span className="ml-auto">100%</span>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
