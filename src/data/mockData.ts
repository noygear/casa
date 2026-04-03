// ============================================================
// Mock Data — CRE Operations Platform
// ============================================================

import { User, Property, Space, Vendor, WorkOrder, VendorScoreRecord, RecurringTemplate, PreferredVendorMapping } from '../types';
import { subDays, addHours, subHours } from 'date-fns';

// ── Stable UUIDs (must match server/prisma/seed.ts) ─────────

const ID = {
  users: {
    sarah:  'a176ed44-8e08-4a73-9e6d-c81ba2d91028',
    james:  '2c764453-26fd-4967-805e-023de21ba43c',
    mike:   '192eab20-8a0c-4811-9d25-440cd905740c',
    lisa:   '16201d9f-9d73-4f9d-8650-22d4e6b334f1',
    david:  'a31031cb-74dd-4706-9266-32b2952aa8b6',
    carlos: 'd0d34865-0e0d-49cf-b9e4-0fd6ec291512',
    john:   '9b947f8c-648c-4152-a998-9fb811263426',
  },
  vendors: {
    alphaHvac:     '639e31cb-c61f-4fcd-80f1-cba8c8a89bde',
    sparkElectric: '2109cd07-b2df-4fda-ae42-129dc9f594b4',
    cleanPro:      'c506f916-18cc-4ab6-a0c3-1cee8fd10fef',
    summitElev:    '009e8730-573c-4ef7-b9eb-df7eb8ed86c7',
  },
  properties: {
    meridian:   'b8279fbf-42e2-4549-81f3-235a9676f370',
    riverfront: 'a01e943b-0797-4cb8-b6a1-a0b8f5035c11',
    northgate:  'ab2dea97-8367-44bc-aeba-175c8f674dcf',
  },
  spaces: {
    s1:  '547da43c-2bdf-45d7-8665-ca99ea001310',
    s2:  '6becf1e4-098e-4145-aaff-6a8f79676d36',
    s3:  '589147c7-e3b6-4bda-b064-695b6a64cd86',
    s4:  '833e1637-fa4c-44f5-931d-09777a1c4841',
    s5:  '39fc34a8-9cdd-435e-b084-23e97a136b8c',
    s6:  '4a30d642-afc9-45a4-becb-252746672121',
    s7:  '791ae8a4-e44d-4874-ade2-6704c61601f9',
    s8:  'ec95a6e5-4a6a-48a5-aa11-1b97ee0acf46',
    s9:  '684ffc2d-25a4-4f11-ada8-e4f40cb42802',
    s10: '8daefc23-77b3-42ca-9513-5825fadc5f4a',
  },
  workOrders: {
    wo1: '8fe0a1bf-978d-4e80-b3f8-19a3185fca22',
    wo2: '035ade19-fae9-4895-bae5-c4d58d809907',
    wo3: '46c0cad1-2ddf-4b99-b0d1-005b8ac3f155',
    wo4: 'acd8cba7-2b05-488f-beeb-ae3956c9e327',
    wo5: 'efb47572-caaa-4a4c-bf37-7e9047f1dcd2',
    wo6: '40893fe7-a0df-4c7a-95a3-d4245f9451ff',
    wo7: '0ca78ee9-a743-42ba-a575-ba52f87863f2',
    wo8: 'f7a9e066-4f1f-427d-99dd-e7c50da01937',
    wo9: 'ad95cdba-fdb6-4a1a-b539-ada9004ea21f',
  },
  vendorScores: {
    vs1: 'efc8b82c-d922-4e10-b3b5-91e33ae7fe75',
    vs2: '2ee35502-0072-43e2-9374-75d8049e0501',
    vs3: 'b690ed9d-7878-46d0-ad98-890ffadd76e4',
    vs4: '8812fca5-5af7-4861-b5e9-a470a199cdb0',
  },
  recurringTemplates: {
    rt1: '8e8ded2e-7324-4ae9-af55-12e5efd6dc1b',
    rt2: '7fa8c660-b16e-48e4-bbc4-84d5f7a28743',
    rt3: 'e9cb29f2-9161-4ae5-a681-dc64588bb612',
    rt4: '8dee341b-4c8f-4f6f-9b82-713e3b244457',
    rt5: 'bff1004b-b446-4796-aa9a-26849990db28',
  },
  preferredMappings: {
    pvm1:  'a31e70a6-9119-4021-8b07-5369ebd32767',
    pvm2:  'f38562ed-83d7-42bf-adae-a5d799273a81',
    pvm3:  '1333590d-4a01-499e-9c10-f603a5b71d30',
    pvm4:  '23795584-0a56-4e14-a899-24fdbe59691a',
    pvm5:  'cdb240ba-a8b3-4c60-a2f0-c51c0d40ae9e',
    pvm6:  'b028cfab-c15e-4e9c-b925-7bdb656abc03',
    pvm7:  '1305c8a4-b7d2-47ed-916c-0eefbb0476b3',
    pvm8:  'bffc8a42-f016-49df-9235-edfda78d5695',
    pvm9:  '8a8c81e2-0992-42a9-9d9d-4d3d299c98cd',
    pvm10: 'd28ab531-84ed-46de-a25f-2045c992942c',
  },
};

