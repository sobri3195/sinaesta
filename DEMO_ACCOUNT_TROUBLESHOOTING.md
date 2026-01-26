# Demo Account Troubleshooting & Backend-Free Mode

## 📋 Overview

Dokumen ini menjelaskan cara kerja sistem demo account dan memberikan prompt untuk memperbaiki error agar akun demo dapat berjalan tanpa backend.

---

## 🔑 Akun Demo Tersedia

### 1. **demo@sinaesta.com**
- **Password**: `demo123`
- **Role**: STUDENT
- **Specialty**: Internal Medicine
- **Session Limit**: 30 menit
- **Fitur yang Dapat Diakses**: EXAM_TAKING, FLASHCARDS, MICROLEARNING, SPOT_DX_DRILL

### 2. **student1@sinaesta.com**
- **Password**: `admin123`
- **Role**: STUDENT
- **Specialty**: Internal Medicine
- **Session Limit**: 1 jam
- **Fitur yang Dapat Diakses**: EXAM_TAKING, FLASHCARDS, MICROLEARNING, OSCE_PRACTICE, SPOT_DX_DRILL

### 3. **mentor1@sinaesta.com**
- **Password**: `admin123`
- **Role**: TEACHER (Mentor)
- **Specialty**: Internal Medicine
- **Session Limit**: 2 jam
- **Fitur yang Dapat Diakses**: EXAM_CREATION, OSCE_GRADING, MENTORING, QUESTION_REVIEW

### 4. **admin@sinaesta.com**
- **Password**: `admin123`
- **Role**: SUPER_ADMIN
- **Specialty**: Internal Medicine
- **Session Limit**: 4 jam
- **Fitur yang Dapat Diakses**: ALL_ADMIN_FEATURES (Semua fitur admin)

### 5. **Specialty Demo Accounts**
Semua akun specialty demo memiliki:
- **Password**: `demo123`
- **Role**: STUDENT
- **Session Limit**: 30 menit

| Email | Specialty |
|-------|-----------|
| surgery@sinaesta.com | Surgery |
| pediatrics@sinaesta.com | Pediatrics |
| obgyn@sinaesta.com | Obgyn |
| cardiology@sinaesta.com | Cardiology |

---

## 🚨 Error yang Mungkin Terjadi

### Error 1: "Backend tidak terjangkau dan akun tidak ditemukan di Mode Demo"

**Deskripsi**: Error ini muncul ketika:
1. Backend tidak berjalan atau tidak terjangkau
2. Email/password tidak cocok dengan demo account
3. Network error handling gagal mendeteksi demo account

**Solusi Prompt**:

```markdown
Saya mengalami error "Backend tidak terjangkau dan akun tidak ditemukan di Mode Demo" saat mencoba login dengan demo account.

Harap perbaiki hal-hal berikut:

1. **Perbaiki DemoAuthService.loginDemoAccount()**:
   - Pastikan validasi email/password case-insensitive
   - Tambahkan debug log untuk mencocokkan input dengan DEMO_ACCOUNTS
   - Pastikan error message jelas dan membantu

2. **Perbaiki AuthService.login()**:
   - Optimalkan logika fallback ke demo mode
   - Tambahkan validasi awal untuk demo account sebelum mencoba backend
   - Pastikan network error detection lebih robust

3. **Perbaiki error handling di LoginForm.tsx**:
   - Tampilkan error yang lebih spesifik
   - Berikan saran untuk menggunakan demo account jika login gagal
   - Tambahkan tombol "Auto-fill Demo Credentials"

4. **Tambahkan fitur debug mode**:
   - Toggle untuk mengaktifkan console logging
   - Tampilkan status backend connection
   - Tampilkan list demo account yang tersedia
```

---

### Error 2: "Demo session limit reached"

**Deskripsi**: Error ini muncul ketika:
1. User mencoba login lagi sebelum session limit habis
2. Waktu session tracking di localStorage rusak

**Solusi Prompt**:

```markdown
Saya mengalami error "Demo session limit reached" padahal saya baru pertama kali login.

Harap perbaiki hal-hal berikut:

1. **Perbaiki session duration tracking**:
   - Tambahkan fungsi resetSession(email) untuk membersihkan session data
   - Tampilkan sisa waktu session yang tersisa
   - Tambahkan tombol "Reset Session Limit" untuk demo purposes

2. **Optimasi localStorage management**:
   - Pastikan key `demo_last_login_${email}` unik per browser
   - Tambahkan fungsi cleanup untuk menghapus session lama
   - Validasi data yang tersimpan di localStorage

3. **Perbaiki UX**:
   - Tampilkan countdown timer di dashboard
   - Berikan warning 5 menit sebelum session habis
   - Tambahkan opsi "Extend Session" untuk demo admin

4. **Tambahkan debug panel**:
   - Tampilkan semua localStorage keys terkait demo
   - Tampilkan current timestamp dan last login time
   - Tombol untuk clear semua demo data
```

