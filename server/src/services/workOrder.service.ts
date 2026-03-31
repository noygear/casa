import prisma from '../prisma.js';
import { NotFoundError } from '../errors/NotFoundError.js';
import { ForbiddenError } from '../errors/AuthError.js';
import {
  validateTransition,
  isRejection,
  type TransitionContext,
} from '../../../src/domain/workOrderStateMachine.js';
import { findPreferredVendor } from '../../../src/domain/autoAssigner.js';
import type { UserRole, WorkOrderStatus } from '../../../src/types/index.js';

const WORK_ORDER_INCLUDE = {
  property: true,
  space: true,
  createdBy: { select: { id: true, name: true, email: true, role: true } },
  assignedTo: { select: { id: true, name: true, email: true, role: true, vendorId: true } },
  vendor: true,
  photos: { orderBy: { uploadedAt: 'asc' as const } },
  auditLog: {
    orderBy: { createdAt: 'asc' as const },
    include: { user: { select: { id: true, name: true, role: true } } },
  },
};

interface ListFilters {
  status?: string;
  severity?: string;
  category?: string;
  propertyId?: string;
  vendorId?: string;
  assignedToId?: string;
  createdById?: string;
  page: number;
  limit: number;
}

export async function listWorkOrders(filters: ListFilters, user: { id: string; role: UserRole; vendorId: string | null }) {
  const where: any = {};

  // RBAC: tenants see only their own, vendors see only assigned
  if (user.role === 'tenant') {
    where.createdById = user.id;
  } else if (user.role === 'vendor') {
    where.OR = [
      { assignedToId: user.id },
      { vendorId: user.vendorId },
    ];
  }

  // Apply filters
  if (filters.status) where.status = filters.status;
  if (filters.severity) where.severity = filters.severity;
  if (filters.category) where.category = filters.category;
  if (filters.propertyId) where.propertyId = filters.propertyId;
  if (filters.vendorId) where.vendorId = filters.vendorId;
  if (filters.assignedToId) where.assignedToId = filters.assignedToId;
  if (filters.createdById && user.role !== 'tenant') where.createdById = filters.createdById;

  const [items, total] = await Promise.all([
    prisma.workOrder.findMany({
      where,
      include: WORK_ORDER_INCLUDE,
      orderBy: { createdAt: 'desc' },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
    }),
    prisma.workOrder.count({ where }),
  ]);

  return { items, total, page: filters.page, limit: filters.limit };
}

export async function getWorkOrder(id: string, user: { id: string; role: UserRole; vendorId: string | null }) {
  const wo = await prisma.workOrder.findUnique({
    where: { id },
    include: WORK_ORDER_INCLUDE,
  });

  if (!wo) throw new NotFoundError('WorkOrder', id);

  // RBAC check
  if (user.role === 'tenant' && wo.createdById !== user.id) {
    throw new ForbiddenError('You can only view your own work orders');
  }
  if (user.role === 'vendor' && wo.assignedToId !== user.id && wo.vendorId !== user.vendorId) {
    throw new ForbiddenError('You can only view work orders assigned to you');
  }

  return wo;
}

export async function createWorkOrder(
  data: {
    title: string;
    description: string;
    severity?: string;
    category?: string;
    isInspection?: boolean;
    propertyId: string;
    spaceId?: string | null;
    vendorId?: string | null;
    assignedToId?: string | null;
    dueDate?: string | null;
  },
  userId: string
) {
  // Verify property exists
  const property = await prisma.property.findUnique({ where: { id: data.propertyId } });
  if (!property) throw new NotFoundError('Property', data.propertyId);

  // Look up SLA config for auto-populating SLA times
  const slaConfig = await prisma.sLAConfiguration.findUnique({
    where: {
      propertyId_category_severity: {
        propertyId: data.propertyId,
        category: (data.category || 'general') as any,
        severity: (data.severity || 'minor') as any,
      },
    },
  });

  // Auto-assign vendor if not specified
  let vendorId = data.vendorId;
  let assignedToId = data.assignedToId;
  let status: WorkOrderStatus = 'open';

  if (!vendorId) {
    const mappings = await prisma.preferredVendorMapping.findMany({
      where: { propertyId: data.propertyId },
    });
    const vendors = await prisma.vendor.findMany({ where: { isActive: true } });

    // Map Prisma models to domain types
    const domainMappings = mappings.map(m => ({
      id: m.id,
      propertyId: m.propertyId,
      category: m.category as any,
      vendorId: m.vendorId,
      priority: m.priority,
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
      createdAt: v.createdAt.toISOString(),
      updatedAt: v.updatedAt.toISOString(),
    }));

    const preferred = findPreferredVendor(
      data.propertyId,
      (data.category || 'general') as any,
      domainMappings,
      domainVendors
    );

    if (preferred) {
      vendorId = preferred.id;
      // Find vendor user to assign
      const vendorUser = await prisma.user.findFirst({
        where: { vendorId: preferred.id, role: 'vendor' },
      });
      if (vendorUser) {
        assignedToId = vendorUser.id;
        status = 'assigned';
      }
    }
  } else if (vendorId && assignedToId) {
    status = 'assigned';
  }

  const workOrder = await prisma.workOrder.create({
    data: {
      title: data.title,
      description: data.description,
      severity: (data.severity || 'minor') as any,
      category: (data.category || 'general') as any,
      isInspection: data.isInspection || false,
      propertyId: data.propertyId,
      spaceId: data.spaceId || undefined,
      vendorId: vendorId || undefined,
      assignedToId: assignedToId || undefined,
      createdById: userId,
      status,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      slaResponseMin: slaConfig?.responseTimeMin,
      slaResolveMin: slaConfig?.resolveTimeMin,
    },
    include: WORK_ORDER_INCLUDE,
  });

  // Create initial audit log
  await prisma.workOrderAuditLog.create({
    data: {
      workOrderId: workOrder.id,
      userId,
      fromStatus: '',
      toStatus: status,
      comment: status === 'assigned' ? 'Auto-assigned to preferred vendor' : 'Work order created',
    },
  });

  return workOrder;
}

