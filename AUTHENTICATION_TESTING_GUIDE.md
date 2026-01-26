# 🧪 Panduan Testing Fitur Autentikasi SINAESTA

## 📋 Checklist Testing

### 1. Testing Mode Demo (Tanpa Database)

#### ✅ Pendaftaran User Baru (Demo Mode)
- [ ] Buka aplikasi: `http://localhost:5173`
- [ ] Pastikan tombol "Demo Mode" terlihat di footer
- [ ] Klik tombol "Daftar Sekarang"
- [ ] Form register terbuka dengan field:
  - [ ] Full Name
  - [ ] Email Address
  - [ ] Password
  - [ ] Confirm Password
  - [ ] Institution
  - [ ] Target Specialty
  - [ ] STR Number (Optional)
- [ ] Isi semua field required
- [ ] Pilih specialty dari dropdown
- [ ] Klik "Create Account"
- [ ] Berhasil mendaftar dan redirect ke dashboard
- [ ] User baru tersimpan di localStorage

#### ✅ Login dengan Akun Demo
- [ ] Klik tombol "Masuk"
- [ ] Form login terbuka dengan field:
  - [ ] Email Address
  - [ ] Password
  - [ ] Remember me checkbox
  - [ ] Forgot password link
- [ ] Masukkan: `demo@sinaesta.com`
- [ ] Password: `demo123`
- [ ] Klik "Masuk dengan Akun Demo"
- [ ] Berhasil login dan redirect ke dashboard
- [ ] User role: STUDENT
- [ ] Target specialty: Internal Medicine

#### ✅ Pilih Akun Demo Lainnya
- [ ] Di login form, klik "Pilih Akun Demo Lainnya"
- [ ] Modal demo account selector terbuka
- [ ] Daftar akun demo ditampilkan:
  - [ ] demo@sinaesta.com (Student - Internal Medicine)
  - [ ] admin@sinaesta.com (Super Admin)
  - [ ] student1@sinaesta.com (Student)
  - [ ] mentor1@sinaesta.com (Teacher)
  - [ ] surgery@sinaesta.com (Student - Surgery)
  - [ ] pediatrics@sinaesta.com (Student - Pediatrics)
  - [ ] obgyn@sinaesta.com (Student - Obgyn)
  - [ ] cardiology@sinaesta.com (Student - Cardiology)
- [ ] Klik salah satu akun
- [ ] Login otomatis dengan akun yang dipilih
- [ ] Redirect ke dashboard sesuai role

#### ✅ Logout
- [ ] Pastikan sudah login
- [ ] Klik tombol logout di sidebar
- [ ] Konfirmasi logout
- [ ] Redirect ke landing page
- [ ] Token dihapus dari localStorage

---

### 2. Testing Mode Backend (Dengan Database)

#### Prasyarat
- [ ] PostgreSQL berjalan di localhost:5432
- [ ] Database setup sudah dijalankan: `npm run db:setup`
- [ ] Backend server berjalan: `npm run server:watch`
- [ ] Tombol "Backend: ON" terlihat (hijau) di footer

#### ✅ Pendaftaran User Baru (Backend Mode)
- [ ] Buka aplikasi: `http://localhost:5173`
- [ ] Klik tombol "Daftar Sekarang"
- [ ] Isi form register dengan data valid:
  ```
  Name: Dr. Test User
  Email: testuser@example.com
  Password: SecurePass123
  Institution: RS Test Indonesia
  Target Specialty: Internal Medicine
  STR Number: 9876543210
  ```
- [ ] Klik "Create Account"
- [ ] Loading spinner muncul
- [ ] Request: POST /api/auth/register
- [ ] Response: 201 Created
- [ ] User berhasil dibuat di database
- [ ] Access token diterima
- [ ] Refresh token di-set di cookie
- [ ] Redirect ke dashboard

#### ✅ Verifikasi User di Database
- [ ] Buka PostgreSQL atau psql:
  ```bash
  psql -h localhost -U postgres -d sinaesta
  ```
- [ ] Jalankan query:
  ```sql
  SELECT id, name, email, role, status, "targetSpecialty"
  FROM users
  WHERE email = 'testuser@example.com';
  ```
- [ ] Hasil: User ditemukan dengan data yang sesuai
- [ ] Status: PENDING_VERIFICATION

#### ✅ Login dengan User yang Baru Didaftarkan
- [ ] Logout jika sedang login
- [ ] Klik "Masuk"
- [ ] Masukkan email dan password user yang baru dibuat
- [ ] Klik "Sign In"
- [ ] Request: POST /api/auth/login
- [ ] Response: 200 OK
- [ ] Access token diterima
- [ ] User berhasil login
- [ ] Redirect ke dashboard
- [ ] Profile user ditampilkan dengan benar

