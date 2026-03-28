// ============================================================
// Mock Data — CRE Operations Platform
// ============================================================

import { User, Property, Space, Vendor, WorkOrder, VendorScoreRecord, RecurringTemplate } from '../types';
import { subDays, addHours, subHours } from 'date-fns';

// ── Users ────────────────────────────────────────────────────

export const MOCK_USERS: User[] = [
  {
    id: 'u-001', email: 'sarah.chen@casa.com', name: 'Sarah Chen',
    role: 'asset_manager', createdAt: '2025-01-15T00:00:00Z', updatedAt: '2025-01-15T00:00:00Z',
  },
  {
    id: 'u-002', email: 'james.porter@meridianpm.com', name: 'James Porter',
    role: 'property_manager', createdAt: '2025-01-15T00:00:00Z', updatedAt: '2025-01-15T00:00:00Z',
  },
  {
    id: 'u-003', email: 'ops@alphahvac.com', name: 'Mike Rodriguez',
    role: 'vendor', vendorId: 'v-001', createdAt: '2025-02-01T00:00:00Z', updatedAt: '2025-02-01T00:00:00Z',
  },
  {
    id: 'u-004', email: 'dispatch@sparkelectric.com', name: 'Lisa Tran',
    role: 'vendor', vendorId: 'v-002', createdAt: '2025-02-01T00:00:00Z', updatedAt: '2025-02-01T00:00:00Z',
  },
  {
    id: 'u-005', email: 'tenant@greenleafcorp.com', name: 'David Kim',
    role: 'tenant', createdAt: '2025-03-01T00:00:00Z', updatedAt: '2025-03-01T00:00:00Z',
  },
  {
    id: 'u-007', email: 'j.smith@retailco.com', name: 'John Smith',
    role: 'tenant', createdAt: '2025-03-05T00:00:00Z', updatedAt: '2025-03-05T00:00:00Z',
  },
  {
    id: 'u-006', email: 'martinez@cleanpro.com', name: 'Carlos Martinez',
    role: 'vendor', vendorId: 'v-003', createdAt: '2025-02-15T00:00:00Z', updatedAt: '2025-02-15T00:00:00Z',
  },
];

// ── Properties ───────────────────────────────────────────────

export const MOCK_PROPERTIES: Property[] = [
  {
    id: 'p-001', name: 'Meridian Tower', address: '1200 Commerce Blvd',
    city: 'Dallas', state: 'TX', zipCode: '75201', type: 'Office',
    totalSqFt: 285000, yearBuilt: 2018,
    latitude: 32.7767, longitude: -96.7970,
    createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'p-002', name: 'Riverfront Plaza', address: '800 Trinity Ave',
    city: 'Fort Worth', state: 'TX', zipCode: '76102', type: 'Mixed-Use',
    totalSqFt: 420000, yearBuilt: 2015,
    latitude: 32.7555, longitude: -97.3308,
    createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'p-003', name: 'Oakmont Business Park', address: '3500 Innovation Dr',
    city: 'Plano', state: 'TX', zipCode: '75024', type: 'Industrial',
    totalSqFt: 180000, yearBuilt: 2020,
    latitude: 33.0198, longitude: -96.6989,
    createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z',
  },
];

// ── Spaces ───────────────────────────────────────────────────

