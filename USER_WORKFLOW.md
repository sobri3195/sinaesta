# User Workflow - SINAESTA Digital

## Panduan Penggunaan untuk Student

---

## 1. Registrasi & Login

### 1.1 Registrasi Akun Baru

**Langkah-langkah**:

1. Buka aplikasi di browser
2. Di **Landing Page**, klik tombol **"Get Started"** atau **"Register"**
3. Isi form registrasi dengan informasi:
   - **Nama Lengkap** (wajib)
   - **Email** (wajib, harus valid)
   - **Nomor Telepon** (opsional)
   - **Institusi Asal** (opsional)
   - **Target Specialty** (wajib - pilih dari dropdown):
     - Internal Medicine
     - Cardiology
     - Surgery
     - Pediatrics
     - Obgyn
     - Neurology
     - Anesthesiology
     - Radiology
     - Dermatology
     - Ophthalmology
     - ENT
     - Psychiatry
   - **Tahun Ujian yang Ditargetkan** (wajib)
4. Klik tombol **"Daftar"**
5. Akun akan dibuat dan Anda akan di-redirect ke **Dashboard**

**Catatan**:
- Avatar akan otomatis di-generate berdasarkan nama Anda
- Target specialty menentukan konten yang akan Anda lihat (soal, flashcards, OSCE)
- Email digunakan untuk notifikasi (jika fitur email sudah aktif)

---

### 1.2 Login ke Akun

**Langkah-langkah**:

1. Di **Landing Page**, klik tombol **"Login"**
2. Pilih role yang sesuai (untuk demo purposes):
   - **Student** - Akses modul belajar
   - **Mentor/Teacher** - Akses mengajar
   - **Program Admin** - Akses admin
   - **Super Admin** - Akses penuh
3. Masukkan email dan password (jika implementasi real authentication)
4. Klik **"Login"**
5. Anda akan di-redirect ke dashboard sesuai role

---

## 2. Dashboard Student

### 2.1 Overview Dashboard

Setelah login sebagai **Student**, Anda akan melihat:

**Header**:
- Nama Anda dengan avatar
- Target specialty yang dipilih
- Settings & Logout buttons

**Main Content**:
- **Greeting**: "Selamat datang, [Nama]!"
- **Statistics Cards**:
  - Total Exams Completed
  - Average Score
  - Study Streak
  - Time Spent
- **Available Exams Section**:
  - List exam yang tersedia sesuai target specialty
  - Setiap exam menampilkan:
    - Title
    - Topic
    - Difficulty (Easy/Medium/Hard)
    - Duration (menit)
    - Tombol "Mulai Simulasi"
- **Feature Cards**:
  - Spot Dx Drill
  - Microlearning Hub
  - Clinical Reasoning Simulator
  - Flashcards
  - OSCE Practice
- **Recent Activity**:
  - Exam history terbaru
  - Flashcards yang dipelajari
  - OSCE stations yang dikerjakan

**Sidebar Navigation**:
- Dashboard
- Exams (Available Exams)
- Exam History
- Flashcards
- Simulasi OSCE
- Clinical Reasoning
- Spot Dx Drill
- Microlearning
- Logbook
- Analytics
- Cohort Benchmark
- Settings
- Logout

---

## 3. Mengerjakan Exam

### 3.1 Memulai Exam

**Langkah-langkah**:

1. Dari **Dashboard**, scroll ke **Available Exams**
2. Pilih exam yang ingin dikerjakan
3. Klik tombol **"Mulai Simulasi"**
4. Akan muncul **Exam Info Modal** dengan:
   - Judul Exam
   - Deskripsi
   - Jumlah Soal
   - Durasi (menit)
   - Topic
   - Difficulty
5. Klik **"Start Exam"** untuk memulai

**Catatan**:
- Timer akan mulai berjalan
- Soal akan ditampilkan satu per satu
- Anda tidak bisa kembali ke soal sebelumnya setelah mengirim jawaban (tergantung setting)

---

### 3.2 Mengerjakan Soal

**Tampilan Exam**:

