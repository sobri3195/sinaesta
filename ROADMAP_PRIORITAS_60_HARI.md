# Roadmap Prioritas 60 Hari: Reliability, Performance, Security

Dokumen ini merangkum masalah utama saat ini, 3 prioritas strategis, acceptance criteria terukur, rencana implementasi bertahap, risiko, dan metrik keberhasilan pasca-rilis.

## 1) Daftar Masalah Utama Saat Ini

1. **Reliabilitas data dan mode operasional masih ambigu (Demo vs Backend).**
   Pengguna dapat berpindah mode yang berbeda perilakunya, sehingga risiko inkonsistensi data, kebingungan state, dan support ticket meningkat.
2. **Akurasi user journey kritikal (auth → onboarding → exam) belum sepenuhnya terukur end-to-end.**
   Fitur sudah banyak, namun guardrail KPI funnel dan deteksi drop-off belum menjadi bagian inti rilis.
3. **Performa frontend pada komponen berat belum ditata sebagai SLO produk.**
   Halaman dengan data/visualisasi/komponen kompleks berpotensi membebani perangkat menengah.
4. **Keamanan sudah ada baseline, tetapi hardening operasional belum lengkap.**
   Risiko terbesar biasanya muncul di refresh token lifecycle, audit trail, abuse protection, dan secret hygiene.
5. **Kematangan observability dan quality gate belum cukup untuk scale.**
   Tanpa error budget, tracing, dan test gate pada alur kritikal, regresi produksi sulit dicegah dini.

---

## 2) Tiga Prioritas Peningkatan + Alasan Bisnis-Teknis

### Prioritas 1 — Stabilisasi Journey Kritis Pengguna
**(Auth + Onboarding + Exam Session Reliability)**

**Dampak bisnis:**
- Ini jalur konversi utama: jika login/onboarding/exam terganggu, retensi turun langsung.
- Menurunkan friction pengguna baru, meningkatkan completion rate ujian, dan trust pada platform.

**Feasibility teknis:**
- Arsitektur auth dan API sudah tersedia; fokusnya pada penyelarasan flow, state handling, dan fallback terstandar.
- Quick win bisa dilakukan tanpa refactor total.

### Prioritas 2 — Performance & UX Responsiveness untuk Halaman Bernilai Tinggi

**Dampak bisnis:**
- UX lambat menurunkan engagement belajar dan durasi sesi.
- Performa yang baik meningkatkan persepsi kualitas produk dan memudahkan adopsi pada perangkat beragam.

**Feasibility teknis:**
- Optimasi terarah (code splitting, lazy load, memoization, virtualization, cache strategy) bisa dilakukan bertahap dan terukur.

### Prioritas 3 — Security & Operational Readiness
**(Hardening + Observability + Quality Gates)**

**Dampak bisnis:**
- Menekan risiko insiden keamanan/reputasi.
- Mengurangi biaya incident response dan downtime.

**Feasibility teknis:**
- Komponen keamanan dasar sudah ada; tinggal memperkuat policy, monitoring, dan automation CI/CD.

---

## 3) Acceptance Criteria Terukur per Prioritas

### Prioritas 1: Journey Kritis
- **AC1.1** Login sukses ke dashboard < **2 detik p95** (koneksi normal) pada mode backend.
- **AC1.2** **Exam autosave** berjalan periodik (<=30 detik) dan restore state berhasil setelah refresh/tab crash pada >= **99%** skenario uji.
- **AC1.3** Drop-off dari halaman login ke mulai ujian pertama turun minimal **20%** dalam 30 hari.
- **AC1.4** Error rate endpoint auth kritikal (`/login`, `/refresh`, `/logout`) < **1%** harian.

### Prioritas 2: Performa & UX
- **AC2.1** Core Web Vitals target: **LCP < 2.5s**, **INP < 200ms**, **CLS < 0.1** untuk dashboard/exam page (p75).
- **AC2.2** Initial JS payload halaman utama turun minimal **30%** dari baseline.
- **AC2.3** Waktu render interaksi utama (buka exam, navigasi soal, buka analytics) membaik minimal **25%** (p95).
- **AC2.4** Tidak ada regression UX kritikal pada uji E2E smoke flow.

