# Data Structure by Specialty

Dokumen ini menjelaskan struktur data dummy yang tersedia untuk setiap specialty di SINAESTA Digital.

---

## Overview

Setiap specialty memiliki data yang konsisten meliputi:
1. **Exams** - Simulasi ujian dengan soal-soal
2. **Flashcard Decks** - Kartu belajar untuk review cepat
3. **OSCE Stations** - Simulasi klinik dengan checklist
4. **Spot Diagnosis Items** - Latihan diagnosis cepat (60 detik)
5. **Microlearning Packs** - Paket belajar 5-7 menit
6. **Case Vignettes** - Kasus panjang dengan data lab/imaging

---

## 1. INTERNAL MEDICINE (Penyakit Dalam)

### Exams
```
ex_im_1: "Tryout Nasional PPDS Interna Batch 1"
  - Duration: 90 minutes
  - Difficulty: Hard
  - Questions: 3 (Cardiology, Nephrology, Pulmonology)
  - Domains: Investigation, Diagnosis
  - Topics: Vascular disorders, renal disease, respiratory

ex_im_2: "Drill Rheumatology & Autoimmune"
  - Duration: 60 minutes
  - Difficulty: Hard
  - Questions: Rheumatology cases
  - Topics: SLE, RA, Vasculitis
```

### Questions Topics
- Cardiology (Hypertension, ACS, Arrhythmias)
- Nephrology (Renal disease, proteinuria)
- Pulmonology (Respiratory failure, ABG interpretation)
- Rheumatology (SLE, RA, vasculitis)

### Flashcard Decks
- **Hypertension Management**: Target BP, medication classes
- **Acute Coronary Syndrome**: Markers, EKG changes, reperfusion

### OSCE Stations
- **Station 1: Hypertensive Crisis**: Anamnesis, vital signs, management
- Checklist: Communication, anamnesis, physical exam, investigations

### Data Usage
Students at Internal Medicine specialty will:
- See these exams on dashboard
- Practice with flashcard decks
- Simulate OSCE stations
- Get spot diagnosis cases
- Access microlearning packs

---

## 2. SURGERY (Bedah)

### Exams
```
ex_surg_1: "Tryout Nasional PPDS Bedah Batch 1"
  - Duration: 90 minutes
  - Difficulty: Hard
  - Questions: Trauma, acute abdomen
  - Topics: Emergency surgery, hemodynamic management

ex_surg_2: "Basic Surgical Skills & Anatomy"
  - Duration: 60 minutes
  - Difficulty: Medium
  - Questions: Surgical anatomy (groin, neck, abdomen)
  - Topics: Anatomical structures, surgical landmarks
```

### Questions Topics
- Trauma Surgery (shock management, FAST exam)
- Acute Abdomen (appendicitis, peritonitis)
- Surgical Anatomy (inguinal canal, vascular anatomy)

### Flashcard Decks
- **Surgical Anatomy - Abdomen**: Blood supply, nerve anatomy
- **Trauma Management**: ATLS protocol, resuscitation

### OSCE Stations
- **Station 1: Acute Abdomen Assessment**: Physical exam, interpretation
- Checklist: Inspection, palpation, guarding assessment

### Clinical Context
- Questions focus on surgical decision-making
- Emphasis on acute management
- Anatomical knowledge required

---

## 3. PEDIATRICS (Ilmu Kesehatan Anak)

### Exams
```
ex_ped_1: "Tryout Nasional PPDS Anak Batch 1"
  - Duration: 90 minutes
  - Difficulty: Hard
  - Questions: Child growth, tropical infections, emergencies

ex_ped_2: "Neonatology Crash Course"
  - Duration: 60 minutes
  - Difficulty: Hard
  - Questions: Neonatal resuscitation, prematurity, sepsis
```

### Questions Topics
- Developmental Pediatrics (growth milestones)
- Pediatric Emergencies (febrile seizure)
- Neonatology (resuscitation, BBLR management)
- Pediatric Infections (common tropical diseases)

### Flashcard Decks
- **Pediatric Growth & Development**: Milestones, screening
- **Neonatal Resuscitation**: HAIKAL protocol, Apgar score

### OSCE Stations
- **Station 1: Pediatric Emergency (Febrile Neonate)**
- Checklist: History taking, physical exam, sepsis assessment

### Age-Specific Focus
- Neonatal resuscitation critical
- Parent communication important
- Age-appropriate examination techniques

---

## 4. OBSTETRICS & GYNECOLOGY (Obstetri & Ginekologi)

### Exams
```
ex_obg_1: "Tryout Nasional PPDS Obgyn Batch 1"
  - Duration: 90 minutes
  - Difficulty: Medium
  - Questions: Postpartum bleeding, preeclampsia, gynecologic oncology
```

### Questions Topics
- Obstetric Emergencies (PPH, preeclampsia)
- Antepartum Management (hypertension in pregnancy)
- Postpartum Care
- Gynecologic Oncology Basics

