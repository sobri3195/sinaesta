# Quick Start Guide - SINAESTA Digital

## 🎯 Tujuan Task

Task ini bertujuan untuk:
1. ✅ Memperjelas alur aplikasi di seluruh fitur
2. ✅ Menambahkan data dummy lengkap untuk semua 12 specialties
3. ✅ Menyediakan dokumentasi komprehensif

---

## 📁 File-File Baru yang Ditambahkan

### 1. **mockData.ts** (Baru)
**Lokasi**: `/mockData.ts`

File ini berisi semua generator untuk dummy data:
- `MOCK_STUDENT`, `MOCK_ADMIN`, `MOCK_TEACHER` - Mock users
- `generateExamsForSpecialty(specialty)` - Generate exams per specialty
- `generateFlashcardDecks(specialty)` - Flashcard decks untuk belajar
- `generateOSCEStations(specialty)` - Virtual OSCE stations
- `generateSpotDxItems(specialty)` - 60-second diagnosis drill cases
- `generateMicrolearningPacks(specialty)` - Paket pembelajaran 5-7 menit
- `generateCaseVignettes(specialty)` - Case studies dengan lab/imaging data

**Keuntungan**:
- Centralized mock data management
- Easy to scale dan modify
- Imported di App.tsx, bukan hardcoded

---

### 2. **FLOWS.md** (Baru)
**Lokasi**: `/FLOWS.md`

Dokumentasi lengkap tentang alur aplikasi (2000+ lines):

#### Isi:
- **PUBLIC FLOWS**: Landing page, registration
- **STUDENT FLOWS**: Dashboard, exams, flashcards, OSCE, clinical reasoning, etc.
- **TEACHER FLOWS**: Mentor dashboard, logbook review, forum
- **ADMIN FLOWS**: Question bank, Excel import, blueprint, analytics, etc.
- **DATA FLOW**: Struktur exam, questions, progress tracking
- **STATE MANAGEMENT**: React hooks, localStorage
- **UI/UX PATTERNS**: Navigation, forms, modals
- **ERROR HANDLING**: Validation, error recovery
- **ROLE-BASED PERMISSIONS**: Student vs Teacher vs Admin rights
- **QUICK REFERENCE**: Route mapping table

#### Gunakan untuk:
- Memahami alur aplikasi secara holistik
- Reference saat development fitur baru
- Onboarding developer baru

---

### 3. **DATA_BY_SPECIALTY.md** (Baru)
**Lokasi**: `/DATA_BY_SPECIALTY.md`

Dokumentasi struktur data per specialty (1000+ lines):

#### Isi:
- Overview 12 specialties:
  1. Internal Medicine - 2 exams, rheumatology cases
  2. Surgery - 2 exams, trauma, acute abdomen
  3. Pediatrics - 2 exams, neonatology
  4. Obgyn - obstetric emergencies
  5. Cardiology - EKG interpretation
  6. Neurology - stroke management
  7. Anesthesiology - airway management
  8. Radiology - chest imaging
  9. Dermatology - skin lesions
  10. Ophthalmology - retinal disorders
  11. ENT - hearing loss, emergencies
  12. Psychiatry - psychosis, mood disorders

- **Question Structure**: Fields, domains, scoring
- **Scoring & Weighting**: Weighted points system
- **Quality Metrics (Q-QS)**: Difficulty index, discrimination index
- **Data Access Flow**: Student journey
- **Adding New Specialty**: Step-by-step guide
- **Performance Notes**: Data volume, optimization tips

#### Gunakan untuk:
- Understand data organization
- Add new specialties
- Quality control guidelines

---

### 4. **QUICK_START.md** (Ini)
**Lokasi**: `/QUICK_START.md`

File ringkas ini untuk quick reference.

---

## 🔄 Perubahan di File Existing

### App.tsx
- Added imports dari mockData.ts
- Removed hardcoded generateExamsForSpecialty function
- Updated OSCE_STATION → DEFAULT_OSCE_STATION
- Cleaner, more maintainable code

### README.md
- Added section "📚 Dokumentasi Alur"
- Added section "🎯 Alur Aplikasi Singkat"
- Added section "🧪 Testing dengan Mock Data"
- Added section "🔄 Development Flow"
- Links ke FLOWS.md dan DATA_BY_SPECIALTY.md

