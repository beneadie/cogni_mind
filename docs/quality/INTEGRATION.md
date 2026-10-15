# Quality Intelligence — integration notes (demo, illustrative data)

## 1. Records PLM or Support would consume (demos/quality/lib/contracts.ts)
- `Ticket`: id, companyId, date, kind (warranty | quality), intake (free_text | forced_choice), original `text`, modelRaw?, supportCaseId?, duplicateOf?, `tags` {productId, modelId, failureType, status}, `classification` (provenance).
- `QualityAlert`: id, productId, failureType, ticketIds (deduped, newest first), companyIds, windowStart/windowEnd, unconfirmedCount, duplicatesMerged.
- PLM: an alert becomes an engineering review request keyed by productId + failureType, with ticketIds as evidence. Today "Flag for engineering review" is marked "Demo / not submitted".
- Support: a closed case posts a `Ticket` with `supportCaseId`; Quality tags it and links back by that ID.

## 2. Classifier contract (the swap point for a real classifier)
- `ClassifyRequest` {ticketId, text, companyId?, modelRaw?} -> `ClassifyResponse` {productId, modelId, failureType, evidence[{span, cue}], possibleFailureTypes, rulesFired, status (suggested | needs_review), reviewReason?, classifierVersion}.
- The UI calls only `activeClassifier` (classifier/index.ts). A trained or LLM classifier must return the same shape, keep evidence spans, and never auto-confirm; a person still confirms or corrects.

## 3. Swap points (`grep -rn "SWAP-POINT:" demos/quality`)
- lib/time.ts -> server clock instead of the fixed DEMO_NOW.
- lib/state/store.ts -> server-backed ticket store (API + cache).
- lib/classifier/local.ts -> trained or LLM classifier behind the same contract.
- lib/classifier/index.ts -> point activeClassifier at the real service.
- lib/data/synthetic.ts -> ticket system of record (warranty/quality intake).
- lib/data/catalog.ts -> ACS product master / PLM part list.

## 4. Demo click path (what to say at each step)
1. Open /quality: no alert. "Two recent compressor leaks from the new forced-choice form, two companies. Not enough yet."
2. Try sample, then Classify: "A messy complaint. The tags come with the exact words that justify them, no scores."
3. Confirm: "Nothing joins the records until a person confirms or corrects."
4. Alert appears: "Same failure, same product, 3 tickets, 3 companies, 30 days. A lead, not a root cause."
5. Open the alert: "Three example tickets in the customers' own words, duplicates merged."
6. Classify historical tickets, then By product / By company: "Years of free text, sorted the same way; unsure ones wait for review."

## 5. Open questions for ACS
- Who owns the failure taxonomy, and what is the real forced-choice list?
- The alert rule in your words: how many tickets, how many companies, over what window?
- Where do tickets live today (per company), and which product master maps legacy model names?
