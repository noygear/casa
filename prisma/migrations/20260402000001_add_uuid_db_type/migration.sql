-- Migration: add_uuid_db_type
-- Alters all id and FK columns from TEXT to UUID so PostgreSQL rejects
-- non-UUID values at the DB layer, catching bad seed data immediately.

-- Helper: cast TEXT → UUID for every table
-- (Prisma maps @db.Uuid to the native `uuid` PostgreSQL type)

-- User
ALTER TABLE "User" ALTER COLUMN "id" TYPE UUID USING "id"::uuid;
ALTER TABLE "User" ALTER COLUMN "vendorId" TYPE UUID USING "vendorId"::uuid;

-- Property
ALTER TABLE "Property" ALTER COLUMN "id" TYPE UUID USING "id"::uuid;

-- Space
ALTER TABLE "Space" ALTER COLUMN "id" TYPE UUID USING "id"::uuid;
ALTER TABLE "Space" ALTER COLUMN "propertyId" TYPE UUID USING "propertyId"::uuid;

-- Vendor
ALTER TABLE "Vendor" ALTER COLUMN "id" TYPE UUID USING "id"::uuid;

-- WorkOrder
ALTER TABLE "WorkOrder" ALTER COLUMN "id" TYPE UUID USING "id"::uuid;
ALTER TABLE "WorkOrder" ALTER COLUMN "propertyId" TYPE UUID USING "propertyId"::uuid;
ALTER TABLE "WorkOrder" ALTER COLUMN "spaceId" TYPE UUID USING "spaceId"::uuid;
ALTER TABLE "WorkOrder" ALTER COLUMN "createdById" TYPE UUID USING "createdById"::uuid;
ALTER TABLE "WorkOrder" ALTER COLUMN "assignedToId" TYPE UUID USING "assignedToId"::uuid;
ALTER TABLE "WorkOrder" ALTER COLUMN "vendorId" TYPE UUID USING "vendorId"::uuid;
ALTER TABLE "WorkOrder" ALTER COLUMN "recurringInstanceId" TYPE UUID USING "recurringInstanceId"::uuid;

-- WorkOrderPhoto
ALTER TABLE "WorkOrderPhoto" ALTER COLUMN "id" TYPE UUID USING "id"::uuid;
ALTER TABLE "WorkOrderPhoto" ALTER COLUMN "workOrderId" TYPE UUID USING "workOrderId"::uuid;

-- WorkOrderAuditLog
ALTER TABLE "WorkOrderAuditLog" ALTER COLUMN "id" TYPE UUID USING "id"::uuid;
ALTER TABLE "WorkOrderAuditLog" ALTER COLUMN "workOrderId" TYPE UUID USING "workOrderId"::uuid;
ALTER TABLE "WorkOrderAuditLog" ALTER COLUMN "userId" TYPE UUID USING "userId"::uuid;

-- InspectionReport
ALTER TABLE "InspectionReport" ALTER COLUMN "id" TYPE UUID USING "id"::uuid;
ALTER TABLE "InspectionReport" ALTER COLUMN "workOrderId" TYPE UUID USING "workOrderId"::uuid;
ALTER TABLE "InspectionReport" ALTER COLUMN "inspectorId" TYPE UUID USING "inspectorId"::uuid;

-- RecurringTemplate
ALTER TABLE "RecurringTemplate" ALTER COLUMN "id" TYPE UUID USING "id"::uuid;
ALTER TABLE "RecurringTemplate" ALTER COLUMN "propertyId" TYPE UUID USING "propertyId"::uuid;
ALTER TABLE "RecurringTemplate" ALTER COLUMN "spaceId" TYPE UUID USING "spaceId"::uuid;
ALTER TABLE "RecurringTemplate" ALTER COLUMN "vendorId" TYPE UUID USING "vendorId"::uuid;

-- RecurringInstance
ALTER TABLE "RecurringInstance" ALTER COLUMN "id" TYPE UUID USING "id"::uuid;
ALTER TABLE "RecurringInstance" ALTER COLUMN "templateId" TYPE UUID USING "templateId"::uuid;

-- VendorScoreRecord
ALTER TABLE "VendorScoreRecord" ALTER COLUMN "id" TYPE UUID USING "id"::uuid;
ALTER TABLE "VendorScoreRecord" ALTER COLUMN "vendorId" TYPE UUID USING "vendorId"::uuid;

-- SLAConfiguration
ALTER TABLE "SLAConfiguration" ALTER COLUMN "id" TYPE UUID USING "id"::uuid;
ALTER TABLE "SLAConfiguration" ALTER COLUMN "propertyId" TYPE UUID USING "propertyId"::uuid;

-- PreferredVendorMapping
ALTER TABLE "PreferredVendorMapping" ALTER COLUMN "id" TYPE UUID USING "id"::uuid;
ALTER TABLE "PreferredVendorMapping" ALTER COLUMN "propertyId" TYPE UUID USING "propertyId"::uuid;
ALTER TABLE "PreferredVendorMapping" ALTER COLUMN "vendorId" TYPE UUID USING "vendorId"::uuid;

-- RevokedToken
ALTER TABLE "RevokedToken" ALTER COLUMN "id" TYPE UUID USING "id"::uuid;
