/**
 * Comprehensive Mock Data Generator
 * Provides all dummy data for exams, flashcards, OSCE stations, etc. by specialty
 */

import { 
  User, UserRole, Exam, Question, CaseVignette, OSCEStation, 
  FlashcardDeck, Flashcard, Specialty, SpotDxItem, MicrolearningPack 
} from './types';

// ============ MOCK USERS ============

export const MOCK_STUDENT: User = {
  id: 'u1',
  name: 'dr. Andi Pratama',
  role: UserRole.STUDENT,
  avatar: 'https://ui-avatars.com/api/?name=Andi+Pratama&background=0D8ABC&color=fff',
  targetSpecialty: 'Internal Medicine'
};

export const MOCK_ADMIN: User = {
  id: 't1',
  name: 'Admin Kolegium',
  role: UserRole.PROGRAM_ADMIN,
  avatar: 'https://ui-avatars.com/api/?name=Admin+Kolegium&background=111827&color=fff'
};

export const MOCK_TEACHER: User = {
  id: 't2',
  name: 'Prof. Budi Santoso',
  role: UserRole.TEACHER,
  avatar: 'https://ui-avatars.com/api/?name=Budi+Santoso&background=15803d&color=fff',
  targetSpecialty: 'Surgery'
};

// ============ QUESTIONS BY SPECIALTY ============

// Internal Medicine Questions
const INTERNAL_MEDICINE_QUESTIONS: Question[] = [
  {
    id: 'im_q1',
    text: 'Laki-laki 58 tahun dengan nyeri dada substernal menjalar ke punggung, TD 160/110. Pemeriksaan yang paling membantu?',
    options: ['EKG', 'Chest X-ray', 'CT Angiografi Toraks', 'Echocardiography'],
    correctAnswerIndex: 2,
    explanation: 'CT Angiografi dengan kontras adalah gold standard untuk diagnosis diseksi aorta pada kecurigaan tinggi.',
    category: 'Vascular',
    difficulty: 'Hard',
    domain: 'Investigation',
    points: 2
  },
  {
    id: 'im_q2',
    text: 'Wanita 45 tahun, proteinuria 3+, TD 160/110, kreatinin 2.5. Diagnosis yang paling mungkin?',
    options: ['Glomerulonefritis', 'Penyakit Ginjal Hipertensi', 'Sindrom Nefrotik', 'Lupus Nefritis'],
    correctAnswerIndex: 2,
    explanation: 'Proteinuria masif (> 3.5g/hari) adalah kriteria utama sindrom nefrotik.',
    category: 'Nephrology',
    difficulty: 'Medium',
    domain: 'Diagnosis',
    points: 1
  },
  {
    id: 'im_q3',
    text: 'Pasien dengan FiO2 40%, PaO2 70 mmHg, PaCO2 55 mmHg. Tipe gangguan acid-base?',
    options: ['Metabolic Acidosis', 'Respiratory Acidosis', 'Respiratory Alkalosis', 'Mixed Acidosis'],
    correctAnswerIndex: 1,
    explanation: 'PaCO2 tinggi dengan PaO2 rendah menunjukkan respiratory acidosis.',
    category: 'Pulmonology',
    difficulty: 'Hard',
    domain: 'Diagnosis',
    points: 2
  }
];

// Surgery Questions
const SURGERY_QUESTIONS: Question[] = [
  {
    id: 'surg_q1',
    text: 'Laki-laki 25 tahun pasca KLL, GCS 9, TD 80/50, FAST positif di morison pouch. Tindakan awal?',
    options: ['Laparotomi Cito', 'CT Scan Abdomen', 'Resusitasi Cairan', 'Pemasangan WSD'],
    correctAnswerIndex: 2,
    explanation: 'Resusitasi cairan/darah adalah langkah awal pada syok hemoragik sebelum operatif.',
    category: 'Trauma',
    difficulty: 'Hard',
    domain: 'Therapy',
    points: 2
  },
  {
    id: 'surg_q2',
    text: 'Anak 5 tahun nyeri perut kanan bawah, leukosit 15000, Alvarado 8. Diagnosis?',
    options: ['Appendisitis', 'Gastroenteritis', 'Invaginasi', 'Divertikulitis Meckel'],
    correctAnswerIndex: 0,
    explanation: 'Alvarado score > 7 pada anak sangat suggestif untuk appendisitis akut.',
    category: 'Digestive',
    difficulty: 'Medium',
    domain: 'Diagnosis',
    points: 1
  }
];

