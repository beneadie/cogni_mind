// PURPOSE: The React-facing store: holds QualityState, applies qualityReducer, and notifies subscribers.
// ROLE: state. USED BY: demos/quality/page.tsx (the only component that reads or dispatches).
// SWAP-POINT: a server-backed ticket store (API + cache) replaces this module-level state in a live system.

import { useSyncExternalStore } from "react";
import { type QualityAction, type QualityState, initialState, qualityReducer } from "./reducer";

// The seed state is built once, so the server render and the client's first render see the very same
// object: getServerSnapshot returns it and hydration never mismatches.
const SEED_STATE: QualityState = initialState();

let current: QualityState = SEED_STATE;
const listeners = new Set<() => void>();

/** Registers a listener for store changes; returns the unsubscribe function. */
function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Applies an action. Confirm, correct, backfill and reset all go through here; selectors recompute on the next render. */
export function dispatchQuality(action: QualityAction): void {
  const next = qualityReducer(current, action);
  if (next === current) return;
  current = next;
  for (const listener of listeners) listener();
}

/** Current Quality state; hydration-safe because the server snapshot is always the seed. */
export function useQualityState(): QualityState {
  return useSyncExternalStore(
    subscribe,
    () => current,
    () => SEED_STATE,
  );
}
