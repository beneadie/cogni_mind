// PURPOSE: The only place the recurring-failure alert constants and the rule text shown to users are defined.
// ROLE: contract (constants). USED BY: selectors/alerts.ts, alert and evidence components.
// All values are DEMO-ONLY: ACS would set the real rule (open question in docs/quality/INTEGRATION.md).

/** DEMO-ONLY: distinct (deduplicated) tickets needed before a failure counts as repeating. */
export const ALERT_MIN_TICKETS = 3;

/** DEMO-ONLY: the repeat must span at least this many companies, so one site's bad week is not a group-wide alert. */
export const ALERT_MIN_COMPANIES = 2;

/** DEMO-ONLY: rolling window in days, ending on DEMO_NOW (today counts as day 0). */
export const ALERT_WINDOW_DAYS = 30;

/** DEMO-ONLY: example tickets shown on an alert before "Show all N". */
export const EXAMPLE_TICKETS_SHOWN = 3;

/** The alert rule in plain words, built from the constants above so the UI can never drift from the logic. */
export const ALERT_RULE_TEXT = `${ALERT_MIN_TICKETS}+ distinct tickets in a rolling ${ALERT_WINDOW_DAYS}-day window, same product and failure type, across ${ALERT_MIN_COMPANIES}+ companies.`;

/** Caveat shown next to every alert: the rule finds a pattern, a person finds the cause. */
export const ALERT_CAVEAT = "A lead for investigation, not proof of root cause.";
