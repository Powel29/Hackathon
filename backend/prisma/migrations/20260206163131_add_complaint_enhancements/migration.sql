/*
  Warnings:

  - Added the required column `complaintType` to the `complaints` table without a default value. This is not possible if the table is not empty.
  - Added the required column `priority` to the `complaints` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `complaints` table without a default value. This is not possible if the table is not empty.
  - Made the column `updatedAt` on table `complaints` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "complaints" ADD COLUMN     "assignedTo" VARCHAR(12),
ADD COLUMN     "complaintType" VARCHAR(50) NOT NULL,
ADD COLUMN     "kioskId" VARCHAR(30),
ADD COLUMN     "latitude" DECIMAL(10,8),
ADD COLUMN     "location" VARCHAR(255),
ADD COLUMN     "longitude" DECIMAL(11,8),
ADD COLUMN     "priority" VARCHAR(20) NOT NULL,
ADD COLUMN     "resolutionNote" TEXT,
ADD COLUMN     "resolvedAt" TIMESTAMP(3),
ADD COLUMN     "title" VARCHAR(200) NOT NULL,
ALTER COLUMN "updatedAt" SET NOT NULL;

-- AlterTable
ALTER TABLE "documents" ADD COLUMN     "fileSize" INTEGER,
ADD COLUMN     "mimeType" VARCHAR(100);

-- CreateTable
CREATE TABLE "complaint_status_history" (
    "historyId" UUID NOT NULL,
    "complaintId" UUID NOT NULL,
    "oldStatus" VARCHAR(20),
    "newStatus" VARCHAR(20) NOT NULL,
    "changedBy" VARCHAR(12),
    "notes" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "complaint_status_history_pkey" PRIMARY KEY ("historyId")
);

-- CreateIndex
CREATE INDEX "complaint_status_history_complaintId_idx" ON "complaint_status_history"("complaintId");

-- CreateIndex
CREATE INDEX "complaint_status_history_changedAt_idx" ON "complaint_status_history"("changedAt");

-- CreateIndex
CREATE INDEX "complaints_citizenId_idx" ON "complaints"("citizenId");

-- CreateIndex
CREATE INDEX "complaints_status_idx" ON "complaints"("status");

-- CreateIndex
CREATE INDEX "complaints_serviceType_idx" ON "complaints"("serviceType");

-- CreateIndex
CREATE INDEX "complaints_priority_idx" ON "complaints"("priority");

-- CreateIndex
CREATE INDEX "complaints_createdAt_idx" ON "complaints"("createdAt");

-- CreateIndex
CREATE INDEX "documents_relatedEntity_relatedId_idx" ON "documents"("relatedEntity", "relatedId");

-- AddForeignKey
ALTER TABLE "complaint_status_history" ADD CONSTRAINT "complaint_status_history_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "complaints"("complaintId") ON DELETE CASCADE ON UPDATE CASCADE;
