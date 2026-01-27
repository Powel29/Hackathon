--Citizens
ALTER TABLE "citizens"
ADD CONSTRAINT citizens_aadharNumber_check
CHECK ("aadharNumber" ~ '^[0-9]{12}$');

ALTER TABLE "citizens"
ADD CONSTRAINT citizens_mobileNumber_check
CHECK ("mobileNumber" ~ '^[6-9][0-9]{9}$');

ALTER TABLE "citizens"
ADD CONSTRAINT citizens_languagePref_check
CHECK ("languagePref" IN ('en', 'hi', 'ta', 'te', 'kn'));

--Service Accounts
ALTER TABLE "service_accounts"
ADD CONSTRAINT service_accounts_serviceType_check
CHECK ("serviceType" IN ('electricity', 'gas', 'water'));

ALTER TABLE "service_accounts"
ADD CONSTRAINT service_accounts_status_check
CHECK ("status" IN ('active', 'suspended', 'closed'));

--Bills
ALTER TABLE "bills"
ADD CONSTRAINT bills_status_check
CHECK ("status" IN ('paid', 'unpaid', 'overdue'));

--Payments
ALTER TABLE "payments"
ADD CONSTRAINT payments_status_check
CHECK ("status" IN ('processing', 'failed', 'successful', 'refunded'));

--Complaints
ALTER TABLE "complaints"
ADD CONSTRAINT complaints_serviceType_check
CHECK ("serviceType" IN ('electricity', 'gas', 'water'));

ALTER TABLE "complaints"
ADD CONSTRAINT complaints_status_check
CHECK ("status" IN ('open', 'in_progress', 'resolved', 'closed'));

--Service Requests
ALTER TABLE "service_requests"
ADD CONSTRAINT service_requests_serviceType_check
CHECK ("serviceType" IN ('electricity', 'gas', 'water'));

ALTER TABLE "service_requests"
ADD CONSTRAINT service_requests_status_check
CHECK (
  status IN (
    'submitted',
    'under_review',
    'approved',
    'rejected',
    'completed'
  )
);

--Alerts
ALTER TABLE "alerts"
ADD CONSTRAINT alerts_alert_type_check
CHECK ("alertType" IN ('outage', 'weather', 'maintenance', 'general'));

ALTER TABLE "alerts"
ADD CONSTRAINT alerts_severity_check
CHECK ("severity" IN ('info', 'warning', 'critical'));

--Extra
ALTER TABLE "bills"
ADD CONSTRAINT bills_amount_check
CHECK ("amount" IS NULL OR "amount" >= 0);

ALTER TABLE "payments"
ADD CONSTRAINT payments_amount_check
CHECK ("amount" IS NULL OR "amount" >= 0);