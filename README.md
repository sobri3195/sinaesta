# Sinaesta - Platform Persiapan Ujian PPDS Berbasis AI

Sinaesta adalah platform edutech komprehensif yang dirancang untuk membantu dokter umum mempersiapkan diri menghadapi ujian seleksi Program Pendidikan Dokter Spesialis (PPDS). Aplikasi ini memanfaatkan kecerdasan buatan (Google Gemini 2.5) untuk membuat simulasi ujian yang adaptif, realistis, dan mendalam.

## 🚀 Fitur Utama

### 1. Bank Soal AI & Exam Creator
- **Generasi Soal Otomatis**: Membuat ribuan soal MCQ, Vignette Kasus, dan Clinical Reasoning secara instan dengan berbagai tingkat kesulitan dan spesialisasi.
- **Editor Kaya Fitur**: Mendukung upload gambar, format rich-text, dan pengaturan taksonomi error (bias kognitif).
- **Mode Ujian**: Simulasi CAT (*Computer Assisted Test*) dengan timer, flagging soal, dan auto-save progress.

### 2. Virtual OSCE dengan Gemini Live
- **Interaksi Suara Real-time**: Berlatih anamnesis dengan "Pasien Virtual" yang merespons suara Anda secara natural menggunakan **Gemini Live API**.
- **Checklist Penilaian**: Penilaian mandiri berbasis kompetensi untuk setiap station (Anamnesis, PF, Edukasi).
- **Visualisasi Audio**: Indikator visual saat pasien berbicara atau mendengarkan.

### 3. Clinical Reasoning Simulator
- **Latihan Bertahap**: Simulasikan alur berpikir klinis mulai dari *Problem Representation*, Diagnosis Banding, hingga Tatalaksana.
- **Q-Sort Mechanics**: Urutkan prioritas tindakan (misal: Urutan MONA pada ACS) dengan fitur drag-and-drop.
- **Safety Layer**: Deteksi otomatis "Critical Errors" atau tindakan fatal yang membahayakan pasien.

### 4. Analitik & Performa
- **Cohort Benchmarking**: Bandingkan skor Anda dengan persentil peer-group (nasional/institusi).
- **High-Yield Heatmap**: Visualisasi topik yang paling sering muncul dan performa Anda di topik tersebut.
- **Fatigue Analysis**: Grafik penurunan fokus dan akurasi berdasarkan durasi pengerjaan soal.

### 5. E-Logbook & Mentor
- **Digital Portfolio**: Catat kasus dan tindakan klinis dengan verifikasi digital.
- **Mentor Marketplace**: Cari dan booking sesi bimbingan privat dengan residen senior atau konsulen.
- **Diskusi Kasus**: Forum diskusi kasus sulit yang terstruktur.

## 🛠️ Teknologi

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS
- **AI Integration**: Google GenAI SDK (`@google/genai`) - Menggunakan model `gemini-2.5-flash` untuk teks dan `gemini-2.5-flash-native-audio-preview` untuk suara.
- **Visualization**: Recharts (Grafik & Heatmap)
- **Icons**: Lucide React

## 📦 Instalasi & Penggunaan

1.  **Clone Repository**
    ```bash
    git clone https://github.com/sobri3195/sinaesta.git
    cd sinaesta
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Konfigurasi API Key**
    Aplikasi ini membutuhkan API Key Google Gemini yang valid. Pastikan environment variable `API_KEY` tersedia di lingkungan eksekusi.

4.  **Jalankan Aplikasi**
    ```bash
    npm run dev
    ```

## 🔑 Struktur Proyek

- `/components`: Komponen UI modular (ExamTaker, OSCEMode, Dashboard, dll).
- `/services`: Logika integrasi Gemini AI (`geminiService.ts`) untuk generate soal, feedback, dan gambar.
- `/types`: Definisi TypeScript (Interfaces & Enums) untuk integritas data medis.
- `/mockData.ts`: Dummy data lengkap untuk semua specialties dengan soal, flashcards, OSCE stations, dll.
- `FLOWS.md`: Dokumentasi alur aplikasi komprehensif untuk setiap role (Student, Teacher, Admin).
- `DATA_BY_SPECIALTY.md`: Penjelasan struktur data untuk setiap specialty.

## 📚 Dokumentasi Alur

Untuk memahami alur aplikasi secara menyeluruh, baca:

1. **FLOWS.md** - Dokumentasi lengkap tentang:
    - Public Flows (Landing, Registration)
    - Student Flows (Dashboard, Exams, Flashcards, OSCE, Clinical Reasoning, dll)
    - Teacher/Mentor Flows (Sessions, Logbook Review, Forum)
    - Admin Flows (Question Bank, Excel Import, Blueprint, Analytics)
    - Data Flow Architecture
    - State Management
    - UI/UX Patterns

2. **DATA_BY_SPECIALTY.md** - Penjelasan:
    - Data untuk setiap specialty (12 specialties)
    - Struktur questions, flashcards, OSCE stations
    - Scoring & weighting system
    - Quality metrics (Q-QS)

3. **USER_WORKFLOW.md** - Panduan lengkap untuk Student:
    - Registrasi & Login
    - Dashboard Overview
    - Exam Taking Workflow
    - Flashcards, OSCE, Clinical Reasoning
    - Spot Dx Drill, Microlearning
    - Logbook & Analytics
    - Settings & Troubleshooting

4. **ADMIN_WORKFLOW.md** - Panduan lengkap untuk Admin:
    - Dashboard Overview
    - Bank Soal Management
    - Exam Creator
    - Excel Import
    - Blueprint Manager
    - Knowledge Base Manager
    - OSCE Manager
    - User & Cohort Management
    - Analytics & Quality Dashboard

5. **MISSING_ITEMS.md** - Item yang belum diimplementasikan:
    - Backend Infrastructure (Server, API, Database)
    - Authentication System
    - File Storage
    - Real-time Features
    - Email Notifications
    - Payment System
    - Monitoring & Logging
    - Testing & Deployment
    - Recommendations & Roadmap

6. **mockData.ts** - Implementation:
    - generateExamsForSpecialty() - Generate exams per specialty
    - generateFlashcardDecks() - Flashcard decks
    - generateOSCEStations() - OSCE stations
    - generateSpotDxItems() - Spot diagnosis items
    - Mock users (MOCK_STUDENT, MOCK_ADMIN, MOCK_TEACHER)

## 🎯 Alur Aplikasi Singkat

### Student Journey
```
Landing Page → Register (Pilih Specialty) → Dashboard 
  → Available Exams (filtered by specialty)
  → Take Exam → Results & Feedback
  → Akses modul lain: Flashcards, OSCE, Clinical Reasoning, dll
