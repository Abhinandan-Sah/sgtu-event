# 🧪 Postman Testing Guide - Refactored API

## 📋 **Quick Test Sequence**

### **Setup**
Base URL: `http://localhost:5000/api`

---

## 1️⃣ **Volunteer Login**

```
POST {{baseUrl}}/volunteer/login

Body (JSON):
{
  "email": "volunteer1@sgtu.ac.in",
  "password": "volunteer123"
}

Save from response:
- volunteer_token
```

---

## 2️⃣ **Student Login**

```
POST {{baseUrl}}/student/login

Body (JSON):
{
  "registration_no": "2024SGTU10001",
  "password": "student123"
}

Save from response:
- student_token
- student_qr_token (from /api/student/qr-code or profile)
```

---

## 3️⃣ **Volunteer: Check-In Student (Entry Gate)**

```
POST {{baseUrl}}/volunteer/check-in
Authorization: Bearer {{volunteer_token}}

Body (JSON):
{
  "student_qr_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuIjoiZTgzY..."
}

✅ Expected: Student marked as inside event
📊 Response includes: is_inside_event: true, total_scan_count: 1
```

---

## 4️⃣ **Student: Scan Stall QR**

```
POST {{baseUrl}}/student/scan-stall
Authorization: Bearer {{student_token}}

Body (JSON):
{
  "stall_qr_token": "STALL_CS-001_1763272340083_4am2ghcnl"
}

✅ Expected: Stall details returned
📊 Response includes: stall info, already_reviewed status
```

---

## 5️⃣ **Student: Submit Feedback**

```
POST {{baseUrl}}/student/submit-feedback
Authorization: Bearer {{student_token}}

Body (JSON):
{
  "stall_id": "89a48d82-97af-4a63-8ac6-1f6d3b5e7c90",
  "rating": 5,
  "comment": "Amazing AI projects! Learned a lot about machine learning."
}

✅ Expected: Feedback saved successfully
📊 Response includes: total_feedbacks_given, remaining_feedbacks
```

---

## 6️⃣ **Student: View My Visits**

```
GET {{baseUrl}}/student/my-visits
Authorization: Bearer {{student_token}}

✅ Expected: List of all stalls visited with ratings
📊 Response includes: total_visits, remaining_feedbacks, visits array
```

---

## 7️⃣ **Volunteer: Check-Out Student (Exit Gate)**

```
POST {{baseUrl}}/volunteer/check-out
Authorization: Bearer {{volunteer_token}}

Body (JSON):
{
  "student_qr_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuIjoiZTgzY..."
}

✅ Expected: Student marked as outside event
📊 Response includes: is_inside_event: false, duration_minutes
```

---

## 🧪 **Error Testing**

### Test 1: Try to scan stall when NOT inside event
```
POST {{baseUrl}}/student/scan-stall
Authorization: Bearer {{student_token}}

Body: { "stall_qr_token": "STALL_CS-001_..." }

❌ Expected: 403 Forbidden
Message: "You must be checked in at the event to scan stalls"
```

### Test 2: Try to submit duplicate feedback
```
POST {{baseUrl}}/student/submit-feedback
Authorization: Bearer {{student_token}}

Body: { "stall_id": "same-stall-id-again", "rating": 5 }

❌ Expected: 409 Conflict
Message: "You have already submitted feedback for this stall"
```

### Test 3: Try to check-in when already inside
```
POST {{baseUrl}}/volunteer/check-in
Authorization: Bearer {{volunteer_token}}

Body: { "student_qr_token": "..." }

❌ Expected: 409 Conflict
Message: "Student is already inside the event. Use check-out to exit."
```

### Test 4: Try to check-out when already outside
```
POST {{baseUrl}}/volunteer/check-out
Authorization: Bearer {{volunteer_token}}

Body: { "student_qr_token": "..." }

❌ Expected: 409 Conflict
Message: "Student is not inside the event. Use check-in to enter."
```

---

## 📊 **Admin Endpoints (Bonus)**

### Get System Statistics
```
GET {{baseUrl}}/admin/stats
Authorization: Bearer {{admin_token}}

Response includes:
- total_students
- currently_inside
- total_feedbacks
- avg_rating
```

### Get All Students
```
GET {{baseUrl}}/admin/students?limit=100&offset=0
Authorization: Bearer {{admin_token}}
```

---

## 🔧 **Postman Environment Variables**

Set these in your Postman environment:

```
baseUrl: http://localhost:5000/api
volunteer_token: <from volunteer login>
student_token: <from student login>
admin_token: <from admin login>
student_qr_token: <from student profile>
stall_qr_token: <from stall data or seeder>
```

---

## 📝 **Notes**

1. **QR Tokens**:
   - Student QR: JWT format (long string starting with "eyJ...")
   - Stall QR: Simple format (STALL_XXX_timestamp_random)

2. **Authentication**:
   - All protected routes need `Authorization: Bearer <token>`
   - Or use HTTP-Only cookies (auto-set on login)

3. **Feedback Limit**:
   - Max 200 feedbacks per student
   - One feedback per stall (no duplicates)

4. **Scan Count Logic**:
   - Odd scans (1,3,5...) = Inside event
   - Even scans (2,4,6...) = Outside event

---

**Ready to Test!** 🚀
