// PURPOSE: The demo's fixed clock and whole-day math, so every window, filter and date group is identical on every run.
// ROLE: contract helper (pure). USED BY: synthetic data, selectors, state, rail date groups.
// cacheComponents forbids reading the real clock during prerender, and a fixed date keeps the seed story stable.

/** DEMO-ONLY: the "today" every window, filter and date group is measured from. SWAP-POINT: server clock in a live system. */
export const DEMO_NOW = "2026-10-14";

const MS_PER_DAY = 86_400_000;

/** Whole-day index of an ISO date (YYYY-MM-DD), in UTC so time zones never move a ticket across a boundary. */
export function dayNumber(isoDate: string): number {
  return Math.floor(Date.parse(`${isoDate}T00:00:00Z`) / MS_PER_DAY);
}

/** Whole days between an ISO date and DEMO_NOW; 0 = today, 1 = yesterday. */
export function daysAgo(isoDate: string): number {
  return dayNumber(DEMO_NOW) - dayNumber(isoDate);
}

/** True when the date is inside the `days`-long window ending on DEMO_NOW (today is day 0, so the oldest included day is `days - 1` ago). */
export function isWithinDays(isoDate: string, days: number): boolean {
  const age = daysAgo(isoDate);
  return age >= 0 && age < days;
}

/** ISO date `days` before DEMO_NOW; seeds dates and labels a window's first day. */
export function isoDaysBefore(days: number): string {
  return new Date((dayNumber(DEMO_NOW) - days) * MS_PER_DAY).toISOString().slice(0, 10);
}

// --- Display helpers (string math only, so server and client render identical text) ---

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "Oct 14" from "2026-10-14"; pass withYear for "Oct 14, 2026". */
export function formatDay(isoDate: string, withYear = false): string {
  const [year, month, day] = isoDate.split("-");
  const label = `${MONTHS[Number(month) - 1]} ${Number(day)}`;
  return withYear ? `${label}, ${year}` : label;
}

/** Ticket-rail groups in display order, relative to DEMO_NOW. */
export const DATE_GROUPS = ["Today", "Previous 7 days", "Earlier"] as const;

/** Which rail group a date falls in: today, the 7 days before it, or earlier. */
export function dateGroup(isoDate: string): (typeof DATE_GROUPS)[number] {
  const age = daysAgo(isoDate);
  if (age <= 0) return "Today";
  return age <= 7 ? "Previous 7 days" : "Earlier";
}
