# 🚀 SGTU Event Management - Setup Guide

Complete guide for setting up the SGTU Event Management Backend from scratch.

---

## 📋 Prerequisites

- Node.js 18+ installed
- PostgreSQL database (Neon account recommended)
- Redis Cloud account
- Git installed

---

## 🛠️ Quick Setup (First Time)

### 1️⃣ Clone & Install

```bash
# Clone the repository
git clone <repository-url>
cd sgtu-event/server

# Install dependencies
npm install
```

### 2️⃣ Configure Environment

Create `.env` file in the `server` directory:

```env
# Database Configuration
NEON_DATABASE_URL='your-neon-database-url-here'

# Redis Configuration
REDIS_URL=redis://default:password@host:port
REDIS_HOST=your-redis-host
REDIS_PORT=18192
REDIS_PASSWORD=your-redis-password
REDIS_USERNAME=default
REDIS_DB=0

# JWT Configuration
JWT_SECRET=sgtu_event_secret_key_2024_production
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=sgtu_event_refresh_secret_2024

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Server Configuration
NODE_ENV=development
PORT=5000

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=uploads
```

### 3️⃣ Setup Database (One Command)

```bash
# Fresh setup - Creates tables and seeds data with verification
npm run setup:fresh
```

**This will:**
- ✅ Drop all existing tables (if any)
- ✅ Create fresh database schema
- ✅ Seed all data with correct school assignments
- ✅ Verify all assignments are correct

---

## 🔄 Alternative Setup Commands

### Full Fresh Setup (Recommended for first time)
```bash
npm run setup:fresh
```

### Regular Setup (if database is already clean)
```bash
npm run setup
```

### Manual Step-by-Step Setup
```bash
# Step 1: Create database tables
npm run migrate

# Step 2: Seed initial data
npm run seed

# Step 3: Verify assignments (optional)
npm run seed:verify
```

### Fix Existing Data (if school assignments are wrong)
```bash
npm run seed:fix
```

---

## ✅ Verification

After setup, verify the data is correctly assigned:

```bash
npm run seed:verify
```

**Expected Output:**
```
📊 FINAL VERIFICATION

============================================================
STUDENTS BY SCHOOL:
============================================================
School of Applied Sciences: 10 students
School of Computing Sciences and Engineering: 11 students
School of Engineering: 10 students
School of Management: 11 students
School of Pharmacy: 10 students

============================================================
STALLS BY SCHOOL:
============================================================
School of Applied Sciences: 7 stalls
School of Computing Sciences and Engineering: 8 stalls
School of Engineering: 8 stalls
School of Management: 8 stalls
School of Pharmacy: 1 stalls

✅ All data is now correctly assigned!
```

---

## 🎯 Default Login Credentials

After seeding, use these credentials to test:

### Admin Login
- **Email:** `admin@sgtu.ac.in`
- **Password:** `admin123`
- **Role:** SUPER_ADMIN

### Student Login (Test Account)
- **Email:** `test@sgtu.ac.in`
- **Password:** `student123`
- **Registration:** 2024SGTU99999

### Volunteer Login
- **Email:** `volunteer.test@sgtu.ac.in`
- **Password:** `volunteer123`

---

## 📊 Database Schema Overview

### 5 Schools
1. **School of Computing Sciences and Engineering** (Block A)
2. **School of Engineering** (Block B)
3. **School of Management** (Block C)
4. **School of Applied Sciences** (Block D)
5. **School of Pharmacy** (Block E)

### Data Seeded
- **52 Students** (10 per school + 2 test accounts)
- **32 Stalls** (distributed across schools by category)
- **6 Volunteers** (with assigned locations)
- **3 Admins** (SUPER_ADMIN and ADMIN roles)

---

## 🔧 Common Issues & Solutions

### Issue 1: School assignments are wrong
**Solution:**
```bash
npm run seed:fix
```

### Issue 2: Migration fails
**Solution:**
```bash
# Rollback and retry
npm run migrate:rollback
npm run migrate
```

### Issue 3: Database already exists
**Solution:**
```bash
# Fresh setup (drops and recreates)
npm run setup:fresh
```

### Issue 4: Redis connection error
**Solution:**
- Check Redis credentials in `.env`
- Verify Redis Cloud instance is running
- Test connection manually

---

## 🚀 Running the Server

### Development Mode (with hot reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

Server will run on: `http://localhost:5000`

---

## 📝 Important Notes

### ✅ **School Assignment Logic**

**Students:**
- Registration numbers determine school assignment
- Format: `2024SGTU[XX]XXX` where `XX` is school code:
  - `10` → School of Computing Sciences and Engineering
  - `20` → School of Engineering
  - `30` → School of Management
  - `40` → School of Applied Sciences
  - `50` → School of Pharmacy

**Stalls:**
- Stall numbers determine school assignment
- Format: `[PREFIX]-XXX` where `PREFIX` is:
  - `CS` → School of Computing Sciences and Engineering
  - `ME/EE/CE` → School of Engineering
  - `BM` → School of Management
  - `BT/PH/CH/MA` → School of Applied Sciences
  - Special: `BT-002` → School of Pharmacy

### ✅ **For Excel Import**

When importing students from Excel, ensure:
1. Each student has a `school_name` field
2. School names match exactly:
   - "School of Computing Sciences and Engineering"
   - "School of Engineering"
   - "School of Management"
   - "School of Applied Sciences"
   - "School of Pharmacy"

### ✅ **QR Code Tokens**

- **Students:** Auto-generated JWT tokens (157 chars)
- **Stalls:** Auto-generated short tokens (33 chars)
- Format: `STALL_{number}_{timestamp}_{random}`

---

## 📚 Additional Scripts

```bash
# QR Code Management
npm run qr:regenerate      # Regenerate all QR tokens
npm run qr:warm-cache      # Warm up Redis cache

# Testing
npm run test               # Run all tests with coverage
npm run test:unit          # Run unit tests
npm run test:all           # Run QR token tests

# Database
npm run migrate:verify     # Verify database schema
npm run migrate:rollback   # Rollback migration
```

---

## 🎉 You're All Set!

Your SGTU Event Management Backend is now ready to use. Start the development server and begin testing the APIs!

For API documentation, check the `/api` endpoints or refer to the Postman collection.

---

## 💡 Tips for New Developers

1. **Always run `npm run seed:verify`** after seeding to ensure data integrity
2. **Use `npm run setup:fresh`** for a clean slate
3. **Check `.env` file** if anything doesn't work
4. **Review the seeders** in `src/seeders/` to understand the data structure
5. **Use the fix scripts** if you encounter school assignment issues

---

**Happy Coding! 🚀**
