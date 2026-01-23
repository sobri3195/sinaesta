/**
 * API Types and Interfaces
 * Comprehensive type definitions for all API requests and responses
 */

// ============================================================================
// Generic API Response Types
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ============================================================================
// Error Types
// ============================================================================

export enum ApiErrorCode {
  // Auth errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  
  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  
  // Resource errors
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  CONFLICT = 'CONFLICT',
  
  // Server errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  TIMEOUT = 'TIMEOUT',
  
  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  OFFLINE = 'OFFLINE',
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // Unknown
  UNKNOWN = 'UNKNOWN'
}

export interface ApiErrorDetail {
  field?: string;
  message: string;
  code?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  code?: ApiErrorCode;
  details?: ApiErrorDetail[];
  statusCode?: number;
  timestamp?: number;
}

// ============================================================================
// Request Configuration
// ============================================================================

export interface RequestConfig {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  data?: any;
  params?: Record<string, any>;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  cache?: boolean;
  cacheTTL?: number;
  skipAuth?: boolean;
  onUploadProgress?: (progressEvent: any) => void;
  onDownloadProgress?: (progressEvent: any) => void;
  signal?: AbortSignal;
}

// ============================================================================
// Auth API Types
// ============================================================================

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    avatar?: string;
    targetSpecialty?: string;
    institution?: string;
    strNumber?: string;
    emailVerified?: boolean;
  };
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: string;
  targetSpecialty?: string;
  institution?: string;
  strNumber?: string;
}

export interface RegisterResponse extends LoginResponse {}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}

