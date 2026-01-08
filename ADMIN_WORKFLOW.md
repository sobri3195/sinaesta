# Admin Workflow - SINAESTA Digital

## Panduan Penggunaan untuk Admin (Program Admin & Super Admin)

---

## 1. Overview & Access

### 1.1 Admin Roles

**Role Hierarchy**:

1. **Super Admin**
   - Full access to all features
   - User management
   - System settings
   - Billing & subscriptions (future)

2. **Program Admin**
   - Question bank management
   - Exam creation & management
   - Blueprint management
   - Analytics & reporting
   - User management (limited)

3. **Teacher/Mentor**
   - Create exams & questions
   - Review logbooks
   - Mentor sessions
   - Case discussions
   - (Not covered in this doc - see TEACHER_WORKFLOW.md)

---

### 1.2 Login sebagai Admin

**Langkah-langkah**:

1. Buka aplikasi di browser
2. Di **Landing Page**, klik **"Login"**
3. Pilih **"Program Admin"** atau **"Super Admin"**
4. Masukkan email & password
5. Klik **"Login"**
6. Anda akan di-redirect ke **Admin Dashboard**

---

## 2. Admin Dashboard

### 2.1 Dashboard Overview

Setelah login sebagai Admin, Anda akan melihat:

**Header**:
- Nama Admin
- Role badge (Program Admin / Super Admin)
- Settings & Logout buttons

**Main Content**:

**Statistics Cards** (Program Admin & Super Admin):
- Total Students
- Total Teachers/Mentors
- Total Exams
- Total Questions
- Total Exam Results
- Active Cohorts

**Quick Actions**:
- **"Input Soal Baru"** → Create new exam/questions
- **"Import Excel"** → Bulk import questions
- **"View Questions"** → Browse question bank
- **"Create Blueprint"** → Manage exam blueprint
- **"Manage Users"** → User management (Super Admin only)
- **"Analytics"** → View analytics dashboard (Program Admin only)

**Recent Activity**:
- Recent exam submissions
- New user registrations
- Question updates
- Logbook submissions

**Navigation Sidebar**:
- Dashboard
- Bank Soal (Question Bank)
- Exam Creator
- Excel Import
- Blueprint Manager
- Knowledge Base
- OSCE Manager
- User Management (Super Admin only)
- Cohort Management
- Analytics (Program Admin only)
- Quality Dashboard
- Admin Posts
- Settings
- Logout

---

## 3. Bank Soal (Question Bank) Management

### 3.1 Access Question Bank

**Langkah-langkah**:

1. Dari **Sidebar**, klik **"Bank Soal"**
2. View list of all questions across all specialties

---

### 3.2 Question Bank Overview

**Filter Options**:
- By Specialty (Internal Medicine, Surgery, dll)
- By Category (Cardiology, Trauma, dll)
- By Difficulty (Easy, Medium, Hard)
- By Domain (Diagnosis, Therapy, Investigation, Mechanism, Patient Safety)
- By Status (Draft, Review, Approved, Published, Flagged)
- By Exam ID

**Question List**:
For each question, display:
- Question text (preview)
- Specialty & Category
- Difficulty & Domain
- Status badge
- Question Type (MCQ, Vignette, Clinical Reasoning, Spot Dx)
- Quality Score (Q-QS)
- Actions: View, Edit, Delete, Approve, Flag

---

### 3.3 View Question Details

**Klik "View" pada suatu question**:

**Question Details**:
- Full question text
- All answer options (A, B, C, D)
- Correct answer highlighted
- Explanation & rationale
- Category & tags
- Difficulty & Domain
- Points (weighting)
- Linked vignette (if any)
- Linked guidelines/knowledge base (if any)

**Quality Metrics**:
- Difficulty Index (p-value)
- Discrimination Index (d-value)
- Distractor Efficiency
- Ambiguity Reports count
- Expert Rating (1-5)
- Quality Score (Q-QS)

**Usage Statistics**:
- Number of exams using this question
- Total attempts
- Correct rate
- Average time to answer

**Actions**:
- Edit question
- Copy to new exam
- Approve (if status = Review)
- Flag for review
- Delete

---

### 3.4 Create New Question (Manual)

**Langkah-langkah**:

1. Klik tombol **"Tambah Soal Baru"** di Bank Soal
2. Isi form:

**Question Form**:

**Basic Info**:
- Question Text* (wajib)
- Question Type*: MCQ / Vignette / Clinical Reasoning / Spot Diagnosis
- Specialty*: Pilih dari dropdown
- Category*: (misal: Cardiology, Trauma)
- Difficulty*: Easy / Medium / Hard
- Domain*: Diagnosis / Therapy / Investigation / Mechanism / Patient Safety
- Points*: Default 1, bisa diubah untuk weighted scoring