// ── Users ────────────────────────────────────────────────────

export const MOCK_USERS: User[] = [
  {
    id: ID.users.sarah, email: 'sarah.chen@casa.com', name: 'Sarah Chen',
    role: 'asset_manager', createdAt: '2025-01-15T00:00:00Z', updatedAt: '2025-01-15T00:00:00Z',
  },
  {
    id: ID.users.james, email: 'james.porter@meridianpm.com', name: 'James Porter',
    role: 'property_manager', createdAt: '2025-01-15T00:00:00Z', updatedAt: '2025-01-15T00:00:00Z',
  },
  {
    id: ID.users.mike, email: 'ops@alphahvac.com', name: 'Mike Rodriguez',
    role: 'vendor', vendorId: ID.vendors.alphaHvac, createdAt: '2025-02-01T00:00:00Z', updatedAt: '2025-02-01T00:00:00Z',
  },
  {
    id: ID.users.lisa, email: 'dispatch@sparkelectric.com', name: 'Lisa Tran',
    role: 'vendor', vendorId: ID.vendors.sparkElectric, createdAt: '2025-02-01T00:00:00Z', updatedAt: '2025-02-01T00:00:00Z',
  },
  {
    id: ID.users.david, email: 'tenant@greenleafcorp.com', name: 'David Kim',
    role: 'tenant', createdAt: '2025-03-01T00:00:00Z', updatedAt: '2025-03-01T00:00:00Z',
  },
  {
    id: ID.users.john, email: 'j.smith@retailco.com', name: 'John Smith',
    role: 'tenant', createdAt: '2025-03-05T00:00:00Z', updatedAt: '2025-03-05T00:00:00Z',
  },
  {
    id: ID.users.carlos, email: 'martinez@cleanpro.com', name: 'Carlos Martinez',
    role: 'vendor', vendorId: ID.vendors.cleanPro, createdAt: '2025-02-15T00:00:00Z', updatedAt: '2025-02-15T00:00:00Z',
  },
];

// ── Properties ───────────────────────────────────────────────

export const MOCK_PROPERTIES: Property[] = [
  {
    id: ID.properties.meridian, name: 'Meridian Tower', address: '1200 Commerce Blvd',
    city: 'Dallas', state: 'TX', zipCode: '75201', type: 'Office',
    totalSqFt: 285000, yearBuilt: 2018,
    latitude: 32.7767, longitude: -96.7970,
    occupancyPercent: 92, monthlyRevenue: 425000,
    createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: ID.properties.riverfront, name: 'Riverfront Plaza', address: '800 Trinity Ave',
    city: 'Fort Worth', state: 'TX', zipCode: '76102', type: 'Mixed-Use',
    totalSqFt: 420000, yearBuilt: 2015,
    latitude: 32.7555, longitude: -97.3308,
    occupancyPercent: 87, monthlyRevenue: 580000,
    createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: ID.properties.northgate, name: 'Oakmont Business Park', address: '3500 Innovation Dr',
    city: 'Plano', state: 'TX', zipCode: '75024', type: 'Industrial',
    totalSqFt: 180000, yearBuilt: 2020,
    latitude: 33.0198, longitude: -96.6989,
    occupancyPercent: 95, monthlyRevenue: 210000,
    createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z',
  },
];

