/*
  Warnings:

  - You are about to drop the column `connectionDate` on the `electricity_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `dueAmount` on the `electricity_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `lastBillDate` on the `electricity_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `lastMeterReading` on the `electricity_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `meterNumber` on the `electricity_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `nextReadingDate` on the `electricity_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `phase` on the `electricity_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `powerFactor` on the `electricity_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `tariffCategory` on the `electricity_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `cost` on the `electricity_consumption` table. All the data in the column will be lost.
  - You are about to drop the column `offPeakHourUsage` on the `electricity_consumption` table. All the data in the column will be lost.
  - You are about to drop the column `peakHourUsage` on the `electricity_consumption` table. All the data in the column will be lost.
  - You are about to drop the column `peakLoad` on the `electricity_consumption` table. All the data in the column will be lost.
  - You are about to drop the column `powerFactor` on the `electricity_consumption` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "electricity_accounts" DROP COLUMN "connectionDate",
DROP COLUMN "dueAmount",
DROP COLUMN "lastBillDate",
DROP COLUMN "lastMeterReading",
DROP COLUMN "meterNumber",
DROP COLUMN "nextReadingDate",
DROP COLUMN "phase",
DROP COLUMN "powerFactor",
DROP COLUMN "tariffCategory";

-- AlterTable
ALTER TABLE "electricity_consumption" DROP COLUMN "cost",
DROP COLUMN "offPeakHourUsage",
DROP COLUMN "peakHourUsage",
DROP COLUMN "peakLoad",
DROP COLUMN "powerFactor";
