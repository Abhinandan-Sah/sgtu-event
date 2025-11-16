# Production-Ready Folder Structure

## ✅ Final Organization (Industry Standard)

```
server/
│
├── src/
│   │
│   ├── 📁 config/              # Configuration & Connections
│   │   ├── db.js               # Neon PostgreSQL connection
│   │   ├── redis.js            # Redis Cloud connection
│   │   └── test-db.js          # Test database config
│   │
│   ├── 📁 controllers/         # HTTP Request Handlers (FLAT STRUCTURE)
│   │   ├── admin.controller.js       # Admin operations
│   │   ├── student.controller.js     # Student operations
│   │   ├── volunteer.controller.js   # Volunteer operations
│   │   ├── stall.controller.js       # Stall operations
│   │   ├── feedback.controller.js    # Feedback operations
│   │   ├── ranking.controller.js     # Ranking operations
│   │   ├── checkInOut.controller.js  # Check-in/out operations
│   │   └── index.js                  # Central exports
│   │
│   ├── 📁 helpers/             # Shared Helper Functions
│   │   └── response.js         # Standardized API responses
│   │
│   ├── 📁 middleware/          # Express Middleware
│   │   ├── auth.js             # JWT authentication
│   │   ├── errorHandler.js     # Global error handler
│   │   └── rateLimiter.js      # Rate limiting
│   │
│   ├── 📁 migrations/          # Database Schema Migrations
│   │   ├── 001_initial_schema.sql
│   │   ├── run-migration.js
│   │   ├── rollback-database.js
│   │   └── README.md
│   │
│   ├── 📁 models/              # Data Models (FLAT STRUCTURE)
│   │   ├── Admin.model.js
│   │   ├── Student.model.js
│   │   ├── Volunteer.model.js
│   │   ├── Stall.model.js
│   │   ├── Feedback.model.js
│   │   ├── Ranking.model.js
│   │   ├── CheckInOut.model.js
│   │   ├── School.model.js
│   │   └── index.js
│   │
│   ├── 📁 routes/              # API Route Definitions (FLAT STRUCTURE)
│   │   ├── admin.route.js            # Admin routes
│   │   ├── student.route.js          # Student routes
│   │   ├── volunteer.route.js        # Volunteer routes
│   │   ├── stall.route.js            # Stall routes
│   │   ├── feedback.route.js         # Feedback routes
│   │   ├── ranking.route.js          # Ranking routes
│   │   ├── checkInOut.route.js       # Check-in/out routes
│   │   └── index.js                  # Central exports
│   │
│   ├── 📁 seeders/             # Database Seeders (Dev Only)
│   │   ├── studentSeeder.js
│   │   ├── stallSeeder.js
│   │   └── index.js
│   │
│   ├── 📁 services/            # Business Logic
│   │   ├── qrCode.js           ⭐ QR generation & verification
│   │   ├── analytics.js        # Analytics service
│   │   └── notification.js     # Notification service
│   │
│   ├── 📁 tests/               # Test Suite
│   │   │
│   │   ├── 📁 unit/            # Unit Tests (Fast, Isolated)
│   │   │   └── qr-service.test.js
│   │   │
│   │   ├── 📁 integration/     # Integration Tests (Full System)
│   │   │   └── qr-visual-test.js
│   │   │
│   │   ├── 📁 helpers/         # Test Utilities
│   │   │   ├── token-comparison.js
│   │   │   ├── token-uniqueness.js
│   │   │   └── qr-scan-validator.js
│   │   │
│   │   └── README.md           # Testing documentation
│   │
│   ├── 📁 scripts/             # One-Time Operational Scripts
│   │   ├── regenerate-qr-tokens.js  # Token format updates (RARE)
│   │   └── README.md
│   │
│   ├── 📁 utils/               # Production Utilities (Regular Use)
│   │   ├── cache.js            # Redis cache helpers
│   │   ├── excelParser.js      # Excel parsing utility
│   │   ├── logger.js           # Winston logger
│   │   ├── warm-qr-cache.js    ⭐ Cache warming (DAILY cron)
│   │   └── README.md
│   │
│   ├── 📁 validations/         # Input Validation Schemas
│   │
│   ├── 📁 logs/                # Application Logs
│   │
│   └── index.js                # Main Application Entry
│
├── uploads/                    # File Uploads
├── package.json                # Dependencies & Scripts
├── .env                        # Environment Variables
├── .gitignore                  # Git ignore rules
├── STRUCTURE.md                ⭐ This documentation
└── README.md                   # Project README

```

