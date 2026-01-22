# Sinaesta API Documentation

## Overview

Sinaesta API is a RESTful API built with Node.js, Express, and PostgreSQL. All endpoints return JSON responses with a consistent format.

## Base URL

```
Development: http://localhost:3001/api
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message"
}
```

### Validation Error
```json
{
  "success": false,
  "error": [
    {
      "path": ["field"],
      "message": "Validation message"
    }
  ]
}
```

## Authentication

All endpoints (except register and login) require authentication via JWT Bearer token.

### Request Headers
```
Authorization: Bearer <access-token>
```

### Token Management

**Access Token**: Expires in 15 minutes  
**Refresh Token**: Expires in 7 days  
**Automatic Refresh**: Use `/api/auth/refresh` to get new access token

---

## Authentication Endpoints

### Register User

Create a new user account.

```
POST /api/auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "STUDENT",
  "targetSpecialty": "Internal Medicine",
  "institution": "Medical University",
  "strNumber": "123456"
}
```

**Roles:**
- `SUPER_ADMIN`
- `PROGRAM_ADMIN`
- `MENTOR`
- `REVIEWER`
- `PROCTOR`
- `STUDENT`

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "STUDENT",
      "status": "PENDING"
    },
    "accessToken": "jwt-token",
    "refreshToken": "refresh-token"
  }
}
```

---

### Login

Authenticate user and receive tokens.

```
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "STUDENT",
      "targetSpecialty": "Internal Medicine",
      "avatar": "https://example.com/avatar.jpg"
    },
    "accessToken": "jwt-token",
    "refreshToken": "refresh-token"
  }
}
```

---

### Refresh Token

Get new access token using refresh token.

```
POST /api/auth/refresh
Authorization: Bearer <refresh-token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "new-jwt-token",
    "user": "uuid"
  }
}
```

---

### Logout

Invalidate refresh token and logout.

```
POST /api/auth/logout
Authorization: Bearer <access-token>

