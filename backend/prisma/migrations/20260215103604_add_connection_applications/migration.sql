-- CreateTable
CREATE TABLE "connection_applications" (
    "id" UUID NOT NULL,
    "applicationId" VARCHAR(30) NOT NULL,
    "citizenId" VARCHAR(12) NOT NULL,
    "serviceType" VARCHAR(20) NOT NULL,
    "applicantName" VARCHAR(150) NOT NULL,
    "mobileNumber" VARCHAR(10) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "address" TEXT NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "state" VARCHAR(100) NOT NULL,
    "pincode" VARCHAR(10) NOT NULL,
    "connectionType" VARCHAR(50) NOT NULL,
    "serviceDetails" JSONB,
    "status" VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "reviewedBy" VARCHAR(12),
    "reviewNotes" TEXT,
    "rejectionReason" TEXT,

    CONSTRAINT "connection_applications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "connection_applications_applicationId_key" ON "connection_applications"("applicationId");

-- CreateIndex
CREATE INDEX "connection_applications_citizenId_idx" ON "connection_applications"("citizenId");

-- CreateIndex
CREATE INDEX "connection_applications_status_idx" ON "connection_applications"("status");

-- CreateIndex
CREATE INDEX "connection_applications_applicationId_idx" ON "connection_applications"("applicationId");

-- AddForeignKey
ALTER TABLE "connection_applications" ADD CONSTRAINT "connection_applications_citizenId_fkey" FOREIGN KEY ("citizenId") REFERENCES "citizens"("aadharNumber") ON DELETE RESTRICT ON UPDATE CASCADE;