#### ✅ Login dengan Akun Demo (Backend Mode)
- [ ] Logout
- [ ] Login dengan: `demo@sinaesta.com` / `demo123`
- [ ] Request: POST /api/auth/login
- [ ] Response: 200 OK
- [ ] User berhasil login
- [ ] Role: STUDENT

#### ✅ Refresh Token
- [ ] Pastikan sudah login
- [ ] Buka DevTools → Application → Cookies
- [ ] Pastikan `refreshToken` cookie ada
- [ ] Tunggu beberapa menit atau refresh page
- [ ] Access token otomatis di-refresh
- [ ] Request: POST /api/auth/refresh
- [ ] New access token diterima

#### ✅ Logout
- [ ] Pastikan sudah login
- [ ] Klik tombol logout
- [ ] Request: POST /api/auth/logout
- [ ] Refresh token di-invalidate di database
- [ ] Cookie dihapus
- [ ] LocalStorage dibersihkan
- [ ] Redirect ke landing page

---

### 3. Testing Validasi Form

#### ✅ Validasi Pendaftaran
- [ ] Coba submit tanpa mengisi field
- [ ] Error: "Please fill in all fields"
- [ ] Coba dengan email invalid: `invalidemail`
- [ ] Error: Validasi email gagal
- [ ] Coba dengan password < 8 karakter
- [ ] Error: "Password must be at least 8 characters"
- [ ] Coba dengan password dan confirm tidak match
- [ ] Error: "Passwords do not match"
- [ ] Coba dengan email yang sudah terdaftar
- [ ] Error: "Email already registered"

#### ✅ Validasi Login
- [ ] Coba login tanpa email
- [ ] Error: "Please fill in all fields"
- [ ] Coba login dengan email salah
- [ ] Error: "Invalid credentials"
- [ ] Coba login dengan password salah
- [ ] Error: "Invalid credentials"

---

### 4. Testing Fitur Tambahan

#### ✅ Forgot Password (Jika Email Service Aktif)
- [ ] Di login form, klik "Forgot password?"
- [ ] Buka forgot password form
- [ ] Masukkan email yang terdaftar
- [ ] Klik "Send reset link"
- [ ] Request: POST /api/auth/forgot-password
- [ ] Response: "Password reset email sent if account exists"
- [ ] Email dikirim (cek log atau sandbox)

#### ✅ Reset Password (Jika Email Service Aktif)
- [ ] Buka email reset password
- [ ] Copy reset token
- [ ] Klik link reset password
- [ ] Buka reset password form
- [ ] Masukkan password baru
- [ ] Klik "Reset password"
- [ ] Request: POST /api/auth/reset-password
- [ ] Response: "Password reset successfully"
- [ ] Login dengan password baru berhasil

#### ✅ Email Verification (Jika Email Service Aktif)
- [ ] Setelah register, cek localStorage
- [ ] User status: PENDING_VERIFICATION
- [ ] Buka email verifikasi
- [ ] Copy verification token
- [ ] Akses: /verify-email?token=TOKEN
- [ ] Request: POST /api/auth/verify-email
- [ ] Response: "Email verified successfully"
- [ ] User status berubah: VERIFIED

---

### 5. Testing Security

#### ✅ Password Hashing
- [ ] Cek database untuk user yang baru dibuat
- [ ] Password TIDAK dalam plain text
- [ ] Password dalam format bcrypt hash:
  ```
  $2b$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  ```

#### ✅ JWT Token
- [ ] Setelah login, cek localStorage
- [ ] `accessToken` ada dan dalam format JWT:
  ```
  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```
- [ ] Decode token untuk verifikasi:
  ```bash
  # Copy token dan decode di: https://jwt.io
  ```
- [ ] Payload berisi:
  - [ ] `sub`: user ID
  - [ ] `email`: user email
  - [ ] `role`: user role
  - [ ] `iat`: issued at timestamp
  - [ ] `exp`: expiration timestamp

#### ✅ Rate Limiting
- [ ] Coba login dengan password salah berulang kali (>5)
- [ ] Request ke-6: 429 Too Many Requests
- [ ] Error: "Too many requests, please try again later"

#### ✅ Session Management
- [ ] Login dengan "Remember me" dicentang
- [ ] Refresh browser
- [ ] User tetap login (session persist)
- [ ] Logout
- [ ] Refresh browser
- [ ] User ter-logout (session cleared)

---

### 6. Testing Demo Account Restrictions

#### ✅ Role Restriction
- [ ] Login dengan `demo@sinaesta.com` (STUDENT)
- [ ] Coba akses halaman admin (jika ada link)
- [ ] Akses ditolak (atau tidak ada link)
- [ ] Login dengan `admin@sinaesta.com` (SUPER_ADMIN)
- [ ] Akses admin dashboard berhasil

#### ✅ Session Duration Limit
- [ ] Login dengan `demo@sinaesta.com`
- [ ] Catat waktu login
- [ ] Coba login lagi dengan akun yang sama < 30 menit
- [ ] Error: "Demo session limit reached. Please wait X minutes"