**Header**:
- Exam Title
- Question Counter (Soal X dari Y)
- Timer Countdown (misal: 45:32)

**Question Area**:
- Question text
- Gambar atau media (jika ada)
- Vignette/kasus (jika tipe Clinical Case)

**Answer Options**:
- Pilihan A, B, C, D (untuk MCQ)
- Multi-select (untuk certain question types)
- Drag and drop (untuk Clinical Reasoning - Q-Sort)
- Text input (untuk essay/open-ended)

**Footer Actions**:
- **Previous** - Kembali ke soal sebelumnya
- **Next** - Lanjut ke soal berikutnya
- **Flag** - Tandai untuk review nanti
- **Submit Exam** - Selesaikan exam

---

### 3.3 Fitur Exam

**Timer**:
- Countdown timer di pojok kanan atas
- Warning saat sisa waktu < 5 menit (timer berubah warna)
- Auto-submit saat waktu habis

**Flag for Review**:
- Klik tombol **Flag** untuk menandai soal
- Flagged soal ditampilkan di sidebar
- Bisa kembali ke flagged soal sebelum submit

**Navigation**:
- **Previous** - Kembali ke soal sebelumnya (jika enabled)
- **Next** - Lanjut ke soal berikutnya
- Bisa jump ke soal tertentu via sidebar

**Progress**:
- Progress bar menunjukkan sejauh mana exam dikerjakan
- Counter: "Soal 3 dari 10"

---

### 3.4 Submit Exam

**Langkah-langkah**:

1. Setelah menjawab semua soal (atau mau stop lebih awal)
2. Klik tombol **"Submit Exam"**
3. Akan muncul **Confirmation Modal**:
   - "Anda yakin ingin mengumpulkan exam ini?"
   - Jumlah soal yang sudah dijawab
   - Jumlah soal yang belum dijawab (jika ada)
4. Klik **"Ya, Submit"** untuk konfirmasi
5. Exam akan dikumpulkan dan skor dihitung

**Catatan**:
- Pastikan menjawab semua soal sebelum submit
- Flagged soal akan direview sebelum final submit
- Tidak bisa mengubah jawaban setelah submit

---

## 4. Exam Results & Feedback

### 4.1 Melihat Hasil Exam

Setelah submit exam, Anda akan di-redirect ke **Results Page**:

**Score Summary**:
- Total Score (misal: 85/100)
- Percentage (misal: 85%)
- Passing Status (Lulus/Tidak Lulus)
- Time Taken (misal: 42 menit 15 detik)

**Performance Breakdown**:
- ✅ Correct Answers: X soal
- ❌ Incorrect Answers: Y soal
- ⏭️ Skipped: Z soal

**Domain Analysis**:
- Diagnosis: 80% correct
- Therapy: 90% correct
- Investigation: 70% correct
- Mechanism: 100% correct
- Patient Safety: 50% correct

---

### 4.2 Review Jawaban

**Detailed Review**:

Untuk setiap soal:

1. **Question** - Soal dan opsi jawaban
2. **Your Answer** - Jawaban Anda yang dipilih (highlighted)
3. **Correct Answer** - Jawaban yang benar (highlighted)
4. **Status** - ✅ Correct / ❌ Incorrect
5. **Points Earned** - Points untuk jawaban ini (misal: 2/3)
6. **Explanation** - Penjelasan mengapa jawaban benar/salah
7. **Rationale** - Alasan medis/pedagogi

**Navigation**:
- Scroll down untuk semua soal
- Atau klik soal tertentu di sidebar untuk langsung ke sana

---

### 4.3 AI Feedback (Future Feature)

Jika sudah terintegrasi dengan AI:

**AI-Generated Feedback**:
- Overall performance summary
- Strengths & weaknesses analysis
- Recommended topics to review
- Personalized study plan
- Error taxonomy analysis (Knowledge Gap, Premature Closure, dll)

---

## 5. Flashcards

### 5.1 Access Flashcards

**Langkah-langkah**:

1. Dari **Dashboard** atau **Sidebar**, klik **"Flashcards"**
2. Anda akan melihat list **Flashcard Decks**
3. Setiap deck menampilkan:
   - Deck Name
   - Specialty
   - Number of Cards
   - Progress (misal: 25/50 mastered)
   - Tombol **"Study"** atau **"Continue"**

---

### 5.2 Study Flashcards

**Tampilan Study Mode**:

**Front Card**:
- Question/Prompt di-display
- Gambar atau diagram (jika ada)
- Klik card atau tombol **"Flip"** untuk melihat answer

**Back Card**:
- Answer/Explanation
- Gambar penjelas (jika ada)
- Tombol action:
  - **👍 Mastered** - Tandai sebagai sudah dikuasai
  - **👎 Need Review** - Tandai butuh review lagi
  - **⏭️ Next** - Lanjut ke card berikutnya tanpa mark

**Progress Tracker**:
- Cards mastered: X
- Cards to review: Y
- Cards remaining: Z

**Timer** (optional):
- Study session timer
- Pomodoro timer (25 min focus, 5 min break)

---

### 5.3 Deck Summary

Setelah menyelesaikan deck atau klik **"Finish"**:

**Summary Card**:
- Total Cards: N
- Mastered: X
- Need Review: Y
- Accuracy: (Mastered / Total) * 100%

**Actions**:
- **"Study Again"** - Ulangi deck yang belum mastered
- **"Next Deck"** - Lanjut ke deck berikutnya
- **"Back to Dashboard"** - Kembali ke dashboard

---

## 6. OSCE Practice

### 6.1 Access OSCE

**Langkah-langkah**:

1. Dari **Sidebar**, klik **"Simulasi OSCE"**
2. Pilih **Station** yang ingin dikerjakan:
   - Station Name
   - Scenario
   - Duration (misal: 15 menit)
   - Category (Anamnesis, Physical Exam, Diagnosis, Management)
3. Klik **"Start Station"**

---

### 6.2 OSCE Mode

**Tampilan OSCE Station**:

**Header**:
- Station Title
- Timer Countdown

**Scenario & Instructions**:
- Case vignette / pasien scenario
- Instructions apa yang harus dilakukan
- Checklist yang harus dicapai

**Checklist Area**:
- List of criteria
- Checkbox untuk tiap criteria
- Point values

**Action Buttons**:
- **Complete** - Selesaikan station
- **Reset** - Reset progress

---

### 6.3 Completing OSCE

**Langkah-langkah**:

1. Baca scenario & instructions dengan teliti
2. Lakukkan pemeriksaan atau simulasi sesuai scenario
3. Checklist item yang sudah selesai
4. Selesai semua atau waktu habis, klik **"Complete"**
5. Skor akan dihitung berdasarkan checklist

**Scoring**:
- Setiap checklist item punya point value
- Total score = sum of points dari checked items
- Pass/Fail threshold (misal: > 70% untuk pass)

---

### 6.4 OSCE Feedback

**Feedback Page**:

**Score Summary**:
- Total Points: X/Y
- Percentage: Z%
- Pass/Fail Status

**Breakdown by Category**:
- Anamnesis: 80%
- Physical Exam: 70%
- Diagnosis: 90%
- Management: 60%

**Detailed Checklist**:
- ✅ Criteria 1 (3/3 points)
- ✅ Criteria 2 (2/2 points)
- ❌ Criteria 3 (0/5 points) - Not completed
- ⚠️ Criteria 4 (2/4 points) - Partially completed

**Feedback & Recommendations**:
- Areas of strength
- Areas for improvement
- Specific guidance untuk kategori yang score rendah

---

## 7. Clinical Reasoning Simulator

### 7.1 Access Clinical Reasoning

**Langkah-langkah**:

1. Dari **Sidebar**, klik **"Clinical Reasoning"**
2. Pilih **Case** atau **Scenario**
3. Klik **"Start Case"**

---

### 7.2 Clinical Reasoning Flow

**Tahapan**:

**Step 1: Problem Representation**
- Read case vignette
- Identify key findings
- Summarize problem
- Select best problem representation (MCQ)

