# 🎓 SGTU Event Management - Backend API

Production-ready backend for SGTU university event management system with QR code check-in/out, student feedback, and ranking features.

---

## 🌟 Features

- ✅ **JWT Authentication** - Secure authentication for students, volunteers, and admins
- ✅ **QR Code System** - Auto-generated QR tokens for students and stalls
- ✅ **Smart Check-in/Out** - Odd/even scan logic with duration tracking
- ✅ **Dual Feedback System**
  - Category 1: Students rate stalls (max 200 feedbacks)
  - Category 2: Students rank top 3 stalls (school-wise leaderboard)
- ✅ **School-Based Organization** - 5 schools with fixed assignments
- ✅ **Redis Caching** - High-performance caching for QR lookups
- ✅ **Rate Limiting** - Protection against abuse
- ✅ **Excel Import Ready** - Bulk student import support

---

## 🏗️ Tech Stack

- **Runtime:** Node.js (ES Modules)
- **Framework:** Express.js 5.x
- **Database:** PostgreSQL (Neon Serverless)
- **Cache:** Redis Cloud
- **Authentication:** JWT + HTTP-only cookies
- **QR Generation:** qrcode library
- **Excel Parsing:** ExcelJS
- **Validation:** express-validator

---

## 📁 Project Structure

```
server/
├── src/
│   ├── config/          # Database & Redis configuration
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Auth, error handling, rate limiting
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── services/        # Business logic (QR, analytics, notifications)
│   ├── seeders/         # Database seeders (with fixed school assignments)
│   ├── migrations/      # Database migrations
│   ├── scripts/         # Utility scripts (fix, verify, regenerate)
│   ├── utils/           # Helper functions
│   └── index.js         # Application entry point
├── uploads/             # File upload directory
├── .env                 # Environment variables
├── package.json         # Dependencies & scripts
└── SETUP_GUIDE.md       # Detailed setup instructions
```

---

## 🚀 Quick Start

### For New Developers

**See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for complete setup instructions.**

Quick commands:

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env
# Edit .env with your database and Redis credentials

# 3. Fresh database setup (recommended for first time)
npm run setup:fresh

# 4. Start development server
npm run dev
```

Server runs on: `http://localhost:5000`

---

## 📝 Available Scripts

### Setup & Database
```bash
npm run migrate           # Create database tables
npm run migrate:rollback  # Drop all tables
npm run migrate:verify    # Verify schema
npm run seed             # Seed initial data
npm run seed:verify      # Verify school assignments
npm run seed:fix         # Fix incorrect school assignments
npm run setup            # Migrate + Seed
npm run setup:fresh      # Fresh setup with verification
```

### Development
```bash
npm run dev              # Start with nodemon (hot reload)
npm start                # Start production server
```

### Testing
```bash
npm test                 # Run all tests with coverage
npm run test:unit        # Unit tests
npm run test:all         # QR token tests
```

### QR Management
```bash
npm run qr:regenerate    # Regenerate all QR tokens
npm run qr:warm-cache    # Warm up Redis cache
```

---

## 🏫 School Structure

The system manages 5 schools with **fixed assignments** (not random):

1. **School of Computing Sciences and Engineering** (Block A)
   - 11 students, 8 stalls
   - Stalls: CS-001 to CS-008

2. **School of Engineering** (Block B)
   - 10 students, 8 stalls
   - Stalls: ME-001, ME-002, ME-003, EE-001, EE-002, EE-003, CE-001, CE-002

3. **School of Management** (Block C)
   - 11 students, 8 stalls
   - Stalls: BM-001 to BM-008

4. **School of Applied Sciences** (Block D)
   - 10 students, 7 stalls
   - Stalls: BT-001, BT-003, PH-001, PH-002, CH-001, CH-002, MA-001

5. **School of Pharmacy** (Block E)
   - 10 students, 1 stall
   - Stalls: BT-002

**Total:** 52 students, 32 stalls

---

## 🔐 Default Credentials

After seeding, use these for testing:

| Role | Email | Password | Notes |
|------|-------|----------|-------|
| **Admin** | admin@sgtu.ac.in | admin123 | SUPER_ADMIN role |
| **Student** | test@sgtu.ac.in | student123 | Registration: 2024SGTU99999 |
| **Volunteer** | volunteer.test@sgtu.ac.in | volunteer123 | Test location |

