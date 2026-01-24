import { Specialty, UserRole } from '../types';

export type TimeRangeOption = '7d' | '30d' | '90d' | '180d' | '1y';
export type RiskLevel = 'low' | 'medium' | 'high';
export type ExportFormat = 'csv' | 'excel' | 'pdf';

export interface PredictiveAnalytics {
  predictedExamScore: number;
  atRiskLevel: RiskLevel;
  examCompletionProbability: number;
  learningCurveForecast: Array<{ week: string; predictedScore: number }>;
  masteryTimeline: Array<{ topic: string; estimatedWeeks: number }>;
  knowledgeGapAlerts: Array<{ topic: string; severity: RiskLevel; impact: string }>;
  specialtySuccessProbability: number;
}

export interface LearningPathRecommendations {
  nextTopics: Array<{ topic: string; rationale: string; difficulty: string }>;
  reviewTopics: Array<{ topic: string; reason: string; urgency: RiskLevel }>;
  personalizedSchedule: Array<{ day: string; focus: string; duration: string }>;
  recommendedExamOrder: string[];
  osceScenarios: Array<{ scenario: string; objective: string }>;
  adaptiveDifficulty: {
    currentLevel: string;
    suggestedAdjustments: string[];
  };
}

export interface PerformanceForecast {
  futurePerformance: Array<{ month: string; actualScore: number; predictedScore: number }>;
  goalProjection: { targetScore: number; etaWeeks: number; confidence: number };
  examReadinessDate: string;
  specialtyQualificationProbability: number;
  improvementVelocity: number;
  peerBenchmarkGap: number;
}

export interface ComparativeAnalysis {
  cohortRank: number;
  cohortSize: number;
  percentile: number;
  topPerformerGap: number;
  strengths: string[];
  weaknesses: string[];
  historicalComparison: Array<{ period: string; score: number }>;
  peerComparison: Array<{ metric: string; self: number; peers: number }>; 
}

export interface AdvancedMetrics {
  knowledgeRetention: Array<{ week: string; retention: number }>;
  learningEfficiency: number;
  studyPerformanceCorrelation: number;
  masteryProgression: Array<{ topic: string; mastery: number }>;
  examAttemptPatterns: Array<{ type: string; rate: number }>;
  flashcardEffectiveness: Array<{ deck: string; uplift: number }>;
}

export interface VisualizationData {
  topicHeatmap: Array<{ topic: string; mastery: number; trend: string }>;
  skillRadar: Array<{ skill: string; score: number }>;
  progressTimeline: Array<{ date: string; score: number; predicted: number }>;
}

export interface MentorAnalytics {
  cohortOverview: {
    averageScore: number;
    atRiskCount: number;
    activeLearners: number;
    retentionRate: number;
  };
  studentsNeedingAttention: Array<{ name: string; riskLevel: RiskLevel; gap: string }>;
  teachingEffectiveness: Array<{ module: string; impactScore: number }>;
  curriculumPerformance: Array<{ topic: string; average: number; variance: number }>;
}

export interface ModelOperations {
  modelStatus: {
    version: string;
    lastTrained: string;
    validationAccuracy: number;
    driftScore: number;
  };
  abTesting: Array<{ experiment: string; lift: number; status: string }>;
  retrainingPipeline: Array<{ stage: string; status: string }>; 
}

export interface AnalyticsBundle {
  predictive: PredictiveAnalytics;
  recommendations: LearningPathRecommendations;
  forecast: PerformanceForecast;
  comparative: ComparativeAnalysis;
  metrics: AdvancedMetrics;
  visualization: VisualizationData;
  mentor: MentorAnalytics;
  mlOps: ModelOperations;
}