// ── Spaces ───────────────────────────────────────────────────

export const MOCK_SPACES: Space[] = [
  // Meridian Tower
  { id: ID.spaces.s1, propertyId: ID.properties.meridian, name: 'Suite 200', floor: 2, type: 'suite', tenantName: 'GreenLeaf Corp', sqFt: 4500, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: ID.spaces.s2, propertyId: ID.properties.meridian, name: 'Suite 500', floor: 5, type: 'suite', tenantName: 'Apex Consulting', sqFt: 6200, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: ID.spaces.s3, propertyId: ID.properties.meridian, name: 'Main Lobby', floor: 1, type: 'common_area', sqFt: 3000, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: ID.spaces.s4, propertyId: ID.properties.meridian, name: 'Parking Garage B1', floor: -1, type: 'common_area', sqFt: 25000, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: ID.spaces.s5, propertyId: ID.properties.meridian, name: 'Rooftop Mechanical', floor: 12, type: 'common_area', sqFt: 2000, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  // Riverfront Plaza
  { id: ID.spaces.s6, propertyId: ID.properties.riverfront, name: 'Suite 100', floor: 1, type: 'suite', tenantName: 'River Cafe', sqFt: 2800, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: ID.spaces.s7, propertyId: ID.properties.riverfront, name: 'Suite 301', floor: 3, type: 'suite', tenantName: 'Vanguard Legal', sqFt: 5100, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: ID.spaces.s8, propertyId: ID.properties.riverfront, name: 'Courtyard', floor: 1, type: 'common_area', sqFt: 4000, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  // Oakmont Business Park
  { id: ID.spaces.s9, propertyId: ID.properties.northgate, name: 'Unit A', floor: 1, type: 'suite', tenantName: 'FastTrack Logistics', sqFt: 45000, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: ID.spaces.s10, propertyId: ID.properties.northgate, name: 'Loading Dock', floor: 1, type: 'common_area', sqFt: 8000, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
];

// ── Vendors ──────────────────────────────────────────────────

export const MOCK_VENDORS: Vendor[] = [
  {
    id: ID.vendors.alphaHvac, companyName: 'Alpha HVAC Services', contactEmail: 'ops@alphahvac.com',
    contactPhone: '(214) 555-0100', specialties: ['hvac'], licenseNo: 'HVAC-TX-4821',
    rating: 92, isActive: true, createdAt: '2025-01-15T00:00:00Z', updatedAt: '2025-01-15T00:00:00Z',
  },
  {
    id: ID.vendors.sparkElectric, companyName: 'Spark Electric Co.', contactEmail: 'dispatch@sparkelectric.com',
    contactPhone: '(214) 555-0200', specialties: ['electrical', 'fire_safety'], licenseNo: 'ELEC-TX-9912',
    rating: 87, isActive: true, createdAt: '2025-01-15T00:00:00Z', updatedAt: '2025-01-15T00:00:00Z',
  },
  {
    id: ID.vendors.cleanPro, companyName: 'CleanPro Janitorial', contactEmail: 'martinez@cleanpro.com',
    contactPhone: '(817) 555-0300', specialties: ['janitorial', 'landscaping'],
    rating: 78, isActive: true, createdAt: '2025-01-15T00:00:00Z', updatedAt: '2025-01-15T00:00:00Z',
  },
  {
    id: ID.vendors.summitElev, companyName: 'Summit Elevator Corp', contactEmail: 'service@summitelev.com',
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
    id: ID.workOrders.wo1, title: 'HVAC Unit Not Cooling — Suite 200',
    description: 'Tenant reports AC unit in Suite 200 is blowing warm air. Thermostat set to 72°F but room reading 81°F.',
    status: 'in_progress', severity: 'needs_fix_today', category: 'hvac', isInspection: false,
    cost: null,
    propertyId: ID.properties.meridian, property: MOCK_PROPERTIES[0],
    spaceId: ID.spaces.s1, space: MOCK_SPACES[0],
    createdById: ID.users.david, createdBy: MOCK_USERS[4],
    assignedToId: ID.users.mike, assignedTo: MOCK_USERS[2],
    vendorId: ID.vendors.alphaHvac, vendor: MOCK_VENDORS[0],
    dueDate: hoursAgo(-4), respondedAt: hoursAgo(1), slaResponseMin: 120, slaResolveMin: 480,
    createdAt: hoursAgo(3), updatedAt: hoursAgo(1),
    photos: [],
    auditLog: [
      { id: 'al-001', workOrderId: ID.workOrders.wo1, userId: ID.users.james, fromStatus: 'open', toStatus: 'assigned', createdAt: hoursAgo(2.5) },
      { id: 'al-002', workOrderId: ID.workOrders.wo1, userId: ID.users.mike, fromStatus: 'assigned', toStatus: 'in_progress', createdAt: hoursAgo(1) },
    ],
  },
  {
    id: ID.workOrders.wo2, title: 'Quarterly Fire Alarm Inspection',
    description: 'Scheduled quarterly fire alarm system inspection for Meridian Tower. All floors must be tested with photo documentation.',
    status: 'needs_review', severity: 'minor', category: 'fire_safety', isInspection: true,
    cost: 450.00,
    propertyId: ID.properties.meridian, property: MOCK_PROPERTIES[0],
    createdById: ID.users.james, createdBy: MOCK_USERS[1],
    assignedToId: ID.users.lisa, assignedTo: MOCK_USERS[3],
    vendorId: ID.vendors.sparkElectric, vendor: MOCK_VENDORS[1],
    dueDate: daysAgo(-1), respondedAt: daysAgo(2), slaResponseMin: 1440, slaResolveMin: 10080,
    createdAt: daysAgo(5), updatedAt: daysAgo(0),
    photos: [],
    auditLog: [
      { id: 'al-003', workOrderId: ID.workOrders.wo2, userId: ID.users.james, fromStatus: 'open', toStatus: 'assigned', createdAt: daysAgo(4) },
      { id: 'al-004', workOrderId: ID.workOrders.wo2, userId: ID.users.lisa, fromStatus: 'assigned', toStatus: 'in_progress', createdAt: daysAgo(2) },
      { id: 'al-005', workOrderId: ID.workOrders.wo2, userId: ID.users.lisa, fromStatus: 'in_progress', toStatus: 'needs_review', createdAt: daysAgo(0) },
    ],
  },
  {
    id: ID.workOrders.wo3, title: 'Water Leak in Parking Garage B1',
    description: 'Standing water near column B-12 in underground parking. Possible pipe leak above ceiling tiles.',
    status: 'open', severity: 'immediate', category: 'plumbing', isInspection: false,
    cost: null,
    propertyId: ID.properties.meridian, property: MOCK_PROPERTIES[0],
    spaceId: ID.spaces.s4, space: MOCK_SPACES[3],
    createdById: ID.users.james, createdBy: MOCK_USERS[1],
    slaResponseMin: 60, slaResolveMin: 240,
    createdAt: hoursAgo(0.5), updatedAt: hoursAgo(0.5),
  },
  {
    id: ID.workOrders.wo4, title: 'Lobby Light Fixture Flickering',
    description: 'Two recessed LED panels in the main lobby are flickering intermittently. May need ballast replacement.',
    status: 'assigned', severity: 'minor', category: 'electrical', isInspection: false,
    cost: null,
    propertyId: ID.properties.meridian, property: MOCK_PROPERTIES[0],
    spaceId: ID.spaces.s3, space: MOCK_SPACES[2],
    createdById: ID.users.james, createdBy: MOCK_USERS[1],
    assignedToId: ID.users.lisa, assignedTo: MOCK_USERS[3],
    vendorId: ID.vendors.sparkElectric, vendor: MOCK_VENDORS[1],
    dueDate: daysAgo(-3), slaResponseMin: 480, slaResolveMin: 2880,
    createdAt: daysAgo(1), updatedAt: hoursAgo(6),
    auditLog: [
      { id: 'al-006', workOrderId: ID.workOrders.wo4, userId: ID.users.james, fromStatus: 'open', toStatus: 'assigned', createdAt: hoursAgo(6) },
    ],
  },
  {
    id: ID.workOrders.wo5, title: 'Courtyard Landscaping — Monthly Service',
    description: 'Monthly landscaping maintenance for Riverfront Plaza courtyard. Includes mowing, edging, seasonal planting review.',
    status: 'closed', severity: 'minor', category: 'landscaping', isInspection: false,
    cost: 1500.00,
    propertyId: ID.properties.riverfront, property: MOCK_PROPERTIES[1],
    spaceId: ID.spaces.s8, space: MOCK_SPACES[7],
    createdById: ID.users.james, createdBy: MOCK_USERS[1],
    assignedToId: ID.users.carlos, assignedTo: MOCK_USERS[6],
    vendorId: ID.vendors.cleanPro, vendor: MOCK_VENDORS[2],
    dueDate: daysAgo(2), respondedAt: daysAgo(6), resolvedAt: daysAgo(3), slaResponseMin: 1440, slaResolveMin: 10080,
    createdAt: daysAgo(8), updatedAt: daysAgo(3),
    photos: [],
    auditLog: [
      { id: 'al-008', workOrderId: ID.workOrders.wo5, userId: ID.users.james, fromStatus: 'open', toStatus: 'assigned', createdAt: daysAgo(6) },
      { id: 'al-009', workOrderId: ID.workOrders.wo5, userId: ID.users.carlos, fromStatus: 'assigned', toStatus: 'in_progress', createdAt: daysAgo(5) },
      { id: 'al-010', workOrderId: ID.workOrders.wo5, userId: ID.users.carlos, fromStatus: 'in_progress', toStatus: 'needs_review', createdAt: daysAgo(3) },
      { id: 'al-011', workOrderId: ID.workOrders.wo5, userId: ID.users.james, fromStatus: 'needs_review', toStatus: 'closed', createdAt: daysAgo(3) },
    ],
  },
  {
    id: ID.workOrders.wo6, title: 'Elevator Annual Safety Inspection',
    description: 'Annual elevator safety inspection required by code. Both passenger elevators and freight elevator must be inspected.',
    status: 'assigned', severity: 'needs_fix_today', category: 'elevator', isInspection: true,
    cost: null,
    propertyId: ID.properties.riverfront, property: MOCK_PROPERTIES[1],
    createdById: ID.users.sarah, createdBy: MOCK_USERS[0],
    assignedToId: ID.users.mike, assignedTo: MOCK_USERS[2],
    vendorId: ID.vendors.summitElev, vendor: MOCK_VENDORS[3],
    dueDate: daysAgo(-2), slaResponseMin: 480, slaResolveMin: 4320,
    createdAt: daysAgo(3), updatedAt: daysAgo(2),
    auditLog: [
      { id: 'al-007', workOrderId: ID.workOrders.wo6, userId: ID.users.sarah, fromStatus: 'open', toStatus: 'assigned', createdAt: daysAgo(2) },
    ],
  },
  {
    id: ID.workOrders.wo7, title: 'Loading Dock Gate Malfunction',
    description: 'Automated roll-up gate at loading dock is not responding to remote. Manual override works but gate sticks halfway.',
    status: 'in_progress', severity: 'needs_fix_today', category: 'structural', isInspection: false,
    cost: null,
    propertyId: ID.properties.northgate, property: MOCK_PROPERTIES[2],
    spaceId: ID.spaces.s10, space: MOCK_SPACES[9],
    createdById: ID.users.james, createdBy: MOCK_USERS[1],
    assignedToId: ID.users.mike, assignedTo: MOCK_USERS[2],
    vendorId: ID.vendors.alphaHvac, vendor: MOCK_VENDORS[0],
    dueDate: daysAgo(-1), respondedAt: hoursAgo(8), slaResponseMin: 240, slaResolveMin: 1440,
    createdAt: daysAgo(1), updatedAt: hoursAgo(8),
  },
  {
    id: ID.workOrders.wo8, title: 'Restroom Deep Clean — Suite 301 Floor',
    description: 'Tenant-requested deep clean of shared restrooms on floor 3. Includes grout cleaning and fixture polish.',
    status: 'closed', severity: 'minor', category: 'janitorial', isInspection: false,
    cost: 325.50,
    propertyId: ID.properties.riverfront, property: MOCK_PROPERTIES[1],
    spaceId: ID.spaces.s7, space: MOCK_SPACES[6],
    createdById: ID.users.david, createdBy: MOCK_USERS[4],
    assignedToId: ID.users.carlos, assignedTo: MOCK_USERS[6],
    vendorId: ID.vendors.cleanPro, vendor: MOCK_VENDORS[2],
    dueDate: daysAgo(5), respondedAt: daysAgo(8), resolvedAt: daysAgo(6), slaResponseMin: 480, slaResolveMin: 2880,
    createdAt: daysAgo(10), updatedAt: daysAgo(6),
    photos: [],
    auditLog: [
      { id: 'al-012', workOrderId: ID.workOrders.wo8, userId: ID.users.david, fromStatus: 'open', toStatus: 'assigned', createdAt: daysAgo(8) },
      { id: 'al-013', workOrderId: ID.workOrders.wo8, userId: ID.users.carlos, fromStatus: 'assigned', toStatus: 'in_progress', createdAt: daysAgo(7) },
      { id: 'al-014', workOrderId: ID.workOrders.wo8, userId: ID.users.carlos, fromStatus: 'in_progress', toStatus: 'needs_review', createdAt: daysAgo(6) },
      { id: 'al-015', workOrderId: ID.workOrders.wo8, userId: ID.users.james, fromStatus: 'needs_review', toStatus: 'closed', createdAt: daysAgo(6) },
    ],
  },
  {
    id: ID.workOrders.wo9, title: 'Partial Power Outage — Suite 400',
    description: 'Tenant reported half the suite lost power. Breaker box was checked but unable to reset without tripping immediately.',
    status: 'in_progress', severity: 'needs_fix_today', category: 'electrical', isInspection: false,
    cost: null,
    propertyId: ID.properties.meridian, property: MOCK_PROPERTIES[0],
    spaceId: ID.spaces.s1, space: MOCK_SPACES[0],
    createdById: ID.users.james, createdBy: MOCK_USERS[1],
    assignedToId: ID.users.lisa, assignedTo: MOCK_USERS[3],
    vendorId: ID.vendors.sparkElectric, vendor: MOCK_VENDORS[1],
    dueDate: daysAgo(0), respondedAt: hoursAgo(1), slaResponseMin: 240, slaResolveMin: 1440,
    createdAt: hoursAgo(4), updatedAt: hoursAgo(1),
    auditLog: [
      { id: 'al-016', workOrderId: ID.workOrders.wo9, userId: ID.users.david, fromStatus: 'open', toStatus: 'assigned', createdAt: hoursAgo(4) },
      { id: 'al-017', workOrderId: ID.workOrders.wo9, userId: ID.users.lisa, fromStatus: 'assigned', toStatus: 'in_progress', createdAt: hoursAgo(1) },
    ],
  },
];

// Generate 50 historical completed work orders over the last 12 months for vendor graph analytics
const CATEGORIES: any[] = ['plumbing', 'electrical', 'hvac', 'structural', 'cleaning', 'fire_safety', 'elevator', 'landscaping'];

// Map vendor company to the vendor user who does the work
const VENDOR_USER_MAP: Record<string, User> = {
  [ID.vendors.alphaHvac]:     MOCK_USERS[2],  // Mike
  [ID.vendors.sparkElectric]: MOCK_USERS[3],  // Lisa
  [ID.vendors.cleanPro]:      MOCK_USERS[6],  // Carlos
  [ID.vendors.summitElev]:    MOCK_USERS[2],  // Mike (no dedicated user for Summit)
};

for (let i = 0; i < 50; i++) {
  const property = MOCK_PROPERTIES[Math.floor(Math.random() * MOCK_PROPERTIES.length)];
  const vendor = MOCK_VENDORS[Math.floor(Math.random() * MOCK_VENDORS.length)];
  const vendorUser = VENDOR_USER_MAP[vendor.id] || MOCK_USERS[2];
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
    assignedToId: vendorUser.id,
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
      { id: `al-hist-${i}-2`, workOrderId: `wo-hist-${i}`, userId: vendorUser.id, fromStatus: 'assigned', toStatus: 'in_progress', createdAt: inProgressDate.toISOString() },
      { id: `al-hist-${i}-3`, workOrderId: `wo-hist-${i}`, userId: vendorUser.id, fromStatus: 'in_progress', toStatus: 'needs_review', createdAt: subHours(resolvedDate, 1).toISOString() },
      { id: `al-hist-${i}-4`, workOrderId: `wo-hist-${i}`, userId: MOCK_USERS[1].id, fromStatus: 'needs_review', toStatus: 'closed', createdAt: resolvedDate.toISOString() },
    ],
  });
}

