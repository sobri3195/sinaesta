

import React, { useState, useEffect } from 'react';
import { UserRole, User, Exam, ViewState, ExamResult, FlashcardDeck, OSCEStation, CaseVignette, Question, SPECIALTIES, Specialty } from './types';
import ExamCreator from './components/ExamCreator';
import ExamTaker from './components/ExamTaker';
import ResultsView from './components/ExamResult';
import ExamHistory from './components/ExamHistory';
import AdminDashboard from './components/AdminDashboard';
import FlashcardCreator from './components/FlashcardCreator';
import FlashcardStudy from './components/FlashcardStudy';
import OSCEMode from './components/OSCEMode';
import Logbook from './components/Logbook';
import UserManagement from './components/UserManagement';
import CohortManagement from './components/CohortManagement';
import BlueprintManager from './components/BlueprintManager';
import KnowledgeBaseManager from './components/KnowledgeBaseManager';
import VignetteBuilder from './components/VignetteBuilder';
import QuestionReview from './components/QuestionReview';
import OSCEManager from './components/OSCEManager';
import MentorDashboard from './components/MentorDashboard';
import CaseDiscussion from './components/CaseDiscussion';
import ClinicalReasoningSimulator from './components/ClinicalReasoningSimulator';
import RemedialPath from './components/RemedialPath';
import SpotDxDrill from './components/SpotDxDrill';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import HighYieldMap from './components/HighYieldMap';
import QuestionQualityDashboard from './components/QuestionQualityDashboard';
import MicrolearningHub from './components/MicrolearningHub';
import CohortBenchmark from './components/CohortBenchmark';
import MentorMarketplace from './components/MentorMarketplace';
import LandingPage from './components/LandingPage';
import LegalDocs from './components/LegalDocs';

import { 
  LayoutDashboard, BookOpen, Settings, LogOut, UserCircle, Plus, Search, 
  Menu, X, History, Layers, Stethoscope, Activity, FileText, ClipboardCheck, Book,
  Users, School, Target, CheckCircle, Layout, MessageSquare, BrainCircuit, TrendingUp, Zap, BarChart2, Map, ShieldCheck, Timer, Upload, Info, RefreshCw
} from 'lucide-react';

// --- HELPER COMPONENTS ---

const NavButton = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition-colors ${active ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}>
    <span className="flex-shrink-0">{icon}</span>
    <span className="truncate">{label}</span>
  </button>
);

