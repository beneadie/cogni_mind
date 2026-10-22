const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function daysBetween(from: Date, to: Date): number {
  return Math.round(
    (startOfDay(to).getTime() - startOfDay(from).getTime()) / DAY_MS,
  );
}

export function nextAnnualDate(
  monthIndex: number,
  day: number,
  now = new Date(),
): Date {
  const today = startOfDay(now);
  const candidate = new Date(today.getFullYear(), monthIndex, day);
  if (candidate <= today) {
    candidate.setFullYear(today.getFullYear() + 1);
  }
  return candidate;
}

export function formatShortDate(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(date)
    .replace(",", "");
}

export function reviewDateFor(deadline: Date, now = new Date()): Date {
  const today = startOfDay(now);
  const thirtyDaysBefore = addDays(deadline, -30);
  if (thirtyDaysBefore > today) return thirtyDaysBefore;

  const halfway = addDays(
    today,
    Math.max(1, Math.floor(daysBetween(today, deadline) / 2)),
  );
  return halfway < deadline ? halfway : deadline;
}

const NOW = new Date();

export const CURRENT_YEAR = NOW.getFullYear();
export const CURRENT_YEAR_LABEL = String(CURRENT_YEAR);

export const REFRIGERANT_DEADLINE = nextAnnualDate(0, 1, NOW);
export const ROHS_DEADLINE = nextAnnualDate(0, 1, NOW);
export const CHROME_DEADLINE = nextAnnualDate(6, 1, NOW);

export const REFRIGERANT_DEADLINE_LABEL = formatShortDate(REFRIGERANT_DEADLINE);
export const ROHS_DEADLINE_LABEL = formatShortDate(ROHS_DEADLINE);
export const CHROME_DEADLINE_LABEL = formatShortDate(CHROME_DEADLINE);

export const REFRIGERANT_YEAR = REFRIGERANT_DEADLINE.getFullYear();
export const ROHS_YEAR = ROHS_DEADLINE.getFullYear();
export const CHROME_YEAR = CHROME_DEADLINE.getFullYear();

export const REVIEW_DATE = reviewDateFor(REFRIGERANT_DEADLINE, NOW);
export const REVIEW_DATE_LABEL = formatShortDate(REVIEW_DATE);

export const AUDIT_MODIFIED = formatDateTime(NOW);
