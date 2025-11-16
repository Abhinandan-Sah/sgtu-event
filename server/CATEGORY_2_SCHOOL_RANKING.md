# Category 2: School-Based Stall Ranking System

## Overview
Students rank the **top 3 stalls from THEIR OWN SCHOOL ONLY**. This is a **ONE-TIME submission** and cannot be changed after submission.

---

## 🎯 Business Rules

1. **School Restriction**: Students can ONLY see and rank stalls from their own school
2. **One-Time Submission**: Once submitted, rankings cannot be modified
3. **Minimum Requirement**: School must have at least 3 active stalls
4. **Rank Selection**: Students must select exactly 3 different stalls with ranks 1, 2, and 3
5. **Admin-Only Results**: Only admins can view the top schools leaderboard

---

## 📌 API Endpoints

### **STUDENT ENDPOINTS** (Protected - Student Auth Required)

#### 1. Get My School's Stalls
```
GET /api/student/my-school-stalls
```

**Headers:**
```
Authorization: Bearer <student_jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "student_info": {
      "id": "uuid",
      "registration_no": "2025001",
      "full_name": "John Doe",
      "school_name": "School of Engineering"
    },
    "stalls": [
      {
        "stall_id": "uuid",
        "stall_number": "E101",
        "stall_name": "Robotics Lab",
        "description": "AI and Robotics projects",
        "location": "Block E"
      }
    ],
    "total_stalls": 15,
    "instructions": "Select top 3 stalls from YOUR SCHOOL ONLY..."
  }
}
```

**Error Cases:**
- `409`: Already submitted rankings
- `400`: School has less than 3 stalls
- `404`: Student not found

---

#### 2. Submit School Ranking
```
POST /api/student/submit-school-ranking
```

**Headers:**
```
Authorization: Bearer <student_jwt_token>
```

**Body:**
```json
{
  "rankings": [
    { "stall_id": "uuid-1", "rank": 1 },
    { "stall_id": "uuid-2", "rank": 2 },
    { "stall_id": "uuid-3", "rank": 3 }
  ]
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "message": "🎉 Rankings submitted successfully!",
    "submitted_rankings": [
      { "rank": 1, "stall_name": "Robotics Lab", "stall_number": "E101" },
      { "rank": 2, "stall_name": "AI Research", "stall_number": "E102" },
      { "rank": 3, "stall_name": "IoT Lab", "stall_number": "E103" }
    ],
    "note": "Your rankings are recorded and cannot be changed."
  }
}
```

**Validation Errors:**
- `400`: Must provide exactly 3 stalls
- `400`: Rankings must be 1, 2, 3 (no duplicates)
- `400`: Must rank 3 different stalls
- `403`: Stalls must be from your school only
- `404`: Stalls not found
- `409`: Already submitted (one-time only)

---

#### 3. View My School Ranking
```
GET /api/student/my-school-ranking
```

**Headers:**
```
Authorization: Bearer <student_jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "rankings": [
      {
        "rank": 1,
        "stall_name": "Robotics Lab",
        "stall_number": "E101",
        "description": "AI and Robotics projects"
      }
    ],
    "submitted_at": "2025-01-15T10:30:00Z",
    "note": "This ranking was ONE-TIME and cannot be changed."
  }
}
```

---

### **ADMIN ENDPOINT** (Protected - Admin Auth Required)

#### Get Top Schools Leaderboard
```
GET /api/admin/top-schools?limit=10
```

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters:**
- `limit` (optional): Number of top schools to retrieve (default: 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "top_schools": [
      {
        "position": 1,
        "school_id": "uuid",
        "school_name": "School of Engineering",
        "total_score": 45,
        "breakdown": {
          "rank_1_votes": 5,
          "rank_2_votes": 4,
          "rank_3_votes": 3
        },
        "students_participated": 12,
        "stalls_ranked": 8
      }
    ],
    "scoring_system": {
      "rank_1": "5 points",
      "rank_2": "3 points",
      "rank_3": "1 point",
      "description": "Schools earn points when their stalls are ranked by students from their own school"
    },
    "overall_stats": {
      "total_students_participated": 150,
      "total_schools_participated": 8,
      "total_stalls_ranked": 50
    }
  }
}
```

---

## 🔢 Scoring System

### Points Allocation
- **Rank 1 (Best)**: 5 points
- **Rank 2 (Second Best)**: 3 points
- **Rank 3 (Third Best)**: 1 point

### School Score Calculation
```
School Score = (Rank 1 votes × 5) + (Rank 2 votes × 3) + (Rank 3 votes × 1)
```

**Example:**
If a school receives:
- 10 Rank 1 votes → 10 × 5 = 50 points
- 8 Rank 2 votes → 8 × 3 = 24 points
- 6 Rank 3 votes → 6 × 1 = 6 points
- **Total School Score = 80 points**

---

## 🔒 Security & Validation

### Backend Validation
1. ✅ JWT authentication required
2. ✅ Student can only see their school's stalls
3. ✅ Verify all 3 stalls belong to student's school
4. ✅ Check if student already submitted (one-time enforcement)
5. ✅ Atomic transaction (all-or-nothing submission)
6. ✅ Update `has_completed_ranking` flag after submission
7. ✅ Update stall vote counts cached in database

### Database Constraints
- `has_completed_ranking` boolean flag prevents re-submission
- `selected_category` tracks if student chose Category 2
- Foreign key constraints ensure data integrity
- Transaction rollback on any validation failure

---

## 📊 Database Impact

### Tables Updated

#### `students` table:
```sql
UPDATE students 
SET has_completed_ranking = true,
    selected_category = 'CATEGORY_2',
    updated_at = NOW()
