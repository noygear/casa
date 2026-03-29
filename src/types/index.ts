// ============================================================
// CRE Operations Platform — TypeScript Types
// ============================================================
// These types mirror the Prisma schema for use in the React
// frontend. In a full-stack setup, these would be generated
// by Prisma Client.
// ============================================================

// ── Enums ────────────────────────────────────────────────────

export type UserRole = 'asset_manager' | 'property_manager' | 'vendor' | 'tenant';

export type WorkOrderStatus = 'open' | 'assigned' | 'in_progress' | 'needs_review' | 'closed' | 'skipped';

export type Severity = 'minor' | 'needs_fix_today' | 'immediate';

export type WorkOrderCategory =
  | 'hvac' | 'plumbing' | 'electrical' | 'fire_safety'
  | 'elevator' | 'landscaping' | 'janitorial' | 'structural'
  | 'tenant_request' | 'general';

export type MaintenanceFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually' | 'custom';

export type PhotoType = 'before' | 'after' | 'completion' | 'start' | 'invoice';

export interface GPSCoordinate {
  latitude: number;
  longitude: number;
  accuracy: number; // meters
  capturedAt: string; // ISO timestamp
}

// ── Models ───────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
  vendorId?: string;
  propertyId?: string;
  spaceId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Property {
  id: string;
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
  createdAt: string;
  updatedAt: string;
  spaces?: Space[];
}

export interface Space {
  id: string;
  propertyId: string;
  name: string;
  floor?: number;
  type: 'suite' | 'common_area';
  tenantName?: string;
  sqFt?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Vendor {
  id: string;
  companyName: string;
  contactEmail: string;
  contactPhone?: string;
  specialties: string[];
  licenseNo?: string;
  insuranceExp?: string;
  rating: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkOrder {
  id: string;
  title: string;
  description: string;
  status: WorkOrderStatus;
  severity: Severity;
  category: WorkOrderCategory;
  isInspection: boolean;
  cost: number | null;
  propertyId: string;
  property?: Property;
  spaceId?: string | null;
  space?: Space | null;
  createdById: string;
  createdBy?: User;
  assignedToId?: string | null;
  assignedTo?: User | null;
  vendorId?: string | null;
  vendor?: Vendor | null;
  dueDate?: string;
  respondedAt?: string;
  resolvedAt?: string;
  slaResponseMin?: number;
  slaResolveMin?: number;
  recurringInstanceId?: string;
  createdAt: string;
  updatedAt: string;
  photos?: WorkOrderPhoto[];
  auditLog?: WorkOrderAuditLog[];
  inspections?: InspectionReport[];
  invoiceLines?: InvoiceLineItem[];
}

export interface InvoiceLineItem {
  id: string;
  workOrderId: string;
  description: string;
  category?: string;
  quantity: number;
  unitPrice: number;
  total: number;
  createdAt: string;
}

export interface WorkOrderPhoto {
  id: string;
  workOrderId: string;
  url: string;
  type: PhotoType;
  caption?: string;
  uploadedAt: string;
  gps?: GPSCoordinate;
}

export interface WorkOrderAuditLog {
  id: string;
  workOrderId: string;
  userId: string;
  user?: User;
  fromStatus: string;
  toStatus: string;
  comment?: string;
  createdAt: string;
}

export interface InspectionReport {
  id: string;
  workOrderId: string;
  inspectorId: string;
  inspector?: User;
  passed: boolean;
  findings?: string;
  correctionRequired: boolean;
  inspectedAt: string;
}

export interface RecurringTemplate {
  id: string;
  name: string;
  description: string;
  category: WorkOrderCategory;
  severity: Severity;
  frequency: MaintenanceFrequency;
  customDays?: number;
  propertyId: string;
  spaceId?: string;
  vendorId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VendorScoreRecord {
  id: string;
  vendorId: string;
  periodStart: string;
  periodEnd: string;
  score: number;
  rejections: number;
  skips: number;
  lateDays: number;
  completions: number;
  bonus: number;
  quality: number;
  consistency: number;
  speed: number;
  volume: number;
  createdAt: string;
}

export interface SLAConfiguration {
  id: string;
  propertyId: string;
  category: WorkOrderCategory;
  severity: Severity;
  responseTimeMin: number;
  resolveTimeMin: number;
}

export interface PreferredVendorMapping {
  id: string;
  propertyId: string;
  category: WorkOrderCategory;
  vendorId: string;
  priority: number; // 1 = primary, 2 = backup
}

// ── Utility Types ────────────────────────────────────────────

export interface SLAStatus {
  responseOnTrack: boolean;
  resolveOnTrack: boolean;
  responseElapsedMin: number;
  resolveElapsedMin: number;
  responseTargetMin: number;
  resolveTargetMin: number;
  responsePercentUsed: number;
  resolvePercentUsed: number;
}

export const SEVERITY_MULTIPLIER: Record<Severity, number> = {
  minor: 1,
  needs_fix_today: 2,
  immediate: 4,
};

export const STATUS_LABELS: Record<WorkOrderStatus, string> = {
  open: 'Open',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  needs_review: 'Needs Review',
  closed: 'Closed',
  skipped: 'Skipped',
};

export const CATEGORY_LABELS: Record<WorkOrderCategory, string> = {
  hvac: 'HVAC',
  plumbing: 'Plumbing',
  electrical: 'Electrical',
  fire_safety: 'Fire Safety',
  elevator: 'Elevator',
  landscaping: 'Landscaping',
  janitorial: 'Janitorial',
  structural: 'Structural',
  tenant_request: 'Tenant Request',
  general: 'General',
};

export const ROLE_LABELS: Record<UserRole, string> = {
  asset_manager: 'Asset Manager',
  property_manager: 'Property Manager',
  vendor: 'Vendor',
  tenant: 'Tenant',
};
