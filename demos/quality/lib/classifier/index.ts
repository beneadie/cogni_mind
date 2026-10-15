// PURPOSE: The Classifier contract and the one instance the demo uses; callers depend only on this file.
// ROLE: classifier (contract). USED BY: state/reducer.ts, tests.
// SWAP-POINT: point activeClassifier at a real service (same ClassifyRequest -> ClassifyResponse) and no UI changes.

import type { ClassifyRequest, ClassifyResponse } from "../contracts";
import { localClassifier } from "./local";

/** CONTRACT: anything that turns a ticket's words into suggested tags with evidence. Must be deterministic per version. */
export type Classifier = {
  readonly version: string;
  classify(request: ClassifyRequest): ClassifyResponse;
};

/** The classifier every caller uses. DEMO-ONLY: the offline keyword classifier. */
export const activeClassifier: Classifier = localClassifier;
