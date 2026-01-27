# Demo Mode User Guide

## 🎯 Overview

Demo Mode memungkinkan SINAESTA berjalan **tanpa backend server** dengan menyimpan semua data di browser localStorage. Ini sangat berguna untuk:

- Testing dan development tanpa setup backend
- Demo untuk klien atau stakeholder
- Offline development
- Rapid prototyping fitur baru

---

## 🚀 Quick Start

### 1. Login dengan Demo Account

Buka aplikasi dan gunakan salah satu demo account:

```
Email: demo@sinaesta.com
Password: demo123
```

**Demo Accounts Lainnya:**
- `student1@sinaesta.com` / `admin123` - Extended features
- `mentor1@sinaesta.com` / `admin123` - Teacher role
- `admin@sinaesta.com` / `admin123` - Full admin access
- `surgery@sinaesta.com` / `demo123` - Surgery specialty
- `pediatrics@sinaesta.com` / `demo123` - Pediatrics specialty
- `cardiology@sinaesta.com` / `demo123` - Cardiology specialty

### 2. Verifikasi Demo Mode

Setelah login, Anda akan melihat **Demo Mode Indicator** di pojok kanan bawah layar dengan badge kuning "Demo Mode".

### 3. Explore Features

Semua fitur akan bekerja seperti biasa, tetapi data disimpan di browser Anda:

- ✅ Buat dan ikuti ujian
- ✅ Study flashcards
- ✅ Practice OSCE stations
- ✅ Lihat hasil dan analytics
- ✅ Buat konten (untuk teacher/admin)

---

## 💾 Data Storage

### localStorage Keys

Demo mode menggunakan localStorage dengan prefix `demo_`:

| Key | Description |
|-----|-------------|
| `demo_results` | Exam results history |
| `demo_exams` | User-created exams |
| `demo_flashcards` | Custom flashcards |
| `demo_decks` | Flashcard decks |
| `demo_osce_stations` | Custom OSCE stations |
| `demo_osce_attempts` | OSCE practice history |

### Data Persistence

- Data tersimpan **hanya di browser Anda**
- Data **tidak hilang** saat refresh halaman
- Data **hilang** jika clear browser cache/data
- Data **tidak disync** antar device atau browser

---

## 🔧 Demo Mode Controls

### Demo Mode Indicator

Klik badge "Demo Mode" di pojok kanan bawah untuk membuka control panel:

#### Database Statistics
- Jumlah results, exams, flashcards, dll
- Total storage size
- Live updates

#### Actions
- **Docs**: View API documentation di console
- **Clear**: Clear semua demo data (confirmation required)

### Browser Console Commands

Buka browser console (F12) dan jalankan:

```javascript
// View API documentation
demoAuthService.getAPIDocumentation()

// Check current mode
console.log('Demo mode:', !demoAuthService.isBackendActive())

// Get database stats
console.log(demoAuthService.getDemoDBStats())

// List implemented endpoints
console.log(demoAuthService.getImplementedEndpoints())

// Clear demo database
demoAuthService.clearDemoDatabase()

// Enable debug logging
demoAuthService.setDebugMode(true)

// Bypass all permissions (for testing)
demoAuthService.setBypassAllPermissions(true)
```

---

## 📚 Available Features in Demo Mode

### ✅ Fully Supported

- **Authentication**: Login, logout, token refresh
- **User Profile**: View and update profile
- **Exams**: Browse, take, and create exams
- **Results**: View history and statistics
- **Flashcards**: Study and create flashcard decks
- **OSCE**: Practice stations and track attempts
- **Analytics**: Performance tracking and insights
- **Spot Diagnosis**: Image-based diagnosis practice
- **Microlearning**: Quick review modules
- **Case Vignettes**: Clinical case studies

### ⚠️ Limited Support

- **File Upload**: Returns mock URLs
- **Real-time Features**: Not available (WebSocket)
- **Email Notifications**: Not sent
- **Multi-user Collaboration**: Single user only

### ❌ Not Supported

- **Admin User Management**: Cannot manage other users
- **System Administration**: Backend-only features
- **External Integrations**: Third-party services

---

## 🎓 Common Use Cases

### For Students

1. **Practice Exams**
   - Login dengan demo account
   - Browse exams by specialty
   - Take exams and get instant feedback
   - Review your results and analytics

2. **Study Flashcards**
   - Access pre-made flashcard decks
   - Study at your own pace
   - Track your progress

3. **OSCE Practice**
   - Practice clinical stations
   - Get checklist-based feedback
   - Review your attempts

### For Teachers/Mentors

1. **Create Content**
   - Login dengan `mentor1@sinaesta.com`
   - Create custom exams
   - Build flashcard decks
   - Design OSCE stations

2. **Review Content**
   - Preview student view
   - Test exam difficulty
   - Validate questions

### For Admins/Developers

1. **Feature Testing**
   - Login dengan `admin@sinaesta.com`
   - Access all roles and features
   - Test permission system
   - Validate UI/UX

2. **Development**
   - Develop without backend
   - Test API integrations
   - Debug frontend issues
   - Rapid prototyping

---

## 🛠️ Advanced Configuration

### Enable/Disable Demo Mode

```javascript
// Disable backend (enable demo mode)
demoAuthService.setBackendEnabled(false)

// Enable backend (disable demo mode)
demoAuthService.setBackendEnabled(true)
```

### Debug Mode

```javascript
// Enable debug logging
demoAuthService.setDebugMode(true)

// All API calls will be logged:
// [DemoAuth Debug] Mock API Request: GET /exams
```