{
  "refreshToken": "refresh-token"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## User Endpoints

### Get Current User

Get authenticated user's profile.

```
GET /api/users/me
Authorization: Bearer <access-token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "STUDENT",
    "avatar": "https://example.com/avatar.jpg",
    "status": "VERIFIED",
    "targetSpecialty": "Internal Medicine",
    "institution": "Medical University",
    "strNumber": "123456",
    "batchId": "BATCH-2025-01",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

---

### Get User by ID

Get specific user profile.

```
GET /api/users/:id
Authorization: Bearer <access-token>
```

**Response (200):** Same as Get Current User

---

### Update User

Update user profile. Users can only update their own profile (admins can update any).

```
PUT /api/users/:id
Authorization: Bearer <access-token>

{
  "name": "Updated Name",
  "avatar": "https://example.com/new-avatar.jpg",
  "targetSpecialty": "Cardiology",
  "institution": "Updated Institution",
  "strNumber": "654321"
}
```

**Response (200):** Same as Get Current User

---

### List All Users (Admin Only)

List all users with filtering and pagination.

```
GET /api/users?role=STUDENT&specialty=Internal Medicine&status=VERIFIED&page=1&limit=50
Authorization: Bearer <access-token>
```

**Query Parameters:**
- `role` (optional): Filter by role
- `specialty` (optional): Filter by target specialty
- `status` (optional): Filter by status (PENDING, VERIFIED, SUSPENDED)
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 50): Items per page

**Response (200):**
```json
{
  "success": true,
  "data": [
    // Array of user objects
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 100
  }
}
```

---

## Exam Endpoints

### Get All Exams

List all exams with filtering. Students see only their specialty exams.

```
GET /api/exams?specialty=Cardiology&difficulty=Medium&mode=STANDARD&page=1&limit=20
Authorization: Bearer <access-token>
```

**Query Parameters:**
- `specialty` (optional): Filter by specialty
- `difficulty` (optional): Filter by difficulty (Easy, Medium, Hard)
- `mode` (optional): Filter by mode (STANDARD, CLINICAL_CASE, SPEED_DRILL)
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 20): Items per page

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Cardiovascular Assessment",
      "description": "Comprehensive cardiovascular exam",
      "durationMinutes": 60,
      "questionsCount": 50,
      "topic": "Cardiology",
      "subtopics": ["Heart Failure", "Arrhythmias"],
      "difficulty": "Medium",
      "thumbnailUrl": "https://example.com/exam.jpg",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "mode": "STANDARD",
      "createdBy": "Dr. Michael Chen"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 20
  }
}
```

---

### Get Exam by ID

Get exam details including all questions and vignettes.

```
GET /api/exams/:id
Authorization: Bearer <access-token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Cardiovascular Assessment",
    "description": "Comprehensive cardiovascular exam",
    "durationMinutes": 60,
    "topic": "Cardiology",
    "difficulty": "Medium",
    "mode": "STANDARD",
    "proctoring": {
      "level": "LIGHT",
      "blockTabSwitch": true,
      "forceFullscreen": false
    },
    "sections": [
      {
        "id": "section-1",
        "title": "Part 1: Anatomy",
        "durationMinutes": 30,
        "questionIds": ["q1", "q2"]
      }
    ],
    "questions": [
      {
        "id": "q1",
        "text": "What is the most common cause of heart failure?",
        "options": [
          "Hypertension",
          "Coronary artery disease",
          "Valvular disease",
          "Cardiomyopathy"
        ],
        "correctAnswerIndex": 1,
        "explanation": "CAD is the most common cause...",
        "type": "MCQ",
        "difficulty": "Medium",
        "points": 1,
        "domain": "Diagnosis"
      }
    ],
    "vignettes": []
  }
}
```

---

### Create Exam (Mentor+)

Create a new exam.

```
POST /api/exams
Authorization: Bearer <access-token>

{
  "title": "Cardiovascular Assessment",
  "description": "Comprehensive cardiovascular exam",
  "durationMinutes": 60,
  "topic": "Cardiology",
  "subtopics": ["Heart Failure", "Arrhythmias"],
  "difficulty": "Medium",
  "thumbnailUrl": "https://example.com/exam.jpg",
  "mode": "STANDARD",
  "proctoring": {
    "level": "LIGHT",
    "blockTabSwitch": true,
    "forceFullscreen": false
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Cardiovascular Assessment",
    // ... exam object
  }
}
```

---

### Update Exam (Mentor+)

Update existing exam. Only creator or admins can update.

```
PUT /api/exams/:id
Authorization: Bearer <access-token>

{
  "title": "Updated Title",
  "difficulty": "Hard",
  "description": "Updated description"
}
```

**Response (200):** Same as Get Exam by ID

---

### Delete Exam (Mentor+)

Delete an exam. Only creator or admins can delete.

```
DELETE /api/exams/:id
Authorization: Bearer <access-token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Exam deleted successfully"
}
```

---

### Add Question to Exam (Mentor+)

Add a question to an existing exam.

```
POST /api/exams/:id/questions
Authorization: Bearer <access-token>

{
  "text": "What is the most common cause of heart failure?",
  "options": [
    "Hypertension",
    "Coronary artery disease",
    "Valvular disease",
    "Cardiomyopathy"
  ],
  "correctAnswerIndex": 1,
  "explanation": "CAD is the most common cause...",
  "type": "MCQ",
  "difficulty": "Medium",
  "points": 1,
  "domain": "Diagnosis",
  "status": "PUBLISHED"
}
```

**Question Types:**
- `MCQ` - Multiple Choice Question
- `VIGNETTE` - Case-based question
- `CLINICAL_REASONING` - Multi-step clinical reasoning
- `SPOT_DIAGNOSIS` - Image-based diagnosis

**Domains:**
- `Diagnosis`
- `Therapy`
- `Investigation`
- `Mechanism`
- `Patient Safety`

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "text": "What is the most common cause of heart failure?",
    "options": [...],
    "correctAnswerIndex": 1
  }
}
```

---

### Submit Exam Results

Submit completed exam with answers.

```
POST /api/exams/:id/submit
Authorization: Bearer <access-token>

{
  "answers": [1, 0, 2, 3, 1],
  "auditLog": [
    {
      "timestamp": 1234567890,
      "event": "EXAM_STARTED"
    },
    {
      "timestamp": 1234568000,
      "event": "TAB_SWITCH",
      "details": "User switched tab"
    }
  ]
}
```

**Audit Events:**
- `EXAM_STARTED`
- `EXAM_SUBMITTED`
- `TAB_SWITCH`
- `FULLSCREEN_EXIT`
- `DISCONNECTED`

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "examId": "exam-uuid",
    "userId": "user-uuid",
    "score": 80,
    "totalQuestions": 5,
    "completedAt": "2025-01-01T00:00:00.000Z",
    "domainAnalysis": {
      "Diagnosis": { "correct": 85, "total": 4 },
      "Therapy": { "correct": 75, "total": 2 }
    }
  }
}
```

