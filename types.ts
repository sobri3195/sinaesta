

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  PROGRAM_ADMIN = 'PROGRAM_ADMIN',
  TEACHER = 'MENTOR', // Kept TEACHER for backward compatibility, serves as Mentor
  REVIEWER = 'REVIEWER',
  PROCTOR = 'PROCTOR',
  STUDENT = 'STUDENT'
}

export enum UserStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  SUSPENDED = 'SUSPENDED'
}

export enum QuestionStatus {
  DRAFT = 'DRAFT',
  REVIEW = 'REVIEW',
  APPROVED = 'APPROVED',
  PUBLISHED = 'PUBLISHED',
  FLAGGED_FOR_UPDATE = 'FLAGGED_FOR_UPDATE' // New status for guideline updates
}

// List of Specialties supported by the platform
export const SPECIALTIES = [
  'Internal Medicine',
  'Cardiology',
  'Surgery',
  'Pediatrics',
  'Obgyn',
  'Neurology',
  'Anesthesiology',
  'Radiology',
  'Dermatology',
  'Ophthalmology',
  'ENT',
  'Psychiatry'
] as const;

export type Specialty = typeof SPECIALTIES[number];

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
  status?: UserStatus;
  targetSpecialty?: Specialty; // Updated to use the specific type
  batchId?: string;
  institution?: string;
  strNumber?: string;
}

export interface Cohort {
  id: string;
  name: string; // e.g. "Batch Januari 2026"
  startDate: number;
  endDate: number;
  specialty: string;
  maxStudents: number;
  students: string[]; // User IDs
  mentors: string[]; // User IDs
}

export type Permission = 'MANAGE_USERS' | 'CREATE_EXAM' | 'GRADE_OSCE' | 'VIEW_ANALYTICS';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: ['MANAGE_USERS', 'CREATE_EXAM', 'GRADE_OSCE', 'VIEW_ANALYTICS'],
  [UserRole.PROGRAM_ADMIN]: ['MANAGE_USERS', 'CREATE_EXAM', 'VIEW_ANALYTICS'],
  [UserRole.TEACHER]: ['CREATE_EXAM', 'GRADE_OSCE', 'VIEW_ANALYTICS'],
  [UserRole.REVIEWER]: ['GRADE_OSCE'],
  [UserRole.PROCTOR]: [],
  [UserRole.STUDENT]: []
};

export type QuestionType = 'MCQ' | 'VIGNETTE' | 'CLINICAL_REASONING' | 'SPOT_DIAGNOSIS';

export interface ItemAnalysis {
  difficultyIndex: number; // 0.0 - 1.0 (p-value)
  discriminationIndex: number; // -1.0 - 1.0 (d-value)
  distractorEfficiency?: number;
  flagged?: boolean;
}

export interface QualityMetrics {
  ambiguityReports: number;
  expertRating: number; // 1-5
  discriminationIndex: number; 
  lastUpdated: number;
  qualityScore: number; // 0-100 calculated
}

export enum ErrorTaxonomy {
  KNOWLEDGE_GAP = 'Knowledge Gap',
  PREMATURE_CLOSURE = 'Premature Closure',
  ANCHORING_BIAS = 'Anchoring Bias',
  CONFIRMATION_BIAS = 'Confirmation Bias',
  GUIDELINE_MISMATCH = 'Guideline Mismatch',
  OVERTESTING = 'Overtesting',
  CRITICAL_ERROR = 'Patient Safety Violation'
}

export interface ClinicalReasoningStep {
  id: string;
  type: 'PROBLEM_REPRESENTATION' | 'DDX' | 'INVESTIGATION' | 'DIAGNOSIS' | 'THERAPY' | 'QSORT';
  prompt: string;
  options: string[];
  correctOptions: number[]; // Indices of correct answers (can be multiple)
  criticalErrorOptions?: number[]; // Indices of answers that cause patient harm (Safety Layer)
  scoringWeight: number; // e.g. 2 points
  explanation?: string;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswerIndex: number; // 0-3
  explanation?: string;
  category?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  timeLimit?: number; 
  points?: number;
  customClassName?: string;
  imageUrl?: string;
  
  // Clinical Specifics
  type?: QuestionType;
  vignetteId?: string; // Links to a shared case scenario
  domain?: 'Diagnosis' | 'Therapy' | 'Investigation' | 'Mechanism' | 'Patient Safety';
  
  // Clinical Reasoning
  reasoningSteps?: ClinicalReasoningStep[];
  errorTaxonomy?: ErrorTaxonomy;

  // Linkages
  guidelineId?: string;
  blueprintTopicId?: string;

