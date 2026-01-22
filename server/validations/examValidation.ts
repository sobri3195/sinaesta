import { z } from 'zod';

export const examSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  durationMinutes: z.number().min(1, 'Duration must be at least 1 minute'),
  topic: z.string().min(1, 'Topic is required'),
  subtopics: z.array(z.string()).optional(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  thumbnailUrl: z.string().url().optional(),
  mode: z.enum(['STANDARD', 'CLINICAL_CASE', 'SPEED_DRILL']).default('STANDARD'),
  blueprintId: z.string().uuid().optional(),
  scheduledStart: z.number().optional(),
  scheduledEnd: z.number().optional(),
  proctoring: z.object({
    level: z.enum(['NONE', 'LIGHT', 'STRICT']),
    blockTabSwitch: z.boolean(),
    forceFullscreen: z.boolean(),
    recordAudio: z.boolean().optional(),
    webcamRequired: z.boolean().optional(),
  }).optional(),
  sections: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().optional(),
    durationMinutes: z.number(),
    questionIds: z.array(z.string()),
    order: z.number(),
  })).optional(),
});

export const questionSchema = z.object({
  examId: z.string().uuid(),
  vignetteId: z.string().uuid().optional(),
  text: z.string().min(1, 'Question text is required'),
  options: z.array(z.string()).min(2, 'At least 2 options required').max(6, 'Maximum 6 options allowed'),
  correctAnswerIndex: z.number().int().min(0),
  explanation: z.string().optional(),
  category: z.string().optional(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).default('Medium'),
  timeLimit: z.number().positive().optional(),
  points: z.number().positive().default(1),
  imageUrl: z.string().url().optional(),
  type: z.enum(['MCQ', 'VIGNETTE', 'CLINICAL_REASONING', 'SPOT_DIAGNOSIS']).default('MCQ'),
  domain: z.enum(['Diagnosis', 'Therapy', 'Investigation', 'Mechanism', 'Patient Safety']).optional(),
  reasoningSteps: z.array(z.object({
    id: z.string(),
    type: z.enum(['PROBLEM_REPRESENTATION', 'DDX', 'INVESTIGATION', 'DIAGNOSIS', 'THERAPY', 'QSORT']),
    prompt: z.string(),
    options: z.array(z.string()),
    correctOptions: z.array(z.number()),
    criticalErrorOptions: z.array(z.number()).optional(),
    scoringWeight: z.number(),
    explanation: z.string().optional(),
  })).optional(),
  errorTaxonomy: z.enum(['Knowledge Gap', 'Premature Closure', 'Anchoring Bias', 'Confirmation Bias', 'Guideline Mismatch', 'Overtesting', 'Patient Safety Violation']).optional(),
  guidelineId: z.string().optional(),
  blueprintTopicId: z.string().optional(),
  status: z.enum(['DRAFT', 'REVIEW', 'APPROVED', 'PUBLISHED', 'FLAGGED_FOR_UPDATE']).default('DRAFT'),
});

export const submitExamSchema = z.object({
  examId: z.string().uuid(),
  answers: z.array(z.number()),
  auditLog: z.array(z.object({
    timestamp: z.number(),
    event: z.enum(['TAB_SWITCH', 'FULLSCREEN_EXIT', 'DISCONNECTED', 'EXAM_STARTED', 'EXAM_SUBMITTED']),
    details: z.string().optional(),
  })).optional(),
});

export type ExamInput = z.infer<typeof examSchema>;
export type QuestionInput = z.infer<typeof questionSchema>;
export type SubmitExamInput = z.infer<typeof submitExamSchema>;
