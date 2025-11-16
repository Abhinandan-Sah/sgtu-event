# 🍪 Cookie-Based Authentication - Testing Guide

## ✅ Implementation Complete

All authentication endpoints now support **dual authentication**:
1. **HTTP-Only Cookies** (Primary - More Secure)
2. **Authorization Header** (Fallback - For Postman/Mobile)

---

## 🔒 Security Features Implemented

✅ **httpOnly: true** - Prevents JavaScript access (XSS protection)  
✅ **secure: true** - HTTPS only in production  
✅ **sameSite: 'strict'** - CSRF protection  
✅ **maxAge: 24h** - Auto-expiration  
✅ **Dual authentication** - Works with browsers AND Postman

---

## 📋 New Endpoints Added

### **Logout Endpoints (New)**
- `POST /api/admin/logout` - Admin logout (clears cookie)
- `POST /api/student/logout` - Student logout (clears cookie)
- `POST /api/volunteer/logout` - Volunteer logout (clears cookie)

---

## 🧪 Testing with Postman

### **Option 1: Using Authorization Header (Unchanged)**

**1. Admin Login:**
```http
POST http://localhost:5000/api/admin/login
Content-Type: application/json

{
  "email": "admin@sgtu.ac.in",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "admin": {
      "id": "uuid",
      "email": "admin@sgtu.ac.in",
      "full_name": "Super Admin",
      "role": "SUPER_ADMIN"
    }
  }
}
```

**2. Copy the `token` and use it:**
```http
GET http://localhost:5000/api/admin/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### **Option 2: Using Cookies (New - Production)**

**1. Admin Login** (Cookie set automatically):
```http
POST http://localhost:5000/api/admin/login
Content-Type: application/json

{
  "email": "admin@sgtu.ac.in",
  "password": "admin123"
}
```

**Check Response Headers:**
```http
Set-Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; 
            Path=/; 
            HttpOnly; 
            SameSite=Strict; 
            Max-Age=86400
```

**2. Access Protected Routes** (Cookie sent automatically):
```http
GET http://localhost:5000/api/admin/profile
# No Authorization header needed - cookie sent automatically!
```

**3. Logout** (Cookie cleared):
```http
POST http://localhost:5000/api/admin/logout
# Cookie automatically deleted
```

---

## 🌐 Frontend Integration (React/Vue/Angular)

### **Login Request:**
```javascript
// Login - Cookie is automatically set by server
const response = await fetch('http://localhost:5000/api/student/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  credentials: 'include', // ✅ IMPORTANT: Send/receive cookies
  body: JSON.stringify({
    email: 'test@sgtu.ac.in',
    password: 'student123'
  })
});

const data = await response.json();
// Cookie is now set automatically - no need to store token in localStorage!
```

### **Authenticated Requests:**
```javascript
// Profile request - Cookie sent automatically
const profile = await fetch('http://localhost:5000/api/student/profile', {
  credentials: 'include' // ✅ IMPORTANT: Send cookie
});

const userData = await profile.json();
```

### **Logout Request:**
```javascript
// Logout - Cookie cleared automatically
const response = await fetch('http://localhost:5000/api/student/logout', {
  method: 'POST',
  credentials: 'include' // ✅ Send cookie to be cleared
});
```

---

## 📊 Complete API Reference

### **Admin Endpoints**

| Method | Endpoint | Auth Required | Cookie Support |
|--------|----------|---------------|----------------|
| POST | `/api/admin/login` | ❌ | ✅ Sets cookie |
| POST | `/api/admin/logout` | ✅ | ✅ Clears cookie |
| GET | `/api/admin/profile` | ✅ | ✅ |
| PUT | `/api/admin/profile` | ✅ | ✅ |
| GET | `/api/admin/students` | ✅ | ✅ |
| GET | `/api/admin/volunteers` | ✅ | ✅ |
| GET | `/api/admin/stalls` | ✅ | ✅ |
| GET | `/api/admin/stats` | ✅ | ✅ |

### **Student Endpoints**

| Method | Endpoint | Auth Required | Cookie Support |
|--------|----------|---------------|----------------|
| POST | `/api/student/login` | ❌ | ✅ Sets cookie |
| POST | `/api/student/register` | ❌ | ✅ Sets cookie |
| POST | `/api/student/logout` | ✅ | ✅ Clears cookie |
| GET | `/api/student/profile` | ✅ | ✅ |
| PUT | `/api/student/profile` | ✅ | ✅ |
| GET | `/api/student/qr-code` | ✅ | ✅ |
| GET | `/api/student/check-in-history` | ✅ | ✅ |

### **Volunteer Endpoints**

| Method | Endpoint | Auth Required | Cookie Support |
|--------|----------|---------------|----------------|
| POST | `/api/volunteer/login` | ❌ | ✅ Sets cookie |
| POST | `/api/volunteer/register` | ❌ | ✅ Sets cookie |
| POST | `/api/volunteer/logout` | ✅ | ✅ Clears cookie |
| GET | `/api/volunteer/profile` | ✅ | ✅ |
| POST | `/api/volunteer/scan/student` | ✅ | ✅ |
| POST | `/api/volunteer/scan/stall` | ✅ | ✅ |
| POST | `/api/volunteer/check-in` | ✅ | ✅ |
| POST | `/api/volunteer/check-out` | ✅ | ✅ |
| GET | `/api/volunteer/history` | ✅ | ✅ |

---

## 🔧 Environment Configuration

Add to `.env` file:
```env
# Server
PORT=5000
NODE_ENV=production  # Set to 'production' for HTTPS-only cookies