### Flashcard Decks
- **Preeclampsia Management**: BP targets, medications
- **Postpartum Hemorrhage**: Risk factors, treatment

### Domain Focus
- Therapy (antihypertensive choices)
- Diagnosis (clinical features)
- Management (emergency protocols)

---

## 5. CARDIOLOGY (Jantung)

### Exams
```
ex_card_1: "EKG Interpretation Drill"
  - Duration: 45 minutes
  - Difficulty: Hard
  - Questions: 2 (EKG changes, arrhythmias)
  - Focus: Interpretation skills
```

### Questions Topics
- EKG Interpretation (ST elevation, arrhythmias)
- Coronary Artery Distribution (anatomical correlation)
- Arrhythmia Recognition (rhythm strips)

### Flashcard Decks
- **EKG Changes in MI**: ST elevation patterns, coronary territories
- **Arrhythmia Recognition**: ECG findings per rhythm

### Specialty Focus
- Visual interpretation critical
- ECG-to-anatomy correlation
- Rapid diagnosis skills

---

## 6. NEUROLOGY (Saraf)

### Exams
```
ex_neuro_1: "Localization in Neurology"
  - Duration: 60 minutes
  - Difficulty: Hard
  - Questions: Neuroanatomical localization

ex_neuro_2: "Stroke Management Update"
  - Duration: 60 minutes
  - Difficulty: Medium
  - Questions: Acute stroke management
```

### Questions Topics
- Neuroanatomical Localization (crossed syndromes)
- Stroke Management (BP targets, thrombolysis)
- Vascular Neurology

### Flashcard Decks
- **Neurological Localization**: Syndrome patterns
- **Stroke Management**: Time windows, treatment protocols

### Clinical Reasoning
- Anatomical knowledge essential
- Syndrome recognition
- Time-critical management

---

## 7. ANESTHESIOLOGY (Anestesiologi)

### Exams
```
ex_anesth_1: "Airway Management & Difficult Intubation"
  - Duration: 60 minutes
  - Difficulty: Hard
  - Questions: Difficult airway, intubation alternatives
```

### Questions Topics
- Difficult Airway Management
- Intubation Techniques
- Airway Assessment (Mallampati, TMD)
- Alternative airway devices

### Domain Focus
- Therapy (management options)
- Decision-making (algorithm-based)
- Equipment knowledge

---

## 8. RADIOLOGY (Radiologi)

### Exams
```
ex_radio_1: "Chest X-ray & CT Interpretation"
  - Duration: 60 minutes
  - Difficulty: Medium
  - Questions: Chest imaging interpretation
```

### Questions Topics
- Chest X-ray Findings (consolidation, effusion)
- CT Interpretation
- Normal vs Pathology
- Image-to-diagnosis correlation

### Flashcard Decks
- **Chest Imaging Patterns**: Common pathologies
- **CT Findings**: Disease-specific patterns

---

## 9. DERMATOLOGY (Kulit & Kelamin)

### Exams
```
ex_derm_1: "Dermatology Clinical Cases"
  - Duration: 60 minutes
  - Difficulty: Medium
  - Questions: Skin lesion diagnosis
```

### Questions Topics
- Viral Infections (Herpes zoster, varicella)
- Bacterial Infections
- Inflammatory Conditions
- Malignancy Recognition

### Spot Diagnosis Items
- **Item 1: Vesicular Rash**: Herpes zoster with dermatome distribution
- Focus: Visual recognition, treatment protocol

---

## 10. OPHTHALMOLOGY (Mata)

### Exams
```
ex_opthal_1: "Ophthalmology Clinical Cases"
  - Duration: 60 minutes
  - Difficulty: Medium
  - Questions: Eye disease diagnosis
```

### Questions Topics
- Retinal Disorders (diabetic retinopathy)
- Vision Loss (acute, gradual)
- Fundoscopic Findings
- Medical Therapy

---

## 11. ENT (Telinga, Hidung, Tenggorokan)

### Exams
```
ex_ent_1: "ENT Clinical Cases"
  - Duration: 60 minutes
  - Difficulty: Medium
  - Questions: ENT emergency, infections
```

### Questions Topics
- Sudden Hearing Loss Management
- ENT Emergencies
- Otology Cases
- Rhinology Cases

### Domain Focus
- Therapy (emergency management)
- Diagnosis (clinical presentation)
- Investigation (audiometry)

---

## 12. PSYCHIATRY (Psikiatri)

### Exams
```
ex_psych_1: "Psychiatry Clinical Cases"
  - Duration: 60 minutes
  - Difficulty: Medium
  - Questions: Psychiatric disorders
```

### Questions Topics
- Psychosis (schizophrenia, delusions)
- Mood Disorders (bipolar, depression)
- Diagnostic Criteria (DSM-5/ICD-10)
- Psychopharmacology Basics

