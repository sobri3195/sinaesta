# Application Flows Documentation

## Alur Aplikasi SINAESTA Digital

Dokumen ini menjelaskan alur aplikasi untuk setiap role dan use case.

---

## 1. PUBLIC FLOWS (Tidak Login)

### 1.1 Landing Page Flow
```
Landing Page
├─ User tidak ada session
├─ Tombol: "Get Started" / "Register"
└─ Aksi:
   ├─ Get Started → Register Form Modal
   └─ Register Form → Pilih Specialty → Buat User → Dashboard Student
```

### 1.2 Authentication & Registration
```
Register Form Modal
├─ Input: Nama Lengkap, Email, Phone, Institusi
├─ Select: Target Specialty (dari SPECIALTIES array)
├─ Input: Expected Year (tahun ujian)
└─ Aksi: 
   ├─ Validasi input
   ├─ Create User dengan role STUDENT
   ├─ Auto-generate avatar dari nama
   ├─ Redirect ke DASHBOARD dengan soal sesuai specialty
   └─ Set session user (localStorage)
```

---

## 2. STUDENT FLOWS

### 2.1 Dashboard Student
```
DASHBOARD (Student View)
├─ Greeting: "Selamat Datang, [Nama]!"
├─ Target Specialty: [Specialty Dipilih]
├─ Section: Available Exams
│  ├─ List Exam sesuai specialty
│  ├─ Tampilkan: Title, Topic, Difficulty, Duration
│  └─ Tombol: "Mulai Simulasi"
├─ Feature Cards: Spot Dx, Microlearning, Clinical Reasoning
└─ Navigasi ke modul lain (Flashcards, OSCE, Logbook, dll)
```

### 2.2 Take Exam Flow
```
DASHBOARD → Click "Mulai Simulasi"
↓
TAKE_EXAM (ExamTaker Component)
├─ Display soal per nomor
├─ Options: A, B, C, D (MCQ style)
├─ Features:
│  ├─ Timer (countdown per question atau total exam)
│  ├─ Flag/Mark for Review
│  ├─ Previous / Next Navigation
│  └─ Submit Exam (Show confirmation)
├─ Jawab semua atau skip
└─ Submit → Score Calculation → RESULTS View
   ├─ Weighted scoring (berdasarkan points di question)
   ├─ Show correct/incorrect
   ├─ Explanation untuk setiap soal
   └─ Button: "Back to Dashboard" / "Review Answers"
```

### 2.3 Flashcard Flow
```
FLASHCARDS (Study Module)
├─ List Flashcard Decks (by Specialty)
├─ Click Deck → STUDY_FLASHCARDS
│  ├─ Front Card (Question)
│  ├─ Flip / Show Answer
│  ├─ Mark as Mastered / Need Review
│  └─ Next Card
└─ End of Deck → Summary (Cards mastered vs need review)
```

### 2.4 OSCE Practice Flow
```
OSCE_PRACTICE
├─ Display Station Info
├─ Scenario & Instructions
├─ Start Timer (15-30 min per station)
├─ User performs exam (text-based or voice with Gemini Live)
├─ Checklist evaluation (auto-calculated berdasarkan rubric)
└─ End Station → Score & Feedback
```

### 2.5 Clinical Reasoning Simulator
```
CLINICAL_REASONING_SIM
├─ Show Case Vignette
├─ Multiple Choice / Multi-select Steps:
│  ├─ Problem Representation
│  ├─ DDx Formulation
│  ├─ Investigation Selection
│  ├─ Diagnosis
│  └─ Management
├─ Partial Scoring per step
└─ End → Feedback dengan error taxonomy
```

### 2.6 Spot Diagnosis Drill
```
SPOT_DX_DRILL
├─ 60-second timer per case
├─ Show Image/Prompt
├─ Select Diagnosis (MCQ)
├─ Select Next Step (MCQ)
├─ Auto-score & Next case
└─ End drill → Summary (Speed & Accuracy)
```

### 2.7 Profile & Settings
```
User Icon / Settings → Popover Menu
├─ Change Target Specialty (reload exams)
├─ Switch Role (Demo - buat toggle ke Admin)
└─ Logout → LANDING
```

