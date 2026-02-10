# SUVIDHA Database Quick Reference

## 📚 Quick Start Commands

### Setup Database
```bash
# 1. Create database and user
sudo -u postgres psql
CREATE DATABASE suvidha_db;
CREATE USER suvidha_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE suvidha_db TO suvidha_user;
\q

# 2. Apply schema
psql -U suvidha_user -d suvidha_db -f db/schema.sql

# 3. Seed initial data
psql -U suvidha_user -d suvidha_db -f db/seeds/initial-data.sql

# 4. Configure environment
cp .env.example .env
# Edit .env with your credentials

# 5. Install dependencies
npm install pg dotenv
```

---

## 📊 Database Tables Overview

### Core Tables
| Table | Purpose | Key Fields |
|-------|---------|------------|
| `users` | User accounts | `aadhaar_number`, `full_name`, `mobile_number` |
| `otp_verifications` | OTP authentication | `aadhaar_number`, `otp_code`, `expires_at` |
| `consumer_services` | Service connections | `user_id`, `service_type`, `consumer_id` |
| `bills` | Billing records | `bill_number`, `amount`, `due_date`, `status` |
| `payments` | Payment transactions | `transaction_id`, `payment_status` |
| `complaints` | User complaints | `complaint_number`, `status`, `priority` |
| `complaint_types` | Complaint categories | `service_type`, `type_code`, `type_name` |
| `technicians` | Service technicians | `employee_id`, `service_type`, `phone_number` |
| `connection_applications` | New connection requests | `application_number`, `status` |

---

## 🔐 Test Credentials

### Test Users (for development)

**User 1 - Electricity Consumer:**
- Aadhaar: `123456789012`
- Name: Rajesh Kumar
- Consumer ID: `EC123456789`
- Service: Electricity
- Password: Use OTP `123456` (mock)

**User 2 - Gas Consumer:**
- Aadhaar: `234567890123`
- Name: Priya Sharma
- Consumer ID: `GC987654321`
- Service: Gas

**User 3 - Water Consumer:**
- Aadhaar: `345678901234`
- Name: Amit Patel
- Consumer ID: `WC987654321`
- Service: Water

**Admin User:**
- Aadhaar: `999999999999`
- Name: System Administrator
- Email: admin@suvidha.gov.in

---

## 🔍 Useful Queries

### Check User Login
```sql
SELECT user_id, full_name, mobile_number, preferred_language
FROM users 
WHERE aadhaar_number = '123456789012' AND is_active = true;
```

### Get User's Services
```sql
SELECT cs.service_type, cs.consumer_id, cs.connection_status
FROM consumer_services cs
JOIN users u ON cs.user_id = u.user_id
WHERE u.aadhaar_number = '123456789012';
```

### Get Pending Bills
```sql
SELECT b.bill_number, b.total_amount, b.due_date, cs.consumer_id
FROM bills b
JOIN consumer_services cs ON b.consumer_service_id = cs.consumer_service_id
WHERE b.status = 'pending'
ORDER BY b.due_date ASC;
```

### Get Active Complaints
```sql
SELECT c.complaint_number, c.description, c.status, t.full_name as technician
FROM complaints c
LEFT JOIN technicians t ON c.assigned_to = t.technician_id
WHERE c.status IN ('open', 'in_progress')
ORDER BY c.created_at DESC;
```

### Get Complaint Types by Service
```sql
SELECT type_code, type_name_en, type_name_hi, priority, sla_hours
FROM complaint_types
WHERE service_type = 'electricity' AND is_active = true
ORDER BY priority DESC;
```

---

## 🛠️ Common Tasks

### Create New User
```sql
INSERT INTO users (aadhaar_number, full_name, mobile_number, email, city, state, pincode, preferred_language)
VALUES ('111122223333', 'John Doe', '+91 98765 00000', 'john@example.com', 'Bangalore', 'Karnataka', '560001', 'en');
```

### Add Consumer Service
```sql
INSERT INTO consumer_services (user_id, service_type, consumer_id, connection_status, connection_date)
VALUES 
  ((SELECT user_id FROM users WHERE aadhaar_number = '111122223333'),
   'electricity', 'EC111222333', 'active', CURRENT_DATE);
```

### Generate Bill
```sql
INSERT INTO bills (consumer_service_id, bill_number, billing_period_start, billing_period_end, 
                   billing_period, amount, tax_amount, total_amount, due_date, status)
VALUES 
  ((SELECT consumer_service_id FROM consumer_services WHERE consumer_id = 'EC111222333'),
   'ELEC-2026-' || LPAD(NEXTVAL('bill_seq')::text, 6, '0'), 
   '2026-02-01', '2026-02-28', 'February 2026', 
   2500.00, 300.00, 2800.00, '2026-03-10', 'pending');
```