---

### Get Exam Results

Get all results for a specific exam.

```
GET /api/exams/:id/results?userId=user-uuid
Authorization: Bearer <access-token>
```

**Query Parameters:**
- `userId` (optional): Filter by specific user (admin/mentor only)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "examId": "exam-uuid",
      "examTitle": "Cardiovascular Assessment",
      "userId": "user-uuid",
      "studentName": "John Doe",
      "score": 80,
      "totalQuestions": 5,
      "completedAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

---

## Flashcard Endpoints

### Get All Flashcards

Get user's flashcards with filtering.

```
GET /api/flashcards?category=Cardiology&mastered=false&page=1&limit=50
Authorization: Bearer <access-token>
```

**Query Parameters:**
- `category` (optional): Filter by category
- `mastered` (optional): Filter by mastery status (true/false)
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 50): Items per page

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "front": "What are the stages of heart failure?",
      "back": "Stage A, B, C, D...",
      "category": "Cardiology",
      "mastered": false
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 50
  }
}
```

---

### Create Flashcard

Create a new flashcard.

```
POST /api/flashcards
Authorization: Bearer <access-token>

{
  "front": "What are the stages of heart failure?",
  "back": "Stage A: At risk, Stage B: Structural disease, Stage C: Symptoms, Stage D: Refractory",
  "category": "Cardiology"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "front": "What are the stages of heart failure?",
    "back": "...",
    "category": "Cardiology",
    "mastered": false
  }
}
```

---

### Update Flashcard

Update an existing flashcard.

```
PUT /api/flashcards/:id
Authorization: Bearer <access-token>

{
  "mastered": true,
  "back": "Updated back content"
}
```

**Response (200):** Same as Get Flashcard

---

### Delete Flashcard

Delete a flashcard.

```
DELETE /api/flashcards/:id
Authorization: Bearer <access-token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Flashcard deleted successfully"
}
```

---

### Get Flashcard Decks

Get all flashcard decks (user decks + system decks).

```
GET /api/flashcards/decks/all
Authorization: Bearer <access-token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Cardiology Fundamentals",
      "topic": "Cardiology",
      "cards": [
        {
          "front": "Question",
          "back": "Answer"
        }
      ],
      "isSystemDeck": false,
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### Create Flashcard Deck

Create a new flashcard deck.

```
POST /api/flashcards/decks
Authorization: Bearer <access-token>

{
  "title": "Cardiology Fundamentals",
  "topic": "Cardiology",
  "cards": [
    {
      "front": "What is CAD?",
      "back": "Coronary Artery Disease"
    }
  ]
}
```

**Response (201):** Same as Get Flashcard Deck

---

## OSCE Endpoints

### Get All OSCE Stations

List all OSCE stations.

```
GET /api/osce/stations?page=1&limit=20
Authorization: Bearer <access-token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Cardiovascular Examination",
      "scenario": "45-year-old male with chest pain...",
      "instruction": "Perform focused cardiovascular exam...",
      "durationMinutes": 15,
      "checklist": [
        {
          "item": "Inspection of chest",
          "points": 2,
          "category": "Physical Exam"
        }
      ],
      "examinerId": "uuid",
      "examinerName": "Dr. Michael Chen",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 20
  }
}
```

---

### Get OSCE Station

Get detailed OSCE station information.

```
GET /api/osce/stations/:id
Authorization: Bearer <access-token>
```

**Response (200):** Same as Get All OSCE Stations (single object)

---

### Create OSCE Station (Mentor+)

Create a new OSCE station.

```
POST /api/osce/stations
Authorization: Bearer <access-token>

{
  "title": "Cardiovascular Examination",
  "scenario": "You are examining a 45-year-old male presenting with chest pain...",
  "instruction": "Perform a focused cardiovascular examination. Include inspection, palpation, percussion, and auscultation.",
  "durationMinutes": 15,
  "checklist": [
    {
      "item": "Inspection of chest",
      "points": 2,
      "category": "Physical Exam"
    },
    {
      "item": "Palpation of precordium",
      "points": 2,
      "category": "Physical Exam"
    },
    {
      "item": "Auscultation of heart sounds",
      "points": 3,
      "category": "Physical Exam"
    }
  ],
  "rubricId": "uuid",
  "examinerId": "uuid"
}
```