---

## 3. TEACHER/MENTOR FLOWS

### 3.1 Mentor Dashboard
```
MENTOR_DASHBOARD
├─ My Sessions (booked, completed, available)
├─ Create Session (set topic, time, duration, price)
├─ My Mentees (list students I'm mentoring)
├─ Logbook Review Queue (pending logbook entries)
└─ Messages & Notifications
```

### 3.2 Logbook Review Flow
```
MENTOR_DASHBOARD → Logbook Review Queue
├─ List pending logbook entries
├─ Click entry → Detail view
│  ├─ Patient info
│  ├─ Procedure/Diagnosis
│  ├─ Student's notes
│  ├─ Checklist (signature, competency level)
│  └─ Actions: Approve / Reject / Request Revision
└─ After action → Update status (VERIFIED / REJECTED)
```

### 3.3 Case Discussion Forum
```
CASE_DISCUSSION
├─ List discussion threads (by specialty)
├─ Create New Thread
│  ├─ Title
│  ├─ Case Description (Problem, DDx, Plan)
│  ├─ Anonymous option
│  └─ Post
├─ View Thread
│  ├─ Original Post
│  ├─ Mentor Replies (highlighted)
│  ├─ Student Replies
│  └─ Add Reply
└─ Close Thread (Mentor action)
```

---

## 4. ADMIN/PROGRAM ADMIN FLOWS

### 4.1 Admin Dashboard
```
ADMIN_DASHBOARD
├─ Bank Soal Overview (total questions, by specialty)
├─ Quick Actions:
│  ├─ "Input Soal Baru" → CREATE_EXAM
│  ├─ "Import Excel" → ExcelImport component
│  ├─ "View Questions" → List questions by specialty
│  └─ "Analytics" → AnalyticsDashboard (PROGRAM_ADMIN only)
└─ Recent activity
```

### 4.2 Create/Edit Exam Flow
```
CREATE_EXAM
├─ Form:
│  ├─ Title, Description
│  ├─ Select Topic (Cardiology, Surgery, etc)
│  ├─ Select Specialty (filter dari SPECIALTIES)
│  ├─ Duration (minutes)
│  ├─ Mode (STANDARD / CLINICAL_CASE / SPEED_DRILL)
│  └─ Difficulty (Easy / Medium / Hard)
├─ Add Questions:
│  ├─ Manual Input (text + 4 options)
│  ├─ OR Select from existing questions
│  ├─ Set correct answer, explanation, category, domain
│  ├─ Set points/weight (untuk weighted scoring)
│  └─ Preview sebelum save
├─ Add Case Vignettes (optional)
│  ├─ Title, Content
│  ├─ Add Tabs (Lab results, Images, etc)
│  └─ Link questions ke vignette
└─ Save → Admin Dashboard
```

### 4.3 Excel Import Flow
```
ADMIN_DASHBOARD → "Import Excel"
↓
ExcelImport Component
├─ Step 1: Download Template CSV
│  └─ Template columns: Question, Option A-D, Correct, Category, Specialty, Domain, Points
├─ Step 2: Upload File
│  ├─ Validate format
│  ├─ Check required fields
│  ├─ Map correct answer correctly
│  └─ Show preview
├─ Step 3: Review & Confirm
│  ├─ Show all questions dalam table
│  ├─ Highlight any errors
│  └─ Allow edit inline
└─ Step 4: Import
   ├─ Bulk insert ke exam/questions
   └─ Show success message dengan jumlah items
```

### 4.4 Question Review & QC
```
QUESTION_REVIEW
├─ Filter by:
│  ├─ Status (DRAFT / REVIEW / APPROVED / FLAGGED)
│  ├─ Specialty
│  └─ Difficulty
├─ For each question show:
│  ├─ Text, Options, Explanation
│  ├─ Item Analysis (difficulty index, discrimination index)
│  ├─ Quality Metrics (ambiguity, expert rating)
│  └─ Actions: Approve / Reject / Flag for Update
└─ Comments & Feedback field
```

