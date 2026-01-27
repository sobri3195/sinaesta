# SINAESTA Mock API Documentation

## 📋 Overview

Dokumentasi lengkap untuk Mock API yang digunakan dalam Demo Mode SINAESTA. Mock API ini memungkinkan aplikasi berjalan tanpa backend server dengan menyimpan data di browser localStorage.

---

## 🎯 Quick Start

### Mengaktifkan Demo Mode

```typescript
// Di browser console atau dalam kode
import { demoAuthService } from './services/demoAuthService';

// Aktifkan demo mode
demoAuthService.setBackendEnabled(false);

// Verifikasi status
console.log('Demo mode:', !demoAuthService.isBackendActive());
```

### Melihat Dokumentasi

```typescript
// Tampilkan dokumentasi lengkap di console
demoAuthService.getAPIDocumentation();

// Lihat endpoint yang tersedia
console.log(demoAuthService.getImplementedEndpoints());

// Lihat statistik database demo
console.log(demoAuthService.getDemoDBStats());
```

---

## 🔐 Authentication Endpoints

### POST /auth/login

Login menggunakan demo account.

**Request Body:**
```json
{
  "email": "demo@sinaesta.com",
  "password": "demo123"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "demo-user-id",
    "name": "Demo User",
    "email": "demo@sinaesta.com",
    "role": "STUDENT",
    "targetSpecialty": "Internal Medicine"
  }
}
```

### POST /auth/logout

Logout dan hapus token.

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### POST /auth/refresh