// Pediatrics Questions
const PEDIATRICS_QUESTIONS: Question[] = [
  {
    id: 'ped_q1',
    text: 'Bayi 8 bulan, kejang demam pertama durasi < 5 menit. Pemeriksaan wajib?',
    options: ['EEG', 'Lumbar Puncture', 'Darah Lengkap', 'CT Scan'],
    correctAnswerIndex: 1,
    explanation: 'LP dipertimbangkan pada bayi < 12 bulan untuk menyingkirkan meningitis.',
    category: 'Neurology',
    difficulty: 'Hard',
    domain: 'Investigation',
    points: 2
  },
  {
    id: 'ped_q2',
    text: 'Anak 2 tahun batuk gonggong, stridor inspiratoir. Diagnosis?',
    options: ['Croup', 'Epiglotitis', 'Benda Asing', 'Asthma'],
    correctAnswerIndex: 0,
    explanation: 'Barking cough + stridor khas untuk croup (laringotrakeobronkitis viral).',
    category: 'Respirology',
    difficulty: 'Medium',
    domain: 'Diagnosis',
    points: 1
  }
];

// OBGyn Questions
const OBGYN_QUESTIONS: Question[] = [
  {
    id: 'obg_q1',
    text: 'Wanita G1P0 hamil 38 minggu, TD 160/110, proteinuria +3. Antihipertensi lini pertama?',
    options: ['Nifedipine Oral', 'Furosemide', 'Captopril', 'Amlodipine'],
    correctAnswerIndex: 0,
    explanation: 'Nifedipine oral short-acting adalah pilihan pertama untuk krisis hipertensi kehamilan.',
    category: 'Obstetrics',
    difficulty: 'Medium',
    domain: 'Therapy',
    points: 1
  },
  {
    id: 'obg_q2',
    text: 'Perempuan 28 tahun, perdarahan postpartum 500ml. Penyebab terbanyak?',
    options: ['Atonia Uteri', 'Retensio Plasenta', 'Ruptur Jalan Lahir', 'Koagulopati'],
    correctAnswerIndex: 0,
    explanation: 'Atonia uteri adalah penyebab paling sering perdarahan postpartum.',
    category: 'Obstetrics',
    difficulty: 'Medium',
    domain: 'Diagnosis',
    points: 1
  }
];

// Cardiology Questions
const CARDIOLOGY_QUESTIONS: Question[] = [
  {
    id: 'card_q1',
    text: 'EKG: ST Elevasi V1-V4. Arteri koroner tersumbat?',
    options: ['LAD', 'LCx', 'RCA', 'LM'],
    correctAnswerIndex: 0,
    explanation: 'ST elevasi V1-V4 menunjukkan dinding anterior yang diperdarahi LAD.',
    category: 'EKG',
    difficulty: 'Medium',
    domain: 'Diagnosis',
    points: 1
  },
  {
    id: 'card_q2',
    text: 'EKG: Gelombang F berbentuk gergaji di II, III, aVF. Diagnosis?',
    options: ['AF', 'Atrial Flutter', 'SVT', 'Sinus Tachycardia'],
    correctAnswerIndex: 1,
    explanation: 'Flutter waves (gelombang F) berbentuk gergaji khas Atrial Flutter.',
    category: 'Arrhythmia',
    difficulty: 'Medium',
    domain: 'Diagnosis',
    points: 1
  }
];

