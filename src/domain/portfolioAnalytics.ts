// ============================================================
// Portfolio Analytics — Pure Domain Logic
// ============================================================
// Computes portfolio-level metrics for asset managers.
// Zero framework imports.
// ============================================================

import { Property, WorkOrder, Vendor, VendorScoreRecord } from '../types/index.js';

export interface PortfolioSummary {
  totalProperties: number;
  totalSqFt: number;
  totalActiveWOs: number;
  avgOccupancy: number;
  totalMonthlyRevenue: number;
  portfolioHealthScore: number;
}

export interface CostTrendPoint {
  month: string;
  cost: number;
}

export interface VendorAuditRow {
  vendor: Vendor;
  propertiesServed: number;
  totalSpend: number;
  avgScore: number;
  completions: number;
  rejections: number;
  rejectionRate: number;
}

export interface CostCenter {
  propertyName: string;
  category: string;
  totalCost: number;
  ticketCount: number;
}

export function computePortfolioSummary(
  properties: Property[],
  workOrders: WorkOrder[],
  healthScores: number[]
): PortfolioSummary {
  const totalSqFt = properties.reduce((s, p) => s + (p.totalSqFt || 0), 0);
  const activeWOs = workOrders.filter(wo =>
    wo.status !== 'closed' && wo.status !== 'skipped'
  ).length;
  const occupancies = properties.map(p => p.occupancyPercent || 0).filter(o => o > 0);
  const avgOccupancy = occupancies.length > 0
    ? Math.round(occupancies.reduce((a, b) => a + b, 0) / occupancies.length)
    : 0;
  const totalMonthlyRevenue = properties.reduce((s, p) => s + (p.monthlyRevenue || 0), 0);
  const portfolioHealthScore = healthScores.length > 0
    ? Math.round(healthScores.reduce((a, b) => a + b, 0) / healthScores.length)
    : 0;

  return {
    totalProperties: properties.length,
    totalSqFt,
    totalActiveWOs: activeWOs,
    avgOccupancy,
    totalMonthlyRevenue,
    portfolioHealthScore,
  };
}

export function computeCostTrends(workOrders: WorkOrder[], months: number = 12): CostTrendPoint[] {
  const now = new Date();
  const result: CostTrendPoint[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    const monthLabel = monthDate.toLocaleString('default', { month: 'short', year: '2-digit' });

    const monthCost = workOrders
      .filter(wo => {
        if (wo.status !== 'closed' || wo.cost == null) return false;
        const t = new Date(wo.resolvedAt || wo.createdAt);
        return t >= monthDate && t <= monthEnd;
      })
      .reduce((sum, wo) => sum + (wo.cost ?? 0), 0);

    result.push({ month: monthLabel, cost: monthCost });
  }

  return result;
}

export function computeVendorAuditData(
  vendors: Vendor[],
  workOrders: WorkOrder[],
  scores: VendorScoreRecord[]
): VendorAuditRow[] {
  return vendors.map(vendor => {
    const vendorWOs = workOrders.filter(wo => wo.vendorId === vendor.id && wo.status === 'closed');
    const propertiesServed = new Set(vendorWOs.map(wo => wo.propertyId)).size;
    const totalSpend = vendorWOs.reduce((s, wo) => s + (wo.cost ?? 0), 0);
    const score = scores.find(s => s.vendorId === vendor.id);
    const completions = score?.completions ?? vendorWOs.length;
    const rejections = score?.rejections ?? 0;
    const rejectionRate = completions > 0 ? Math.round((rejections / completions) * 100) : 0;

    return {
      vendor,
      propertiesServed,
      totalSpend,
      avgScore: score?.score ?? 0,
      completions,
      rejections,
      rejectionRate,
    };
  });
}

export function getTopCostCenters(
  workOrders: WorkOrder[],
  properties: Property[],
  limit: number = 5
): CostCenter[] {
  const map = new Map<string, { cost: number; count: number; propertyName: string; category: string }>();

  workOrders
    .filter(wo => wo.status === 'closed' && wo.cost != null)
    .forEach(wo => {
      const key = `${wo.propertyId}::${wo.category}`;
      const existing = map.get(key);
      const propertyName = properties.find(p => p.id === wo.propertyId)?.name || wo.propertyId;
      if (existing) {
        existing.cost += wo.cost ?? 0;
        existing.count++;
      } else {
        map.set(key, { cost: wo.cost ?? 0, count: 1, propertyName, category: wo.category });
      }
    });

  return Array.from(map.values())
    .sort((a, b) => b.cost - a.cost)
    .slice(0, limit)
    .map(item => ({
      propertyName: item.propertyName,
      category: item.category,
      totalCost: item.cost,
      ticketCount: item.count,
    }));
}
