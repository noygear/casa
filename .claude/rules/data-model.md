# Data Model Reference

The Prisma schema at `prisma/schema.prisma` defines 14 models. Do not add models without discussing the schema change first.

## Core Models

| Model | Purpose | Key Fields |
|-------|---------|-----------|
| User | All actors | role (asset_manager, property_manager, vendor, tenant), email, vendorId |
| Property | Physical buildings | name, address, type (Office, Retail, Industrial, Mixed-Use) |
| Space | Suites/common areas | propertyId, type (suite, common_area), tenantName |
| Vendor | Service companies | specialties[], licenseNo, insuranceExp, rating |
| WorkOrder | Core ticket | status, severity, category, propertyId, vendorId, SLA fields |
| WorkOrderPhoto | Evidence | type (before, after, completion), url (CDN), workOrderId |
| WorkOrderAuditLog | Immutable log | fromStatus, toStatus, userId, comment, createdAt |
| InspectionReport | High-liability checks | passed, findings, correctionRequired |
| RecurringTemplate | PM schedules | frequency, category, severity, propertyId, vendorId |
| RecurringInstance | Generated from template | templateId, dueDate, workOrderId |
| VendorScoreRecord | Performance snapshot | quality, consistency, speed, volume, periodStart/End |
| SLAConfiguration | Targets per property | category, severity, responseTimeMin, resolveTimeMin |

## Enums

- **UserRole**: asset_manager, property_manager, vendor, tenant
- **WorkOrderStatus**: open, assigned, in_progress, needs_review, closed, skipped
- **Severity**: minor, needs_fix_today, immediate
- **WorkOrderCategory**: hvac, plumbing, electrical, fire_safety, elevator, landscaping, janitorial, structural, tenant_request, general
- **MaintenanceFrequency**: daily, weekly, monthly, quarterly, annually, custom
- **PhotoType**: before, after, completion

## Rules

- Never cascade delete audit logs.
- `SLAConfiguration` has a unique constraint on [propertyId, category, severity].
- `VendorScoreRecord` is period-based. Do not update existing records — create new ones.
- `Space.tenantName` is nullable (vacant spaces).
