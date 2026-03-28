import prisma from '../prisma.js';
import { NotFoundError } from '../errors/NotFoundError.js';

export async function listTemplates() {
  return prisma.recurringTemplate.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export async function createTemplate(data: {
  name: string;
  description: string;
  category: any;
  severity?: any;
  frequency: any;
  customDays?: number;
  propertyId: string;
  spaceId?: string;
  vendorId?: string;
}) {
  return prisma.recurringTemplate.create({ data });
}

export async function updateTemplate(id: string, data: {
  name?: string;
  description?: string;
  severity?: any;
  frequency?: any;
  customDays?: number | null;
  vendorId?: string | null;
  isActive?: boolean;
}) {
  const existing = await prisma.recurringTemplate.findUnique({ where: { id } });
  if (!existing) {
    throw new NotFoundError('RecurringTemplate', id);
  }

  return prisma.recurringTemplate.update({
    where: { id },
    data,
  });
}
