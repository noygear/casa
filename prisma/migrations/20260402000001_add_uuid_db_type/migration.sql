-- Migration: add_uuid_db_type
-- Alters all id and FK columns from TEXT to UUID so PostgreSQL rejects
-- non-UUID values at the DB layer, catching bad seed data immediately.
--
-- FK constraints are NOT DEFERRABLE (Prisma default), so PostgreSQL checks
-- them per-statement. We must drop them all before altering column types,
-- then re-add them once every column is UUID.

-- ── Step 1: Drop all FK constraints ──────────────────────────

ALTER TABLE "User"                  DROP CONSTRAINT "User_vendorId_fkey";
ALTER TABLE "Space"                 DROP CONSTRAINT "Space_propertyId_fkey";
ALTER TABLE "WorkOrder"             DROP CONSTRAINT "WorkOrder_propertyId_fkey";
ALTER TABLE "WorkOrder"             DROP CONSTRAINT "WorkOrder_spaceId_fkey";
ALTER TABLE "WorkOrder"             DROP CONSTRAINT "WorkOrder_createdById_fkey";
ALTER TABLE "WorkOrder"             DROP CONSTRAINT "WorkOrder_assignedToId_fkey";
ALTER TABLE "WorkOrder"             DROP CONSTRAINT "WorkOrder_vendorId_fkey";
ALTER TABLE "WorkOrder"             DROP CONSTRAINT "WorkOrder_recurringInstanceId_fkey";
ALTER TABLE "WorkOrderPhoto"        DROP CONSTRAINT "WorkOrderPhoto_workOrderId_fkey";
ALTER TABLE "WorkOrderAuditLog"     DROP CONSTRAINT "WorkOrderAuditLog_workOrderId_fkey";
ALTER TABLE "WorkOrderAuditLog"     DROP CONSTRAINT "WorkOrderAuditLog_userId_fkey";
ALTER TABLE "InspectionReport"      DROP CONSTRAINT "InspectionReport_workOrderId_fkey";
ALTER TABLE "InspectionReport"      DROP CONSTRAINT "InspectionReport_inspectorId_fkey";
ALTER TABLE "RecurringInstance"     DROP CONSTRAINT "RecurringInstance_templateId_fkey";
ALTER TABLE "VendorScoreRecord"     DROP CONSTRAINT "VendorScoreRecord_vendorId_fkey";
ALTER TABLE "SLAConfiguration"      DROP CONSTRAINT "SLAConfiguration_propertyId_fkey";
ALTER TABLE "PreferredVendorMapping" DROP CONSTRAINT "PreferredVendorMapping_propertyId_fkey";
ALTER TABLE "PreferredVendorMapping" DROP CONSTRAINT "PreferredVendorMapping_vendorId_fkey";

-- ── Step 2: Alter all id and FK columns to UUID ───────────────

-- User
ALTER TABLE "User" ALTER COLUMN "id"       TYPE UUID USING "id"::uuid;
ALTER TABLE "User" ALTER COLUMN "vendorId"  TYPE UUID USING "vendorId"::uuid;

-- Property
ALTER TABLE "Property" ALTER COLUMN "id" TYPE UUID USING "id"::uuid;

-- Space
ALTER TABLE "Space" ALTER COLUMN "id"         TYPE UUID USING "id"::uuid;
ALTER TABLE "Space" ALTER COLUMN "propertyId"  TYPE UUID USING "propertyId"::uuid;

-- Vendor
ALTER TABLE "Vendor" ALTER COLUMN "id" TYPE UUID USING "id"::uuid;

-- WorkOrder
ALTER TABLE "WorkOrder" ALTER COLUMN "id"                  TYPE UUID USING "id"::uuid;
ALTER TABLE "WorkOrder" ALTER COLUMN "propertyId"           TYPE UUID USING "propertyId"::uuid;
ALTER TABLE "WorkOrder" ALTER COLUMN "spaceId"              TYPE UUID USING "spaceId"::uuid;
ALTER TABLE "WorkOrder" ALTER COLUMN "createdById"          TYPE UUID USING "createdById"::uuid;
ALTER TABLE "WorkOrder" ALTER COLUMN "assignedToId"         TYPE UUID USING "assignedToId"::uuid;
ALTER TABLE "WorkOrder" ALTER COLUMN "vendorId"             TYPE UUID USING "vendorId"::uuid;
ALTER TABLE "WorkOrder" ALTER COLUMN "recurringInstanceId"  TYPE UUID USING "recurringInstanceId"::uuid;

-- WorkOrderPhoto
ALTER TABLE "WorkOrderPhoto" ALTER COLUMN "id"          TYPE UUID USING "id"::uuid;
ALTER TABLE "WorkOrderPhoto" ALTER COLUMN "workOrderId"  TYPE UUID USING "workOrderId"::uuid;