---

## Data Access Flow

### Student Journey
```
Landing Page
  ↓
Register (Select Specialty)
  ↓
Dashboard
  ↓ (Generated based on specialty)
├─ Exams for [Specialty]
├─ Flashcard Decks
├─ OSCE Stations
├─ Spot Diagnosis Items
├─ Microlearning Packs
└─ Case Vignettes
```

### Data Generation
```python
# In mockData.ts
user.targetSpecialty = 'Surgery'
  ↓
exams = generateExamsForSpecialty('Surgery')
  → Returns ex_surg_1, ex_surg_2, ...
flashcards = generateFlashcardDecks('Surgery')
  → Returns surgical anatomy decks, trauma management
osce = generateOSCEStations('Surgery')
  → Returns acute abdomen station, trauma station
spotdx = generateSpotDxItems('Surgery')
  → Returns surgical diagnosis cases
```

---

## Question Structure

Setiap question memiliki struktur:
```typescript
Question {
  id: string,
  text: string,           // Vignette atau pertanyaan MCQ
  options: string[4],     // A, B, C, D
  correctAnswerIndex: number,  // 0-3
  explanation: string,    // Rationale untuk correct answer
  category: string,       // e.g., "Cardiology", "Trauma"
  difficulty: 'Easy' | 'Medium' | 'Hard',
  domain: 'Diagnosis' | 'Therapy' | 'Investigation' | 'Mechanism' | 'Patient Safety',
  points: number,         // Default 1, dapat weighted (2-3 untuk sulit)
  type?: QuestionType,    // MCQ, VIGNETTE, CLINICAL_REASONING, SPOT_DIAGNOSIS
  vignetteId?: string,    // Link ke case vignette jika ada
}
```

---

## Scoring & Weighting

### Standard Exam
```
Total Score = Sum of (Points per Question)
  - Correct answer = full points
  - Incorrect answer = 0 points
  
Example:
- Question 1: 1 point ✓
- Question 2: 2 points ✗
- Question 3: 1 point ✓
= Total: 2/4 points
```

### Domain Analysis
```
Domain Analysis: Breakdown by domain
  - Diagnosis: 5 questions, 4 correct = 80%
  - Therapy: 3 questions, 2 correct = 67%
  - Investigation: 2 questions, 2 correct = 100%
```

---

## Quality Metrics (Q-QS)

Setiap question dapat di-track untuk quality:
```
Q-QS = Weighted(DifficultyIndex, DiscriminationIndex, DistractorEfficiency)

DifficultyIndex (p-value):
  - p = % of students who got it correct
  - Ideal: 0.3-0.7 (medium difficulty)
  
DiscriminationIndex (d-value):
  - d = (% correct in top group) - (% correct in bottom group)
  - Range: -1 to +1
  - Ideal: > 0.2 (good discrimination)
```

---

## Adding New Specialty

Untuk menambah specialty baru ke sistem:

### 1. Update SPECIALTIES array di types.ts
```typescript
export const SPECIALTIES = [
  ...existing,
  'New Specialty Name'  // Add here
] as const;
```

### 2. Tambah data di mockData.ts
```typescript
const NEW_SPECIALTY_QUESTIONS: Question[] = [
  { id, text, options, ... }
];

export const generateExamsForSpecialty = (specialty: string): Exam[] => {
  const baseExams = {
    ...existing,
    'New Specialty Name': [
      { id, title, questions: NEW_SPECIALTY_QUESTIONS, ... }
    ]
  };
  // ...
}
```

### 3. Tambah flashcards, OSCE, dll untuk specialty
```typescript
const flashcards = {
  ...existing,
  'New Specialty Name': [
    { id, title, cards: [...] }
  ]
};
```

---

## Testing Data

Untuk test dengan specialty baru:

1. Edit App.tsx MOCK_STUDENT.targetSpecialty = 'New Specialty Name'
2. Reload aplikasi
3. Dashboard akan generate data untuk specialty baru
4. Jika tidak ada data: fallback ke Internal Medicine

---

## Data Persistence

Saat ini semua data adalah **mock data in-memory**. Untuk production:

1. Integrasikan dengan backend API
2. Fetch exams: `GET /api/exams?specialty=Surgery`
3. Fetch questions: `GET /api/questions?examId=ex_surg_1`
4. Save results: `POST /api/results`

---

## Performance Notes

- Mock data generator run saat component mount
- generateExamsForSpecialty cukup fast (< 10ms)
- Untuk 1000+ questions, consider pagination atau virtualization
- Current data volume: ~3-5 questions per exam, manageable

---

## Next Steps

1. ✅ Complete data for all 12 specialties
2. ⏳ Add video content links to vignettes
3. ⏳ Integrate with backend API
4. ⏳ Add analytics dashboard
5. ⏳ Implement adaptive difficulty

