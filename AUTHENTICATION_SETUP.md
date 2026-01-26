# 🚀 SINAESTA - Aktivasi Fitur Pendaftaran & Login

## 📋 Ringkasan

Dokumen ini menjelaskan cara mengaktifkan fitur pendaftaran dan login secara lengkap di platform SINAESTA.

---

## ✅ Status Komponen

### Frontend Components (100% Lengkap)
| Komponen | Status | Lokasi |
|----------|--------|--------|
| Landing Page | ✅ Siap | `components/LandingPage.tsx` |
| Register Form | ✅ Siap | `components/auth/RegisterForm.tsx` |
| Login Form | ✅ Siap | `components/auth/LoginForm.tsx` |
| Auth Router | ✅ Siap | `components/auth/LoginRouter.tsx` |
| Auth Context | ✅ Siap | `context/AuthContext.tsx` |
| API Service | ✅ Siap | `services/apiService.ts` |
| Demo Auth Service | ✅ Siap | `services/demoAuthService.ts` |

### Backend Components (100% Lengkap)
| Komponen | Status | Lokasi |
|----------|--------|--------|
| Express Server | ✅ Siap | `server/index.ts` |
| Auth Routes | ✅ Siap | `server/routes/auth.ts` |
| Database Schema | ✅ Siap | `server/migrations/001_initial_schema.sql` |
| Seed Data | ✅ Siap | `server/migrations/seed.sql` |

---

## 🔧 Cara Mengaktifkan Fitur

### Metode 1: Menggunakan Backend Real (Rekomendasi untuk Production)

**Prasyarat:**
- PostgreSQL harus berjalan di localhost:5432 (atau server yang dapat diakses)
- Database credentials sudah dikonfigurasi di `.env` file

**Langkah-langkah:**

1. **Cek Konfigurasi Database (.env)**
   ```bash
   # Pastikan konfigurasi berikut sudah benar:
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=sinaesta
   DB_USER=postgres
   DB_PASSWORD=postgres
   ```

2. **Jalankan Setup Database**
   ```bash
   npm run db:setup
   ```

   Perintah ini akan:
   - Membuat database `sinaesta`
   - Menjalankan semua migration files
   - Mengisi data awal (seed) termasuk akun demo

3. **Jalankan Backend Server**
   ```bash
   # Terminal 1: Jalankan backend
   npm run server:watch

   # Terminal 2: Jalankan frontend
   npm run dev
   ```

   Atau gunakan satu perintah untuk keduanya:
   ```bash
   npm run dev:all
   ```

4. **Aktifkan Mode Backend**
   - Buka aplikasi di browser: `http://localhost:5173`
   - Pastikan tombol "Backend: ON" terlihat di footer (hijau)
   - Jika menampilkan "Demo Mode", klik untuk mengaktifkan backend

5. **Uji Fitur Pendaftaran**
   - Klik tombol "Daftar Sekarang" di Landing Page
   - Isi form pendaftaran (nama, email, password, specialty, dll)
   - Submit - user akan disimpan ke database

6. **Uji Fitur Login**
   - Klik tombol "Masuk"
   - Login dengan akun yang baru didaftarkan
   - Atau gunakan akun demo:
     - `demo@sinaesta.com` / `demo123`
     - `admin@sinaesta.com` / `admin123`

---

### Metode 2: Menggunakan Demo Mode (Tanpa Database)

**Kelebihan:**
- Tidak membutuhkan PostgreSQL
- Tidak perlu setup database
- Data tersimpan di localStorage browser

**Kekurangan:**
- Data hanya tersimpan di browser (tidak persisten antar-device)
- Tidak ada email verification
- Hanya untuk demonstrasi

**Cara Menggunakan:**

1. **Pastikan Mode Demo Aktif**
   - Buka aplikasi di browser
   - Cek tombol di footer - harus menampilkan "Demo Mode" (oranye)

2. **Jalankan Frontend Saja**
   ```bash
   npm run dev
   ```

3. **Fitur yang Tersedia:**
   - Pendaftaran (data ke localStorage)
   - Login dengan akun demo
   - Semua fitur frontend berfungsi normal