export const MOCK_SPACES: Space[] = [
  // Meridian Tower
  { id: 's-001', propertyId: 'p-001', name: 'Suite 200', floor: 2, type: 'suite', tenantName: 'GreenLeaf Corp', sqFt: 4500, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 's-002', propertyId: 'p-001', name: 'Suite 500', floor: 5, type: 'suite', tenantName: 'Apex Consulting', sqFt: 6200, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 's-003', propertyId: 'p-001', name: 'Main Lobby', floor: 1, type: 'common_area', sqFt: 3000, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 's-004', propertyId: 'p-001', name: 'Parking Garage B1', floor: -1, type: 'common_area', sqFt: 25000, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 's-005', propertyId: 'p-001', name: 'Rooftop Mechanical', floor: 12, type: 'common_area', sqFt: 2000, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  // Riverfront Plaza
  { id: 's-006', propertyId: 'p-002', name: 'Suite 100', floor: 1, type: 'suite', tenantName: 'River Cafe', sqFt: 2800, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 's-007', propertyId: 'p-002', name: 'Suite 301', floor: 3, type: 'suite', tenantName: 'Vanguard Legal', sqFt: 5100, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 's-008', propertyId: 'p-002', name: 'Courtyard', floor: 1, type: 'common_area', sqFt: 4000, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  // Oakmont Business Park
  { id: 's-009', propertyId: 'p-003', name: 'Unit A', floor: 1, type: 'suite', tenantName: 'FastTrack Logistics', sqFt: 45000, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 's-010', propertyId: 'p-003', name: 'Loading Dock', floor: 1, type: 'common_area', sqFt: 8000, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
];

// ── Vendors ──────────────────────────────────────────────────

export const MOCK_VENDORS: Vendor[] = [
  {
    id: 'v-001', companyName: 'Alpha HVAC Services', contactEmail: 'ops@alphahvac.com',
    contactPhone: '(214) 555-0100', specialties: ['hvac'], licenseNo: 'HVAC-TX-4821',
    rating: 92, isActive: true, createdAt: '2025-01-15T00:00:00Z', updatedAt: '2025-01-15T00:00:00Z',
  },
  {
    id: 'v-002', companyName: 'Spark Electric Co.', contactEmail: 'dispatch@sparkelectric.com',
    contactPhone: '(214) 555-0200', specialties: ['electrical', 'fire_safety'], licenseNo: 'ELEC-TX-9912',
    rating: 87, isActive: true, createdAt: '2025-01-15T00:00:00Z', updatedAt: '2025-01-15T00:00:00Z',
  },
  {
    id: 'v-003', companyName: 'CleanPro Janitorial', contactEmail: 'martinez@cleanpro.com',
    contactPhone: '(817) 555-0300', specialties: ['janitorial', 'landscaping'],
    rating: 78, isActive: true, createdAt: '2025-01-15T00:00:00Z', updatedAt: '2025-01-15T00:00:00Z',
  },
  {
    id: 'v-004', companyName: 'Summit Elevator Corp', contactEmail: 'service@summitelev.com',
    contactPhone: '(972) 555-0400', specialties: ['elevator'], licenseNo: 'ELEV-TX-2204',
    rating: 95, isActive: true, createdAt: '2025-02-01T00:00:00Z', updatedAt: '2025-02-01T00:00:00Z',
  },
];

// ── Work Orders ──────────────────────────────────────────────

const now = new Date();
const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600000).toISOString();
const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000).toISOString();

export const MOCK_WORK_ORDERS: WorkOrder[] = [
  {
    id: 'wo-001', title: 'HVAC Unit Not Cooling — Suite 200',
    description: 'Tenant reports AC unit in Suite 200 is blowing warm air. Thermostat set to 72°F but room reading 81°F.',
    status: 'in_progress', severity: 'needs_fix_today', category: 'hvac', isInspection: false,
    cost: null,
    propertyId: 'p-001', property: MOCK_PROPERTIES[0],
    spaceId: 's-001', space: MOCK_SPACES[0],
    createdById: 'u-005', createdBy: MOCK_USERS[4],
    assignedToId: 'u-003', assignedTo: MOCK_USERS[2],
    vendorId: 'v-001', vendor: MOCK_VENDORS[0],
    dueDate: hoursAgo(-4), respondedAt: hoursAgo(1), slaResponseMin: 120, slaResolveMin: 480,
    createdAt: hoursAgo(3), updatedAt: hoursAgo(1),
    photos: [],
    auditLog: [
      { id: 'al-001', workOrderId: 'wo-001', userId: 'u-002', fromStatus: 'open', toStatus: 'assigned', createdAt: hoursAgo(2.5) },
      { id: 'al-002', workOrderId: 'wo-001', userId: 'u-003', fromStatus: 'assigned', toStatus: 'in_progress', createdAt: hoursAgo(1) },
    ],
  },
  {
    id: 'wo-002', title: 'Quarterly Fire Alarm Inspection',
    description: 'Scheduled quarterly fire alarm system inspection for Meridian Tower. All floors must be tested with photo documentation.',
    status: 'needs_review', severity: 'minor', category: 'fire_safety', isInspection: true,
    cost: 450.00,
    propertyId: 'p-001', property: MOCK_PROPERTIES[0],
    createdById: 'u-002', createdBy: MOCK_USERS[1],
    assignedToId: 'u-004', assignedTo: MOCK_USERS[3],
    vendorId: 'v-002', vendor: MOCK_VENDORS[1],
    dueDate: daysAgo(-1), respondedAt: daysAgo(2), slaResponseMin: 1440, slaResolveMin: 10080,
    createdAt: daysAgo(5), updatedAt: daysAgo(0),
    photos: [],
    auditLog: [
      { id: 'al-003', workOrderId: 'wo-002', userId: 'u-002', fromStatus: 'open', toStatus: 'assigned', createdAt: daysAgo(4) },
      { id: 'al-004', workOrderId: 'wo-002', userId: 'u-004', fromStatus: 'assigned', toStatus: 'in_progress', createdAt: daysAgo(2) },
      { id: 'al-005', workOrderId: 'wo-002', userId: 'u-004', fromStatus: 'in_progress', toStatus: 'needs_review', createdAt: daysAgo(0) },
    ],
  },
  {
    id: 'wo-003', title: 'Water Leak in Parking Garage B1',
    description: 'Standing water near column B-12 in underground parking. Possible pipe leak above ceiling tiles.',
    status: 'open', severity: 'immediate', category: 'plumbing', isInspection: false,
    cost: null,
    propertyId: 'p-001', property: MOCK_PROPERTIES[0],
    spaceId: 's-004', space: MOCK_SPACES[3],
    createdById: 'u-002', createdBy: MOCK_USERS[1],
    slaResponseMin: 60, slaResolveMin: 240,
    createdAt: hoursAgo(0.5), updatedAt: hoursAgo(0.5),
  },
  {
    id: 'wo-004', title: 'Lobby Light Fixture Flickering',
    description: 'Two recessed LED panels in the main lobby are flickering intermittently. May need ballast replacement.',
    status: 'assigned', severity: 'minor', category: 'electrical', isInspection: false,
    cost: null,
    propertyId: 'p-001', property: MOCK_PROPERTIES[0],
    spaceId: 's-003', space: MOCK_SPACES[2],
    createdById: 'u-002', createdBy: MOCK_USERS[1],
    assignedToId: 'u-004', assignedTo: MOCK_USERS[3],
    vendorId: 'v-002', vendor: MOCK_VENDORS[1],
    dueDate: daysAgo(-3), slaResponseMin: 480, slaResolveMin: 2880,
    createdAt: daysAgo(1), updatedAt: hoursAgo(6),
    auditLog: [
      { id: 'al-006', workOrderId: 'wo-004', userId: 'u-002', fromStatus: 'open', toStatus: 'assigned', createdAt: hoursAgo(6) },
    ],
  },
  {
    id: 'wo-005', title: 'Courtyard Landscaping — Monthly Service',
    description: 'Monthly landscaping maintenance for Riverfront Plaza courtyard. Includes mowing, edging, seasonal planting review.',
    status: 'closed', severity: 'minor', category: 'landscaping', isInspection: false,
    cost: 1500.00,
    propertyId: 'p-002', property: MOCK_PROPERTIES[1],
    spaceId: 's-008', space: MOCK_SPACES[7],
    createdById: 'u-002', createdBy: MOCK_USERS[1],
    assignedToId: 'u-006', assignedTo: MOCK_USERS[5],
    vendorId: 'v-003', vendor: MOCK_VENDORS[2],
    dueDate: daysAgo(2), respondedAt: daysAgo(6), resolvedAt: daysAgo(3), slaResponseMin: 1440, slaResolveMin: 10080,
    createdAt: daysAgo(8), updatedAt: daysAgo(3),
    photos: [],
    auditLog: [
      { id: 'al-008', workOrderId: 'wo-005', userId: 'u-002', fromStatus: 'open', toStatus: 'assigned', createdAt: daysAgo(6) },
      { id: 'al-009', workOrderId: 'wo-005', userId: 'u-006', fromStatus: 'assigned', toStatus: 'in_progress', createdAt: daysAgo(5) },
      { id: 'al-010', workOrderId: 'wo-005', userId: 'u-006', fromStatus: 'in_progress', toStatus: 'needs_review', createdAt: daysAgo(3) },
      { id: 'al-011', workOrderId: 'wo-005', userId: 'u-002', fromStatus: 'needs_review', toStatus: 'closed', createdAt: daysAgo(3) },
    ],
  },
  {
    id: 'wo-006', title: 'Elevator Annual Safety Inspection',
    description: 'Annual elevator safety inspection required by code. Both passenger elevators and freight elevator must be inspected.',
    status: 'assigned', severity: 'needs_fix_today', category: 'elevator', isInspection: true,
    cost: null,
    propertyId: 'p-002', property: MOCK_PROPERTIES[1],
    createdById: 'u-001', createdBy: MOCK_USERS[0],
    assignedToId: 'u-003', assignedTo: MOCK_USERS[2],
    vendorId: 'v-004', vendor: MOCK_VENDORS[3],
    dueDate: daysAgo(-2), slaResponseMin: 480, slaResolveMin: 4320,
    createdAt: daysAgo(3), updatedAt: daysAgo(2),
    auditLog: [
      { id: 'al-007', workOrderId: 'wo-006', userId: 'u-001', fromStatus: 'open', toStatus: 'assigned', createdAt: daysAgo(2) },
    ],
  },
  {
    id: 'wo-007', title: 'Loading Dock Gate Malfunction',
    description: 'Automated roll-up gate at loading dock is not responding to remote. Manual override works but gate sticks halfway.',
    status: 'in_progress', severity: 'needs_fix_today', category: 'structural', isInspection: false,
    cost: null,
    propertyId: 'p-003', property: MOCK_PROPERTIES[2],
    spaceId: 's-010', space: MOCK_SPACES[9],
    createdById: 'u-002', createdBy: MOCK_USERS[1],
    assignedToId: 'u-003', assignedTo: MOCK_USERS[2],
    vendorId: 'v-001', vendor: MOCK_VENDORS[0],
    dueDate: daysAgo(-1), respondedAt: hoursAgo(8), slaResponseMin: 240, slaResolveMin: 1440,
    createdAt: daysAgo(1), updatedAt: hoursAgo(8),
  },
  {
    id: 'wo-008', title: 'Restroom Deep Clean — Suite 301 Floor',
    description: 'Tenant-requested deep clean of shared restrooms on floor 3. Includes grout cleaning and fixture polish.',
    status: 'closed', severity: 'minor', category: 'janitorial', isInspection: false,
    cost: 325.50,
    propertyId: 'p-002', property: MOCK_PROPERTIES[1],
    spaceId: 's-007', space: MOCK_SPACES[6],
    createdById: 'u-005', createdBy: MOCK_USERS[4],
    assignedToId: 'u-006', assignedTo: MOCK_USERS[5],
    vendorId: 'v-003', vendor: MOCK_VENDORS[2],
    dueDate: daysAgo(5), respondedAt: daysAgo(8), resolvedAt: daysAgo(6), slaResponseMin: 480, slaResolveMin: 2880,
    createdAt: daysAgo(10), updatedAt: daysAgo(6),
    photos: [],
    auditLog: [
      { id: 'al-012', workOrderId: 'wo-008', userId: 'u-005', fromStatus: 'open', toStatus: 'assigned', createdAt: daysAgo(8) },
      { id: 'al-013', workOrderId: 'wo-008', userId: 'u-006', fromStatus: 'assigned', toStatus: 'in_progress', createdAt: daysAgo(7) },
      { id: 'al-014', workOrderId: 'wo-008', userId: 'u-006', fromStatus: 'in_progress', toStatus: 'needs_review', createdAt: daysAgo(6) },
      { id: 'al-015', workOrderId: 'wo-008', userId: 'u-002', fromStatus: 'needs_review', toStatus: 'closed', createdAt: daysAgo(6) },
    ],
  },
  {
    id: 'wo-009', title: 'Partial Power Outage — Suite 400',
    description: 'Tenant reported half the suite lost power. Breaker box was checked but unable to reset without tripping immediately.',
    status: 'in_progress', severity: 'needs_fix_today', category: 'electrical', isInspection: false,
    cost: null,
    propertyId: 'p-001', property: MOCK_PROPERTIES[0],
    spaceId: 's-001', space: MOCK_SPACES[0],
    createdById: 'u-002', createdBy: MOCK_USERS[1],
    assignedToId: 'u-004', assignedTo: MOCK_USERS[3], // Lisa Tran
    vendorId: 'v-002', vendor: MOCK_VENDORS[1],     // Spark Electric
    dueDate: daysAgo(0), respondedAt: hoursAgo(1), slaResponseMin: 240, slaResolveMin: 1440,
    createdAt: hoursAgo(4), updatedAt: hoursAgo(1),
    auditLog: [
      { id: 'al-016', workOrderId: 'wo-009', userId: 'u-005', fromStatus: 'open', toStatus: 'assigned', createdAt: hoursAgo(4) },
      { id: 'al-017', workOrderId: 'wo-009', userId: 'u-004', fromStatus: 'assigned', toStatus: 'in_progress', createdAt: hoursAgo(1) },
    ],
  },
];

// Generate 50 historical completed work orders over the last 12 months for vendor graph analytics
const CATEGORIES: any[] = ['plumbing', 'electrical', 'hvac', 'structural', 'cleaning', 'fire_safety', 'elevator', 'landscaping'];
for (let i = 0; i < 50; i++) {
  const property = MOCK_PROPERTIES[Math.floor(Math.random() * MOCK_PROPERTIES.length)];
  const vendor = MOCK_VENDORS[Math.floor(Math.random() * MOCK_VENDORS.length)];
  const daysAgoOffset = Math.floor(Math.random() * 365); // anything from today to 1 year ago
  const createdDate = subDays(new Date(), daysAgoOffset);
  const resolvedDate = addHours(createdDate, Math.floor(Math.random() * 48) + 1); // resolved 1 - 48 hours later
  
  // Random cost between $100 and $2,000
  const cost = Math.floor(Math.random() * 1900) + 100;

  const assignedDate = addHours(createdDate, Math.floor(Math.random() * 2) + 1);
  const inProgressDate = addHours(assignedDate, Math.floor(Math.random() * 4) + 1);
  const selectedCategory = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];



  MOCK_WORK_ORDERS.push({
    id: `wo-hist-${i}`,
    propertyId: property.id,
    spaceId: null,
    vendorId: vendor.id,
    title: `Completed Maintenance — ${selectedCategory.replace('_', ' ')}`,
    description: 'Historical work order for structural and vendor analytic purposes. All tasks successfully completed and verified.',
    status: 'closed',
    severity: 'minor',
    category: selectedCategory,
    isInspection: false,
    createdById: MOCK_USERS[1].id,
    createdBy: MOCK_USERS[1],
    assignedToId: vendor.id,
    cost: cost,
    createdAt: createdDate.toISOString(),
    respondedAt: assignedDate.toISOString(),
    resolvedAt: resolvedDate.toISOString(),
    updatedAt: resolvedDate.toISOString(),
    property: property,
    vendor: vendor,
    photos: [],
    auditLog: [
      { id: `al-hist-${i}-1`, workOrderId: `wo-hist-${i}`, userId: MOCK_USERS[1].id, fromStatus: 'open', toStatus: 'assigned', createdAt: assignedDate.toISOString() },
      { id: `al-hist-${i}-2`, workOrderId: `wo-hist-${i}`, userId: vendor.id, fromStatus: 'assigned', toStatus: 'in_progress', createdAt: inProgressDate.toISOString() },
      { id: `al-hist-${i}-3`, workOrderId: `wo-hist-${i}`, userId: vendor.id, fromStatus: 'in_progress', toStatus: 'needs_review', createdAt: subHours(resolvedDate, 1).toISOString() },
      { id: `al-hist-${i}-4`, workOrderId: `wo-hist-${i}`, userId: MOCK_USERS[1].id, fromStatus: 'needs_review', toStatus: 'closed', createdAt: resolvedDate.toISOString() },
    ],
  });
}

