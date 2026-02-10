-- SUVIDHA Database Schema
-- PostgreSQL Database Schema for Government Service Portal
-- Version: 1.0
-- Created: 2026-01-31

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USERS AND AUTHENTICATION
-- ============================================================================

-- Users table - Main user information
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    aadhaar_number VARCHAR(12) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    mobile_number VARCHAR(15) NOT NULL,
    email VARCHAR(255),
    date_of_birth DATE,
    gender VARCHAR(20),
    father_name VARCHAR(255),
    mother_name VARCHAR(255),
    pan_number VARCHAR(10),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(6),
    occupation VARCHAR(100),
    preferred_language VARCHAR(10) DEFAULT 'en',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- OTP verification table
CREATE TABLE otp_verifications (
    otp_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    aadhaar_number VARCHAR(12) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    mobile_number VARCHAR(15) NOT NULL,
    purpose VARCHAR(50) NOT NULL, -- 'login', 'registration', 'password_reset'
    is_verified BOOLEAN DEFAULT false,
    attempts_count INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    expires_at TIMESTAMP NOT NULL,
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User sessions
CREATE TABLE user_sessions (
    session_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    session_token VARCHAR(512) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- SERVICE DEPARTMENTS
-- ============================================================================

-- Consumer IDs for different services
CREATE TABLE consumer_services (
    consumer_service_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    service_type VARCHAR(50) NOT NULL, -- 'electricity', 'gas', 'water', 'municipal'
    consumer_id VARCHAR(100) NOT NULL,
    connection_status VARCHAR(50) DEFAULT 'active', -- 'active', 'inactive', 'suspended'
    connection_date DATE,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(6),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, service_type, consumer_id)
);

-- ============================================================================
-- BILLING AND PAYMENTS
-- ============================================================================

-- Bills table
CREATE TABLE bills (
    bill_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consumer_service_id UUID REFERENCES consumer_services(consumer_service_id) ON DELETE CASCADE,
    bill_number VARCHAR(100) UNIQUE NOT NULL,
    billing_period_start DATE NOT NULL,
    billing_period_end DATE NOT NULL,
    billing_period VARCHAR(50), -- 'January 2026', etc.
    amount DECIMAL(10, 2) NOT NULL,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- 'paid', 'pending', 'overdue', 'cancelled'
    consumption_units DECIMAL(10, 2), -- For electricity, gas, water
    previous_reading DECIMAL(10, 2),
    current_reading DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payments table
CREATE TABLE payments (
    payment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bill_id UUID REFERENCES bills(bill_id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    transaction_id VARCHAR(100) UNIQUE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50), -- 'upi', 'card', 'netbanking', 'cash'
    payment_status VARCHAR(50) DEFAULT 'pending', -- 'success', 'pending', 'failed', 'refunded'
    payment_gateway VARCHAR(50),
    gateway_transaction_id VARCHAR(255),
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payment receipts
CREATE TABLE payment_receipts (
    receipt_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_id UUID REFERENCES payments(payment_id) ON DELETE CASCADE,
    receipt_number VARCHAR(100) UNIQUE NOT NULL,
    receipt_url TEXT,
    sent_via_sms BOOLEAN DEFAULT false,
    sent_via_email BOOLEAN DEFAULT false,
    sms_sent_at TIMESTAMP,
    email_sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- COMPLAINTS MANAGEMENT
-- ============================================================================

-- Complaint types by service
CREATE TABLE complaint_types (
    complaint_type_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_type VARCHAR(50) NOT NULL, -- 'electricity', 'gas', 'water', 'municipal'
    type_code VARCHAR(50) NOT NULL,
    type_name_en VARCHAR(255) NOT NULL,
    type_name_hi VARCHAR(255),
    type_name_kn VARCHAR(255),
    type_name_ta VARCHAR(255),
    type_name_te VARCHAR(255),
    type_name_mr VARCHAR(255),
    type_name_bn VARCHAR(255),
    type_name_gu VARCHAR(255),
    type_name_ml VARCHAR(255),
    type_name_pa VARCHAR(255),
    priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'critical'
    sla_hours INTEGER DEFAULT 48, -- Service Level Agreement in hours
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Complaints table
CREATE TABLE complaints (
    complaint_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_number VARCHAR(100) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    consumer_service_id UUID REFERENCES consumer_services(consumer_service_id) ON DELETE CASCADE,
    complaint_type_id UUID REFERENCES complaint_types(complaint_type_id),
    service_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'open', -- 'open', 'in_progress', 'resolved', 'closed', 'rejected'
    priority VARCHAR(20) DEFAULT 'normal',
    assigned_to UUID, -- Reference to technicians table
    attachment_url TEXT,
    resolution_notes TEXT,
    resolved_at TIMESTAMP,
    closed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Complaint timeline/history
CREATE TABLE complaint_timeline (
    timeline_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID REFERENCES complaints(complaint_id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    note TEXT,
    changed_by UUID, -- User or Admin who made the change
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- TECHNICIANS AND STAFF
-- ============================================================================

-- Technicians/Service staff
CREATE TABLE technicians (
    technician_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    phone_number VARCHAR(15) NOT NULL,
    email VARCHAR(255),
    service_type VARCHAR(50) NOT NULL, -- 'electricity', 'gas', 'water', 'municipal'
    specialization VARCHAR(100),
    assigned_area VARCHAR(100),
    is_available BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- NEW CONNECTIONS
-- ============================================================================

-- New connection applications
CREATE TABLE connection_applications (
    application_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_number VARCHAR(100) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    service_type VARCHAR(50) NOT NULL,
    
    -- Applicant details
    full_name VARCHAR(255) NOT NULL,
    mobile_number VARCHAR(15) NOT NULL,
    email_address VARCHAR(255),
    
    -- Address details
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(6) NOT NULL,
    
    -- Connection details
    connection_type VARCHAR(50), -- 'residential', 'commercial', 'industrial'
    load_required DECIMAL(10, 2), -- For electricity/gas
    
    -- Documents
    aadhaar_document_url TEXT,
    address_proof_url TEXT,
    photo_url TEXT,
    signature_url TEXT,
    
    -- Application status
    status VARCHAR(50) DEFAULT 'submitted', -- 'submitted', 'under_review', 'approved', 'rejected', 'completed'
    reviewed_by UUID,
    review_notes TEXT,
    approved_at TIMESTAMP,
    rejected_at TIMESTAMP,
    completed_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- AUDIT AND LOGS
-- ============================================================================

-- Audit logs for all important actions
CREATE TABLE audit_logs (
    log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id),
    action_type VARCHAR(100) NOT NULL, -- 'login', 'payment', 'complaint', etc.
    entity_type VARCHAR(50), -- 'user', 'bill', 'complaint', etc.
    entity_id UUID,
    old_value JSONB,
    new_value JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System notifications
CREATE TABLE notifications (
    notification_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL, -- 'bill_due', 'payment_success', 'complaint_update', etc.
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Users indexes
CREATE INDEX idx_users_aadhaar ON users(aadhaar_number);
CREATE INDEX idx_users_mobile ON users(mobile_number);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

-- OTP indexes
CREATE INDEX idx_otp_aadhaar ON otp_verifications(aadhaar_number);
CREATE INDEX idx_otp_expires_at ON otp_verifications(expires_at);

-- Consumer services indexes
CREATE INDEX idx_consumer_user_id ON consumer_services(user_id);
CREATE INDEX idx_consumer_service_type ON consumer_services(service_type);
CREATE INDEX idx_consumer_consumer_id ON consumer_services(consumer_id);

-- Bills indexes
CREATE INDEX idx_bills_consumer_service ON bills(consumer_service_id);
CREATE INDEX idx_bills_status ON bills(status);
CREATE INDEX idx_bills_due_date ON bills(due_date);
CREATE INDEX idx_bills_bill_number ON bills(bill_number);

-- Payments indexes
CREATE INDEX idx_payments_bill_id ON payments(bill_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX idx_payments_status ON payments(payment_status);

-- Complaints indexes
CREATE INDEX idx_complaints_user_id ON complaints(user_id);
CREATE INDEX idx_complaints_consumer_service ON complaints(consumer_service_id);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_service_type ON complaints(service_type);
CREATE INDEX idx_complaints_complaint_number ON complaints(complaint_number);
CREATE INDEX idx_complaints_created_at ON complaints(created_at);

-- Complaint timeline indexes
CREATE INDEX idx_complaint_timeline_complaint_id ON complaint_timeline(complaint_id);
CREATE INDEX idx_complaint_timeline_timestamp ON complaint_timeline(timestamp);

-- Technicians indexes
CREATE INDEX idx_technicians_service_type ON technicians(service_type);
CREATE INDEX idx_technicians_is_available ON technicians(is_available);

-- Connection applications indexes
CREATE INDEX idx_applications_user_id ON connection_applications(user_id);
CREATE INDEX idx_applications_status ON connection_applications(status);
CREATE INDEX idx_applications_service_type ON connection_applications(service_type);

-- Audit logs indexes
CREATE INDEX idx_audit_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_action_type ON audit_logs(action_type);
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp);

-- Notifications indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consumer_services_updated_at BEFORE UPDATE ON consumer_services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bills_updated_at BEFORE UPDATE ON bills
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_complaints_updated_at BEFORE UPDATE ON complaints
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_technicians_updated_at BEFORE UPDATE ON technicians
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_connection_applications_updated_at BEFORE UPDATE ON connection_applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View for user's complete service information
CREATE OR REPLACE VIEW user_services_view AS
SELECT 
    u.user_id,
    u.aadhaar_number,
    u.full_name,
    u.mobile_number,
    u.email,
    cs.consumer_service_id,
    cs.service_type,
    cs.consumer_id,
    cs.connection_status,
    cs.connection_date
FROM users u
LEFT JOIN consumer_services cs ON u.user_id = cs.user_id;

-- View for pending bills
CREATE OR REPLACE VIEW pending_bills_view AS
SELECT 
    b.bill_id,
    b.bill_number,
    b.total_amount,
    b.due_date,
    b.billing_period,
    cs.service_type,
    cs.consumer_id,
    u.user_id,
    u.full_name,
    u.mobile_number
FROM bills b
JOIN consumer_services cs ON b.consumer_service_id = cs.consumer_service_id
JOIN users u ON cs.user_id = u.user_id
WHERE b.status IN ('pending', 'overdue');

-- View for active complaints with details
CREATE OR REPLACE VIEW active_complaints_view AS
SELECT 
    c.complaint_id,
    c.complaint_number,
    c.description,
    c.status,
    c.priority,
    c.service_type,
    c.created_at,
    c.updated_at,
    u.user_id,
    u.full_name,
    u.mobile_number,
    cs.consumer_id,
    t.full_name as technician_name,
    t.phone_number as technician_phone
FROM complaints c
JOIN users u ON c.user_id = u.user_id
JOIN consumer_services cs ON c.consumer_service_id = cs.consumer_service_id
LEFT JOIN technicians t ON c.assigned_to = t.technician_id
WHERE c.status NOT IN ('closed', 'rejected');
