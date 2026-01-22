# Sinaesta Backend - Complete API System

Production-ready Node.js + Express + PostgreSQL backend for the Sinaesta medical exam platform.

## 🚀 Features

- **Authentication & Authorization**: JWT tokens with refresh token rotation
- **Role-Based Access Control (RBAC)**: 6 roles (SUPER_ADMIN, PROGRAM_ADMIN, MENTOR, REVIEWER, PROCTOR, STUDENT)
- **Database**: PostgreSQL with comprehensive schema for all entities
- **Security**: Bcrypt password hashing, rate limiting, input validation with Zod
- **API Endpoints**: Full CRUD for Exams, Questions, Results, Flashcards, OSCE, Users
- **File Upload**: Multi-provider storage (Local, S3, MinIO, Cloudflare R2)
- **Docker Support**: Docker Compose for easy local development

## 📋 Requirements

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

## 🔧 Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Database

**Option A: Using Docker Compose (Recommended)**

```bash
docker-compose up -d postgres
```

This will start PostgreSQL on port 5432 with credentials:
- Database: `sinaesta`
- User: `postgres`
- Password: `postgres`

**Option B: Local PostgreSQL**

Make sure PostgreSQL is installed and running, then update `.env` with your credentials.

### 3. Run Migrations

```bash
# Create database schema
psql -h localhost -U postgres -d sinaesta -f server/migrations/001_initial_schema.sql

# Insert seed data
psql -h localhost -U postgres -d sinaesta -f server/migrations/seed.sql
```

### 4. Configure Environment

The `.env` file should contain:

```env
# Server
PORT=3001
FRONTEND_URL=http://localhost:5173

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sinaesta
DB_USER=postgres
DB_PASSWORD=postgres

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production

# Storage
STORAGE_PROVIDER=local
```

### 5. Start the Server

```bash
# Development with auto-reload
npm run server:watch

# Or run both frontend and backend
npm run dev:all
```

The API will be available at `http://localhost:3001`

## 📚 API Documentation

### Base URL

```
http://localhost:3001/api
```

### Authentication Endpoints

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "STUDENT",
  "targetSpecialty": "Internal Medicine"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@sinaesta.com",
  "password": "admin123"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "admin@sinaesta.com",
      "name": "System Admin",
      "role": "SUPER_ADMIN"
    },
    "accessToken": "jwt-token",
    "refreshToken": "refresh-token"
  }
}
```

#### Refresh Token
```http
POST /api/auth/refresh
Authorization: Bearer <refresh-token>
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <access-token>
```

### User Endpoints

#### Get Current User
```http
GET /api/users/me
Authorization: Bearer <access-token>
```

#### Get User by ID
```http
GET /api/users/:id
Authorization: Bearer <access-token>
```

#### Update User
```http
PUT /api/users/:id
Authorization: Bearer <access-token>

{
  "name": "Updated Name",
  "avatar": "https://example.com/avatar.jpg",
  "targetSpecialty": "Cardiology"
}
```

#### List All Users (Admin only)
```http
GET /api/users?role=STUDENT&specialty=Internal Medicine&page=1&limit=50
Authorization: Bearer <access-token>
```

### Exam Endpoints

#### Get All Exams
```http
GET /api/exams?specialty=Cardiology&difficulty=Medium&page=1&limit=20
Authorization: Bearer <access-token>
```

#### Get Exam by ID
```http
GET /api/exams/:id
Authorization: Bearer <access-token>
```

#### Create Exam (Mentor+)
```http
POST /api/exams
Authorization: Bearer <access-token>

{
  "title": "Cardiovascular Assessment",
  "description": "Comprehensive cardiovascular exam",
  "durationMinutes": 60,
  "topic": "Cardiology",
  "difficulty": "Medium",
  "mode": "STANDARD"
}
```

#### Update Exam (Mentor+)
```http
PUT /api/exams/:id
Authorization: Bearer <access-token>