// --- DYNAMIC MOCK DATA GENERATOR ---
const generateExamsForSpecialty = (specialty: Specialty): Exam[] => {
    switch (specialty) {
        case 'Surgery':
            return [
                {
                    id: 'ex_surg_1',
                    title: 'Tryout Nasional PPDS Bedah Batch 1',
                    description: 'Simulasi kasus bedah akut abdomen, trauma, dan manajemen cairan perioperatif.',
                    durationMinutes: 90,
                    topic: 'Surgery',
                    difficulty: 'Hard',
                    createdAt: Date.now(),
                    questions: [
                        { id: 'q_s1', text: "Laki-laki 25 tahun pasca KLL, GCS 9, TD 80/50. FAST positif di morison pouch. Langkah awal?", options: ["Laparotomi Cito", "CT Scan Abdomen", "Resusitasi Cairan Kristaloid", "Pemasangan WSD"], correctAnswerIndex: 2, explanation: "Primary survey ABC: Sirkulasi. Resusitasi cairan agresif (atau darah) sebelum operatif pada syok hemoragik.", category: "Trauma", domain: "Therapy", points: 2 },
                        { id: 'q_s2', text: "Anak 5 tahun nyeri perut kanan bawah, leukosit 15.000, Alvarado Score 8. Tatalaksana?", options: ["Appendektomi", "Antibiotik IV", "Observasi 24 jam", "CT Scan Abdomen"], correctAnswerIndex: 0, explanation: "Alvarado score > 7 pada anak indikasi kuat appendektomi.", category: "Digestive", domain: "Therapy", points: 1 }
                    ]
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
                        { id: 'q_s3', text: "Struktur yang membentuk dinding posterior canalis inguinalis?", options: ["Fascia Transversalis", "Aponeurosis M. Obliquus Externus", "Ligamentum Inguinale", "Tendo Conjoint"], correctAnswerIndex: 0, explanation: "Fascia transversalis membentuk dinding posterior.", category: "Anatomy", domain: "Mechanism", points: 1 }
                    ]
                }
            ];
        case 'Pediatrics':
            return [
                {
                    id: 'ex_ped_1',
                    title: 'Tryout Nasional PPDS Anak Batch 1',
                    description: 'Kasus tumbuh kembang, infeksi tropis anak, dan kegawatdaruratan neonatus.',
                    durationMinutes: 90,
                    topic: 'Pediatrics',
                    difficulty: 'Hard',
                    createdAt: Date.now(),
                    questions: [
                        { id: 'q_p1', text: "Bayi 8 bulan, kejang demam pertama, durasi < 5 menit. Pemeriksaan penunjang yang wajib?", options: ["EEG", "Lumbar Puncture", "Darah Lengkap", "CT Scan Kepala"], correctAnswerIndex: 1, explanation: "Pada bayi < 12 bulan dengan kejang demam pertama, LP sangat dipertimbangkan untuk menyingkirkan meningitis (AAP Guidelines).", category: "Neurology", domain: "Investigation", points: 2 },
                        { id: 'q_p2', text: "Anak 2 tahun batuk menggonggong (barking cough), stridor inspiratoir. Diagnosis?", options: ["Croup (Laringotrakeobronkitis)", "Epiglotitis", "Benda Asing", "Asthma"], correctAnswerIndex: 0, explanation: "Barking cough + stridor khas untuk Croup virus.", category: "Respirology", domain: "Diagnosis", points: 1 }
                    ]
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
                         { id: 'q_p3', text: "Bayi baru lahir tidak bernapas, tonus otot lemah. Langkah awal resusitasi?", options: ["VTP", "Kompresi Dada", "Hangatkan & Posisikan Kepala", "Intubasi"], correctAnswerIndex: 2, explanation: "Langkah awal selalu HAIKAL: Hangatkan, Atur posisi, Isap lendir (jika perlu), Keringkan, Atur posisi lagi, Lalu rangsang taktil.", category: "Neonatology", domain: "Therapy", points: 1 }
                    ]
                }
            ];
        case 'Obgyn':
            return [
                {
                    id: 'ex_obg_1',
                    title: 'Tryout Nasional PPDS Obgyn Batch 1',
                    description: 'Manajemen perdarahan postpartum, preeklampsia, dan onkologi ginekologi dasar.',
                    durationMinutes: 90,
                    topic: 'Obgyn',
                    difficulty: 'Medium',
                    createdAt: Date.now(),
                    questions: [{ id: 'q_o1', text: "Wanita G1P0 hamil 38 minggu, TD 160/110, Proteinuria +3. Obat antihipertensi lini pertama?", options: ["Nifedipine Oral", "Furosemide", "Captopril", "Amlodipine"], correctAnswerIndex: 0, explanation: "Nifedipine oral short acting atau IV Labetalol/Hydralazine adalah lini pertama krisis hipertensi pada kehamilan.", category: "Obstetrics", domain: "Therapy", points: 1 }]
                }
            ];
        case 'Cardiology':
             return [
                {
                    id: 'ex_card_1',
                    title: 'EKG Interpretation Drill',
                    description: '30 soal interpretasi EKG ritme dan iskemia.',
                    durationMinutes: 45,
                    topic: 'Cardiology',
                    difficulty: 'Hard',
                    createdAt: Date.now(),
                    questions: [
                         { id: 'q_c1', text: "Gambaran EKG: ST Elevasi di V1-V4. Arteri koroner mana yang tersumbat?", options: ["LAD (Left Anterior Descending)", "LCx (Left Circumflex)", "RCA (Right Coronary Artery)", "LM (Left Main)"], correctAnswerIndex: 0, explanation: "V1-V4 merepresentasikan dinding anterior yang diperdarahi LAD.", category: "EKG", domain: "Diagnosis", points: 1 },
                         { id: 'q_c2', text: "Gambaran EKG: Saw-tooth appearance di lead II, III, aVF. Diagnosis?", options: ["Atrial Fibrillation", "Atrial Flutter", "SVT", "Sinus Tachycardia"], correctAnswerIndex: 1, explanation: "Gelombang F (flutter waves) berbentuk gergaji (saw-tooth) khas Atrial Flutter.", category: "Arrhythmia", domain: "Diagnosis", points: 1 }
                    ]
                }
             ];
        case 'Neurology':
             return [
                {
                    id: 'ex_neuro_1',
                    title: 'Localization in Neurology',
                    description: 'Menentukan letak lesi berdasarkan defisit neurologis.',
                    durationMinutes: 60,
                    topic: 'Neurology',
                    difficulty: 'Hard',
                    createdAt: Date.now(),
                    questions: [
                         { id: 'q_n1', text: "Pasien hemiparesis kanan, paresis N.VII kiri perifer. Letak lesi?", options: ["Pons", "Midbrain", "Cortex Cerebri", "Medulla Oblongata"], correctAnswerIndex: 0, explanation: "Sindrom Millard-Gubler (Crossed hemiplegia) khas lesi di Pons.", category: "Neuroanatomy", domain: "Diagnosis", points: 2 }
                    ]
                },
                {
                    id: 'ex_neuro_2',
                    title: 'Stroke Management Update',
                    description: 'Tatalaksana Stroke Iskemik dan Hemoragik fase akut.',
                    durationMinutes: 60,
                    topic: 'Neurology',
                    difficulty: 'Medium',
                    createdAt: Date.now() - 40000000,
                    questions: [
                         { id: 'q_n2', text: "Target tekanan darah pada Stroke Iskemik yang akan dilakukan trombolisis?", options: ["< 185/110 mmHg", "< 220/120 mmHg", "< 140/90 mmHg", "< 160/100 mmHg"], correctAnswerIndex: 0, explanation: "TD harus < 185/110 sebelum memulai rTPA untuk mengurangi risiko perdarahan.", category: "Vascular", domain: "Therapy", points: 1 }
                    ]
                }
             ];
        default: // Internal Medicine as fallback
            return [
                {
                    id: 'ex_im_1',
                    title: 'Tryout Nasional PPDS Interna Batch 1',
                    description: 'Simulasi ujian komprehensif dengan kasus vignette panjang dan integrasi laboratorium.',
                    durationMinutes: 90,
                    topic: 'Internal Medicine',
                    difficulty: 'Hard',
                    createdAt: Date.now(),
                    questions: [
                        { id: 'q1', text: "Berdasarkan hasil EKG dan enzim jantung di atas, serta onset nyeri dada < 12 jam, apa tatalaksana reperfusi utama yang paling direkomendasikan jika PCI tidak tersedia dalam 120 menit?", options: ["Heparinisasi IV", "Fibrinolitik", "CABG Cito", "Observasi ICU"], correctAnswerIndex: 1, explanation: "Fibrinolitik jika PCI > 120 menit.", category: "Cardiology", vignetteId: 'v1', domain: 'Therapy', points: 3 },
                        { id: 'q2', text: "Diagnosis banding nyeri dada menjalar ke punggung + Hipertensi tak terkontrol?", options: ["Pneumothorax", "Diseksi Aorta", "Emboli Paru", "Perikarditis"], correctAnswerIndex: 1, explanation: "Diseksi aorta.", category: "Cardiology", vignetteId: 'v1', domain: 'Diagnosis', points: 2 }
                    ],
                    vignettes: [{
                        id: 'v1', title: 'Kasus 1: Nyeri Dada Akut', content: "Laki-laki 58 tahun nyeri dada hebat menjalar ke punggung...",
                        tabs: [{ label: 'EKG', content: 'Sinus Tach, LVH', imageUrl: 'https://litfl.com/wp-content/uploads/2018/10/ECG-Left-Ventricular-Hypertrophy-LVH-Example-1.jpg' }]
                    }]
                },
                {
                    id: 'ex_im_2',
                    title: 'Drill Rheumatology & Autoimmune',
                    description: 'Soal kasus SLE, RA, dan Vaskulitis.',
                    durationMinutes: 60,
                    topic: 'Internal Medicine',
                    difficulty: 'Hard',
                    createdAt: Date.now() - 86400000,
                    questions: [
                        { id: 'q3', text: "Wanita muda, butterfly rash, nyeri sendi. Marker paling spesifik untuk SLE?", options: ["ANA IF", "Anti-dsDNA", "Anti-Histone", "RF"], correctAnswerIndex: 1, explanation: "Anti-dsDNA dan Anti-Smith sangat spesifik untuk SLE.", category: "Rheumatology", domain: "Diagnosis", points: 1 },
                        { id: 'q4', text: "Laki-laki tua, nyeri lutut diperberat aktivitas, krepitasi (+). Diagnosis?", options: ["Osteoarthritis", "Rheumatoid Arthritis", "Gout Arthritis", "Septic Arthritis"], correctAnswerIndex: 0, explanation: "Nyeri mekanik + usia tua + krepitasi khas OA.", category: "Rheumatology", domain: "Diagnosis", points: 1 }
                    ]
                }
            ];
    }
};