export interface LogoutRequest {
  refreshToken: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

// ============================================================================
// User API Types
// ============================================================================

export interface GetUsersRequest extends PaginationParams {
  role?: string;
  specialty?: string;
  status?: string;
  search?: string;
}

export interface GetUsersResponse extends PaginatedResponse<any> {}

export interface UpdateUserRequest {
  name?: string;
  avatar?: string;
  targetSpecialty?: string;
  institution?: string;
  strNumber?: string;
  status?: string;
}

export interface UpdateUserResponse {
  user: any;
}

export interface DeleteUserRequest {
  id: string;
}

// ============================================================================
// Exam API Types
// ============================================================================

export interface GetExamsRequest extends PaginationParams {
  specialty?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  mode?: 'STANDARD' | 'CLINICAL_CASE' | 'SPEED_DRILL';
  topic?: string;
  status?: string;
  search?: string;
}

export interface GetExamsResponse extends PaginatedResponse<any> {}

export interface CreateExamRequest {
  title: string;
  description: string;
  durationMinutes: number;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  mode?: 'STANDARD' | 'CLINICAL_CASE' | 'SPEED_DRILL';
  questions?: any[];
  vignettes?: any[];
  thumbnailUrl?: string;
  blueprintId?: string;
  scheduledStart?: number;
  scheduledEnd?: number;
  proctoring?: any;
}

export interface CreateExamResponse {
  exam: any;
}

export interface UpdateExamRequest extends Partial<CreateExamRequest> {}

export interface UpdateExamResponse {
  exam: any;
}

export interface DeleteExamRequest {
  id: string;
}

export interface SubmitExamRequest {
  examId: string;
  answers: number[];
  auditLog?: any[];
  timeSpent?: number;
}

export interface SubmitExamResponse {
  result: any;
  score: number;
  totalQuestions: number;
  aiFeedback?: string;
}

// ============================================================================
// Question API Types
// ============================================================================

export interface GetQuestionsRequest extends PaginationParams {
  examId?: string;
  category?: string;
  difficulty?: string;
  status?: string;
  authorId?: string;
}

export interface CreateQuestionRequest {
  text: string;
  options: string[];
  correctAnswerIndex: number;
  explanation?: string;
  category?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  type?: string;
  imageUrl?: string;
  points?: number;
}

export interface UpdateQuestionRequest extends Partial<CreateQuestionRequest> {}

export interface DeleteQuestionRequest {
  id: string;
}

// ============================================================================
// Results API Types
// ============================================================================

export interface GetResultsRequest extends PaginationParams {
  examId?: string;
  userId?: string;
  specialty?: string;
  fromDate?: number;
  toDate?: number;
}

export interface GetResultsResponse extends PaginatedResponse<any> {}

export interface GetResultDetailsRequest {
  id: string;
}

export interface GetResultStatsRequest {
  examId?: string;
  specialty?: string;
  userId?: string;
  period?: 'week' | 'month' | 'year' | 'all';
}

export interface GetResultStatsResponse {
  totalAttempts: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  passRate: number;
  domainAnalysis?: Record<string, any>;
  performanceTrend?: any[];
}

// ============================================================================
// Flashcard API Types
// ============================================================================

export interface GetFlashcardsRequest extends PaginationParams {
  category?: string;
  mastered?: boolean;
  search?: string;
}

export interface GetFlashcardsResponse extends PaginatedResponse<any> {}

export interface CreateFlashcardRequest {
  front: string;
  back: string;
  category?: string;
}

export interface UpdateFlashcardRequest {
  front?: string;
  back?: string;
  category?: string;
  mastered?: boolean;
}

export interface DeleteFlashcardRequest {
  id: string;
}

export interface GetFlashcardDecksRequest extends PaginationParams {
  topic?: string;
  search?: string;
}

export interface CreateFlashcardDeckRequest {
  title: string;
  topic: string;
  cards: any[];
}

// ============================================================================
// OSCE API Types
// ============================================================================

export interface GetOSCEStationsRequest extends PaginationParams {
  specialty?: string;
  search?: string;
}

export interface GetOSCEStationsResponse extends PaginatedResponse<any> {}

export interface CreateOSCEStationRequest {
  title: string;
  scenario: string;
  instruction: string;
  durationMinutes: number;
  checklist: any[];
  specialty?: string;
}

export interface UpdateOSCEStationRequest extends Partial<CreateOSCEStationRequest> {}

export interface GetOSCEAttemptsRequest extends PaginationParams {
  stationId?: string;
  userId?: string;
}

export interface SubmitOSCEAttemptRequest {
  stationId: string;
  performance: any;
  checklistScores?: any[];
}

export interface SubmitOSCEAttemptResponse {
  attempt: any;
  score: number;
  feedback?: string;
}

// ============================================================================
// Analytics API Types
// ============================================================================

export interface GetUserStatsRequest {
  userId?: string;
  period?: 'week' | 'month' | 'year' | 'all';
}

export interface GetUserStatsResponse {
  totalExams: number;
  averageScore: number;
  totalStudyTime: number;
  strongTopics: string[];
  weakTopics: string[];
  recentActivity: any[];
  performanceByTopic: Record<string, any>;
}

export interface GetExamStatsRequest {
  examId: string;
}

export interface GetExamStatsResponse {
  totalAttempts: number;
  averageScore: number;
  passRate: number;
  averageTimeSpent: number;
  questionAnalysis: any[];
  difficultyDistribution: Record<string, number>;
}

export interface GetPerformanceTrendsRequest {
  userId?: string;
  specialty?: string;
  period?: 'week' | 'month' | 'year';
  granularity?: 'day' | 'week' | 'month';
}

export interface GetPerformanceTrendsResponse {
  trends: {
    date: string;
    score: number;
    examsCompleted: number;
  }[];
  insights: {
    trend: 'improving' | 'declining' | 'stable';
    percentageChange: number;
    recommendation?: string;
  };
}

// ============================================================================
// File Upload API Types
// ============================================================================

export interface UploadFileRequest {
  file: File;
  category?: 'image' | 'document' | 'template' | 'user' | 'exam';
  onProgress?: (progress: number) => void;
}

export interface UploadFileResponse {
  fileId: string;
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  category: string;
  uploadedAt: number;
}

export interface DeleteFileRequest {
  fileId: string;
}

export interface GetFilesRequest extends PaginationParams {
  category?: string;
  search?: string;
}

export interface GetFilesResponse extends PaginatedResponse<UploadFileResponse> {}

// ============================================================================
// Cache Types
// ============================================================================

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface CacheConfig {
  enabled: boolean;
  ttl: number; // Time to live in milliseconds
  maxSize: number; // Maximum cache size in MB
}

// ============================================================================
// Retry Types
// ============================================================================

export interface RetryConfig {
  enabled: boolean;
  maxRetries: number;
  retryDelay: number; // Initial delay in milliseconds
  retryStatusCodes: number[]; // HTTP status codes to retry on
  exponentialBackoff: boolean;
}

// ============================================================================
// Request Deduplication Types
// ============================================================================

export interface PendingRequest {
  promise: Promise<any>;
  timestamp: number;
}

export interface RequestDeduplicationConfig {
  enabled: boolean;
  timeout: number; // Time to keep pending requests in milliseconds
}

// ============================================================================
// Billing / Payments / Subscriptions Types
// ============================================================================

export type BillingPlanCode = 'FREE' | 'PREMIUM' | 'PROFESSIONAL';

export interface BillingPlan {
  id: string;
  code: BillingPlanCode;
  name: string;
  price_amount: number;
  currency: string;
  interval: 'month' | 'year' | 'one_time' | string;
  features: string[];
  trial_days: number;
  stripe_price_id?: string | null;
  active: boolean;
}

export interface BillingSubscription {
  id?: string;
  status: string;
  startDate?: string | number | null;
  currentPeriodStart?: string | number | null;
  currentPeriodEnd?: string | number | null;
  cancelAtPeriodEnd?: boolean;
  canceledAt?: string | number | null;
  trialEnd?: string | number | null;
  stripeSubscriptionId?: string | null;
  plan: BillingPlan;
}

export interface BillingCheckoutSessionResponse {
  url: string;
  sessionId: string;
}

export interface BillingPortalSessionResponse {
  url: string;
}

export interface BillingInvoice {
  id: string;
  invoice_number?: string | null;
  stripe_invoice_id?: string | null;
  hosted_invoice_url?: string | null;
  pdf_url?: string | null;
  amount_due?: number | null;
  amount_paid?: number | null;
  currency?: string | null;
  status?: string | null;
  issued_at?: string | null;
  due_date?: string | null;
  paid_at?: string | null;
  created_at?: string | null;
}

export interface BillingPayment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  payment_method?: string | null;
  stripe_payment_intent_id?: string | null;
  stripe_charge_id?: string | null;
  failure_code?: string | null;
  failure_message?: string | null;
  paid_at?: string | null;
  created_at?: string | null;
}

export interface BillingAdminOverview {
  revenueTotal: number;
  revenueThisMonth: number;
  activeSubscriptions: number;
  pastDueSubscriptions: number;
}

export interface BillingAdminSubscriptionRow {
  id: string;
  status: string;
  current_period_end?: string | null;
  trial_end?: string | null;
  cancel_at_period_end?: boolean;
  stripe_subscription_id?: string | null;
  user_id: string;
  email: string;
  name: string;
  plan_code: string;
  plan_name: string;
  price_amount: number;
  currency: string;
  interval: string;
}

export interface BillingAdminPaymentRow {
  id: string;
  amount: number;
  currency: string;
  status: string;
  payment_method?: string | null;
  stripe_payment_intent_id?: string | null;
  paid_at?: string | null;
  created_at?: string | null;
  email: string;
  name: string;
}

export interface BillingCoupon {
  id: string;
  code: string;
  percent_off?: number | null;
  amount_off?: number | null;
  currency?: string | null;
  active: boolean;
  stripe_coupon_id?: string | null;
  max_redemptions?: number | null;
  redeem_by?: string | null;
  created_at?: string | null;
}