```

### Admin Journey
```
Landing Page → Admin Dashboard → Bank Soal
  → Create/Import Exams → Questions Review (QC)
  → Blueprint Manager → Knowledge Base
  → User Management → Analytics
```

### Data Generation
```
User memilih Specialty (misal: Surgery)
  ↓
generateExamsForSpecialty('Surgery')
  ↓
Exams dengan Surgery-specific questions muncul di dashboard
```

## 🧪 Testing dengan Mock Data

Aplikasi sudah mempunyai **12 specialties** dengan data lengkap:

1. **Internal Medicine** - 2 exams, flashcards, OSCE stations
2. **Surgery** - 2 exams, flashcards, OSCE stations
3. **Pediatrics** - 2 exams, flashcards, OSCE stations
4. **Obgyn** - 1 exam, flashcards
5. **Cardiology** - 1 exam, flashcards
6. **Neurology** - 2 exams, flashcards
7. **Anesthesiology** - 1 exam
8. **Radiology** - 1 exam
9. **Dermatology** - 1 exam
10. **Ophthalmology** - 1 exam
11. **ENT** - 1 exam
12. **Psychiatry** - 1 exam

Setiap specialty mempunyai:
- Multiple choice questions (MCQ)
- Weighted scoring system
- Explanations & rationale
- Domain classification (Diagnosis, Therapy, Investigation, Mechanism, Patient Safety)
- Flashcard decks untuk quick review
- OSCE stations dengan checklists
- Case vignettes dengan lab/imaging data

## 🔄 Development Flow

1. **Branch**: `fix-flows-clarify-add-dummy-data-questions-by-prodi`
2. **Changes**:
   - ✅ Clarified application flows (alur aplikasi jadi lebih jelas)
   - ✅ Added comprehensive mock data (data dummy untuk semua prodi)
   - ✅ Centralized data generation (centralize di mockData.ts)
   - ✅ Full documentation (FLOWS.md, DATA_BY_SPECIALTY.md)
3. **Testing**: Buka aplikasi, select specialty, lihat data-nya load sesuai specialty

## 🚀 Next Steps

- [ ] Connect to backend API untuk persistent storage
- [ ] Implement adaptive difficulty based on performance
- [ ] Add video content integration untuk case vignettes
- [ ] Integrate Gemini for real-time feedback generation
- [ ] Add progress tracking & analytics dashboard
- [ ] Implement Excel import feature for bulk question upload

## 🤝 Kontribusi

Sinaesta dikembangkan untuk mendemonstrasikan potensi GenAI dalam pendidikan kedokteran. Fitur seperti **Spot Diagnosis Drill** dan **Microlearning Hub** dirancang untuk memaksimalkan retensi materi dalam waktu singkat.

---

## 👨‍💻 Author

**Lettu Kes dr. Muhammad Sobri Maulana, S.Kom, CEH, OSCP, OSCE**

- 🌐 GitHub: [github.com/sobri3195](https://github.com/sobri3195)
- 📧 Email: [muhammadsobrimaulana31@gmail.com](mailto:muhammadsobrimaulana31@gmail.com)
- 🌐 Website: [muhammadsobrimaulana.netlify.app](https://muhammadsobrimaulana.netlify.app)
- 🌐 Portfolio: [muhammad-sobri-maulana-kvr6a.sevalla.page](https://muhammad-sobri-maulana-kvr6a.sevalla.page)
- 🛒 Toko Online: [Pegasus Shop](https://pegasus-shop.netlify.app)

## 📱 Social Media

- 📺 YouTube: [@muhammadsobrimaulana6013](https://www.youtube.com/@muhammadsobrimaulana6013)
- 📱 TikTok: [@dr.sobri](https://www.tiktok.com/@dr.sobri)
- 💬 Telegram: [winlin_exploit](https://t.me/winlin_exploit)
- 📱 Grup WhatsApp: [Gabung Disini](https://chat.whatsapp.com/B8nwRZOBMo64GjTwdXV8Bl)

## 💰 Donation & Support

Jika Anda merasa terbantu dengan proyek ini, Anda dapat mendukung pengembangan melalui:

- ☕ **Trakteer**: [trakteer.id/g9mkave5gauns962u07t](https://trakteer.id/g9mkave5gauns962u07t)
- 💎 **Lynk**: [lynk.id/muhsobrimaulana](https://lynk.id/muhsobrimaulana)
- 🎨 **Karya Karsa**: [karyakarsa.com/muhammadsobrimaulana](https://karyakarsa.com/muhammadsobrimaulana)
- 💸 **Nyawer**: [nyawer.co/MuhammadSobriMaulana](https://nyawer.co/MuhammadSobriMaulana)
- 🛍️ **Gumroad**: [maulanasobri.gumroad.com](https://maulanasobri.gumroad.com)

---

*Built with ❤️ for Medical Education*
