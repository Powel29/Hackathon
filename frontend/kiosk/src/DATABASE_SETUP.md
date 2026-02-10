# SUVIDHA Database Setup Guide

This guide explains how to connect the SUVIDHA application to a PostgreSQL database for production use.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Database Setup](#database-setup)
3. [Environment Configuration](#environment-configuration)
4. [Installing Dependencies](#installing-dependencies)
5. [Running Migrations](#running-migrations)
6. [API Services](#api-services)
7. [Testing Database Connection](#testing-database-connection)
8. [Seeding Initial Data](#seeding-initial-data)
9. [Production Deployment](#production-deployment)

---

## Prerequisites

Before setting up the database, ensure you have:

- **PostgreSQL 12+** installed and running
- **Node.js 16+** and npm/yarn
- Access to create databases and users
- Basic knowledge of SQL and database management

---

## Database Setup

### Step 1: Install PostgreSQL

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**macOS (using Homebrew):**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Windows:**
Download and install from [PostgreSQL Official Website](https://www.postgresql.org/download/windows/)

### Step 2: Create Database and User

Connect to PostgreSQL:
```bash
sudo -u postgres psql
```

Run the following SQL commands:
```sql
-- Create database
CREATE DATABASE suvidha_db;

-- Create user with password
CREATE USER suvidha_user WITH ENCRYPTED PASSWORD 'your_secure_password_here';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE suvidha_db TO suvidha_user;

-- Connect to the database
\c suvidha_db

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO suvidha_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO suvidha_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO suvidha_user;

-- Exit
\q
```

### Step 3: Run Database Schema

Apply the schema to create all tables:
```bash
psql -U suvidha_user -d suvidha_db -f db/schema.sql
```

Or if using postgres user:
```bash
sudo -u postgres psql suvidha_db < db/schema.sql
```

---

## Environment Configuration

### Step 1: Copy Environment Template

```bash
cp .env.example .env
```

### Step 2: Edit `.env` File

Open `.env` and update the database credentials:

```env
# PostgreSQL Database Configuration
VITE_DB_HOST=localhost
VITE_DB_PORT=5432
VITE_DB_NAME=suvidha_db
VITE_DB_USER=suvidha_user
VITE_DB_PASSWORD=your_secure_password_here

# API Configuration
VITE_API_URL=http://localhost:3000/api
VITE_API_TIMEOUT=30000

# Authentication
VITE_JWT_SECRET=your_jwt_secret_key_minimum_32_characters
VITE_JWT_EXPIRES_IN=24h
VITE_OTP_EXPIRES_IN=300

# Application
VITE_APP_NAME=SUVIDHA
VITE_APP_ENV=production
VITE_APP_DEBUG=false
```

**⚠️ IMPORTANT:** Never commit the `.env` file to version control!

---

## Installing Dependencies

### Step 1: Install PostgreSQL Client Library

```bash
npm install pg
```

### Step 2: Install Additional Dependencies

```bash
npm install dotenv
npm install bcryptjs jsonwebtoken
npm install @types/pg @types/bcryptjs @types/jsonwebtoken --save-dev
```

---

## Enabling Database Connection

### Step 1: Uncomment Database Code

Open `/db/config.ts` and uncomment the following:

```typescript
// Line 6: Uncomment the import
import { Pool } from 'pg';

// Line 31: Uncomment pool creation
export const pool = new Pool(dbConfig);

// Lines 36-44: Uncomment the actual connection test
const client = await pool.connect();
const result = await client.query('SELECT NOW()');
client.release();
console.log('Database connected successfully:', result.rows[0]);
return true;

// Lines 52-58: Uncomment the actual query execution
const start = Date.now();
const result = await pool.query(text, params);
const duration = Date.now() - start;
console.log('Executed query:', { text, duration, rows: result.rowCount });
return result;

// Lines 69-83: Uncomment transaction helper
const client = await pool.connect();
try {
  await client.query('BEGIN');
  const result = await callback(client);
  await client.query('COMMIT');
  return result;
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  client.release();
}
```

### Step 2: Enable API Services

Open each service file and uncomment the database implementation sections:

**Files to update:**
- `/services/api/auth.service.ts`
- `/services/api/complaints.service.ts`
- `/services/api/bills.service.ts`
- `/services/api/connections.service.ts`

Look for comments like:
```typescript
// Database implementation (uncomment when ready):
/*
  ... database code ...
*/
```

Remove the `/*` and `*/` to uncomment the database implementation.

---

## Testing Database Connection

### Step 1: Create Test Script

Create `/scripts/test-db.ts`:

```typescript
import { testConnection } from '../db/config';

async function main() {
  console.log('Testing database connection...');
  const isConnected = await testConnection();
  
  if (isConnected) {
    console.log('✅ Database connection successful!');
    process.exit(0);
  } else {
    console.error('❌ Database connection failed!');
    process.exit(1);
  }
}

main();
```

### Step 2: Run Test

```bash
npx tsx scripts/test-db.ts
```

Expected output:
```
Testing database connection...
Database connected successfully: { now: 2026-01-31T... }
✅ Database connection successful!
```

---

## Seeding Initial Data

### Step 1: Create Seed Script

Create `/db/seeds/initial-data.sql`:

```sql
-- Insert complaint types for electricity
INSERT INTO complaint_types (service_type, type_code, type_name_en, type_name_hi, priority, sla_hours) VALUES
('electricity', 'POWER_CUT', 'Power Outage', 'बिजली कटौती', 'high', 4),
('electricity', 'VOLTAGE_ISSUE', 'Voltage Fluctuation', 'वोल्टेज में उतार-चढ़ाव', 'normal', 24),
('electricity', 'METER_FAULT', 'Meter Fault', 'मीटर खराबी', 'normal', 48),
('electricity', 'BILLING_ERROR', 'Billing Error', 'बिलिंग त्रुटि', 'normal', 72),
('electricity', 'POLE_DAMAGE', 'Damaged Pole/Wire', 'क्षतिग्रस्त खंभा/तार', 'critical', 2);

-- Insert complaint types for gas
INSERT INTO complaint_types (service_type, type_code, type_name_en, type_name_hi, priority, sla_hours) VALUES
('gas', 'GAS_LEAK', 'Gas Leakage', 'गैस रिसाव', 'critical', 1),
('gas', 'NO_SUPPLY', 'No Gas Supply', 'गैस आपूर्ति नहीं', 'high', 4),
('gas', 'LOW_PRESSURE', 'Low Pressure', 'कम दबाव', 'normal', 24),
('gas', 'METER_ISSUE', 'Meter Reading Issue', 'मीटर रीडिंग समस्या', 'normal', 48),
('gas', 'PIPELINE_DAMAGE', 'Pipeline Damage', 'पाइपलाइन क्षति', 'critical', 2);

-- Insert complaint types for water
INSERT INTO complaint_types (service_type, type_code, type_name_en, type_name_hi, priority, sla_hours) VALUES
('water', 'NO_WATER', 'No Water Supply', 'पानी की आपूर्ति नहीं', 'high', 6),
('water', 'LOW_PRESSURE', 'Low Water Pressure', 'कम पानी का दबाव', 'normal', 24),
('water', 'DIRTY_WATER', 'Contaminated Water', 'दूषित पानी', 'critical', 2),
('water', 'PIPE_LEAK', 'Pipe Leakage', 'पाइप रिसाव', 'high', 12),
('water', 'METER_FAULT', 'Meter Malfunction', 'मीटर खराबी', 'normal', 48);

-- Insert complaint types for municipal
INSERT INTO complaint_types (service_type, type_code, type_name_en, type_name_hi, priority, sla_hours) VALUES
('municipal', 'GARBAGE_COLLECTION', 'Garbage Not Collected', 'कचरा एकत्र नहीं किया गया', 'normal', 24),
('municipal', 'STREET_LIGHT', 'Street Light Not Working', 'स्ट्रीट लाइट काम नहीं कर रही', 'normal', 48),
('municipal', 'ROAD_DAMAGE', 'Road Damage', 'सड़क क्षति', 'high', 72),
('municipal', 'DRAINAGE_ISSUE', 'Drainage Problem', 'जल निकासी समस्या', 'high', 24),
('municipal', 'PUBLIC_TOILET', 'Public Toilet Issue', 'सार्वजनिक शौचालय समस्या', 'normal', 48);

-- Insert sample technicians
INSERT INTO technicians (full_name, employee_id, phone_number, email, service_type, specialization, assigned_area) VALUES
('Rajesh Kumar', 'TECH-ELEC-001', '+91 98765 43210', 'rajesh.tech@example.com', 'electricity', 'Power Distribution', 'North Bangalore'),
('Amit Sharma', 'TECH-ELEC-002', '+91 98765 43211', 'amit.tech@example.com', 'electricity', 'Meter Installation', 'South Bangalore'),
('Priya Patel', 'TECH-GAS-001', '+91 98765 43212', 'priya.tech@example.com', 'gas', 'Pipeline Maintenance', 'East Bangalore'),
('Suresh Singh', 'TECH-WAT-001', '+91 98765 43213', 'suresh.tech@example.com', 'water', 'Water Supply', 'West Bangalore'),
('Lakshmi Reddy', 'TECH-MUN-001', '+91 98765 43214', 'lakshmi.tech@example.com', 'municipal', 'Sanitation', 'Central Bangalore');

-- Insert sample admin user (password: admin123 - hashed with bcrypt)
INSERT INTO users (aadhaar_number, full_name, mobile_number, email, date_of_birth, gender, address, city, state, pincode, preferred_language) VALUES
('999999999999', 'Admin User', '+91 99999 99999', 'admin@suvidha.gov.in', '1980-01-01', 'Other', 'Government Office', 'Bangalore', 'Karnataka', '560001', 'en');
```

### Step 2: Run Seed Script

```bash
psql -U suvidha_user -d suvidha_db -f db/seeds/initial-data.sql
```

---

## API Services Usage

### Authentication Service

```typescript
import { sendOTP, verifyOTP, verifyConsumerId } from './services/api/auth.service';

// Send OTP
const result = await sendOTP({ aadhaarNumber: '123456789012' });

// Verify OTP
const authResult = await verifyOTP({ 
  aadhaarNumber: '123456789012', 
  otp: '123456' 
});

// Verify Consumer ID
const consumerResult = await verifyConsumerId({
  aadhaarNumber: '123456789012',
  consumerId: 'EC123456789',
  serviceType: 'electricity'
});
```

### Complaints Service

```typescript
import { getComplaintTypes, createComplaint, getComplaint } from './services/api/complaints.service';

// Get complaint types
const types = await getComplaintTypes('electricity');

// Create complaint
const result = await createComplaint({
  userId: 'user-id',
  consumerServiceId: 'service-id',
  serviceType: 'electricity',
  complaintTypeId: 'type-id',
  description: 'Power outage in my area'
});

// Get complaint
const complaint = await getComplaint({ complaintNumber: 'CMP-2026-12345' });
```

### Bills Service

```typescript
import { getBills, processPayment } from './services/api/bills.service';

// Get bills
const bills = await getBills('consumer-service-id');

// Process payment
const paymentResult = await processPayment({
  billId: 'bill-id',
  userId: 'user-id',
  amount: 2450,
  paymentMethod: 'upi'
});
```

---

## Production Deployment

### 1. Database Backup

```bash
# Create backup
pg_dump -U suvidha_user suvidha_db > backup_$(date +%Y%m%d).sql

# Restore backup
psql -U suvidha_user -d suvidha_db < backup_20260131.sql
```

### 2. Database Security

```sql
-- Revoke public access
REVOKE ALL ON DATABASE suvidha_db FROM PUBLIC;

-- Set connection limits
ALTER DATABASE suvidha_db CONNECTION LIMIT 100;

-- Enable SSL (in postgresql.conf)
ssl = on
ssl_cert_file = '/path/to/server.crt'
ssl_key_file = '/path/to/server.key'
```

### 3. Performance Optimization

```sql
-- Analyze tables
ANALYZE users;
ANALYZE bills;
ANALYZE complaints;

-- Vacuum database
VACUUM ANALYZE;

-- Create additional indexes if needed
CREATE INDEX CONCURRENTLY idx_custom ON table_name(column_name);
```

### 4. Monitoring

```sql
-- Check active connections
SELECT count(*) FROM pg_stat_activity WHERE datname = 'suvidha_db';

-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check slow queries
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;
```

---

## Troubleshooting

### Connection Refused

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check PostgreSQL is listening
sudo netstat -plnt | grep 5432

# Check pg_hba.conf for authentication
sudo nano /etc/postgresql/15/main/pg_hba.conf
```

### Permission Denied

```sql
-- Grant all permissions again
GRANT ALL PRIVILEGES ON DATABASE suvidha_db TO suvidha_user;
GRANT ALL ON ALL TABLES IN SCHEMA public TO suvidha_user;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO suvidha_user;
```

### Database Not Found

```bash
# List all databases
psql -U postgres -c "\l"

# Create database if missing
createdb -U postgres suvidha_db
```

---

## Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Node-postgres (pg) Documentation](https://node-postgres.com/)
- [Database Design Best Practices](https://www.postgresql.org/docs/current/ddl-best-practices.html)

---

## Support

For database-related issues, check:
1. Database logs: `/var/log/postgresql/postgresql-15-main.log`
2. Application logs: Check console output
3. Network connectivity: Test with `psql -U suvidha_user -d suvidha_db -h localhost`

---

**Last Updated:** January 31, 2026
