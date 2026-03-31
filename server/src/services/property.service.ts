import prisma from '../prisma.js';
import { NotFoundError } from '../errors/NotFoundError.js';

interface PropertyFilters {
  type?: string;
  city?: string;
  state?: string;
  search?: string;
  page: number;
  limit: number;
}

export async function listProperties(filters: PropertyFilters) {
  const where: any = {};
  if (filters.type) where.type = filters.type;
  if (filters.city) where.city = { contains: filters.city, mode: 'insensitive' };
  if (filters.state) where.state = { contains: filters.state, mode: 'insensitive' };
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { address: { contains: filters.search, mode: 'insensitive' } },
      { city: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.property.findMany({
      where,
      include: {
        spaces: true,
        _count: {
          select: { workOrders: true },
        },
      },
      orderBy: { name: 'asc' },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
    }),
    prisma.property.count({ where }),
  ]);

  return { items, total, page: filters.page, limit: filters.limit };
}

export async function getProperty(id: string) {
  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      spaces: true,
      slaConfigs: true,
      _count: {
        select: { workOrders: true },
      },
    },
  });

  if (!property) throw new NotFoundError('Property', id);
  return property;
}

export async function createProperty(data: {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  type: string;
  totalSqFt?: number;
  yearBuilt?: number;
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
  occupancyPercent?: number;
  monthlyRevenue?: number;
}) {
  return prisma.property.create({
    data,
    include: { spaces: true },
  });
}

export async function listSpaces(propertyId?: string) {
  const where: any = {};
  if (propertyId) where.propertyId = propertyId;

  return prisma.space.findMany({
    where,
    include: { property: { select: { id: true, name: true } } },
    orderBy: { name: 'asc' },
  });
}