const mockPredictive: PredictiveAnalytics = {
  predictedExamScore: 82,
  atRiskLevel: 'medium',
  examCompletionProbability: 0.92,
  learningCurveForecast: [
    { week: 'W1', predictedScore: 72 },
    { week: 'W2', predictedScore: 75 },
    { week: 'W3', predictedScore: 78 },
    { week: 'W4', predictedScore: 80 },
    { week: 'W5', predictedScore: 82 },
  ],
  masteryTimeline: [
    { topic: 'Cardiology', estimatedWeeks: 3 },
    { topic: 'Neurology', estimatedWeeks: 4 },
    { topic: 'Endocrinology', estimatedWeeks: 5 },
    { topic: 'Infectious Disease', estimatedWeeks: 2 },
  ],
  knowledgeGapAlerts: [
    { topic: 'Nephrology', severity: 'high', impact: 'Renal pathophysiology questions trending down 12%.' },
    { topic: 'Pulmonology', severity: 'medium', impact: 'OSCE station confidence below cohort median.' },
  ],
  specialtySuccessProbability: 0.78,
};

const mockRecommendations: LearningPathRecommendations = {
  nextTopics: [
    { topic: 'Renal Acid-Base', rationale: 'High-weight exam objectives; recent errors detected.', difficulty: 'Intermediate' },
    { topic: 'Sepsis Protocols', rationale: 'Trending OSCE scenario; align with ICU track.', difficulty: 'Advanced' },
    { topic: 'Heart Failure Management', rationale: 'Improves cardiology mastery curve.', difficulty: 'Intermediate' },
  ],
  reviewTopics: [
    { topic: 'Electrolyte Imbalances', reason: 'Retention dropped 10% in last quiz.', urgency: 'high' },
    { topic: 'ECG Interpretation', reason: 'Accuracy lag vs peers.', urgency: 'medium' },
    { topic: 'Respiratory Acid-Base', reason: 'Needed for OSCE readiness.', urgency: 'medium' },
  ],
  personalizedSchedule: [
    { day: 'Mon', focus: 'Renal + Flashcards', duration: '90 min' },
    { day: 'Tue', focus: 'OSCE Simulation (Sepsis)', duration: '60 min' },
    { day: 'Wed', focus: 'Cardiology Drill', duration: '75 min' },
    { day: 'Thu', focus: 'Peer Review + Reflection', duration: '45 min' },
    { day: 'Fri', focus: 'Full-length Exam', duration: '120 min' },
  ],
  recommendedExamOrder: ['Internal Medicine Mock 3', 'Critical Care OSCE', 'Comprehensive Mock 4'],
  osceScenarios: [
    { scenario: 'Acute Dyspnea', objective: 'Airway & differential prioritization.' },
    { scenario: 'Septic Shock', objective: 'Early goal-directed therapy.' },
    { scenario: 'Chest Pain', objective: 'ACS triage + ECG interpretation.' },
  ],
  adaptiveDifficulty: {
    currentLevel: 'Intermediate',
    suggestedAdjustments: ['Add 2 advanced cardiology stations', 'Increase timed blocks to 60 minutes'],
  },
};

const mockForecast: PerformanceForecast = {
  futurePerformance: [
    { month: 'Aug', actualScore: 72, predictedScore: 74 },
    { month: 'Sep', actualScore: 76, predictedScore: 78 },
    { month: 'Oct', actualScore: 79, predictedScore: 81 },
    { month: 'Nov', actualScore: 81, predictedScore: 84 },
  ],
  goalProjection: { targetScore: 85, etaWeeks: 6, confidence: 0.84 },
  examReadinessDate: '2025-01-22',
  specialtyQualificationProbability: 0.73,
  improvementVelocity: 2.4,
  peerBenchmarkGap: -3.1,
};

const mockComparative: ComparativeAnalysis = {
  cohortRank: 14,
  cohortSize: 120,
  percentile: 88,
  topPerformerGap: 6.5,
  strengths: ['Clinical reasoning', 'Cardiology diagnostics', 'OSCE communication'],
  weaknesses: ['Renal pharmacology', 'Neuroanatomy localization'],
  historicalComparison: [
    { period: 'Q1', score: 68 },
    { period: 'Q2', score: 74 },
    { period: 'Q3', score: 79 },
    { period: 'Q4', score: 82 },
  ],
  peerComparison: [
    { metric: 'Exam Score', self: 82, peers: 79 },
    { metric: 'OSCE', self: 76, peers: 73 },
    { metric: 'Flashcards', self: 88, peers: 81 },
    { metric: 'Efficiency', self: 72, peers: 68 },
  ],
};

