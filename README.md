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
    git clone https://github.com/username/sinaesta.git
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
    npm start
    ```

## 🔑 Struktur Proyek

- `/components`: Komponen UI modular (ExamTaker, OSCEMode, Dashboard, dll).
- `/services`: Logika integrasi Gemini AI (`geminiService.ts`) untuk generate soal, feedback, dan gambar.
- `/types`: Definisi TypeScript (Interfaces & Enums) untuk integritas data medis.

## 🤝 Kontribusi

Sinaesta dikembangkan untuk mendemonstrasikan potensi GenAI dalam pendidikan kedokteran. Fitur seperti **Spot Diagnosis Drill** dan **Microlearning Hub** dirancang untuk memaksimalkan retensi materi dalam waktu singkat.

---
*Built with ❤️ for Medical Education*