### Permission Bypass

```javascript
// Bypass all permission checks (testing only)
demoAuthService.setBypassAllPermissions(true)

// Now all demo accounts can access any feature
```

### Session Management

```javascript
// Check remaining session time
const remainingMs = demoAuthService.getRemainingSessionTime('demo@sinaesta.com')
console.log('Remaining:', Math.floor(remainingMs / 60000), 'minutes')

// Extend session (admin only)
demoAuthService.extendSession('demo@sinaesta.com', 30 * 60 * 1000) // +30 min

// Reset session
demoAuthService.resetSession('demo@sinaesta.com')
```

---

## 🐛 Troubleshooting

### "Mock endpoint not found"

**Solusi:**
1. Check console untuk endpoint yang belum diimplement
2. Run `demoAuthService.getImplementedEndpoints()` untuk list endpoint
3. Endpoint akan return empty data instead of error

### Data tidak muncul

**Solusi:**
1. Verify demo mode active: Lihat badge "Demo Mode"
2. Check console untuk errors
3. Clear dan reload: `demoAuthService.clearDemoDatabase()`
4. Try dengan user specialty yang berbeda

### Session expired terlalu cepat

**Solusi:**
1. Login dengan `admin@sinaesta.com` (4 hour session)
2. Atau extend session di console:
   ```javascript
   demoAuthService.extendSession('demo@sinaesta.com', 60 * 60 * 1000)
   ```

### Data hilang setelah refresh

**Kemungkinan penyebab:**
- Browser private/incognito mode
- Browser cache cleared
- localStorage disabled
- Different browser profile

**Solusi:**
1. Gunakan normal browser mode (bukan private)
2. Check browser settings untuk localStorage
3. Jangan clear cache while testing

### Permission denied errors

**Solusi:**
1. Check role account yang digunakan
2. Switch ke `admin@sinaesta.com` untuk full access
3. Atau bypass permissions:
   ```javascript
   demoAuthService.setBypassAllPermissions(true)
   ```

---

## 📖 API Documentation

Untuk dokumentasi lengkap Mock API, lihat:

1. **Console Output**:
   ```javascript
   demoAuthService.getAPIDocumentation()
   ```

2. **Markdown File**: [MOCK_API_DOCUMENTATION.md](./MOCK_API_DOCUMENTATION.md)

3. **Troubleshooting Guide**: [DEMO_ACCOUNT_TROUBLESHOOTING.md](./DEMO_ACCOUNT_TROUBLESHOOTING.md)

---

## 💡 Best Practices

### 1. Regular Data Cleanup

```javascript
// Check database size
const stats = demoAuthService.getDemoDBStats()
console.log('Storage:', stats.totalSize, 'bytes')

// Clear if too large (> 1MB)
if (stats.totalSize > 1000000) {
  demoAuthService.clearDemoDatabase()
}
```

### 2. Use Appropriate Account

- **demo@sinaesta.com**: Basic testing (30 min)
- **student1@sinaesta.com**: Extended features (1 hour)
- **mentor1@sinaesta.com**: Teacher features (2 hours)
- **admin@sinaesta.com**: Full access (4 hours)

### 3. Debug When Needed

```javascript
// Enable only during development
if (import.meta.env.DEV) {
  demoAuthService.setDebugMode(true)
}
```

### 4. Backup Important Data

Demo data bisa hilang kapan saja. Export important data:

```javascript
// Export results
const results = JSON.parse(localStorage.getItem('demo_results') || '[]')
console.log(JSON.stringify(results, null, 2))

// Copy to clipboard or save to file
```

---

## 🔐 Security Notes

⚠️ **Demo Mode adalah untuk testing only!**

- Demo accounts menggunakan hardcoded passwords
- Data tidak encrypted di localStorage
- Tidak ada server-side validation
- Session limits bisa di-bypass

**Jangan gunakan demo mode untuk:**
- Production environment
- Sensitive data
- Real user accounts
- Production testing

---

## 🚀 Transitioning to Production

Saat ready untuk production:

1. **Setup Backend Server**
   - Deploy backend API
   - Configure database
   - Setup authentication

2. **Disable Demo Mode**
   ```javascript
   demoAuthService.setBackendEnabled(true)
   ```

3. **Migrate Data** (if needed)
   - Export from localStorage
   - Import to production database

4. **Test Real API**
   - Verify all endpoints
   - Test authentication flow
   - Validate permissions

---

## 📞 Support

Jika menemukan issues:

1. Check console untuk errors
2. Review [DEMO_ACCOUNT_TROUBLESHOOTING.md](./DEMO_ACCOUNT_TROUBLESHOOTING.md)
3. Check [MOCK_API_DOCUMENTATION.md](./MOCK_API_DOCUMENTATION.md)
4. Report issue dengan:
   - Screenshot
   - Console logs
   - Steps to reproduce

---

## 🎉 Tips & Tricks

### Quick Clear All Data

```javascript
// Clear everything demo-related
demoAuthService.clearAllDemoData()
```

### View All Security Logs

```javascript
// See all security events
console.log(demoAuthService.getSecurityLogs())
```

### Get Debug Data

```javascript
// Export all demo debug info
console.log(demoAuthService.getDemoDebugData())
```

### Test Different Specialties

```javascript
// Switch specialty without re-login
const user = JSON.parse(localStorage.getItem('user'))
user.targetSpecialty = 'Surgery'
localStorage.setItem('user', JSON.stringify(user))
location.reload()
```

---

**Happy Testing! 🎊**

*Last Updated: January 2025*  
*Version: 1.0.0*
