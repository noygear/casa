import prisma from '../prisma.js';
import { computeSLAStatus } from '../../../src/domain/slaTracker.js';

// ── SLA Configuration CRUD ──────────────────────────────────

export async function listSLAConfigs(propertyId?: string) {
  return prisma.sLAConfiguration.findMany({
    where: propertyId ? { propertyId } : undefined,
    include: { property: { select: { id: true, name: true } } },
    orderBy: [{ propertyId: 'asc' }, { category: 'asc' }, { severity: 'asc' }],
  });
}

export async function upsertSLAConfig(data: {
  propertyId: string;
  category: string;
  severity: string;
  responseTimeMin: number;
  resolveTimeMin: number;
}) {
  return prisma.sLAConfiguration.upsert({
    where: {
      propertyId_category_severity: {
        propertyId: data.propertyId,
        category: data.category as any,
        severity: data.severity as any,
      },
    },
    create: {
      propertyId: data.propertyId,
      category: data.category as any,
      severity: data.severity as any,
      responseTimeMin: data.responseTimeMin,
      resolveTimeMin: data.resolveTimeMin,
    },
    update: {
      responseTimeMin: data.responseTimeMin,
      resolveTimeMin: data.resolveTimeMin,
    },
    include: { property: { select: { id: true, name: true } } },
  });
}

export async function deleteSLAConfig(id: string) {
  return prisma.sLAConfiguration.delete({ where: { id } });
}

// ── SLA Compliance ──────────────────────────────────────────

export async function getSLACompliance() {
  // Get all non-terminal work orders with SLA config
  const workOrders = await prisma.workOrder.findMany({
    where: {
      slaResponseMin: { not: null },
      slaResolveMin: { not: null },
    },
    include: {
      property: { select: { id: true, name: true } },
    },
  });

  const results = workOrders.map(wo => {
    const slaStatus = computeSLAStatus({
      createdAt: wo.createdAt.toISOString(),
      respondedAt: wo.respondedAt?.toISOString() ?? null,
      resolvedAt: wo.resolvedAt?.toISOString() ?? null,
      slaResponseMin: wo.slaResponseMin!,
      slaResolveMin: wo.slaResolveMin!,
    });

    return {
      workOrderId: wo.id,
      title: wo.title,
      status: wo.status,
      severity: wo.severity,
      createdAt: wo.createdAt.toISOString(),
      property: wo.property,
      sla: slaStatus,
    };
  });

  // Compute aggregate metrics
  const total = results.length;
  const responseCompliant = results.filter(r => r.sla.responseOnTrack).length;
  const resolveCompliant = results.filter(r => r.sla.resolveOnTrack).length;

  return {
    items: results,
    summary: {
      total,
      responseCompliancePercent: total > 0 ? Math.round((responseCompliant / total) * 100) : 100,
      resolveCompliancePercent: total > 0 ? Math.round((resolveCompliant / total) * 100) : 100,
    },
  };
}
