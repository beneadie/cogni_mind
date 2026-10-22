"use client";

// PURPOSE: "Ask the Quality Agent": a collapsible question box that searches the current complaint records.
// ROLE: component. USED BY: dashboard.tsx.
// Client component for the open state and question history. Only the questions are kept; answers are recomputed
// from the live records on every render, so a confirm or correction elsewhere updates them immediately.

import { useState } from "react";
import { ChevronDown, CornerDownLeft, Info, MessageSquareText } from "lucide-react";
import type { Ticket, TicketId } from "../lib/contracts";
import { companyName, failureLabel, productName } from "../lib/data/catalog";
import { activeSearch, type SearchAnswer } from "../lib/search/index";
import { formatDay } from "../lib/time";
import { BUTTON, Chip, DATA_FILL, DATA_TEXT_RANKING, FIELD, StatusTag } from "./ui";

const EXAMPLES = ["Show compressor leak tickets", "Which company has the most tickets?", "What recurring failures need attention?"] as const;

/** Matching tickets shown at first, and how many more each "Show more" adds. */
const RESULTS_STEP = 4;

/** One matching ticket; opens the existing record view in the modal. */
function ResultTicket({ ticket, onOpen }: { ticket: Ticket; onOpen: () => void }) {
  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        className="flex h-full w-full flex-col gap-1.5 rounded-xl border border-line bg-canvas px-3 py-2.5 text-left transition-colors hover:border-line-strong hover:bg-surface hover:shadow-[0_6px_18px_-14px_rgba(26,24,21,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
      >
        <span className="flex items-center gap-2">
          <span className="font-mono text-[0.68rem] font-medium text-ink">{ticket.id}</span>
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.08em] text-muted">{formatDay(ticket.date, true)}</span>
          <span className="ml-auto">
            <StatusTag status={ticket.tags.status} />
          </span>
        </span>
        <span className="block text-[0.8rem] font-medium text-ink">{ticket.tags.failureType ? failureLabel(ticket.tags.failureType) : "Failure type needs review"}</span>
        <span className="block truncate text-[0.72rem] text-muted">
          {companyName(ticket.companyId)} · {ticket.tags.productId ? productName(ticket.tags.productId) : "Product unknown"}
        </span>
        <span className="line-clamp-2 block text-[0.76rem] leading-relaxed text-ink-soft">{ticket.text || "(empty record)"}</span>
      </button>
    </li>
  );
}

