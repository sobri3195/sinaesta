import React from 'react';
import { Accessibility, Mail, Keyboard, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface AccessibilityStatementProps {
  onBack: () => void;
}

const AccessibilityStatement: React.FC<AccessibilityStatementProps> = ({ onBack }) => {
  return (
    <div className="h-full bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <button
          onClick={onBack}
          className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          aria-label="Kembali ke halaman sebelumnya"
        >
          ← Kembali
        </button>

        <header className="space-y-2">
          <div className="flex items-center gap-3 text-indigo-600">
            <Accessibility className="w-7 h-7" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Pernyataan Aksesibilitas</h1>
          </div>
          <p className="text-gray-600">
            Sinaesta berkomitmen memenuhi WCAG 2.1 AA agar platform dapat digunakan oleh semua peserta didik,
            termasuk pengguna pembaca layar, navigasi keyboard, dan kebutuhan visual khusus.
          </p>
        </header>

        <section className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            Fitur Aksesibilitas Utama
          </h2>
          <ul className="list-disc pl-6 space-y-2 text-sm text-gray-600">
            <li>Mode kontras tinggi, ukuran teks hingga 200%, dan pengurangan animasi.</li>
            <li>Kontrol TTS untuk membaca soal, instruksi, dan umpan balik.</li>
            <li>Indikator fokus yang jelas serta tautan “Skip to content”.</li>
            <li>Struktur heading yang konsisten dan label ARIA untuk elemen interaktif.</li>
          </ul>
        </section>

        <section className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-indigo-600" />
            Panduan Pintasan Keyboard
          </h2>
          <ul className="list-disc pl-6 space-y-2 text-sm text-gray-600">
            <li><strong>Alt + S</strong>: Buka pengaturan aksesibilitas atau settings.</li>
            <li><strong>Alt + D</strong>: Kembali ke dashboard.</li>
            <li><strong>Alt + /</strong>: Fokus ke pencarian jika tersedia.</li>
            <li><strong>Tab / Shift + Tab</strong>: Navigasi antar elemen interaktif.</li>
          </ul>
        </section>

        <section className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Instruksi Pembaca Layar</h2>
          <p className="text-sm text-gray-600">
            Pastikan mode “Hint Pembaca Layar” diaktifkan di pengaturan aksesibilitas untuk mendapatkan
            deskripsi tambahan pada navigasi utama dan komponen dinamis.
          </p>
          <p className="text-sm text-gray-600">
            Pengumuman status dan perubahan tampilan akan muncul melalui region <em>aria-live</em>.
          </p>
        </section>

        <section className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Keterbatasan yang Diketahui
          </h2>
          <ul className="list-disc pl-6 space-y-2 text-sm text-gray-600">
            <li>Beberapa konten pihak ketiga mungkin belum sepenuhnya mendukung TTS.</li>
            <li>Kontras tinggi perlu pengecekan lanjutan untuk konten yang diunggah pengguna.</li>
          </ul>
        </section>

        <section className="bg-white border border-gray-200 rounded-2xl p-6 space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Mail className="w-5 h-5 text-indigo-600" />
            Hubungi Kami
          </h2>
          <p className="text-sm text-gray-600">
            Jika Anda menemukan kendala aksesibilitas, hubungi tim kami di{' '}
            <a className="text-indigo-600 font-semibold" href="mailto:accessibility@sinaesta.id">
              accessibility@sinaesta.id
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
};

export default AccessibilityStatement;