export async function updateWorkOrder(
  id: string,
  data: {
    status?: string;
    assignedToId?: string | null;
    vendorId?: string | null;
    cost?: number | null;
    comment?: string;
  },
  user: { id: string; role: UserRole; vendorId: string | null }
) {
  const wo = await prisma.workOrder.findUnique({
    where: { id },
    include: { photos: true },
  });

  if (!wo) throw new NotFoundError('WorkOrder', id);

  // RBAC for vendors
  if (user.role === 'vendor' && wo.assignedToId !== user.id && wo.vendorId !== user.vendorId) {
    throw new ForbiddenError('You can only update work orders assigned to you');
  }
  if (user.role === 'tenant') {
    throw new ForbiddenError('Tenants cannot update work orders');
  }

  // If status change requested, validate via state machine
  if (data.status && data.status !== wo.status) {
    const photos = wo.photos;
    const ctx: TransitionContext = {
      currentStatus: wo.status as WorkOrderStatus,
      targetStatus: data.status as WorkOrderStatus,
      userRole: user.role as UserRole,
      hasCompletionPhotos: photos.some(p => p.type === 'completion' || p.type === 'after'),
      hasStartPhoto: photos.some(p => p.type === 'start'),
      isInspection: wo.isInspection,
      hasBeforePhoto: photos.some(p => p.type === 'before'),
      hasAfterPhoto: photos.some(p => p.type === 'after'),
    };

    // This throws WorkOrderTransitionError on invalid transition
    validateTransition(ctx);

    const updateData: any = { status: data.status };

    // Track SLA timestamps
    if (data.status === 'in_progress' && !wo.respondedAt) {
      updateData.respondedAt = new Date();
    }
    if (data.status === 'closed') {
      updateData.resolvedAt = new Date();
    }

    // Apply cost if provided
    if (data.cost !== undefined) {
      updateData.cost = data.cost;
    }

    // Apply assignment changes
    if (data.assignedToId !== undefined) {
      updateData.assignedToId = data.assignedToId;
    }
    if (data.vendorId !== undefined) {
      updateData.vendorId = data.vendorId;
    }

    // Use transaction: update status + create immutable audit log
    const [updated] = await prisma.$transaction([
      prisma.workOrder.update({
        where: { id },
        data: updateData,
        include: WORK_ORDER_INCLUDE,
      }),
      prisma.workOrderAuditLog.create({
        data: {
          workOrderId: id,
          userId: user.id,
          fromStatus: wo.status,
          toStatus: data.status,
          comment: isRejection(wo.status as WorkOrderStatus, data.status as WorkOrderStatus)
            ? data.comment || 'Rejected — sent back for rework'
            : data.comment,
        },
      }),
    ]);

    return updated;
  }

  // Non-status update (assignment, cost, etc.)
  const updateData: any = {};
  if (data.assignedToId !== undefined) updateData.assignedToId = data.assignedToId;
  if (data.vendorId !== undefined) updateData.vendorId = data.vendorId;
  if (data.cost !== undefined) updateData.cost = data.cost;

  return prisma.workOrder.update({
    where: { id },
    data: updateData,
    include: WORK_ORDER_INCLUDE,
  });
}