// ── Vendor Score Records ─────────────────────────────────────

export const MOCK_VENDOR_SCORES: VendorScoreRecord[] = [
  {
    id: 'vs-001', vendorId: 'v-001', periodStart: daysAgo(30), periodEnd: daysAgo(0),
    score: 92, rejections: 1, skips: 0, lateDays: 0.5, completions: 12, bonus: 5,
    quality: 90, consistency: 100, speed: 98.5, volume: 12, createdAt: daysAgo(0),
  },
  {
    id: 'vs-002', vendorId: 'v-002', periodStart: daysAgo(30), periodEnd: daysAgo(0),
    score: 87, rejections: 1, skips: 0, lateDays: 2, completions: 8, bonus: 0,
    quality: 90, consistency: 100, speed: 94, volume: 8, createdAt: daysAgo(0),
  },
  {
    id: 'vs-003', vendorId: 'v-003', periodStart: daysAgo(30), periodEnd: daysAgo(0),
    score: 78, rejections: 2, skips: 1, lateDays: 3, completions: 15, bonus: 0,
    quality: 80, consistency: 95, speed: 91, volume: 15, createdAt: daysAgo(0),
  },
  {
    id: 'vs-004', vendorId: 'v-004', periodStart: daysAgo(30), periodEnd: daysAgo(0),
    score: 95, rejections: 0, skips: 0, lateDays: 0, completions: 4, bonus: 0,
    quality: 100, consistency: 100, speed: 100, volume: 4, createdAt: daysAgo(0),
  },
];

