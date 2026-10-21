// PURPOSE: The QualitySearch contract behind "Ask Quality Control" and the one instance the demo uses.
// ROLE: search (contract). USED BY: components/ask-panel.tsx, tests.
// SWAP-POINT: point activeSearch at an LLM-backed service that returns the same SearchAnswer, grounded in the same records.

import type { Ticket, TicketId } from "../contracts";
import { localSearch } from "./local";

/** One ranked row for "most common" questions; unconfirmed = still at "suggested". */
export type SearchRow = { label: string; count: number; unconfirmed: number };

/** CONTRACT: an answer grounded only in the ticket records it was given. */
export type SearchAnswer = {
  /** tickets = a filtered list, ranking = grouped counts, alerts = recurring failures, unanswerable = not in the records. */
  kind: "tickets" | "ranking" | "alerts" | "unanswerable";
  /** Short plain-language answer; every number in it is computed from the records. */
  answer: string;
  /** How the question was read, e.g. "Company: Apex Air", so a person can check the interpretation. */
  understood: string[];
  /** Matching tickets, newest first. */
  ticketIds: TicketId[];
  rows: SearchRow[];
};

/** CONTRACT: anything that answers a question over the current records. Must not invent tickets, counts or causes. */
export type QualitySearch = {
  readonly version: string;
  ask(question: string, tickets: readonly Ticket[]): SearchAnswer;
};

/** The search every caller uses. DEMO-ONLY: deterministic keyword and phrase matching, no model. */
export const activeSearch: QualitySearch = localSearch;