### 4.5 Vignette Builder
```
VIGNETTE_BUILDER
├─ Create Case:
│  ├─ Title
│  ├─ Content (Markdown atau rich text)
│  ├─ Add Tabs:
│  │  ├─ Lab Results (table format)
│  │  ├─ Imaging (dengan image URL)
│  │  └─ Other findings
│  └─ Save
├─ Edit Existing
├─ Link to Questions (soal akan reference vignette ID)
└─ Preview untuk student
```

### 4.6 Blueprint Manager
```
BLUEPRINT_MANAGER
├─ Create Blueprint:
│  ├─ Name (e.g., "Blueprint Interna 2025")
│  ├─ Specialty
│  ├─ Define Topics with Target %
│  │  ├─ e.g., Cardiology 20%, GI 15%, Rheum 10%
│  │  └─ Target total items count
│  ├─ Define Domains with Target %
│  │  ├─ Diagnosis 40%, Therapy 35%, Investigation 25%
│  │  └─ Patient Safety questions marked
│  └─ Define Difficulty distribution
└─ Analyze existing exam bank:
   ├─ Show current distribution vs target
   ├─ Identify gaps
   └─ Recommendations untuk soal baru
```

### 4.7 Knowledge Base Manager
```
KNOWLEDGE_BASE
├─ Manage Guidelines
│  ├─ Add: Title, Organization, Year, URL, Tags
│  ├─ Link to questions (for guideline mismatch detection)
│  └─ Mark as ACTIVE / ARCHIVED
├─ Manage Infographics
│  ├─ Upload atau link image
│  ├─ Classify (ALGORITHM / SUMMARY / MNEMONIC)
│  └─ Tag
└─ Manage Microlearning Packs
   ├─ Create pack
   ├─ Add items (flashcards, images, mini-cases)
   └─ Assign to specialty
```

### 4.8 OSCE Manager
```
OSCE_MANAGER
├─ Create Station:
│  ├─ Title, Scenario, Instruction
│  ├─ Duration (minutes)
│  ├─ Add Checklist items:
│  │  ├─ Criteria description
│  │  ├─ Point value
│  │  └─ Category (Anamnesis / Physical Exam / Diagnosis / Mgmt / Communication)
│  ├─ Add Rubric (optional)
│  └─ Save
├─ Manage Existing Stations
└─ Preview untuk student
```

### 4.9 User Management
```
USER_MANAGEMENT
├─ List Users (by Role filter)
├─ Add User:
│  ├─ Name, Email, Role, Specialty
│  └─ Send invitation email
├─ Edit User:
│  ├─ Update details
│  └─ Change role/status
├─ Delete User
└─ Bulk Actions (export, send messages, etc)
```

### 4.10 Cohort Management
```
COHORT_MANAGEMENT
├─ Create Cohort:
│  ├─ Name (e.g., "Batch Januari 2026")
│  ├─ Specialty
│  ├─ Start/End Date
│  ├─ Max students
│  └─ Assign mentors
├─ Add students to cohort
├─ View cohort performance
└─ Manage cohort settings
```

### 4.11 High-Yield Map & Analytics
```
HIGH_YIELD_MAP
├─ Show topic frequency (dari exam bank)
├─ Show student average performance per topic
├─ Identify trending topics (UP/DOWN/STABLE)
└─ Recommendations untuk fokus study

ANALYTICS_DASHBOARD (PROGRAM_ADMIN only)
├─ Overall statistics:
│  ├─ Total students, teachers, exams
│  ├─ Total questions by specialty
│  ├─ Student progress
│  └─ Engagement metrics
├─ Charts:
│  ├─ Score distribution
│  ├─ Time-to-answer analysis
│  ├─ Fatigue curve (accuracy drop during exam)
│  └─ Difficulty calibration
└─ Exportable reports
```

