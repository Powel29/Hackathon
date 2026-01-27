-- CreateTable
CREATE TABLE "citizens" (
    "aadharNumber" VARCHAR(12) NOT NULL,
    "fullName" VARCHAR(150) NOT NULL,
    "mobileNumber" VARCHAR(10) NOT NULL,
    "email" VARCHAR(150),
    "languagePref" VARCHAR(10) NOT NULL DEFAULT 'en',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "citizens_pkey" PRIMARY KEY ("aadharNumber")
);

-- CreateTable
CREATE TABLE "service_accounts" (
    "accountId" UUID NOT NULL,
    "citizenId" VARCHAR(12) NOT NULL,
    "serviceType" VARCHAR(20) NOT NULL,
    "accountNumber" VARCHAR(30),
    "status" VARCHAR(20) NOT NULL,

    CONSTRAINT "service_accounts_pkey" PRIMARY KEY ("accountId")
);

-- CreateTable
CREATE TABLE "bills" (
    "billId" UUID NOT NULL,
    "accountId" UUID NOT NULL,
    "billingDate" DATE,
    "billingPeriod" VARCHAR(20),
    "amount" DECIMAL(10,2),
    "dueDate" DATE,
    "status" VARCHAR(20) NOT NULL,

    CONSTRAINT "bills_pkey" PRIMARY KEY ("billId")
);

-- CreateTable
CREATE TABLE "payments" (
    "paymentId" UUID NOT NULL,
    "billId" UUID NOT NULL,
    "gateway" VARCHAR(30),
    "transactionRef" VARCHAR(100),
    "amount" DECIMAL(10,2),
    "status" VARCHAR(20) NOT NULL,
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("paymentId")
);

-- CreateTable
CREATE TABLE "complaints" (
    "complaintId" UUID NOT NULL,
    "citizenId" VARCHAR(12) NOT NULL,
    "serviceType" VARCHAR(20) NOT NULL,
    "description" TEXT NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "complaints_pkey" PRIMARY KEY ("complaintId")
);

-- CreateTable
CREATE TABLE "service_request_types" (
    "requestTypeCode" VARCHAR(30) NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "service_request_types_pkey" PRIMARY KEY ("requestTypeCode")
);

-- CreateTable
CREATE TABLE "service_requests" (
    "requestId" UUID NOT NULL,
    "citizenId" VARCHAR(12) NOT NULL,
    "serviceType" VARCHAR(20) NOT NULL,
    "requestType" VARCHAR(30) NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "service_requests_pkey" PRIMARY KEY ("requestId")
);

-- CreateTable
CREATE TABLE "documents" (
    "documentId" UUID NOT NULL,
    "citizenId" VARCHAR(12) NOT NULL,
    "relatedEntity" VARCHAR(30) NOT NULL,
    "relatedId" UUID NOT NULL,
    "documentType" VARCHAR(30) NOT NULL,
    "fileName" VARCHAR(255),
    "filePath" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("documentId")
);

-- CreateTable
CREATE TABLE "alerts" (
    "alertId" UUID NOT NULL,
    "alertType" VARCHAR(30) NOT NULL,
    "serviceType" VARCHAR(20),
    "title" VARCHAR(150) NOT NULL,
    "message" TEXT NOT NULL,
    "severity" VARCHAR(20),
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("alertId")
);

-- CreateTable
CREATE TABLE "kiosk_logs" (
    "logId" UUID NOT NULL,
    "kioskId" VARCHAR(30) NOT NULL,
    "citizenId" VARCHAR(12),
    "action" VARCHAR(50) NOT NULL,
    "metadata" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kiosk_logs_pkey" PRIMARY KEY ("logId")
);

-- CreateIndex
CREATE UNIQUE INDEX "citizens_mobileNumber_key" ON "citizens"("mobileNumber");

-- AddForeignKey
ALTER TABLE "service_accounts" ADD CONSTRAINT "service_accounts_citizenId_fkey" FOREIGN KEY ("citizenId") REFERENCES "citizens"("aadharNumber") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bills" ADD CONSTRAINT "bills_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "service_accounts"("accountId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_billId_fkey" FOREIGN KEY ("billId") REFERENCES "bills"("billId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_citizenId_fkey" FOREIGN KEY ("citizenId") REFERENCES "citizens"("aadharNumber") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_citizenId_fkey" FOREIGN KEY ("citizenId") REFERENCES "citizens"("aadharNumber") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_requestType_fkey" FOREIGN KEY ("requestType") REFERENCES "service_request_types"("requestTypeCode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_citizenId_fkey" FOREIGN KEY ("citizenId") REFERENCES "citizens"("aadharNumber") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kiosk_logs" ADD CONSTRAINT "kiosk_logs_citizenId_fkey" FOREIGN KEY ("citizenId") REFERENCES "citizens"("aadharNumber") ON DELETE SET NULL ON UPDATE CASCADE;