// ── Vendor Score Records ─────────────────────────────────────

export const MOCK_VENDOR_SCORES: VendorScoreRecord[] = [
  {
    id: ID.vendorScores.vs1, vendorId: ID.vendors.alphaHvac, periodStart: daysAgo(30), periodEnd: daysAgo(0),
    score: 92, rejections: 1, skips: 0, lateDays: 0.5, completions: 12, bonus: 5,
    quality: 90, consistency: 100, speed: 98.5, volume: 12, createdAt: daysAgo(0),
  },
  {
    id: ID.vendorScores.vs2, vendorId: ID.vendors.sparkElectric, periodStart: daysAgo(30), periodEnd: daysAgo(0),
    score: 87, rejections: 1, skips: 0, lateDays: 2, completions: 8, bonus: 0,
    quality: 90, consistency: 100, speed: 94, volume: 8, createdAt: daysAgo(0),
  },
  {
    id: ID.vendorScores.vs3, vendorId: ID.vendors.cleanPro, periodStart: daysAgo(30), periodEnd: daysAgo(0),
    score: 78, rejections: 2, skips: 1, lateDays: 3, completions: 15, bonus: 0,
    quality: 80, consistency: 95, speed: 91, volume: 15, createdAt: daysAgo(0),
  },
  {
    id: ID.vendorScores.vs4, vendorId: ID.vendors.summitElev, periodStart: daysAgo(30), periodEnd: daysAgo(0),
    score: 95, rejections: 0, skips: 0, lateDays: 0, completions: 4, bonus: 0,
    quality: 100, consistency: 100, speed: 100, volume: 4, createdAt: daysAgo(0),
  },
];

