import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  BrainCircuit,
  Calendar,
  CheckCircle,
  ClipboardList,
  HeartPulse,
  Mic,
  MicOff,
  PauseCircle,
  PlayCircle,
  RefreshCw,
  Smile,
  Stethoscope,
  Timer,
  UserCircle,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { geminiLiveService } from '../services/geminiLiveService';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';

type ScenarioType =
  | 'History Taking'
  | 'Physical Exam'
  | 'Breaking Bad News'
  | 'Emergency'
  | 'Chronic Disease'
  | 'Pediatric'
  | 'Elderly Care';

type EmotionState = 'anxious' | 'neutral' | 'guarded' | 'relieved' | 'distressed' | 'angry';

type Persona = {
  id: string;
  name: string;
  age: number;
  gender: string;
  ethnicity: string;
  languagePreference: 'id-ID' | 'en-US';
  personality: string;
  avatarColor: string;
};

type ScenarioNode = {
  id: string;
  patientPrompt: string;
  expectedKeywords: string[];
  transitions: Array<{
    keywords: string[];
    nextId: string;
    impact: {
      empathy?: number;
      clinical?: number;
      professionalism?: number;
      emotionShift?: number;
    };
  }>;
  fallbackNextId?: string;
};

type ScenarioDefinition = {
  id: string;
  title: string;
  type: ScenarioType;
  difficulty: 'Easy' | 'Moderate' | 'Hard';
  durationMinutes: number;
  description: string;
  persona: Persona;
  startNodeId: string;
  nodes: Record<string, ScenarioNode>;
  vitals: Array<{ label: string; value: string }>;
  history: string[];
  labs: Array<{ name: string; value: string; status: 'normal' | 'abnormal' }>;
  examTools: string[];
  suggestedDiagnostics: string[];
  suggestedTreatments: string[];
};

type ChatMessage = {
  id: string;
  sender: 'student' | 'patient' | 'system';
  text: string;
  timestamp: number;
};

type PerformanceScore = {
  clinical: number;
  communication: number;
  empathy: number;
  professionalism: number;
  timeManagement: number;
};

type ScenarioAttempt = {
  id: string;
  scenarioId: string;
  timestamp: number;
  durationSeconds: number;
  transcript: ChatMessage[];
  performance: PerformanceScore;
  mentorComment?: string;
  mentorOverride?: Partial<PerformanceScore>;
};

const EMOTION_LABELS: Record<EmotionState, string> = {
  anxious: 'Anxious',
  neutral: 'Neutral',
  guarded: 'Guarded',
  relieved: 'Relieved',
  distressed: 'Distressed',
  angry: 'Angry',
};

const EMOTION_COLORS: Record<EmotionState, string> = {
  anxious: 'bg-amber-100 text-amber-700',
  neutral: 'bg-slate-100 text-slate-700',
  guarded: 'bg-purple-100 text-purple-700',
  relieved: 'bg-green-100 text-green-700',
  distressed: 'bg-rose-100 text-rose-700',
  angry: 'bg-red-100 text-red-700',
};

const EMPATHY_KEYWORDS = ['sorry', 'maaf', 'understand', 'mengerti', 'empati', 'tenang', 'relax'];
const PROFESSIONALISM_KEYWORDS = ['please', 'tolong', 'terima kasih', 'thank you', 'izin'];
const CLINICAL_KEYWORDS = ['nyeri', 'pain', 'durasi', 'duration', 'riwayat', 'history', 'obat', 'medication'];