---

## 🧪 Testing Aplikasi

### Scenario 1: Register sebagai Student
```
1. Buka aplikasi → Landing page
2. Klik "Get Started" atau "Register"
3. Isi form registrasi:
   - Nama: "dr. Test Spesialis"
   - Email: "test@example.com"
   - Pilih Specialty: "Surgery"
4. Submit
5. Akan di-redirect ke Dashboard
6. Lihat exams yang ter-filter sesuai Surgery specialty
```

### Scenario 2: Switch Specialty
```
1. Di Dashboard, klik User icon (bottom-left)
2. Klik "Target Specialty"
3. Pilih specialty lain (misal: Cardiology)
4. Dashboard akan reload dengan data Cardiology
```

### Scenario 3: Take Exam
```
1. Di Dashboard, klik "Mulai Simulasi" pada salah satu exam
2. Akan masuk ke TAKE_EXAM view
3. Jawab questions, lihat timer
4. Submit exam
5. Lihat results dengan score, explanation, feedback
```

### Scenario 4: Access Flashcards
```
1. Di sidebar, klik "Flashcards"
2. Will show flashcard decks untuk specialty saat ini
3. Click deck → study mode
4. Flip card untuk lihat answer
5. Mark as mastered atau need review
```

### Scenario 5: Access OSCE
```
1. Di sidebar, klik "Simulasi OSCE"
2. Lihat station info, scenario, instruction
3. Klik "Start" untuk mulai
4. Timer akan jalan, checklist akan terbuka
5. Selesai → lihat score berdasarkan checklist
```

---

## 📊 Data Structure Overview

```
Specialty
├─ Exams (1-2 per specialty)
│  ├─ Questions (2-5 questions per exam)
│  │  ├─ Category (Cardiology, Trauma, dll)
│  │  ├─ Difficulty (Easy, Medium, Hard)
│  │  ├─ Domain (Diagnosis, Therapy, Investigation, Mechanism, Patient Safety)
│  │  ├─ Points (1, 2, or 3 - untuk weighted scoring)
│  │  └─ Explanation & Rationale
│  └─ Vignettes (optional - case stories dengan lab/imaging data)
├─ Flashcard Decks
│  └─ Cards (Front question, back answer)
├─ OSCE Stations
│  └─ Checklists (anamnesis, physical exam, diagnosis, management)
├─ Spot Diagnosis Items
│  └─ Image-based diagnosis drill
└─ Microlearning Packs
   └─ 5-7 minute quick learning units
```

---

## 🎯 Key Features Explained

### 1. Specialty-Based Content
- User memilih specialty saat registrasi atau di settings
- Semua content (exams, flashcards, OSCE) ter-filter per specialty
- Data di-load dari `generateExamsForSpecialty()` dll di mockData.ts

### 2. Weighted Scoring
- Setiap question punya `points` field (default: 1)
- Score = sum of (points untuk correct answers)
- Flexible system untuk weighted exams

### 3. Domain Classification
Setiap question diberi domain:
- **Diagnosis** - Identifying the problem
- **Therapy** - Treatment decisions
- **Investigation** - Diagnostic tests
- **Mechanism** - Pathophysiology
- **Patient Safety** - Critical errors

### 4. Role-Based Access
- **STUDENT**: View exams, take tests, study flashcards, practice OSCE
- **TEACHER**: All student + create content, review logbooks, mentor sessions
- **ADMIN**: All + user management, blueprint, analytics

---

## 🔧 How to Add New Data

### Add New Exam to Existing Specialty

Edit `mockData.ts`:

```typescript
const SURGERY_QUESTIONS: Question[] = [
  // Existing questions...
  {
    id: 'surg_q3',
    text: 'Your new question...',
    options: ['A', 'B', 'C', 'D'],
    correctAnswerIndex: 0,
    explanation: 'Why A is correct...',
    category: 'Trauma',
    difficulty: 'Hard',
    domain: 'Therapy',
    points: 2
  }
];

// In generateExamsForSpecialty:
'Surgery': [
  // Existing exams...
  {
    id: 'ex_surg_3',
    title: 'New Exam Title',
    description: 'Description...',
    durationMinutes: 60,
    topic: 'Surgery',
    difficulty: 'Hard',
    createdAt: Date.now(),
    questions: SURGERY_QUESTIONS // Include new question
  }
]
```