**Checklist Categories:**
- `Anamnesis` - History taking
- `Physical Exam` - Physical examination
- `Diagnosis` - Diagnostic reasoning
- `Management` - Treatment plan
- `Communication` - Communication skills

**Response (201):** Same as Get OSCE Station

---

### Update OSCE Station (Mentor+)

Update an existing OSCE station.

```
PUT /api/osce/stations/:id
Authorization: Bearer <access-token>

{
  "title": "Updated Title",
  "checklist": [...]
}
```

**Response (200):** Same as Get OSCE Station

---

### Delete OSCE Station (Mentor+)

Delete an OSCE station.

```
DELETE /api/osce/stations/:id
Authorization: Bearer <access-token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "OSCE station deleted successfully"
}
```

---

### Submit OSCE Attempt

Submit OSCE performance for grading.

```
POST /api/osce/attempts
Authorization: Bearer <access-token>

{
  "stationId": "uuid",
  "performance": [
    {
      "item": "Inspection of chest",
      "points": 2,
      "category": "Physical Exam"
    },
    {
      "item": "Auscultation of heart sounds",
      "points": 1,
      "category": "Physical Exam"
    }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "stationId": "uuid",
    "userId": "uuid",
    "performance": [...],
    "score": 85,
    "completedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

---

### Get OSCE Attempts

Get user's OSCE attempt history.

```
GET /api/osce/attempts?stationId=uuid&page=1&limit=20
Authorization: Bearer <access-token>
```

**Query Parameters:**
- `stationId` (optional): Filter by station
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 20): Items per page

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "stationId": "uuid",
      "stationTitle": "Cardiovascular Examination",
      "userId": "uuid",
      "studentName": "John Doe",
      "performance": [...],
      "feedback": "Good performance on auscultation, improve on...",
      "score": 85,
      "completedAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 20
  }
}
```

---

### Get OSCE Attempt Details

Get detailed OSCE attempt with feedback.

```
GET /api/osce/attempts/:id
Authorization: Bearer <access-token>
```

**Response (200):** Same as Get OSCE Attempts (single object)

---

### Update OSCE Attempt (Mentor+)

Add feedback and score to OSCE attempt.

```
PUT /api/osce/attempts/:id
Authorization: Bearer <access-token>

{
  "feedback": "Excellent demonstration of cardiovascular examination...",
  "score": 90
}
```

**Response (200):** Same as Get OSCE Attempt Details

---

## Result Endpoints

### Get My Results

Get current user's exam results.

```
GET /api/results/my-results?page=1&limit=20
Authorization: Bearer <access-token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "examId": "uuid",
      "examTitle": "Cardiovascular Assessment",
      "examSpecialty": "Cardiology",
      "examDifficulty": "Medium",
      "userId": "uuid",
      "score": 80,
      "totalQuestions": 5,
      "answers": [1, 0, 2, 3, 1],
      "completedAt": "2025-01-01T00:00:00.000Z",
      "domainAnalysis": {
        "Diagnosis": { "correct": 85, "total": 4 },
        "Therapy": { "correct": 75, "total": 2 }
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 20
  }
}
```

---

### Get Result by ID

Get detailed exam result with questions and answers.

```
GET /api/results/:id
Authorization: Bearer <access-token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "examId": "uuid",
    "examTitle": "Cardiovascular Assessment",
    "score": 80,
    "totalQuestions": 5,
    "answers": [1, 0, 2, 3, 1],
    "completedAt": "2025-01-01T00:00:00.000Z",
    "questions": [
      {
        "id": 1,
        "text": "What is the most common cause of heart failure?",
        "options": ["Hypertension", "CAD", "Valvular", "Cardiomyopathy"],
        "correctAnswerIndex": 1,
        "explanation": "CAD is most common...",
        "userAnswer": 1,
        "isCorrect": true
      }
    ]
  }
}
```

---

### Get All Results (Mentor+)

Get all exam results (admin/mentor only).

