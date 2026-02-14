/*
  Warnings:

  - You are about to drop the column `latitude` on the `complaints` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `complaints` table. All the data in the column will be lost.
  - Made the column `amount` on table `payments` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_billId_fkey";

-- DropIndex
DROP INDEX "complaint_status_history_changedAt_idx";

-- DropIndex
DROP INDEX "complaints_createdAt_idx";

-- DropIndex
DROP INDEX "complaints_priority_idx";

-- DropIndex
DROP INDEX "complaints_serviceType_idx";

-- AlterTable
ALTER TABLE "complaints" DROP COLUMN "latitude",
DROP COLUMN "longitude";

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "billType" VARCHAR(20),
ADD COLUMN     "electricityBillId" UUID,
ADD COLUMN     "gasBillId" UUID,
ADD COLUMN     "municipalBillId" UUID,
ADD COLUMN     "waterBillId" UUID,
ALTER COLUMN "billId" DROP NOT NULL,
ALTER COLUMN "amount" SET NOT NULL;

-- CreateTable
CREATE TABLE "electricity_accounts" (
    "accountId" UUID NOT NULL,
    "citizenId" VARCHAR(12) NOT NULL,
    "consumerNumber" VARCHAR(30) NOT NULL,
    "connectionType" VARCHAR(20) NOT NULL,
    "sanctionedLoad" VARCHAR(20) NOT NULL,
    "tariffCategory" VARCHAR(50),
    "phase" VARCHAR(20),
    "meterNumber" VARCHAR(30),
    "status" VARCHAR(20) NOT NULL,
    "currentMonthUsage" DOUBLE PRECISION,
    "dailyAverage" DOUBLE PRECISION,
    "peakLoad" DOUBLE PRECISION,
    "powerFactor" DOUBLE PRECISION,
    "lastBillAmount" DECIMAL(10,2),
    "lastBillDate" DATE,
    "dueAmount" DECIMAL(10,2),
    "lastMeterReading" DOUBLE PRECISION,
    "lastReadingDate" TIMESTAMP(3),
    "nextReadingDate" DATE,
    "connectionDate" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "electricity_accounts_pkey" PRIMARY KEY ("accountId")
);

-- CreateTable
CREATE TABLE "electricity_consumption" (
    "id" UUID NOT NULL,
    "accountId" UUID NOT NULL,
    "date" DATE NOT NULL,
    "consumption" DOUBLE PRECISION NOT NULL,
    "peakLoad" DOUBLE PRECISION,
    "powerFactor" DOUBLE PRECISION,
    "cost" DECIMAL(10,2),
    "peakHourUsage" DOUBLE PRECISION,
    "offPeakHourUsage" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "electricity_consumption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "electricity_bills" (
    "billId" UUID NOT NULL,
    "accountId" UUID NOT NULL,
    "billNumber" VARCHAR(30) NOT NULL,
    "billingPeriod" VARCHAR(20) NOT NULL,
    "billingStartDate" DATE NOT NULL,
    "billingEndDate" DATE NOT NULL,
    "unitsConsumed" DOUBLE PRECISION NOT NULL,
    "previousReading" DOUBLE PRECISION NOT NULL,
    "currentReading" DOUBLE PRECISION NOT NULL,
    "energyCharges" DECIMAL(10,2) NOT NULL,
    "fixedCharges" DECIMAL(10,2) NOT NULL,
    "demandCharges" DECIMAL(10,2),
    "taxAmount" DECIMAL(10,2) NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "dueDate" DATE NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "electricity_bills_pkey" PRIMARY KEY ("billId")
);

-- CreateTable
CREATE TABLE "gas_accounts" (
    "accountId" UUID NOT NULL,
    "citizenId" VARCHAR(12) NOT NULL,
    "consumerNumber" VARCHAR(30) NOT NULL,
    "connectionType" VARCHAR(20) NOT NULL,
    "gasType" VARCHAR(20) NOT NULL,
    "pipelineSize" VARCHAR(20),
    "meterNumber" VARCHAR(30),
    "status" VARCHAR(20) NOT NULL,
    "currentMonthUsage" DOUBLE PRECISION,
    "dailyAverage" DOUBLE PRECISION,
    "pressure" DOUBLE PRECISION,
    "lastBillAmount" DECIMAL(10,2),
    "lastBillDate" DATE,
    "dueAmount" DECIMAL(10,2),
    "lastMeterReading" DOUBLE PRECISION,
    "lastReadingDate" TIMESTAMP(3),
    "nextReadingDate" DATE,
    "lastSafetyCheck" DATE,
    "nextSafetyCheck" DATE,
    "connectionDate" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gas_accounts_pkey" PRIMARY KEY ("accountId")
);

-- CreateTable
CREATE TABLE "gas_consumption" (
    "id" UUID NOT NULL,
    "accountId" UUID NOT NULL,
    "date" DATE NOT NULL,
    "consumption" DOUBLE PRECISION NOT NULL,
    "pressure" DOUBLE PRECISION,
    "cost" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gas_consumption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gas_bills" (
    "billId" UUID NOT NULL,
    "accountId" UUID NOT NULL,
    "billNumber" VARCHAR(30) NOT NULL,
    "billingPeriod" VARCHAR(20) NOT NULL,
    "billingStartDate" DATE NOT NULL,
    "billingEndDate" DATE NOT NULL,
    "unitsConsumed" DOUBLE PRECISION NOT NULL,
    "previousReading" DOUBLE PRECISION NOT NULL,
    "currentReading" DOUBLE PRECISION NOT NULL,
    "gasCharges" DECIMAL(10,2) NOT NULL,
    "fixedCharges" DECIMAL(10,2) NOT NULL,
    "taxAmount" DECIMAL(10,2) NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "dueDate" DATE NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gas_bills_pkey" PRIMARY KEY ("billId")
);

-- CreateTable
CREATE TABLE "water_accounts" (
    "accountId" UUID NOT NULL,
    "citizenId" VARCHAR(12) NOT NULL,
    "consumerNumber" VARCHAR(30) NOT NULL,
    "connectionType" VARCHAR(20) NOT NULL,
    "pipeSize" VARCHAR(20),
    "numberOfTaps" INTEGER,
    "meterNumber" VARCHAR(30),
    "status" VARCHAR(20) NOT NULL,
    "currentMonthUsage" DOUBLE PRECISION,
    "dailyAverage" DOUBLE PRECISION,
    "waterPressure" DOUBLE PRECISION,
    "lastBillAmount" DECIMAL(10,2),
    "lastBillDate" DATE,
    "dueAmount" DECIMAL(10,2),
    "lastMeterReading" DOUBLE PRECISION,
    "lastReadingDate" TIMESTAMP(3),
    "nextReadingDate" DATE,
    "lastQualityTest" DATE,
    "waterQualityStatus" VARCHAR(20),
    "connectionDate" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "water_accounts_pkey" PRIMARY KEY ("accountId")
);

-- CreateTable
CREATE TABLE "water_consumption" (
    "id" UUID NOT NULL,
    "accountId" UUID NOT NULL,
    "date" DATE NOT NULL,
    "consumption" DOUBLE PRECISION NOT NULL,
    "pressure" DOUBLE PRECISION,
    "cost" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "water_consumption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "water_bills" (
    "billId" UUID NOT NULL,
    "accountId" UUID NOT NULL,
    "billNumber" VARCHAR(30) NOT NULL,
    "billingPeriod" VARCHAR(20) NOT NULL,
    "billingStartDate" DATE NOT NULL,
    "billingEndDate" DATE NOT NULL,
    "unitsConsumed" DOUBLE PRECISION NOT NULL,
    "previousReading" DOUBLE PRECISION NOT NULL,
    "currentReading" DOUBLE PRECISION NOT NULL,
    "waterCharges" DECIMAL(10,2) NOT NULL,
    "sewerageCharges" DECIMAL(10,2),
    "fixedCharges" DECIMAL(10,2) NOT NULL,
    "taxAmount" DECIMAL(10,2) NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "dueDate" DATE NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "water_bills_pkey" PRIMARY KEY ("billId")
);

-- CreateTable
CREATE TABLE "municipal_accounts" (
    "accountId" UUID NOT NULL,
    "citizenId" VARCHAR(12) NOT NULL,
    "propertyTaxNumber" VARCHAR(30) NOT NULL,
    "propertyType" VARCHAR(30) NOT NULL,
    "propertyArea" DOUBLE PRECISION,
    "propertyValue" DECIMAL(12,2),
    "constructionYear" INTEGER,
    "numberOfFloors" INTEGER,
    "status" VARCHAR(20) NOT NULL,
    "annualTaxAmount" DECIMAL(10,2),
    "taxCategory" VARCHAR(30),
    "lastBillAmount" DECIMAL(10,2),
    "lastBillDate" DATE,
    "dueAmount" DECIMAL(10,2),
    "garbageCollection" BOOLEAN NOT NULL DEFAULT true,
    "drainageConnection" BOOLEAN NOT NULL DEFAULT true,
    "streetLightCoverage" BOOLEAN NOT NULL DEFAULT true,
    "registrationDate" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "municipal_accounts_pkey" PRIMARY KEY ("accountId")
);

-- CreateTable
CREATE TABLE "municipal_bills" (
    "billId" UUID NOT NULL,
    "accountId" UUID NOT NULL,
    "billNumber" VARCHAR(30) NOT NULL,
    "billingPeriod" VARCHAR(20) NOT NULL,
    "financialYear" VARCHAR(10) NOT NULL,
    "propertyTax" DECIMAL(10,2) NOT NULL,
    "waterTax" DECIMAL(10,2),
    "sewerageTax" DECIMAL(10,2),
    "garbageTax" DECIMAL(10,2),
    "educationCess" DECIMAL(10,2),
    "otherCharges" DECIMAL(10,2),
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "dueDate" DATE NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "municipal_bills_pkey" PRIMARY KEY ("billId")
);

-- CreateIndex
CREATE UNIQUE INDEX "electricity_accounts_citizenId_key" ON "electricity_accounts"("citizenId");

-- CreateIndex
CREATE UNIQUE INDEX "electricity_accounts_consumerNumber_key" ON "electricity_accounts"("consumerNumber");

-- CreateIndex
CREATE INDEX "electricity_accounts_consumerNumber_idx" ON "electricity_accounts"("consumerNumber");

-- CreateIndex
CREATE INDEX "electricity_accounts_status_idx" ON "electricity_accounts"("status");

-- CreateIndex
CREATE INDEX "electricity_consumption_accountId_date_idx" ON "electricity_consumption"("accountId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "electricity_bills_billNumber_key" ON "electricity_bills"("billNumber");

-- CreateIndex
CREATE INDEX "electricity_bills_accountId_idx" ON "electricity_bills"("accountId");

-- CreateIndex
CREATE INDEX "electricity_bills_status_idx" ON "electricity_bills"("status");

-- CreateIndex
CREATE UNIQUE INDEX "gas_accounts_citizenId_key" ON "gas_accounts"("citizenId");

-- CreateIndex
CREATE UNIQUE INDEX "gas_accounts_consumerNumber_key" ON "gas_accounts"("consumerNumber");

-- CreateIndex
CREATE INDEX "gas_accounts_consumerNumber_idx" ON "gas_accounts"("consumerNumber");

-- CreateIndex
CREATE INDEX "gas_consumption_accountId_date_idx" ON "gas_consumption"("accountId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "gas_bills_billNumber_key" ON "gas_bills"("billNumber");

-- CreateIndex
CREATE INDEX "gas_bills_accountId_idx" ON "gas_bills"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "water_accounts_citizenId_key" ON "water_accounts"("citizenId");

-- CreateIndex
CREATE UNIQUE INDEX "water_accounts_consumerNumber_key" ON "water_accounts"("consumerNumber");

-- CreateIndex
CREATE INDEX "water_accounts_consumerNumber_idx" ON "water_accounts"("consumerNumber");

-- CreateIndex
CREATE INDEX "water_consumption_accountId_date_idx" ON "water_consumption"("accountId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "water_bills_billNumber_key" ON "water_bills"("billNumber");

-- CreateIndex
CREATE INDEX "water_bills_accountId_idx" ON "water_bills"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "municipal_accounts_citizenId_key" ON "municipal_accounts"("citizenId");

-- CreateIndex
CREATE UNIQUE INDEX "municipal_accounts_propertyTaxNumber_key" ON "municipal_accounts"("propertyTaxNumber");

-- CreateIndex
CREATE INDEX "municipal_accounts_propertyTaxNumber_idx" ON "municipal_accounts"("propertyTaxNumber");

-- CreateIndex
CREATE UNIQUE INDEX "municipal_bills_billNumber_key" ON "municipal_bills"("billNumber");

-- CreateIndex
CREATE INDEX "municipal_bills_accountId_idx" ON "municipal_bills"("accountId");

-- CreateIndex
CREATE INDEX "payments_billType_idx" ON "payments"("billType");

-- AddForeignKey
ALTER TABLE "electricity_accounts" ADD CONSTRAINT "electricity_accounts_citizenId_fkey" FOREIGN KEY ("citizenId") REFERENCES "citizens"("aadharNumber") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "electricity_consumption" ADD CONSTRAINT "electricity_consumption_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "electricity_accounts"("accountId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "electricity_bills" ADD CONSTRAINT "electricity_bills_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "electricity_accounts"("accountId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gas_accounts" ADD CONSTRAINT "gas_accounts_citizenId_fkey" FOREIGN KEY ("citizenId") REFERENCES "citizens"("aadharNumber") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gas_consumption" ADD CONSTRAINT "gas_consumption_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "gas_accounts"("accountId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gas_bills" ADD CONSTRAINT "gas_bills_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "gas_accounts"("accountId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "water_accounts" ADD CONSTRAINT "water_accounts_citizenId_fkey" FOREIGN KEY ("citizenId") REFERENCES "citizens"("aadharNumber") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "water_consumption" ADD CONSTRAINT "water_consumption_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "water_accounts"("accountId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "water_bills" ADD CONSTRAINT "water_bills_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "water_accounts"("accountId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "municipal_accounts" ADD CONSTRAINT "municipal_accounts_citizenId_fkey" FOREIGN KEY ("citizenId") REFERENCES "citizens"("aadharNumber") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "municipal_bills" ADD CONSTRAINT "municipal_bills_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "municipal_accounts"("accountId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_billId_fkey" FOREIGN KEY ("billId") REFERENCES "bills"("billId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_electricityBillId_fkey" FOREIGN KEY ("electricityBillId") REFERENCES "electricity_bills"("billId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_gasBillId_fkey" FOREIGN KEY ("gasBillId") REFERENCES "gas_bills"("billId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_waterBillId_fkey" FOREIGN KEY ("waterBillId") REFERENCES "water_bills"("billId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_municipalBillId_fkey" FOREIGN KEY ("municipalBillId") REFERENCES "municipal_bills"("billId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "otp_verifications" ADD CONSTRAINT "otp_verifications_citizenId_fkey" FOREIGN KEY ("citizenId") REFERENCES "citizens"("aadharNumber") ON DELETE CASCADE ON UPDATE CASCADE;
