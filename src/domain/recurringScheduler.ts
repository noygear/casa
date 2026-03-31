// ============================================================
// Recurring Scheduler — Pure Domain Logic
// ============================================================
// Computes next due dates for recurring maintenance templates.
// Zero framework imports — plain TypeScript only.
// ============================================================

import type { MaintenanceFrequency } from '../types/index.js';

export interface ScheduleInput {
  frequency: MaintenanceFrequency;
  customDays?: number | null;
  anchor: Date;
}

const FREQUENCY_LABELS: Record<MaintenanceFrequency, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  annually: 'Annually',
  custom: 'Custom',
};

/**
 * Calculate the next due date after `anchor` for a given frequency.
 * Returns a Date normalized to midnight UTC.
 */
export function computeNextDueDate(input: ScheduleInput): Date {
  const { frequency, customDays, anchor } = input;
  const next = new Date(anchor);

  switch (frequency) {
    case 'daily':
      next.setUTCDate(next.getUTCDate() + 1);
      break;
    case 'weekly':
      next.setUTCDate(next.getUTCDate() + 7);
      break;
    case 'monthly':
      addCalendarMonths(next, 1);
      break;
    case 'quarterly':
      addCalendarMonths(next, 3);
      break;
    case 'annually':
      addCalendarMonths(next, 12);
      break;
    case 'custom': {
      if (!customDays || customDays <= 0) {
        throw new Error('Custom frequency requires a positive customDays value');
      }
      next.setUTCDate(next.getUTCDate() + customDays);
      break;
    }
  }

  // Normalize to midnight UTC
  next.setUTCHours(0, 0, 0, 0);
  return next;
}

/**
 * Determine whether a due date falls within the generation window.
 * Window: dueDate <= now + horizonMs
 */
export function isDueWithinHorizon(
  dueDate: Date,
  now: Date,
  horizonMs: number,
): boolean {
  const horizon = new Date(now.getTime() + horizonMs);
  return dueDate.getTime() <= horizon.getTime();
}

/**
 * Format a human-readable work order title for a recurring instance.
 * Example: "HVAC Filter Replacement — Monthly (Apr 2026)"
 */
export function formatRecurringTitle(
  templateName: string,
  frequency: MaintenanceFrequency,
  dueDate: Date,
): string {
  const label = FREQUENCY_LABELS[frequency];
  const monthYear = dueDate.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
  return `${templateName} — ${label} (${monthYear})`;
}

/**
 * Add N calendar months, clamping to the last day of the target month
 * to handle end-of-month overflow (e.g., Jan 31 + 1 month = Feb 28).
 */
function addCalendarMonths(date: Date, months: number): void {
  const dayOfMonth = date.getUTCDate();
  date.setUTCMonth(date.getUTCMonth() + months);

  // If the day overflowed (e.g., 31 → 3 of next month), clamp to last day
  if (date.getUTCDate() < dayOfMonth) {
    date.setUTCDate(0); // Sets to last day of previous month
  }
}