4. **Akun Demo yang Tersedia:**

   | Email | Password | Role | Specialty |
   |-------|----------|------|-----------|
   | demo@sinaesta.com | demo123 | STUDENT | Internal Medicine |
   | admin@sinaesta.com | admin123 | SUPER_ADMIN | Internal Medicine |
   | student1@sinaesta.com | admin123 | STUDENT | Internal Medicine |
   | mentor1@sinaesta.com | admin123 | TEACHER | Internal Medicine |
   | surgery@sinaesta.com | demo123 | STUDENT | Surgery |
   | pediatrics@sinaesta.com | demo123 | STUDENT | Pediatrics |
   | obgyn@sinaesta.com | demo123 | STUDENT | Obgyn |
   | cardiology@sinaesta.com | demo123 | STUDENT | Cardiology |

---

## 🔄 Flow Autentikasi

### Flow Pendaftaran (Register)

```
User klik "Daftar Sekarang"
    ↓
Buka Register Form (components/auth/RegisterForm.tsx)
    ↓
User isi form (nama, email, password, specialty, institution)
    ↓
User submit form
    ↓
RegisterForm.handleRegister()
    ↓
AuthContext.register()
    ↓
authService.register()
    ↓
[Mode Backend] apiService.register() → POST /api/auth/register
    ↓
[Mode Demo] demoAuthService.register()
    ↓
Backend Validasi & Simpan ke Database
    ↓
Return: { user, accessToken, refreshToken }
    ↓
Redirect ke Dashboard
```

### Flow Login

```
User klik "Masuk"
    ↓
Buka Login Form (components/auth/LoginForm.tsx)
    ↓
User masukkan email & password
    ↓
User submit
    ↓
LoginForm.handleLogin()
    ↓
AuthContext.login()
    ↓
authService.login()
    ↓
Cek: Akun demo atau user real?
    ├─ [Demo] → demoAuthService.tryDemoLogin()
    └─ [Real] → apiService.login() → POST /api/auth/login
    ↓
Backend Validasi Password
    ↓
Generate JWT Tokens (access + refresh)
    ↓
Set tokens di localStorage & cookies
    ↓
Return: { user, accessToken, refreshToken }
    ↓
Redirect ke Dashboard
```

---

## 📊 API Endpoints

### Autentikasi

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/auth/register` | Pendaftaran user baru |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Logout user |
| POST | `/api/auth/verify-email` | Verifikasi email |
| POST | `/api/auth/forgot-password` | Request reset password |
| POST | `/api/auth/reset-password` | Reset password |

### Request/Response Examples

**Register:**
```json
POST /api/auth/register
{
  "name": "Dr. John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "targetSpecialty": "Internal Medicine",
  "institution": "RS Umum Jakarta",
  "strNumber": "1234567890"
}

Response 201:
{
  "success": true,
  "data": {
    "user": {
      "id": "user-uuid",
      "name": "Dr. John Doe",
      "email": "john@example.com",
      "role": "STUDENT",
      "status": "PENDING_VERIFICATION",
      "targetSpecialty": "Internal Medicine"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh-token-value"
  }
}
```

**Login:**
```json
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "securepassword123",
  "rememberMe": true
}