// Neurology Questions
const NEUROLOGY_QUESTIONS: Question[] = [
  {
    id: 'neuro_q1',
    text: 'Pasien hemiparesis kanan, paresis N.VII kiri perifer. Letak lesi?',
    options: ['Pons', 'Midbrain', 'Cortex', 'Medulla'],
    correctAnswerIndex: 0,
    explanation: 'Crossed hemiplegia khas untuk sindrom Millard-Gubler (lesi Pons).',
    category: 'Neuroanatomy',
    difficulty: 'Hard',
    domain: 'Diagnosis',
    points: 2
  },
  {
    id: 'neuro_q2',
    text: 'Target TD pada Stroke Iskemik untuk trombolisis?',
    options: ['< 185/110', '< 220/120', '< 140/90', '< 160/100'],
    correctAnswerIndex: 0,
    explanation: 'TD harus < 185/110 sebelum rTPA untuk mengurangi risiko perdarahan.',
    category: 'Vascular',
    difficulty: 'Medium',
    domain: 'Therapy',
    points: 1
  }
];

// Anesthesiology Questions
const ANESTHESIOLOGY_QUESTIONS: Question[] = [
  {
    id: 'anesth_q1',
    text: 'Pasien intubasi sulit, Mallampati IV, TMD 6cm. Alternatif?',
    options: ['Fiberoptic Intubation', 'Emergency Cricothyrotomy', 'Blind Nasal Intubation', 'Forceps Delivery'],
    correctAnswerIndex: 0,
    explanation: 'Fiberoptic intubation adalah gold standard untuk intubasi sulit.',
    category: 'Airway Management',
    difficulty: 'Hard',
    domain: 'Therapy',
    points: 2
  }
];

// Radiology Questions
const RADIOLOGY_QUESTIONS: Question[] = [
  {
    id: 'radio_q1',
    text: 'Gambaran CT: consolidation lobar dengan air bronchogram. Diagnosis?',
    options: ['Community-Acquired Pneumonia', 'Pulmonary Embolism', 'Tuberculosis', 'Lung Cancer'],
    correctAnswerIndex: 0,
    explanation: 'Konsolidasi lobar dengan air bronchogram adalah findings klasik pneumonia.',
    category: 'Chest Imaging',
    difficulty: 'Medium',
    domain: 'Diagnosis',
    points: 1
  }
];

// Dermatology Questions
const DERMATOLOGY_QUESTIONS: Question[] = [
  {
    id: 'derm_q1',
    text: 'Pasien, lesi vesikel grouped di daerah dermatom. Diagnosis?',
    options: ['Herpes Zoster', 'Varicella', 'Herpes Simplex', 'Eczema'],
    correctAnswerIndex: 0,
    explanation: 'Vesicles grouped di area dermatom adalah khas Herpes Zoster.',
    category: 'Viral Infections',
    difficulty: 'Medium',
    domain: 'Diagnosis',
    points: 1
  }
];

// Ophthalmology Questions
const OPHTHALMOLOGY_QUESTIONS: Question[] = [
  {
    id: 'ophthal_q1',
    text: 'Pasien dengan gradual vision loss dan hard exudates di macula. Diagnosis?',
    options: ['Diabetic Retinopathy', 'Macular Degeneration', 'Retinal Detachment', 'Glaucoma'],
    correctAnswerIndex: 0,
    explanation: 'Hard exudates di macula adalah findings diabetic retinopathy.',
    category: 'Retinal Disorders',
    difficulty: 'Medium',
    domain: 'Diagnosis',
    points: 1
  }
];

// ENT Questions
const ENT_QUESTIONS: Question[] = [
  {
    id: 'ent_q1',
    text: 'Pasien dengan sudden hearing loss unilateral. Tatalaksana awal?',
    options: ['Corticosteroids', 'Antibiotics', 'Hearing Aid', 'Observation'],
    correctAnswerIndex: 0,
    explanation: 'Corticosteroids adalah treatment of choice untuk sudden sensorineural hearing loss.',
    category: 'Otology',
    difficulty: 'Medium',
    domain: 'Therapy',
    points: 1
  }
];