-- WorkOrderAuditLog
ALTER TABLE "WorkOrderAuditLog" ALTER COLUMN "id"          TYPE UUID USING "id"::uuid;
ALTER TABLE "WorkOrderAuditLog" ALTER COLUMN "workOrderId"  TYPE UUID USING "workOrderId"::uuid;
ALTER TABLE "WorkOrderAuditLog" ALTER COLUMN "userId"       TYPE UUID USING "userId"::uuid;

-- InspectionReport
ALTER TABLE "InspectionReport" ALTER COLUMN "id"           TYPE UUID USING "id"::uuid;
ALTER TABLE "InspectionReport" ALTER COLUMN "workOrderId"   TYPE UUID USING "workOrderId"::uuid;
ALTER TABLE "InspectionReport" ALTER COLUMN "inspectorId"   TYPE UUID USING "inspectorId"::uuid;

-- RecurringTemplate
ALTER TABLE "RecurringTemplate" ALTER COLUMN "id"         TYPE UUID USING "id"::uuid;
ALTER TABLE "RecurringTemplate" ALTER COLUMN "propertyId"  TYPE UUID USING "propertyId"::uuid;
ALTER TABLE "RecurringTemplate" ALTER COLUMN "spaceId"     TYPE UUID USING "spaceId"::uuid;
ALTER TABLE "RecurringTemplate" ALTER COLUMN "vendorId"    TYPE UUID USING "vendorId"::uuid;

-- RecurringInstance
ALTER TABLE "RecurringInstance" ALTER COLUMN "id"         TYPE UUID USING "id"::uuid;
ALTER TABLE "RecurringInstance" ALTER COLUMN "templateId"  TYPE UUID USING "templateId"::uuid;

-- VendorScoreRecord
ALTER TABLE "VendorScoreRecord" ALTER COLUMN "id"       TYPE UUID USING "id"::uuid;
ALTER TABLE "VendorScoreRecord" ALTER COLUMN "vendorId"  TYPE UUID USING "vendorId"::uuid;

-- SLAConfiguration
ALTER TABLE "SLAConfiguration" ALTER COLUMN "id"         TYPE UUID USING "id"::uuid;
ALTER TABLE "SLAConfiguration" ALTER COLUMN "propertyId"  TYPE UUID USING "propertyId"::uuid;

-- PreferredVendorMapping
ALTER TABLE "PreferredVendorMapping" ALTER COLUMN "id"         TYPE UUID USING "id"::uuid;
ALTER TABLE "PreferredVendorMapping" ALTER COLUMN "propertyId"  TYPE UUID USING "propertyId"::uuid;
ALTER TABLE "PreferredVendorMapping" ALTER COLUMN "vendorId"    TYPE UUID USING "vendorId"::uuid;

-- RevokedToken
ALTER TABLE "RevokedToken" ALTER COLUMN "id" TYPE UUID USING "id"::uuid;

-- ── Step 3: Re-add all FK constraints ────────────────────────

ALTER TABLE "User" ADD CONSTRAINT "User_vendorId_fkey"
  FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Space" ADD CONSTRAINT "Space_propertyId_fkey"
  FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_propertyId_fkey"
  FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_spaceId_fkey"
  FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_createdById_fkey"
  FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_assignedToId_fkey"
  FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_vendorId_fkey"
  FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_recurringInstanceId_fkey"
  FOREIGN KEY ("recurringInstanceId") REFERENCES "RecurringInstance"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "WorkOrderPhoto" ADD CONSTRAINT "WorkOrderPhoto_workOrderId_fkey"
  FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "WorkOrderAuditLog" ADD CONSTRAINT "WorkOrderAuditLog_workOrderId_fkey"
  FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "WorkOrderAuditLog" ADD CONSTRAINT "WorkOrderAuditLog_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "InspectionReport" ADD CONSTRAINT "InspectionReport_workOrderId_fkey"
  FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "InspectionReport" ADD CONSTRAINT "InspectionReport_inspectorId_fkey"
  FOREIGN KEY ("inspectorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "RecurringInstance" ADD CONSTRAINT "RecurringInstance_templateId_fkey"
  FOREIGN KEY ("templateId") REFERENCES "RecurringTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "VendorScoreRecord" ADD CONSTRAINT "VendorScoreRecord_vendorId_fkey"
  FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "SLAConfiguration" ADD CONSTRAINT "SLAConfiguration_propertyId_fkey"
  FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "PreferredVendorMapping" ADD CONSTRAINT "PreferredVendorMapping_propertyId_fkey"
  FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "PreferredVendorMapping" ADD CONSTRAINT "PreferredVendorMapping_vendorId_fkey"
  FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
