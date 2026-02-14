/*
  Warnings:

  - A unique constraint covering the columns `[aadharHash]` on the table `citizens` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `aadharHash` to the `citizens` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `citizens` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "citizens" ADD COLUMN     "aadharHash" TEXT NOT NULL,
ADD COLUMN     "address" TEXT,
ADD COLUMN     "dateOfBirth" DATE,
ADD COLUMN     "gender" VARCHAR(10),
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastLoginAt" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "otp_verifications" (
    "otpId" UUID NOT NULL,
    "citizenId" VARCHAR(12) NOT NULL,
    "otpHash" VARCHAR(64) NOT NULL,
    "purpose" VARCHAR(20) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_verifications_pkey" PRIMARY KEY ("otpId")
);

-- CreateTable
CREATE TABLE "auth_sessions" (
    "sessionId" UUID NOT NULL,
    "citizenId" VARCHAR(12) NOT NULL,
    "tokenHash" VARCHAR(64) NOT NULL,
    "kioskId" VARCHAR(30),
    "ipAddress" VARCHAR(45),
    "userAgent" VARCHAR(255),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_sessions_pkey" PRIMARY KEY ("sessionId")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "logId" UUID NOT NULL,
    "citizenId" VARCHAR(12),
    "action" VARCHAR(50) NOT NULL,
    "ipAddress" VARCHAR(45),
    "userAgent" VARCHAR(255),
    "metadata" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("logId")
);

-- CreateIndex
CREATE INDEX "otp_verifications_citizenId_isVerified_idx" ON "otp_verifications"("citizenId", "isVerified");

-- CreateIndex
CREATE INDEX "otp_verifications_expiresAt_idx" ON "otp_verifications"("expiresAt");

-- CreateIndex
CREATE INDEX "auth_sessions_citizenId_isActive_idx" ON "auth_sessions"("citizenId", "isActive");

-- CreateIndex
CREATE INDEX "auth_sessions_expiresAt_idx" ON "auth_sessions"("expiresAt");

-- CreateIndex
CREATE INDEX "audit_logs_citizenId_idx" ON "audit_logs"("citizenId");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_timestamp_idx" ON "audit_logs"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "citizens_aadharHash_key" ON "citizens"("aadharHash");

-- CreateIndex
CREATE INDEX "citizens_aadharHash_idx" ON "citizens"("aadharHash");

-- CreateIndex
CREATE INDEX "citizens_mobileNumber_idx" ON "citizens"("mobileNumber");

-- AddForeignKey
ALTER TABLE "otp_verifications" ADD CONSTRAINT "otp_verifications_citizenId_fkey" FOREIGN KEY ("citizenId") REFERENCES "citizens"("aadharNumber") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_citizenId_fkey" FOREIGN KEY ("citizenId") REFERENCES "citizens"("aadharNumber") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_citizenId_fkey" FOREIGN KEY ("citizenId") REFERENCES "citizens"("aadharNumber") ON DELETE SET NULL ON UPDATE CASCADE;