const MOCK_STUDENT: User = {
  id: 'u1', name: 'dr. Andi Pratama', role: UserRole.STUDENT, 
  avatar: 'https://ui-avatars.com/api/?name=Andi+Pratama&background=0D8ABC&color=fff', targetSpecialty: 'Internal Medicine'
};

const MOCK_ADMIN: User = {
  id: 't1', name: 'Admin Kolegium', role: UserRole.PROGRAM_ADMIN, 
  avatar: 'https://ui-avatars.com/api/?name=Admin+Kolegium&background=111827&color=fff'
};

const CLINICAL_REASONING_QUESTION: Question = {
    id: 'cr1',
    text: 'Case: 50yo Male with Chest Pain',
    options: [], // Not used in this mode
    correctAnswerIndex: 0,
    type: 'CLINICAL_REASONING',
    category: 'Cardiology',
    points: 10
};

const OSCE_STATION: OSCEStation = {
  id: 'osce1',
  title: 'Station 1: Cardio-Respi',
  scenario: "Anda bertugas di IGD. Datang Tn. Budi, 45 tahun, dengan keluhan sesak napas yang memberat sejak 2 hari lalu.",
  instruction: "1. Lakukan Anamnesis terarah.\n2. Lakukan Pemeriksaan Fisik Thorax yang relevan.\n3. Usulkan 2 pemeriksaan penunjang utama.\n4. Sampaikan diagnosis kerja kepada penguji.",
  durationMinutes: 15,
  checklist: [
     { item: 'Salam & Perkenalkan Diri', points: 1, category: 'Communication' },
     { item: 'Menanyakan Onset & Karakteristik Sesak', points: 2, category: 'Anamnesis' },
     { item: 'Menanyakan Riwayat Asma/Alergi/Merokok', points: 2, category: 'Anamnesis' },
     { item: 'Cuci Tangan sebelum PF', points: 1, category: 'Physical Exam' },
     { item: 'Inspeksi: Bentuk dada, jejas, retraksi', points: 2, category: 'Physical Exam' },
     { item: 'Auskultasi: Suara napas dasar & tambahan (Wheezing/Rhonki)', points: 3, category: 'Physical Exam' },
     { item: 'Usul: Foto Toraks & Spirometri/Peak Flow', points: 2, category: 'Diagnosis' }
  ]
};

