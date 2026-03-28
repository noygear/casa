-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('asset_manager', 'property_manager', 'vendor', 'tenant');

-- CreateEnum
CREATE TYPE "WorkOrderStatus" AS ENUM ('open', 'assigned', 'in_progress', 'needs_review', 'closed', 'skipped');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('minor', 'needs_fix_today', 'immediate');

-- CreateEnum
CREATE TYPE "WorkOrderCategory" AS ENUM ('hvac', 'plumbing', 'electrical', 'fire_safety', 'elevator', 'landscaping', 'janitorial', 'structural', 'tenant_request', 'general');

-- CreateEnum
CREATE TYPE "MaintenanceFrequency" AS ENUM ('daily', 'weekly', 'monthly', 'quarterly', 'annually', 'custom');

-- CreateEnum
CREATE TYPE "PhotoType" AS ENUM ('before', 'after', 'completion', 'start');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "passwordHash" TEXT,
    "phone" TEXT,
    "avatarUrl" TEXT,
    "vendorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Property" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "totalSqFt" INTEGER,
    "yearBuilt" INTEGER,
    "imageUrl" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "occupancyPercent" DOUBLE PRECISION,
    "monthlyRevenue" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Space" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "floor" INTEGER,
    "type" TEXT NOT NULL,
    "tenantName" TEXT,
    "sqFt" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Space_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vendor" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT,
    "specialties" TEXT[],
    "licenseNo" TEXT,
    "insuranceExp" TIMESTAMP(3),
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkOrder" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "WorkOrderStatus" NOT NULL DEFAULT 'open',
    "severity" "Severity" NOT NULL DEFAULT 'minor',
    "category" "WorkOrderCategory" NOT NULL DEFAULT 'general',
    "isInspection" BOOLEAN NOT NULL DEFAULT false,
    "propertyId" TEXT NOT NULL,
    "spaceId" TEXT,
    "createdById" TEXT NOT NULL,
    "assignedToId" TEXT,
    "vendorId" TEXT,
    "dueDate" TIMESTAMP(3),
    "respondedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "slaResponseMin" INTEGER,
    "slaResolveMin" INTEGER,
    "cost" DOUBLE PRECISION,
    "recurringInstanceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkOrderPhoto" (
    "id" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" "PhotoType" NOT NULL,
    "caption" TEXT,
    "gpsLatitude" DOUBLE PRECISION,
    "gpsLongitude" DOUBLE PRECISION,
    "gpsAccuracy" DOUBLE PRECISION,
    "gpsCapturedAt" TIMESTAMP(3),
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkOrderPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkOrderAuditLog" (
    "id" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fromStatus" TEXT NOT NULL,
    "toStatus" TEXT NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkOrderAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InspectionReport" (
    "id" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "inspectorId" TEXT NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "findings" TEXT,
    "correctionRequired" BOOLEAN NOT NULL DEFAULT false,
    "inspectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InspectionReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecurringTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "WorkOrderCategory" NOT NULL,
    "severity" "Severity" NOT NULL DEFAULT 'minor',
    "frequency" "MaintenanceFrequency" NOT NULL,
    "customDays" INTEGER,
    "propertyId" TEXT NOT NULL,
    "spaceId" TEXT,
    "vendorId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecurringTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecurringInstance" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecurringInstance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorScoreRecord" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "rejections" INTEGER NOT NULL DEFAULT 0,
    "skips" INTEGER NOT NULL DEFAULT 0,
    "lateDays" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "completions" INTEGER NOT NULL DEFAULT 0,
    "bonus" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "quality" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "consistency" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "speed" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "volume" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VendorScoreRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SLAConfiguration" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "category" "WorkOrderCategory" NOT NULL,
    "severity" "Severity" NOT NULL,
    "responseTimeMin" INTEGER NOT NULL,
    "resolveTimeMin" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SLAConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PreferredVendorMapping" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "category" "WorkOrderCategory" NOT NULL,
    "vendorId" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PreferredVendorMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RevokedToken" (
    "id" TEXT NOT NULL,
    "jti" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RevokedToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_vendorId_idx" ON "User"("vendorId");

-- CreateIndex
CREATE INDEX "Property_city_state_idx" ON "Property"("city", "state");

-- CreateIndex
CREATE INDEX "Space_propertyId_idx" ON "Space"("propertyId");

-- CreateIndex
CREATE INDEX "Space_type_idx" ON "Space"("type");

-- CreateIndex
CREATE INDEX "Vendor_isActive_idx" ON "Vendor"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "WorkOrder_recurringInstanceId_key" ON "WorkOrder"("recurringInstanceId");

-- CreateIndex
CREATE INDEX "WorkOrder_status_idx" ON "WorkOrder"("status");

-- CreateIndex
CREATE INDEX "WorkOrder_propertyId_idx" ON "WorkOrder"("propertyId");

-- CreateIndex
CREATE INDEX "WorkOrder_assignedToId_idx" ON "WorkOrder"("assignedToId");

-- CreateIndex
CREATE INDEX "WorkOrder_vendorId_idx" ON "WorkOrder"("vendorId");

-- CreateIndex
CREATE INDEX "WorkOrder_category_idx" ON "WorkOrder"("category");

-- CreateIndex
CREATE INDEX "WorkOrder_severity_idx" ON "WorkOrder"("severity");

-- CreateIndex
CREATE INDEX "WorkOrder_createdAt_idx" ON "WorkOrder"("createdAt");

-- CreateIndex
CREATE INDEX "WorkOrderPhoto_workOrderId_idx" ON "WorkOrderPhoto"("workOrderId");

-- CreateIndex
CREATE INDEX "WorkOrderPhoto_type_idx" ON "WorkOrderPhoto"("type");

-- CreateIndex
CREATE INDEX "WorkOrderAuditLog_workOrderId_idx" ON "WorkOrderAuditLog"("workOrderId");

-- CreateIndex
CREATE INDEX "WorkOrderAuditLog_createdAt_idx" ON "WorkOrderAuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "InspectionReport_workOrderId_idx" ON "InspectionReport"("workOrderId");

-- CreateIndex
CREATE INDEX "InspectionReport_inspectorId_idx" ON "InspectionReport"("inspectorId");

-- CreateIndex
CREATE INDEX "RecurringTemplate_isActive_idx" ON "RecurringTemplate"("isActive");

-- CreateIndex
CREATE INDEX "RecurringTemplate_frequency_idx" ON "RecurringTemplate"("frequency");

-- CreateIndex
CREATE INDEX "RecurringInstance_templateId_idx" ON "RecurringInstance"("templateId");

-- CreateIndex
CREATE INDEX "RecurringInstance_dueDate_idx" ON "RecurringInstance"("dueDate");

-- CreateIndex
CREATE INDEX "VendorScoreRecord_vendorId_idx" ON "VendorScoreRecord"("vendorId");

-- CreateIndex
CREATE INDEX "VendorScoreRecord_periodStart_periodEnd_idx" ON "VendorScoreRecord"("periodStart", "periodEnd");

-- CreateIndex
CREATE INDEX "SLAConfiguration_propertyId_idx" ON "SLAConfiguration"("propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "SLAConfiguration_propertyId_category_severity_key" ON "SLAConfiguration"("propertyId", "category", "severity");

-- CreateIndex
CREATE INDEX "PreferredVendorMapping_propertyId_category_idx" ON "PreferredVendorMapping"("propertyId", "category");

-- CreateIndex
CREATE UNIQUE INDEX "PreferredVendorMapping_propertyId_category_vendorId_key" ON "PreferredVendorMapping"("propertyId", "category", "vendorId");

-- CreateIndex
CREATE UNIQUE INDEX "RevokedToken_jti_key" ON "RevokedToken"("jti");

-- CreateIndex
CREATE INDEX "RevokedToken_expiresAt_idx" ON "RevokedToken"("expiresAt");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Space" ADD CONSTRAINT "Space_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_recurringInstanceId_fkey" FOREIGN KEY ("recurringInstanceId") REFERENCES "RecurringInstance"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrderPhoto" ADD CONSTRAINT "WorkOrderPhoto_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrderAuditLog" ADD CONSTRAINT "WorkOrderAuditLog_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrderAuditLog" ADD CONSTRAINT "WorkOrderAuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InspectionReport" ADD CONSTRAINT "InspectionReport_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InspectionReport" ADD CONSTRAINT "InspectionReport_inspectorId_fkey" FOREIGN KEY ("inspectorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringInstance" ADD CONSTRAINT "RecurringInstance_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "RecurringTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorScoreRecord" ADD CONSTRAINT "VendorScoreRecord_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SLAConfiguration" ADD CONSTRAINT "SLAConfiguration_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreferredVendorMapping" ADD CONSTRAINT "PreferredVendorMapping_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreferredVendorMapping" ADD CONSTRAINT "PreferredVendorMapping_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