const SCENARIOS: ScenarioDefinition[] = [
  {
    id: 'history-chest-pain',
    title: 'Chest Pain in a 55-year-old',
    type: 'Emergency',
    difficulty: 'Hard',
    durationMinutes: 12,
    description: 'Emergency chest pain evaluation with high anxiety.',
    persona: {
      id: 'p1',
      name: 'Budi Santoso',
      age: 55,
      gender: 'Male',
      ethnicity: 'Javanese',
      languagePreference: 'id-ID',
      personality: 'Anxious, cooperative',
      avatarColor: 'bg-blue-600',
    },
    startNodeId: 'intro',
    nodes: {
      intro: {
        id: 'intro',
        patientPrompt: 'Dok, dada saya terasa sangat sesak dan nyeri sejak 30 menit lalu.',
        expectedKeywords: ['nyeri', 'dada', 'sesak'],
        transitions: [
          {
            keywords: ['nyeri', 'dada', 'sesak'],
            nextId: 'history',
            impact: { clinical: 10, empathy: 2, emotionShift: -1 },
          },
        ],
        fallbackNextId: 'history',
      },
      history: {
        id: 'history',
        patientPrompt: 'Nyeri terasa menjalar ke lengan kiri dan saya berkeringat dingin.',
        expectedKeywords: ['durasi', 'menjalar', 'keringat'],
        transitions: [
          {
            keywords: ['durasi', 'berapa lama', 'sejak'],
            nextId: 'risk',
            impact: { clinical: 8, empathy: 1, emotionShift: -1 },
          },
          {
            keywords: ['tenang', 'tarik napas', 'maaf'],
            nextId: 'reassure',
            impact: { empathy: 6, professionalism: 3, emotionShift: -2 },
          },
        ],
        fallbackNextId: 'risk',
      },
      risk: {
        id: 'risk',
        patientPrompt: 'Saya punya riwayat hipertensi dan merokok sejak muda.',
        expectedKeywords: ['hipertensi', 'merokok'],
        transitions: [
          {
            keywords: ['obat', 'medication', 'aspirin'],
            nextId: 'plan',
            impact: { clinical: 6, professionalism: 2, emotionShift: -1 },
          },
        ],
        fallbackNextId: 'plan',
      },
      reassure: {
        id: 'reassure',
        patientPrompt: 'Terima kasih, dok. Saya mencoba tenang.',
        expectedKeywords: ['jelaskan', 'prosedur', 'ekg'],
        transitions: [
          {
            keywords: ['ekg', 'monitor', 'oksigen'],
            nextId: 'plan',
            impact: { clinical: 8, empathy: 4, professionalism: 4, emotionShift: -2 },
          },
        ],
        fallbackNextId: 'plan',
      },
      plan: {
        id: 'plan',
        patientPrompt: 'Saya siap mengikuti pemeriksaan dan pengobatan.',
        expectedKeywords: ['rujukan', 'rawat', 'perawatan'],
        transitions: [
          {
            keywords: ['terima kasih', 'thanks'],
            nextId: 'closing',
            impact: { professionalism: 6, empathy: 3 },
          },
        ],
        fallbackNextId: 'closing',
      },
      closing: {
        id: 'closing',
        patientPrompt: 'Terima kasih dokter, saya merasa lebih yakin sekarang.',
        expectedKeywords: [],
        transitions: [],
      },
    },
    vitals: [
      { label: 'BP', value: '160/95 mmHg' },
      { label: 'HR', value: '108 bpm' },
      { label: 'RR', value: '24 rpm' },
      { label: 'SpO₂', value: '94%' },
    ],
    history: ['Hypertension x10 years', 'Smoker 20 pack-years', 'No known allergies'],
    labs: [
      { name: 'Troponin', value: 'Pending', status: 'abnormal' },
      { name: 'ECG', value: 'ST elevation in II, III, aVF', status: 'abnormal' },
    ],
    examTools: ['Cardiac auscultation', 'Pulse check', 'Chest palpation'],
    suggestedDiagnostics: ['ECG', 'Troponin', 'Chest X-ray'],
    suggestedTreatments: ['Oxygen', 'Aspirin', 'Nitroglycerin', 'Cath lab referral'],
  },
  {
    id: 'breaking-bad-news',
    title: 'Delivering Cancer Diagnosis',
    type: 'Breaking Bad News',
    difficulty: 'Hard',
    durationMinutes: 15,
    description: 'Empathy-heavy conversation about biopsy results.',
    persona: {
      id: 'p2',
      name: 'Maria Lestari',
      age: 42,
      gender: 'Female',
      ethnicity: 'Sundanese',
      languagePreference: 'id-ID',
      personality: 'Guarded, anxious',
      avatarColor: 'bg-rose-600',
    },
    startNodeId: 'intro',
    nodes: {
      intro: {
        id: 'intro',
        patientPrompt: 'Dokter, bagaimana hasil biopsi saya?',
        expectedKeywords: ['hasil', 'biopsi'],
        transitions: [
          {
            keywords: ['izin', 'maaf', 'empati'],
            nextId: 'deliver',
            impact: { empathy: 8, professionalism: 6, emotionShift: -1 },
          },
        ],
        fallbackNextId: 'deliver',
      },
      deliver: {
        id: 'deliver',
        patientPrompt: 'Jadi... saya terkena kanker ya?',
        expectedKeywords: ['kanker', 'stadium'],
        transitions: [
          {
            keywords: ['rencana', 'treatment', 'terapi'],
            nextId: 'support',
            impact: { clinical: 6, empathy: 6, emotionShift: -2 },
          },
          {
            keywords: ['maaf', 'saya mengerti'],
            nextId: 'support',
            impact: { empathy: 8, professionalism: 4, emotionShift: -2 },
          },
        ],
        fallbackNextId: 'support',
      },
      support: {
        id: 'support',
        patientPrompt: 'Saya takut, tapi saya ingin tahu langkah selanjutnya.',
        expectedKeywords: ['dukungan', 'keluarga', 'tim'],
        transitions: [
          {
            keywords: ['tim', 'multidisiplin', 'jadwal'],
            nextId: 'closing',
            impact: { clinical: 4, professionalism: 4, empathy: 4, emotionShift: -1 },
          },
        ],
        fallbackNextId: 'closing',
      },
      closing: {
        id: 'closing',
        patientPrompt: 'Terima kasih dokter, saya merasa didukung.',
        expectedKeywords: [],
        transitions: [],
      },
    },
    vitals: [
      { label: 'BP', value: '120/80 mmHg' },
      { label: 'HR', value: '92 bpm' },
      { label: 'RR', value: '18 rpm' },
      { label: 'SpO₂', value: '98%' },
    ],
    history: ['Breast lump x3 months', 'Family history of breast cancer'],
    labs: [
      { name: 'Biopsy', value: 'Malignant cells present', status: 'abnormal' },
      { name: 'MRI', value: 'Stage II lesion', status: 'abnormal' },
    ],
    examTools: ['Breaking bad news protocol', 'Shared decision-making'],
    suggestedDiagnostics: ['Oncology referral', 'Staging CT', 'Tumor markers'],
    suggestedTreatments: ['Surgery consult', 'Chemotherapy plan', 'Psychological support'],
  },
  {
    id: 'chronic-diabetes',
    title: 'Type 2 Diabetes Follow-up',
    type: 'Chronic Disease',
    difficulty: 'Moderate',
    durationMinutes: 10,
    description: 'Chronic disease management with motivational interviewing.',
    persona: {
      id: 'p3',
      name: 'Harold Tan',
      age: 60,
      gender: 'Male',
      ethnicity: 'Chinese-Indonesian',
      languagePreference: 'en-US',
      personality: 'Cooperative, mildly frustrated',
      avatarColor: 'bg-emerald-600',
    },
    startNodeId: 'intro',
    nodes: {
      intro: {
        id: 'intro',
        patientPrompt: 'My sugar levels have been high even with my usual meds.',
        expectedKeywords: ['sugar', 'glucose', 'high'],
        transitions: [
          {
            keywords: ['diet', 'exercise', 'lifestyle'],
            nextId: 'adherence',
            impact: { clinical: 6, empathy: 2, emotionShift: -1 },
          },
        ],
        fallbackNextId: 'adherence',
      },
      adherence: {
        id: 'adherence',
        patientPrompt: 'I admit I have been skipping exercise lately.',
        expectedKeywords: ['support', 'plan', 'goal'],
        transitions: [
          {
            keywords: ['goal', 'plan', 'monitor'],
            nextId: 'education',
            impact: { clinical: 6, professionalism: 4, empathy: 2, emotionShift: -1 },
          },
        ],
        fallbackNextId: 'education',
      },
      education: {
        id: 'education',
        patientPrompt: 'I want to avoid complications. What should I focus on?',
        expectedKeywords: ['complications', 'monitoring'],
        transitions: [
          {
            keywords: ['foot', 'eye', 'kidney'],
            nextId: 'closing',
            impact: { clinical: 8, empathy: 2, professionalism: 3, emotionShift: -1 },
          },
        ],
        fallbackNextId: 'closing',
      },
      closing: {
        id: 'closing',
        patientPrompt: 'Thanks doctor. I will track my diet and follow up.',
        expectedKeywords: [],
        transitions: [],
      },
    },
    vitals: [
      { label: 'BP', value: '135/85 mmHg' },
      { label: 'HR', value: '82 bpm' },
      { label: 'RR', value: '16 rpm' },
      { label: 'BMI', value: '29 kg/m²' },
    ],
    history: ['Type 2 diabetes x8 years', 'Metformin 1000mg BID', 'Neuropathy symptoms'],
    labs: [
      { name: 'HbA1c', value: '8.5%', status: 'abnormal' },
      { name: 'LDL', value: '120 mg/dL', status: 'abnormal' },
    ],
    examTools: ['Foot exam', 'Medication reconciliation', 'Lifestyle counseling'],
    suggestedDiagnostics: ['HbA1c', 'Microalbumin', 'Eye exam'],
    suggestedTreatments: ['Adjust meds', 'Dietitian referral', 'Exercise plan'],
  },
  {
    id: 'pediatric-fever',
    title: 'Pediatric Fever Consultation',
    type: 'Pediatric',
    difficulty: 'Easy',
    durationMinutes: 8,
    description: 'Comforting parent and assessing fever.',
    persona: {
      id: 'p4',
      name: 'Raisa',
      age: 4,
      gender: 'Female',
      ethnicity: 'Malay',
      languagePreference: 'id-ID',
      personality: 'Frightened, shy',
      avatarColor: 'bg-violet-600',
    },
    startNodeId: 'intro',
    nodes: {
      intro: {
        id: 'intro',
        patientPrompt: 'Anak saya demam sejak malam tadi dan rewel.',
        expectedKeywords: ['demam', 'suhu', 'berapa'],
        transitions: [
          {
            keywords: ['suhu', 'berapa', 'durasi'],
            nextId: 'symptoms',
            impact: { clinical: 6, empathy: 3, emotionShift: -1 },
          },
        ],
        fallbackNextId: 'symptoms',
      },
      symptoms: {
        id: 'symptoms',
        patientPrompt: 'Tidak ada muntah, hanya batuk ringan dan pilek.',
        expectedKeywords: ['makan', 'minum', 'hidrasi'],
        transitions: [
          {
            keywords: ['hidrasi', 'cairan', 'istirahat'],
            nextId: 'education',
            impact: { clinical: 5, empathy: 4, professionalism: 2, emotionShift: -1 },
          },
        ],
        fallbackNextId: 'education',
      },
      education: {
        id: 'education',
        patientPrompt: 'Baik dok, jadi saya pantau suhu dan beri cairan ya?',
        expectedKeywords: ['tanda bahaya', 'kembali'],
        transitions: [
          {
            keywords: ['tanda bahaya', 'sesak', 'kejang'],
            nextId: 'closing',
            impact: { clinical: 6, empathy: 3, professionalism: 3, emotionShift: -1 },
          },
        ],
        fallbackNextId: 'closing',
      },
      closing: {
        id: 'closing',
        patientPrompt: 'Terima kasih dok, saya lebih tenang.',
        expectedKeywords: [],
        transitions: [],
      },
    },
    vitals: [
      { label: 'Temp', value: '38.7°C' },
      { label: 'HR', value: '120 bpm' },
      { label: 'RR', value: '26 rpm' },
      { label: 'SpO₂', value: '97%' },
    ],
    history: ['No chronic illness', 'Up-to-date immunizations'],
    labs: [
      { name: 'Rapid test', value: 'Pending', status: 'normal' },
      { name: 'CBC', value: 'Mild leukocytosis', status: 'abnormal' },
    ],
    examTools: ['Otoscope', 'Throat exam', 'Respiratory assessment'],
    suggestedDiagnostics: ['Rapid antigen', 'CBC'],
    suggestedTreatments: ['Antipyretic', 'Hydration advice'],
  },
];

