import prisma from '../prisma.js';
import { computeSLAStatus } from '../../../src/domain/slaTracker.js';

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