# Frontend
CLIENT_URL=http://localhost:5173  # Your frontend URL (for CORS)

# JWT
JWT_SECRET=your-super-secret-jwt-key-here

# Database
NEON_DATABASE_URL=your-neon-db-url
```

---

## 🎯 Production Deployment Checklist

✅ **Set `NODE_ENV=production`** - Enables HTTPS-only cookies  
✅ **Use HTTPS** - Cookies require secure connection in production  
✅ **Configure CORS** - Set `CLIENT_URL` to your frontend domain  
✅ **Strong JWT_SECRET** - Use 256-bit random key  
✅ **Rate limiting** - Already implemented with express-rate-limit  
✅ **Helmet security** - Already enabled  
✅ **Cookie security** - httpOnly, secure, sameSite configured

---

## 🐛 Troubleshooting

### **Cookies not being set in Postman:**
- Make sure Postman is configured to accept cookies
- Check "Settings" → "Cookies" → Enable cookie jar
- After login, check "Cookies" tab to see stored cookies

### **Cookies not sent from frontend:**
- Add `credentials: 'include'` to ALL fetch/axios requests
- Ensure `CLIENT_URL` in `.env` matches your frontend URL
- Check browser console for CORS errors

### **Authorization header still works:**
- Yes! Dual authentication means both methods work
- Cookie is checked first, then Authorization header
- Perfect for testing with Postman while using cookies in production

---

## ✅ What Changed

### **Files Created:**
- `src/helpers/cookie.js` - Centralized cookie management

### **Files Modified:**
1. `package.json` - Added cookie-parser
2. `src/index.js` - Added cookieParser middleware, CORS credentials
3. `src/middleware/auth.js` - Dual authentication (cookie + header)
4. `src/controllers/admin.controller.js` - Cookie on login, logout endpoint
5. `src/controllers/student.controller.js` - Cookie on login/register, logout endpoint
6. `src/controllers/volunteer.controller.js` - Cookie on login/register, logout endpoint
7. `src/routes/admin.route.js` - Added POST /logout route
8. `src/routes/student.route.js` - Added POST /logout route
9. `src/routes/volunteer.route.js` - Added POST /logout route

### **Backward Compatibility:**
✅ All existing tests using Authorization header still work  
✅ Mobile apps can continue using Authorization header  
✅ Web apps automatically benefit from cookie security

---

## 🚀 Quick Start

1. **Install dependencies:**
```bash
cd server
npm install
```

2. **Start server:**
```bash
npm start
```

3. **Test with Postman:**
- Login to any endpoint
- Check "Cookies" tab to see stored cookie
- Make authenticated requests without Authorization header

4. **Test logout:**
- POST to `/api/admin/logout`
- Check "Cookies" tab - cookie should be cleared

---

## 📝 Notes

- **Development:** Cookies work on HTTP (localhost)
- **Production:** Cookies require HTTPS (secure flag)
- **Token in response:** Still included for mobile apps/Postman
- **Cookie priority:** Cookie checked first, then Authorization header
- **Security:** httpOnly prevents XSS attacks on stored tokens

---

**🎉 All authentication is now production-ready with enterprise-level security!**