  // Quality Control
  status?: QuestionStatus;
  itemAnalysis?: ItemAnalysis;
  qualityMetrics?: QualityMetrics; // Q-QS
  authorId?: string;
  reviewerId?: string;
}

export interface LabTrend {
  id: string;
  parameter: string; // e.g. "Hemoglobin"
  unit: string;
  dataPoints: { timeLabel: string; value: number; flag?: 'L' | 'H' | 'N' }[];
}

export interface CaseVignette {
  id: string;
  title: string;
  content: string; // The case story (history, physical exam)
  tabs?: {
    label: string;
    content: string | { label: string; value: string; unit: string; flag: 'L' | 'H' | 'N' }[]; // Lab results
    imageUrl?: string; // Lab/Radio image
  }[];
  labTrends?: LabTrend[];
}

export interface Blueprint {
  id: string;
  title: string; // e.g. "Blueprint Interna 2025"
  specialty: string;
  totalItems: number;
  // Distribution targets
  topics: { name: string; targetPercent: number }[]; // e.g. Cardio 15%
  domains: { name: string; targetPercent: number }[]; // e.g. Diagnosis 40%
  difficulty: { name: 'Easy' | 'Medium' | 'Hard'; targetPercent: number }[];
  createdAt: number;
}

export interface HighYieldTopic {
  topic: string;
  frequency: number; // How often it appears in exams
  avgScore: number; // Student performance
  trend: 'UP' | 'DOWN' | 'STABLE';
}

export interface Guideline {
  id: string;
  title: string; // e.g. "JNC 8 Hypertension"
  organization: string; // e.g. "AHA/ACC"
  year: number;
  version: string;
  url: string; // Link to PDF or external site
  tags: string[];
  status?: 'ACTIVE' | 'ARCHIVED';
  impactedQuestionIds?: string[]; // IDs of questions using this guideline
}

export interface Infographic {
  id: string;
  title: string;
  imageUrl: string;
  tags: string[];
  type: 'ALGORITHM' | 'SUMMARY' | 'MNEMONIC';
}

export interface ExamSection {
  id: string;
  title: string;
  description?: string;
  durationMinutes: number;
  questionIds: string[];
  order: number;
}

export interface ProctoringConfig {
  level: 'NONE' | 'LIGHT' | 'STRICT';
  blockTabSwitch: boolean;
  forceFullscreen: boolean;
  recordAudio?: boolean;
  webcamRequired?: boolean;
}

export interface AuditLogEntry {
  timestamp: number;
  event: 'TAB_SWITCH' | 'FULLSCREEN_EXIT' | 'DISCONNECTED' | 'EXAM_STARTED' | 'EXAM_SUBMITTED';
  details?: string;
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  durationMinutes: number; // Total duration if sections not used
  questions: Question[];
  vignettes?: CaseVignette[]; // Shared case data
  topic: string;
  subtopics?: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  thumbnailUrl?: string;
  createdAt: number;
  mode?: 'STANDARD' | 'CLINICAL_CASE' | 'SPEED_DRILL';
  blueprintId?: string;
  
  // Advanced Features
  sections?: ExamSection[]; // If present, questions are grouped
  proctoring?: ProctoringConfig;
  scheduledStart?: number;
  scheduledEnd?: number;
}

export interface ExamResult {
  examId: string;
  studentId: string;
  score: number;
  totalQuestions: number;
  answers: number[]; 
  completedAt: number;
  aiFeedback?: string;
  domainAnalysis?: Record<string, { total: number; correct: number }>;
  auditLog?: AuditLogEntry[];
  errorProfile?: Record<ErrorTaxonomy, number>;
  fatigueData?: { timeSegment: number; accuracy: number }[]; // For Fatigue Curve
}

export interface Flashcard {
  id: string;
  front: string; 
  back: string; 
  category?: string;
  mastered?: boolean;
}

export interface FlashcardDeck {
  id: string;
  title: string;
  topic: string;
  cards: Flashcard[];
  createdAt: number;
  isSystemDeck?: boolean; // Curriculum based
}

export interface OSCERubric {
  id: string;
  items: {
    criteria: string;
    weight: number; // 1-5
    scale: { label: string; value: number }[]; // 0=Not done, 1=Done poorly, 2=Done well
  }[];
  globalRatingScale: boolean; // "Pass / Borderline / Fail"
}

export interface OSCEStation {
  id: string;
  title: string;
  scenario: string; // "You are in the ER..."
  instruction: string; // "Perform focused history taking..."
  durationMinutes: number;
  checklist: {
    item: string;
    points: number;
    category: 'Anamnesis' | 'Physical Exam' | 'Diagnosis' | 'Management' | 'Communication';
  }[];
  rubric?: OSCERubric;
  examinerId?: string;
  calibrationVideoUrl?: string; // For Standardization
}

