import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEFAULT_PASSWORD = 'Casa2025!';

// ── Stable UUID constants ────────────────────────────────────
// Format: <entity-prefix>0000-0000-4000-8000-<zero-padded-index>
// These are valid v4-like UUIDs that are deterministic across seed runs.

const V1 = '10000000-0000-4000-8000-000000000001'; // Alpha HVAC
const V2 = '10000000-0000-4000-8000-000000000002'; // Spark Electric
const V3 = '10000000-0000-4000-8000-000000000003'; // CleanPro Janitorial
const V4 = '10000000-0000-4000-8000-000000000004'; // Summit Elevator

const U1 = '20000000-0000-4000-8000-000000000001'; // Sarah Chen — asset_manager
const U2 = '20000000-0000-4000-8000-000000000002'; // James Porter — property_manager
const U3 = '20000000-0000-4000-8000-000000000003'; // Mike Rodriguez — vendor (V1)
const U4 = '20000000-0000-4000-8000-000000000004'; // Lisa Tran — vendor (V2)
const U5 = '20000000-0000-4000-8000-000000000005'; // David Kim — tenant
const U6 = '20000000-0000-4000-8000-000000000006'; // Carlos Martinez — vendor (V3)
const U7 = '20000000-0000-4000-8000-000000000007'; // John Smith — tenant

const P1 = '30000000-0000-4000-8000-000000000001'; // Meridian Tower
const P2 = '30000000-0000-4000-8000-000000000002'; // Riverfront Plaza
const P3 = '30000000-0000-4000-8000-000000000003'; // Oakmont Business Park

const S1  = '40000000-0000-4000-8000-000000000001'; // Suite 200, P1
const S2  = '40000000-0000-4000-8000-000000000002'; // Suite 500, P1
const S3  = '40000000-0000-4000-8000-000000000003'; // Main Lobby, P1
const S4  = '40000000-0000-4000-8000-000000000004'; // Parking Garage B1, P1
const S5  = '40000000-0000-4000-8000-000000000005'; // Rooftop Mechanical, P1
const S6  = '40000000-0000-4000-8000-000000000006'; // Suite 100, P2
const S7  = '40000000-0000-4000-8000-000000000007'; // Suite 301, P2
const S8  = '40000000-0000-4000-8000-000000000008'; // Courtyard, P2
const S9  = '40000000-0000-4000-8000-000000000009'; // Unit A, P3
const S10 = '40000000-0000-4000-8000-000000000010'; // Loading Dock, P3

const W1 = '50000000-0000-4000-8000-000000000001';
const W2 = '50000000-0000-4000-8000-000000000002';
const W3 = '50000000-0000-4000-8000-000000000003';
const W4 = '50000000-0000-4000-8000-000000000004';
const W5 = '50000000-0000-4000-8000-000000000005';
const W6 = '50000000-0000-4000-8000-000000000006';
const W7 = '50000000-0000-4000-8000-000000000007';
const W8 = '50000000-0000-4000-8000-000000000008';
const W9 = '50000000-0000-4000-8000-000000000009';

const VS1 = '60000000-0000-4000-8000-000000000001';
const VS2 = '60000000-0000-4000-8000-000000000002';
const VS3 = '60000000-0000-4000-8000-000000000003';
const VS4 = '60000000-0000-4000-8000-000000000004';

const RT1 = '70000000-0000-4000-8000-000000000001';
const RT2 = '70000000-0000-4000-8000-000000000002';
const RT3 = '70000000-0000-4000-8000-000000000003';
const RT4 = '70000000-0000-4000-8000-000000000004';
const RT5 = '70000000-0000-4000-8000-000000000005';

const PVM1  = '80000000-0000-4000-8000-000000000001';
const PVM2  = '80000000-0000-4000-8000-000000000002';
const PVM3  = '80000000-0000-4000-8000-000000000003';
const PVM4  = '80000000-0000-4000-8000-000000000004';
const PVM5  = '80000000-0000-4000-8000-000000000005';
const PVM6  = '80000000-0000-4000-8000-000000000006';
const PVM7  = '80000000-0000-4000-8000-000000000007';
const PVM8  = '80000000-0000-4000-8000-000000000008';
const PVM9  = '80000000-0000-4000-8000-000000000009';
const PVM10 = '80000000-0000-4000-8000-000000000010';

