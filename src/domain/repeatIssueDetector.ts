// ============================================================
// Repeat Issue Detector — Pure Domain Logic
// ============================================================
// Detects recurring issues in the same Space + Category
// within a configurable time window (default 7 days).
// ============================================================

import { WorkOrder } from '../types';

export interface RepeatIssue {
  currentWorkOrder: WorkOrder;
  previousWorkOrder: WorkOrder;
  daysBetween: number;
  location: string;
  category: string;
}

/**
 * Detect repeat issues: work orders in the same space + category
 * where a previous one was closed within the detection window.
 */
export function detectRepeatIssues(
  workOrders: WorkOrder[],
  windowDays: number = 7
): RepeatIssue[] {
  const repeats: RepeatIssue[] = [];
  const windowMs = windowDays * 24 * 60 * 60 * 1000;

  // Group by space + category
  const grouped = new Map<string, WorkOrder[]>();
  for (const wo of workOrders) {
    const key = `${wo.spaceId || wo.propertyId}::${wo.category}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(wo);
  }

  for (const [, orders] of grouped) {
    // Sort by creation date
    const sorted = [...orders].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    for (let i = 1; i < sorted.length; i++) {
      const current = sorted[i];
      const previous = sorted[i - 1];

      // Only flag if previous was closed
      if (previous.status !== 'closed') continue;

      const prevClosed = new Date(previous.resolvedAt || previous.updatedAt);
      const currCreated = new Date(current.createdAt);
      const diffMs = currCreated.getTime() - prevClosed.getTime();

      if (diffMs >= 0 && diffMs <= windowMs) {
        repeats.push({
          currentWorkOrder: current,
          previousWorkOrder: previous,
          daysBetween: Math.round(diffMs / (24 * 60 * 60 * 1000) * 10) / 10,
          location: current.space?.name || current.property?.name || 'Unknown',
          category: current.category,
        });
      }
    }
  }

  return repeats;
}