**Answer Options** (untuk MCQ):
- Option A* (wajib)
- Option B* (wajib)
- Option C* (wajib)
- Option D* (wajib)
- Correct Answer*: Pilih A/B/C/D

**Explanation**:
- Explanation Text*
- Rationale/References (optional)

**Vignette Link** (optional):
- Pilih existing vignette dari dropdown
- Atau create new vignette (lihat Vignette Builder section)

**Tags & Metadata** (optional):
- Tags untuk searching
- Linked guidelines/knowledge base
- Source/reference

**Status**:
- Draft / Review / Approved / Published

3. Klik **"Save"** untuk menyimpan
4. Question akan masuk ke Bank Soal

---

### 3.5 Edit Existing Question

**Langkah-langkah**:

1. Dari **Bank Soal**, klik **"Edit"** pada question yang ingin diubah
2. Form akan terisi dengan data existing
3. Ubah field yang diperlukan
4. Klik **"Save Changes"**

**Catatan**:
- Jika question sudah dipublish, edit akan membuat versi baru
- Versi lama tetap tersimpan untuk audit trail
- Perubahan tidak akan mempengaruhi exam results yang sudah ada

---

### 3.6 Delete Question

**Langkah-langkah**:

1. Dari **Bank Soal**, klik **"Delete"** pada question
2. Konfirmasi dengan **"Yes, Delete"**

**Catatan**:
- Soft delete (mark as deleted, tidak permanent)
- Question tidak akan ditampilkan di exam baru
- Exam yang sudah menggunakan question tidak terpengaruh

---

### 3.7 Approve Questions (Review Workflow)

**Langkah-langkah**:

1. Filter questions by status = **"Review"**
2. Klik question untuk review
3. Baca question, options, explanation
4. Cek quality metrics (Q-QS)
5. Actions:
   - **"Approve"** → Ubah status ke "Approved"
   - **"Reject"** → Ubah status ke "Draft" dengan comments
   - **"Request Revision"** → Ubah status ke "Draft" dengan feedback
   - **"Flag"** → Tandai untuk expert review

---

### 3.8 Bulk Actions

**Langkah-langkah**:

1. Select multiple questions dengan checkbox
2. Klik **"Bulk Actions"**
3. Pilih action:
   - Approve selected
   - Change status
   - Change specialty
   - Change difficulty
   - Export to Excel
   - Delete

---

## 4. Exam Creator

### 4.1 Access Exam Creator

**Langkah-langkah**:

1. Dari **Dashboard**, klik **"Input Soal Baru"**
2. Atau dari **Sidebar**, klik **"Exam Creator"**
3. Anda akan masuk ke **Exam Creator**

---

### 4.2 Create New Exam

**Langkah-langkah**:

**Step 1: Exam Info**

Isi form:

- **Title*** (wajib): Misal: "Ujian Latihan Cardiology - Batch 1"
- **Description**: Deskripsi exam
- **Specialty***: Pilih specialty dari dropdown
- **Topic**: Misal: "Cardiology", "Trauma", "Neonatology"
- **Duration*** (minutes): 60, 90, 120, dll
- **Mode***:
  - STANDARD - Normal MCQ exam
  - CLINICAL_CASE - Exam dengan vignettes
  - SPEED_DRILL - Fast-paced exam
- **Difficulty***: Easy / Medium / Hard

Klik **"Next: Add Questions"**

---

**Step 2: Add Questions**

Ada 2 cara:

**Option A: Manual Input**
1. Klik **"Tambah Soal Baru"**
2. Isi question form (sama seperti di Bank Soal)
3. Klik **"Save & Add Another"** atau **"Save & Finish"**

**Option B: Select from Bank Soal**
1. Klik **"Pilih dari Bank Soal"**
2. Filter questions by specialty, category, difficulty, domain
3. Select questions dengan checkbox
4. Klik **"Add Selected"**

**Step 3: Review & Arrange**

- View list of all added questions
- Drag and drop untuk reorder questions
- Edit question langsung di list
- Delete question dari exam
- View exam summary:
  - Total questions
  - Total points
  - Questions by domain breakdown
  - Questions by difficulty breakdown

Klik **"Next: Preview"**

---

**Step 4: Preview**

- Preview exam seperti yang dilihat student
- Cek questions, options, explanation
- Cek layout & formatting
- Cek timer & navigation

Klik **"Back to Edit"** untuk mengubah
Atau klik **"Publish Exam"** untuk publish

---

**Step 5: Publish**

- Set status ke **"Published"**
- Exam akan muncul di dashboard student
- Student dapat mengambil exam ini

---

### 4.3 Edit Existing Exam

**Langkah-langkah**:

1. Dari **Bank Soal** atau **Admin Dashboard**, cari exam
2. Klik **"Edit"** pada exam
3. Anda akan di-redirect ke **Exam Creator** dengan data existing
4. Ubah yang diperlukan
5. Klik **"Save Changes"**

**Catatan**:
- Jika exam sudah ada yang mengambil, edit akan membuat versi baru
- Student yang sudah mengerjakan exam lama tidak terpengaruh

---

### 4.4 Delete Exam

**Langkah-langkah**:

1. Dari **Bank Soal**, klik **"Delete"** pada exam
2. Konfirmasi dengan **"Yes, Delete"**

**Catatan**:
- Soft delete (mark as deleted)
- Exam tidak akan muncul di dashboard student
- Exam results yang sudah ada tetap tersimpan

---

## 5. Excel Import

### 5.1 Access Excel Import

**Langkah-langkah**:

1. Dari **Admin Dashboard**, klik **"Import Excel"**
2. Atau dari **Sidebar**, klik **"Excel Import"**
3. Anda akan masuk ke **Excel Import Component**

---

### 5.2 Download Template

**Langkah-langkah**:

1. Klik tombol **"Download Template"**
2. Pilih format:
   - **CSV** (.csv)
   - **Excel** (.xlsx)
3. File akan di-download

**Template Columns**:

| Column | Required | Description |
|--------|----------|-------------|
| Question | Yes | Pertanyaan (teks) |
| Option A | Yes | Opsi jawaban A |
| Option B | Yes | Opsi jawaban B |
| Option C | Yes | Opsi jawaban C |
| Option D | Yes | Opsi jawaban D |
| Correct Answer | Yes | A, B, C, atau D |
| Category | Yes | (misal: Cardiology) |
| Specialty | Yes | (misal: Internal Medicine) |
| Domain | Yes | Diagnosis/Therapy/Investigation/Mechanism/Patient Safety |
| Difficulty | Yes | Easy/Medium/Hard |
| Points | No | Default 1, bisa diubah |
| Explanation | Yes | Penjelasan jawaban benar |

**Sample Data**:
```
Question,Option A,Option B,Option C,Option D,Correct Answer,Category,Specialty,Domain,Difficulty,Points,Explanation
"Patient dengan chest pain, di ECG ST elevation di lead V1-V4. Diagnosis paling mungkin?",Inferior MI,Anterior MI,Lateral MI,Posterior MI,B,Cardiology,Internal Medicine,Diagnosis,Medium,1,"ST elevation di V1-V4 adalah ciri khas Anterior MI"
```

---

### 5.3 Upload Excel File

**Langkah-langkah**:

1. Klik tombol **"Upload File"**
2. Pilih file dari komputer:
   - **Excel** (.xlsx, .xls)
   - **CSV** (.csv)
3. System akan validasi file:
   - Cek format file
   - Cek required columns
   - Cek data validity
4. Preview data akan muncul

**Validation Errors**:
- Missing required columns
- Invalid correct answer format (harus A, B, C, atau D)
- Missing required fields
- Invalid difficulty/domain/specialty values

---

### 5.4 Review & Edit Data

**Preview Table**:
- Tampilkan semua rows dari file
- Highlight rows dengan errors (warna merah)
- Edit inline jika ada salah
- Delete rows jika tidak valid

**Validation Summary**:
- Total rows: N
- Valid rows: X
- Invalid rows: Y
- Errors to fix: Z

---

### 5.5 Import Questions

**Langkah-langkah**:

1. Setelah review & edit, klik **"Import"**
2. System akan:
   - Parse semua valid rows
   - Create questions dari data
   - Assign ke "Draft" status
   - Add ke Bank Soal
3. Success message akan muncul:
   - "Successfully imported X questions"
   - "Failed to import Y questions"

**Import Options**:
- **Create New Exam** dengan these questions
- **Add to Existing Exam** (pilih exam)
- **Add to Bank Soal Only**

---

### 5.6 Post-Import Actions

**Next Steps**:
1. Review questions di Bank Soal
2. Approve questions yang valid
3. Create exam dengan questions yang diimport
4. Quality check oleh expert reviewer

---

## 6. Blueprint Manager

### 6.1 Access Blueprint Manager

**Langkah-langkah**:

1. Dari **Sidebar**, klik **"Blueprint Manager"**
2. View list of existing blueprints

---

### 6.2 Blueprint Overview

**What is Blueprint?**
Blueprint adalah template yang mendefinisikan:
- Topic distribution (apa topik dan persentasenya)
- Domain distribution (apa domain dan persentasenya)
- Difficulty distribution (apa difficulty dan persentasenya)
- Target total items (jumlah soal)
- Quality requirements

**Purpose**:
- Memastikan exam balanced dan komprehensif
- Meng-cover semua topik penting
- Sesuai dengan kurikulum/standar

---