// Psychiatry Questions
const PSYCHIATRY_QUESTIONS: Question[] = [
  {
    id: 'psych_q1',
    text: 'Pasien dengan delusions, hallucinations, disorganized speech. Diagnosis?',
    options: ['Schizophrenia', 'Bipolar Disorder', 'Depression', 'Anxiety'],
    correctAnswerIndex: 0,
    explanation: 'Delusions + hallucinations + disorganized speech adalah kriteria schizophrenia.',
    category: 'Psychosis',
    difficulty: 'Medium',
    domain: 'Diagnosis',
    points: 1
  }
];

// ============ EXAM DATA BY SPECIALTY ============

export const generateExamsForSpecialty = (specialty: string): Exam[] => {
  const baseExams: Record<string, Exam[]> = {
    'Internal Medicine': [
      {
        id: 'ex_im_1',
        title: 'Tryout Nasional PPDS Interna Batch 1',
        description: 'Simulasi ujian komprehensif dengan soal-soal vignette dan integrasi laboratorium.',
        durationMinutes: 90,
        topic: 'Internal Medicine',
        difficulty: 'Hard',
        createdAt: Date.now(),
        questions: INTERNAL_MEDICINE_QUESTIONS
      },
      {
        id: 'ex_im_2',
        title: 'Drill Rheumatology & Autoimmune',
        description: 'Soal-soal kasus SLE, RA, dan Vaskulitis.',
        durationMinutes: 60,
        topic: 'Internal Medicine',
        difficulty: 'Hard',
        createdAt: Date.now() - 86400000,
        questions: [
          {
            id: 'im_q_rh1',
            text: 'Wanita muda butterfly rash, nyeri sendi. Marker paling spesifik untuk SLE?',
            options: ['ANA IF', 'Anti-dsDNA', 'Anti-Histone', 'RF'],
            correctAnswerIndex: 1,
            explanation: 'Anti-dsDNA dan Anti-Smith sangat spesifik untuk SLE.',
            category: 'Rheumatology',
            difficulty: 'Medium',
            domain: 'Diagnosis',
            points: 1
          }
        ]
      }
    ],
    'Surgery': [
      {
        id: 'ex_surg_1',
        title: 'Tryout Nasional PPDS Bedah Batch 1',
        description: 'Simulasi kasus bedah akut abdomen, trauma, dan manajemen cairan perioperatif.',
        durationMinutes: 90,
        topic: 'Surgery',
        difficulty: 'Hard',
        createdAt: Date.now(),
        questions: SURGERY_QUESTIONS
      },
      {
        id: 'ex_surg_2',
        title: 'Basic Surgical Skills & Anatomy',
        description: 'Review anatomi klinis region inguinal, leher, dan abdomen.',
        durationMinutes: 60,
        topic: 'Basic Science',
        difficulty: 'Medium',
        createdAt: Date.now() - 86400000,
        questions: [
          {
            id: 'surg_q_anat',
            text: 'Struktur yang membentuk dinding posterior canalis inguinalis?',
            options: ['Fascia Transversalis', 'Aponeurosis M. Obliquus Externus', 'Ligamentum Inguinale', 'Tendo Conjoint'],
            correctAnswerIndex: 0,
            explanation: 'Fascia transversalis membentuk dinding posterior.',
            category: 'Anatomy',
            difficulty: 'Medium',
            domain: 'Mechanism',
            points: 1
          }
        ]
      }
    ],
    'Pediatrics': [
      {
        id: 'ex_ped_1',
        title: 'Tryout Nasional PPDS Anak Batch 1',
        description: 'Kasus tumbuh kembang, infeksi tropis anak, dan kegawatdaruratan neonatus.',
        durationMinutes: 90,
        topic: 'Pediatrics',
        difficulty: 'Hard',
        createdAt: Date.now(),
        questions: PEDIATRICS_QUESTIONS
      },
      {
        id: 'ex_ped_2',
        title: 'Neonatology Crash Course',
        description: 'Resusitasi neonatus, manajemen BBLR, dan sepsis neonatorum.',
        durationMinutes: 60,
        topic: 'Neonatology',
        difficulty: 'Hard',
        createdAt: Date.now() - 120000000,
        questions: [
          {
            id: 'ped_q_neo',
            text: 'Bayi baru lahir tidak bernapas, tonus lemah. Langkah awal resusitasi?',
            options: ['VTP', 'Kompresi Dada', 'Hangatkan & Atur Posisi', 'Intubasi'],
            correctAnswerIndex: 2,
            explanation: 'Langkah awal HAIKAL: Hangatkan, Atur posisi, Isap lendir, Keringkan.',
            category: 'Neonatology',
            difficulty: 'Medium',
            domain: 'Therapy',
            points: 1
          }
        ]
      }
    ],
    'Obgyn': [
      {
        id: 'ex_obg_1',
        title: 'Tryout Nasional PPDS Obgyn Batch 1',
        description: 'Manajemen perdarahan postpartum, preeklampsia, dan onkologi ginekologi.',
        durationMinutes: 90,
        topic: 'Obgyn',
        difficulty: 'Medium',
        createdAt: Date.now(),
        questions: OBGYN_QUESTIONS
      }
    ],
    'Cardiology': [
      {
        id: 'ex_card_1',
        title: 'EKG Interpretation Drill',
        description: '30 soal interpretasi EKG ritme dan iskemia.',
        durationMinutes: 45,
        topic: 'Cardiology',
        difficulty: 'Hard',
        createdAt: Date.now(),
        questions: CARDIOLOGY_QUESTIONS
      }
    ],
    'Neurology': [
      {
        id: 'ex_neuro_1',
        title: 'Localization in Neurology',
        description: 'Menentukan letak lesi berdasarkan defisit neurologis.',
        durationMinutes: 60,
        topic: 'Neurology',
        difficulty: 'Hard',
        createdAt: Date.now(),
        questions: [NEUROLOGY_QUESTIONS[0]]
      },
      {
        id: 'ex_neuro_2',
        title: 'Stroke Management Update',
        description: 'Tatalaksana Stroke Iskemik dan Hemoragik fase akut.',
        durationMinutes: 60,
        topic: 'Neurology',
        difficulty: 'Medium',
        createdAt: Date.now() - 40000000,
        questions: [NEUROLOGY_QUESTIONS[1]]
      }
    ],
    'Anesthesiology': [
      {
        id: 'ex_anesth_1',
        title: 'Airway Management & Difficult Intubation',
        description: 'Strategi manajemen jalan napas sulit dan alternatif teknik intubasi.',
        durationMinutes: 60,
        topic: 'Anesthesiology',
        difficulty: 'Hard',
        createdAt: Date.now(),
        questions: ANESTHESIOLOGY_QUESTIONS
      }
    ],
    'Radiology': [
      {
        id: 'ex_radio_1',
        title: 'Chest X-ray & CT Interpretation',
        description: 'Interpretasi radiologi dada normal dan patologi.',
        durationMinutes: 60,
        topic: 'Radiology',
        difficulty: 'Medium',
        createdAt: Date.now(),
        questions: RADIOLOGY_QUESTIONS
      }
    ],
    'Dermatology': [
      {
        id: 'ex_derm_1',
        title: 'Dermatology Clinical Cases',
        description: 'Diagnosis dan tatalaksana penyakit kulit umum.',
        durationMinutes: 60,
        topic: 'Dermatology',
        difficulty: 'Medium',
        createdAt: Date.now(),
        questions: DERMATOLOGY_QUESTIONS
      }
    ],
    'Ophthalmology': [
      {
        id: 'ex_opthal_1',
        title: 'Ophthalmology Clinical Cases',
        description: 'Diagnosis dan tatalaksana penyakit mata umum.',
        durationMinutes: 60,
        topic: 'Ophthalmology',
        difficulty: 'Medium',
        createdAt: Date.now(),
        questions: OPHTHALMOLOGY_QUESTIONS
      }
    ],
    'ENT': [
      {
        id: 'ex_ent_1',
        title: 'ENT Clinical Cases',
        description: 'Diagnosis dan tatalaksana penyakit THT.',
        durationMinutes: 60,
        topic: 'ENT',
        difficulty: 'Medium',
        createdAt: Date.now(),
        questions: ENT_QUESTIONS
      }
    ],
    'Psychiatry': [
      {
        id: 'ex_psych_1',
        title: 'Psychiatry Clinical Cases',
        description: 'Diagnosis dan tatalaksana gangguan psikiatrik.',
        durationMinutes: 60,
        topic: 'Psychiatry',
        difficulty: 'Medium',
        createdAt: Date.now(),
        questions: PSYCHIATRY_QUESTIONS
      }
    ]
  };

  return baseExams[specialty] || baseExams['Internal Medicine'];
};