**Step 2: DDx Formulation**
- List potential diagnoses
- Rank by likelihood
- Select top 3 DDx (multi-select)

**Step 3: Investigation Selection**
- Choose appropriate investigations
- Prioritize investigations
- Select top 5 investigations (Q-Sort ranking)

**Step 4: Diagnosis**
- Make final diagnosis
- Select from DDx or enter new diagnosis
- Justify diagnosis

**Step 5: Management**
- Choose management plan
- Select interventions (prioritized)
- Set timeline & follow-up

---

### 7.3 Q-Sort Mechanics

**Drag and Drop Ranking**:

1. List of items (interventions, investigations, dll)
2. Drag items untuk rank:
   - Top: Most critical/immediate
   - Middle: Important but not urgent
   - Bottom: Less critical
3. Drop items di slot yang sesuai
4. Submit ranking

**Scoring**:
- Correct ranking order gets full points
- Partially correct gets partial points
- Wrong order gets no points

**Safety Layer**:
- Jika pilih tindakan fatal (misal: give NSAID ke peptic ulcer patient)
- System akan alert dengan **"Critical Error Warning"**
- Explain why tindakan tersebut dangerous
- Penalti ke score

---

### 7.4 Clinical Reasoning Feedback

**Feedback by Step**:

**Step 1 - Problem Representation**:
- Your representation: [Text]
- Ideal representation: [Text]
- Score: 2/3 points

**Step 2 - DDx Formulation**:
- Your DDx: [List]
- Ideal DDx: [List]
- Overlap: X items
- Score: 5/8 points

**Step 3 - Investigations**:
- Your selection: [Ranked List]
- Ideal selection: [Ranked List]
- Accuracy: 70%
- Score: 7/10 points

**Step 4 - Diagnosis**:
- Your diagnosis: [Text]
- Correct diagnosis: [Text]
- Result: ✅ Correct / ❌ Incorrect
- Score: 5/5 points

**Step 5 - Management**:
- Your plan: [Ranked List]
- Ideal plan: [Ranked List]
- Safety check: ✅ No critical errors
- Score: 15/20 points

**Overall Score**:
- Total: 34/46 points (74%)
- Pass/Fail: Pass (> 70% threshold)

---

## 8. Spot Dx Drill

### 8.1 Access Spot Dx

**Langkah-langkah**:

1. Dari **Sidebar**, klik **"Spot Dx Drill"**
2. Klik **"Start Drill"**

---

### 8.2 Spot Dx Flow

**Tampilan**:

**Header**:
- Timer (60 detik per case)
- Case counter (Case 1/10)

**Content**:
- Image atau photo (misal: skin lesion, chest X-ray, ECG)
- Question prompt (misal: "Apa diagnosis?")

**Answer Section**:
- Diagnosis MCQ (4-5 options)
- Next Step MCQ (4-5 options)
- Submit button

**Actions**:
- Submit answer → Auto-advance ke next case
- Timer habis → Auto-submit current answer, advance

---

### 8.3 Spot Dx Scoring

**Per Case**:
- Correct Diagnosis: +1 point
- Correct Next Step: +1 point
- Bonus for speed (< 30 sec): +0.5 point
- Max points per case: 2.5

**Overall**:
- Score = Sum of all cases
- Accuracy % = (Correct / Total) * 100
- Speed Average = Avg time per case

---

### 8.4 Spot Dx Summary

**Summary Card**:
- Total Cases: 10
- Correct Diagnosis: 8/10
- Correct Next Step: 7/10
- Score: 15.5/25
- Accuracy: 75%
- Average Speed: 32.5 sec/case

**Performance**:
- Strongest: Skin Lesions (100%)
- Weakest: Chest X-ray (40%)

**Recommendations**:
- Review dermatology atlas
- Practice radiology interpretation
- Focus on speed + accuracy balance

---

## 9. Microlearning Hub

### 9.1 Access Microlearning

**Langkah-langkah**:

1. Dari **Sidebar**, klik **"Microlearning"**
2. Pilih **Pack** atau **Topic**
3. Klik **"Start"**