### 6.3 Create Blueprint

**Langkah-langkah**:

1. Klik **"Create Blueprint"**
2. Isi form:

**Basic Info**:
- Blueprint Name* (misal: "Blueprint Internal Medicine 2025")
- Specialty* (misal: "Internal Medicine")
- Target Total Items* (misal: 200)

**Topic Distribution**:
- Add topics dengan target %:
  - Cardiology: 20%
  - Gastroenterology: 15%
  - Pulmonology: 10%
  - Nephrology: 10%
  - Endocrinology: 10%
  - Rheumatology: 8%
  - Hematology: 8%
  - Infectious Disease: 8%
  - Dermatology: 6%
  - Neurology: 5%
- Total harus = 100%

**Domain Distribution**:
- Diagnosis: 40%
- Therapy: 35%
- Investigation: 20%
- Mechanism: 3%
- Patient Safety: 2%
- Total harus = 100%

**Difficulty Distribution**:
- Easy: 30%
- Medium: 50%
- Hard: 20%
- Total harus = 100%

3. Klik **"Save Blueprint"**

---

### 6.4 Analyze Exam Bank vs Blueprint

**Langkah-langkah**:

1. Dari **Blueprint Manager**, klik blueprint yang ingin dianalisis
2. Klik **"Analyze Exam Bank"**
3. System akan:
   - Hitung current distribution dari exam bank
   - Bandingkan dengan blueprint target
   - Identify gaps (topik yang kurang)
   - Identify surplus (topik yang kelebihan)

**Analysis Output**:
- Topic Distribution: Current vs Target (with gaps highlighted)
- Domain Distribution: Current vs Target
- Difficulty Distribution: Current vs Target
- Gaps Report:
  - Topics yang butuh lebih banyak questions
  - Jumlah questions yang perlu ditambah
- Recommendations:
  - Prioritas topik untuk ditambahkan
  - Suggested difficulty untuk new questions

---

### 6.5 Generate Exam from Blueprint

**Langkah-langkah**:

1. Dari **Blueprint Manager**, klik blueprint
2. Klik **"Generate Exam"**
3. System akan:
   - Pilih questions dari bank soal
   - Sesuaikan dengan blueprint distribution
   - Balance topics, domains, difficulties
   - Generate exam dengan jumlah questions yang sesuai
4. Review generated exam
5. Edit jika diperlukan
6. Publish exam

---

### 6.6 Edit Blueprint

**Langkah-langkah**:

1. Dari **Blueprint Manager**, klik **"Edit"** pada blueprint
2. Ubah distribution yang diperlukan
3. Klik **"Save Changes"**

**Catatan**:
- Pastikan total = 100% untuk setiap kategori
- Changes tidak akan mempengaruhi exam yang sudah generated

---

### 6.7 Delete Blueprint

**Langkah-langkah**:

1. Dari **Blueprint Manager**, klik **"Delete"** pada blueprint
2. Konfirmasi dengan **"Yes, Delete"**

**Catatan**:
- Soft delete
- Exam yang sudah generated dari blueprint tidak terpengaruh

---

## 7. Knowledge Base Manager

### 7.1 Access Knowledge Base

**Langkah-langkah**:

1. Dari **Sidebar**, klik **"Knowledge Base"**
2. View list of knowledge base items

---

### 7.2 Knowledge Base Overview

**Types of Knowledge Base Items**:
- **Guidelines** - Clinical guidelines from organizations
- **Infographics** - Visual summaries/algorithms
- **Microlearning Packs** - Quick study materials
- **References** - Books, articles, studies

**Purpose**:
- Link questions ke guidelines (untuk quality check)
- Provide reference untuk students
- Support clinical reasoning

---

### 7.3 Add Guidelines

**Langkah-langkah**:

1. Klik **"Add Guideline"**
2. Isi form:
   - Title* (misal: "Management of Acute Myocardial Infarction")
   - Organization* (misal: "AHA/ACC")
   - Year* (misal: 2024)
   - URL* (link ke guideline)
   - Tags: (misal: Cardiology, MI, STEMI)
   - Status: Active / Archived
3. Klik **"Save"**

**Link to Questions**:
- Setelah guideline disimpan, dapat dilink ke questions
- Pada question form, pilih guideline dari dropdown
- System akan cek mismatch (jika question tidak sesuai guideline)

---

### 7.4 Add Infographics

**Langkah-langkah**:

1. Klik **"Add Infographic"**
2. Isi form:
   - Title* (misal: "ACS Management Algorithm")
   - Type*: Algorithm / Summary / Mnemonic
   - Image URL* atau Upload Image
   - Tags: (misal: Cardiology, Algorithm)
   - Specialty* (misal: "Internal Medicine")
   - Status: Active / Archived
3. Klik **"Save"**

