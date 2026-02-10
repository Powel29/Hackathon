-- SUVIDHA Initial Data Seed
-- This file populates the database with essential initial data
-- Run this after creating the schema

-- ============================================================================
-- COMPLAINT TYPES
-- ============================================================================

-- Electricity Complaint Types
INSERT INTO complaint_types (service_type, type_code, type_name_en, type_name_hi, type_name_kn, type_name_ta, type_name_te, priority, sla_hours, is_active) VALUES
('electricity', 'POWER_CUT', 'Power Outage', 'बिजली कटौती', 'ವಿದ್ಯುತ್ ಕಡಿತ', 'மின்தடை', 'విద్యుత్ నిలిపివేత', 'high', 4, true),
('electricity', 'VOLTAGE_ISSUE', 'Voltage Fluctuation', 'वोल्टेज में उतार-चढ़ाव', 'ವೋಲ್ಟೇಜ್ ಏರಿಳಿತ', 'மின்னழுத்த ஏற்ற இறக்கம்', 'వోల్టేజ్ హెచ్చుతగ్గులు', 'normal', 24, true),
('electricity', 'METER_FAULT', 'Meter Fault', 'मीटर खराबी', 'ಮೀಟರ್ ದೋಷ', 'மீட்டர் பழுது', 'మీటర్ లోపం', 'normal', 48, true),
('electricity', 'BILLING_ERROR', 'Billing Error', 'बिलिंग त्रुटि', 'ಬಿಲ್ಲಿಂಗ್ ದೋಷ', 'கட்டண பிழை', 'బిల్లింగ్ లోపం', 'normal', 72, true),
('electricity', 'POLE_DAMAGE', 'Damaged Pole/Wire', 'क्षतिग्रस्त खंभा/तार', 'ಹಾನಿಗೊಳಗಾದ ಕಂಬ/ತಂತಿ', 'சேதமடைந்த கம்பம்/கம்பி', 'దెబ్బతిన్న స్తంభం/వైర్', 'critical', 2, true),
('electricity', 'LINE_FAULT', 'Line Fault', 'लाइन फॉल्ट', 'ಲೈನ್ ದೋಷ', 'வரி பழுது', 'లైన్ లోపం', 'high', 6, true);

-- Gas Complaint Types
INSERT INTO complaint_types (service_type, type_code, type_name_en, type_name_hi, type_name_kn, type_name_ta, type_name_te, priority, sla_hours, is_active) VALUES
('gas', 'GAS_LEAK', 'Gas Leakage', 'गैस रिसाव', 'ಅನಿಲ ಸೋರಿಕೆ', 'எரிவாயு கசிவு', 'గ్యాస్ లీకేజీ', 'critical', 1, true),
('gas', 'NO_SUPPLY', 'No Gas Supply', 'गैस आपूर्ति नहीं', 'ಅನಿಲ ಪೂರೈಕೆ ಇಲ್ಲ', 'எரிவாயு வழங்கல் இல்லை', 'గ్యాస్ సరఫరా లేదు', 'high', 4, true),
('gas', 'LOW_PRESSURE', 'Low Pressure', 'कम दबाव', 'ಕಡಿಮೆ ಒತ್ತಡ', 'குறைந்த அழுத்தம்', 'తక్కువ ఒత్తిడి', 'normal', 24, true),
('gas', 'METER_ISSUE', 'Meter Reading Issue', 'मीटर रीडिंग समस्या', 'ಮೀಟರ್ ಓದುವಿಕೆ ಸಮಸ್ಯೆ', 'மீட்டர் வாசிப்பு சிக்கல்', 'మీటర్ రీడింగ్ సమస్య', 'normal', 48, true),
('gas', 'PIPELINE_DAMAGE', 'Pipeline Damage', 'पाइपलाइन क्षति', 'ಪೈಪ್‌ಲೈನ್ ಹಾನಿ', 'குழாய் சேதம்', 'పైప్‌లైన్ నష్టం', 'critical', 2, true),
('gas', 'CONNECTION_ISSUE', 'Connection Problem', 'कनेक्शन समस्या', 'ಸಂಪರ್ಕ ಸಮಸ್ಯೆ', 'இணைப்பு பிரச்சனை', 'కనెక్షన్ సమస్య', 'high', 6, true);