const mockMetrics: AdvancedMetrics = {
  knowledgeRetention: [
    { week: 'W1', retention: 92 },
    { week: 'W2', retention: 88 },
    { week: 'W3', retention: 84 },
    { week: 'W4', retention: 81 },
    { week: 'W5', retention: 79 },
  ],
  learningEfficiency: 0.78,
  studyPerformanceCorrelation: 0.62,
  masteryProgression: [
    { topic: 'Cardiology', mastery: 84 },
    { topic: 'Pulmonology', mastery: 77 },
    { topic: 'Nephrology', mastery: 62 },
    { topic: 'Neurology', mastery: 70 },
  ],
  examAttemptPatterns: [
    { type: 'Timed', rate: 64 },
    { type: 'Tutor Mode', rate: 22 },
    { type: 'Mixed', rate: 14 },
  ],
  flashcardEffectiveness: [
    { deck: 'Renal Basics', uplift: 12 },
    { deck: 'Neuro Pearls', uplift: 9 },
    { deck: 'EKG Rapid', uplift: 15 },
  ],
};

const mockVisualization: VisualizationData = {
  topicHeatmap: [
    { topic: 'Cardiology', mastery: 84, trend: 'up' },
    { topic: 'Nephrology', mastery: 62, trend: 'down' },
    { topic: 'Pulmonology', mastery: 76, trend: 'up' },
    { topic: 'Neurology', mastery: 70, trend: 'steady' },
    { topic: 'Endocrinology', mastery: 74, trend: 'up' },
    { topic: 'Hematology', mastery: 68, trend: 'steady' },
  ],
  skillRadar: [
    { skill: 'Diagnostics', score: 82 },
    { skill: 'Management', score: 76 },
    { skill: 'Critical Thinking', score: 88 },
    { skill: 'Procedures', score: 69 },
    { skill: 'Communication', score: 81 },
    { skill: 'Time Mgmt', score: 74 },
  ],
  progressTimeline: [
    { date: 'Week 1', score: 68, predicted: 70 },
    { date: 'Week 2', score: 72, predicted: 74 },
    { date: 'Week 3', score: 75, predicted: 77 },
    { date: 'Week 4', score: 78, predicted: 80 },
    { date: 'Week 5', score: 80, predicted: 82 },
  ],
};

const mockMentor: MentorAnalytics = {
  cohortOverview: {
    averageScore: 74.2,
    atRiskCount: 8,
    activeLearners: 96,
    retentionRate: 0.86,
  },
  studentsNeedingAttention: [
    { name: 'Dina K.', riskLevel: 'high', gap: 'Renal pharmacology' },
    { name: 'Arif P.', riskLevel: 'medium', gap: 'OSCE communication' },
    { name: 'Lina M.', riskLevel: 'high', gap: 'Neuroanatomy localization' },
  ],
  teachingEffectiveness: [
    { module: 'Cardiology Bootcamp', impactScore: 0.82 },
    { module: 'ICU Protocols', impactScore: 0.76 },
    { module: 'OSCE Coaching', impactScore: 0.88 },
  ],
  curriculumPerformance: [
    { topic: 'Cardiology', average: 78, variance: 6.2 },
    { topic: 'Nephrology', average: 64, variance: 9.4 },
    { topic: 'Pulmonology', average: 72, variance: 7.1 },
  ],
};