// ============ FLASHCARD DECKS BY SPECIALTY ============

export const generateFlashcardDecks = (specialty: string): FlashcardDeck[] => {
  const flashcards: Record<string, FlashcardDeck[]> = {
    'Internal Medicine': [
      {
        id: 'fc_im_1',
        title: 'Hypertension Management',
        topic: 'Cardiology',
        createdAt: Date.now(),
        isSystemDeck: true,
        cards: [
          { id: 'fc1', front: 'Definisi Hipertensi Stadium 1?', back: 'SBP 140-159 mmHg atau DBP 90-99 mmHg' },
          { id: 'fc2', front: 'Target TD pada CKD stage 3?', back: '< 130/80 mmHg (KDIGO 2021)' }
        ]
      },
      {
        id: 'fc_im_2',
        title: 'Acute Coronary Syndrome',
        topic: 'Cardiology',
        createdAt: Date.now(),
        isSystemDeck: true,
        cards: [
          { id: 'fc3', front: 'Marker terpercaya ACS dalam 3 jam?', back: 'Troponin hs-cTn (highly sensitive)' }
        ]
      }
    ],
    'Surgery': [
      {
        id: 'fc_surg_1',
        title: 'Surgical Anatomy - Abdomen',
        topic: 'Anatomy',
        createdAt: Date.now(),
        isSystemDeck: true,
        cards: [
          { id: 'fc4', front: 'Blood supply of colon?', back: 'SMA (cecum, ascending, 2/3 transverse), IMA (1/3 distal transverse, descending, sigmoid)' }
        ]
      }
    ],
    'Cardiology': [
      {
        id: 'fc_card_1',
        title: 'EKG Changes in MI',
        topic: 'EKG',
        createdAt: Date.now(),
        isSystemDeck: true,
        cards: [
          { id: 'fc5', front: 'ST elevasi V1-V2 menunjukkan MI di?', back: 'LAD - Anterior wall (terutama septum)' }
        ]
      }
    ]
  };

  return flashcards[specialty] || [];
};