-- Water Complaint Types
INSERT INTO complaint_types (service_type, type_code, type_name_en, type_name_hi, type_name_kn, type_name_ta, type_name_te, priority, sla_hours, is_active) VALUES
('water', 'NO_WATER', 'No Water Supply', 'पानी की आपूर्ति नहीं', 'ನೀರಿನ ಪೂರೈಕೆ ಇಲ್ಲ', 'நீர் வழங்கல் இல்லை', 'నీటి సరఫరా లేదు', 'high', 6, true),
('water', 'LOW_PRESSURE', 'Low Water Pressure', 'कम पानी का दबाव', 'ಕಡಿಮೆ ನೀರಿನ ಒತ್ತಡ', 'குறைந்த நீர் அழுத்தம்', 'తక్కువ నీటి ఒత్తిడి', 'normal', 24, true),
('water', 'DIRTY_WATER', 'Contaminated Water', 'दूषित पानी', 'ಕಲುಷಿತ ನೀರು', 'அசுத்த நீர்', 'కలుషిత నీరు', 'critical', 2, true),
('water', 'PIPE_LEAK', 'Pipe Leakage', 'पाइप रिसाव', 'ಪೈಪ್ ಸೋರಿಕೆ', 'குழாய் கசிவு', 'పైపు లీకేజీ', 'high', 12, true),
('water', 'METER_FAULT', 'Meter Malfunction', 'मीटर खराबी', 'ಮೀಟರ್ ದೋಷ', 'மீட்டர் செயலிழப்பு', 'మీటర్ లోపం', 'normal', 48, true),
('water', 'QUALITY_ISSUE', 'Water Quality Issue', 'पानी की गुणवत्ता समस्या', 'ನೀರಿನ ಗುಣಮಟ್ಟ ಸಮಸ್ಯೆ', 'நீர் தரச் சிக்கல்', 'నీటి నాణ్యత సమస్య', 'high', 4, true);

-- Municipal Complaint Types
INSERT INTO complaint_types (service_type, type_code, type_name_en, type_name_hi, type_name_kn, type_name_ta, type_name_te, priority, sla_hours, is_active) VALUES
('municipal', 'GARBAGE_COLLECTION', 'Garbage Not Collected', 'कचरा एकत्र नहीं किया गया', 'ಕಸ ಸಂಗ್ರಹಿಸಿಲ್ಲ', 'குப்பை சேகரிக்கப்படவில்லை', 'చెత్త సేకరించలేదు', 'normal', 24, true),
('municipal', 'STREET_LIGHT', 'Street Light Not Working', 'स्ट्रीट लाइट काम नहीं कर रही', 'ಸ್ಟ್ರೀಟ್ ಲೈಟ್ ಕೆಲಸ ಮಾಡುತ್ತಿಲ್ಲ', 'தெரு விளக்கு வேலை செய்யவில்லை', 'వీధి దీపం పని చేయడం లేదు', 'normal', 48, true),
('municipal', 'ROAD_DAMAGE', 'Road Damage', 'सड़क क्षति', 'ರಸ್ತೆ ಹಾನಿ', 'சாலை சேதம்', 'రోడ్డు నష్టం', 'high', 72, true),
('municipal', 'DRAINAGE_ISSUE', 'Drainage Problem', 'जल निकासी समस्या', 'ಒಳಚರಂಡಿ ಸಮಸ್ಯೆ', 'வடிகால் பிரச்சனை', 'డ్రైనేజీ సమస్య', 'high', 24, true),
('municipal', 'PUBLIC_TOILET', 'Public Toilet Issue', 'सार्वजनिक शौचालय समस्या', 'ಸಾರ್ವಜನಿಕ ಶೌಚಾಲಯ ಸಮಸ್ಯೆ', 'பொது கழிப்பறை சிக்கல்', 'ప్రజా మరుగుదొడ్డి సమస్య', 'normal', 48, true),
('municipal', 'STRAY_ANIMALS', 'Stray Animal Issue', 'आवारा पशु समस्या', 'ಅಲೆಮಾರಿ ಪ್ರಾಣಿ ಸಮಸ್ಯೆ', 'தெருநாய் பிரச்சனை', 'వీధి జంతువుల సమస్య', 'normal', 48, true);

-- ============================================================================
-- TECHNICIANS
-- ============================================================================

INSERT INTO technicians (full_name, employee_id, phone_number, email, service_type, specialization, assigned_area, is_available, is_active) VALUES
-- Electricity Technicians
('Rajesh Kumar', 'TECH-ELEC-001', '+91 98765 43210', 'rajesh.tech@example.com', 'electricity', 'Power Distribution', 'North Bangalore', true, true),
('Amit Sharma', 'TECH-ELEC-002', '+91 98765 43211', 'amit.tech@example.com', 'electricity', 'Meter Installation', 'South Bangalore', true, true),
('Vikram Singh', 'TECH-ELEC-003', '+91 98765 43212', 'vikram.tech@example.com', 'electricity', 'Line Maintenance', 'East Bangalore', true, true),
('Ramesh Patel', 'TECH-ELEC-004', '+91 98765 43213', 'ramesh.tech@example.com', 'electricity', 'Transformer Repair', 'West Bangalore', true, true),