---

### Error 3: "Demo account does not have access to this endpoint"

**Deskripsi**: Error ini muncul ketika:
1. Demo account mencoba mengakses endpoint yang dibatasi
2. Permission system terlalu ketat untuk demo purposes

**Solusi Prompt**:

```markdown
Saya mengalami error "Demo account does not have access to this endpoint" saat mencoba mengakses fitur demo.

Harap perbaiki hal-hal berikut:

1. **Review permission system di permissionUtils.ts**:
   - Buat mode "DEMO_BYPASS" untuk mematikan restriction saat demo
   - Pastikan admin@sinaesta.com dapat mengakses semua fitur
   - Validasi ROUTE_PERMISSIONS mapping untuk role STUDENT, TEACHER, ADMIN

2. **Perbaiki role switching validation**:
   - Untuk admin@sinaesta.com, izinkan switching ke semua role
   - Untuk demo account lainnya, pastikan role default sudah benar
   - Tampilkan available roles di user profile

3. **Perbaiki ProtectedRoute component**:
   - Tambahkan mode "Demo Mode Active" indicator
   - Berikan opsi "Override Permission" untuk demo admin
   - Tampilkan pesan error yang lebih jelas dengan link ke demo settings

4. **Tambahkan Demo Settings panel**:
   - Toggle untuk "Bypass All Permissions" (hanya untuk demo mode)
   - List fitur yang accessible untuk current demo account
   - Switch account demo dengan mudah
```

---

### Error 4: Mock token tidak valid atau expired

**Deskripsi**: Error ini muncul ketika:
1. Mock JWT token yang di-generate tidak valid
2. Token expired tetapi tidak ada refresh logic untuk demo

**Solusi Prompt**:

```markdown
Saya mengalami error terkait token validation saat menggunakan demo account.

Harap perbaiki hal-hal berikut:

1. **Perbaiki generateMockToken() di DemoAuthService**:
   - Gunakan library JWT yang proper (misal: jsonwebtoken) untuk demo mode
   - Pastikan payload lengkap: sub, email, name, role, iat, exp
   - Tambahkan validasi signature yang lebih robust

2. **Tambahkan demo token refresh logic**:
   - Implement auto-refresh untuk demo tokens
   - Pastikan token exp time cukup panjang (minimal 4 jam untuk admin demo)
   - Tampilkan token status di demo settings

3. **Perbaiki token storage**:
   - Simpan token metadata (createdAt, expiresAt) di localStorage
   - Validasi token format sebelum disimpan
   - Tambahkan fungsi clearInvalidTokens()

4. **Perbaiki API client untuk demo mode**:
   - Pastikan Authorization header ter-set dengan benar
   - Tambahkan interceptor untuk bypass token validation di demo mode
   - Handle 401 errors dengan auto-retry untuk demo tokens
```

---

### Error 5: Mock endpoint tidak diimplementasi

**Deskripsi**: Error ini muncul ketika:
1. Component mencoba memanggil API endpoint yang tidak ada di mockBackendRequest()
2. Data yang diperlukan tidak tersedia

**Solusi Prompt**:

```markdown
Saya mengalami error "Mock endpoint not found" atau data tidak muncul saat menggunakan demo account.

Harap perbaiki hal-hal berikut:

1. **Lengkapi mockBackendRequest() di DemoAuthService**:
   - Implement semua endpoint yang dibutuhkan oleh komponen:
     * /users/me - User profile
     * /exams - List exams (filtered by specialty)
     * /flashcards - Flashcard decks
     * /osce/stations - OSCE stations
     * /results - Exam results history
     * /analytics - Performance data
   - Pastikan response format sama dengan backend API
   - Tambahkan delay simulasi untuk realism

2. **Integrasikan dengan mockData.ts**:
   - Gunakan generateExamsForSpecialty() untuk /exams endpoint
   - Gunakan generateFlashcardDecks() untuk /flashcards endpoint
   - Gunakan generateOSCEStations() untuk /osce/stations endpoint
   - Pastikan data generation konsisten dengan user specialty

3. **Tambahkan mock database**:
   - Buat simple in-memory database untuk demo mode
   - Simpan exam results, user progress, settings
   - Implement CRUD operations untuk demo data
   - Sync dengan localStorage untuk persistence

4. **Perbaiki error handling**:
   - Log semua endpoint requests yang tidak diimplement
   - Tampilkan helpful error message untuk missing endpoints
   - Tambahkan fallback data untuk critical endpoints

5. **Tambahkan mock API documentation**:
   - List semua endpoint yang sudah diimplement
   - Tanda endpoint yang belum diimplement
   - Expected response format untuk tiap endpoint
```