// ── Recurring Templates ──────────────────────────────────────

export const MOCK_RECURRING_TEMPLATES: RecurringTemplate[] = [
  {
    id: ID.recurringTemplates.rt1, name: 'HVAC Filter Replacement', description: 'Replace HVAC filters on all rooftop units',
    category: 'hvac', severity: 'minor', frequency: 'monthly', propertyId: ID.properties.meridian,
    spaceId: ID.spaces.s5, vendorId: ID.vendors.alphaHvac, isActive: true,
    createdAt: '2025-01-15T00:00:00Z', updatedAt: '2025-01-15T00:00:00Z',
  },
  {
    id: ID.recurringTemplates.rt2, name: 'Fire Safety Quarterly Inspection', description: 'Full fire alarm and sprinkler system inspection',
    category: 'fire_safety', severity: 'needs_fix_today', frequency: 'quarterly', propertyId: ID.properties.meridian,
    vendorId: ID.vendors.sparkElectric, isActive: true,
    createdAt: '2025-01-15T00:00:00Z', updatedAt: '2025-01-15T00:00:00Z',
  },
  {
    id: ID.recurringTemplates.rt3, name: 'Elevator Safety Inspection', description: 'Annual elevator safety and compliance inspection',
    category: 'elevator', severity: 'needs_fix_today', frequency: 'annually', propertyId: ID.properties.riverfront,
    vendorId: ID.vendors.summitElev, isActive: true,
    createdAt: '2025-01-15T00:00:00Z', updatedAt: '2025-01-15T00:00:00Z',
  },
  {
    id: ID.recurringTemplates.rt4, name: 'Courtyard Landscaping', description: 'Monthly landscaping maintenance',
    category: 'landscaping', severity: 'minor', frequency: 'monthly', propertyId: ID.properties.riverfront,
    spaceId: ID.spaces.s8, vendorId: ID.vendors.cleanPro, isActive: true,
    createdAt: '2025-01-15T00:00:00Z', updatedAt: '2025-01-15T00:00:00Z',
  },
  {
    id: ID.recurringTemplates.rt5, name: 'Nightly Janitorial Service', description: 'Nightly cleaning of common areas and restrooms',
    category: 'janitorial', severity: 'minor', frequency: 'daily', propertyId: ID.properties.meridian,
    vendorId: ID.vendors.cleanPro, isActive: true,
    createdAt: '2025-02-01T00:00:00Z', updatedAt: '2025-02-01T00:00:00Z',
  },
];