-- Gas Technicians
('Priya Patel', 'TECH-GAS-001', '+91 98765 43214', 'priya.tech@example.com', 'gas', 'Pipeline Maintenance', 'North Bangalore', true, true),
('Sanjay Reddy', 'TECH-GAS-002', '+91 98765 43215', 'sanjay.tech@example.com', 'gas', 'Gas Meter Inspection', 'South Bangalore', true, true),
('Deepak Rao', 'TECH-GAS-003', '+91 98765 43216', 'deepak.tech@example.com', 'gas', 'Emergency Response', 'East Bangalore', true, true),

-- Water Technicians
('Suresh Singh', 'TECH-WAT-001', '+91 98765 43217', 'suresh.tech@example.com', 'water', 'Water Supply', 'North Bangalore', true, true),
('Anita Desai', 'TECH-WAT-002', '+91 98765 43218', 'anita.tech@example.com', 'water', 'Pipe Repair', 'South Bangalore', true, true),
('Karthik Nair', 'TECH-WAT-003', '+91 98765 43219', 'karthik.tech@example.com', 'water', 'Water Quality Testing', 'East Bangalore', true, true),

-- Municipal Technicians
('Lakshmi Reddy', 'TECH-MUN-001', '+91 98765 43220', 'lakshmi.tech@example.com', 'municipal', 'Sanitation', 'North Bangalore', true, true),
('Ganesh Iyer', 'TECH-MUN-002', '+91 98765 43221', 'ganesh.tech@example.com', 'municipal', 'Road Maintenance', 'South Bangalore', true, true),
('Meena Shah', 'TECH-MUN-003', '+91 98765 43222', 'meena.tech@example.com', 'municipal', 'Drainage Systems', 'East Bangalore', true, true);

-- ============================================================================
-- SAMPLE USERS FOR TESTING
-- ============================================================================

-- Test User 1 (Electricity Consumer)
INSERT INTO users (aadhaar_number, full_name, mobile_number, email, date_of_birth, gender, father_name, mother_name, address, city, state, pincode, preferred_language, is_active) VALUES
('123456789012', 'Rajesh Kumar', '+91 98765 43210', 'rajesh@example.com', '1985-05-15', 'Male', 'Suresh Kumar', 'Savitri Devi', '123 MG Road', 'Bangalore', 'Karnataka', '560001', 'en', true);

-- Create consumer service for test user 1
INSERT INTO consumer_services (user_id, service_type, consumer_id, connection_status, connection_date, address, city, state, pincode) VALUES
((SELECT user_id FROM users WHERE aadhaar_number = '123456789012'), 'electricity', 'EC123456789', 'active', '2020-01-15', '123 MG Road', 'Bangalore', 'Karnataka', '560001');

-- Test User 2 (Gas Consumer)
INSERT INTO users (aadhaar_number, full_name, mobile_number, email, date_of_birth, gender, father_name, mother_name, address, city, state, pincode, preferred_language, is_active) VALUES
('234567890123', 'Priya Sharma', '+91 98765 43230', 'priya@example.com', '1990-08-20', 'Female', 'Anil Sharma', 'Sunita Sharma', '456 Brigade Road', 'Bangalore', 'Karnataka', '560002', 'hi', true);

-- Create consumer service for test user 2
INSERT INTO consumer_services (user_id, service_type, consumer_id, connection_status, connection_date, address, city, state, pincode) VALUES
((SELECT user_id FROM users WHERE aadhaar_number = '234567890123'), 'gas', 'GC987654321', 'active', '2021-03-10', '456 Brigade Road', 'Bangalore', 'Karnataka', '560002');

-- Test User 3 (Water Consumer)
INSERT INTO users (aadhaar_number, full_name, mobile_number, email, date_of_birth, gender, father_name, mother_name, address, city, state, pincode, preferred_language, is_active) VALUES
('345678901234', 'Amit Patel', '+91 98765 43240', 'amit@example.com', '1988-12-10', 'Male', 'Ramesh Patel', 'Geeta Patel', '789 Indiranagar', 'Bangalore', 'Karnataka', '560003', 'kn', true);

-- Create consumer service for test user 3
INSERT INTO consumer_services (user_id, service_type, consumer_id, connection_status, connection_date, address, city, state, pincode) VALUES
((SELECT user_id FROM users WHERE aadhaar_number = '345678901234'), 'water', 'WC987654321', 'active', '2019-06-25', '789 Indiranagar', 'Bangalore', 'Karnataka', '560003');

