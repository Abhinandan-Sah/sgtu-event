# SGTU Event Management - Production Structure

Production-ready folder structure following industry best practices.

## 📁 Project Structure

```
server/
├── src/
│   ├── config/          # Configuration files (DB, Redis, etc.)
│   ├── controllers/     # Request handlers (FLAT STRUCTURE)
│   │   ├── admin.controller.js
│   │   ├── student.controller.js
│   │   ├── volunteer.controller.js
│   │   ├── stall.controller.js
│   │   ├── feedback.controller.js
│   │   ├── ranking.controller.js
│   │   ├── checkInOut.controller.js
│   │   └── index.js
│   ├── helpers/         # Shared helper functions
│   ├── middleware/      # Express middleware (auth, error, rate-limit)
│   ├── migrations/      # Database schema migrations
│   ├── models/          # Data models (FLAT STRUCTURE)
│   │   ├── Admin.model.js
│   │   ├── Student.model.js
│   │   ├── Volunteer.model.js
│   │   ├── Stall.model.js
│   │   ├── Feedback.model.js
│   │   ├── Ranking.model.js
│   │   ├── CheckInOut.model.js
│   │   ├── School.model.js
│   │   └── index.js
│   ├── routes/          # API route definitions (FLAT STRUCTURE)
│   │   ├── admin.route.js
│   │   ├── student.route.js
│   │   ├── volunteer.route.js
│   │   ├── stall.route.js
│   │   ├── feedback.route.js
│   │   ├── ranking.route.js
│   │   ├── checkInOut.route.js
│   │   └── index.js
│   ├── seeders/         # Database seeders for development
│   ├── services/        # Business logic (QR, Analytics, Notification)
│   ├── tests/           # Test suite
│   │   ├── unit/        # Unit tests (isolated component testing)
│   │   ├── integration/ # Integration tests (full system testing)
│   │   └── helpers/     # Test utilities and validators
│   ├── scripts/         # One-time operational scripts
│   ├── utils/           # Production utilities (run regularly)
│   └── validations/     # Input validation schemas
├── uploads/             # File uploads (Excel, images)
└── package.json         # Dependencies and npm scripts
```

---

## 🎯 Purpose of Each Directory

### Core Application

| Directory | Purpose | Examples |
|-----------|---------|----------|
| `config/` | Environment configuration | `db.js`, `redis.js` |
| `controllers/` | HTTP request handlers (FLAT) | `student.controller.js`, `admin.controller.js` |
| `middleware/` | Request interceptors | `auth.js`, `errorHandler.js` |
| `models/` | Data models & DB queries (FLAT) | `Student.model.js`, `Stall.model.js` |
| `routes/` | API endpoint definitions (FLAT) | `student.route.js`, `admin.route.js` |
| `services/` | Business logic | `qrCode.js`, `analytics.js` |
| `validations/` | Input validation | Schema validators |

### Infrastructure

| Directory | Purpose | Run Frequency |
|-----------|---------|---------------|
| `utils/` | Production utilities | Daily/Regular |
| `scripts/` | Operational scripts | One-time/Rare |
| `migrations/` | Schema changes | Per release |
| `seeders/` | Test data generation | Development only |

### Testing

| Directory | Purpose | Command |
|-----------|---------|---------|
| `tests/unit/` | Component tests | `npm run test:unit` |
| `tests/integration/` | Full system tests | `npm run test:visual` |
| `tests/helpers/` | Test utilities | `npm run test:compare` |

---

## 🚀 Quick Start

### Development
```bash
npm install
npm run dev
```

### Production
```bash
npm install --production
npm start
```

### Testing
```bash
npm run test:all          # Run all tests
npm run test:visual       # Visual QR testing
npm run test:compare      # Token comparison
```

### Utilities
```bash
npm run qr:warm-cache     # Warm Redis cache (daily)
npm run qr:regenerate     # Regenerate tokens (rare)
```

---

## 📊 File Organization Rules

### ✅ Utils vs Scripts

**Utils (`src/utils/`)** - Regular operations
- `warm-qr-cache.js` - Run daily via cron
- `cache.js` - Always imported in code
- `logger.js` - Application-wide logging
- `excelParser.js` - On-demand parsing

**Scripts (`src/scripts/`)** - Infrequent operations
- `regenerate-qr-tokens.js` - Token format changes only
- Database migrations - Per major release

### ✅ Tests Organization

**Unit Tests** - Fast, isolated
- Test single functions/methods
- No external dependencies
- Mock database/Redis

**Integration Tests** - Realistic, end-to-end
- Test full workflows
- Use real database/Redis
- Validate entire system

**Helpers** - Test utilities
- Validation tools
- Comparison tools
- Debug utilities

---

## 🔧 NPM Scripts

### Application
```bash
npm start              # Start production server
npm run dev            # Start with nodemon (auto-reload)
npm run seed           # Seed database with test data
```

### Testing
```bash
npm test               # Run Jest tests with coverage
npm run test:unit      # Unit tests only
npm run test:visual    # Visual QR test server
npm run test:compare   # Token comparison stats
npm run test:uniqueness # Validate token uniqueness
npm run test:scan      # QR scan validation
npm run test:all       # Run all non-visual tests
```

### Production Utilities
```bash
npm run qr:warm-cache  # Warm Redis cache (daily cron)
npm run qr:regenerate  # Regenerate all tokens (rare)
```

---

## 🔐 Environment Variables

```env
# Database
NEON_DATABASE_URL=postgresql://user:pass@host/db

# Redis
REDIS_URL=redis://host:port
REDIS_PASSWORD=your-password

# Security
JWT_SECRET=your-secret-key
PORT=5000

# Logging
NODE_ENV=production
LOG_LEVEL=info
```

---

## 📈 Production Checklist

### Daily Operations
- [ ] Run `npm run qr:warm-cache` at 6 AM
- [ ] Monitor Redis cache hit rate (target: >90%)
- [ ] Check application logs for errors
- [ ] Verify API response times (<200ms)

### Weekly Operations
- [ ] Review error logs
- [ ] Check database performance
- [ ] Verify Redis memory usage
- [ ] Update dependencies if needed

### Release Operations
- [ ] Run migrations in staging first
- [ ] Test with `npm run test:all`
- [ ] Backup database before deployment
- [ ] Run `npm run qr:regenerate` if token format changed
- [ ] Warm cache after deployment

---

## 🛠️ Development Guidelines

### Adding New Features
1. Create model in `models/`
2. Add validation in `validations/`
3. Create service in `services/`
4. Add controller in `controllers/`
5. Define routes in `routes/`
6. Write tests in `tests/`

### Adding Utilities
- **Regular operations** → `src/utils/`
- **One-time scripts** → `src/scripts/`
- **Test helpers** → `src/tests/helpers/`

### Code Standards
- Use ES6 modules (`import/export`)
- Add JSDoc comments for functions
- Follow async/await patterns
- Handle errors properly
- Log important operations

---

## 📚 Additional Documentation

- [Utils README](src/utils/README.md) - Production utilities guide
- [Scripts README](src/scripts/README.md) - Operational scripts guide
- [Tests README](src/tests/README.md) - Testing guide
- [Migrations README](src/migrations/README.md) - Database migrations

---

## 🆘 Support

For issues or questions:
1. Check relevant README files
2. Review logs in `src/logs/`
3. Run diagnostic tests
4. Contact SGTU Event Team