```
GET /api/results?userId=uuid&examId=uuid&page=1&limit=50
Authorization: Bearer <access-token>
```

**Query Parameters:**
- `userId` (optional): Filter by user
- `examId` (optional): Filter by exam
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 50): Items per page

**Response (200):** Similar to Get My Results

---

### Get Result Statistics (Mentor+)

Get overview statistics for exam results.

```
GET /api/results/stats/overview?examId=uuid&specialty=Cardiology
Authorization: Bearer <access-token>
```

**Query Parameters:**
- `examId` (optional): Filter by specific exam
- `specialty` (optional): Filter by specialty

**Response (200):**
```json
{
  "success": true,
  "data": {
    "overview": {
      "averageScore": 75,
      "totalAttempts": 150
    },
    "gradeDistribution": [
      {
        "grade": "A",
        "count": 45
      },
      {
        "grade": "B",
        "count": 60
      },
      {
        "grade": "C",
        "count": 30
      },
      {
        "grade": "D",
        "count": 10
      },
      {
        "grade": "F",
        "count": 5
      }
    ],
    "byDifficulty": [
      {
        "difficulty": "Easy",
        "averageScore": 85,
        "count": 50
      },
      {
        "difficulty": "Medium",
        "averageScore": 75,
        "count": 70
      },
      {
        "difficulty": "Hard",
        "averageScore": 65,
        "count": 30
      }
    ]
  }
}
```

---

## Error Codes

| Status Code | Description |
|------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (invalid/missing token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Rate Limiting

- **General API**: 50 requests per 15 minutes
- **Bulk Operations**: 10 requests per hour
- **Presigned URLs**: 100 requests per 5 minutes

When rate limited, you'll receive:
```json
{
  "success": false,
  "error": "Too many requests, please try again later"
}
```

With headers:
```
X-RateLimit-Limit: 50
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1640995200
```

---

## WebSocket Events (Future)

Real-time events for exam proctoring and live updates.

### Connect
```
ws://localhost:3001/ws
```

### Events

**exam:started**
```json
{
  "examId": "uuid",
  "userId": "uuid",
  "timestamp": 1234567890
}
```

**exam:tab_switch**
```json
{
  "examId": "uuid",
  "userId": "uuid",
  "count": 3
}
```

**exam:submitted**
```json
{
  "examId": "uuid",
  "userId": "uuid",
  "score": 80
}
```

---

## Pagination

All list endpoints support pagination:

**Query Parameters:**
- `page` (default: 1): Page number (1-indexed)
- `limit` (default: varies by endpoint): Items per page

**Response:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

---

## Sorting

Most list endpoints support sorting via query parameters:

```
GET /api/exams?sortBy=createdAt&sortOrder=desc
```

---

## Filtering

Use query parameters to filter results:

```
GET /api/exams?specialty=Cardiology&difficulty=Medium&status=PUBLISHED
```

Common filters:
- `role`, `specialty`, `status` (users)
- `specialty`, `difficulty`, `mode` (exams)
- `category`, `mastered` (flashcards)
- `userId`, `examId` (results)

---

## Full Example: Complete Exam Flow

### 1. Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@test.com","password":"password123"}'
```

Save `accessToken` from response.

### 2. Get Available Exams
```bash
curl http://localhost:3001/api/exams?specialty=Internal%20Medicine \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Start Exam
```bash
curl http://localhost:3001/api/exams/EXAM_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Save questions and show to student.

### 4. Submit Exam
```bash
curl -X POST http://localhost:3001/api/exams/EXAM_ID/submit \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"answers":[0,1,2,1,0]}'
```

### 5. View Results
```bash
curl http://localhost:3001/api/results/my-results \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## SDK Integration

Use the provided `apiService.ts` for easy integration:

```typescript
import { apiService } from './services/apiService';

// Login
const loginData = await apiService.login(email, password);
localStorage.setItem('accessToken', loginData.accessToken);
localStorage.setItem('refreshToken', loginData.refreshToken);

// Get exams
const exams = await apiService.getExams({ specialty: 'Cardiology' });

// Submit exam
const result = await apiService.submitExam(examId, answers);
```

The API service automatically handles token refresh!

---

## Support

For issues or questions:
1. Check this documentation
2. Review error messages from API responses
3. Consult [BACKEND_README.md](./BACKEND_README.md)
4. Contact development team