### Prioritas 3: Security & Operational Readiness
- **AC3.1** Semua endpoint sensitif memiliki rate limiting efektif + alert jika threshold abuse tercapai.
- **AC3.2** Audit log untuk aksi admin penting (create/update/delete konten, role change) tercatat **100%**.
- **AC3.3** Dependency critical vulnerability = **0** pada pipeline release.
- **AC3.4** CI quality gate wajib lulus: unit/integration test kritikal + E2E smoke + static security checks.

---

## 4) Rencana Implementasi Bertahap

### Fase Quick Wins (0–4 minggu)
1. **Journey audit + instrumentation funnel**
   - Pasang event analytics standar: login attempt, login success, onboarding complete, exam start, exam submit.
2. **Perbaikan state handling auth & exam session**
   - Standarisasi token refresh handling, retry policy, dan fallback UX saat API timeout.
3. **Optimasi frontend cepat**
   - Lazy-load modul non-kritis, route-based code splitting, optimasi bundle vendor.
4. **Security quick hardening**
   - Verifikasi rate limit policy konsisten, review CORS origin allowlist, cookie flags produksi.
5. **Quality gate minimal**
   - Jalur CI wajib untuk smoke test auth + exam basic flow.

### Fase Jangka Menengah (1–3 bulan)
1. **Reliability architecture**
   - Session recovery yang lebih robust (checkpoint engine + conflict resolution sederhana).
2. **Advanced performance**
   - Data caching policy per fitur, virtualization list besar, prefetch terarah berdasarkan user intent.
3. **Operational excellence**
   - Dashboard observability (error, latency, funnel), alerting SLO, runbook incident.
4. **Security maturity**
   - Audit trail komprehensif, secret rotation policy, dan periodic penetration testing.
5. **Experimentation loop**
   - A/B test onboarding dan exam UX agar peningkatan berbasis data, bukan asumsi.

---

## 5) Risiko dan Mitigasi

1. **Risiko: Scope creep karena fitur sangat luas.**
   - **Mitigasi:** Lock 3 prioritas, gunakan definition-of-done berbasis KPI, review mingguan lintas produk-teknik.
2. **Risiko: Optimasi performa merusak stabilitas fitur lama.**
   - **Mitigasi:** Canary release, feature flag, dan E2E smoke wajib sebelum rollout penuh.
3. **Risiko: Hardening keamanan menambah friction UX (mis. rate limit terlalu ketat).**
   - **Mitigasi:** Threshold bertahap, whitelist internal ops, tuning berbasis observasi trafik real.
4. **Risiko: Tim overload karena paralel inisiatif.**
   - **Mitigasi:** Urutkan quick wins berimpact tinggi dan kompleksitas rendah terlebih dahulu.
5. **Risiko: Data metrik tidak konsisten antar environment.**
   - **Mitigasi:** Definisi event tunggal, naming convention baku, dan validasi dashboard pra-rilis.

---

## 6) Metrik Keberhasilan Pasca-Rilis

### Metrik Produk & UX
- Conversion rate: **login → exam start**.
- 7-day retention untuk user baru.
- Average session duration pada modul belajar inti.
- Task success rate pada alur: login, mulai ujian, submit ujian.

### Metrik Performa
- LCP/INP/CLS (p75) untuk halaman utama.
- API latency p95 endpoint kritikal.
- Crash-free/session restore success rate.

### Metrik Keamanan & Operasional
- Auth failure/error rate harian.
- Jumlah insiden keamanan severity tinggi.
- MTTR (mean time to recovery) insiden produksi.
- Rasio deployment sukses tanpa rollback.

### Target Awal (60 hari)
- Drop-off funnel login→exam turun **>=20%**.
- LCP dashboard membaik ke **<2.5s p75**.
- Auth endpoint error rate stabil di **<1%**.
- Nol insiden keamanan kritikal akibat misconfiguration.