const clampScore = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

const buildInitialScores = (): PerformanceScore => ({
  clinical: 60,
  communication: 70,
  empathy: 65,
  professionalism: 70,
  timeManagement: 80,
});

const evaluateKeywords = (message: string, keywords: string[]) =>
  keywords.some((keyword) => message.toLowerCase().includes(keyword));

const updateEmotion = (current: EmotionState, shift: number): EmotionState => {
  const order: EmotionState[] = ['angry', 'distressed', 'guarded', 'anxious', 'neutral', 'relieved'];
  const currentIndex = order.indexOf(current);
  const nextIndex = Math.max(0, Math.min(order.length - 1, currentIndex + shift));
  return order[nextIndex];
};

const buildPersonaSummary = (persona: Persona) =>
  `${persona.name}, ${persona.age}yo ${persona.gender}, ${persona.personality}, ${persona.ethnicity} background.`;

const OSCEVirtualPatient: React.FC<{ onExit?: () => void }> = ({ onExit }) => {
  const [scenarioId, setScenarioId] = useState(SCENARIOS[0].id);
  const scenario = useMemo(
    () => SCENARIOS.find((item) => item.id === scenarioId) ?? SCENARIOS[0],
    [scenarioId],
  );
  const [currentNodeId, setCurrentNodeId] = useState(scenario.startNodeId);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [emotion, setEmotion] = useState<EmotionState>('anxious');
  const [scores, setScores] = useState<PerformanceScore>(buildInitialScores());
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeakingEnabled, setIsSpeakingEnabled] = useState(true);
  const [difficulty, setDifficulty] = useState<'Easy' | 'Moderate' | 'Hard'>(scenario.difficulty);
  const [timeLeft, setTimeLeft] = useState(scenario.durationMinutes * 60);
  const [isActive, setIsActive] = useState(false);
  const [visitedNodes, setVisitedNodes] = useState<string[]>([]);
  const [followUps, setFollowUps] = useState<string[]>([]);
  const [attempts, setAttempts] = useState<ScenarioAttempt[]>([]);
  const [mentorComment, setMentorComment] = useState('');
  const [mentorOverride, setMentorOverride] = useState<Partial<PerformanceScore>>({});
  const [selectedExamTools, setSelectedExamTools] = useState<string[]>([]);
  const [selectedDiagnostics, setSelectedDiagnostics] = useState<string[]>([]);
  const [selectedTreatments, setSelectedTreatments] = useState<string[]>([]);
  const [transcriptionVisible, setTranscriptionVisible] = useState(true);
  const [language, setLanguage] = useState<'id-ID' | 'en-US'>(scenario.persona.languagePreference);
  const [recordings, setRecordings] = useState<Array<{ id: string; url: string }>>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const {
    isSupported: isSpeechRecognitionSupported,
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
    setLanguage: setRecognitionLanguage,
  } = useSpeechRecognition(language);

  const {
    isSupported: isSpeechSynthesisSupported,
    speak,
    cancel: cancelSpeech,
    setVoiceByLanguage,
  } = useSpeechSynthesis();

  useEffect(() => {
    setRecognitionLanguage(language);
    setVoiceByLanguage(language === 'id-ID' ? 'id' : 'en');
  }, [language, setRecognitionLanguage, setVoiceByLanguage]);

  useEffect(() => {
    const stored = localStorage.getItem('sinaesta_osce_attempts');
    if (stored) {
      try {
        setAttempts(JSON.parse(stored));
      } catch {
        setAttempts([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('sinaesta_osce_attempts', JSON.stringify(attempts));
  }, [attempts]);

  useEffect(() => {
    setCurrentNodeId(scenario.startNodeId);
    setEmotion('anxious');
    setScores(buildInitialScores());
    setDifficulty(scenario.difficulty);
    setTimeLeft(scenario.durationMinutes * 60);
    setVisitedNodes([]);
    setSelectedExamTools([]);
    setSelectedDiagnostics([]);
    setSelectedTreatments([]);
    setMessages([
      {
        id: `system-${scenario.id}`,
        sender: 'system',
        text: `Scenario loaded: ${scenario.title}. Start the interaction by greeting the patient.`,
        timestamp: Date.now(),
      },
      {
        id: `patient-${scenario.startNodeId}`,
        sender: 'patient',
        text: scenario.nodes[scenario.startNodeId].patientPrompt,
        timestamp: Date.now(),
      },
    ]);
    setIsActive(false);
  }, [scenario]);

  useEffect(() => {
    let interval: number | undefined;
    if (isActive && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    if (timeLeft === 0) {
      setIsActive(false);
      setScores((prev) => ({
        ...prev,
        timeManagement: clampScore(prev.timeManagement - 10),
      }));
    }
    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  useEffect(() => {
    if (isSpeakingEnabled && isSpeechSynthesisSupported) {
      const lastPatientMessage = [...messages].reverse().find((msg) => msg.sender === 'patient');
      if (lastPatientMessage) {
        speak(lastPatientMessage.text, language);
      }
    }
  }, [messages, speak, language, isSpeakingEnabled, isSpeechSynthesisSupported]);

  const progress = useMemo(() => {
    const total = Object.keys(scenario.nodes).length;
    return Math.min(100, Math.round((visitedNodes.length / total) * 100));
  }, [scenario.nodes, visitedNodes]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVoiceCommand = useCallback(
    (text: string) => {
      const normalized = text.toLowerCase();
      if (normalized.includes('pause') || normalized.includes('berhenti')) {
        setIsActive(false);
        stopListening();
        cancelSpeech();
        return true;
      }
      if (normalized.includes('start') || normalized.includes('mulai')) {
        setIsActive(true);
        return true;
      }
      if (normalized.includes('ulang') || normalized.includes('repeat')) {
        const lastPatient = [...messages].reverse().find((msg) => msg.sender === 'patient');
        if (lastPatient && isSpeechSynthesisSupported) {
          speak(lastPatient.text, language);
        }
        return true;
      }
      if (normalized.includes('clear') || normalized.includes('hapus')) {
        setInput('');
        resetTranscript();
        return true;
      }
      return false;
    },
    [cancelSpeech, isSpeechSynthesisSupported, language, messages, resetTranscript, speak, stopListening],
  );

  const handleSendMessage = useCallback(async () => {
    if (!input.trim()) return;
    const timestamp = Date.now();
    const newMessage: ChatMessage = {
      id: `student-${timestamp}`,
      sender: 'student',
      text: input.trim(),
      timestamp,
    };
    setMessages((prev) => [...prev, newMessage]);
    setInput('');
    resetTranscript();

    const normalized = input.toLowerCase();
    const empathyBoost = EMPATHY_KEYWORDS.some((keyword) => normalized.includes(keyword)) ? 6 : 0;
    const professionalismBoost = PROFESSIONALISM_KEYWORDS.some((keyword) => normalized.includes(keyword)) ? 4 : 0;
    const clinicalBoost = CLINICAL_KEYWORDS.some((keyword) => normalized.includes(keyword)) ? 5 : 0;
    const communicationBoost = normalized.length > 30 ? 4 : 2;

    const node = scenario.nodes[currentNodeId];
    const transition = node.transitions.find((item) => evaluateKeywords(normalized, item.keywords));
    const nextNodeId = transition?.nextId ?? node.fallbackNextId ?? currentNodeId;
    const impact = transition?.impact || { emotionShift: -1 };

    const nextScores = {
      clinical: clampScore(scores.clinical + (impact.clinical ?? 0) + clinicalBoost),
      communication: clampScore(scores.communication + communicationBoost),
      empathy: clampScore(scores.empathy + (impact.empathy ?? 0) + empathyBoost),
      professionalism: clampScore(scores.professionalism + (impact.professionalism ?? 0) + professionalismBoost),
      timeManagement: scores.timeManagement,
    };

    setScores(nextScores);

    setEmotion((prev) => updateEmotion(prev, (impact.emotionShift ?? -1) - (empathyBoost > 0 ? 1 : 0)));

    setCurrentNodeId(nextNodeId);
    setVisitedNodes((prev) => (prev.includes(nextNodeId) ? prev : [...prev, nextNodeId]));

    setIsThinking(true);
    let response = null;
    try {
      response = await geminiLiveService.generateResponse({
        persona: buildPersonaSummary(scenario.persona),
        scenario: scenario.description,
        emotion,
        language,
        lastUserMessage: input,
        history: messages.map((msg) => `${msg.sender}: ${msg.text}`),
      });
    } catch {
      response = null;
    }

    const fallbackText = scenario.nodes[nextNodeId]?.patientPrompt ?? 'Baik dok, silakan lanjutkan.';
    const patientResponse: ChatMessage = {
      id: `patient-${Date.now()}`,
      sender: 'patient',
      text: response?.text || fallbackText,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, patientResponse]);
    if (response) {
      setFollowUps(response.suggestedFollowUps);
      setEmotion((prev) => updateEmotion(prev, response.emotionShift));
    } else {
      setFollowUps([]);
    }

    if (nextScores.clinical + nextScores.empathy > 160) {
      setDifficulty('Hard');
    } else if (nextScores.clinical + nextScores.empathy < 120) {
      setDifficulty('Easy');
    } else {
      setDifficulty('Moderate');
    }

    setIsThinking(false);
  }, [
    currentNodeId,
    emotion,
    input,
    language,
    messages,
    resetTranscript,
    scenario.description,
    scenario.nodes,
    scenario.persona,
    scores,
  ]);

  const handleStartRecording = async () => {
    if (!navigator.mediaDevices) return;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;
    chunksRef.current = [];
    recorder.ondataavailable = (event) => {
      chunksRef.current.push(event.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      const url = URL.createObjectURL(blob);
      setRecordings((prev) => [...prev, { id: `${Date.now()}`, url }]);
      stream.getTracks().forEach((track) => track.stop());
    };
    recorder.start();
  };

  const handleStopRecording = () => {
    mediaRecorderRef.current?.stop();
  };

  const handleCompleteScenario = () => {
    const totalDuration = scenario.durationMinutes * 60 - timeLeft;
    const newAttempt: ScenarioAttempt = {
      id: `attempt-${Date.now()}`,
      scenarioId: scenario.id,
      timestamp: Date.now(),
      durationSeconds: totalDuration,
      transcript: messages,
      performance: scores,
      mentorComment,
      mentorOverride,
    };
    setAttempts((prev) => [newAttempt, ...prev]);
    setIsActive(false);
  };

  const handleApplyMentorOverride = () => {
    setScores((prev) => ({
      ...prev,
      ...mentorOverride,
    }));
  };

  const toggleSelection = (item: string, selected: string[], setSelected: (value: string[]) => void) => {
    if (selected.includes(item)) {
      setSelected(selected.filter((value) => value !== item));
    } else {
      setSelected([...selected, item]);
    }
  };

  const lastTranscript = transcript || interimTranscript;

  useEffect(() => {
    if (lastTranscript && handleVoiceCommand(lastTranscript)) {
      resetTranscript();
    }
  }, [handleVoiceCommand, lastTranscript, resetTranscript]);

  return (
    <div className="flex flex-col gap-6 bg-gray-50 min-h-full">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-blue-600 uppercase">AI OSCE Virtual Patient</p>
            <h2 className="text-2xl font-bold text-gray-900">{scenario.title}</h2>
            <p className="text-sm text-gray-500">{scenario.description}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              value={scenarioId}
              onChange={(event) => setScenarioId(event.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
            >
              {SCENARIOS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title} ({item.type})
                </option>
              ))}
            </select>
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value as 'id-ID' | 'en-US')}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
            >
              <option value="id-ID">Bahasa Indonesia</option>
              <option value="en-US">English</option>
            </select>
            {onExit && (
              <button
                onClick={onExit}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-gray-900 text-white"
              >
                Exit Simulation
              </button>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${scenario.persona.avatarColor}`}>
                <UserCircle className="w-8 h-8" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{scenario.persona.name}</p>
                <p className="text-xs text-gray-500">
                  {scenario.persona.age} yrs · {scenario.persona.gender} · {scenario.persona.ethnicity}
                </p>
                <p className="text-xs text-gray-500">Persona: {scenario.persona.personality}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${EMOTION_COLORS[emotion]}`}>
                {EMOTION_LABELS[emotion]} mood
              </span>
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                Difficulty: {difficulty}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-gray-600">
              {scenario.vitals.map((vital) => (
                <div key={vital.label} className="bg-white rounded-lg p-2 border border-gray-100">
                  <p className="font-semibold text-gray-500">{vital.label}</p>
                  <p className="text-sm font-bold text-gray-900">{vital.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <HeartPulse className="w-4 h-4" /> Clinical Context
              </p>
              <button
                onClick={() => setTranscriptionVisible((prev) => !prev)}
                className="text-xs text-blue-600 font-semibold"
              >
                {transcriptionVisible ? 'Hide' : 'Show'} transcript
              </button>
            </div>
            <div className="mt-3">
              <p className="text-xs font-semibold text-gray-500 uppercase">History</p>
              <ul className="text-xs text-gray-600 mt-2 space-y-1">
                {scenario.history.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
            <div className="mt-3">
              <p className="text-xs font-semibold text-gray-500 uppercase">Labs</p>
              <div className="mt-2 space-y-1">
                {scenario.labs.map((lab) => (
                  <div
                    key={lab.name}
                    className={`text-xs px-2 py-1 rounded-lg flex justify-between ${
                      lab.status === 'abnormal' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    <span>{lab.name}</span>
                    <span className="font-semibold">{lab.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-100 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Timer className="w-4 h-4" /> Scenario Timer
              </p>
              <span className="text-sm font-bold text-gray-900">{formatTime(timeLeft)}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setIsActive(true)}
                className="flex items-center gap-2 px-3 py-2 text-xs font-semibold bg-green-600 text-white rounded-lg"
              >
                <PlayCircle className="w-4 h-4" /> Start
              </button>
              <button
                onClick={() => setIsActive(false)}
                className="flex items-center gap-2 px-3 py-2 text-xs font-semibold bg-amber-500 text-white rounded-lg"
              >
                <PauseCircle className="w-4 h-4" /> Pause
              </button>
              <button
                onClick={handleCompleteScenario}
                className="flex items-center gap-2 px-3 py-2 text-xs font-semibold bg-gray-900 text-white rounded-lg"
              >
                <CheckCircle className="w-4 h-4" /> Finish
              </button>
            </div>
            <div className="mt-2">
              <p className="text-xs font-semibold text-gray-500 uppercase">Realtime Feedback</p>
              <div className="mt-2 space-y-2">
                {Object.entries(scores).map(([key, value]) => (
                  <div key={key} className="text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span className="capitalize">{key}</span>
                      <span className="font-semibold text-gray-900">{value}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                      <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Stethoscope className="w-4 h-4" /> Conversation
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSpeakingEnabled((prev) => !prev)}
                className="p-2 rounded-lg border border-gray-200"
              >
                {isSpeakingEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
              <button
                onClick={() => (isListening ? stopListening() : startListening())}
                className="p-2 rounded-lg border border-gray-200"
                disabled={!isSpeechRecognitionSupported}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="mt-4 flex-1 overflow-y-auto space-y-4 max-h-[420px] pr-2">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'student' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`rounded-2xl px-4 py-2 text-sm max-w-[75%] ${
                    message.sender === 'student'
                      ? 'bg-blue-600 text-white'
                      : message.sender === 'system'
                      ? 'bg-gray-100 text-gray-500'
                      : 'bg-emerald-50 text-gray-800'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            {isThinking && (
              <div className="text-xs text-gray-400 flex items-center gap-2">
                <RefreshCw className="w-3 h-3 animate-spin" /> Patient is responding...
              </div>
            )}
          </div>

          {transcriptionVisible && (
            <div className="mt-4 bg-gray-50 border border-gray-100 rounded-xl p-3 text-xs text-gray-600">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Live Transcription</span>
                <span className="text-gray-400">{isListening ? 'Listening...' : 'Paused'}</span>
              </div>
              <p className="mt-2 text-gray-700">
                {transcript || interimTranscript || 'Speech transcript will appear here.'}
              </p>
            </div>
          )}

          <div className="mt-4 flex flex-col md:flex-row gap-3">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              rows={2}
              className="flex-1 border border-gray-200 rounded-xl p-3 text-sm"
              placeholder="Type your question or command..."
            />
            <div className="flex flex-col gap-2">
              <button
                onClick={handleSendMessage}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold"
              >
                Send
              </button>
              <button
                onClick={() => setInput(transcript || interimTranscript)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold"
              >
                Use Transcript
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase">Suggested follow-ups</p>
              <ul className="mt-2 text-xs text-gray-600 space-y-1">
                {followUps.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase">Voice recording</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  onClick={handleStartRecording}
                  className="px-3 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-lg"
                >
                  Start Recording
                </button>
                <button
                  onClick={handleStopRecording}
                  className="px-3 py-2 text-xs font-semibold bg-gray-900 text-white rounded-lg"
                >
                  Stop Recording
                </button>
              </div>
              <div className="mt-3 space-y-2">
                {recordings.map((recording) => (
                  <audio key={recording.id} controls src={recording.url} className="w-full" />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <ClipboardList className="w-4 h-4" /> Scenario Actions
            </p>
            <p className="text-xs text-gray-500">Select physical exams, diagnostics, and treatments.</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Physical exam tools</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {scenario.examTools.map((tool) => (
                <button
                  key={tool}
                  onClick={() => toggleSelection(tool, selectedExamTools, setSelectedExamTools)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold border ${
                    selectedExamTools.includes(tool)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-200'
                  }`}
                >
                  {tool}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Diagnostics</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {scenario.suggestedDiagnostics.map((diag) => (
                <button
                  key={diag}
                  onClick={() => toggleSelection(diag, selectedDiagnostics, setSelectedDiagnostics)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold border ${
                    selectedDiagnostics.includes(diag)
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-600 border-gray-200'
                  }`}
                >
                  {diag}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Treatment plan</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {scenario.suggestedTreatments.map((treatment) => (
                <button
                  key={treatment}
                  onClick={() => toggleSelection(treatment, selectedTreatments, setSelectedTreatments)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold border ${
                    selectedTreatments.includes(treatment)
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-gray-600 border-gray-200'
                  }`}
                >
                  {treatment}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase">Emotional intelligence</p>
            <div className="mt-2 space-y-2 text-xs text-gray-600">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1"><Smile className="w-4 h-4" /> Empathy Score</span>
                <span className="font-semibold text-gray-900">{scores.empathy}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1"><BrainCircuit className="w-4 h-4" /> NLU Confidence</span>
                <span className="font-semibold text-gray-900">{progress}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1"><AlertTriangle className="w-4 h-4" /> Emotional cues</span>
                <span className="font-semibold text-gray-900">{EMOTION_LABELS[emotion]}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Calendar className="w-4 h-4" /> Performance history
          </div>
          <div className="mt-4 space-y-3 max-h-[260px] overflow-y-auto">
            {attempts.length === 0 && (
              <p className="text-xs text-gray-500">No previous attempts yet.</p>
            )}
            {attempts.map((attempt) => (
              <div key={attempt.id} className="border border-gray-100 rounded-xl p-3 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>{new Date(attempt.timestamp).toLocaleString()}</span>
                  <span>{Math.round(attempt.durationSeconds / 60)} min</span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {Object.entries(attempt.performance).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="capitalize text-gray-500">{key}</span>
                      <span className="font-semibold text-gray-800">{value}</span>
                    </div>
                  ))}
                </div>
                {attempt.mentorComment && (
                  <p className="mt-2 text-gray-500">Mentor: {attempt.mentorComment}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Activity className="w-4 h-4" /> Mentor review & feedback
          </div>
          <div className="mt-4 space-y-3 text-xs text-gray-600">
            <p className="text-gray-500">
              Mentors can annotate attempts, override AI feedback, and leave structured comments.
            </p>
            <textarea
              value={mentorComment}
              onChange={(event) => setMentorComment(event.target.value)}
              className="w-full border border-gray-200 rounded-lg p-3 text-xs"
              placeholder="Mentor feedback..."
            />
            <div className="grid grid-cols-2 gap-2">
              {(['clinical', 'communication', 'empathy', 'professionalism', 'timeManagement'] as const).map((dimension) => (
                <label key={dimension} className="text-xs text-gray-500">
                  {dimension}
                  <input
                    type="number"
                    min={0}
                    max={100}
                    className="mt-1 w-full border border-gray-200 rounded-lg p-2 text-xs"
                    value={mentorOverride[dimension] ?? ''}
                    onChange={(event) =>
                      setMentorOverride((prev) => ({
                        ...prev,
                        [dimension]: Number(event.target.value),
                      }))
                    }
                  />
                </label>
              ))}
            </div>
            <button
              onClick={handleApplyMentorOverride}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
            >
              Apply mentor override
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OSCEVirtualPatient;
