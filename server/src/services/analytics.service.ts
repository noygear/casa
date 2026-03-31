import prisma from '../prisma.js';
import { computePortfolioSummary, computeCostTrends, computeVendorAuditData, getTopCostCenters } from '../../../src/domain/portfolioAnalytics.js';
import { computePropertyHealth } from '../../../src/domain/propertyHealthCalculator.js';

function toISOString(d: Date): string {
  return d.toISOString();
}

export async function getPortfolioAnalytics() {
  const [properties, workOrders, vendors, scores] = await Promise.all([
    prisma.property.findMany(),
    prisma.workOrder.findMany({ include: { property: true } }),
    prisma.vendor.findMany({ where: { isActive: true } }),
    prisma.vendorScoreRecord.findMany({ orderBy: { periodEnd: 'desc' } }),
  ]);

  // Map to domain types
  const domainProperties = properties.map(p => ({
    id: p.id,
    name: p.name,
    address: p.address,
    city: p.city,
    state: p.state,
    zipCode: p.zipCode,
    type: p.type,
    totalSqFt: p.totalSqFt ?? undefined,
    yearBuilt: p.yearBuilt ?? undefined,
    imageUrl: p.imageUrl ?? undefined,
    latitude: p.latitude ?? undefined,
    longitude: p.longitude ?? undefined,
    occupancyPercent: p.occupancyPercent ?? undefined,
    monthlyRevenue: p.monthlyRevenue ?? undefined,
    createdAt: toISOString(p.createdAt),
    updatedAt: toISOString(p.updatedAt),
  }));

  const domainWorkOrders = workOrders.map(wo => ({
    id: wo.id,
    title: wo.title,
    description: wo.description,
    status: wo.status as any,
    severity: wo.severity as any,
    category: wo.category as any,
    isInspection: wo.isInspection,
    cost: wo.cost,
    propertyId: wo.propertyId,
    spaceId: wo.spaceId,
    createdById: wo.createdById,
    assignedToId: wo.assignedToId,
    vendorId: wo.vendorId,
    dueDate: wo.dueDate?.toISOString(),
    respondedAt: wo.respondedAt?.toISOString(),
    resolvedAt: wo.resolvedAt?.toISOString(),
    slaResponseMin: wo.slaResponseMin ?? undefined,
    slaResolveMin: wo.slaResolveMin ?? undefined,
    createdAt: toISOString(wo.createdAt),
    updatedAt: toISOString(wo.updatedAt),
  }));

  const domainVendors = vendors.map(v => ({
    id: v.id,
    companyName: v.companyName,
    contactEmail: v.contactEmail,
    contactPhone: v.contactPhone ?? undefined,
    specialties: v.specialties,
    licenseNo: v.licenseNo ?? undefined,
    insuranceExp: v.insuranceExp?.toISOString(),
    rating: v.rating,
    isActive: v.isActive,
    createdAt: toISOString(v.createdAt),
    updatedAt: toISOString(v.updatedAt),
  }));

  const domainScores = scores.map(s => ({
    id: s.id,
    vendorId: s.vendorId,
    periodStart: toISOString(s.periodStart),
    periodEnd: toISOString(s.periodEnd),
    score: s.score,
    rejections: s.rejections,
    skips: s.skips,
    lateDays: s.lateDays,
    completions: s.completions,
    bonus: s.bonus,
    quality: s.quality,
    consistency: s.consistency,
    speed: s.speed,
    volume: s.volume,
    createdAt: toISOString(s.createdAt),
  }));

  // Compute property health scores
  const healthScores = domainProperties.map(p =>
    computePropertyHealth(domainWorkOrders, p.id).score
  );

  return {
    portfolio: computePortfolioSummary(domainProperties, domainWorkOrders, healthScores),
    costTrends: computeCostTrends(domainWorkOrders, 12),
    vendorAudit: computeVendorAuditData(domainVendors, domainWorkOrders, domainScores),
    topCostCenters: getTopCostCenters(domainWorkOrders, domainProperties, 10),
  };
}
