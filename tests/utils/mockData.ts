import { faker } from '@faker-js/faker/locale/en';
import { Question, Exam, User, UserRole, Specialty, ExamResult, Flashcard } from '../../types';

// User mock data
export const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: faker.string.uuid(),
  email: faker.internet.email(),
  name: faker.person.fullName(),
  role: UserRole.STUDENT,
  avatar: faker.image.avatar(),
  status: 'VERIFIED',
  targetSpecialty: 'Internal Medicine' as Specialty,
  institution: faker.company.name(),
  strNumber: faker.string.alphanumeric(10),
  emailVerified: true,
  ...overrides,
});

export const createMockAdmin = (overrides: Partial<User> = {}): User => ({
  ...createMockUser({ role: UserRole.SUPER_ADMIN }),
  ...overrides,
});

export const createMockMentor = (overrides: Partial<User> = {}): User => ({
  ...createMockUser({ role: UserRole.TEACHER }),
  ...overrides,
});

// Question mock data
export const createMockQuestion = (overrides: Partial<Question> = {}): Question => ({
  id: faker.string.uuid(),
  text: faker.lorem.sentence(),
  options: [
    faker.lorem.sentence(),
    faker.lorem.sentence(),
    faker.lorem.sentence(),
    faker.lorem.sentence()
  ],
  correctAnswerIndex: faker.number.int({ min: 0, max: 3 }),
  explanation: faker.lorem.paragraph(),
  category: faker.helpers.arrayElement(['Cardiology', 'Neurology', 'Internal Medicine']),
  difficulty: faker.helpers.arrayElement(['Easy', 'Medium', 'Hard']),
  ...overrides,
});

export const createMockQuestions = (count: number): Question[] => {
  return Array.from({ length: count }, () => createMockQuestion());
};

// Exam mock data
export const createMockExam = (overrides: Partial<Exam> = {}): Exam => ({
  id: faker.string.uuid(),
  title: faker.lorem.words(),
  description: faker.lorem.paragraph(),
  topic: faker.helpers.arrayElement(['Cardiology', 'Neurology', 'Internal Medicine']),
  difficulty: faker.helpers.arrayElement(['Easy', 'Medium', 'Hard']),
  duration: faker.number.int({ min: 30, max: 180 }),
  questions: createMockQuestions(faker.number.int({ min: 5, max: 20 })),
  createdBy: faker.string.uuid(),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  isPublished: false,
  blueprint: [],
  thumbnail: faker.image.url(),
  ...overrides,
});

// Exam Result mock data
export const createMockExamResult = (overrides: Partial<ExamResult> = {}): ExamResult => ({
  id: faker.string.uuid(),
  examId: faker.string.uuid(),
  userId: faker.string.uuid(),
  score: faker.number.int({ min: 0, max: 100 }),
  totalQuestions: faker.number.int({ min: 10, max: 50 }),
  correctAnswers: faker.number.int({ min: 0, max: 50 }),
  timeSpent: faker.number.int({ min: 600, max: 7200 }), // 10 minutes to 2 hours
  answers: Array.from({ length: faker.number.int({ min: 10, max: 50 }) }, () => ({
    questionId: faker.string.uuid(),
    selectedAnswerIndex: faker.number.int({ min: 0, max: 3 }),
    isCorrect: faker.datatype.boolean(),
    timeSpent: faker.number.int({ min: 30, max: 300 })
  })),
  startedAt: faker.date.past(),
  completedAt: faker.date.recent(),
  feedback: faker.lorem.paragraph(),
  ...overrides,
});

// Flashcard mock data
export const createMockFlashcard = (overrides: Partial<Flashcard> = {}): Flashcard => ({
  id: faker.string.uuid(),
  front: faker.lorem.sentence(),
  back: faker.lorem.paragraph(),
  category: faker.helpers.arrayElement(['Cardiology', 'Neurology', 'Internal Medicine']),
  difficulty: faker.helpers.arrayElement(['Easy', 'Medium', 'Hard']),
  ...overrides,
});

export const createMockFlashcards = (count: number): Flashcard[] => {
  return Array.from({ length: count }, () => createMockFlashcard());
};

// Mock API responses
export const mockLoginResponse = {
  user: createMockUser(),
  accessToken: faker.string.alphanumeric(),
  refreshToken: faker.string.alphanumeric(),
};

export const mockExamListResponse = {
  exams: Array.from({ length: 5 }, () => createMockExam()),
  total: 5,
};

export const mockExamResultListResponse = {
  results: Array.from({ length: 10 }, () => createMockExamResult()),
  total: 10,
};

// Mock form data
export const createMockFormData = () => {
  const formData = new FormData();
  formData.append('title', faker.lorem.words());
  formData.append('description', faker.lorem.paragraph());
  formData.append('topic', 'Cardiology');
  formData.append('difficulty', 'Medium');
  formData.append('duration', '60');
  return formData;
};

// Mock localStorage data
export const mockSettingsData = {
  theme: 'light',
  language: 'en',
  notifications: {
    email: true,
    push: false,
    examReminders: true,
  },
  exam: {
    defaultDuration: 60,
    showExplanations: true,
    randomizeQuestions: false,
  },
  privacy: {
    shareProgress: false,
    anonymousAnalytics: true,
  },
};

export const mockAuthTokens = {
  accessToken: faker.string.alphanumeric(),
  refreshToken: faker.string.alphanumeric(),
};

// Mock Excel data for import testing
export const mockExcelData = [
  {
    question: 'What is the most common cause of chest pain?',
    option1: 'Myocardial infarction',
    option2: 'Anxiety',
    option3: 'Gastroesophageal reflux',
    option4: 'Costochondritis',
    correctAnswer: 'Myocardial infarction',
    explanation: 'Myocardial infarction is the most common cause of chest pain in adults.',
    category: 'Cardiology',
    difficulty: 'Easy'
  },
  {
    question: 'Which medication is first-line for hypertension?',
    option1: 'ACE inhibitors',
    option2: 'Beta blockers',
    option3: 'Calcium channel blockers',
    option4: 'Diuretics',
    correctAnswer: 'Diuretics',
    explanation: 'Diuretics are often first-line treatment for hypertension.',
    category: 'Cardiology',
    difficulty: 'Medium'
  }
];

// Helper function to create realistic test scenarios
export const createTestScenario = {
  loggedInStudent: () => ({
    user: createMockUser({ role: UserRole.STUDENT }),
    isAuthenticated: true,
    permissions: []
  }),

  loggedInAdmin: () => ({
    user: createMockUser({ role: UserRole.SUPER_ADMIN }),
    isAuthenticated: true,
    permissions: ['MANAGE_USERS', 'CREATE_EXAM', 'VIEW_ANALYTICS']
  }),

  loggedInMentor: () => ({
    user: createMockUser({ role: UserRole.TEACHER }),
    isAuthenticated: true,
    permissions: ['CREATE_EXAM', 'VIEW_ANALYTICS']
  }),

  examCreation: () => ({
    exam: createMockExam(),
    questions: createMockQuestions(10),
    isDraft: true
  }),

  examTaking: () => ({
    exam: createMockExam({ isPublished: true }),
    questions: createMockQuestions(15),
    currentQuestionIndex: 0,
    answers: [],
    timeRemaining: 3600 // 1 hour
  }),

  completedExam: () => ({
    examResult: createMockExamResult(),
    score: 85,
    totalQuestions: 20,
    correctAnswers: 17
  })
};

// Export faker instance for custom data generation
export { faker };