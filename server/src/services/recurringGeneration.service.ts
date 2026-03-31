import prisma from '../prisma.js';
import {
  computeNextDueDate,
  isDueWithinHorizon,
  formatRecurringTitle,
} from '../../../src/domain/recurringScheduler.js';
import type { MaintenanceFrequency } from '../../../src/types/index.js';

const DEFAULT_HORIZON_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface GenerationResult {
  templateId: string;
  templateName: string;
  instanceId: string;
  workOrderId: string;
  dueDate: string;
}

/**
 * Scan all active recurring templates and generate RecurringInstance +
 * WorkOrder records for any that are due within the horizon.
 *
 * Idempotent: skips if an instance already exists for the computed due date.
 * Catches errors per-template so one failure doesn't block others.
 */
export async function generateDueInstances(
  options?: { horizonMs?: number; now?: Date },
): Promise<GenerationResult[]> {
  const now = options?.now ?? new Date();
  const horizonMs = options?.horizonMs ?? DEFAULT_HORIZON_MS;
  const results: GenerationResult[] = [];

  // Find a system user (first asset_manager) for createdById
  const systemUser = await prisma.user.findFirst({
    where: { role: 'asset_manager' },
    select: { id: true },
  });
  if (!systemUser) {
    console.error('Scheduler: no asset_manager user found for createdById — skipping generation');
    return results;
  }

  const templates = await prisma.recurringTemplate.findMany({
    where: { isActive: true },
  });

  for (const template of templates) {
    try {
      const templateResults = await generateForTemplate(
        template,
        systemUser.id,
        now,
        horizonMs,
      );
      results.push(...templateResults);
    } catch (err) {
      console.error(`Scheduler: failed to process template "${template.name}" (${template.id}):`, err);
    }
  }

  return results;
}

async function generateForTemplate(
  template: {
    id: string;
    name: string;
    description: string;
    category: string;
    severity: string;
    frequency: string;
    customDays: number | null;
    propertyId: string;
    spaceId: string | null;
    vendorId: string | null;
  },
  systemUserId: string,
  now: Date,
  horizonMs: number,
): Promise<GenerationResult[]> {
  const results: GenerationResult[] = [];
  const frequency = template.frequency as MaintenanceFrequency;
  const customDays = template.customDays;

  // Find the most recent instance to use as anchor
  const lastInstance = await prisma.recurringInstance.findFirst({
    where: { templateId: template.id },
    orderBy: { dueDate: 'desc' },
  });

  // Determine anchor: if no instances exist, set anchor so first computeNextDueDate yields today
  let anchor: Date;
  if (lastInstance) {
    anchor = lastInstance.dueDate;
  } else {
    // Subtract one interval from today so the first next-due is today
    const today = new Date(now);
    today.setUTCHours(0, 0, 0, 0);
    anchor = subtractOneInterval(today, frequency, customDays);
  }

  // Generate instances in a loop to catch up if server was down
  while (true) {
    const nextDue = computeNextDueDate({ frequency, customDays, anchor });

    if (!isDueWithinHorizon(nextDue, now, horizonMs)) break;

    // Idempotency check: skip if instance already exists for this date
    const existing = await prisma.recurringInstance.findFirst({
      where: {
        templateId: template.id,
        dueDate: nextDue,
      },
    });

    if (!existing) {
      const result = await createInstanceAndWorkOrder(
        template,
        nextDue,
        frequency,
        systemUserId,
      );
      results.push(result);
    }

    anchor = nextDue;
  }

  return results;
}

async function createInstanceAndWorkOrder(
  template: {
    id: string;
    name: string;
    description: string;
    category: string;
    severity: string;
    propertyId: string;
    spaceId: string | null;
    vendorId: string | null;
  },
  dueDate: Date,
  frequency: MaintenanceFrequency,
  systemUserId: string,
): Promise<GenerationResult> {
  // Look up SLA configuration for this property/category/severity
  const slaConfig = await prisma.sLAConfiguration.findUnique({
    where: {
      propertyId_category_severity: {
        propertyId: template.propertyId,
        category: template.category as any,
        severity: template.severity as any,
      },
    },
  });

  const title = formatRecurringTitle(template.name, frequency, dueDate);

  const [instance, workOrder] = await prisma.$transaction(async (tx) => {
    const inst = await tx.recurringInstance.create({
      data: {
        templateId: template.id,
        dueDate,
      },
    });

    const wo = await tx.workOrder.create({
      data: {
        title,
        description: template.description,
        status: 'open',
        severity: template.severity as any,
        category: template.category as any,
        propertyId: template.propertyId,
        spaceId: template.spaceId ?? undefined,
        vendorId: template.vendorId ?? undefined,
        createdById: systemUserId,
        recurringInstanceId: inst.id,
        dueDate,
        slaResponseMin: slaConfig?.responseTimeMin,
        slaResolveMin: slaConfig?.resolveTimeMin,
      },
    });

    return [inst, wo] as const;
  });

  return {
    templateId: template.id,
    templateName: template.name,
    instanceId: instance.id,
    workOrderId: workOrder.id,
    dueDate: dueDate.toISOString(),
  };
}

/**
 * Subtract one interval from a date to create an anchor that yields
 * the original date when computeNextDueDate is called.
 */
function subtractOneInterval(
  date: Date,
  frequency: MaintenanceFrequency,
  customDays?: number | null,
): Date {
  const result = new Date(date);
  switch (frequency) {
    case 'daily':
      result.setUTCDate(result.getUTCDate() - 1);
      break;
    case 'weekly':
      result.setUTCDate(result.getUTCDate() - 7);
      break;
    case 'monthly':
      result.setUTCMonth(result.getUTCMonth() - 1);
      break;
    case 'quarterly':
      result.setUTCMonth(result.getUTCMonth() - 3);
      break;
    case 'annually':
      result.setUTCFullYear(result.getUTCFullYear() - 1);
      break;
    case 'custom':
      if (!customDays || customDays <= 0) {
        throw new Error('Custom frequency requires a positive customDays value');
      }
      result.setUTCDate(result.getUTCDate() - customDays);
      break;
  }
  return result;
}