---

### 7.5 Add Microlearning Packs

**Langkah-langkah**:

1. Klik **"Add Microlearning Pack"**
2. Isi form:
   - Pack Name* (misal: "Hypertension Quick Review")
   - Specialty* (misal: "Internal Medicine")
   - Duration* (minutes): 5-7
   - Description
   - Status: Active / Archived
3. Add items ke pack:
   - Flashcard
   - Mini-case
   - Quiz
   - Video link
4. Klik **"Save Pack"**

---

### 7.6 Link Knowledge Base to Questions

**Langkah-langkah**:

1. Edit question
2. Di bagian **"Linked Guidelines/Knowledge Base"**
3. Pilih guideline/infographic dari dropdown
4. Klik **"Save Changes"**

**Benefits**:
- System akan alert jika question content mismatch dengan guideline
- Student dapat click untuk buka guideline dari exam
- Support clinical reasoning

---

### 7.7 Search & Browse Knowledge Base

**Langkah-langkah**:

1. Dari **Knowledge Base**, gunakan search bar
2. Filter by:
   - Type (Guidelines, Infographics, Microlearning)
   - Specialty
   - Tags
   - Status (Active / Archived)
3. View details
4. Edit, Delete, atau Link to Questions

---

## 8. OSCE Manager

### 8.1 Access OSCE Manager

**Langkah-langkah**:

1. Dari **Sidebar**, klik **"OSCE Manager"**
2. View list of OSCE stations

---

### 8.2 Create OSCE Station

**Langkah-langkah**:

1. Klik **"Create Station"**
2. Isi form:

**Basic Info**:
- Station Title* (misal: "Chest Pain Station")
- Specialty* (misal: "Internal Medicine")
- Scenario* (deskripsi kasus)
- Instruction* (apa yang harus student lakukan)
- Duration* (minutes): 15-30

**Checklist Items**:
Add checklist items:
1. Anamnesis Items:
   - "Ask about chest pain character" (3 points)
   - "Ask about radiation of pain" (2 points)
   - "Ask about associated symptoms" (3 points)
2. Physical Exam Items:
   - "Auscultate heart sounds" (3 points)
   - "Check blood pressure" (2 points)
   - "Inspect for JVD" (2 points)
3. Communication:
   - "Explain findings to patient" (3 points)
   - "Address patient concerns" (2 points)

**Category**:
- Setiap checklist item punya category:
  - Anamnesis
  - Physical Exam
  - Diagnosis
  - Management
  - Communication

**Rubric** (optional):
- Add detailed rubric untuk scoring guidelines
- Define pass/fail threshold per category

3. Klik **"Save Station"**

---

### 8.3 Edit OSCE Station

**Langkah-langkah**:

1. Dari **OSCE Manager**, klik **"Edit"** pada station
2. Ubah yang diperlukan
3. Klik **"Save Changes"**

---

### 8.4 Preview OSCE Station

**Langkah-langkah**:

1. Dari **OSCE Manager**, klik **"Preview"** pada station
2. Preview seperti yang dilihat student
3. Test checklist interaction

---

### 8.5 Delete OSCE Station

**Langkah-langkah**:

1. Dari **OSCE Manager**, klik **"Delete"** pada station
2. Konfirmasi dengan **"Yes, Delete"**

**Catatan**:
- Soft delete
- Student yang sudah mengerjakan tidak terpengaruh

---

## 9. User Management (Super Admin Only)

### 9.1 Access User Management

**Langkah-langkah**:

1. Dari **Sidebar**, klik **"User Management"**
2. View list of all users

---

### 9.2 User List & Filtering

**Filter Options**:
- By Role (Student, Teacher, Admin, Super Admin)
- By Status (Pending, Verified, Suspended)
- By Specialty
- By Batch/Cohort
- By Registration Date

**User List**:
For each user, display:
- Name & Email
- Role & Status badge
- Specialty
- Batch (jika ada)
- Registration Date
- Last Active
- Actions: View, Edit, Delete, Suspend, Verify

---

### 9.3 View User Details

**Klik "View" pada user**:

**User Profile**:
- Name, Email, Phone
- Avatar
- Role & Status
- Target Specialty
- Institution
- Batch ID
- STR Number
- Registration Date

**Activity History**:
- Exam results
- Logbook entries
- Study statistics
- Last active date

**Actions**:
- Edit user profile
- Change role
- Change status (verify, suspend, delete)
- Send message/notification
- View full activity history

---

### 9.4 Add New User

**Langkah-langkah**:

1. Klik **"Add User"**
2. Isi form:
   - Name* (wajib)
   - Email* (wajib)
   - Role* (Student/Teacher/Admin)
   - Specialty (untuk Student/Teacher)
   - Batch/Cohort (opsional)
   - Status (Pending/Verified)