const mockMlOps: ModelOperations = {
  modelStatus: {
    version: 'v2.4.1',
    lastTrained: '2025-01-05',
    validationAccuracy: 0.87,
    driftScore: 0.14,
  },
  abTesting: [
    { experiment: 'Path Recommendation v2', lift: 0.09, status: 'Running' },
    { experiment: 'At-risk Alert Threshold', lift: 0.04, status: 'Completed' },
  ],
  retrainingPipeline: [
    { stage: 'Ingest new exam data', status: 'Complete' },
    { stage: 'Feature engineering', status: 'Complete' },
    { stage: 'Model validation', status: 'Queued' },
    { stage: 'Deploy + monitor', status: 'Pending' },
  ],
};

const formatForExport = (bundle: AnalyticsBundle) => {
  return {
    predictiveScore: bundle.predictive.predictedExamScore,
    atRiskLevel: bundle.predictive.atRiskLevel,
    completionProbability: bundle.predictive.examCompletionProbability,
    readinessDate: bundle.forecast.examReadinessDate,
    cohortRank: `${bundle.comparative.cohortRank}/${bundle.comparative.cohortSize}`,
    learningEfficiency: bundle.metrics.learningEfficiency,
  };
};

const createCsv = (data: Record<string, string | number>) => {
  const headers = Object.keys(data).join(',');
  const values = Object.values(data)
    .map((value) => typeof value === 'string' ? `"${value}"` : value)
    .join(',');
  return `${headers}\n${values}`;
};

const createReportContent = (bundle: AnalyticsBundle) => {
  return `Sinaesta Advanced Analytics Report\n\n` +
    `Predicted Exam Score: ${bundle.predictive.predictedExamScore}%\n` +
    `At-risk Level: ${bundle.predictive.atRiskLevel}\n` +
    `Completion Probability: ${(bundle.predictive.examCompletionProbability * 100).toFixed(1)}%\n` +
    `Exam Readiness Date: ${bundle.forecast.examReadinessDate}\n` +
    `Cohort Rank: ${bundle.comparative.cohortRank}/${bundle.comparative.cohortSize}\n` +
    `Learning Efficiency: ${(bundle.metrics.learningEfficiency * 100).toFixed(1)}%\n`;
};

export const analyticsService = {
  async getAdvancedAnalyticsBundle(options: { studentId: string; specialty?: Specialty; role?: UserRole; timeRange: TimeRangeOption }): Promise<AnalyticsBundle> {
    const data: AnalyticsBundle = {
      predictive: mockPredictive,
      recommendations: mockRecommendations,
      forecast: mockForecast,
      comparative: mockComparative,
      metrics: mockMetrics,
      visualization: mockVisualization,
      mentor: mockMentor,
      mlOps: mockMlOps,
    };

    if (options.timeRange === '7d') {
      data.predictive.predictedExamScore -= 2;
      data.forecast.goalProjection.etaWeeks += 1;
    }

    if (options.role === UserRole.PROGRAM_ADMIN) {
      data.predictive.atRiskLevel = 'low';
    }

    return Promise.resolve(data);
  },

  async exportAnalyticsReport(options: { bundle: AnalyticsBundle; format: ExportFormat; studentId: string }) {
    const exportData = formatForExport(options.bundle);

    if (options.format === 'pdf') {
      const report = createReportContent(options.bundle);
      return {
        filename: `sinaesta-analytics-${options.studentId}.pdf`,
        blob: new Blob([report], { type: 'application/pdf' }),
      };
    }

    if (options.format === 'excel') {
      const csv = createCsv(exportData);
      return {
        filename: `sinaesta-analytics-${options.studentId}.xlsx`,
        blob: new Blob([csv], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
      };
    }

    const csv = createCsv(exportData);
    return {
      filename: `sinaesta-analytics-${options.studentId}.csv`,
      blob: new Blob([csv], { type: 'text/csv' }),
    };
  },

  async generatePerformanceCertificate(studentName: string) {
    const certificate = `Certificate of Progress\n\nThis certifies that ${studentName} has achieved consistent improvement on Sinaesta.`;
    return {
      filename: `sinaesta-certificate-${studentName.replace(/\s+/g, '-')}.txt`,
      blob: new Blob([certificate], { type: 'text/plain' }),
    };
  },
};
