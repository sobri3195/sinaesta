# Sinaesta Quick Start Guide

## 🚀 Getting Started with the Complete Backend System

This guide will help you set up and run the Sinaesta backend with PostgreSQL, authentication, and all API endpoints.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL 14+ (or Docker)
- npm or yarn

## Option 1: Quick Setup with Docker (Recommended)

### 1. Start PostgreSQL

```bash
docker-compose up -d postgres
```

This starts PostgreSQL on port 5432 with:
- Database: `sinaesta`
- User: `postgres`
- Password: `postgres`

### 2. Set Up Database

```bash
npm run db:setup
```

This will:
- Create all database tables
- Insert sample data
- Set up indexes and triggers

### 3. Start the Server

```bash
npm run dev:all
```

This starts both:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## Option 2: Manual Setup

### 1. Start PostgreSQL

If using local PostgreSQL:

```bash
# Start PostgreSQL service
sudo service postgresql start

# Create database
createdb -U postgres sinaesta
```

### 2. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` if needed (default values should work for local development).

### 3. Run Migrations

```bash
# Create schema
npm run db:migrate

# Insert seed data
npm run db:seed
```

### 4. Start Server

```bash
# Backend only
npm run server:watch

# Or both frontend and backend
npm run dev:all
```

## 🧪 Test the API

### 1. Check Health

```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": 1234567890,
  "database": "connected"
}
```

### 2. Register a User

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "password": "password123",
    "name": "Test User",
    "role": "STUDENT",
    "targetSpecialty": "Internal Medicine"
  }'
```

### 3. Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@sinaesta.com",
    "password": "admin123"
  }'
```

Save the `accessToken` from the response for subsequent requests.

### 4. Get Exams

```bash
curl http://localhost:3001/api/exams \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 📋 Default Credentials

After running seed data, use these credentials to log in:

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| Admin | admin@sinaesta.com | admin123 | Full system access |
| Mentor 1 | mentor1@sinaesta.com | admin123 | Create exams, grade OSCE |
| Mentor 2 | mentor2@sinaesta.com | admin123 | Create exams, grade OSCE |
| Student | student1@sinaesta.com | admin123 | Take exams, view results |

## 📚 API Endpoint Summary

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get tokens
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout and invalidate tokens

### Users
- `GET /api/users/me` - Get current user profile
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user profile
- `GET /api/users` - List all users (admin only)

### Exams
- `GET /api/exams` - List all exams
- `GET /api/exams/:id` - Get exam with questions
- `POST /api/exams` - Create new exam (mentor+)
- `PUT /api/exams/:id` - Update exam (mentor+)
- `DELETE /api/exams/:id` - Delete exam (mentor+)
- `POST /api/exams/:id/questions` - Add question to exam (mentor+)
- `POST /api/exams/:id/submit` - Submit exam answers
- `GET /api/exams/:id/results` - Get exam results

### Flashcards
- `GET /api/flashcards` - List flashcards
- `POST /api/flashcards` - Create flashcard
- `PUT /api/flashcards/:id` - Update flashcard
- `DELETE /api/flashcards/:id` - Delete flashcard
- `GET /api/flashcards/decks/all` - List flashcard decks
- `POST /api/flashcards/decks` - Create flashcard deck

### OSCE
- `GET /api/osce/stations` - List OSCE stations
- `GET /api/osce/stations/:id` - Get OSCE station details
- `POST /api/osce/stations` - Create OSCE station (mentor+)
- `PUT /api/osce/stations/:id` - Update OSCE station (mentor+)
- `DELETE /api/osce/stations/:id` - Delete OSCE station (mentor+)
- `POST /api/osce/attempts` - Submit OSCE attempt
- `GET /api/osce/attempts` - List OSCE attempts
- `GET /api/osce/attempts/:id` - Get OSCE attempt details

### Results
- `GET /api/results/my-results` - Get my exam results
- `GET /api/results/:id` - Get result details
- `GET /api/results` - List all results (mentor+)
- `GET /api/results/stats/overview` - Get result statistics (mentor+)

## 🔧 Common Tasks

### Reset Database

```bash
# Drop and recreate database
dropdb -U postgres sinaesta
createdb -U postgres sinaesta

# Run migrations
npm run db:setup
```

### View Logs

```bash
# Server logs (if running with docker-compose)
docker-compose logs -f app

# Or if running locally, logs are in terminal
```

### Connect to Database

```bash
psql -h localhost -U postgres -d sinaesta
```

### Backup Database

```bash
pg_dump -h localhost -U postgres sinaesta > backup.sql
```

### Restore Database

```bash
psql -h localhost -U postgres sinaesta < backup.sql
```

## 🐛 Troubleshooting

### PostgreSQL Connection Failed

**Problem**: `ECONNREFUSED` when connecting to database

**Solution**: 
- Make sure PostgreSQL is running: `docker-compose ps`
- Check port is available: `netstat -an | grep 5432`
- Verify credentials in `.env`

### Database Doesn't Exist

**Problem**: `database "sinaesta" does not exist`

**Solution**:
```bash
createdb -U postgres sinaesta
```

### Port Already in Use

**Problem**: `EADDRINUSE: address already in use :::3001`

**Solution**:
- Kill process on port 3001: `lsof -ti:3001 | xargs kill`
- Or change PORT in `.env`

### JWT Verification Failed

**Problem**: `Invalid token` errors

**Solution**:
- Make sure `JWT_SECRET` is set in `.env`
- Tokens expire after 15 minutes (use refresh endpoint)
- Clear localStorage and re-login

## 📚 Next Steps

1. **Read the API Documentation**: See `BACKEND_README.md` for detailed API reference
2. **Frontend Integration**: Use `services/apiService.ts` to call the backend
3. **Customize Database**: Modify `server/migrations/001_initial_schema.sql`
4. **Add More Features**: Extend the backend with new routes and services

## 🔒 Security Notes

For production deployment:

1. **Change JWT Secrets**
   ```bash
   # Generate secure random strings
   openssl rand -base64 32
   ```
   Update `JWT_SECRET` and `JWT_REFRESH_SECRET` in `.env`

2. **Use Strong Database Passwords**
   Change `DB_PASSWORD` in `.env`

3. **Enable HTTPS**
   Use reverse proxy (nginx, Traefik) with SSL certificates

4. **Set Up Proper CORS**
   Update `FRONTEND_URL` to production domain

5. **Use Production Database**
   Use managed PostgreSQL (AWS RDS, Google Cloud SQL, etc.)

6. **Configure Rate Limiting**
   Adjust limits in `server/middleware/rateLimiter.ts`

## 📖 Additional Resources

- [Backend README](./BACKEND_README.md) - Complete backend documentation
- [File Upload README](./FILE_UPLOAD_README.md) - File upload system guide
- [Quick Start](./QUICK_START.md) - Frontend quick start guide

## 💬 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review error logs in the terminal
3. Consult the backend documentation
4. Contact the development team