{
  "title": "Updated Title",
  "difficulty": "Hard"
}
```

#### Delete Exam (Mentor+)
```http
DELETE /api/exams/:id
Authorization: Bearer <access-token>
```

#### Add Question to Exam (Mentor+)
```http
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
  "explanation": "CAD is the most common cause",
  "type": "MCQ",
  "difficulty": "Medium"
}
```

#### Submit Exam Results
```http
POST /api/exams/:id/submit
Authorization: Bearer <access-token>

{
  "answers": [0, 1, 2, 3],
  "auditLog": [
    {
      "timestamp": 1234567890,
      "event": "EXAM_STARTED"
    }
  ]
}
```

#### Get Exam Results
```http
GET /api/exams/:id/results?userId=uuid
Authorization: Bearer <access-token>
```

### Flashcard Endpoints

#### Get All Flashcards
```http
GET /api/flashcards?category=Cardiology&mastered=false
Authorization: Bearer <access-token>
```

#### Create Flashcard
```http
POST /api/flashcards
Authorization: Bearer <access-token>

{
  "front": "What are the stages of heart failure?",
  "back": "Stage A, B, C, D...",
  "category": "Cardiology"
}
```

#### Update Flashcard
```http
PUT /api/flashcards/:id
Authorization: Bearer <access-token>

{
  "mastered": true
}
```

#### Delete Flashcard
```http
DELETE /api/flashcards/:id
Authorization: Bearer <access-token>
```

#### Get Flashcard Decks
```http
GET /api/flashcards/decks/all
Authorization: Bearer <access-token>
```

### OSCE Endpoints

#### Get All OSCE Stations
```http
GET /api/osce/stations
Authorization: Bearer <access-token>
```

#### Get OSCE Station
```http
GET /api/osce/stations/:id
Authorization: Bearer <access-token>
```

#### Create OSCE Station (Mentor+)
```http
POST /api/osce/stations
Authorization: Bearer <access-token>

{
  "title": "Cardiovascular Examination",
  "scenario": "45-year-old male with chest pain...",
  "instruction": "Perform a focused cardiovascular examination",
  "durationMinutes": 15,
  "checklist": [
    {
      "item": "Inspection of chest",
      "points": 2,
      "category": "Physical Exam"
    }
  ]
}
```

#### Submit OSCE Attempt
```http
POST /api/osce/attempts
Authorization: Bearer <access-token>