-- Admin User
INSERT INTO users (aadhaar_number, full_name, mobile_number, email, date_of_birth, gender, address, city, state, pincode, preferred_language, is_active) VALUES
('999999999999', 'System Administrator', '+91 99999 99999', 'admin@suvidha.gov.in', '1980-01-01', 'Other', 'Government Office, Vidhana Soudha', 'Bangalore', 'Karnataka', '560001', 'en', true);

-- ============================================================================
-- SAMPLE BILLS FOR TESTING
-- ============================================================================

-- Bills for Electricity Consumer
INSERT INTO bills (consumer_service_id, bill_number, billing_period_start, billing_period_end, billing_period, amount, tax_amount, total_amount, due_date, status, consumption_units, previous_reading, current_reading) VALUES
((SELECT consumer_service_id FROM consumer_services WHERE consumer_id = 'EC123456789'), 
 'ELEC-2026-001', '2026-01-01', '2026-01-31', 'January 2026', 2200.00, 250.00, 2450.00, '2026-02-10', 'pending', 350.00, 5420.00, 5770.00),
((SELECT consumer_service_id FROM consumer_services WHERE consumer_id = 'EC123456789'), 
 'ELEC-2025-012', '2025-12-01', '2025-12-31', 'December 2025', 1900.00, 200.00, 2100.00, '2026-01-10', 'paid', 320.00, 5100.00, 5420.00);

-- Bills for Gas Consumer
INSERT INTO bills (consumer_service_id, bill_number, billing_period_start, billing_period_end, billing_period, amount, tax_amount, total_amount, due_date, status, consumption_units, previous_reading, current_reading) VALUES
((SELECT consumer_service_id FROM consumer_services WHERE consumer_id = 'GC987654321'), 
 'GAS-2026-001', '2026-01-01', '2026-01-31', 'January 2026', 1400.00, 150.00, 1550.00, '2026-02-10', 'pending', 45.00, 320.00, 365.00);

-- Bills for Water Consumer
INSERT INTO bills (consumer_service_id, bill_number, billing_period_start, billing_period_end, billing_period, amount, tax_amount, total_amount, due_date, status, consumption_units, previous_reading, current_reading) VALUES
((SELECT consumer_service_id FROM consumer_services WHERE consumer_id = 'WC987654321'), 
 'WATER-2026-001', '2026-01-01', '2026-01-31', 'January 2026', 800.00, 50.00, 850.00, '2026-01-25', 'overdue', 12000.00, 45000.00, 57000.00);

-- ============================================================================
-- SAMPLE COMPLAINTS FOR TESTING
-- ============================================================================

-- Sample complaint for electricity
INSERT INTO complaints (complaint_number, user_id, consumer_service_id, complaint_type_id, service_type, description, status, priority, assigned_to) VALUES
('CMP-ELEC-2026-12345', 
 (SELECT user_id FROM users WHERE aadhaar_number = '123456789012'),
 (SELECT consumer_service_id FROM consumer_services WHERE consumer_id = 'EC123456789'),
 (SELECT complaint_type_id FROM complaint_types WHERE service_type = 'electricity' AND type_code = 'POWER_CUT' LIMIT 1),
 'electricity',
 'Frequent power cuts in the area for the past 3 days. Power goes off every 2-3 hours.',
 'in_progress',
 'high',
 (SELECT technician_id FROM technicians WHERE service_type = 'electricity' LIMIT 1));

-- Add timeline for the complaint
INSERT INTO complaint_timeline (complaint_id, status, note, timestamp) VALUES
((SELECT complaint_id FROM complaints WHERE complaint_number = 'CMP-ELEC-2026-12345'), 'open', 'Complaint registered', '2026-01-28 10:30:00'),
((SELECT complaint_id FROM complaints WHERE complaint_number = 'CMP-ELEC-2026-12345'), 'in_progress', 'Technician assigned, inspection scheduled for tomorrow', '2026-01-29 14:20:00');

-- ============================================================================
-- INDEXES VERIFICATION
-- ============================================================================

-- Verify all indexes are created
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

SELECT 'Database seeding completed successfully!' as message,
       (SELECT COUNT(*) FROM users) as total_users,
       (SELECT COUNT(*) FROM consumer_services) as total_consumer_services,
       (SELECT COUNT(*) FROM complaint_types) as total_complaint_types,
       (SELECT COUNT(*) FROM technicians) as total_technicians,
       (SELECT COUNT(*) FROM bills) as total_bills,
       (SELECT COUNT(*) FROM complaints) as total_complaints;