// ============ OSCE STATIONS BY SPECIALTY ============

export const generateOSCEStations = (specialty: string): OSCEStation[] => {
  const stations: Record<string, OSCEStation[]> = {
    'Internal Medicine': [
      {
        id: 'osce_im_1',
        title: 'Station 1: Hypertensive Crisis Management',
        scenario: 'Anda dokter di IGD. Masuk pasien laki-laki 55 tahun dengan TD 200/130, nyeri kepala berat, dan pandangan kabur.',
        instruction: '1. Lakukan anamnesis singkat\n2. Periksa tanda vital lengkap\n3. Usulkan 2 pemeriksaan penunjang\n4. Jelaskan tatalaksana awal',
        durationMinutes: 15,
        checklist: [
          { item: 'Greet & Introduce', points: 1, category: 'Communication' },
          { item: 'Ask about onset & associated symptoms', points: 2, category: 'Anamnesis' },
          { item: 'Perform BP in both arms', points: 2, category: 'Physical Exam' },
          { item: 'Check for end-organ damage signs', points: 3, category: 'Physical Exam' }
        ]
      }
    ],
    'Surgery': [
      {
        id: 'osce_surg_1',
        title: 'Station 1: Acute Abdomen Assessment',
        scenario: 'Laki-laki 28 tahun dengan nyeri perut akut sejak 4 jam lalu di RLQ.',
        instruction: '1. Anamnesis terarah\n2. Pemeriksaan fisik abdomen lengkap\n3. Interpretasi temuan\n4. Usulan diagnosis kerja',
        durationMinutes: 15,
        checklist: [
          { item: 'Inspect for guarding & distension', points: 2, category: 'Physical Exam' },
          { item: 'Perform RLQ tenderness check', points: 2, category: 'Physical Exam' },
          { item: 'Assess McBurney point', points: 1, category: 'Physical Exam' }
        ]
      }
    ],
    'Pediatrics': [
      {
        id: 'osce_ped_1',
        title: 'Station 1: Pediatric Emergency - Febrile Neonate',
        scenario: 'Bayi 1 bulan dibawa ibunya dengan demam, rewel, dan menolak minum.',
        instruction: '1. Anamnesis perinatologi\n2. Pemeriksaan fisik neonatal\n3. Assess sepsis risk\n4. Usulan pemeriksaan penunjang',
        durationMinutes: 15,
        checklist: [
          { item: 'Ask maternal infection history', points: 2, category: 'Anamnesis' },
          { item: 'Palpate fontanelle', points: 1, category: 'Physical Exam' },
          { item: 'Check for meningismus', points: 2, category: 'Physical Exam' }
        ]
      }
    ]
  };

  return stations[specialty] || [];
};