### 4.12 Question Quality Dashboard
```
QUESTION_QUALITY
├─ Q-QS (Question Quality Score) calculation:
│  ├─ Difficulty Index (p-value): 0 = all wrong, 1 = all correct
│  ├─ Discrimination Index (d-value): high performers vs low
│  ├─ Distractor Efficiency: apakah distractor dipilih low performers
│  ├─ Ambiguity reports count
│  └─ Expert rating (1-5)
├─ Score = weighted formula dari komponen di atas
├─ Flag questions dengan Q-QS rendah (< 50)
├─ Trend per question over time
└─ Export untuk calibration workshop
```

---

## 5. DATA FLOW

### 5.1 Exam Data Structure
```
Exam
├─ id, title, description
├─ durationMinutes
├─ questions[]
│  ├─ id, text, options[], correctAnswerIndex
│  ├─ category, difficulty, domain (Diagnosis/Therapy/Investigation/Mechanism/Patient Safety)
│  ├─ points (default 1, for weighted scoring)
│  ├─ explanation
│  ├─ type (MCQ / VIGNETTE / CLINICAL_REASONING / SPOT_DIAGNOSIS)
│  ├─ vignetteId (optional, link ke case)
│  └─ status (DRAFT / REVIEW / APPROVED / PUBLISHED)
├─ vignettes[] (optional)
│  ├─ id, title, content
│  └─ tabs[] (lab results, images, etc)
├─ createdAt
└─ mode (STANDARD / CLINICAL_CASE / SPEED_DRILL)
```

### 5.2 Student Progress Tracking
```
ExamResult
├─ examId, studentId
├─ score (calculated dari weighted points)
├─ totalQuestions
├─ answers[] (array of selected option indices)
├─ completedAt
├─ domainAnalysis (per domain: correct/total)
├─ errorProfile (by ErrorTaxonomy)
├─ fatigueData (accuracy per time segment)
└─ aiFeedback (generated by Gemini)
```

### 5.3 Mock Data Initialization
```
On App Load:
├─ Check user.targetSpecialty
├─ If user.role === STUDENT:
│  └─ setExams(generateExamsForSpecialty(specialty))
│     └─ Load dari mockData.ts
├─ If user.role === TEACHER/ADMIN:
│  └─ Load all exams across specialties
└─ For each view, load relevant mock data:
   ├─ Flashcards: generateFlashcardDecks()
   ├─ OSCE: generateOSCEStations()
   ├─ Spot Dx: generateSpotDxItems()
   └─ Microlearning: generateMicrolearningPacks()
```

---

## 6. UI/UX PATTERNS

### 6.1 Navigation
```
Mobile (< lg breakpoint):
├─ Hidden sidebar
├─ Hamburger menu (top-left)
└─ Full-width content

Desktop (lg+ breakpoint):
├─ Fixed sidebar (visible)
├─ Main content beside sidebar
└─ Responsive grid layouts (1col mobile → 2-3col desktop)
```

### 6.2 Form Validation
```
All forms:
├─ Real-time validation (onChange)
├─ Show error message inline
├─ Disable submit button if invalid
└─ Success toast after submit
```

### 6.3 Modal/Popover
```
Register Form:
├─ Modal di landing page
├─ Close on ESC / backdrop click
└─ Form submission dengan loading state

User Menu:
├─ Popover dari user profile
├─ Specialty selector
├─ Switch role (demo)
└─ Logout
```

---

## 7. ERROR HANDLING

### 7.1 Exam Submission
```
On Submit Exam:
├─ Validate all questions answered (or allow skip)
├─ Calculate score dengan weighted points
├─ Show confirmation dialog
├─ Lock exam data (prevent re-take immediately)
└─ Show results dengan detailed breakdown
```

### 7.2 Excel Import Error Handling
```
On Import:
├─ CSV parsing error → Show error message
├─ Missing required columns → Highlight & guide
├─ Invalid correct answer index → Highlight row
├─ Duplicate question ID → Warning & suggestion
└─ On success → Show count of imported items
```

---

## 8. STATE MANAGEMENT