3. Klik **"Save"**

**Actions after save**:
- Send welcome email (jika email service aktif)
- Set password atau send password reset link

---

### 9.5 Edit User

**Langkah-langkah**:

1. Klik **"Edit"** pada user
2. Ubah field yang diperlukan
3. Klik **"Save Changes"**

---

### 9.6 Change User Role

**Langkah-langkah**:

1. Edit user
2. Ubah **Role** dropdown
3. Klik **"Save Changes"**

**Catatan**:
- Role change akan mengubah user permissions
- Akses ke fitur akan berubah sesuai role baru

---

### 9.7 Suspend User

**Langkah-langkah**:

1. Klik **"Suspend"** pada user
2. Konfirmasi dengan **"Yes, Suspend"**

**Effects**:
- User tidak bisa login
- Status berubah ke **"Suspended"**
- Data user tetap tersimpan

**Unsuspend**:
1. Edit user
2. Ubah status ke **"Verified"** atau **"Pending"**
3. Klik **"Save Changes"**

---

### 9.8 Delete User

**Langkah-langkah**:

1. Klik **"Delete"** pada user
2. Konfirmasi dengan **"Yes, Delete"**

**Catatan**:
- Soft delete
- Data user tetap tersimpan untuk audit
- User tidak bisa login
- Exam results tetap tersimpan

---

### 9.9 Bulk Actions

**Langkah-langkah**:

1. Select multiple users dengan checkbox
2. Klik **"Bulk Actions"**
3. Pilih action:
   - Change role
   - Change status (Verify/Suspend)
   - Assign to batch
   - Export to CSV
   - Delete

---

## 10. Cohort Management

### 10.1 Access Cohort Management

**Langkah-langkah**:

1. Dari **Sidebar**, klik **"Cohort Management"**
2. View list of cohorts

---

### 10.2 Cohort Overview

**What is Cohort?**
Cohort adalah kelompok student yang:
- Masuk di batch yang sama
- Sama target specialty
- Mengikuti curriculum yang sama
- Dapat di-bandingkan performanya

**Purpose**:
- Group students untuk comparison
- Assign mentors
- Track group progress
- Generate cohort analytics

---

### 10.3 Create Cohort

**Langkah-langkah**:

1. Klik **"Create Cohort"**
2. Isi form:
   - Cohort Name* (misal: "Batch Januari 2026 - Internal Medicine")
   - Specialty* (misal: "Internal Medicine")
   - Start Date* (date)
   - End Date* (date)
   - Max Students* (misal: 50)
3. Klik **"Save Cohort"**

---

### 10.4 Add Students to Cohort

**Langkah-langkah**:

1. Klik cohort yang ingin di-manage
2. Klik **"Add Students"**
3. Select students yang belum punya batch
4. Klik **"Add Selected"**

**Catatan**:
- Student hanya bisa di 1 cohort
- Student specialty harus sama dengan cohort specialty

---

### 10.5 Assign Mentors to Cohort

**Langkah-langkah**:

1. Edit cohort
2. Di bagian **"Assign Mentors"**
3. Select teachers dari dropdown
4. Klik **"Add"**
5. Klik **"Save Changes"**

---

### 10.6 View Cohort Performance

**Langkah-langkah**:

1. Klik cohort
2. Klik **"View Performance"**
3. View:
   - List of students in cohort
   - Average score per student
   - Exam results
   - Progress tracking
   - Comparison vs other cohorts

---

### 10.7 Edit Cohort

**Langkah-langkah**:

1. Klik **"Edit"** pada cohort
2. Ubah field yang diperlukan
3. Klik **"Save Changes"**

---

### 10.8 Delete Cohort

**Langkah-langkah**:

1. Klik **"Delete"** pada cohort
2. Konfirmasi dengan **"Yes, Delete"**

**Catatan**:
- Soft delete
- Students akan unassigned dari cohort
- Exam results tetap tersimpan

---

## 11. Analytics Dashboard (Program Admin Only)

### 11.1 Access Analytics

**Langkah-langkah**:

1. Dari **Sidebar**, klik **"Analytics"**
2. View analytics dashboard

---

### 11.2 Overall Statistics

**Statistics Cards**:
- Total Students (active & inactive)
- Total Teachers/Mentors
- Total Exams (published)
- Total Questions (published)
- Total Exam Results
- Average Score (all exams)
- Total Study Hours

**Growth Metrics**:
- New students this month
- New exams this month
- Engagement rate
- Retention rate

---

### 11.3 Score Distribution Chart

**Chart**:
- Bar chart atau histogram
- X-axis: Score ranges (0-20, 21-40, 41-60, 61-80, 81-100)
- Y-axis: Number of students
- Color by specialty