// ============ SPOT DIAGNOSIS ITEMS ============

export const generateSpotDxItems = (specialty: string): SpotDxItem[] => {
  const items: Record<string, SpotDxItem[]> = {
    'Internal Medicine': [
      {
        id: 'spotdx_im_1',
        imageUrl: 'https://via.placeholder.com/300x200?text=Butterfly+Rash',
        prompt: 'Pasien dengan rash di wajah seperti ini. Diagnosis?',
        diagnosisOptions: ['Systemic Lupus Erythematosus', 'Rosacea', 'Seborrheic Dermatitis', 'Psoriasis'],
        correctDiagnosisIndex: 0,
        nextStepOptions: ['Order ANA & Anti-dsDNA', 'Prescribe Topical Steroid', 'Refer to Dermatology', 'Observe'],
        correctNextStepIndex: 0,
        explanation: 'Butterfly rash adalah characteristic finding pada SLE. Confirmatory test adalah ANA dan Anti-dsDNA.'
      }
    ],
    'Dermatology': [
      {
        id: 'spotdx_derm_1',
        imageUrl: 'https://via.placeholder.com/300x200?text=Vesicular+Rash',
        prompt: 'Lesi vesikular grouped di dermatom T3. Diagnosis?',
        diagnosisOptions: ['Herpes Zoster', 'Varicella', 'Herpes Simplex', 'Pemphigus'],
        correctDiagnosisIndex: 0,
        nextStepOptions: ['Start Acyclovir 800mg 5x/day', 'Apply Calamine Lotion', 'Prescribe Antibiotics', 'No Treatment Needed'],
        correctNextStepIndex: 0,
        explanation: 'Herpes Zoster presents dengan vesicles dalam dermatom. Acyclovir should be started within 72 hours.'
      }
    ]
  };

  return items[specialty] || [];
};

// ============ MICROLEARNING PACKS ============

export const generateMicrolearningPacks = (specialty: string): MicrolearningPack[] => {
  return [
    {
      id: 'micro_1',
      title: '5-Minute EKG Basics',
      description: 'Quick review of normal EKG findings.',
      durationMinutes: 5,
      tags: ['Cardiology', 'Basics'],
      items: [
        {
          type: 'INFOGRAPHIC' as const,
          title: 'Normal EKG',
          content: 'https://via.placeholder.com/400x300?text=Normal+EKG'
        }
      ]
    }
  ];
};