// ── Recurring Templates ──────────────────────────────────────

export const MOCK_RECURRING_TEMPLATES: RecurringTemplate[] = [
  {
    id: 'rt-001', name: 'HVAC Filter Replacement', description: 'Replace HVAC filters on all rooftop units',
    category: 'hvac', severity: 'minor', frequency: 'monthly', propertyId: 'p-001',
    spaceId: 's-005', vendorId: 'v-001', isActive: true,
    createdAt: '2025-01-15T00:00:00Z', updatedAt: '2025-01-15T00:00:00Z',
  },
  {
    id: 'rt-002', name: 'Fire Safety Quarterly Inspection', description: 'Full fire alarm and sprinkler system inspection',
    category: 'fire_safety', severity: 'needs_fix_today', frequency: 'quarterly', propertyId: 'p-001',
    vendorId: 'v-002', isActive: true,
    createdAt: '2025-01-15T00:00:00Z', updatedAt: '2025-01-15T00:00:00Z',
  },
  {
    id: 'rt-003', name: 'Elevator Safety Inspection', description: 'Annual elevator safety and compliance inspection',
    category: 'elevator', severity: 'needs_fix_today', frequency: 'annually', propertyId: 'p-002',
    vendorId: 'v-004', isActive: true,
    createdAt: '2025-01-15T00:00:00Z', updatedAt: '2025-01-15T00:00:00Z',
  },
  {
    id: 'rt-004', name: 'Courtyard Landscaping', description: 'Monthly landscaping maintenance',
    category: 'landscaping', severity: 'minor', frequency: 'monthly', propertyId: 'p-002',
    spaceId: 's-008', vendorId: 'v-003', isActive: true,
    createdAt: '2025-01-15T00:00:00Z', updatedAt: '2025-01-15T00:00:00Z',
  },
  {
    id: 'rt-005', name: 'Nightly Janitorial Service', description: 'Nightly cleaning of common areas and restrooms',
    category: 'janitorial', severity: 'minor', frequency: 'daily', propertyId: 'p-001',
    vendorId: 'v-003', isActive: true,
    createdAt: '2025-02-01T00:00:00Z', updatedAt: '2025-02-01T00:00:00Z',
  },
];