Refresh access token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "data": {
    "accessToken": "new-access-token",
    "refreshToken": "new-refresh-token"
  }
}
```

---

## 👤 User Endpoints

### GET /users/me

Mendapatkan profile user yang sedang login.

**Response:**
```json
{
  "data": {
    "id": "demo-user-id",
    "name": "Demo User",
    "email": "demo@sinaesta.com",
    "role": "STUDENT",
    "targetSpecialty": "Internal Medicine",
    "institution": "Sinaesta Demo"
  }
}
```

### GET /users/:id

Mendapatkan user berdasarkan ID.

**Response:**
```json
{
  "data": {
    "id": "user-id",
    "name": "Demo User",
    "email": "user@example.com",
    "role": "STUDENT"
  }
}
```

### PUT /users/:id

Update user profile.

**Request Body:**
```json
{
  "name": "New Name",
  "targetSpecialty": "Surgery",
  "institution": "New Hospital"
}
```

**Response:**
```json
{
  "data": {
    "id": "user-id",
    "name": "New Name",
    "targetSpecialty": "Surgery",
    "institution": "New Hospital"
  }
}
```

### GET /users

List semua users (admin only).

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `role` - Filter by role
- `specialty` - Filter by specialty

**Response:**
```json
{
  "data": [...],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

---

## 📝 Exam Endpoints

### GET /exams

List ujian berdasarkan specialty user.

**Query Parameters:**
- `specialty` - Filter by specialty (default: user's specialty)
- `difficulty` - Filter by difficulty (Easy, Medium, Hard)
- `page` - Page number
- `limit` - Items per page

**Response:**
```json
{
  "data": [
    {
      "id": "ex_im_1",
      "title": "Tryout Nasional PPDS Interna Batch 1",
      "description": "Simulasi ujian komprehensif...",
      "durationMinutes": 90,
      "topic": "Internal Medicine",
      "difficulty": "Hard",
      "questions": [...]
    }
  ],
  "total": 5,
  "page": 1,
  "limit": 10
}
```

### GET /exams/:id

Mendapatkan detail ujian beserta questions.

**Response:**
```json
{
  "data": {
    "id": "exam-id",
    "title": "Exam Title",
    "questions": [
      {
        "id": "q1",
        "text": "Question text",
        "options": ["A", "B", "C", "D"],
        "correctAnswerIndex": 0,
        "explanation": "Explanation here"
      }
    ]
  }
}
```

### POST /exams

Membuat ujian baru (teacher/admin only).

**Request Body:**
```json
{
  "title": "New Exam",
  "description": "Exam description",
  "durationMinutes": 60,
  "topic": "Internal Medicine",
  "difficulty": "Medium",
  "questions": [...]
}
```

**Response:**
```json
{
  "data": {
    "id": "exam-1234567890",
    "title": "New Exam",
    "createdAt": 1234567890000,
    "createdBy": "user-id"
  }
}
```

### POST /exams/:id/submit

Submit jawaban ujian.

**Request Body:**
```json
{
  "answers": [
    {
      "questionId": "q1",
      "selectedAnswerIndex": 0,
      "isCorrect": true,
      "timeSpent": 45
    }
  ],
  "timeSpent": 3600
}
```

**Response:**
```json
{
  "data": {
    "id": "result-1234567890",
    "examId": "exam-id",
    "userId": "user-id",
    "score": 85,
    "totalQuestions": 20,
    "correctAnswers": 17,
    "answers": [...],
    "completedAt": 1234567890000
  }
}
```

### GET /exams/:id/results

Mendapatkan results untuk exam tertentu.

**Query Parameters:**
- `userId` - Filter by user ID (optional)

**Response:**
```json
{
  "data": [
    {
      "id": "result-id",
      "examId": "exam-id",
      "userId": "user-id",
      "score": 85,
      "completedAt": 1234567890000
    }
  ]
}
```

---

## 📊 Results Endpoints

### GET /results

List semua results dengan filtering.

**Query Parameters:**
- `userId` - Filter by user ID
- `examId` - Filter by exam ID
- `page` - Page number
- `limit` - Items per page

**Response:**
```json
{
  "data": [...],
  "total": 50,
  "page": 1,
  "limit": 10
}
```

### GET /results/my-results

Mendapatkan results user yang sedang login.

**Response:**
```json
{
  "data": [
    {
      "id": "result-id",
      "examId": "exam-id",
      "score": 85,
      "totalQuestions": 20,
      "correctAnswers": 17,
      "completedAt": 1234567890000
    }
  ],
  "total": 10,
  "page": 1,
  "limit": 10
}
```

### GET /results/:id

Mendapatkan detail result tertentu.

**Response:**
```json
{
  "data": {
    "id": "result-id",
    "examId": "exam-id",
    "userId": "user-id",
    "score": 85,
    "answers": [...],
    "timeSpent": 3600
  }
}
```

### GET /results/stats/overview

Mendapatkan statistik hasil ujian.

**Query Parameters:**
- `examId` - Filter by exam (optional)
- `specialty` - Filter by specialty (optional)

**Response:**
```json
{
  "data": {
    "totalExams": 10,
    "averageScore": 75,
    "totalTimeSpent": 36000,
    "bestScore": 95,
    "recentResults": [...]
  }
}
```

---

## 🗂️ Flashcard Endpoints

### GET /flashcards

List flashcards.

**Query Parameters:**
- `category` - Filter by category
- `mastered` - Filter by mastered status
- `page` - Page number
- `limit` - Items per page

**Response:**
```json
{
  "data": [
    {
      "id": "fc1",
      "front": "Question",
      "back": "Answer",
      "category": "Cardiology",
      "deckId": "deck-id",
      "deckTitle": "Deck Title"
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 20
}
```

### GET /flashcards/decks/all

List semua flashcard decks.

**Response:**
```json
{
  "data": [
    {
      "id": "fc_im_1",
      "title": "Hypertension Management",
      "topic": "Cardiology",
      "createdAt": 1234567890000,
      "cards": [...]
    }
  ],
  "total": 5
}
```

### GET /flashcards/:id

Mendapatkan flashcard by ID.

**Response:**
```json
{
  "data": {
    "id": "fc1",
    "front": "Question",
    "back": "Answer",
    "category": "Cardiology"
  }
}
```

### POST /flashcards

Membuat flashcard baru.

**Request Body:**
```json
{
  "front": "Question",
  "back": "Answer",
  "category": "Cardiology"
}
```

**Response:**
```json
{
  "data": {
    "id": "card-1234567890",
    "front": "Question",
    "back": "Answer",
    "category": "Cardiology"
  }
}
```

### POST /flashcards/decks

Membuat deck baru.

**Request Body:**
```json
{
  "title": "New Deck",
  "topic": "Cardiology",
  "cards": [...]
}
```

**Response:**
```json
{
  "data": {
    "id": "deck-1234567890",
    "title": "New Deck",
    "topic": "Cardiology",
    "createdAt": 1234567890000
  }
}
```

---

## 🏥 OSCE Endpoints

### GET /osce/stations

List OSCE stations.

**Query Parameters:**
- `specialty` - Filter by specialty
- `page` - Page number
- `limit` - Items per page

**Response:**
```json
{
  "data": [
    {
      "id": "osce_im_1",
      "title": "Station 1: Hypertensive Crisis Management",
      "scenario": "Patient scenario...",
      "instruction": "Instructions...",
      "durationMinutes": 15,
      "checklist": [...]
    }
  ],
  "total": 3,
  "page": 1,
  "limit": 10
}
```

### GET /osce/stations/:id

Mendapatkan detail OSCE station.

**Response:**
```json
{
  "data": {
    "id": "osce-id",
    "title": "Station Title",
    "scenario": "Scenario text",
    "instruction": "Instructions",
    "checklist": [
      {
        "item": "Checklist item",
        "points": 2,
        "category": "Physical Exam"
      }
    ]
  }
}
```

### POST /osce/stations

Membuat OSCE station baru.

**Request Body:**
```json
{
  "title": "New Station",
  "scenario": "Scenario",
  "instruction": "Instructions",
  "durationMinutes": 15,
  "checklist": [...]
}
```

### GET /osce/attempts

List attempt history.

**Query Parameters:**
- `stationId` - Filter by station ID

**Response:**
```json
{
  "data": [
    {
      "id": "attempt-id",
      "stationId": "station-id",
      "userId": "user-id",
      "performance": {...},
      "createdAt": 1234567890000
    }
  ]
}
```

### POST /osce/attempts

Submit OSCE attempt.

**Request Body:**
```json
{
  "stationId": "station-id",
  "performance": {
    "score": 85,
    "checklist": [...]
  }
}
```

**Response:**
```json
{
  "data": {
    "id": "attempt-1234567890",
    "stationId": "station-id",
    "userId": "user-id",
    "createdAt": 1234567890000
  }
}
```

---

## 📈 Analytics Endpoints

### GET /analytics/*

Mendapatkan analytics data untuk performance tracking.

**Response:**
```json
{
  "data": {
    "overview": {
      "totalExams": 15,
      "averageScore": 78,
      "totalQuestions": 300,
      "correctAnswers": 234
    },
    "byCategory": {},
    "byDifficulty": {},
    "progressOverTime": [
      {
        "date": 1234567890000,
        "score": 75
      }
    ]
  }
}
```

---

## 🔍 Other Endpoints

### GET /spotdx/*

Mendapatkan Spot Diagnosis items.

**Response:**
```json
{
  "data": [
    {
      "id": "spotdx-id",
      "imageUrl": "https://...",
      "prompt": "Diagnosis?",
      "diagnosisOptions": [...],
      "correctDiagnosisIndex": 0,
      "explanation": "..."
    }
  ],
  "total": 10
}
```

### GET /microlearning/*

Mendapatkan Microlearning packs.

**Response:**
```json
{
  "data": [
    {
      "id": "micro-id",
      "title": "5-Minute EKG Basics",
      "description": "Quick review",
      "durationMinutes": 5,
      "items": [...]
    }
  ],
  "total": 5
}
```

### GET /vignettes/* atau /cases/*

Mendapatkan Case Vignettes.

**Response:**
```json
{
  "data": [
    {
      "id": "vignette-id",
      "title": "Chest Pain Case",
      "content": "Patient presentation...",
      "tabs": [
        {
          "label": "Lab",
          "content": [...]
        }
      ]
    }
  ],
  "total": 8
}
```

### POST /upload

Mock file upload.

**Request Body:**
```
FormData with 'file' field
```

**Response:**
```json
{
  "data": {
    "fileId": "file-1234567890",
    "url": "https://via.placeholder.com/300",
    "fileName": "uploaded-file.jpg",
    "size": 12345,
    "mimeType": "image/jpeg"
  }
}
```

---

## 💾 Data Storage

### localStorage Keys

Semua data demo disimpan di localStorage dengan prefix `demo_`:

- `demo_results` - Exam results
- `demo_exams` - Created exams
- `demo_flashcards` - Custom flashcards
- `demo_decks` - Custom flashcard decks
- `demo_osce_stations` - Created OSCE stations
- `demo_osce_attempts` - OSCE attempt history

### Session Management

- `demo_last_login_{email}` - Last login timestamp
- `demo_session_start_{email}` - Session start time
- `demo_session_expiry_{email}` - Session expiry time
- `demo_token_metadata` - Token information

### Clear All Demo Data

```typescript
// Clear demo database
demoAuthService.clearDemoDatabase();

// Clear all demo-related data
demoAuthService.clearAllDemoData();

// Reset specific user session
demoAuthService.resetSession('demo@sinaesta.com');
```

---

## 🔧 Advanced Usage

### Custom API Interceptor

```typescript
// Check if in demo mode
if (!demoAuthService.isBackendActive()) {
  // Make mock API call
  const response = await demoAuthService.mockBackendRequest(
    '/exams?specialty=Surgery',
    'GET'
  );
  console.log(response.data);
}
```

### Database Statistics

```typescript
// Get database stats
const stats = demoAuthService.getDemoDBStats();
console.log('Demo DB Stats:', stats);
// Output: { results: 5, exams: 2, flashcards: 10, ... }
```

### Debug Mode

```typescript
// Enable debug logging
demoAuthService.setDebugMode(true);

// All API calls will be logged
// [DemoAuth Debug] Mock API Request: GET /exams
```

### Bypass Permissions (Demo Only)

```typescript
// Bypass all permission checks (for testing)
demoAuthService.setBypassAllPermissions(true);

// Now demo accounts can access any endpoint
```

---

## 🚨 Error Handling

### Common Errors

1. **"Mock endpoint not found"**
   - Endpoint belum diimplement
   - Check available endpoints: `demoAuthService.getImplementedEndpoints()`

2. **"Not authenticated"**
   - User belum login
   - Token expired atau tidak valid

3. **"Demo account does not have access"**
   - Role tidak memiliki permission
   - Enable bypass: `demoAuthService.setBypassAllPermissions(true)`

### Error Response Format

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

---

## 📖 Integration dengan mockData.ts

Mock API secara otomatis menggunakan data generators dari `mockData.ts`:

- `generateExamsForSpecialty(specialty)` - Exam data by specialty
- `generateFlashcardDecks(specialty)` - Flashcard decks
- `generateOSCEStations(specialty)` - OSCE stations
- `generateSpotDxItems(specialty)` - Spot diagnosis items
- `generateMicrolearningPacks(specialty)` - Microlearning content
- `generateCaseVignettes(specialty)` - Case vignettes

Data akan disesuaikan dengan specialty user yang sedang login.

---

## 🎯 Best Practices

1. **Selalu cek mode sebelum API call**
   ```typescript
   if (demoAuthService.isBackendActive()) {
     // Use real API
   } else {
     // Use mock API
   }
   ```

2. **Handle missing endpoints gracefully**
   ```typescript
   try {
     const data = await demoAuthService.mockBackendRequest('/endpoint');
   } catch (error) {
     // Endpoint not implemented, use fallback
   }
   ```

3. **Clear demo data periodically**
   ```typescript
   // Clear old data when it grows too large
   const stats = demoAuthService.getDemoDBStats();
   if (stats.totalSize > 1000000) { // 1MB
     demoAuthService.clearDemoDatabase();
   }
   ```

4. **Use debug mode during development**
   ```typescript
   if (import.meta.env.DEV) {
     demoAuthService.setDebugMode(true);
   }
   ```

---

## 🔗 Related Documentation

- [DEMO_ACCOUNT_TROUBLESHOOTING.md](./DEMO_ACCOUNT_TROUBLESHOOTING.md) - Troubleshooting guide
- [DATA_BY_SPECIALTY.md](./DATA_BY_SPECIALTY.md) - Mock data structure
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - Real API documentation

---

## 📞 Support

Jika menemukan endpoint yang belum diimplement:

1. Check list endpoint: `demoAuthService.getImplementedEndpoints()`
2. Submit feature request dengan endpoint yang dibutuhkan
3. Sementara waktu, endpoint akan return empty data instead of error

---

**Last Updated:** January 2025  
**Version:** 1.0.0