{
  "stationId": "uuid",
  "performance": [
    {
      "item": "Inspection of chest",
      "points": 2,
      "category": "Physical Exam"
    }
  ]
}
```

#### Get OSCE Attempts
```http
GET /api/osce/attempts?stationId=uuid
Authorization: Bearer <access-token>
```

### Result Endpoints

#### Get My Results
```http
GET /api/results/my-results
Authorization: Bearer <access-token>
```

#### Get Result by ID
```http
GET /api/results/:id
Authorization: Bearer <access-token>
```

#### Get All Results (Mentor+)
```http
GET /api/results?userId=uuid&examId=uuid
Authorization: Bearer <access-token>
```

#### Get Result Statistics (Mentor+)
```http
GET /api/results/stats/overview?examId=uuid&specialty=Cardiology
Authorization: Bearer <access-token>
```

## 🔐 Security Features

### Password Hashing
- All passwords are hashed using bcrypt with 10 salt rounds
- Never store plain text passwords

### JWT Authentication
- Access tokens expire in 15 minutes
- Refresh tokens expire in 7 days
- Automatic token refresh on expiry
- Revoked tokens are stored in database

### Rate Limiting
- 50 requests per 15 minutes for general API
- 10 requests per hour for bulk operations
- 100 requests per 5 minutes for presigned URLs

### Input Validation
- All inputs validated using Zod schemas
- Type-safe request/response handling
- SQL injection prevention via parameterized queries

### Role-Based Access Control
- SUPER_ADMIN: Full access to all resources
- PROGRAM_ADMIN: Manage users, create exams, view analytics
- MENTOR: Create exams, grade OSCE, view analytics
- REVIEWER: Grade OSCE
- PROCTOR: Proctor exams
- STUDENT: Take exams, view own results

## 📊 Database Schema

### Core Tables

**users**: User accounts with role and profile information
**exams**: Exam definitions with metadata
**questions**: Individual questions linked to exams
**exam_results**: User exam submissions and scores
**flashcards**: User flashcards for study
**osce_stations**: OSCE examination stations
**osce_attempts**: User OSCE performance records
**refresh_tokens**: JWT refresh token storage

### Supporting Tables

**cohorts**: Student cohorts/batches
**blueprints**: Exam blueprints with topic/domain distribution
**case_vignettes**: Shared case scenarios for questions
**logbook_entries**: Clinical experience logs
**discussion_threads**: Case discussions
**guidelines**: Medical guideline references
**infographics**: Educational content
**mentor_sessions**: Mentor booking system
**competency_targets**: Competency tracking

## 🧪 Testing

### Health Check
```bash
curl http://localhost:3001/health
```

### Test Authentication
```bash
# Register
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123","name":"Test User","role":"STUDENT"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'
```

## 🐳 Docker Commands

### Start All Services
```bash
docker-compose up -d
```

### Stop All Services
```bash
docker-compose down
```

### View Logs
```bash
docker-compose logs -f app
```

### Run Migrations in Docker
```bash
docker-compose exec postgres psql -U postgres -d sinaesta -f /docker-entrypoint-initdb.d/001_initial_schema.sql
```

## 📝 Default Credentials

After running seed data:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@sinaesta.com | admin123 |
| Mentor | mentor1@sinaesta.com | admin123 |
| Mentor | mentor2@sinaesta.com | admin123 |
| Student | student1@sinaesta.com | admin123 |

## 🔧 Configuration

### JWT Secrets

Change these in production:
```env
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
```

### Database Connection

Update for your environment:
```env
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=sinaesta
DB_USER=your-db-user
DB_PASSWORD=your-db-password
```

### Storage Providers

Configure cloud storage in `.env`:
```env
# For AWS S3
STORAGE_PROVIDER=s3
AWS_REGION=us-east-1
S3_BUCKET=sinaesta-uploads
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret

# For MinIO
STORAGE_PROVIDER=minio
S3_ENDPOINT=http://localhost:9000
S3_BUCKET=sinaesta-uploads
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin

# For Cloudflare R2
STORAGE_PROVIDER=cloudflare-r2
S3_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
S3_BUCKET=sinaesta-uploads
AWS_ACCESS_KEY_ID=your-r2-key
AWS_SECRET_ACCESS_KEY=your-r2-secret
```

## 📦 Project Structure

```
server/
├── config/
│   └── database.ts          # PostgreSQL connection
├── middleware/
│   ├── auth.ts             # JWT authentication & RBAC
│   └── rateLimiter.ts     # Rate limiting
├── migrations/
│   ├── 001_initial_schema.sql  # Database schema
│   └── seed.sql               # Sample data
├── routes/
│   ├── auth.ts             # Auth endpoints
│   ├── users.ts            # User CRUD
│   ├── exams.ts            # Exam & questions
│   ├── flashcards.ts       # Flashcard CRUD
│   ├── osce.ts            # OSCE stations & attempts
│   ├── results.ts          # Exam results & analytics
│   └── upload.ts          # File upload endpoints
├── services/
│   ├── authService.ts       # Auth logic
│   └── storageService.ts   # File storage abstraction
├── validations/
│   ├── authValidation.ts   # Zod schemas for auth
│   └── examValidation.ts  # Zod schemas for exams
└── index.ts               # Express app setup
```

## 🚦 Error Handling

All API responses follow this format:

**Success:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error message"
}
```

**Validation Error:**
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

## 🔄 Token Management

The API uses token rotation for enhanced security:

1. User logs in → receives access token (15min) + refresh token (7 days)
2. Access token used for API requests
3. When access token expires → client calls `/api/auth/refresh`
4. New access token issued if refresh token is valid
5. Logout → refresh token deleted from database

## 📈 Monitoring

### Health Check Endpoint
```bash
GET /health
```

Returns:
```json
{
  "status": "ok",
  "timestamp": 1234567890,
  "database": "connected"
}
```

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

This project is part of the Sinaesta platform.

## 🆘 Support

For issues or questions, please contact the development team.