### Add New Specialty

1. **Add to SPECIALTIES array** in `types.ts`:
   ```typescript
   export const SPECIALTIES = [
     ...existing,
     'New Specialty Name'
   ] as const;
   ```

2. **Add questions** in `mockData.ts`:
   ```typescript
   const NEW_SPECIALTY_QUESTIONS: Question[] = [ ... ];
   ```

3. **Add to generateExamsForSpecialty**:
   ```typescript
   'New Specialty Name': [
     { id, title, questions: NEW_SPECIALTY_QUESTIONS, ... }
   ]
   ```

4. **Add flashcards, OSCE, etc** untuk specialty baru

---

## ❓ FAQ

**Q: Di mana hardcoded data lama?**
A: Semua sudah di-move ke `mockData.ts`. App.tsx sekarang clean dan hanya mengimport.

**Q: Gimana cara modify pertanyaan existing?**
A: Edit di `mockData.ts`, find the question ID, update properties. App akan auto-reload.

**Q: Bagaimana scoring sistem bekerja?**
A: Setiap question punya `points` field. Score = sum of points untuk correct answers. Di `ExamTaker`, scoring di-calculate dengan: `score += (correct ? points : 0)`.

**Q: Gimana specialty filtering bekerja?**
A: Di App.tsx, useEffect watch `user.targetSpecialty`. Ketika berubah:
```typescript
useEffect(() => {
  if (user.role === UserRole.STUDENT && user.targetSpecialty) {
    setExams(generateExamsForSpecialty(user.targetSpecialty));
  }
}, [user.targetSpecialty]);
```

**Q: Berapa banyak specialties?**
A: 12 specialties dengan complete mock data. Bisa di-extend dengan menambah SPECIALTIES array dan generate functions.

**Q: Apakah data persistent?**
A: Saat ini semua di-generate in-memory. Untuk production, perlu connect ke backend API (`GET /api/exams`, `POST /api/results`, dll).

---

## 🚀 Next Development Steps

1. **Connect Backend API**
   - Replace generateExamsForSpecialty dengan API call
   - Save exam results ke database
   - Implement real user authentication

2. **Add Gemini Integration**
   - Generate questions otomatis dari prompt
   - Real-time feedback pada exam results
   - AI-powered clinical reasoning guidance

3. **Implement Progress Tracking**
   - Save exam history per student
   - Calculate percentile vs cohort
   - Show improvement over time

4. **Add Analytics**
   - High-yield topics heatmap
   - Fatigue curve analysis
   - Question quality metrics (Q-QS)

5. **Mobile Optimization**
   - Already responsive, but test on actual devices
   - Add offline mode untuk cached exams
   - Mobile-first navigation

---

## 📚 Documentation Files

| File | Purpose | Size |
|------|---------|------|
| FLOWS.md | Complete application flows | ~2000 lines |
| DATA_BY_SPECIALTY.md | Data structure & specialty info | ~1000 lines |
| mockData.ts | Mock data generators | ~600 lines |
| README.md | Updated with flow references | Updated |
| QUICK_START.md | This file | Reference |

---

## 🐛 Troubleshooting

**Problem**: Data tidak muncul di dashboard
**Solution**: 
- Check console untuk errors
- Verify `user.targetSpecialty` is set
- Check `generateExamsForSpecialty()` return value

**Problem**: Questions tidak sesuai specialty
**Solution**:
- Verify specialty name matches exactly dengan `SPECIALTIES` array
- Check switch statement di `generateExamsForSpecialty()`
- Clear browser cache dan reload

**Problem**: Build error
**Solution**:
- Run `npm install` to ensure all dependencies
- Check TypeScript errors: `npx tsc --noEmit`
- Verify all imports are correct

---

## 📞 Support

Untuk bantuan atau pertanyaan:
1. Check dokumentasi di FLOWS.md dan DATA_BY_SPECIALTY.md
2. Review mockData.ts untuk struktur data
3. Check App.tsx untuk implementasi
4. Review console logs untuk errors

---

**Last Updated**: 2025-12-11
**Status**: ✅ Complete - Ready for testing & extension