function isUUID(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

async function clearLegacyData() {
  console.log('[seed] Clearing legacy non-UUID data (FK-safe order)...');
  await prisma.workOrderAuditLog.deleteMany();
  await prisma.workOrderPhoto.deleteMany();
  await prisma.inspectionReport.deleteMany();
  await prisma.recurringInstance.deleteMany();
  await prisma.workOrder.deleteMany();
  await prisma.recurringTemplate.deleteMany();
  await prisma.preferredVendorMapping.deleteMany();
  await prisma.sLAConfiguration.deleteMany();
  await prisma.vendorScoreRecord.deleteMany();
  await prisma.space.deleteMany();
  await prisma.property.deleteMany();
  await prisma.revokedToken.deleteMany();
  await prisma.user.deleteMany();
  await prisma.vendor.deleteMany();
  console.log('[seed] Database cleared.');
}

async function main() {
  console.log('Seeding database...');

  // Detect legacy data (non-UUID IDs) and clear if found
  const firstUser = await prisma.user.findFirst();
  if (firstUser && !isUUID(firstUser.id)) {
    await clearLegacyData();
  }

  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 12);

  // ── Vendors ──────────────────────────────────────────────────
  const vendors = [
    { id: V1, companyName: 'Alpha HVAC Services', contactEmail: 'ops@alphahvac.com', contactPhone: '(214) 555-0100', specialties: ['hvac'], licenseNo: 'HVAC-TX-4821', rating: 92, isActive: true },
    { id: V2, companyName: 'Spark Electric Co.', contactEmail: 'dispatch@sparkelectric.com', contactPhone: '(214) 555-0200', specialties: ['electrical', 'fire_safety'], licenseNo: 'ELEC-TX-9912', rating: 87, isActive: true },
    { id: V3, companyName: 'CleanPro Janitorial', contactEmail: 'martinez@cleanpro.com', contactPhone: '(817) 555-0300', specialties: ['janitorial', 'landscaping'], rating: 78, isActive: true },
    { id: V4, companyName: 'Summit Elevator Corp', contactEmail: 'service@summitelev.com', contactPhone: '(972) 555-0400', specialties: ['elevator'], licenseNo: 'ELEV-TX-2204', rating: 95, isActive: true },
  ];
  for (const v of vendors) await prisma.vendor.upsert({ where: { id: v.id }, update: v, create: v });

  // ── Users ────────────────────────────────────────────────────
  const users = [
    { id: U1, email: 'sarah.chen@casa.com', name: 'Sarah Chen', role: 'asset_manager' as const, passwordHash },
    { id: U2, email: 'james.porter@meridianpm.com', name: 'James Porter', role: 'property_manager' as const, passwordHash },
    { id: U3, email: 'ops@alphahvac.com', name: 'Mike Rodriguez', role: 'vendor' as const, vendorId: V1, passwordHash },
    { id: U4, email: 'dispatch@sparkelectric.com', name: 'Lisa Tran', role: 'vendor' as const, vendorId: V2, passwordHash },
    { id: U5, email: 'tenant@greenleafcorp.com', name: 'David Kim', role: 'tenant' as const, passwordHash },
    { id: U6, email: 'martinez@cleanpro.com', name: 'Carlos Martinez', role: 'vendor' as const, vendorId: V3, passwordHash },
    { id: U7, email: 'j.smith@retailco.com', name: 'John Smith', role: 'tenant' as const, passwordHash },
  ];
  for (const u of users) await prisma.user.upsert({ where: { id: u.id }, update: u, create: u });

  // ── Properties ───────────────────────────────────────────────
  const properties = [
    { id: P1, name: 'Meridian Tower', address: '1200 Commerce Blvd', city: 'Dallas', state: 'TX', zipCode: '75201', type: 'Office', totalSqFt: 285000, yearBuilt: 2018, latitude: 32.7767, longitude: -96.7970, occupancyPercent: 92, monthlyRevenue: 425000 },
    { id: P2, name: 'Riverfront Plaza', address: '800 Trinity Ave', city: 'Fort Worth', state: 'TX', zipCode: '76102', type: 'Mixed-Use', totalSqFt: 420000, yearBuilt: 2015, latitude: 32.7555, longitude: -97.3308, occupancyPercent: 87, monthlyRevenue: 580000 },
    { id: P3, name: 'Oakmont Business Park', address: '3500 Innovation Dr', city: 'Plano', state: 'TX', zipCode: '75024', type: 'Industrial', totalSqFt: 180000, yearBuilt: 2020, latitude: 33.0198, longitude: -96.6989, occupancyPercent: 95, monthlyRevenue: 210000 },
  ];
  for (const p of properties) await prisma.property.upsert({ where: { id: p.id }, update: p, create: p });

  // ── Spaces ───────────────────────────────────────────────────
  const spaces = [
    { id: S1,  propertyId: P1, name: 'Suite 200',           floor: 2,  type: 'suite',       tenantName: 'GreenLeaf Corp',       sqFt: 4500  },
    { id: S2,  propertyId: P1, name: 'Suite 500',           floor: 5,  type: 'suite',       tenantName: 'Apex Consulting',      sqFt: 6200  },
    { id: S3,  propertyId: P1, name: 'Main Lobby',          floor: 1,  type: 'common_area',                                     sqFt: 3000  },
    { id: S4,  propertyId: P1, name: 'Parking Garage B1',   floor: -1, type: 'common_area',                                     sqFt: 25000 },
    { id: S5,  propertyId: P1, name: 'Rooftop Mechanical',  floor: 12, type: 'common_area',                                     sqFt: 2000  },
    { id: S6,  propertyId: P2, name: 'Suite 100',           floor: 1,  type: 'suite',       tenantName: 'River Cafe',           sqFt: 2800  },
    { id: S7,  propertyId: P2, name: 'Suite 301',           floor: 3,  type: 'suite',       tenantName: 'Vanguard Legal',       sqFt: 5100  },
    { id: S8,  propertyId: P2, name: 'Courtyard',           floor: 1,  type: 'common_area',                                     sqFt: 4000  },
    { id: S9,  propertyId: P3, name: 'Unit A',              floor: 1,  type: 'suite',       tenantName: 'FastTrack Logistics',  sqFt: 45000 },
    { id: S10, propertyId: P3, name: 'Loading Dock',        floor: 1,  type: 'common_area',                                     sqFt: 8000  },
  ];
  for (const s of spaces) await prisma.space.upsert({ where: { id: s.id }, update: s, create: s });

  // ── Work Orders ──────────────────────────────────────────────
  const now = new Date();
  const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600000);
  const daysAgo  = (d: number) => new Date(now.getTime() - d * 86400000);

  const workOrders = [
    { id: W1, title: 'HVAC Unit Not Cooling — Suite 200', description: 'Tenant reports AC unit in Suite 200 is blowing warm air. Thermostat set to 72°F but room reading 81°F.', status: 'in_progress' as const, severity: 'needs_fix_today' as const, category: 'hvac' as const, isInspection: false, propertyId: P1, spaceId: S1, createdById: U5, assignedToId: U3, vendorId: V1, dueDate: hoursAgo(-4), respondedAt: hoursAgo(1), slaResponseMin: 120, slaResolveMin: 480, createdAt: hoursAgo(3) },
    { id: W2, title: 'Quarterly Fire Alarm Inspection', description: 'Scheduled quarterly fire alarm system inspection. All floors must be tested with photo documentation.', status: 'needs_review' as const, severity: 'minor' as const, category: 'fire_safety' as const, isInspection: true, cost: 450.00, propertyId: P1, createdById: U2, assignedToId: U4, vendorId: V2, dueDate: daysAgo(-1), respondedAt: daysAgo(2), slaResponseMin: 1440, slaResolveMin: 10080, createdAt: daysAgo(5) },
    { id: W3, title: 'Water Leak in Parking Garage B1', description: 'Standing water near column B-12 in underground parking. Possible pipe leak above ceiling tiles.', status: 'open' as const, severity: 'immediate' as const, category: 'plumbing' as const, isInspection: false, propertyId: P1, spaceId: S4, createdById: U2, slaResponseMin: 60, slaResolveMin: 240, createdAt: hoursAgo(0.5) },
    { id: W4, title: 'Lobby Light Fixture Flickering', description: 'Two recessed LED panels in the main lobby are flickering intermittently.', status: 'assigned' as const, severity: 'minor' as const, category: 'electrical' as const, isInspection: false, propertyId: P1, spaceId: S3, createdById: U2, assignedToId: U4, vendorId: V2, dueDate: daysAgo(-3), slaResponseMin: 480, slaResolveMin: 2880, createdAt: daysAgo(1) },
    { id: W5, title: 'Courtyard Landscaping — Monthly Service', description: 'Monthly landscaping maintenance for Riverfront Plaza courtyard.', status: 'closed' as const, severity: 'minor' as const, category: 'landscaping' as const, isInspection: false, cost: 1500.00, propertyId: P2, spaceId: S8, createdById: U2, assignedToId: U6, vendorId: V3, dueDate: daysAgo(2), respondedAt: daysAgo(6), resolvedAt: daysAgo(3), slaResponseMin: 1440, slaResolveMin: 10080, createdAt: daysAgo(8) },
    { id: W6, title: 'Elevator Annual Safety Inspection', description: 'Annual elevator safety inspection required by code.', status: 'assigned' as const, severity: 'needs_fix_today' as const, category: 'elevator' as const, isInspection: true, propertyId: P2, createdById: U1, assignedToId: U3, vendorId: V4, dueDate: daysAgo(-2), slaResponseMin: 480, slaResolveMin: 4320, createdAt: daysAgo(3) },
    { id: W7, title: 'Loading Dock Gate Malfunction', description: 'Automated roll-up gate at loading dock is not responding to remote.', status: 'in_progress' as const, severity: 'needs_fix_today' as const, category: 'structural' as const, isInspection: false, propertyId: P3, spaceId: S10, createdById: U2, assignedToId: U3, vendorId: V1, dueDate: daysAgo(-1), respondedAt: hoursAgo(8), slaResponseMin: 240, slaResolveMin: 1440, createdAt: daysAgo(1) },
    { id: W8, title: 'Restroom Deep Clean — Suite 301 Floor', description: 'Tenant-requested deep clean of shared restrooms on floor 3.', status: 'closed' as const, severity: 'minor' as const, category: 'janitorial' as const, isInspection: false, cost: 325.50, propertyId: P2, spaceId: S7, createdById: U5, assignedToId: U6, vendorId: V3, dueDate: daysAgo(5), respondedAt: daysAgo(8), resolvedAt: daysAgo(6), slaResponseMin: 480, slaResolveMin: 2880, createdAt: daysAgo(10) },
    { id: W9, title: 'Partial Power Outage — Suite 400', description: 'Tenant reported half the suite lost power. Breaker box tripping immediately.', status: 'in_progress' as const, severity: 'needs_fix_today' as const, category: 'electrical' as const, isInspection: false, propertyId: P1, spaceId: S1, createdById: U2, assignedToId: U4, vendorId: V2, dueDate: daysAgo(0), respondedAt: hoursAgo(1), slaResponseMin: 240, slaResolveMin: 1440, createdAt: hoursAgo(4) },
  ];
  for (const wo of workOrders) await prisma.workOrder.upsert({ where: { id: wo.id }, update: wo, create: wo });

  // ── Historical Work Orders (50 closed for analytics) ──────────
  const categories = ['plumbing', 'electrical', 'hvac', 'structural', 'janitorial', 'fire_safety', 'elevator', 'landscaping'] as const;
  const propIds  = [P1, P2, P3];
  const venIds   = [V1, V2, V3, V4];
  const histBase = '50000000-0000-4000-8000-0000000001';

  for (let i = 0; i < 50; i++) {
    const propId      = propIds[i % propIds.length];
    const venId       = venIds[i % venIds.length];
    const cat         = categories[i % categories.length];
    const daysOffset  = Math.floor((i * 7) % 365) + 1;
    const created     = daysAgo(daysOffset);
    const resolved    = new Date(created.getTime() + (Math.floor(i % 48) + 1) * 3600000);
    const cost        = Math.floor(((i * 137) % 1900) + 100);
    const histId      = `${histBase}${String(i).padStart(2, '0')}`;

    await prisma.workOrder.upsert({
      where: { id: histId },
      update: {},
      create: {
        id: histId,
        title: `Completed Maintenance — ${cat.replace('_', ' ')}`,
        description: 'Historical work order for analytics.',
        status: 'closed',
        severity: 'minor',
        category: cat,
        isInspection: false,
        cost,
        propertyId: propId,
        createdById: U2,
        assignedToId: U3,
        vendorId: venId,
        respondedAt: new Date(created.getTime() + 3600000),
        resolvedAt: resolved,
        createdAt: created,
      },
    });

    await prisma.workOrderAuditLog.createMany({
      data: [
        { workOrderId: histId, userId: U2, fromStatus: 'open',        toStatus: 'assigned',     createdAt: new Date(created.getTime() + 3600000) },
        { workOrderId: histId, userId: U3, fromStatus: 'assigned',    toStatus: 'in_progress',  createdAt: new Date(created.getTime() + 7200000) },
        { workOrderId: histId, userId: U3, fromStatus: 'in_progress', toStatus: 'needs_review', createdAt: new Date(resolved.getTime() - 3600000) },
        { workOrderId: histId, userId: U2, fromStatus: 'needs_review',toStatus: 'closed',       createdAt: resolved },
      ],
      skipDuplicates: true,
    });
  }

  // ── Audit Logs for active WOs ────────────────────────────────
  await prisma.workOrderAuditLog.createMany({
    data: [
      { workOrderId: W1, userId: U2, fromStatus: 'open',        toStatus: 'assigned',     createdAt: hoursAgo(2.5) },
      { workOrderId: W1, userId: U3, fromStatus: 'assigned',    toStatus: 'in_progress',  createdAt: hoursAgo(1) },
      { workOrderId: W2, userId: U2, fromStatus: 'open',        toStatus: 'assigned',     createdAt: daysAgo(4) },
      { workOrderId: W2, userId: U4, fromStatus: 'assigned',    toStatus: 'in_progress',  createdAt: daysAgo(2) },
      { workOrderId: W2, userId: U4, fromStatus: 'in_progress', toStatus: 'needs_review', createdAt: daysAgo(0) },
      { workOrderId: W4, userId: U2, fromStatus: 'open',        toStatus: 'assigned',     createdAt: hoursAgo(6) },
      { workOrderId: W5, userId: U2, fromStatus: 'open',        toStatus: 'assigned',     createdAt: daysAgo(6) },
      { workOrderId: W5, userId: U6, fromStatus: 'assigned',    toStatus: 'in_progress',  createdAt: daysAgo(5) },
      { workOrderId: W5, userId: U6, fromStatus: 'in_progress', toStatus: 'needs_review', createdAt: daysAgo(3) },
      { workOrderId: W5, userId: U2, fromStatus: 'needs_review',toStatus: 'closed',       createdAt: daysAgo(3) },
      { workOrderId: W6, userId: U1, fromStatus: 'open',        toStatus: 'assigned',     createdAt: daysAgo(2) },
      { workOrderId: W8, userId: U5, fromStatus: 'open',        toStatus: 'assigned',     createdAt: daysAgo(8) },
      { workOrderId: W8, userId: U6, fromStatus: 'assigned',    toStatus: 'in_progress',  createdAt: daysAgo(7) },
      { workOrderId: W8, userId: U6, fromStatus: 'in_progress', toStatus: 'needs_review', createdAt: daysAgo(6) },
      { workOrderId: W8, userId: U2, fromStatus: 'needs_review',toStatus: 'closed',       createdAt: daysAgo(6) },
      { workOrderId: W9, userId: U5, fromStatus: 'open',        toStatus: 'assigned',     createdAt: hoursAgo(4) },
      { workOrderId: W9, userId: U4, fromStatus: 'assigned',    toStatus: 'in_progress',  createdAt: hoursAgo(1) },
    ],
    skipDuplicates: true,
  });

  // ── Vendor Score Records ─────────────────────────────────────
  const vendorScores = [
    { id: VS1, vendorId: V1, periodStart: daysAgo(30), periodEnd: now, score: 92, rejections: 1, skips: 0, lateDays: 0.5, completions: 12, bonus: 5,  quality: 90,  consistency: 100, speed: 98.5, volume: 12 },
    { id: VS2, vendorId: V2, periodStart: daysAgo(30), periodEnd: now, score: 87, rejections: 1, skips: 0, lateDays: 2,   completions: 8,  bonus: 0,  quality: 90,  consistency: 100, speed: 94,   volume: 8  },
    { id: VS3, vendorId: V3, periodStart: daysAgo(30), periodEnd: now, score: 78, rejections: 2, skips: 1, lateDays: 3,   completions: 15, bonus: 0,  quality: 80,  consistency: 95,  speed: 91,   volume: 15 },
    { id: VS4, vendorId: V4, periodStart: daysAgo(30), periodEnd: now, score: 95, rejections: 0, skips: 0, lateDays: 0,   completions: 4,  bonus: 0,  quality: 100, consistency: 100, speed: 100,  volume: 4  },
  ];
  for (const vs of vendorScores) await prisma.vendorScoreRecord.upsert({ where: { id: vs.id }, update: vs, create: vs });

  // ── Recurring Templates ──────────────────────────────────────
  const templates = [
    { id: RT1, name: 'HVAC Filter Replacement',           description: 'Replace HVAC filters on all rooftop units',                category: 'hvac' as const,         severity: 'minor' as const,          frequency: 'monthly' as const,   propertyId: P1, spaceId: S5, vendorId: V1, isActive: true },
    { id: RT2, name: 'Fire Safety Quarterly Inspection',  description: 'Full fire alarm and sprinkler system inspection',           category: 'fire_safety' as const,  severity: 'needs_fix_today' as const, frequency: 'quarterly' as const, propertyId: P1,              vendorId: V2, isActive: true },
    { id: RT3, name: 'Elevator Safety Inspection',        description: 'Annual elevator safety and compliance inspection',           category: 'elevator' as const,     severity: 'needs_fix_today' as const, frequency: 'annually' as const,  propertyId: P2,              vendorId: V4, isActive: true },
    { id: RT4, name: 'Courtyard Landscaping',             description: 'Monthly landscaping maintenance',                           category: 'landscaping' as const,  severity: 'minor' as const,          frequency: 'monthly' as const,   propertyId: P2, spaceId: S8, vendorId: V3, isActive: true },
    { id: RT5, name: 'Nightly Janitorial Service',        description: 'Nightly cleaning of common areas and restrooms',            category: 'janitorial' as const,   severity: 'minor' as const,          frequency: 'daily' as const,     propertyId: P1,              vendorId: V3, isActive: true },
  ];
  for (const t of templates) await prisma.recurringTemplate.upsert({ where: { id: t.id }, update: t, create: t });

  // ── Preferred Vendor Mappings ─────────────────────────────────
  const mappings = [
    { id: PVM1,  propertyId: P1, category: 'hvac' as const,         vendorId: V1, priority: 1 },
    { id: PVM2,  propertyId: P1, category: 'electrical' as const,   vendorId: V2, priority: 1 },
    { id: PVM3,  propertyId: P1, category: 'janitorial' as const,   vendorId: V3, priority: 1 },
    { id: PVM4,  propertyId: P1, category: 'elevator' as const,     vendorId: V4, priority: 1 },
    { id: PVM5,  propertyId: P2, category: 'hvac' as const,         vendorId: V1, priority: 1 },
    { id: PVM6,  propertyId: P2, category: 'electrical' as const,   vendorId: V2, priority: 1 },
    { id: PVM7,  propertyId: P2, category: 'elevator' as const,     vendorId: V4, priority: 1 },
    { id: PVM8,  propertyId: P2, category: 'janitorial' as const,   vendorId: V3, priority: 1 },
    { id: PVM9,  propertyId: P3, category: 'hvac' as const,         vendorId: V1, priority: 1 },
    { id: PVM10, propertyId: P3, category: 'electrical' as const,   vendorId: V2, priority: 1 },
  ];
  for (const m of mappings) await prisma.preferredVendorMapping.upsert({ where: { id: m.id }, update: m, create: m });

  // ── SLA Configurations ───────────────────────────────────────
  const slaConfigs = [
    { propertyId: P1, category: 'plumbing' as const,    severity: 'immediate' as const,       responseTimeMin: 60,   resolveTimeMin: 240   },
    { propertyId: P1, category: 'electrical' as const,  severity: 'immediate' as const,       responseTimeMin: 60,   resolveTimeMin: 240   },
    { propertyId: P1, category: 'hvac' as const,        severity: 'immediate' as const,       responseTimeMin: 60,   resolveTimeMin: 240   },
    { propertyId: P1, category: 'hvac' as const,        severity: 'needs_fix_today' as const, responseTimeMin: 120,  resolveTimeMin: 480   },
    { propertyId: P1, category: 'electrical' as const,  severity: 'needs_fix_today' as const, responseTimeMin: 240,  resolveTimeMin: 1440  },
    { propertyId: P1, category: 'elevator' as const,    severity: 'needs_fix_today' as const, responseTimeMin: 480,  resolveTimeMin: 4320  },
    { propertyId: P1, category: 'electrical' as const,  severity: 'minor' as const,           responseTimeMin: 480,  resolveTimeMin: 2880  },
    { propertyId: P1, category: 'fire_safety' as const, severity: 'minor' as const,           responseTimeMin: 1440, resolveTimeMin: 10080 },
    { propertyId: P1, category: 'janitorial' as const,  severity: 'minor' as const,           responseTimeMin: 480,  resolveTimeMin: 2880  },
    { propertyId: P1, category: 'landscaping' as const, severity: 'minor' as const,           responseTimeMin: 1440, resolveTimeMin: 10080 },
    { propertyId: P2, category: 'landscaping' as const, severity: 'minor' as const,           responseTimeMin: 1440, resolveTimeMin: 10080 },
    { propertyId: P2, category: 'elevator' as const,    severity: 'needs_fix_today' as const, responseTimeMin: 480,  resolveTimeMin: 4320  },
    { propertyId: P2, category: 'janitorial' as const,  severity: 'minor' as const,           responseTimeMin: 480,  resolveTimeMin: 2880  },
    { propertyId: P3, category: 'structural' as const,  severity: 'needs_fix_today' as const, responseTimeMin: 240,  resolveTimeMin: 1440  },
    { propertyId: P3, category: 'hvac' as const,        severity: 'minor' as const,           responseTimeMin: 480,  resolveTimeMin: 2880  },
  ];
  for (const sla of slaConfigs) {
    await prisma.sLAConfiguration.upsert({
      where: { propertyId_category_severity: { propertyId: sla.propertyId, category: sla.category, severity: sla.severity } },
      update: sla,
      create: sla,
    });
  }

  console.log('Seed completed successfully!');
  console.log(`  - ${users.length} users (password: ${DEFAULT_PASSWORD})`);
  console.log(`  - ${properties.length} properties`);
  console.log(`  - ${spaces.length} spaces`);
  console.log(`  - ${vendors.length} vendors`);
  console.log(`  - ${workOrders.length + 50} work orders (${workOrders.length} active + 50 historical)`);
  console.log(`  - ${vendorScores.length} vendor score records`);
  console.log(`  - ${templates.length} recurring templates`);
  console.log(`  - ${mappings.length} preferred vendor mappings`);
  console.log(`  - ${slaConfigs.length} SLA configurations`);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