WHERE id = <student_id>
```

#### `rankings` table:
```sql
INSERT INTO rankings (student_id, stall_id, rank, submitted_at)
VALUES 
  (<student_id>, <stall_1_id>, 1, NOW()),
  (<student_id>, <stall_2_id>, 2, NOW()),
  (<student_id>, <stall_3_id>, 3, NOW())
```

#### `stalls` table (cached vote counts):
```sql
UPDATE stalls 
SET rank_1_votes = rank_1_votes + 1,
    weighted_score = (rank_1_votes * 5) + (rank_2_votes * 3) + (rank_3_votes * 1),
    updated_at = NOW()
WHERE id = <stall_id>
```

---

## 🧪 Testing Scenarios

### Test Case 1: Successful Submission
1. Student logs in
2. Gets their school's stalls (minimum 3 required)
3. Submits 3 unique stalls with ranks 1, 2, 3
4. Receives success confirmation
5. Cannot submit again (409 error)

### Test Case 2: Cross-School Validation
1. Student attempts to rank stalls from another school
2. Backend validates `school_id` mismatch
3. Returns `403 Forbidden` error

### Test Case 3: Duplicate Prevention
1. Student submits ranking successfully
2. Attempts to submit again
3. Backend checks `has_completed_ranking = true`
4. Returns `409 Conflict` error

### Test Case 4: Admin View Results
1. Admin logs in
2. Calls `/api/admin/top-schools`
3. Receives aggregated school leaderboard
4. Schools sorted by total score descending

---

## 🔄 Flow Diagram

```
STUDENT FLOW:
┌─────────────────────────────────────────┐
│ 1. Student Login (JWT Token)           │
└───────────────┬─────────────────────────┘
                ▼
┌─────────────────────────────────────────┐
│ 2. GET /api/student/my-school-stalls    │
│    - Returns only their school's stalls │
└───────────────┬─────────────────────────┘
                ▼
┌─────────────────────────────────────────┐
│ 3. Student selects Top 3 stalls         │
│    - Rank 1 (Best)                      │
│    - Rank 2 (Second Best)               │
│    - Rank 3 (Third Best)                │
└───────────────┬─────────────────────────┘
                ▼
┌─────────────────────────────────────────┐
│ 4. POST /api/student/submit-school-     │
│    ranking                               │
│    - Validates school_id                │
│    - Checks one-time submission         │
│    - Saves rankings atomically          │
└───────────────┬─────────────────────────┘
                ▼
┌─────────────────────────────────────────┐
│ 5. Rankings Saved ✅                    │
│    - has_completed_ranking = true       │
│    - Cannot submit again                │
└─────────────────────────────────────────┘

ADMIN FLOW:
┌─────────────────────────────────────────┐
│ 1. Admin Login (JWT Token)              │
└───────────────┬─────────────────────────┘
                ▼
┌─────────────────────────────────────────┐
│ 2. GET /api/admin/top-schools           │
│    - Aggregates all school scores       │
│    - Calculates weighted points         │
│    - Returns sorted leaderboard         │
└─────────────────────────────────────────┘
```

---

## ✅ Implementation Checklist

- [x] Student controller methods added
- [x] Admin controller method added
- [x] Student routes registered
- [x] Admin route registered
- [x] School validation logic implemented
- [x] One-time submission enforcement
- [x] Atomic transaction handling
- [x] Cached vote counts update
- [x] JWT authentication required
- [x] Comprehensive error handling
- [x] Production-ready code standards

---

## 🚀 Ready for Production

**All endpoints are live and ready to use!**

- ✅ Students can rank their school's stalls (one-time)
- ✅ Admins can view top schools leaderboard
- ✅ Full validation and security implemented
- ✅ Database transactions ensure data integrity
- ✅ Comprehensive error handling with clear messages

**Server Status:** 🟢 Running on port 5000