Response 200:
{
  "success": true,
  "data": {
    "user": { ... },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh-token-value"
  }
}
```

---

## 🎯 Fitur Autentikasi yang Tersedia

### ✅ Fitur Login
- [x] Login dengan email dan password
- [x] Validasi password dengan bcrypt
- [x] JWT token generation
- [x] Refresh token dengan rotation
- [x] "Remember me" functionality
- [x] Rate limiting (mencegah brute force)
- [x] Demo account selector

### ✅ Fitur Pendaftaran
- [x] Form pendaftaran lengkap
- [x] Validasi input (email, password strength)
- [x] Pilihan specialty/program studi
- [x] Input institution/university
- [x] Input STR number (optional)
- [x] Auto-generate avatar dengan UI Avatars

### ✅ Fitur Keamanan
- [x] Password hashing dengan bcrypt
- [x] JWT token authentication
- [x] Refresh token rotation
- [x] HttpOnly cookies untuk refresh token
- [x] Rate limiting pada login
- [x] CORS configuration
- [x] Helmet security headers

### ✅ Fitur Tambahan
- [x] Email verification (dengan email service)
- [x] Forgot password flow
- [x] Reset password dengan token
- [x] Demo account restrictions
- [x] Backend/Demo mode toggle

---

## 🐛 Troubleshooting

### Masalah: Backend tidak bisa connect

**Error:** `ECONNREFUSED 127.0.0.1:5432`

**Solusi:**
1. Pastikan PostgreSQL berjalan:
   ```bash
   # Linux/Mac
   sudo service postgresql start

   # Windows
   # Buka Services dan start PostgreSQL
   ```

2. Cek konfigurasi di `.env`:
   ```bash
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=postgres
   ```

3. Test koneksi manual:
   ```bash
   psql -h localhost -U postgres -d postgres
   ```

### Masalah: Migrasi gagal

**Error:** `relation already exists` atau `duplicate key`

**Solusi:**
1. Drop dan recreate database:
   ```bash
   npm run db:setup
   ```

   Script ini akan:
   - Drop database jika ada
   - Create database baru
   - Jalankan semua migrasi
   - Seed data awal

### Masalah: Backend tidak berjalan

**Error:** `Error: Cannot find module 'express'`

**Solusi:**
```bash
npm install
```

### Masalah: Frontend tidak bisa connect ke backend

**Error:** `Network Error` atau `CORS error`

**Solusi:**
1. Pastikan backend berjalan: cek terminal yang menjalankan `npm run server:watch`
2. Pastikan frontend URL sudah benar di `.env`:
   ```bash
   FRONTEND_URL=http://localhost:5173
   ```
3. Pastikan API URL sudah benar:
   ```bash
   # Di frontend .env
   VITE_API_URL=http://localhost:3001/api
   ```

### Masalah: Login selalu menggunakan demo mode

**Masalah:** Toggle menunjukkan "Demo Mode" meskipun backend aktif

**Solusi:**
1. Cek localStorage di browser:
   ```javascript
   localStorage.getItem('backendEnabled')
   ```
2. Set ke 'true' jika perlu:
   ```javascript
   localStorage.setItem('backendEnabled', 'true')
   ```
3. Refresh halaman

---

## 📝 Catatan Penting

### Mode Demo vs Backend Real

| Fitur | Demo Mode | Backend Real |
|-------|-----------|--------------|
| Database | localStorage | PostgreSQL |
| Persistence | Browser only | Server |
| Email Verification | ✗ | ✓ |
| Multi-device support | ✗ | ✓ |
| Production ready | ✗ | ✓ |
| Development speed | ✓ | ✗ |

### Kapan Menggunakan Demo Mode?
- Ketika PostgreSQL belum tersedia
- Untuk quick testing tanpa setup database
- Untuk demo/presentation
- Development awal sebelum backend siap

### Kapan Menggunakan Backend Real?
- Untuk production deployment
- Untuk testing email verification
- Untuk multi-user testing
- Untuk development fitur yang butuh persistensi

---

## 🚀 Quick Start Command

```bash
# Setup database (jika menggunakan backend real)
npm run db:setup

# Jalankan backend dan frontend bersamaan
npm run dev:all

# Atau jalankan terpisah:
# Terminal 1
npm run server:watch

# Terminal 2
npm run dev

# Buka browser
# http://localhost:5173
```

---

## 📚 Referensi Tambahan

- [API Documentation](./API_DOCUMENTATION.md)
- [Backend Quickstart](./BACKEND_QUICKSTART.md)
- [Security Fix Report](./SECURITY_FIX_REPORT.md)
- [User Workflow](./USER_WORKFLOW.md)

---

## ✨ Status: Siap Digunakan!

✅ **Frontend Components**: 100% Complete
✅ **Backend Components**: 100% Complete
✅ **Database Schema**: Ready
✅ **Auth Service**: Ready
✅ **Demo Mode**: Active by default (ready for testing)
⚠️ **Backend Mode**: Requires PostgreSQL setup

**Fitur pendaftaran dan login SUDAH LENGKAP dan SIAP DIGUNAKAN!** 🎉

Untuk menggunakan dengan backend real, jalankan: `npm run db:setup && npm run dev:all`

Untuk demo tanpa database, cukup: `npm run dev`