### Register Complaint
```sql
INSERT INTO complaints (complaint_number, user_id, consumer_service_id, complaint_type_id, 
                        service_type, description, status, priority)
VALUES 
  ('CMP-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(NEXTVAL('complaint_seq')::text, 5, '0'),
   (SELECT user_id FROM users WHERE aadhaar_number = '111122223333'),
   (SELECT consumer_service_id FROM consumer_services WHERE consumer_id = 'EC111222333'),
   (SELECT complaint_type_id FROM complaint_types WHERE type_code = 'POWER_CUT' LIMIT 1),
   'electricity', 'Power issue in my area', 'open', 'high');
```

### Process Payment
```sql
BEGIN;

-- Insert payment
INSERT INTO payments (bill_id, user_id, transaction_id, amount, payment_method, payment_status, paid_at)
VALUES 
  ((SELECT bill_id FROM bills WHERE bill_number = 'ELEC-2026-001'),
   (SELECT user_id FROM users WHERE aadhaar_number = '111122223333'),
   'TXN-' || EXTRACT(EPOCH FROM NOW())::BIGINT || '-' || FLOOR(RANDOM() * 10000),
   2800.00, 'upi', 'success', NOW());

-- Update bill status
UPDATE bills SET status = 'paid' WHERE bill_number = 'ELEC-2026-001';

COMMIT;
```

---

## 📈 Monitoring Queries

### Database Statistics
```sql
-- Total users by language
SELECT preferred_language, COUNT(*) as count
FROM users
WHERE is_active = true
GROUP BY preferred_language;

-- Bills by status
SELECT status, COUNT(*) as count, SUM(total_amount) as total
FROM bills
GROUP BY status;

-- Complaints by service and status
SELECT service_type, status, COUNT(*) as count
FROM complaints
GROUP BY service_type, status
ORDER BY service_type, status;

-- Active technicians by service
SELECT service_type, COUNT(*) as count
FROM technicians
WHERE is_active = true AND is_available = true
GROUP BY service_type;
```

### Performance Monitoring
```sql
-- Largest tables
SELECT 
  tablename,
  pg_size_pretty(pg_total_relation_size('public.' || tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size('public.' || tablename) DESC
LIMIT 10;

-- Active connections
SELECT 
  datname,
  usename,
  application_name,
  client_addr,
  state,
  query_start
FROM pg_stat_activity
WHERE datname = 'suvidha_db';

-- Slow queries
SELECT 
  query,
  calls,
  total_exec_time,
  mean_exec_time,
  max_exec_time
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat%'
ORDER BY mean_exec_time DESC
LIMIT 10;
```

---

## 🔒 Security Best Practices

1. **Never commit `.env` file**
   ```bash
   echo ".env" >> .gitignore
   ```

2. **Use strong passwords**
   ```bash
   # Generate secure password
   openssl rand -base64 32
   ```

3. **Limit database access**
   ```sql
   -- Only allow specific IP
   ALTER DATABASE suvidha_db SET pg_hba.conf = 'host all all 192.168.1.0/24 md5';
   ```

4. **Enable SSL**
   ```sql
   ALTER DATABASE suvidha_db SET ssl = on;
   ```

5. **Regular backups**
   ```bash
   # Backup
   pg_dump -U suvidha_user suvidha_db > backup_$(date +%Y%m%d_%H%M%S).sql
   
   # Restore
   psql -U suvidha_user -d suvidha_db < backup_file.sql
   ```

---

## 🐛 Troubleshooting

### Connection Issues
```bash
# Test connection
psql -U suvidha_user -d suvidha_db -h localhost -W

# Check if PostgreSQL is running
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### Permission Errors
```sql
-- Re-grant all permissions
GRANT ALL PRIVILEGES ON DATABASE suvidha_db TO suvidha_user;
GRANT ALL ON ALL TABLES IN SCHEMA public TO suvidha_user;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO suvidha_user;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO suvidha_user;
```

### Reset Database
```bash
# Drop and recreate
dropdb -U postgres suvidha_db
createdb -U postgres suvidha_db
psql -U suvidha_user -d suvidha_db -f db/schema.sql
psql -U suvidha_user -d suvidha_db -f db/seeds/initial-data.sql
```

---

## 📞 Support

For database issues:
1. Check logs: `/var/log/postgresql/postgresql-*-main.log`
2. Verify connection: Test with `psql` command
3. Check permissions: Run permission grant queries
4. Review configuration: Check `postgresql.conf` and `pg_hba.conf`

---

**Version:** 1.0  
**Last Updated:** January 31, 2026  
**Project:** SUVIDHA - Government Service Portal