// ── Preferred Vendor Mappings ───────────────────────────────

export const MOCK_PREFERRED_VENDOR_MAPPINGS: PreferredVendorMapping[] = [
  { id: ID.preferredMappings.pvm1, propertyId: ID.properties.meridian, category: 'hvac', vendorId: ID.vendors.alphaHvac, priority: 1 },
  { id: ID.preferredMappings.pvm2, propertyId: ID.properties.meridian, category: 'electrical', vendorId: ID.vendors.sparkElectric, priority: 1 },
  { id: ID.preferredMappings.pvm3, propertyId: ID.properties.meridian, category: 'janitorial', vendorId: ID.vendors.cleanPro, priority: 1 },
  { id: ID.preferredMappings.pvm4, propertyId: ID.properties.meridian, category: 'elevator', vendorId: ID.vendors.summitElev, priority: 1 },
  { id: ID.preferredMappings.pvm5, propertyId: ID.properties.riverfront, category: 'hvac', vendorId: ID.vendors.alphaHvac, priority: 1 },
  { id: ID.preferredMappings.pvm6, propertyId: ID.properties.riverfront, category: 'electrical', vendorId: ID.vendors.sparkElectric, priority: 1 },
  { id: ID.preferredMappings.pvm7, propertyId: ID.properties.riverfront, category: 'elevator', vendorId: ID.vendors.summitElev, priority: 1 },
  { id: ID.preferredMappings.pvm8, propertyId: ID.properties.riverfront, category: 'janitorial', vendorId: ID.vendors.cleanPro, priority: 1 },
  { id: ID.preferredMappings.pvm9, propertyId: ID.properties.northgate, category: 'hvac', vendorId: ID.vendors.alphaHvac, priority: 1 },
  { id: ID.preferredMappings.pvm10, propertyId: ID.properties.northgate, category: 'electrical', vendorId: ID.vendors.sparkElectric, priority: 1 },
];

// ── Property Budgets ────────────────────────────────────────

export const MOCK_PROPERTY_BUDGETS: { propertyId: string; annualBudget: number }[] = [
  { propertyId: ID.properties.meridian, annualBudget: 150000 },
  { propertyId: ID.properties.riverfront, annualBudget: 200000 },
  { propertyId: ID.properties.northgate, annualBudget: 80000 },
];