**Insights**:
- Identify failing students (score < 60%)
- Identify high performers (score > 80%)
- Average score distribution

---

### 11.4 Time-to-Answer Analysis

**Chart**:
- Scatter plot atau line chart
- X-axis: Time taken (seconds)
- Y-axis: Score
- Each dot = 1 exam result

**Insights**:
- Correlation between time and score
- Average time per exam
- Fast vs slow performers

---

### 11.5 Fatigue Curve Analysis

**Chart**:
- Line chart
- X-axis: Question number (1, 2, 3, ..., N)
- Y-axis: Accuracy rate (% correct)
- Multiple lines per exam

**Insights**:
- Accuracy drop over time
- Identify when fatigue starts
- Optimal exam length

---

### 11.6 Difficulty Calibration

**Chart**:
- Bar chart
- X-axis: Questions (grouped by difficulty)
- Y-axis: P-value (Difficulty Index)
- Color: Green (good), Yellow (needs review), Red (too hard/easy)

**Insights**:
- Questions yang terlalu mudah (p-value > 0.9)
- Questions yang terlalu sulit (p-value < 0.2)
- Questions dengan optimal difficulty (p-value 0.3-0.7)

---

### 11.7 Specialty Performance Comparison

**Chart**:
- Grouped bar chart
- X-axis: Specialties
- Y-axis: Average Score
- Bars per specialty:
  - This month
  - Last month
  - Year-to-date

**Insights**:
- Best performing specialty
- Weakest performing specialty
- Trends over time

---

### 11.8 Top Performers

**List**:
- Top 10 students by average score
- Top 10 students by study hours
- Top 10 students by exam count
- Top 10 students by improvement rate

---

### 11.9 At-Risk Students

**List**:
- Students dengan average score < 60%
- Students dengan low engagement
- Students tidak login > 30 days
- Students dengan failing exam count > 3

**Actions**:
- Send reminder/notification
- Assign mentor
- Flag for intervention

---

### 11.10 Export Reports

**Langkah-langkah**:

1. Dari **Analytics**, klik **"Export Report"**
2. Pilih report type:
   - Overall statistics
   - Score distribution
   - Specialty comparison
   - Student performance
3. Pilih format:
   - PDF
   - Excel
   - CSV
4. Klik **"Export"**

---

## 12. Question Quality Dashboard

### 12.1 Access Quality Dashboard

**Langkah-langkah**:

1. Dari **Sidebar**, klik **"Quality Dashboard"**
2. View quality metrics

---

### 12.2 Quality Metrics Overview

**What is Q-QS (Question Quality Score)?**

Q-QS = Composite score dari:
1. **Difficulty Index (p-value)**:
   - 0 = semua salah
   - 1 = semua benar
   - Optimal: 0.3 - 0.7

2. **Discrimination Index (d-value)**:
   - -1 = low performers lebih benar
   - 1 = high performers lebih benar
   - Optimal: > 0.3

3. **Distractor Efficiency**:
   - Ratio of effective distractors
   - Optimal: > 0.7

4. **Ambiguity Reports**:
   - Number of reports from students
   - Lower is better

5. **Expert Rating**:
   - Rating 1-5 dari expert reviewer
   - Higher is better

**Q-QS Formula**:
```
Q-QS = (0.3 * p-value_normalized) +
       (0.3 * d-value) +
       (0.2 * distractor_efficiency) +
       (0.1 * (1 - ambiguity_normalized)) +
       (0.1 * expert_rating_normalized)
```

---

### 12.3 Quality Score Distribution

**Chart**:
- Histogram atau bar chart
- X-axis: Q-QS ranges (0-20, 21-40, 41-60, 61-80, 81-100)
- Y-axis: Number of questions
- Color: Red (< 40), Yellow (40-60), Green (> 60)

**Insights**:
- Percentage of good questions (> 60)
- Percentage of poor questions (< 40)
- Overall quality health

---

### 12.4 Low-Quality Questions

**List**:
- Questions dengan Q-QS < 40
- Tampilkan:
  - Question text (preview)
  - Q-QS score
  - Reason for low score (p-value, d-value, dll)
  - Status

**Actions**:
- Review & revise
- Delete
- Flag for expert review

---

### 12.5 High-Quality Questions

**List**:
- Questions dengan Q-QS > 80
- Dapat dijadikan model untuk new questions
- Tag sebagai "Exemplary"

---

### 12.6 Question Trend Over Time

**Chart**:
- Line chart
- X-axis: Date (monthly)
- Y-axis: Average Q-QS
- Multiple lines per specialty

**Insights**:
- Quality improvement over time
- Identify specialties dengan quality issues
- Trend analysis

---

### 12.7 Expert Rating Workflow

**Langkah-langkah**:

