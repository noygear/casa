// ============================================================
// Property Health Calculator — Pure Domain Logic
// ============================================================
// Computes property-level health scores, budget metrics, and
// complaint trends from work order data. Zero framework imports.
// ============================================================

import { WorkOrder } from '../types';

export interface PropertyHealthScore {
  propertyId: string;
  score: number; // 0-100
  openTicketCount: number;
  avgResolutionHours: number;
  slaCompliancePercent: number;
  complaintTrend: 'rising' | 'stable' | 'falling';
}

export interface PropertyBudget {
  propertyId: string;
  annualBudget: number;
  ytdSpend: number;
  monthlyBudget: number;
  monthlySpend: number;
}

/**
 * Computes a health score (0-100) for a property based on:
 * - Open ticket count (fewer is better)
 * - SLA compliance rate
 * - Average resolution time
 */
export function computePropertyHealth(
  workOrders: WorkOrder[],
  propertyId: string
): PropertyHealthScore {
  const propertyWOs = workOrders.filter(wo => wo.propertyId === propertyId);
  const openWOs = propertyWOs.filter(wo =>
    wo.status !== 'closed' && wo.status !== 'skipped'
  );
  const closedWOs = propertyWOs.filter(wo => wo.status === 'closed');

  // Open ticket penalty: each open ticket reduces score by 5, max 40 points
  const openPenalty = Math.min(openWOs.length * 5, 40);

  // SLA compliance
  const withSLA = propertyWOs.filter(wo => wo.slaResolveMin);
  const slaBreaches = withSLA.filter(wo => {
    if (!wo.slaResolveMin) return false;
    const resolveTime = wo.resolvedAt
      ? (new Date(wo.resolvedAt).getTime() - new Date(wo.createdAt).getTime()) / 60000
      : (Date.now() - new Date(wo.createdAt).getTime()) / 60000;
    return resolveTime > wo.slaResolveMin;
  });
  const slaCompliancePercent = withSLA.length > 0
    ? Math.round(((withSLA.length - slaBreaches.length) / withSLA.length) * 100)
    : 100;
  const slaPenalty = Math.max(0, (100 - slaCompliancePercent) * 0.3);

  // Average resolution time
  const resolvedTimes = closedWOs
    .filter(wo => wo.resolvedAt)
    .map(wo => (new Date(wo.resolvedAt!).getTime() - new Date(wo.createdAt).getTime()) / 3600000);
  const avgResolutionHours = resolvedTimes.length > 0
    ? resolvedTimes.reduce((a, b) => a + b, 0) / resolvedTimes.length
    : 0;

  // Complaint trend
  const trend = getComplaintTrend(workOrders, propertyId, 30);

  const score = Math.max(0, Math.min(100, Math.round(100 - openPenalty - slaPenalty)));

  return {
    propertyId,
    score,
    openTicketCount: openWOs.length,
    avgResolutionHours: Math.round(avgResolutionHours),
    slaCompliancePercent,
    complaintTrend: trend,
  };
}

/**
 * Computes budget metrics for a property by summing costs of closed WOs.
 */
export function computePropertyBudget(
  workOrders: WorkOrder[],
  propertyId: string,
  annualBudget: number
): PropertyBudget {
  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const propertyWOs = workOrders.filter(wo =>
    wo.propertyId === propertyId && wo.status === 'closed' && wo.cost != null
  );

  const ytdSpend = propertyWOs
    .filter(wo => new Date(wo.createdAt) >= yearStart)
    .reduce((sum, wo) => sum + (wo.cost ?? 0), 0);

  const monthlySpend = propertyWOs
    .filter(wo => new Date(wo.createdAt) >= monthStart)
    .reduce((sum, wo) => sum + (wo.cost ?? 0), 0);

  return {
    propertyId,
    annualBudget,
    ytdSpend,
    monthlyBudget: Math.round(annualBudget / 12),
    monthlySpend,
  };
}

/**
 * Compares ticket creation volume between current and prior period.
 */
export function getComplaintTrend(
  workOrders: WorkOrder[],
  propertyId: string,
  periodDays: number
): 'rising' | 'stable' | 'falling' {
  const now = Date.now();
  const periodMs = periodDays * 24 * 60 * 60 * 1000;
  const currentStart = now - periodMs;
  const priorStart = now - periodMs * 2;

  const propertyWOs = workOrders.filter(wo => wo.propertyId === propertyId);

  const currentCount = propertyWOs.filter(wo => {
    const t = new Date(wo.createdAt).getTime();
    return t >= currentStart && t <= now;
  }).length;

  const priorCount = propertyWOs.filter(wo => {
    const t = new Date(wo.createdAt).getTime();
    return t >= priorStart && t < currentStart;
  }).length;

  if (currentCount > priorCount + 1) return 'rising';
  if (currentCount < priorCount - 1) return 'falling';
  return 'stable';
}

/**
 * Computes weekly ticket creation counts for the last N weeks.
 */
export function computeWeeklyVolume(
  workOrders: WorkOrder[],
  weeks: number = 8
): { week: string; count: number; categories: Record<string, number> }[] {
  const now = new Date();
  const result = [];

  for (let i = weeks - 1; i >= 0; i--) {
    const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
    const weekStart = new Date(weekEnd.getTime() - 7 * 24 * 60 * 60 * 1000);

    const weekWOs = workOrders.filter(wo => {
      const t = new Date(wo.createdAt).getTime();
      return t >= weekStart.getTime() && t < weekEnd.getTime();
    });

    const categories: Record<string, number> = {};
    weekWOs.forEach(wo => {
      categories[wo.category] = (categories[wo.category] || 0) + 1;
    });

    result.push({
      week: `W${weeks - i}`,
      count: weekWOs.length,
      categories,
    });
  }

  return result;
}