---

## 🛠️ Mode Backend-Free Implementation

### Langkah 1: Aktifkan Demo Mode

```typescript
// Di component atau browser console:
demoAuthService.setBackendEnabled(false);
```

### Langkah 2: Login dengan Demo Account

```typescript
// Gunakan salah satu demo account:
Email: demo@sinaesta.com
Password: demo123
```

### Langkah 3: Verifikasi Demo Mode

```typescript
// Check di browser console:
console.log('Backend active:', demoAuthService.isBackendActive());
console.log('Is demo account:', demoAuthService.isDemoAccount('demo@sinaesta.com'));
console.log('Restrictions:', demoAuthService.getDemoAccountRestrictions('demo@sinaesta.com'));
```

---

## 🔍 Debugging Commands

### Cek Demo Account Status

```typescript
// Run in browser console
const userEmail = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).email : 'N/A';
console.log('Current user:', userEmail);
console.log('Is demo account:', demoAuthService.isDemoAccount(userEmail));
console.log('Backend enabled:', demoAuthService.isBackendActive());
console.log('Restrictions:', demoAuthService.getDemoAccountRestrictions(userEmail));
```

### Cek Security Logs

```typescript
// View security events
console.log(demoAuthService.getSecurityLogs());
```

### Reset Demo Data

```typescript
// Clear all demo data
localStorage.removeItem('security_logs');
localStorage.removeItem('security_violations');
localStorage.removeItem('mock_users');
demoAuthService.clearSecurityLogs();

// Reset specific demo account
Object.keys(localStorage).forEach(key => {
  if (key.startsWith('demo_last_login_')) {
    localStorage.removeItem(key);
  }
});
```

---

## 🎯 Best Practices untuk Demo Mode

### 1. Gunakan admin@sinaesta.com untuk Full Testing
- Akses ke semua role (Student, Teacher, Admin, Super Admin)
- Session limit terpanjang (4 jam)
- Semua fitur terbuka

### 2. Reset Session dengan Benar
- Clear localStorage sebelum testing ulang
- Gunakan tombol "Logout" yang benar
- Check browser devtools Application tab

### 3. Monitor Console Logs
- Semua security event logged dengan prefix "SECURITY EVENT"
- Mock API calls logged dengan prefix "[apiService]"
- Error messages membantu untuk debugging

### 4. Test Berbagai Scenarios
- Login dengan berbagai demo accounts
- Switch role (hanya untuk admin@sinaesta.com)
- Coba akses fitur yang restricted
- Test session timeout behavior

---

## 📝 Quick Troubleshooting Checklist

- [ ] Backend mode disabled? (`demoAuthService.setBackendEnabled(false)`)
- [ ] Demo account credentials correct?
- [ ] Session limit not reached?
- [ ] localStorage data valid?
- [ ] Mock endpoints implemented?
- [ ] Token format valid?
- [ ] Permissions configured correctly?
- [ ] Console errors checked?
- [ ] Security logs reviewed?

---

## 🔗 Related Files

- `services/demoAuthService.ts` - Demo authentication & mock API
- `services/authService.ts` - Authentication layer with demo fallback
- `src/utils/permissionUtils.ts` - Permission & access control
- `src/components/ProtectedRoute.tsx` - Route protection
- `components/auth/LoginForm.tsx` - Login UI
- `App.tsx` - Main app with role switching

---

## 💡 Tips untuk Developer

1. **Selalu test di demo mode terlebih dahulu** sebelum mengintegrasikan dengan backend
2. **Gunakan console logging ekstensif** untuk debugging
3. **Simpan error reproductions** dengan screenshot dan logs
4. **Update dokumentasi** saat menambah demo account atau fitur baru
5. **Validasi mock data** secara berkala

---

*Document created: $(date)*
*Last updated: DEMO_ACCOUNT_TROUBLESHOOTING.md*