// ============ CASE VIGNETTES ============

export const generateCaseVignettes = (specialty: string): CaseVignette[] => {
  const vignettes: Record<string, CaseVignette[]> = {
    'Internal Medicine': [
      {
        id: 'v_im_1',
        title: 'Chest Pain Case',
        content: 'Laki-laki 58 tahun datang dengan nyeri dada substernal sejak 2 jam lalu, menjalar ke punggung dan lengan kiri. Pasien juga mengeluh dyspnea dan diaphoresis.',
        tabs: [
          {
            label: 'Lab',
            content: [
              { label: 'Troponin I', value: '2.5', unit: 'ng/mL', flag: 'H' },
              { label: 'CK-MB', value: '45', unit: 'U/L', flag: 'H' }
            ]
          },
          {
            label: 'EKG',
            content: 'ST elevasi di V1-V4 dan aVL'
          }
        ]
      }
    ],
    'Surgery': [
      {
        id: 'v_surg_1',
        title: 'Acute Abdomen with Shock',
        content: 'Laki-laki 28 tahun datang dengan nyeri perut akut RLQ sejak 4 jam, demam 38.5°C, TD 90/60. Riwayat appendix buruk 2 minggu lalu. Pemeriksaan: guarding rigid, rebound tenderness +.',
        tabs: [
          {
            label: 'Lab',
            content: [
              { label: 'WBC', value: '18000', unit: '/μL', flag: 'H' },
              { label: 'Hemoglobin', value: '10.5', unit: 'g/dL', flag: 'L' }
            ]
          }
        ]
      }
    ],
    'Cardiology': [
      {
        id: 'v_card_1',
        title: 'STEMI Case',
        content: 'Laki-laki 55 tahun sudden onset nyeri dada 1 jam lalu, radiasi ke punggung kiri, keringatan. Riwayat HTN terkontrol. TD 160/100, HR 105.',
        tabs: [
          {
            label: 'EKG',
            content: 'ST elevasi V1-V4, reciprocal ST depression di II, III'
          }
        ]
      }
    ]
  };

  return vignettes[specialty] || [];
};

// ============ ADDITIONAL MOCK DATA FOR COMPLETENESS ============

export const CLINICAL_REASONING_QUESTION = {
  id: 'cr1',
  text: 'Case: 50yo Male with Chest Pain',
  options: [],
  correctAnswerIndex: 0,
  type: 'CLINICAL_REASONING' as const,
  category: 'Cardiology',
  points: 10
};

export const DEFAULT_OSCE_STATION: OSCEStation = {
  id: 'osce1',
  title: 'Station 1: Cardio-Respi',
  scenario: 'Anda bertugas di IGD. Datang Tn. Budi, 45 tahun, dengan keluhan sesak napas yang memberat sejak 2 hari lalu.',
  instruction: '1. Lakukan Anamnesis terarah.\n2. Lakukan Pemeriksaan Fisik Thorax yang relevan.\n3. Usulkan 2 pemeriksaan penunjang utama.\n4. Sampaikan diagnosis kerja kepada penguji.',
  durationMinutes: 15,
  checklist: [
    { item: 'Salam & Perkenalkan Diri', points: 1, category: 'Communication' },
    { item: 'Menanyakan Onset & Karakteristik Sesak', points: 2, category: 'Anamnesis' },
    { item: 'Menanyakan Riwayat Asma/Alergi/Merokok', points: 2, category: 'Anamnesis' },
    { item: 'Cuci Tangan sebelum PF', points: 1, category: 'Physical Exam' },
    { item: 'Inspeksi: Bentuk dada, jejas, retraksi', points: 2, category: 'Physical Exam' },
    { item: 'Auskultasi: Suara napas dasar & tambahan', points: 3, category: 'Physical Exam' },
    { item: 'Usul: Foto Toraks & Spirometri/Peak Flow', points: 2, category: 'Diagnosis' }
  ]
};