/** One question and its answer, grounded in the records. */
function Exchange({ question, result, tickets, onOpenTicket }: { question: string; result: SearchAnswer; tickets: readonly Ticket[]; onOpenTicket: (id: TicketId) => void }) {
  const [visible, setVisible] = useState(RESULTS_STEP);
  const byId = new Map(tickets.map((ticket) => [ticket.id, ticket]));
  const matched = result.ticketIds.flatMap((id) => byId.get(id) ?? []);
  const shown = matched.slice(0, visible);
  const max = Math.max(1, ...result.rows.map((row) => row.count));

  return (
    <li className="space-y-2">
      <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-accent px-3 py-2 text-[0.82rem] text-canvas">{question}</p>
      <div className="space-y-2.5 rounded-2xl rounded-bl-md border border-line bg-surface px-3 py-3">
        <p className={`text-[0.84rem] leading-relaxed ${result.kind === "unanswerable" ? "text-muted" : "text-ink"}`}>{result.answer}</p>
        {result.understood.length ? (
          <div className="flex flex-wrap gap-1.5" aria-label="How the question was read">
            {result.understood.map((item) => (
              <Chip key={item}>{item}</Chip>
            ))}
          </div>
        ) : null}
        {result.rows.length ? (
          <ul className="space-y-2">
            {result.rows.map((row) => (
              <li key={row.label} className="space-y-1">
                <div className="flex items-baseline justify-between gap-2 text-[0.78rem]">
                  <span className="min-w-0 truncate text-ink">{row.label}</span>
                  <span className="shrink-0 font-mono text-[0.7rem] text-ink">
                    {row.count}
                    <span className="text-muted"> · {row.count - row.unconfirmed} confirmed{row.unconfirmed ? `, ${row.unconfirmed} suggested` : ""}</span>
                  </span>
                </div>
                <div className={`h-2.5 overflow-hidden rounded-full ${DATA_FILL.track}`} aria-hidden>
                  <div className={`h-full rounded-full ${DATA_FILL.ranking}`} style={{ width: `${(row.count / max) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        ) : null}
        {matched.length ? (
          <ul className="grid gap-2 sm:grid-cols-2">
            {shown.map((ticket) => (
              <ResultTicket key={ticket.id} ticket={ticket} onOpen={() => onOpenTicket(ticket.id)} />
            ))}
          </ul>
        ) : null}
        {matched.length > RESULTS_STEP ? (
          <div className="flex flex-wrap items-center gap-2">
            {visible < matched.length ? (
              <button type="button" onClick={() => setVisible((count) => count + RESULTS_STEP)} className={BUTTON.secondary}>
                Show more ({matched.length - visible} left)
              </button>
            ) : (
              <button type="button" onClick={() => setVisible(RESULTS_STEP)} className={BUTTON.secondary}>
                Show fewer
              </button>
            )}
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.1em] text-muted">
              {Math.min(visible, matched.length)} of {matched.length}
            </span>
          </div>
        ) : null}
      </div>
    </li>
  );
}

/** The collapsible assistant; `onOpenTicket` opens a record in the existing record modal. */
export function AskPanel({ tickets, onOpenTicket }: { tickets: readonly Ticket[]; onOpenTicket: (id: TicketId) => void }) {
  const [open, setOpen] = useState(true);
  const [questions, setQuestions] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const ask = (question: string) => {
    const trimmed = question.trim();
    if (!trimmed) return;
    setQuestions((previous) => [...previous, trimmed]);
    setDraft("");
  };

  return (
    <section aria-labelledby="ask-title" className="overflow-hidden rounded-2xl border border-line-strong bg-surface">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="ask-body"
        className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-elevated/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent/40"
      >
        <MessageSquareText className={`h-5 w-5 shrink-0 ${DATA_TEXT_RANKING}`} />
        <span className="min-w-0 flex-1">
          <span id="ask-title" className="block font-serif text-lg text-ink">
            Ask the Quality Agent
          </span>
          <span className="block text-[0.74rem] text-muted">Explore tickets, recurring issues, and product trends.</span>
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <div id="ask-body" className="space-y-4 border-t border-line px-5 py-4">
          {questions.length === 0 ? (
            <p className="rounded-xl border border-dashed border-line-strong px-4 py-4 text-center text-[0.8rem] text-muted">
              Ask about tickets, companies, products or recurring failures, or start with an example below.
            </p>
          ) : null}
          {questions.length ? (
            <ol className="scroll-soft max-h-[32rem] space-y-4 overflow-y-auto pr-1" aria-live="polite">
              {questions.map((question, index) => (
                <Exchange key={index} question={question} result={activeSearch.ask(question, tickets)} tickets={tickets} onOpenTicket={onOpenTicket} />
              ))}
            </ol>
          ) : null}

          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => ask(example)}
                className="rounded-full border border-line-strong bg-canvas px-3 py-1 text-[0.74rem] text-ink-soft transition-colors hover:bg-elevated hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                {example}
              </button>
            ))}
          </div>

          <form
            className="flex gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              ask(draft);
            }}
          >
            <input value={draft} onChange={(event) => setDraft(event.target.value)} aria-label="Ask a question about the tickets" placeholder="e.g. Show tickets from Apex Air" className={FIELD} />
            <button type="submit" disabled={!draft.trim()} className={BUTTON.primary} aria-label="Ask">
              <CornerDownLeft className="h-3.5 w-3.5" />
              Ask
            </button>
          </form>

          {/* DEMO-ONLY disclosure: kept truthful, just out of the way. */}
          <details className="text-[0.72rem] leading-relaxed text-muted">
            <summary className="inline-flex cursor-pointer list-none items-center gap-1 font-mono text-[0.6rem] uppercase tracking-[0.1em] hover:text-ink">
              <Info className="h-3 w-3" />
              About this agent
            </summary>
            <p className="mt-1.5">
              Answers come only from the synthetic demo ticket records (all of them, regardless of dashboard filters), using rule-based matching of products, models, companies, failure types, statuses and dates. No live AI model or external data is
              connected.
            </p>
          </details>
        </div>
      ) : null}
    </section>
  );
}
