# 🎯 QUICK REFERENCE - For New Developers

## ⚡ Setup in 3 Commands

```bash
npm install
npm run setup:fresh
npm run dev
```

That's it! ✅

---

## 📋 Most Used Commands

```bash
# Fresh start (recommended)
npm run setup:fresh

# Start server
npm run dev

# Verify data is correct
npm run seed:verify

# Fix incorrect data
npm run seed:fix
```

---

## 🔐 Test Credentials

```
Admin:     admin@sgtu.ac.in / admin123
Student:   test@sgtu.ac.in / student123
Volunteer: volunteer.test@sgtu.ac.in / volunteer123
```

---

## ✅ Expected Output After Setup

```
STUDENTS BY SCHOOL:
- School of Applied Sciences: 10 students
- School of Computing Sciences and Engineering: 11 students
- School of Engineering: 10 students
- School of Management: 11 students
- School of Pharmacy: 10 students

STALLS BY SCHOOL:
- School of Applied Sciences: 7 stalls
- School of Computing Sciences and Engineering: 8 stalls
- School of Engineering: 8 stalls
- School of Management: 8 stalls
- School of Pharmacy: 1 stalls
```

---

## 🚨 If Something Goes Wrong

### Data looks wrong?
```bash
npm run seed:verify      # Check what's wrong
npm run seed:fix         # Fix it
```

### Database corrupted?
```bash
npm run setup:fresh      # Nuclear option - fresh start
```

### Can't connect to database?
- Check `.env` file
- Verify NEON_DATABASE_URL is correct

### Redis errors?
- Check `.env` REDIS_* variables
- Make sure Redis Cloud instance is running

---

## 📚 Important Rules

### ✅ DO:
- Run `npm run seed:verify` after seeding
- Use `npm run setup:fresh` for clean slate
- Check `.env` file first when errors occur
- Follow the school assignment logic in seeders

### ❌ DON'T:
- Manually assign schools randomly
- Forget to verify after seeding
- Skip the setup guide
- Modify fix scripts without understanding

---

## 🎓 School Assignment Logic

**Students** - Based on registration number:
```
2024SGTU10XXX → School of Computing Sciences and Engineering
2024SGTU20XXX → School of Engineering
2024SGTU30XXX → School of Management
2024SGTU40XXX → School of Applied Sciences
2024SGTU50XXX → School of Pharmacy
```

**Stalls** - Based on prefix:
```
CS-*    → Computing Sciences
ME/EE/CE-* → Engineering
BM-*    → Management
BT/PH/CH/MA-* → Applied Sciences
BT-002  → Pharmacy (special case)
```

---

## 📖 Full Documentation

- **Complete Setup:** [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- **Full README:** [README.md](./README.md)
- **API Testing:** `POSTMAN_TESTING_GUIDE.md`

---

## 💡 Pro Tips

1. **Always verify** after seeding: `npm run seed:verify`
2. **Use fresh setup** when in doubt: `npm run setup:fresh`
3. **Check logs** for detailed error messages
4. **Test with default credentials** before creating new users

---

**Need Help?** Read [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed instructions! 📚