---

### 9.2 Microlearning Flow

**Pack Structure**:
- Duration: 5-7 menit
- Content type: Flashcards, mini-cases, quiz, videos
- Progress tracked per pack

**Example Pack**:
- Topic: "Acute Myocardial Infarction"
- Duration: 6 minutes
- Items:
  1. Flashcard: Definition (30 sec)
  2. Flashcard: Risk Factors (45 sec)
  3. Mini-case: Typical Presentation (60 sec)
  4. Quiz: Diagnosis (30 sec)
  5. Flashcard: Management (45 sec)
  6. Video: ECG Interpretation (2 min)

---

### 9.3 Microlearning Completion

**Completion Page**:
- Pack: "Acute Myocardial Infarction"
- Duration: 6 min
- Completed in: 5:32
- Score: 5/6 items mastered (83%)
- XP Gained: +50 XP

**Actions**:
- **"Study Again"** - Ulangi pack
- **"Next Pack"** - Lanjut ke pack berikutnya
- **"Back"** - Kembali ke hub

---

## 10. Logbook

### 10.1 Access Logbook

**Langkah-langkah**:

1. Dari **Sidebar**, klik **"Logbook"**
2. View list of log entries

---

### 10.2 Add Log Entry

**Form Input**:

**Patient Info**:
- Patient ID (anonymized)
- Age, Gender
- Diagnosis/Chief Complaint

**Procedure/Case**:
- Procedure Name
- Category (Surgery, Consultation, Emergency, dll)
- Role (Primary, Assistant, Observer)
- Date & Time

**Details**:
- Description
- Learning points
- Challenges
- What went well

**Attachments**:
- Photos/documents (jika ada)

**Submit**:
- Klik **"Submit"**
- Status: PENDING REVIEW (awaiting mentor verification)

---

### 10.3 Logbook Status

**Status Types**:
- **PENDING** - Awaiting mentor review
- **VERIFIED** - Approved by mentor
- **REJECTED** - Rejected, needs revision
- **REVISION** - Needs changes, resubmit

**View Status**:
- Filter by status
- View details of each entry
- See mentor feedback (if reviewed)

---

## 11. Analytics & Progress

### 11.1 Analytics Dashboard

**Langkah-langkah**:

1. Dari **Sidebar**, klik **"Analytics"**
2. View performance analytics

---

### 11.2 Analytics Overview

**Statistics Cards**:
- Total Exams Completed
- Average Score (all time)
- Current Streak
- Total Study Time

**Charts**:
- **Score Trend** - Line chart showing score improvement over time
- **Domain Performance** - Bar chart by domain (Diagnosis, Therapy, etc.)
- **Time Spent** - Bar chart by topic/specialty
- **Accuracy vs Speed** - Scatter plot

---

### 11.3 High-Yield Map

**Heatmap Visualization**:
- Topics on X-axis
- Frequency on Y-axis (how often appears in exams)
- Color = Your performance (Green = Good, Red = Needs Improvement)

**Use Cases**:
- Identify high-frequency topics you're weak at → Prioritize studying
- Identify low-frequency topics you're strong at → Skip or review lightly

---

### 11.4 Cohort Benchmark

**Percentile Comparison**:
- Your score vs cohort (same specialty & batch)
- Percentile rank (misal: 75th percentile)
- Above/Below average indicators

**Peer Comparison**:
- Average score of top 10%
- Average score of bottom 10%
- Your position in distribution

---

## 12. Settings

### 12.1 Access Settings

**Langkah-langkah**:

1. Dari **Sidebar**, klik **"Settings"**
2. View tabbed settings interface

---

### 12.2 General Settings

**UI Preferences**:
- ☑️ Compact Mode (for smaller screens)
- ☑️ Dark Mode (future feature)
- ☑️ Show Tooltips (help hints)

**Notifications**:
- ☑️ Exam Reminders
- ☑️ Study Reminders
- ☑️ Mentor Updates
- ☑️ New Content Alerts

---