### 8.1 App-Level State (in App.tsx)
```
useState:
├─ user: User (current logged-in user)
├─ view: ViewState (current screen/page)
├─ exams: Exam[] (list of available exams)
├─ activeExam: Exam | null (for preview/take)
├─ lastResult: ExamResult | null (for results view)
├─ examHistory: ExamResult[] (student history)
├─ flashcardDecks: FlashcardDeck[]
├─ activeDeck: FlashcardDeck | null
├─ isSidebarOpen: boolean (mobile sidebar)
├─ logoUrl: string (tenant branding)
└─ showSpecialtySelector: boolean
```

### 8.2 Local Storage (optional)
```
Save:
├─ user session (for persistence across reload)
├─ exam progress (for draft/autosave)
├─ last visited view
└─ user preferences (theme, language)
```

---

## 9. ROLE-BASED PERMISSIONS SUMMARY

### Student
- ✅ View Dashboard
- ✅ Take Exams
- ✅ Study Flashcards
- ✅ Practice OSCE
- ✅ View Results & History
- ❌ Create/Edit Exams
- ❌ Admin features

### Teacher/Mentor
- ✅ All Student features
- ✅ Create Sessions
- ✅ Review Logbooks
- ✅ Participate in Forum
- ✅ View Analytics
- ✅ Create/Edit Exams (if TEACHER role)
- ✅ Grade OSCE

### Program Admin
- ✅ All Teacher features
- ✅ User Management
- ✅ Cohort Management
- ✅ Blueprint Manager
- ✅ Knowledge Base Manager
- ✅ OSCE Manager
- ✅ Analytics Dashboard
- ✅ System Settings

---

## 10. QUICK REFERENCE: ROUTE MAPPING

| View | Route | Component | Role | Description |
|------|-------|-----------|------|-------------|
| LANDING | / | LandingPage | Public | Welcome & Registration |
| DASHBOARD | /dashboard | Dashboard | Student | Exam list & Features |
| TAKE_EXAM | /exam/{id} | ExamTaker | Student | Quiz interface |
| RESULTS | /results | ExamResult | Student | Score & Feedback |
| FLASHCARDS | /flashcards | FlashcardCreator | Student | Study cards |
| OSCE_PRACTICE | /osce | OSCEMode | Student | Simulation |
| SPOT_DX_DRILL | /spot-dx | SpotDxDrill | Student | Quick diagnosis |
| CLINICAL_REASONING_SIM | /reasoning | ClinicalReasoningSimulator | Student | Step-by-step |
| REMEDIAL_PATH | /remedial | RemedialPath | Student | Personalized pathway |
| LOGBOOK | /logbook | Logbook | Student/Teacher | Clinical log |
| CASE_DISCUSSION | /cases | CaseDiscussion | Student/Teacher | Forum |
| MENTOR_MARKETPLACE | /mentors | MentorMarketplace | Student | Find mentors |
| ADMIN_DASHBOARD | /admin | AdminDashboard | Admin | Question bank |
| CREATE_EXAM | /admin/create | ExamCreator | Admin | New exam |
| VIGNETTE_BUILDER | /admin/vignette | VignetteBuilder | Admin | Case building |
| QUESTION_REVIEW | /admin/review | QuestionReview | Admin | QC |
| OSCE_MANAGER | /admin/osce | OSCEManager | Admin | Station mgmt |
| BLUEPRINT_MANAGER | /admin/blueprint | BlueprintManager | Admin | Curriculum |
| KNOWLEDGE_BASE | /admin/knowledge | KnowledgeBaseManager | Admin | Guidelines |
| HIGH_YIELD_MAP | /admin/high-yield | HighYieldMap | Admin | Topic analysis |
| QUESTION_QUALITY | /admin/quality | QuestionQualityDashboard | Admin | Q-QS |
| MENTOR_DASHBOARD | /mentor | MentorDashboard | Teacher | Sessions & reviews |
| USER_MANAGEMENT | /admin/users | UserManagement | Admin | User mgmt |
| COHORT_MANAGEMENT | /admin/cohorts | CohortManagement | Admin | Batch mgmt |
| BENCHMARK | /benchmark | CohortBenchmark | Student | Comparison |
| MICROLEARNING | /microlearning | MicrolearningHub | Student | Quick content |
| HISTORY | /history | ExamHistory | Student | Past attempts |