// --- LOGO CONFIGURATION ---
// SINAESTA-DIGITAL-07122025-09 Design Replication
// SVG URL Encoded for maximum compatibility and sharpness
const SINAESTA_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="60" viewBox="0 0 220 60">
  <text x="10" y="42" font-family="sans-serif" font-weight="900" font-size="36" fill="#143d35">SIN</text>
  <g transform="translate(80, 5)">
    <path d="M15 10 C 15 0, 30 0, 30 10 V 22 C 30 32, 25 35, 20 35" stroke="#143d35" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M10 10 C 10 0, 15 0, 15 10" stroke="#143d35" stroke-width="3" fill="none" stroke-linecap="round"/>
    <circle cx="10" cy="10" r="3" fill="#143d35"/>
    <path d="M20 35 L 10 50 H 30 L 20 35" stroke="#143d35" stroke-width="3" fill="none" stroke-linejoin="round"/>
    <path d="M20 44 V 48 M 18 46 H 22" stroke="#143d35" stroke-width="2.5" stroke-linecap="round"/>
  </g>
  <text x="120" y="42" font-family="sans-serif" font-weight="900" font-size="36" fill="#143d35">ESTA</text>
</svg>`;

const DEFAULT_LOGO = `data:image/svg+xml;utf8,${encodeURIComponent(SINAESTA_SVG)}`;

// --- REGISTRATION DATA INTERFACE ---
interface RegistrationData {
  name: string;
  email: string;
  phone: string;
  institution: string;
  targetSpecialty: Specialty;
  expectedYear: number;
}

// --- APP COMPONENT ---

const App: React.FC = () => {
  const [user, setUser] = useState<User>(MOCK_STUDENT);
  const [view, setView] = useState<ViewState>('LANDING'); // Set Landing as initial view
  
  const [exams, setExams] = useState<Exam[]>([]);
  const [activeExam, setActiveExam] = useState<Exam | null>(null);
  const [lastResult, setLastResult] = useState<ExamResult | null>(null);
  const [examHistory, setExamHistory] = useState<ExamResult[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showSpecialtySelector, setShowSpecialtySelector] = useState(false);
  
  // App Branding
  const [logoUrl, setLogoUrl] = useState(DEFAULT_LOGO);
  
  // Flashcards
  const [flashcardDecks, setFlashcardDecks] = useState<FlashcardDeck[]>([]);
  const [activeDeck, setActiveDeck] = useState<FlashcardDeck | null>(null);

  // Initialize Exams based on Specialty
  useEffect(() => {
      if (user.role === UserRole.STUDENT && user.targetSpecialty) {
          setExams(generateExamsForSpecialty(user.targetSpecialty));
      }
  }, [user.targetSpecialty, user.role]);

  const toggleUser = () => {
    // If student, switch to PROGRAM_ADMIN, else switch to STUDENT
    const newUser = user.role === UserRole.STUDENT ? MOCK_ADMIN : MOCK_STUDENT;
    setUser(newUser);
    setView(newUser.role === UserRole.STUDENT ? 'DASHBOARD' : 'ADMIN_DASHBOARD');
  };

  const handleLogout = () => {
      setView('LANDING');
      setShowSpecialtySelector(false);
      setIsSidebarOpen(false);
      // Optional: Clear local session if implemented
  };

  const updateSpecialty = (specialty: Specialty) => {
      setUser({ ...user, targetSpecialty: specialty });
      setShowSpecialtySelector(false);
      setView('DASHBOARD'); // Reset to dashboard to refresh content
  };

  const handleRegistration = (registrationData: RegistrationData) => {
    // Create new user based on registration data
    const newUser: User = {
      id: `user_${Date.now()}`,
      name: registrationData.name,
      role: UserRole.STUDENT,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(registrationData.name)}&background=0D8ABC&color=fff`,
      targetSpecialty: registrationData.targetSpecialty,
      institution: registrationData.institution,
      strNumber: registrationData.phone
    };

    // Set the new user
    setUser(newUser);
    
    // Generate exams for the selected specialty
    setExams(generateExamsForSpecialty(registrationData.targetSpecialty));
    
    // Navigate to dashboard
    setView('DASHBOARD');
    
    console.log('User registered:', newUser);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          const reader = new FileReader();
          
          reader.onload = (ev) => {
              if (ev.target?.result) {
                  const result = ev.target.result as string;
                  
                  // Mock Analysis Logic
                  const img = new Image();
                  img.onload = () => {
                      const width = img.width;
                      const height = img.height;
                      const aspectRatio = (width / height).toFixed(2);
                      
                      alert(`Logo Analyzed!\nDimensions: ${width}x${height}px\nAspect Ratio: ${aspectRatio}\nStatus: Logo successfully updated.`);
                      setLogoUrl(result);
                  };
                  img.src = result;
              }
          };
          reader.readAsDataURL(file);
      }
  };

  const closeSidebar = () => setIsSidebarOpen(false);

  // Helper to check if user has admin privileges
  const isAdmin = user.role === UserRole.SUPER_ADMIN || user.role === UserRole.PROGRAM_ADMIN || user.role === UserRole.TEACHER;
  const isMentor = user.role === UserRole.TEACHER || user.role === UserRole.PROGRAM_ADMIN;

  // Render Landing Page if view is LANDING
  if (view === 'LANDING') {
      return (
          <LandingPage 
            logoUrl={logoUrl} 
            onGetStarted={() => setView('DASHBOARD')} 
            onNavigate={(newView) => setView(newView)}
            onRegister={handleRegistration}
          />
      );
  }

  // Render Legal Docs (Privacy, Terms, Support)
  if (view === 'PRIVACY' || view === 'TERMS' || view === 'SUPPORT') {
      return (
          <LegalDocs 
            type={view} 
            onBack={() => setView('LANDING')} 
          />
      );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex font-sans overflow-hidden">
      {/* Sidebar Mobile Overlay */}
      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={closeSidebar} />}

      {/* Navigation Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 sm:w-72 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-300 lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Branding Logo */}
        <div className="h-16 sm:h-20 flex items-center justify-center border-b border-gray-100 bg-white relative group px-4 sm:px-6">
            <img src={logoUrl} alt="Sinaesta Logo" className="h-8 sm:h-10 w-auto object-contain transition-all" />
            {isAdmin && (
                <label className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-xs font-bold gap-2">
                    <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                    <Upload size={14} /> Upload & Analyze Logo
                    <span className="text-[10px] font-normal text-gray-300">Click to change</span>
                </label>
            )}
        </div>

        <nav className="flex-1 px-3 sm:px-4 py-4 sm:py-6 space-y-1 overflow-y-auto custom-scrollbar">
           {user.role === UserRole.STUDENT && (
             <>
               <div className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider px-3 sm:px-4 mb-2">Study ({user.targetSpecialty})</div>
               <NavButton active={view === 'DASHBOARD'} onClick={() => { setView('DASHBOARD'); closeSidebar(); }} icon={<LayoutDashboard size={20} />} label="Dashboard" />
               <NavButton active={view === 'MICROLEARNING'} onClick={() => { setView('MICROLEARNING'); closeSidebar(); }} icon={<Zap size={20} />} label="Microlearning" />
               <NavButton active={view === 'FLASHCARDS'} onClick={() => { setView('FLASHCARDS'); closeSidebar(); }} icon={<Layers size={20} />} label="Flashcards" />
               <NavButton active={view === 'SPOT_DX_DRILL'} onClick={() => { setView('SPOT_DX_DRILL'); closeSidebar(); }} icon={<Timer size={20} />} label="Spot Dx Sprint" />
               <NavButton active={view === 'CLINICAL_REASONING_SIM'} onClick={() => { setView('CLINICAL_REASONING_SIM'); closeSidebar(); }} icon={<BrainCircuit size={20} />} label="Clinical Reasoning" />
               <NavButton active={view === 'REMEDIAL_PATH'} onClick={() => { setView('REMEDIAL_PATH'); closeSidebar(); }} icon={<TrendingUp size={20} />} label="Remedial Path" />
               <NavButton active={view === 'CASE_DISCUSSION'} onClick={() => { setView('CASE_DISCUSSION'); closeSidebar(); }} icon={<MessageSquare size={20} />} label="Diskusi Kasus" />
               <NavButton active={view === 'MENTOR_MARKETPLACE'} onClick={() => { setView('MENTOR_MARKETPLACE'); closeSidebar(); }} icon={<Users size={20} />} label="Find Mentor" />
               
               <div className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider px-3 sm:px-4 mt-6 mb-2">Clinical Skills</div>
               <NavButton active={view === 'OSCE_PRACTICE'} onClick={() => { setView('OSCE_PRACTICE'); closeSidebar(); }} icon={<ClipboardCheck size={20} />} label="Simulasi OSCE" />
               <NavButton active={view === 'LOGBOOK'} onClick={() => { setView('LOGBOOK'); closeSidebar(); }} icon={<Book size={20} />} label="E-Logbook" />
               
               <div className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider px-3 sm:px-4 mt-6 mb-2">Performance</div>
               <NavButton active={view === 'BENCHMARK'} onClick={() => { setView('BENCHMARK'); closeSidebar(); }} icon={<BarChart2 size={20} />} label="Benchmark" />
               <NavButton active={view === 'HISTORY'} onClick={() => { setView('HISTORY'); closeSidebar(); }} icon={<History size={20} />} label="Exam History" />
             </>
           )}

           {isAdmin && (
             <>
               <div className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider px-3 sm:px-4 mb-2">Program Management</div>
               {isMentor && <NavButton active={view === 'MENTOR_DASHBOARD'} onClick={() => { setView('MENTOR_DASHBOARD'); closeSidebar(); }} icon={<Activity size={20} />} label="Mentor Dashboard" />}
               <NavButton active={view === 'ADMIN_DASHBOARD'} onClick={() => { setView('ADMIN_DASHBOARD'); closeSidebar(); }} icon={<LayoutDashboard size={20} />} label="Bank Soal" />
               <NavButton active={view === 'CREATE_EXAM'} onClick={() => { setView('CREATE_EXAM'); closeSidebar(); }} icon={<Plus size={20} />} label="Input Soal Baru" />
               <NavButton active={view === 'VIGNETTE_BUILDER'} onClick={() => { setView('VIGNETTE_BUILDER'); closeSidebar(); }} icon={<Layout size={20} />} label="Vignette Builder" />
               <NavButton active={view === 'QUESTION_REVIEW'} onClick={() => { setView('QUESTION_REVIEW'); closeSidebar(); }} icon={<CheckCircle size={20} />} label="QC & Review" />
               <NavButton active={view === 'OSCE_MANAGER'} onClick={() => { setView('OSCE_MANAGER'); closeSidebar(); }} icon={<ClipboardCheck size={20} />} label="OSCE Manager" />
               
               <div className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider px-3 sm:px-4 mt-6 mb-2">Clinical & Logs</div>
               <NavButton active={view === 'LOGBOOK'} onClick={() => { setView('LOGBOOK'); closeSidebar(); }} icon={<Book size={20} />} label="Review Logbook" />
               <NavButton active={view === 'CASE_DISCUSSION'} onClick={() => { setView('CASE_DISCUSSION'); closeSidebar(); }} icon={<MessageSquare size={20} />} label="Forum Diskusi" />

               <div className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider px-3 sm:px-4 mt-6 mb-2">Curriculum & Reports</div>
               <NavButton active={view === 'BLUEPRINT_MANAGER'} onClick={() => { setView('BLUEPRINT_MANAGER'); closeSidebar(); }} icon={<Target size={20} />} label="Blueprint / Matrix" />
               <NavButton active={view === 'KNOWLEDGE_BASE'} onClick={() => { setView('KNOWLEDGE_BASE'); closeSidebar(); }} icon={<BookOpen size={20} />} label="Referensi & Guideline" />
               <NavButton active={view === 'HIGH_YIELD_MAP'} onClick={() => { setView('HIGH_YIELD_MAP'); closeSidebar(); }} icon={<Map size={20} />} label="High-Yield Map" />
               <NavButton active={view === 'QUESTION_QUALITY'} onClick={() => { setView('QUESTION_QUALITY'); closeSidebar(); }} icon={<ShieldCheck size={20} />} label="Quality Score (Q-QS)" />
               
               {user.role === UserRole.PROGRAM_ADMIN && (
                   <button onClick={() => setView('ADMIN_DASHBOARD')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors text-gray-600 hover:bg-gray-50`}>
                      <BarChart2 size={20} /> Analytics Report
                   </button>
               )}

               <div className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider px-3 sm:px-4 mt-6 mb-2">Organization</div>
               <NavButton active={view === 'USER_MANAGEMENT'} onClick={() => { setView('USER_MANAGEMENT'); closeSidebar(); }} icon={<Users size={20} />} label="User Management" />
               <NavButton active={view === 'COHORT_MANAGEMENT'} onClick={() => { setView('COHORT_MANAGEMENT'); closeSidebar(); }} icon={<School size={20} />} label="Batch / Cohort" />
             </>
           )}
        </nav>

        <div className="p-3 sm:p-4 border-t border-gray-100 relative">
          <div 
            className="flex items-center gap-2 sm:gap-3 w-full p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
            onClick={() => setShowSpecialtySelector(!showSpecialtySelector)}
          >
            <img src={user.avatar} alt="User" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-gray-200 flex-shrink-0" />
            <div className="text-left flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-[10px] sm:text-xs text-gray-500 truncate">{user.targetSpecialty || user.role}</p>
            </div>
            <Settings size={14} className="text-gray-400 sm:w-4 sm:h-4 flex-shrink-0" />
          </div>

          {/* Specialty Selector Popover */}
          {showSpecialtySelector && (
              <div className="absolute bottom-full left-4 right-4 mb-2 bg-white rounded-xl shadow-xl border border-gray-200 p-2 z-50 animate-in slide-in-from-bottom-2">
                  <div className="text-xs font-bold text-gray-400 px-2 py-1 uppercase tracking-wide">Target Specialty</div>
                  <div className="max-h-48 overflow-y-auto space-y-1">
                      {SPECIALTIES.map(spec => (
                          <button
                            key={spec}
                            onClick={() => updateSpecialty(spec)}
                            className={`w-full text-left px-2 py-1.5 rounded text-sm hover:bg-indigo-50 hover:text-indigo-700 ${user.targetSpecialty === spec ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-gray-700'}`}
                          >
                              {spec}
                          </button>
                      ))}
                  </div>
                  <div className="border-t border-gray-100 mt-2 pt-2 space-y-1">
                      <button onClick={toggleUser} className="w-full text-left px-2 py-1.5 rounded text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                          <RefreshCw size={14} /> Switch Role (Demo)
                      </button>
                      <button onClick={handleLogout} className="w-full text-left px-2 py-1.5 rounded text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium">
                          <LogOut size={14} /> Keluar Aplikasi
                      </button>
                  </div>
              </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="h-14 sm:h-16 bg-white border-b border-gray-200 flex lg:hidden items-center justify-between px-3 sm:px-4">
           <div className="flex items-center gap-2 sm:gap-3">
             <button onClick={() => setIsSidebarOpen(true)} className="p-1.5 sm:p-2 -ml-1.5 sm:-ml-2 text-gray-600 active:bg-gray-100 rounded-lg transition-colors">
               <Menu size={22} className="sm:w-6 sm:h-6" />
             </button>
             <img src={logoUrl} alt="Sinaesta" className="h-7 sm:h-8 w-auto object-contain" />
           </div>
           <UserCircle size={24} className="text-gray-400 sm:w-7 sm:h-7" />
        </header>

        {/* View Routing */}
        <div className="flex-1 overflow-hidden relative">
           {view === 'DASHBOARD' && user.role === UserRole.STUDENT && (
              <div className="p-4 sm:p-6 lg:p-8 overflow-y-auto h-full">
                 <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">Selamat Datang, Dok!</h1>
                 <p className="text-sm sm:text-base text-gray-500 mb-6 sm:mb-8">Siap melanjutkan persiapan PPDS <span className="font-bold text-indigo-600">{user.targetSpecialty}</span> hari ini?</p>
                 
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
                    {exams.map(exam => (
                       <div key={exam.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all p-4 sm:p-5 lg:p-6 flex flex-col">
                          <div className="flex justify-between items-start mb-3 sm:mb-4">
                             <div className="flex-1 min-w-0">
                                <span className="text-[10px] sm:text-xs font-bold text-indigo-600 uppercase tracking-wide bg-indigo-50 px-2 py-1 rounded inline-block">{exam.topic}</span>
                                <h3 className="font-bold text-base sm:text-lg text-gray-900 mt-2 leading-tight">{exam.title}</h3>
                             </div>
                             <div className={`px-2 py-1 rounded text-[10px] sm:text-xs font-bold ml-2 flex-shrink-0 ${exam.difficulty === 'Hard' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                                {exam.difficulty}
                             </div>
                          </div>
                          <p className="text-gray-500 text-xs sm:text-sm mb-4 sm:mb-6 flex-1 line-clamp-3">{exam.description}</p>
                          <button 
                             onClick={() => { setActiveExam(exam); setView('TAKE_EXAM'); }}
                             className="w-full py-2.5 sm:py-2 bg-indigo-600 text-white rounded-lg text-sm sm:text-base font-bold hover:bg-indigo-700 active:bg-indigo-800 transition-colors"
                          >
                             Mulai Simulasi
                          </button>
                       </div>
                    ))}
                    
                    {/* Feature Highlight Cards */}
                    <div onClick={() => setView('SPOT_DX_DRILL')} className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-md p-4 sm:p-5 lg:p-6 flex flex-col text-white cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform">
                        <Zap size={28} className="mb-3 sm:mb-4 text-white/80 sm:w-8 sm:h-8" />
                        <h3 className="font-bold text-lg sm:text-xl mb-1">Spot Dx Drill</h3>
                        <p className="text-white/80 text-xs sm:text-sm mb-3 sm:mb-4 flex-1">60-second rapid fire cases to train pattern recognition.</p>
                        <span className="bg-white/20 w-fit px-3 py-1 rounded-full text-xs font-bold">Start Sprint &rarr;</span>
                    </div>

                    <div onClick={() => setView('MICROLEARNING')} className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl shadow-md p-4 sm:p-5 lg:p-6 flex flex-col text-white cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform">
                        <Zap size={28} className="mb-3 sm:mb-4 text-white/80 sm:w-8 sm:h-8" />
                        <h3 className="font-bold text-lg sm:text-xl mb-1">Microlearning</h3>
                        <p className="text-white/80 text-xs sm:text-sm mb-3 sm:mb-4 flex-1">5-min study packs for your busy shifts.</p>
                        <span className="bg-white/20 w-fit px-3 py-1 rounded-full text-xs font-bold">Quick Study &rarr;</span>
                    </div>

                    <div onClick={() => setView('CLINICAL_REASONING_SIM')} className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-md p-4 sm:p-5 lg:p-6 flex flex-col text-white cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform">
                        <BrainCircuit size={28} className="mb-3 sm:mb-4 text-white/80 sm:w-8 sm:h-8" />
                        <h3 className="font-bold text-lg sm:text-xl mb-1">Reasoning Sim</h3>
                        <p className="text-white/80 text-xs sm:text-sm mb-3 sm:mb-4 flex-1">Step-by-step diagnostic challenges with partial scoring.</p>
                        <span className="bg-white/20 w-fit px-3 py-1 rounded-full text-xs font-bold">Practice Now &rarr;</span>
                    </div>
                 </div>
              </div>
           )}

           {view === 'TAKE_EXAM' && activeExam && (
              <ExamTaker 
                 exam={activeExam}
                 onSubmit={(ans) => {
                    // Weighted scoring logic
                    const score = ans.reduce((acc, a, i) => {
                        const q = activeExam.questions[i];
                        const points = q.points || 1;
                        return a === q.correctAnswerIndex ? acc + points : acc;
                    }, 0);
                    
                    setLastResult({
                       examId: activeExam.id, studentId: user.id, score, totalQuestions: activeExam.questions.length, answers: ans, completedAt: Date.now()
                    });
                    setView('RESULTS');
                 }}
                 onExit={() => setView('DASHBOARD')}
              />
           )}

           {view === 'RESULTS' && lastResult && activeExam && (
              <div className="p-8 overflow-y-auto h-full">
                 <ResultsView exam={activeExam} result={lastResult} onClose={() => setView('DASHBOARD')} />
              </div>
           )}

           {view === 'OSCE_PRACTICE' && (
              <div className="h-full p-4 md:p-8 bg-gray-100 overflow-y-auto">
                 <OSCEMode station={OSCE_STATION} onComplete={() => setView('DASHBOARD')} />
              </div>
           )}

           {view === 'CLINICAL_REASONING_SIM' && (
              <div className="h-full p-4 md:p-8 bg-gray-100 overflow-y-auto">
                 <ClinicalReasoningSimulator 
                    question={CLINICAL_REASONING_QUESTION} 
                    onComplete={() => setView('DASHBOARD')} 
                    onExit={() => setView('DASHBOARD')} 
                 />
              </div>
           )}

           {view === 'SPOT_DX_DRILL' && (
               <div className="h-full bg-gray-100 overflow-y-auto">
                   <SpotDxDrill onExit={() => setView('DASHBOARD')} />
               </div>
           )}

           {view === 'MICROLEARNING' && (
               <div className="h-full overflow-y-auto">
                   <MicrolearningHub onClose={() => setView('DASHBOARD')} />
               </div>
           )}

           {view === 'BENCHMARK' && (
               <div className="h-full overflow-y-auto">
                   <CohortBenchmark onClose={() => setView('DASHBOARD')} />
               </div>
           )}

           {view === 'HISTORY' && (
               <div className="p-8 overflow-y-auto h-full">
                  <ExamHistory results={examHistory} exams={exams} />
               </div>
           )}

           {view === 'REMEDIAL_PATH' && (
              <div className="h-full p-4 md:p-8 overflow-y-auto">
                 <RemedialPath />
              </div>
           )}

           {view === 'LOGBOOK' && (
             <div className="h-full p-4 md:p-8 overflow-y-auto">
               <Logbook userRole={user.role} targetSpecialty={user.targetSpecialty} />
             </div>
           )}
           
           {view === 'MENTOR_DASHBOARD' && (
             <div className="h-full overflow-y-auto">
               <MentorDashboard />
             </div>
           )}

           {view === 'MENTOR_MARKETPLACE' && (
             <div className="h-full overflow-y-auto">
               <MentorMarketplace onClose={() => setView('DASHBOARD')} />
             </div>
           )}

           {view === 'CASE_DISCUSSION' && (
             <div className="h-full overflow-y-auto">
               <CaseDiscussion userRole={user.role} />
             </div>
           )}

           {/* Admin Views */}
           {view === 'ADMIN_DASHBOARD' && (
              <div className="p-8 overflow-y-auto h-full">
                  {/* Admin dashboard now can also show Analytics */}
                  {user.role === UserRole.PROGRAM_ADMIN && <AnalyticsDashboard />}
                  <div className="mt-8">
                     <AdminDashboard 
                        exams={exams} 
                        onCreateExam={() => setView('CREATE_EXAM')} 
                        onEditExam={(e) => { setActiveExam(e); setView('CREATE_EXAM'); }} 
                        onPreviewExam={(e) => { setActiveExam(e); setView('TAKE_EXAM'); }} 
                        onDeleteExam={() => {}} 
                     />
                  </div>
              </div>
           )}

           {view === 'CREATE_EXAM' && (
              <div className="p-8 h-full overflow-hidden">
                 <ExamCreator 
                    initialExam={activeExam}
                    onSave={(e) => { setExams([...exams, e]); setView('ADMIN_DASHBOARD'); setActiveExam(null); }} 
                    onCancel={() => { setView('ADMIN_DASHBOARD'); setActiveExam(null); }} 
                 />
              </div>
           )}

           {view === 'USER_MANAGEMENT' && (
              <div className="p-8 h-full overflow-hidden">
                 <UserManagement />
              </div>
           )}

           {view === 'COHORT_MANAGEMENT' && (
              <div className="p-8 h-full overflow-hidden">
                 <CohortManagement />
              </div>
           )}

           {view === 'BLUEPRINT_MANAGER' && (
              <div className="h-full overflow-hidden">
                 <BlueprintManager onClose={() => setView('ADMIN_DASHBOARD')} />
              </div>
           )}

           {view === 'KNOWLEDGE_BASE' && (
              <div className="h-full overflow-hidden">
                 <KnowledgeBaseManager onClose={() => setView('ADMIN_DASHBOARD')} />
              </div>
           )}

           {view === 'HIGH_YIELD_MAP' && (
              <div className="h-full overflow-hidden">
                 <HighYieldMap onClose={() => setView('ADMIN_DASHBOARD')} />
              </div>
           )}

           {view === 'QUESTION_QUALITY' && (
              <div className="h-full overflow-hidden">
                 <QuestionQualityDashboard onClose={() => setView('ADMIN_DASHBOARD')} />
              </div>
           )}

           {view === 'VIGNETTE_BUILDER' && (
              <div className="h-full overflow-hidden p-8">
                 <VignetteBuilder onSave={(v: CaseVignette) => { setView('ADMIN_DASHBOARD'); }} onCancel={() => setView('ADMIN_DASHBOARD')} />
              </div>
           )}

           {view === 'QUESTION_REVIEW' && (
              <div className="h-full overflow-hidden p-8">
                 <QuestionReview questions={exams.flatMap(e => e.questions)} onApprove={() => {}} onReject={() => {}} onClose={() => setView('ADMIN_DASHBOARD')} />
              </div>
           )}

           {view === 'OSCE_MANAGER' && (
              <div className="h-full overflow-hidden p-8">
                 <OSCEManager onClose={() => setView('ADMIN_DASHBOARD')} />
              </div>
           )}
           
           {view === 'FLASHCARDS' && (
             <div className="p-8 h-full overflow-y-auto">
                <FlashcardCreator onSave={(d) => { setFlashcardDecks([...flashcardDecks, d]); setView('DASHBOARD'); }} onCancel={() => setView('DASHBOARD')} />
             </div>
           )}
        </div>
      </main>
    </div>
  );
};

export default App;