### 12.3 Exam Settings

**Exam Creator**:
- Default Duration (minutes)
- Default Difficulty (Easy/Medium/Hard)
- Timer Display (Top/Bottom)

**Exam Taker**:
- ☑️ Show Timer
- ☑️ Auto-Submit on Timeout
- ☑️ Allow Review Before Submit
- ☑️ Show Progress Bar

---

### 12.4 Flashcard Settings

**Flashcard Creator**:
- Default Deck Size (cards)
- Card Type (Text, Image, Both)

**Flashcard Study**:
- ☑️ Show Timer
- ☑️ Auto-Flip Delay (seconds)
- ☑️ Shuffle Deck

---

### 12.5 OSCE Settings

**OSCE Mode**:
- Default Station Duration (minutes)
- ☑️ Show Timer
- ☑️ Auto-Complete on Timeout

**OSCE Manager**:
- ☑️ Allow Video Upload (future feature)

---

### 12.6 Import Soal Settings

**Excel Import**:
- ☑️ Show Preview Before Import
- ☑️ Validate Data
- ☑️ Auto-Map Columns

**Default Template**:
- Template Version
- Column Mappings

---

### 12.7 About

**App Info**:
- App Name: SINAESTA Digital
- Version: 1.0.0
- Last Updated: [Date]

**Features List**:
- AI-assisted Exam Builder
- Full Exam Player
- Virtual OSCE with Voice
- Clinical Reasoning Simulator
- Flashcards
- Microlearning
- Analytics & Performance Tracking
- Logbook
- Mentor Marketplace

**Developer Info**:
- Dr. Muhammad Sobri Maulana
- Email: muhammadsobrimaulana31@gmail.com
- GitHub: https://github.com/sobri3195

---

### 12.8 Export/Import Settings

**Export Settings**:
- Klik **"Export Settings"**
- File JSON akan di-download
- Simpan file untuk backup

**Import Settings**:
- Klik **"Import Settings"**
- Pilih file JSON backup
- Settings akan di-restore

---

### 12.9 Reset Settings

**Reset to Defaults**:
- Klik **"Reset to Defaults"**
- Konfirmasi dengan **"Yes, Reset"**
- Semua settings akan kembali ke default

---

## 13. Logout

### 13.1 Logout dari Akun

**Langkah-langkah**:

1. Dari **Sidebar** atau **User Menu**, klik **"Logout"**
2. Konfirmasi logout jika ada modal
3. Anda akan di-redirect ke **Landing Page**
4. Session akan dihapus

---

## 14. Troubleshooting

### 14.1 Common Issues

**Issue: Data tidak muncul**
- Solution:
  - Refresh browser
  - Check internet connection
  - Clear browser cache
  - Logout dan login lagi

**Issue: Exam error/crash**
- Solution:
  - Refresh browser
  - Check error message
  - Contact support

**Issue: Score tidak muncul**
- Solution:
  - Pastikan exam sudah di-submit
  - Check exam history
  - Contact support jika masih error

---

### 14.2 Tips & Best Practices

**Exam Taking**:
- Jangan terburu-buru, baca soal dengan teliti
- Flag soal yang ragu, review sebelum submit
- Manfaatkan timer untuk pace diri
- Selalu baca explanation untuk belajar

**Studying**:
- Fokus pada weakness (dari analytics)
- Gunakan High-Yield Map untuk prioritaskan
- Mix flashcards, exams, OSCE untuk variasi
- Consistency > Intensity (study regularly vs cramming)

**OSCE Practice**:
- Review checklist sebelum station
- Practice verbal communication
- Time management critical
- Get feedback dari mentor

---

## 15. Contact Support

**Jika mengalami masalah**:

1. Cek **FAQ** section (jika ada)
2. Cek dokumentasi (README.md, QUICK_START.md, FLOWS.md)
3. Kirim email ke: muhammadsobrimaulana31@gmail.com
4. Join WhatsApp Group untuk komunitas support

---

**Last Updated**: 2025-01-08
**Version**: 1.0.0
**Status**: ✅ Complete
