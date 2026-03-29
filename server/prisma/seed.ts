import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEFAULT_PASSWORD = 'Casa2025!';

async function main() {
  console.log('Seeding database...');

  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 12);

  // ── Vendors (must exist before users reference them) ─────────
  const vendors = [
    {
      id: 'v-001', companyName: 'Alpha HVAC Services', contactEmail: 'ops@alphahvac.com',
      contactPhone: '(214) 555-0100', specialties: ['hvac'], licenseNo: 'HVAC-TX-4821',
      rating: 92, isActive: true,
    },
    {
      id: 'v-002', companyName: 'Spark Electric Co.', contactEmail: 'dispatch@sparkelectric.com',
      contactPhone: '(214) 555-0200', specialties: ['electrical', 'fire_safety'], licenseNo: 'ELEC-TX-9912',
      rating: 87, isActive: true,
    },
    {
      id: 'v-003', companyName: 'CleanPro Janitorial', contactEmail: 'martinez@cleanpro.com',
      contactPhone: '(817) 555-0300', specialties: ['janitorial', 'landscaping'],
      rating: 78, isActive: true,
    },
    {
      id: 'v-004', companyName: 'Summit Elevator Corp', contactEmail: 'service@summitelev.com',
      contactPhone: '(972) 555-0400', specialties: ['elevator'], licenseNo: 'ELEV-TX-2204',
      rating: 95, isActive: true,
    },
  ];

  for (const v of vendors) {
    await prisma.vendor.upsert({
      where: { id: v.id },
      update: v,
      create: v,
    });
  }

  // ── Users ────────────────────────────────────────────────────
  const users = [
    { id: 'u-001', email: 'sarah.chen@casa.com', name: 'Sarah Chen', role: 'asset_manager' as const, passwordHash },
    { id: 'u-002', email: 'james.porter@meridianpm.com', name: 'James Porter', role: 'property_manager' as const, passwordHash },
    { id: 'u-003', email: 'ops@alphahvac.com', name: 'Mike Rodriguez', role: 'vendor' as const, vendorId: 'v-001', passwordHash },
    { id: 'u-004', email: 'dispatch@sparkelectric.com', name: 'Lisa Tran', role: 'vendor' as const, vendorId: 'v-002', passwordHash },
    { id: 'u-005', email: 'tenant@greenleafcorp.com', name: 'David Kim', role: 'tenant' as const, propertyId: 'p-001', spaceId: 's-001', passwordHash },
    { id: 'u-006', email: 'martinez@cleanpro.com', name: 'Carlos Martinez', role: 'vendor' as const, vendorId: 'v-003', passwordHash },
    { id: 'u-007', email: 'j.smith@retailco.com', name: 'John Smith', role: 'tenant' as const, propertyId: 'p-002', spaceId: 's-006', passwordHash },
  ];

  for (const u of users) {
    const { propertyId, spaceId, ...userData } = u as any;
    await prisma.user.upsert({
      where: { id: u.id },
      update: { ...userData, propertyId: propertyId || null, spaceId: spaceId || null },
      create: { ...userData, propertyId: propertyId || null, spaceId: spaceId || null },
    });
  }

  // ── Properties ───────────────────────────────────────────────
  const properties = [
    {
      id: 'p-001', name: 'Meridian Tower', address: '1200 Commerce Blvd',
      city: 'Dallas', state: 'TX', zipCode: '75201', type: 'Office',
      totalSqFt: 285000, yearBuilt: 2018,
      latitude: 32.7767, longitude: -96.7970,
      occupancyPercent: 92, monthlyRevenue: 425000,
    },
    {
      id: 'p-002', name: 'Riverfront Plaza', address: '800 Trinity Ave',
      city: 'Fort Worth', state: 'TX', zipCode: '76102', type: 'Mixed-Use',
      totalSqFt: 420000, yearBuilt: 2015,
      latitude: 32.7555, longitude: -97.3308,
      occupancyPercent: 87, monthlyRevenue: 580000,
    },
    {
      id: 'p-003', name: 'Oakmont Business Park', address: '3500 Innovation Dr',
      city: 'Plano', state: 'TX', zipCode: '75024', type: 'Industrial',
      totalSqFt: 180000, yearBuilt: 2020,
      latitude: 33.0198, longitude: -96.6989,
      occupancyPercent: 95, monthlyRevenue: 210000,
    },
  ];

  for (const p of properties) {
    await prisma.property.upsert({
      where: { id: p.id },
      update: p,
      create: p,
    });
  }

  // ── Spaces ───────────────────────────────────────────────────
  const spaces = [
    { id: 's-001', propertyId: 'p-001', name: 'Suite 200', floor: 2, type: 'suite', tenantName: 'GreenLeaf Corp', sqFt: 4500 },
    { id: 's-002', propertyId: 'p-001', name: 'Suite 500', floor: 5, type: 'suite', tenantName: 'Apex Consulting', sqFt: 6200 },
    { id: 's-003', propertyId: 'p-001', name: 'Main Lobby', floor: 1, type: 'common_area', sqFt: 3000 },
    { id: 's-004', propertyId: 'p-001', name: 'Parking Garage B1', floor: -1, type: 'common_area', sqFt: 25000 },
    { id: 's-005', propertyId: 'p-001', name: 'Rooftop Mechanical', floor: 12, type: 'common_area', sqFt: 2000 },
    { id: 's-006', propertyId: 'p-002', name: 'Suite 100', floor: 1, type: 'suite', tenantName: 'River Cafe', sqFt: 2800 },
    { id: 's-007', propertyId: 'p-002', name: 'Suite 301', floor: 3, type: 'suite', tenantName: 'Vanguard Legal', sqFt: 5100 },
    { id: 's-008', propertyId: 'p-002', name: 'Courtyard', floor: 1, type: 'common_area', sqFt: 4000 },
    { id: 's-009', propertyId: 'p-003', name: 'Unit A', floor: 1, type: 'suite', tenantName: 'FastTrack Logistics', sqFt: 45000 },
    { id: 's-010', propertyId: 'p-003', name: 'Loading Dock', floor: 1, type: 'common_area', sqFt: 8000 },
  ];

  for (const s of spaces) {
    await prisma.space.upsert({
      where: { id: s.id },
      update: s,
      create: s,
    });
  }

  // ── Work Orders ──────────────────────────────────────────────
  const now = new Date();
  const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600000);
  const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000);

  const workOrders = [
    {
      id: 'wo-001', title: 'HVAC Unit Not Cooling — Suite 200',
      description: 'Tenant reports AC unit in Suite 200 is blowing warm air. Thermostat set to 72°F but room reading 81°F.',
      status: 'in_progress' as const, severity: 'needs_fix_today' as const, category: 'hvac' as const,
      isInspection: false, propertyId: 'p-001', spaceId: 's-001',
      createdById: 'u-005', assignedToId: 'u-003', vendorId: 'v-001',
      dueDate: hoursAgo(-4), respondedAt: hoursAgo(1), slaResponseMin: 120, slaResolveMin: 480,
      createdAt: hoursAgo(3),
    },
    {
      id: 'wo-002', title: 'Quarterly Fire Alarm Inspection',
      description: 'Scheduled quarterly fire alarm system inspection. All floors must be tested with photo documentation.',
      status: 'needs_review' as const, severity: 'minor' as const, category: 'fire_safety' as const,
      isInspection: true, cost: 450.00, propertyId: 'p-001',
      createdById: 'u-002', assignedToId: 'u-004', vendorId: 'v-002',
      dueDate: daysAgo(-1), respondedAt: daysAgo(2), slaResponseMin: 1440, slaResolveMin: 10080,
      createdAt: daysAgo(5),
    },
    {
      id: 'wo-003', title: 'Water Leak in Parking Garage B1',
      description: 'Standing water near column B-12 in underground parking. Possible pipe leak above ceiling tiles.',
      status: 'open' as const, severity: 'immediate' as const, category: 'plumbing' as const,
      isInspection: false, propertyId: 'p-001', spaceId: 's-004',
      createdById: 'u-002', slaResponseMin: 60, slaResolveMin: 240,
      createdAt: hoursAgo(0.5),
    },
    {
      id: 'wo-004', title: 'Lobby Light Fixture Flickering',
      description: 'Two recessed LED panels in the main lobby are flickering intermittently.',
      status: 'assigned' as const, severity: 'minor' as const, category: 'electrical' as const,
      isInspection: false, propertyId: 'p-001', spaceId: 's-003',
      createdById: 'u-002', assignedToId: 'u-004', vendorId: 'v-002',
      dueDate: daysAgo(-3), slaResponseMin: 480, slaResolveMin: 2880,
      createdAt: daysAgo(1),
    },
    {
      id: 'wo-005', title: 'Courtyard Landscaping — Monthly Service',
      description: 'Monthly landscaping maintenance for Riverfront Plaza courtyard.',
      status: 'closed' as const, severity: 'minor' as const, category: 'landscaping' as const,
      isInspection: false, cost: 1500.00, propertyId: 'p-002', spaceId: 's-008',
      createdById: 'u-002', assignedToId: 'u-006', vendorId: 'v-003',
      dueDate: daysAgo(2), respondedAt: daysAgo(6), resolvedAt: daysAgo(3),
      slaResponseMin: 1440, slaResolveMin: 10080, createdAt: daysAgo(8),
    },
    {
      id: 'wo-006', title: 'Elevator Annual Safety Inspection',
      description: 'Annual elevator safety inspection required by code.',
      status: 'assigned' as const, severity: 'needs_fix_today' as const, category: 'elevator' as const,
      isInspection: true, propertyId: 'p-002',
      createdById: 'u-001', assignedToId: 'u-003', vendorId: 'v-004',
      dueDate: daysAgo(-2), slaResponseMin: 480, slaResolveMin: 4320,
      createdAt: daysAgo(3),
    },
    {
      id: 'wo-007', title: 'Loading Dock Gate Malfunction',
      description: 'Automated roll-up gate at loading dock is not responding to remote.',
      status: 'in_progress' as const, severity: 'needs_fix_today' as const, category: 'structural' as const,
      isInspection: false, propertyId: 'p-003', spaceId: 's-010',
      createdById: 'u-002', assignedToId: 'u-003', vendorId: 'v-001',
      dueDate: daysAgo(-1), respondedAt: hoursAgo(8), slaResponseMin: 240, slaResolveMin: 1440,
      createdAt: daysAgo(1),
    },
    {
      id: 'wo-008', title: 'Restroom Deep Clean — Suite 301 Floor',
      description: 'Tenant-requested deep clean of shared restrooms on floor 3.',
      status: 'closed' as const, severity: 'minor' as const, category: 'janitorial' as const,
      isInspection: false, cost: 325.50, propertyId: 'p-002', spaceId: 's-007',
      createdById: 'u-005', assignedToId: 'u-006', vendorId: 'v-003',
      dueDate: daysAgo(5), respondedAt: daysAgo(8), resolvedAt: daysAgo(6),
      slaResponseMin: 480, slaResolveMin: 2880, createdAt: daysAgo(10),
    },
    {
      id: 'wo-009', title: 'Partial Power Outage — Suite 400',
      description: 'Tenant reported half the suite lost power. Breaker box tripping immediately.',
      status: 'in_progress' as const, severity: 'needs_fix_today' as const, category: 'electrical' as const,
      isInspection: false, propertyId: 'p-001', spaceId: 's-001',
      createdById: 'u-002', assignedToId: 'u-004', vendorId: 'v-002',
      dueDate: daysAgo(0), respondedAt: hoursAgo(1), slaResponseMin: 240, slaResolveMin: 1440,
      createdAt: hoursAgo(4),
    },
  ];

  for (const wo of workOrders) {
    await prisma.workOrder.upsert({
      where: { id: wo.id },
      update: wo,
      create: wo,
    });
  }

  // ── Historical Work Orders (50 closed for analytics) ─────────
  const categories = ['plumbing', 'electrical', 'hvac', 'structural', 'janitorial', 'fire_safety', 'elevator', 'landscaping'] as const;
  const propertyIds = ['p-001', 'p-002', 'p-003'];
  const vendorIds = ['v-001', 'v-002', 'v-003', 'v-004'];

  for (let i = 0; i < 50; i++) {
    const propId = propertyIds[i % propertyIds.length];
    const venId = vendorIds[i % vendorIds.length];
    const cat = categories[i % categories.length];
    const daysOffset = Math.floor((i * 7) % 365) + 1;
    const created = daysAgo(daysOffset);
    const resolved = new Date(created.getTime() + (Math.floor(i % 48) + 1) * 3600000);
    const cost = Math.floor(((i * 137) % 1900) + 100);

    await prisma.workOrder.upsert({
      where: { id: `wo-hist-${i}` },
      update: {},
      create: {
        id: `wo-hist-${i}`,
        title: `Completed Maintenance — ${cat.replace('_', ' ')}`,
        description: 'Historical work order for analytics.',
        status: 'closed',
        severity: 'minor',
        category: cat,
        isInspection: false,
        cost,
        propertyId: propId,
        createdById: 'u-002',
        assignedToId: 'u-003',
        vendorId: venId,
        respondedAt: new Date(created.getTime() + 3600000),
        resolvedAt: resolved,
        createdAt: created,
      },
    });

    // Audit logs for historical
    await prisma.workOrderAuditLog.createMany({
      data: [
        { workOrderId: `wo-hist-${i}`, userId: 'u-002', fromStatus: 'open', toStatus: 'assigned', createdAt: new Date(created.getTime() + 3600000) },
        { workOrderId: `wo-hist-${i}`, userId: 'u-003', fromStatus: 'assigned', toStatus: 'in_progress', createdAt: new Date(created.getTime() + 7200000) },
        { workOrderId: `wo-hist-${i}`, userId: 'u-003', fromStatus: 'in_progress', toStatus: 'needs_review', createdAt: new Date(resolved.getTime() - 3600000) },
        { workOrderId: `wo-hist-${i}`, userId: 'u-002', fromStatus: 'needs_review', toStatus: 'closed', createdAt: resolved },
      ],
      skipDuplicates: true,
    });
  }

  // ── Audit Logs for active WOs ────────────────────────────────
  const auditLogs = [
    { workOrderId: 'wo-001', userId: 'u-002', fromStatus: 'open', toStatus: 'assigned', createdAt: hoursAgo(2.5) },
    { workOrderId: 'wo-001', userId: 'u-003', fromStatus: 'assigned', toStatus: 'in_progress', createdAt: hoursAgo(1) },
    { workOrderId: 'wo-002', userId: 'u-002', fromStatus: 'open', toStatus: 'assigned', createdAt: daysAgo(4) },
    { workOrderId: 'wo-002', userId: 'u-004', fromStatus: 'assigned', toStatus: 'in_progress', createdAt: daysAgo(2) },
    { workOrderId: 'wo-002', userId: 'u-004', fromStatus: 'in_progress', toStatus: 'needs_review', createdAt: daysAgo(0) },
    { workOrderId: 'wo-004', userId: 'u-002', fromStatus: 'open', toStatus: 'assigned', createdAt: hoursAgo(6) },
    { workOrderId: 'wo-005', userId: 'u-002', fromStatus: 'open', toStatus: 'assigned', createdAt: daysAgo(6) },
    { workOrderId: 'wo-005', userId: 'u-006', fromStatus: 'assigned', toStatus: 'in_progress', createdAt: daysAgo(5) },
    { workOrderId: 'wo-005', userId: 'u-006', fromStatus: 'in_progress', toStatus: 'needs_review', createdAt: daysAgo(3) },
    { workOrderId: 'wo-005', userId: 'u-002', fromStatus: 'needs_review', toStatus: 'closed', createdAt: daysAgo(3) },
    { workOrderId: 'wo-006', userId: 'u-001', fromStatus: 'open', toStatus: 'assigned', createdAt: daysAgo(2) },
    { workOrderId: 'wo-008', userId: 'u-005', fromStatus: 'open', toStatus: 'assigned', createdAt: daysAgo(8) },
    { workOrderId: 'wo-008', userId: 'u-006', fromStatus: 'assigned', toStatus: 'in_progress', createdAt: daysAgo(7) },
    { workOrderId: 'wo-008', userId: 'u-006', fromStatus: 'in_progress', toStatus: 'needs_review', createdAt: daysAgo(6) },
    { workOrderId: 'wo-008', userId: 'u-002', fromStatus: 'needs_review', toStatus: 'closed', createdAt: daysAgo(6) },
    { workOrderId: 'wo-009', userId: 'u-005', fromStatus: 'open', toStatus: 'assigned', createdAt: hoursAgo(4) },
    { workOrderId: 'wo-009', userId: 'u-004', fromStatus: 'assigned', toStatus: 'in_progress', createdAt: hoursAgo(1) },
  ];

  await prisma.workOrderAuditLog.createMany({
    data: auditLogs,
    skipDuplicates: true,
  });

  // ── Vendor Score Records ─────────────────────────────────────
  const vendorScores = [
    {
      id: 'vs-001', vendorId: 'v-001', periodStart: daysAgo(30), periodEnd: now,
      score: 92, rejections: 1, skips: 0, lateDays: 0.5, completions: 12, bonus: 5,
      quality: 90, consistency: 100, speed: 98.5, volume: 12,
    },
    {
      id: 'vs-002', vendorId: 'v-002', periodStart: daysAgo(30), periodEnd: now,
      score: 87, rejections: 1, skips: 0, lateDays: 2, completions: 8, bonus: 0,
      quality: 90, consistency: 100, speed: 94, volume: 8,
    },
    {
      id: 'vs-003', vendorId: 'v-003', periodStart: daysAgo(30), periodEnd: now,
      score: 78, rejections: 2, skips: 1, lateDays: 3, completions: 15, bonus: 0,
      quality: 80, consistency: 95, speed: 91, volume: 15,
    },
    {
      id: 'vs-004', vendorId: 'v-004', periodStart: daysAgo(30), periodEnd: now,
      score: 95, rejections: 0, skips: 0, lateDays: 0, completions: 4, bonus: 0,
      quality: 100, consistency: 100, speed: 100, volume: 4,
    },
  ];

  for (const vs of vendorScores) {
    await prisma.vendorScoreRecord.upsert({
      where: { id: vs.id },
      update: vs,
      create: vs,
    });
  }

  // ── Recurring Templates ──────────────────────────────────────
  const templates = [
    { id: 'rt-001', name: 'HVAC Filter Replacement', description: 'Replace HVAC filters on all rooftop units', category: 'hvac' as const, severity: 'minor' as const, frequency: 'monthly' as const, propertyId: 'p-001', spaceId: 's-005', vendorId: 'v-001', isActive: true },
    { id: 'rt-002', name: 'Fire Safety Quarterly Inspection', description: 'Full fire alarm and sprinkler system inspection', category: 'fire_safety' as const, severity: 'needs_fix_today' as const, frequency: 'quarterly' as const, propertyId: 'p-001', vendorId: 'v-002', isActive: true },
    { id: 'rt-003', name: 'Elevator Safety Inspection', description: 'Annual elevator safety and compliance inspection', category: 'elevator' as const, severity: 'needs_fix_today' as const, frequency: 'annually' as const, propertyId: 'p-002', vendorId: 'v-004', isActive: true },
    { id: 'rt-004', name: 'Courtyard Landscaping', description: 'Monthly landscaping maintenance', category: 'landscaping' as const, severity: 'minor' as const, frequency: 'monthly' as const, propertyId: 'p-002', spaceId: 's-008', vendorId: 'v-003', isActive: true },
    { id: 'rt-005', name: 'Nightly Janitorial Service', description: 'Nightly cleaning of common areas and restrooms', category: 'janitorial' as const, severity: 'minor' as const, frequency: 'daily' as const, propertyId: 'p-001', vendorId: 'v-003', isActive: true },
  ];

  for (const t of templates) {
    await prisma.recurringTemplate.upsert({
      where: { id: t.id },
      update: t,
      create: t,
    });
  }

  // ── Preferred Vendor Mappings ─────────────────────────────────
  const mappings = [
    { id: 'pvm-001', propertyId: 'p-001', category: 'hvac' as const, vendorId: 'v-001', priority: 1 },
    { id: 'pvm-002', propertyId: 'p-001', category: 'electrical' as const, vendorId: 'v-002', priority: 1 },
    { id: 'pvm-003', propertyId: 'p-001', category: 'janitorial' as const, vendorId: 'v-003', priority: 1 },
    { id: 'pvm-004', propertyId: 'p-001', category: 'elevator' as const, vendorId: 'v-004', priority: 1 },
    { id: 'pvm-005', propertyId: 'p-002', category: 'hvac' as const, vendorId: 'v-001', priority: 1 },
    { id: 'pvm-006', propertyId: 'p-002', category: 'electrical' as const, vendorId: 'v-002', priority: 1 },
    { id: 'pvm-007', propertyId: 'p-002', category: 'elevator' as const, vendorId: 'v-004', priority: 1 },
    { id: 'pvm-008', propertyId: 'p-002', category: 'janitorial' as const, vendorId: 'v-003', priority: 1 },
    { id: 'pvm-009', propertyId: 'p-003', category: 'hvac' as const, vendorId: 'v-001', priority: 1 },
    { id: 'pvm-010', propertyId: 'p-003', category: 'electrical' as const, vendorId: 'v-002', priority: 1 },
  ];

  for (const m of mappings) {
    await prisma.preferredVendorMapping.upsert({
      where: { id: m.id },
      update: m,
      create: m,
    });
  }

  // ── SLA Configurations ───────────────────────────────────────
  const slaConfigs = [
    // Immediate: 1h response, 4h resolve
    { propertyId: 'p-001', category: 'plumbing' as const, severity: 'immediate' as const, responseTimeMin: 60, resolveTimeMin: 240 },
    { propertyId: 'p-001', category: 'electrical' as const, severity: 'immediate' as const, responseTimeMin: 60, resolveTimeMin: 240 },
    { propertyId: 'p-001', category: 'hvac' as const, severity: 'immediate' as const, responseTimeMin: 60, resolveTimeMin: 240 },
    // Needs fix today: 2-4h response, 8-24h resolve
    { propertyId: 'p-001', category: 'hvac' as const, severity: 'needs_fix_today' as const, responseTimeMin: 120, resolveTimeMin: 480 },
    { propertyId: 'p-001', category: 'electrical' as const, severity: 'needs_fix_today' as const, responseTimeMin: 240, resolveTimeMin: 1440 },
    { propertyId: 'p-001', category: 'elevator' as const, severity: 'needs_fix_today' as const, responseTimeMin: 480, resolveTimeMin: 4320 },
    // Minor: 8h-24h response, 2-7 day resolve
    { propertyId: 'p-001', category: 'electrical' as const, severity: 'minor' as const, responseTimeMin: 480, resolveTimeMin: 2880 },
    { propertyId: 'p-001', category: 'fire_safety' as const, severity: 'minor' as const, responseTimeMin: 1440, resolveTimeMin: 10080 },
    { propertyId: 'p-001', category: 'janitorial' as const, severity: 'minor' as const, responseTimeMin: 480, resolveTimeMin: 2880 },
    { propertyId: 'p-001', category: 'landscaping' as const, severity: 'minor' as const, responseTimeMin: 1440, resolveTimeMin: 10080 },
    // Property 2
    { propertyId: 'p-002', category: 'landscaping' as const, severity: 'minor' as const, responseTimeMin: 1440, resolveTimeMin: 10080 },
    { propertyId: 'p-002', category: 'elevator' as const, severity: 'needs_fix_today' as const, responseTimeMin: 480, resolveTimeMin: 4320 },
    { propertyId: 'p-002', category: 'janitorial' as const, severity: 'minor' as const, responseTimeMin: 480, resolveTimeMin: 2880 },
    // Property 3
    { propertyId: 'p-003', category: 'structural' as const, severity: 'needs_fix_today' as const, responseTimeMin: 240, resolveTimeMin: 1440 },
    { propertyId: 'p-003', category: 'hvac' as const, severity: 'minor' as const, responseTimeMin: 480, resolveTimeMin: 2880 },
  ];

  for (const sla of slaConfigs) {
    await prisma.sLAConfiguration.upsert({
      where: {
        propertyId_category_severity: {
          propertyId: sla.propertyId,
          category: sla.category,
          severity: sla.severity,
        },
      },
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