---

## 📊 Scenarios Testing

### Scenario 1: User Flow Baru
1. User baru mengakses website
2. Melihat landing page dengan tombol "Daftar Sekarang"
3. Klik "Daftar Sekarang"
4. Isi form pendaftaran
5. Submit dan berhasil mendaftar
6. Otomatis login dan redirect ke dashboard
7. Melihat welcome message
8. Mulai menggunakan fitur (exam, flashcard, dll)
9. Logout setelah selesai
10. Login kembali dengan credentials yang sama

### Scenario 2: Returning User
1. User kembali ke website
2. Klik "Masuk"
3. Masukkan email dan password
4. Login berhasil
5. Data sebelumnya tersedia (exam history, flashcard decks)
6. Melanjutkan belajar
7. Logout

### Scenario 3: Demo User Exploration
1. User baru ingin mencoba demo
2. Klik "Lihat Demo" di landing page
3. Atau klik "Masuk" → "Pilih Akun Demo Lainnya"
4. Memilih akun demo sesuai spesialisasi
5. Login otomatis
6. Menjelajahi fitur tanpa perlu daftar
7. Logout
8. Bisa daftar akun sendiri jika tertarik

### Scenario 4: Forgot Password Flow
1. User lupa password
2. Klik "Masuk" → "Forgot password?"
3. Masukkan email
4. Reset password email dikirim
5. Buka email dan klik reset link
6. Set password baru
7. Login dengan password baru

---

## 🐛 Known Issues & Workarounds

### Issue 1: PostgreSQL Not Available
**Symptom:** `ECONNREFUSED 127.0.0.1:5432`

**Workaround:** Gunakan Demo Mode
- Pastikan tombol "Demo Mode" aktif
- Data tersimpan di localStorage

### Issue 2: Email Service Not Configured
**Symptom:** Email verification tidak terkirim

**Workaround:**
1. Cek mode sandbox di `.env`: `EMAIL_SANDBOX=true`
2. Cek log server untuk email yang seharusnya dikirim
3. Untuk testing, user status bisa diubah manual di database:
   ```sql
   UPDATE users SET status = 'VERIFIED' WHERE email = 'testuser@example.com';
   ```

### Issue 3: CORS Error
**Symptom:** `Access-Control-Allow-Origin` error di console

**Workaround:**
1. Cek konfigurasi CORS di `server/index.ts`
2. Pastikan `FRONTEND_URL` di `.env` sesuai
3. Restart backend server

---

## 📝 Test Results Template

```
Date: ______
Tester: ______
Environment: [ ] Demo Mode [ ] Backend Mode

### Frontend Testing
- [ ] Landing Page renders correctly
- [ ] Register form displays all fields
- [ ] Login form displays correctly
- [ ] Demo account selector works
- [ ] Backend toggle works
- [ ] Navigation flows correctly

### Backend Testing (if applicable)
- [ ] Database setup successful
- [ ] Register API works
- [ ] Login API works
- [ ] Refresh token works
- [ ] Logout API works
- [ ] Token validation works

### Security Testing
- [ ] Password hashing verified
- [ ] JWT tokens are valid
- [ ] Rate limiting works
- [ ] CORS configured correctly

### Integration Testing
- [ ] Register → Login → Dashboard flow works
- [ ] Login → Logout → Redirect works
- [ ] Persist session works
- [ ] Demo account restrictions work

### Notes:
___________________________________________________
___________________________________________________

### Issues Found:
___________________________________________________
___________________________________________________

### Overall Status: [ ] PASSED [ ] FAILED
```

---

## 🎯 Success Criteria

Fitur autentikasi dianggap BERHASIL jika:

- ✅ User dapat mendaftar akun baru (Backend Mode)
- ✅ User dapat login dengan credentials yang valid
- ✅ User dapat logout dan session terhapus
- ✅ Akun demo dapat digunakan untuk testing
- ✅ Password tersimpan dengan aman (hashed)
- ✅ JWT token authentication berfungsi
- ✅ Refresh token rotation berfungsi
- ✅ Form validation bekerja dengan benar
- ✅ Error handling dan user feedback jelas
- ✅ Demo mode dan Backend mode bisa beralih

---

## 📞 Need Help?

Jika menemukan masalah saat testing:

1. Cek documentation:
   - `AUTHENTICATION_SETUP.md`
   - `API_DOCUMENTATION.md`
   - `BACKEND_QUICKSTART.md`

2. Cek troubleshooting section di `AUTHENTICATION_SETUP.md`

3. Lihat logs:
   - Frontend: Browser DevTools Console
   - Backend: Terminal yang menjalankan `npm run server:watch`

4. Cek database (jika menggunakan Backend Mode):
   ```bash
   psql -h localhost -U postgres -d sinaesta -c "SELECT * FROM users;"
   ```

---

**Selamat Testing! 🚀**