---

## 🎯 Key Distinctions

### ⚡ Utils vs Scripts (Critical Difference)

| Folder | Purpose | Run Frequency | Examples | Production Need |
|--------|---------|---------------|----------|-----------------|
| **`utils/`** | Regular operations | Daily/Always | Cache warming, logging | ✅ **REQUIRED** |
| **`scripts/`** | One-time tasks | Rare/Never | Token regeneration | ⚠️ Infrequent |

### 📊 Test Organization

| Folder | Type | Speed | Dependencies |
|--------|------|-------|--------------|
| **`tests/unit/`** | Component tests | Fast | Mocked |
| **`tests/integration/`** | System tests | Slow | Real DB/Redis |
| **`tests/helpers/`** | Utilities | N/A | Validation tools |

---

## 🚀 NPM Scripts (Updated)

```json
{
  "scripts": {
    // Application
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "seed": "node src/seeders/index.js",
    
    // Testing
    "test": "jest --coverage",
    "test:unit": "node src/tests/unit/qr-service.test.js",
    "test:visual": "node src/tests/integration/qr-visual-test.js",
    "test:compare": "node src/tests/helpers/token-comparison.js",
    "test:uniqueness": "node src/tests/helpers/token-uniqueness.js",
    "test:scan": "node src/tests/helpers/qr-scan-validator.js",
    "test:all": "npm run test:unit && npm run test:compare && npm run test:uniqueness",
    
    // Production Operations
    "qr:warm-cache": "node src/utils/warm-qr-cache.js",     // ✅ Daily cron
    "qr:regenerate": "node src/scripts/regenerate-qr-tokens.js"  // ⚠️ Rare
  }
}
```

---

## 📋 Production Cron Jobs

### Daily Operations (Required)
```bash
# Warm QR cache every day at 6 AM
0 6 * * * cd /path/to/server && npm run qr:warm-cache
```

### One-Time Operations (As Needed)
```bash
# Token regeneration (only when format changes)
npm run qr:regenerate
```

---

## ✅ Structure Benefits

1. **Clear Separation**
   - Utils = Regular operations (production needs)
   - Scripts = Rare operations (maintenance only)

2. **Standard Testing**
   - Unit tests isolated
   - Integration tests realistic
   - Helpers reusable

3. **Easy Onboarding**
   - Self-documenting structure
   - Clear README files
   - Logical organization

4. **Scalable**
   - Easy to add new features
   - Clear patterns to follow
   - Maintainable codebase

---

## 🔄 Migration Complete

**What Changed:**
- ✅ Moved `warm-qr-cache.js` from scripts/ → utils/ (it's needed daily!)
- ✅ Organized tests into unit/, integration/, helpers/
- ✅ Created comprehensive README files
- ✅ Updated npm scripts
- ✅ Added production documentation

**What's Ready:**
- ✅ Production-ready folder structure
- ✅ Industry-standard organization
- ✅ Clear documentation
- ✅ Proper categorization
- ✅ All tests working

---

## 📚 Documentation

- **[STRUCTURE.md](./STRUCTURE.md)** - Complete project structure guide
- **[src/utils/README.md](./src/utils/README.md)** - Production utilities
- **[src/scripts/README.md](./src/scripts/README.md)** - Operational scripts
- **[src/tests/README.md](./src/tests/README.md)** - Testing guide

---

✨ **Status: Production-Ready** ✨
