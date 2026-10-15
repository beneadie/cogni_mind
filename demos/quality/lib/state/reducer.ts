// PURPOSE: The one pure reducer for Quality: incoming complaint review, confirm/correct, backfill, filters, reset.
// ROLE: state. USED BY: the Stage 2 client store (useSyncExternalStore wrapper), tests.
// State holds records only; every count, trend and alert is recomputed by selectors after each action.

import { activeClassifier } from "../classifier/index";
import type { ClassifyResponse, CompanyId, FailureType, Filters, ModelId, ProductId, Ticket, TicketId, TicketKind } from "../contracts";
import { SEED_TICKETS } from "../data/synthetic";
import { DEFAULT_FILTERS, isHistoricalFreeText } from "../selectors/records";
import { DEMO_NOW } from "../time";

/** An incoming complaint and its classification, waiting for a person before it becomes a ticket. */
export type Draft = {
  ticketId: TicketId;
  companyId: CompanyId;
  kind: TicketKind;
  text: string;
  modelRaw?: string;
  response: ClassifyResponse;
};

/** Tags a person sets when correcting; both product and failure are required so the ticket can count. */
export type Correction = { productId: ProductId; modelId: ModelId | null; failureType: FailureType };

/** Everything the Quality demo remembers. */
export type QualityState = { tickets: Ticket[]; draft: Draft | null; filters: Filters };

/** Every way the state can change. */
export type QualityAction =
  | { type: "draft/classify"; companyId: CompanyId; kind: TicketKind; text: string; modelRaw?: string }
  | { type: "draft/confirm" }
  | { type: "draft/correct"; correction: Correction }
  | { type: "draft/discard" }
  | { type: "ticket/confirm"; ticketId: TicketId }
  | { type: "ticket/correct"; ticketId: TicketId; correction: Correction }
  | { type: "backfill/run" }
  | { type: "filters/set"; filters: Partial<Filters> }
  | { type: "reset" };

/** Fresh seed state; copies every ticket so reset never shares objects with a previous session. */
export function initialState(): QualityState {
  return {
    tickets: SEED_TICKETS.map((ticket) => ({ ...ticket, tags: { ...ticket.tags } })),
    draft: null,
    filters: { ...DEFAULT_FILTERS },
  };
}

/** Next sequential ticket ID ("Q-026" after "Q-025"). */
function nextTicketId(tickets: readonly Ticket[]): TicketId {
  const highest = Math.max(0, ...tickets.map((ticket) => Number(ticket.id.slice(2))));
  return `Q-${String(highest + 1).padStart(3, "0")}`;
}

/** True when tags are complete enough for a person to confirm them as-is. */
function confirmable(tags: { productId: ProductId | null; failureType: FailureType | null }): boolean {
  return Boolean(tags.productId && tags.failureType);
}

/** Turns a reviewed draft into a ticket dated DEMO_NOW, keeping the classifier output as provenance. */
function ticketFromDraft(draft: Draft, tags: Ticket["tags"]): Ticket {
  return {
    id: draft.ticketId,
    companyId: draft.companyId,
    date: DEMO_NOW,
    kind: draft.kind,
    intake: "free_text",
    text: draft.text,
    modelRaw: draft.modelRaw,
    tags,
    classification: draft.response,
  };
}

/** Replaces one ticket by ID. */
function updateTicket(tickets: Ticket[], ticketId: TicketId, update: (ticket: Ticket) => Ticket): Ticket[] {
  return tickets.map((ticket) => (ticket.id === ticketId ? update(ticket) : ticket));
}

/** Pure reducer; returns the same state object when an action does not apply (e.g. confirming incomplete tags). */
export function qualityReducer(state: QualityState, action: QualityAction): QualityState {
  switch (action.type) {
    // Trigger: "Try sample" or typed text submitted. Classifies only; nothing joins the records yet.
    case "draft/classify": {
      const ticketId = nextTicketId(state.tickets);
      const response = activeClassifier.classify({ ticketId, text: action.text, companyId: action.companyId, modelRaw: action.modelRaw });
      return { ...state, draft: { ticketId, companyId: action.companyId, kind: action.kind, text: action.text, modelRaw: action.modelRaw, response } };
    }
    // HUMAN-GATE: the person accepts the suggested tags. Only now does the ticket join the records,
    // so alerts, trends and counters recompute with it.
    case "draft/confirm": {
      const { draft } = state;
      if (!draft || !confirmable(draft.response)) return state;
      const { productId, modelId, failureType } = draft.response;
      return { ...state, draft: null, tickets: [...state.tickets, ticketFromDraft(draft, { productId, modelId, failureType, status: "confirmed" })] };
    }
    // HUMAN-GATE: the person overrides the suggestion (or fills in a needs-review draft) before it joins the records.
    case "draft/correct": {
      if (!state.draft) return state;
      return { ...state, draft: null, tickets: [...state.tickets, ticketFromDraft(state.draft, { ...action.correction, status: "corrected" })] };
    }
    case "draft/discard":
      return state.draft ? { ...state, draft: null } : state;
    // HUMAN-GATE: confirming a backfilled suggestion; counts stay the same but the "unconfirmed" note shrinks.
    case "ticket/confirm": {
      const target = state.tickets.find((ticket) => ticket.id === action.ticketId);
      if (!target || target.tags.status !== "suggested" || !confirmable(target.tags)) return state;
      return { ...state, tickets: updateTicket(state.tickets, action.ticketId, (ticket) => ({ ...ticket, tags: { ...ticket.tags, status: "confirmed" } })) };
    }
    // HUMAN-GATE: correcting any ticket's tags; trends and alerts recompute from the new tags immediately.
    case "ticket/correct":
      return { ...state, tickets: updateTicket(state.tickets, action.ticketId, (ticket) => ({ ...ticket, tags: { ...action.correction, status: "corrected" } })) };
    // Trigger: "Classify historical tickets". Same classifier as intake; results land as suggested or
    // needs_review, never confirmed. Original text is untouched; the response is kept as provenance.
    case "backfill/run": {
      const pending = (ticket: Ticket) => isHistoricalFreeText(ticket) && ticket.tags.status === "unclassified";
      if (!state.tickets.some(pending)) return state;
      return {
        ...state,
        tickets: state.tickets.map((ticket) => {
          if (!pending(ticket)) return ticket;
          const response = activeClassifier.classify({ ticketId: ticket.id, text: ticket.text, companyId: ticket.companyId, modelRaw: ticket.modelRaw });
          const { productId, modelId, failureType, status } = response;
          return { ...ticket, tags: { productId, modelId, failureType, status }, classification: response };
        }),
      };
    }
    // View-only: trends and counters re-filter; alerts ignore filters by design.
    case "filters/set":
      return { ...state, filters: { ...state.filters, ...action.filters } };
    // DEMO-ONLY: "Reset Demo" restores the seed story.
    case "reset":
      return initialState();
  }
}