---

## 📡 API Endpoints

### Authentication
```
POST /api/students/login
POST /api/students/register
POST /api/volunteers/login
POST /api/admins/login
```

### Students
```
GET  /api/students/profile
GET  /api/students/qr-code
POST /api/students/feedback
POST /api/students/ranking
GET  /api/students/history
```

### Volunteers
```
POST /api/volunteers/scan/student
POST /api/volunteers/scan/stall
GET  /api/volunteers/history
```

### Admin
```
GET  /api/admin/dashboard/stats
GET  /api/admin/students
GET  /api/admin/stalls/rankings
POST /api/admin/import/students
```

For detailed API documentation, see Postman collection or check `POSTMAN_TESTING_GUIDE.md`.

---

## 🎯 Key Features Explained

### 1. Fixed School Assignments

Unlike random assignment, students and stalls belong to **specific schools** based on their data:

**Students:** Registration number determines school
- `2024SGTU10XXX` → School of Computing Sciences and Engineering
- `2024SGTU20XXX` → School of Engineering
- `2024SGTU30XXX` → School of Management
- `2024SGTU40XXX` → School of Applied Sciences
- `2024SGTU50XXX` → School of Pharmacy

**Stalls:** Stall number prefix determines school
- `CS-*` → Computing Sciences
- `ME-*, EE-*, CE-*` → Engineering
- `BM-*` → Management
- `BT-*, PH-*, CH-*, MA-*` → Applied Sciences

### 2. QR Code System

- **Students:** JWT-based tokens (157 chars) with registration info
- **Stalls:** Short tokens (33 chars) with stall number and timestamp
- **Caching:** Redis cache for instant QR lookups
- **Auto-generation:** Tokens created during seeding

### 3. Check-in/Out Logic

- **Odd scans:** Check-in (enter event)
- **Even scans:** Check-out (exit event)
- **Duration tracking:** Auto-calculated on check-out
- **Validation:** Prevents duplicate odd/even scans

### 4. Ranking System

**Category 1: Feedback** (General ratings)
- Students can rate stalls 1-5 stars
- Max 200 feedbacks per student
- Used for overall stall popularity

**Category 2: Rankings** (School competition)
- Students pick top 3 stalls
- Weighted scoring: 1st=5pts, 2nd=3pts, 3rd=1pt
- School-wise leaderboard

---

## 🔧 Troubleshooting

### School assignments are wrong?
```bash
npm run seed:fix
```

### Need fresh start?
```bash
npm run setup:fresh
```

### Verify data integrity?
```bash
npm run seed:verify
```

### Redis connection issues?
- Check `.env` REDIS_* variables
- Verify Redis Cloud instance is running
- Test connection manually

---

## 🛡️ Security Features

- ✅ JWT token authentication
- ✅ HTTP-only cookies (XSS protection)
- ✅ bcrypt password hashing (12 rounds)
- ✅ Rate limiting (100 req/min)
- ✅ Helmet.js security headers
- ✅ CORS configuration
- ✅ Input validation with express-validator

---

## 📊 Database Schema

See `src/migrations/001_initial_schema.sql` for complete schema.

**Key tables:**
- `schools` - 5 university schools
- `students` - Student accounts with QR tokens
- `volunteers` - QR scanner accounts
- `admins` - Dashboard access
- `stalls` - Event stalls with QR tokens
- `check_in_outs` - Entry/exit tracking
- `feedbacks` - Category 1 ratings
- `rankings` - Category 2 top 3 picks

---

## 🤝 Contributing

When making changes:

1. **Always run verification** after seeding: `npm run seed:verify`
2. **Test with fresh setup**: `npm run setup:fresh`
3. **Follow the school assignment logic** - no random assignments!
4. **Update seeders** if adding new data
5. **Run tests** before committing

---

## 📄 License

ISC

---

## 🙏 Credits

Built for SGTU University Event Management System

**Version:** 1.0.0  
**Last Updated:** November 2025

---

## 📞 Support

For issues or questions:
1. Check [SETUP_GUIDE.md](./SETUP_GUIDE.md)
2. Review API documentation
3. Check seeder files in `src/seeders/`
4. Use verification scripts

---

**Happy Coding! 🚀**
