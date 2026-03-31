import prisma from '../prisma.js';
import { NotFoundError } from '../errors/NotFoundError.js';
import { computeVendorScore, getScoreGrade } from '../../../src/domain/vendorScoringEngine.js';
import { detectUnderperformers, findAlternativeVendors } from '../../../src/domain/vendorReferralEngine.js';

interface VendorFilters {
  isActive?: boolean;
  specialty?: string;
  page: number;
  limit: number;
}

export async function listVendors(filters: VendorFilters) {
  const where: any = {};
  if (filters.isActive !== undefined) where.isActive = filters.isActive;
  if (filters.specialty) where.specialties = { has: filters.specialty };

  const [items, total] = await Promise.all([
    prisma.vendor.findMany({
      where,
      include: {
        scoreRecords: {
          orderBy: { periodEnd: 'desc' },
          take: 1,
        },
        _count: {
          select: { workOrders: true },
        },
      },
      orderBy: { companyName: 'asc' },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
    }),
    prisma.vendor.count({ where }),
  ]);

  return { items, total, page: filters.page, limit: filters.limit };
}

export async function getVendor(id: string) {
  const vendor = await prisma.vendor.findUnique({
    where: { id },
    include: {
      scoreRecords: {
        orderBy: { periodEnd: 'desc' },
        take: 5,
      },
      users: {
        select: { id: true, name: true, email: true },
      },
      _count: {
        select: { workOrders: true },
      },
    },
  });

  if (!vendor) throw new NotFoundError('Vendor', id);
  return vendor;
}

export async function getVendorScores() {
  return prisma.vendorScoreRecord.findMany({
    orderBy: { periodEnd: 'desc' },
    include: { vendor: true },
  });
}

export async function getReferrals(threshold = 80) {
  const vendors = await prisma.vendor.findMany({ where: { isActive: true } });
  const scores = await prisma.vendorScoreRecord.findMany({
    orderBy: { periodEnd: 'desc' },
  });

  // Map to domain types (null → undefined for optional fields)
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
    createdAt: v.createdAt.toISOString(),
    updatedAt: v.updatedAt.toISOString(),
  }));

  const domainScores = scores.map(s => ({
    id: s.id,
    vendorId: s.vendorId,
    periodStart: s.periodStart.toISOString(),
    periodEnd: s.periodEnd.toISOString(),
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
    createdAt: s.createdAt.toISOString(),
  }));

  const underperformers = detectUnderperformers(domainVendors, domainScores, threshold);

  return underperformers.map(({ vendor, score }) => ({
    vendor,
    score,
    alternatives: findAlternativeVendors(vendor, score.score, domainVendors, domainScores),
  }));
}