1. Dari **Quality Dashboard**, filter questions yang perlu review
2. Klik question untuk review
3. Rate question 1-5:
   - 1: Very Poor
   - 2: Poor
   - 3: Average
   - 4: Good
   - 5: Excellent
4. Add comments/review notes
5. Klik **"Submit Rating"**

**After rating**:
- Q-QS akan di-recalculate
- Question status mungkin berubah

---

### 12.8 Ambiguity Reports

**View Reports**:
- List of ambiguity reports dari students
- Filter by question
- Filter by status (Open, Resolved)

**Review Report**:
- Read student feedback
- Review question
- Take action:
  - Edit question (if valid)
  - Mark as resolved (if invalid)
  - Contact student (if needed)

---

### 12.9 Export Quality Report

**Langkah-langkah**:

1. Klik **"Export Quality Report"**
2. Pilih format:
   - PDF
   - Excel
3. Klik **"Export"**

**Report Includes**:
- Overall quality statistics
- Q-QS distribution
- Low-quality questions list
- Recommendations untuk improvement
- Expert ratings summary

---

## 13. Admin Posts

### 13.1 Access Admin Posts

**Langkah-langkah**:

1. Dari **Sidebar**, klik **"Admin Posts"**
2. View list of admin posts

---

### 13.2 Create Post

**Langkah-langkah**:

1. Klik **"Create Post"**
2. Isi form:
   - Title* (wajib)
   - Content* (rich text editor)
   - Tags (misal: Announcement, Update, Event)
   - Target Audience (All Students, Specific Specialty, etc.)
   - Publish Date & Time (scheduled or immediate)
3. Klik **"Publish"**

**Post Types**:
- Announcements
- System updates
- New features
- Exam schedules
- Important reminders

---

### 13.3 Edit Post

**Langkah-langkah**:

1. Klik **"Edit"** pada post
2. Ubah konten
3. Klik **"Save Changes"**

---

### 13.4 Delete Post

**Langkah-langkah**:

1. Klik **"Delete"** pada post
2. Konfirmasi dengan **"Yes, Delete"**

---

## 14. Admin Settings

### 14.1 Access Settings

**Langkah-langkah**:

1. Dari **Sidebar**, klik **"Settings"**
2. View admin settings tabs

---

### 14.2 General Settings

**System Settings**:
- App Name
- Contact Email
- Default Language
- Timezone

**Notification Settings**:
- Email notifications enabled/disabled
- SMS notifications (if available)

---

### 14.3 Exam Settings

**Default Exam Configuration**:
- Default duration (minutes)
- Default passing score (%)
- Default timer display position
- Allow exam retake: Yes/No
- Auto-submit on timeout: Yes/No

**Review Settings**:
- Allow review before submit: Yes/No
- Show explanation immediately: Yes/No

---

### 14.4 User Settings

**Registration Settings**:
- Require email verification: Yes/No
- Auto-approve new users: Yes/No

**Default User Configuration**:
- Default role for new registrations
- Default specialty (if applicable)

---

### 14.5 Export/Import Settings

**Export**:
- Klik **"Export Settings"**
- File JSON akan di-download

**Import**:
- Klik **"Import Settings"**
- Pilih file JSON
- Settings akan di-restore

---

### 14.6 Reset to Defaults

**Langkah-langkah**:

1. Scroll ke bagian bawah
2. Klik **"Reset to Defaults"**
3. Konfirmasi dengan **"Yes, Reset"**

---

## 15. Logout

**Langkah-langkah**:

1. Dari **Sidebar**, klik **"Logout"**
2. Konfirmasi logout
3. Redirect ke Landing Page

---

## 16. Troubleshooting

### 16.1 Common Issues

**Issue: Questions tidak muncul**
- Solution:
  - Refresh page
  - Check filter settings
  - Verify specialty selected
  - Check question status (must be Published)

**Issue: Excel import gagal**
- Solution:
  - Check file format (must be .xlsx, .xls, or .csv)
  - Verify required columns exist
  - Check data format
  - View error messages untuk details

**Issue: Blueprint tidak tergenerate exam**
- Solution:
  - Verify total = 100% for all distributions
  - Check if enough questions available in bank
  - Review analysis output untuk gaps

---

### 16.2 Best Practices

**Question Creation**:
- Use clear, unambiguous language
- Provide detailed explanations
- Link to guidelines
- Quality check dengan expert reviewer
- Monitor Q-QS after usage

**Exam Design**:
- Balance topics using blueprint
- Vary difficulty (mix of easy, medium, hard)
- Include Patient Safety questions
- Target passing score 60-70%

**Analytics**:
- Review analytics regularly (monthly)
- Identify at-risk students early
- Monitor question quality
- Use data untuk continuous improvement

---

**Last Updated**: 2025-01-08
**Version**: 1.0.0
**Status**: ✅ Complete
