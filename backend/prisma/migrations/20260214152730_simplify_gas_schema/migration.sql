/*
  Warnings:

  - You are about to drop the column `connectionDate` on the `gas_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `dueAmount` on the `gas_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `lastBillDate` on the `gas_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `lastMeterReading` on the `gas_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `lastSafetyCheck` on the `gas_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `meterNumber` on the `gas_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `nextReadingDate` on the `gas_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `cost` on the `gas_consumption` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "gas_accounts" DROP COLUMN "connectionDate",
DROP COLUMN "dueAmount",
DROP COLUMN "lastBillDate",
DROP COLUMN "lastMeterReading",
DROP COLUMN "lastSafetyCheck",
DROP COLUMN "meterNumber",
DROP COLUMN "nextReadingDate";

-- AlterTable
ALTER TABLE "gas_consumption" DROP COLUMN "cost";