export interface LogbookEntry {
  id: string;
  date: number;
  patientInitials: string; // Privacy
  diagnosis: string;
  procedure?: string;
  role: 'Observer' | 'Assistant' | 'Performer';
  supervisor: string; // User ID of mentor
  supervisorName?: string;
  notes: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  supervisorFeedback?: string;
  signedAt?: number;
}

export interface CompetencyTarget {
  id: string;
  procedureName: string;
  targetCount: number;
  currentCount: number;
  category: string;
}

export interface DiscussionReply {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: number;
  isMentor: boolean;
}

export interface DiscussionThread {
  id: string;
  title: string;
  authorId: string;
  authorName: string; // Can be "Anonymous"
  createdAt: number;
  content: string; // Clinical Case structured
  structuredContent?: {
    problemList: string;
    ddx: string;
    plan: string;
  };
  tags: string[];
  replies: DiscussionReply[];
  status: 'PENDING' | 'APPROVED' | 'CLOSED';
  isAnonymous: boolean;
}

export interface ReviewTask {
  id: string;
  type: 'LOGBOOK' | 'OSCE' | 'CASE_DISCUSSION';
  submitterName: string;
  title: string;
  timestamp: number;
  status: 'PENDING' | 'COMPLETED';
}

export interface RemedialTask {
  id: string;
  type: 'REVIEW_QUESTION' | 'READ_GUIDELINE' | 'STUDY_FLASHCARD';
  title: string;
  referenceId: string; // ID of the question/guideline/card
  completed: boolean;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface SpotDxItem {
  id: string;
  imageUrl: string;
  prompt: string;
  diagnosisOptions: string[];
  correctDiagnosisIndex: number;
  nextStepOptions: string[];
  correctNextStepIndex: number;
  explanation: string;
}

export interface MicrolearningPack {
  id: string;
  title: string;
  description: string;
  durationMinutes: number; // e.g. 5-7 mins
  tags: string[];
  items: {
    type: 'INFOGRAPHIC' | 'FLASHCARD' | 'MINI_CASE';
    title: string;
    content: any; // Can be URL, Card object, or Case object
  }[];
}

export interface CohortMetric {
  category: string;
  userScore: number;
  cohortAvg: number;
  top10Avg: number;
  percentile: number;
}

export interface MentorSession {
  id: string;
  mentorId: string;
  mentorName: string;
  mentorAvatar: string;
  topic: string;
  startTime: number;
  durationMinutes: number;
  status: 'AVAILABLE' | 'BOOKED' | 'COMPLETED';
  price?: number;
  studentId?: string;
}

export interface AdminPost {
  id: string;
  title: string;
  excerpt: string;
  content: string; // HTML or Markdown
  imageUrl?: string;
  createdAt: number;
  authorName: string;
  published: boolean;
}

export interface AppSettings {
  ui: {
    compactMode: boolean;
    showFloatingHelp: boolean;
  };
  examCreator: {
    defaultQuestionCount: number;
    autoGenerateThumbnail: boolean;
  };
  examTaker: {
    showTimer: boolean;
    confirmBeforeSubmit: boolean;
    showExplanationsInResults: boolean;
  };
  flashcards: {
    shuffleCards: boolean;
  };
  osce: {
    showChecklistTips: boolean;
  };
  importSoal: {
    strictValidation: boolean;
  };
}

export type ViewState = 
  'LANDING' |
  'DASHBOARD' | 
  'CREATE_EXAM' | 
  'TAKE_EXAM' | 
  'RESULTS' | 
  'FLASHCARDS' | 
  'STUDY_FLASHCARDS' | 
  'CREATE_FLASHCARDS' |
  'OSCE_PRACTICE' |
  'OSCE_MANAGER' |
  'LOGBOOK' |
  'ADMIN_DASHBOARD' |
  'USER_MANAGEMENT' |
  'COHORT_MANAGEMENT' |
  'BLUEPRINT_MANAGER' |
  'KNOWLEDGE_BASE' |
  'VIGNETTE_BUILDER' |
  'QUESTION_REVIEW' |
  'MENTOR_DASHBOARD' |
  'CASE_DISCUSSION' |
  'CLINICAL_REASONING_SIM' |
  'REMEDIAL_PATH' |
  'SPOT_DX_DRILL' |
  'HIGH_YIELD_MAP' |
  'QUESTION_QUALITY' |
  'MICROLEARNING' |
  'BENCHMARK' |
  'MENTOR_MARKETPLACE' |
  'HISTORY' |
  'ADMIN_POSTS' |
  'SETTINGS' |
  'PRIVACY' | 
  'TERMS' | 
  'SUPPORT';
