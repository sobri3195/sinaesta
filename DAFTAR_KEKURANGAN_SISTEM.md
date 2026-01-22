# Daftar Kekurangan Sistem Sinaesta

## 🚨 Kekurangan Kritis (Harus Segera Diperbaiki)

### 1. **Tidak Ada Backend & Database**
- **Status**: ❌ Frontend Only
- **Dampak**:
  - Data hilang saat refresh halaman
  - Tidak bisa menyimpan progress ujian
  - Tidak ada persistent storage untuk user accounts
  - Tidak ada real-time updates
- **Prioritas**: 🔴 CRITICAL

**🤖 AI Development Prompt:**
```
Create a complete backend system for Sinaesta (medical exam platform) with the following requirements:

1. **Tech Stack**: Node.js + Express.js + PostgreSQL (or MongoDB)
2. **Database Schema Design**:
   - Users table (id, email, password_hash, role, name, specialty, created_at)
   - Exams table (id, title, specialty, difficulty, duration, questions_count, created_by, created_at)
   - Questions table (id, exam_id, question_text, options, correct_answer, question_type, created_at)
   - ExamResults table (id, user_id, exam_id, score, answers, completed_at)
   - Flashcards table (id, user_id, front, back, category, created_at)
   - OSCEAttempts table (id, user_id, scenario_id, performance, feedback, completed_at)

3. **API Endpoints** (RESTful):
   - Authentication: POST /api/auth/register, POST /api/auth/login, POST /api/auth/logout
   - Users: GET /api/users/me, GET /api/users/:id, PUT /api/users/:id
   - Exams: GET /api/exams, POST /api/exams, GET /api/exams/:id, PUT /api/exams/:id, DELETE /api/exams/:id
   - Questions: GET /api/exams/:id/questions, POST /api/exams/:id/questions
   - Results: POST /api/results, GET /api/users/:id/results, GET /api/results/:id
   - Flashcards: CRUD operations
   - OSCE: CRUD operations for scenarios and attempts

4. **Security**:
   - Password hashing with bcrypt
   - JWT authentication with refresh tokens
   - Role-based access control (RBAC)
   - Input validation with Zod or Joi
   - Rate limiting
   - CORS configuration

5. **Integration**:
   - Create TypeScript interfaces that match the existing types.ts
   - Create API service layer in services/apiService.ts to replace mock data
   - Update App.tsx to use real API calls instead of localStorage

6. **Environment Setup**:
   - .env configuration for database URL, JWT secrets
   - Docker Compose for local development
   - Database migration scripts

Please implement a production-ready backend with proper error handling, logging, and documentation.
```

### 2. **Tidak Ada Sistem Autentikasi Real**
- **Status**: ❌ Mock Implementation Only
- **Dampak**:
  - Login pakai mock user (MOCK_STUDENT, MOCK_ADMIN)
  - Tidak ada password security
  - Tidak ada session management
  - Siapa saja bisa akses semua fitur
- **Prioritas**: 🔴 CRITICAL

**🤖 AI Development Prompt:**
```
Implement a comprehensive authentication system for Sinaesta replacing the current mock implementation:

1. **Authentication Flow**:
   - User registration with email verification
   - Login with email/password
   - Password reset via email
   - JWT token generation (access + refresh tokens)
   - Session management
   - Logout functionality
   - Remember me option

2. **Security Implementation**:
   - Password hashing with bcrypt (salt rounds: 10)
   - JWT tokens with expiration:
     * Access token: 15 minutes
     * Refresh token: 7 days
   - Token rotation on refresh
   - Secure cookie storage (httpOnly, secure, sameSite)
   - Rate limiting on login attempts (5 per 15 minutes)
   - Account lockout after 5 failed attempts

3. **Frontend Implementation**:
   - Create AuthContext for managing authentication state
   - Protected route component (RequireAuth)
   - Login page with form validation (email format, password strength)
   - Registration page with password confirmation
   - Forgot password page with email input
   - Password reset page with new password
   - Update App.tsx to use AuthContext instead of mock users
   - Remove MOCK_STUDENT and MOCK_ADMIN from LoginSelectionModal

4. **User Roles & Permissions**:
   - Roles: STUDENT, ADMIN, MENTOR, SUPER_ADMIN
   - Role-based access control middleware
   - Permission checking for sensitive operations
   - Admin panel visibility based on role

5. **Session Management**:
   - Token storage in localStorage or secure cookies
   - Auto-refresh access token before expiry
   - Logout on token expiration
   - Clear session on logout
   - Handle concurrent sessions (optional)

6. **UI Components**:
   - Update LoginSelectionModal to remove mock options
   - Add real login form with email/password fields
   - Add registration form with required fields
   - Add password visibility toggle
   - Add loading states and error messages
   - Add form validation feedback

7. **Integration**:
   - Create services/authService.ts for all auth API calls
   - Update types.ts to add User, AuthResponse, LoginCredentials interfaces
   - Create middleware/requireAuth.ts for route protection
   - Update App.tsx to wrap app with AuthProvider

Please ensure the implementation follows security best practices and provides a smooth user experience.
```

### 3. **Tidak Ada Testing Framework**
- **Status**: ❌ No Tests
- **Dampak**:
  - Tidak ada unit tests
  - Tidak ada integration tests
  - Tidak ada E2E tests
  - Resiko tinggi untuk bugs saat development
- **Prioritas**: 🔴 CRITICAL

**🤖 AI Development Prompt:**
```
Set up a comprehensive testing framework for Sinaesta (React + TypeScript + Vite application):

1. **Testing Stack Selection**:
   - Unit Tests: Vitest (native to Vite) or Jest
   - Component Testing: React Testing Library + Vitest
   - E2E Testing: Playwright or Cypress
   - Mocking: MSW (Mock Service Worker) for API mocking

2. **Configuration Setup**:
   - Install and configure Vitest with React support
   - Configure Playwright for E2E tests
   - Setup MSW for API mocking
   - Configure test coverage reporting (Istanbul/v8)
   - Add test scripts to package.json

3. **Unit Tests Structure** (create tests/ directory):
   - tests/unit/services/geminiService.test.ts
   - tests/unit/utils/helperFunctions.test.ts
   - tests/unit/types/validators.test.ts
   - tests/unit/hooks/useLocalStorage.test.ts

4. **Component Tests**:
   - tests/components/ExamCreator.test.tsx
   - tests/components/ExamTaker.test.tsx
   - tests/components/ExcelImport.test.tsx
   - tests/components/Settings.test.tsx
   - tests/components/LoginSelectionModal.test.tsx
   - tests/components/Sidebar.test.tsx
   - tests/components/OSCESimulator.test.tsx
   - tests/components/FlashcardSystem.test.tsx
   - tests/components/Analytics.test.tsx

5. **Integration Tests**:
   - tests/integration/examFlow.test.tsx
   - tests/integration/userRegistration.test.tsx
   - tests/integration/excelImportFlow.test.tsx
   - tests/integration/settingsPersistence.test.tsx

6. **E2E Tests** (using Playwright):
   - e2e/specs/auth.spec.ts - Login, registration, logout
   - e2e/specs/examCreation.spec.ts - Create exam, add questions, publish
   - e2e/specs/examTaking.spec.ts - Take exam, submit, view results
   - e2e/specs/excelImport.spec.ts - Import questions from Excel
   - e2e/specs/osceSimulation.spec.ts - Complete OSCE scenario
   - e2e/specs/settings.spec.ts - Update settings, verify persistence

7. **Test Coverage Requirements**:
   - Minimum 80% code coverage
   - Critical paths must have 100% coverage
   - All components must have basic render tests
   - All services must have unit tests
   - All user flows must have E2E tests

8. **Testing Utilities**:
   - Create tests/utils/test-utils.tsx with custom render function
   - Create test data generators in tests/utils/mockData.ts
   - Setup custom matchers for React Testing Library
   - Create test helpers for localStorage mocking

9. **CI/CD Integration**:
   - Add test commands to GitHub Actions or similar CI
   - Run tests on every PR
   - Block merging if tests fail
   - Upload coverage reports to Codecov or similar

10. **Best Practices**:
    - Write tests before code (TDD approach for new features)
    - Test user behavior, not implementation details
    - Avoid testing third-party libraries
    - Use meaningful test names
    - Keep tests isolated and independent
    - Mock external dependencies (APIs, local storage)

Please create a comprehensive test suite covering all major features and critical paths of the application.
```

---

## 🔧 Kekurangan Teknis (Harus Diperbaiki)

### 4. **Tidak Ada API & Data Management**
- **Status**: ❌ No Backend API
- **Yang Hilang**:
  - RESTful API endpoints
  - Database integration
  - Data validation
  - Error handling
- **Prioritas**: 🟠 HIGH

**🤖 AI Development Prompt:**
```
Create a comprehensive API service layer and data management system for Sinaesta:

1. **API Service Architecture**:
   - Create services/apiService.ts with axios or fetch wrapper
   - Implement base API client with interceptors
   - Add request/response interceptors for auth tokens
   - Centralized error handling
   - Request/response logging in development
   - Automatic token refresh on 401 errors
   - Cancel token support for pending requests

2. **API Endpoints Service**:
   - Create services/endpoints/ directory with typed API functions:
     * authEndpoints.ts - login, register, logout, refreshToken
     * userEndpoints.ts - getProfile, updateProfile, deleteAccount
     * examEndpoints.ts - getExams, getExam, createExam, updateExam, deleteExam
     * questionEndpoints.ts - getQuestions, createQuestion, updateQuestion, deleteQuestion
     * resultEndpoints.ts - submitExam, getResults, getResultDetails
     * flashcardEndpoints.ts - CRUD operations for flashcards
     * osceEndpoints.ts - getScenarios, submitOSCEAttempt, getOSCEHistory
     * analyticsEndpoints.ts - getUserStats, getExamStats, getPerformanceTrends

3. **Data Management Layer**:
   - Create hooks/useApi.ts for reusable API calls
   - Create hooks/useMutation.ts for POST/PUT/DELETE operations
   - Create hooks/useQuery.ts for GET operations with caching
   - Implement optimistic updates for better UX
   - Add request deduplication
   - Implement data caching strategies (React Query or similar)

4. **Type Definitions**:
   - Create types/api.ts with all API request/response types:
     * ApiResponse<T> - generic API response wrapper
     * ApiError - standardized error structure
     * Request types for each endpoint
     * Response types for each endpoint
     * Pagination params and response

5. **Error Handling**:
   - Custom API error class (ApiError)
   - Error boundaries for API failures
   - Retry logic for failed requests (exponential backoff)
   - Offline detection and handling
   - User-friendly error messages
   - Error logging to monitoring service

6. **Data Validation**:
   - Client-side validation with Zod schemas
   - Request payload validation before sending
   - Response validation after receiving
   - Type guards for runtime type checking

7. **State Management**:
   - Create stores/ directory for global state:
     * authStore.ts - user session, auth tokens
     * examStore.ts - cached exams, filters
     * uiStore.ts - loading states, modals, toasts
   - Use Zustand or similar lightweight state management
   - Persist state to localStorage selectively

8. **Optimizations**:
   - Implement request batching
   - Add response caching with TTL
   - Lazy loading for large datasets
   - Pagination support for list endpoints
   - Debounce search/filter requests

9. **Mock API for Development**:
   - Keep mockData.ts for development without backend
   - Create MSW handlers to mock API responses
   - Seamlessly switch between real and mock APIs

10. **Documentation**:
    - JSDoc comments for all API functions
    - TypeScript types for all requests/responses
    - Usage examples in README

Please create a production-ready API layer that handles all data operations efficiently and provides excellent developer experience.
```

### 5. **Tidak Ada File Upload/Storage**
- **Status**: ❌ No File Management
- **Yang Hilang**:
  - Upload gambar untuk soal
  - Template Excel masih hardcoded
  - Document management
  - Image optimization
- **Prioritas**: 🟠 HIGH

**🤖 AI Development Prompt:**
```
Implement a comprehensive file upload and storage system for Sinaesta:

1. **File Upload Architecture**:
   - Choose cloud storage provider: AWS S3, Cloudflare R2, or MinIO (self-hosted)
   - Implement signed URLs for secure uploads
   - Support multiple file types: images (JPG, PNG, GIF), PDFs, Excel files
   - File size limits and validation
   - Progress tracking for uploads
   - Drag and drop support
   - Batch upload support

2. **Backend Implementation**:
   - Create upload endpoints (POST /api/upload, POST /api/upload/url)
   - Generate presigned URLs for direct uploads
   - Implement file validation (type, size, dimensions)
   - Create storage service abstraction
   - Add virus scanning integration
   - Implement file cleanup for orphaned files
   - Add CDN configuration for faster delivery

3. **Frontend Components**:
   - Create components/FileUpload.tsx with drag-drop zone
   - Create components/UploadProgress.tsx for tracking
   - Create components/ImagePreview.tsx for previewing uploaded images
   - Create components/FileManager.tsx for managing uploaded files
   - Add file upload to ExamCreator (question images, diagrams)
   - Add profile picture upload to user settings

4. **Image Optimization**:
   - Auto-resize images on upload (max width/height)
   - Generate thumbnails
   - Convert to WebP format for web optimization
   - Implement lazy loading for images
   - Add responsive image support
   - Image compression before upload

5. **File Management**:
   - Create admin panel for file management
   - List all uploaded files with metadata
   - Delete unused files
   - View file analytics (download count, storage usage)
   - Bulk operations (delete, download)
   - Search and filter files

6. **Excel Template Enhancement**:
   - Move Excel template generation to backend
   - Create dynamic template generation API
   - Support custom columns based on settings
   - Add multiple template options
   - Template versioning
   - Download templates via API endpoint

7. **Security**:
   - File type validation (whitelist approach)
   - File size limits (images: 5MB, docs: 10MB, Excel: 2MB)
   - Scan uploaded files for malware
   - Rate limiting on upload endpoints
   - Secure file access (authentication required)
   - Prevent directory traversal attacks

8. **Storage Organization**:
   - Organize files by type: /images/, /documents/, /templates/
   - Organize by user: /users/{userId}/
   - Organize by context: /exams/{examId}/questions/
   - Implement folder structure
   - Add file metadata to database

9. **Error Handling**:
   - Upload retry logic
   - Handle network failures
   - Show user-friendly error messages
   - Log upload failures
   - Cancel pending uploads

10. **UI/UX**:
    - Upload button with clear CTA
    - Progress bar with percentage
    - Preview for images before upload
    - File size indicator
    - Remove file option before upload
    - Upload history per session

Please implement a robust file upload system that's secure, efficient, and provides excellent user experience.
```

### 6. **Tidak Ada Real-time Features**
- **Status**: ❌ Static Only
- **Yang Hilang**:
  - Live exam updates
  - Real-time chat dengan mentor
  - Collaborative features
  - Live leaderboard
- **Prioritas**: 🟠 HIGH

**🤖 AI Development Prompt:**
```
Implement real-time features for Sinaesta using WebSocket technology:

1. **WebSocket Architecture**:
   - Use Socket.IO (Node.js) or WebSocket API
   - Create real-time server with event handling
   - Implement room-based communication (exam rooms, mentor rooms)
   - Handle connection/disconnection gracefully
   - Scale horizontally with Socket.IO adapter (Redis adapter)
   - Implement heartbeat and reconnection logic

2. **Live Exam Updates**:
   - Real-time question updates during active exams
   - Live timer synchronization
   - Auto-save progress to prevent data loss
   - Notify students when exam is about to end
   - Broadcast exam status changes
   - Live participant count

3. **Real-time Chat with Mentors**:
   - Create components/Chat.tsx with message list
   - Real-time messaging between students and mentors
   - Online/offline status indicators
   - Typing indicators
   - Read receipts
   - Message history persistence
   - File sharing in chat
   - Rich text support
   - Emoji support

4. **Live Leaderboard**:
   - Create components/LiveLeaderboard.tsx
   - Real-time ranking updates during competitions
   - Show top performers across exams
   - Weekly/monthly leaderboards
   - Filter by specialty
   - Animated score updates
   - User position highlight

5. **Collaborative Features**:
   - Study rooms for group discussions
   - Real-time document collaboration
   - Shared flashcard decks
   - Group exam sessions
   - Peer-to-peer Q&A
   - Virtual study groups

6. **Notification System**:
   - Real-time push notifications
   - Toast notifications for events
   - Badge counters
   - Sound alerts (optional)
   - Notification center
   - Mark as read functionality

7. **Backend Implementation**:
   - Create services/socketService.ts for WebSocket client
   - Create Socket.IO server events:
     * join-room, leave-room
     * send-message, receive-message
     * exam-update, user-join-exam, user-leave-exam
     * leaderboard-update
     * notification-send
   - Implement authentication for WebSocket connections
   - Add rate limiting for WebSocket messages

8. **Frontend Integration**:
   - Create hooks/useWebSocket.ts for WebSocket connection
   - Create hooks/useChat.ts for chat functionality
   - Create hooks/useRealtimeExam.ts for exam updates
   - Create hooks/useLeaderboard.ts for leaderboard data
   - Update App.tsx to initialize WebSocket connection
   - Handle connection states (connecting, connected, disconnected)

9. **Performance Optimization**:
   - Debounce rapid updates
   - Batch updates when possible
   - Implement message queues
   - Handle reconnection with exponential backoff
   - Optimize payload size

10. **Error Handling**:
    - Handle WebSocket connection failures
    - Fallback to polling if WebSocket unavailable
    - Retry logic for failed messages
    - User-friendly error messages
    - Logging for debugging

11. **Security**:
    - Authenticate WebSocket connections
    - Validate message payloads
    - Rate limit messages per user
    - Sanitize chat messages (XSS prevention)
    - Room access control

12. **UI Components**:
    - Chat component with message bubbles
    - Online status indicator (green dot)
    - Typing indicator animation
    - Notification bell with badge
    - Leaderboard with animated rankings
    - Connection status indicator

Please implement a robust real-time system that enhances collaboration and engagement in the platform.
```

### 7. **Tidak Ada Payment System**
- **Status**: ❌ Free Only
- **Yang Hilang**:
  - Subscription management
  - Payment processing
  - Invoice generation
  - Premium features
- **Prioritas**: 🟡 MEDIUM

**🤖 AI Development Prompt:**
```
Implement a comprehensive payment and subscription system for Sinaesta:

1. **Payment Gateway Integration**:
   - Choose provider: Stripe, Midtrans, or Xendit (Indonesia-friendly)
   - Setup API keys and webhooks
   - Implement payment methods: Credit card, bank transfer, e-wallets
   - Support recurring payments (subscriptions)
   - Handle payment failures and retries
   - Implement 3D Secure for card payments

2. **Subscription Plans**:
   - Define tiered pricing model:
     * Free Tier: Basic access, limited exams
     * Premium Tier: Unlimited exams, advanced analytics, priority support
     * Professional Tier: All features, mentor access, OSCE sessions
   - Create subscription management admin panel
   - Plan comparison page
   - Trial period support
   - Plan upgrade/downgrade
   - Plan cancellation and refund handling

3. **Database Schema**:
   - Create subscriptions table (id, user_id, plan_id, status, start_date, end_date)
   - Create payments table (id, user_id, amount, currency, status, payment_method)
   - Create invoices table (id, user_id, payment_id, invoice_number, pdf_url)
   - Create plans table (id, name, price, features, interval)

4. **Frontend Components**:
   - Create components/Pricing.tsx - Plan comparison page
   - Create components/Checkout.tsx - Payment checkout flow
   - Create components/SubscriptionStatus.tsx - User's current plan
   - Create components/InvoiceList.tsx - Invoice history
   - Create components/PaymentMethod.tsx - Manage payment methods
   - Add upgrade prompts in relevant places

5. **Payment Flow**:
   - User selects plan
   - Review order summary
   - Enter payment details
   - Process payment
   - Show success/failure message
   - Update user subscription status
   - Send confirmation email
   - Redirect to dashboard

6. **Webhook Handling**:
   - Handle payment.success events
   - Handle payment.failed events
   - Handle subscription.updated events
   - Handle invoice.paid events
   - Implement idempotency for webhooks
   - Log all webhook events

7. **Invoice Generation**:
   - Generate PDF invoices
   - Include company details
   - Include payment breakdown
   - Include tax information
   - Downloadable invoice history
   - Automatic invoice delivery via email

8. **Premium Features**:
   - Feature flags based on subscription
   - Lock premium content with upgrade prompts
   - Show "Upgrade" badges on premium features
   - Trial access to premium features
   - Graceful degradation for free tier

9. **Admin Dashboard**:
   - Revenue dashboard
   - Subscription analytics
   - Payment history
   - User subscription management
   - Manual plan assignment
   - Refund processing
   - Coupon/discount code management

10. **Security & Compliance**:
    - PCI DSS compliance (if storing card data)
    - Never store full credit card numbers
    - Use Stripe Elements or similar for secure input
    - GDPR compliance for payment data
    - Audit logging for all payment operations
    - Fraud detection and prevention

11. **Error Handling**:
    - Handle declined payments
    - Show user-friendly error messages
    - Provide guidance for failed payments
    - Retry failed subscription payments
    - Notify users of payment issues

12. **UI/UX**:
    - Clean pricing comparison table
    - Prominent CTA buttons
    - Secure payment indicators
    - Loading states during payment
    - Success animations after payment
    - Clear plan feature lists

Please implement a secure, user-friendly payment system that handles subscriptions and one-time payments.
```

### 8. **Tidak Ada Email Notifications**
- **Status**: ❌ No Communication
- **Yang Hilang**:
  - Welcome emails
  - Exam reminders
  - Results notifications
  - Mentor booking confirmations
- **Prioritas**: 🟡 MEDIUM

**🤖 AI Development Prompt:**
```
Implement a comprehensive email notification system for Sinaesta:

1. **Email Service Setup**:
   - Choose provider: SendGrid, Mailgun, or AWS SES
   - Setup SMTP configuration
   - Configure email templates
   - Setup DKIM, SPF, and DMARC records
   - Implement email queue system
   - Add bounce and complaint handling

2. **Email Templates** (create templates/ directory):
   - Welcome email (onboarding)
   - Email verification
   - Password reset
   - Exam reminder (24h, 1h before)
   - Exam results available
   - Weekly progress report
   - Mentor booking confirmation
   - Mentor cancellation notice
   - Subscription confirmation
   - Payment receipt/invoice
   - Trial ending reminder
   - Account locked warning
   - Password changed notification

3. **Backend Implementation**:
   - Create services/emailService.ts with email functions
   - Create templates/ directory for HTML email templates
   - Use template engine (Handlebars, EJS, or Jinja2)
   - Implement email queue (BullMQ or similar)
   - Add retry logic for failed emails
   - Track email delivery status
   - Log all sent emails

4. **Notification Types**:
   - Transactional emails (immediate): Verify email, password reset
   - Scheduled emails (cron jobs): Exam reminders, weekly reports
   - Trigger-based emails (event-driven): Results, bookings
   - Promotional emails (optional): Feature updates, tips

5. **User Preferences**:
   - Create user notification preferences in database
   - Allow users to opt-out of specific email types
   - Settings page for email preferences
   - Unsubscribe link in all emails
   - Preference management in user profile

6. **Email Design**:
   - Responsive HTML email templates
   - Consistent branding (colors, logo)
   - Plain text fallback
   - Inline CSS for email clients
   - Professional and clean design
   - Mobile-optimized

7. **Email Queue System**:
   - Implement job queue for sending emails
   - Priority queue (urgent emails first)
   - Batch sending for bulk emails
   - Rate limiting to avoid spam
   - Worker process for queue processing
   - Monitoring and alerting

8. **Tracking & Analytics**:
   - Track open rates
   - Track click rates
   - Track bounce rates
   - Track unsubscribe rates
   - Email delivery dashboard in admin
   - Analytics per email type

9. **Integration Points**:
   - Send welcome email on registration
   - Send verification email on signup
   - Send password reset on request
   - Schedule exam reminders
   - Send results email on exam completion
   - Send booking confirmation
   - Send weekly progress emails
   - Send payment receipts
   - Send subscription confirmations

10. **Error Handling**:
    - Handle delivery failures
    - Retry failed emails (exponential backoff)
    - Log delivery errors
    - Alert on high bounce rates
    - Fallback to in-app notifications

11. **Testing**:
    - Email preview during development
    - Test email sending functionality
    - Test email rendering across clients
    - Use mail-tester for quality checks
    - A/B testing for email content (optional)

12. **Compliance**:
    - Include unsubscribe link (CAN-SPAM, GDPR)
    - Honor unsubscribe requests
    - Include company physical address
    - Data retention policy for email logs
    - User consent for marketing emails

13. **Components**:
    - Create components/NotificationSettings.tsx for user preferences
    - Add email verification flow to registration
    - Add "Resend verification email" button
    - Show notification status in settings

Please implement a robust email system that keeps users engaged and informed while respecting their preferences.
```

---

## 📊 Kekurangan Fitur (Nice to Have)

### 9. **Analytics & Monitoring Terbatas**
- **Status**: ⚠️ Basic Only
- **Yang Kurang**:
  - Real-time analytics dashboard
  - User behavior tracking
  - Performance monitoring
  - Error tracking (Sentry)
- **Prioritas**: 🟡 MEDIUM

**🤖 AI Development Prompt:**
```
Implement comprehensive analytics and monitoring for Sinaesta:

1. **Analytics Platform**:
   - Integrate Google Analytics 4 (GA4) or Plausible (privacy-focused)
   - Track page views, user sessions, and events
   - Setup custom dimensions for user roles and specialties
   - Track conversion funnels (registration → exam completion)
   - Implement event tracking for key actions:
     * Exam start/completion
     * Feature usage
     * Button clicks
     * Navigation patterns

2. **Error Tracking**:
   - Integrate Sentry for error monitoring
   - Configure error capturing for both frontend and backend
   - Setup issue alerts for critical errors
   - Track error rates and impact
   - Add breadcrumb logging for user actions
   - Implement user context in error reports
   - Setup release tracking

3. **Performance Monitoring**:
   - Integrate Web Vitals tracking (LCP, FID, CLS)
   - Monitor API response times
   - Track page load times
   - Monitor bundle sizes
   - Setup performance budget alerts
   - Track database query performance

4. **Custom Analytics Dashboard**:
   - Create components/AnalyticsDashboard.tsx in admin
   - Real-time active users chart
   - User growth over time
   - Exam completion rates
   - Most popular exams/specialties
   - User engagement metrics
   - Feature usage statistics
   - Revenue tracking (if payment implemented)

5. **User Behavior Tracking**:
   - Track user journeys through the app
   - Identify drop-off points
   - Track time spent on features
   - Heatmap integration (Hotjar or Clarity)
   - Session recording (optional, with consent)
   - A/B testing framework setup

6. **Backend Monitoring**:
   - Monitor server health (CPU, memory, disk)
   - Database connection pool metrics
   - API endpoint performance
   - Queue processing rates
   - Background job status
   - Uptime monitoring (UptimeRobot or similar)

7. **Alerting System**:
   - Setup alerts for:
     * High error rate threshold (>5%)
     * Server downtime
     * Slow page loads (>3s)
     * Failed payment attempts
     * Database connection issues
   - Email/Push notifications for alerts
   - Slack/Discord webhook integration
   - Severity-based alerting

8. **Logging System**:
   - Structured logging (Winston or Pino)
   - Log levels: error, warn, info, debug
   - Centralized log aggregation (ELK stack or similar)
   - Log retention policy
   - Log searching and filtering
   - Export logs for compliance

9. **Business Metrics**:
   - Daily/Monthly active users (DAU/MAU)
   - User retention rates
   - Churn rate
   - Revenue metrics (MRR, ARPU)
   - Conversion rates
   - Customer lifetime value (CLV)

10. **Reporting**:
    - Weekly analytics reports
    - Monthly executive summaries
    - Custom report builder
    - Export data to CSV/Excel
    - Scheduled email reports

11. **Privacy & Compliance**:
    - GDPR-compliant analytics
    - Anonymize user data
    - Consent management for tracking
    - Data retention policies
    - Right to deletion

12. **Implementation Details**:
    - Create services/analyticsService.ts for event tracking
    - Create hooks/useAnalytics.ts for reusable tracking
    - Add tracking to key components
    - Create admin/analytics page with charts (Recharts)
    - Setup monitoring dashboards (Grafana or similar)

Please implement a comprehensive monitoring system that provides insights into user behavior, performance, and system health.
```

### 10. **Performance Optimization**
- **Status**: ⚠️ Basic Setup
- **Yang Kurang**:
  - Code splitting & lazy loading
  - Bundle size optimization
  - Caching strategy
  - Service worker
- **Prioritas**: 🟢 LOW

**🤖 AI Development Prompt:**
```
Implement comprehensive performance optimization for Sinaesta:

1. **Code Splitting & Lazy Loading**:
   - Implement React.lazy() for all route components
   - Split by routes using dynamic imports
   - Use Suspense for loading states
   - Split vendor chunks (React, Recharts, etc.)
   - Implement prefetching for likely routes
   - Use webpack bundle analyzer to identify optimization opportunities

2. **Bundle Size Optimization**:
   - Analyze current bundle size with vite-bundle-visualizer
   - Remove unused dependencies
   - Tree-shaking for unused code
   - Minimize library dependencies (use smaller alternatives)
   - Use ES modules for better tree-shaking
   - Implement bundle budget limits
   - Target: Main bundle <500KB, total <2MB

3. **Caching Strategy**:
   - Implement service worker with Workbox
   - Cache static assets (CSS, JS, images)
   - Cache API responses with SWR (Stale-While-Revalidate)
   - Implement cache invalidation strategy
   - Use HTTP caching headers (Cache-Control, ETag)
   - CDN integration for static assets
   - Browser storage for frequently accessed data

4. **Image Optimization**:
   - Use next/image or similar optimized image component
   - Serve responsive images (srcset)
   - Lazy load images below the fold
   - Compress images (WebP format)
   - Generate thumbnails for galleries
   - Use placeholder blur for better UX

5. **CSS Optimization**:
   - Purge unused Tailwind CSS classes
   - Minify CSS in production
   - Critical CSS extraction
   - Remove duplicate CSS rules
   - Use CSS containment where appropriate

6. **JavaScript Optimization**:
   - Minify JavaScript (terser)
   - Use production build of dependencies
   - Avoid inline scripts
   - Defer non-critical JavaScript
   - Use async loading for third-party scripts
   - Implement code splitting for heavy components

7. **API Optimization**:
   - Implement request deduplication
   - Cache GET requests with React Query
   - Use GraphQL if many small requests (optional)
   - Implement pagination for large datasets
   - Optimize database queries
   - Use HTTP/2 or HTTP/3

8. **Performance Monitoring**:
   - Track Core Web Vitals (LCP, FID, CLS, FCP, TTFB)
   - Setup Performance Budget with Lighthouse CI
   - Monitor bundle size changes
   - Track API response times
   - Alert on performance regressions

9. **Service Worker & PWA**:
   - Implement offline support
   - Add install prompt for PWA
   - Cache API responses for offline access
   - Background sync for failed requests
   - Add manifest.json for PWA features
   - Implement push notifications

10. **Database Optimization**:
    - Add database indexes for common queries
    - Optimize N+1 queries
    - Implement connection pooling
    - Cache frequently accessed data (Redis)
    - Query result pagination
    - Read replica for heavy read operations

11. **Frontend Optimizations**:
    - Virtual scrolling for long lists (react-window)
    - Memoize expensive calculations (useMemo)
    - Prevent unnecessary re-renders (React.memo)
    - Debounce search inputs
    - Implement pagination instead of infinite scroll where appropriate

12. **Build Configuration**:
    - Optimize Vite configuration
    - Enable production optimizations
    - Configure terser for minification
    - Setup gzip/brotli compression
    - Enable HTTP/2 push for critical resources

Please implement performance optimizations targeting fast load times and smooth user experience.
```

### 11. **Mobile Responsiveness**
- **Status**: ⚠️ Partial Only
- **Yang Kurang**:
  - Touch-optimized interfaces
  - Mobile-specific features
  - Offline support
  - PWA capabilities
- **Prioritas**: 🟢 LOW

**🤖 AI Development Prompt:**
```
Implement comprehensive mobile responsiveness and PWA features for Sinaesta:

1. **Mobile-First Design**:
   - Review all components for mobile compatibility
   - Test on mobile viewports (320px, 375px, 414px, 768px)
   - Implement touch-friendly tap targets (min 44x44px)
   - Optimize font sizes for mobile (16px base)
   - Ensure adequate spacing between elements
   - Test on real devices (iOS, Android)

2. **Responsive Layouts**:
   - Use Tailwind's responsive prefixes (sm:, md:, lg:, xl:)
   - Implement mobile navigation drawer/hamburger menu
   - Optimize grid layouts for mobile
   - Stack vertically on mobile, side-by-side on desktop
   - Responsive tables (card layout on mobile)
   - Responsive charts (resize or scrollable)

3. **Touch Optimization**:
   - Implement touch gestures (swipe, pinch)
   - Add pull-to-refresh for lists
   - Touch feedback (ripple effect)
   - Disable hover states on touch devices
   - Touch-friendly form inputs
   - Virtual keyboard handling (avoid covering inputs)

4. **Mobile-Specific Features**:
   - Bottom navigation bar for key actions
   - Swipe gestures for navigation (exam questions)
   - Haptic feedback for actions
   - Camera integration for ID upload (optional)
   - Geolocation features (optional)
   - Vibration notifications

5. **PWA Implementation**:
   - Create manifest.json with app metadata
   - Add app icons for all sizes
   - Implement splash screen
   - Add "Add to Home Screen" prompt
   - Define theme colors (dark/light mode)
   - Set app display mode (standalone)

6. **Service Worker**:
   - Cache critical resources for offline use
   - Implement offline page
   - Cache first strategy for static assets
   - Network first strategy for API calls
   - Background sync for failed requests
   - Cache management UI

7. **Performance on Mobile**:
   - Optimize images for mobile (smaller sizes)
   - Reduce bundle size for mobile
   - Lazy load components below fold
   - Use web workers for heavy computations
   - Optimize animations (60fps)
   - Reduce JavaScript execution time

8. **Mobile UX Improvements**:
   - Simplified navigation for mobile
   - Quick actions on dashboard
   - One-handed navigation optimization
   - Reduce steps for common tasks
   - Mobile-specific shortcuts
   - Contextual menus

9. **Testing & Debugging**:
   - Chrome DevTools mobile emulation
   - Real device testing on iOS Safari
   - Real device testing on Android Chrome
   - Test on various screen sizes
   - Test with slow 3G connection
   - Use Lighthouse mobile audit

10. **Components to Optimize**:
    - Sidebar → Mobile drawer with slide-in animation
    - ExamTaker → Full-screen mode on mobile, swipe navigation
    - ExcelImport → Simplified interface, drag-drop disabled
    - Settings → Accordion-style sections
    - Charts → Touch-friendly tooltips, simplified views
    - Forms → Larger inputs, better keyboard handling

11. **Offline Functionality**:
    - Cache exam content for offline practice
    - Store flashcards locally
    - Queue actions to sync when online
    - Show offline indicator
    - Allow viewing downloaded content offline
    - Sync progress when connection restored

12. **Push Notifications**:
    - Request notification permission on mobile
    - Send exam reminders via push
    - Send result notifications
    - Send mentor booking alerts
    - Handle notification clicks
    - Notification preferences in settings

Please implement a mobile-optimized experience that works seamlessly across all devices and supports offline usage.
```

### 12. **Security & Compliance**
- **Status**: ⚠️ Basic Only
- **Yang Kurang**:
  - Input validation
  - XSS/CSRF protection
  - GDPR compliance
  - Security audits
- **Prioritas**: 🟡 MEDIUM

**🤖 AI Development Prompt:**
```
Implement comprehensive security and compliance measures for Sinaesta:

1. **Input Validation**:
   - Validate all user inputs on client and server side
   - Use Zod or Yup for schema validation
   - Sanitize user input to prevent XSS
   - Validate file uploads (type, size, content)
   - Email format validation
   - Phone number validation
   - URL validation
   - Custom validation for medical data formats

2. **XSS Prevention**:
   - Sanitize HTML content (DOMPurify)
   - Use React's built-in XSS protection (JSX)
   - Set Content-Security-Policy (CSP) headers
   - Disable inline scripts and styles
   - Use textContent instead of innerHTML
   - Sanitize user-generated content (questions, answers, chat)

3. **CSRF Protection**:
   - Implement CSRF tokens for all state-changing requests
   - Validate CSRF token on server
   - Use SameSite cookie attribute
   - Implement double-submit cookie pattern
   - Check Origin and Referer headers

4. **Authentication Security**:
   - Password hashing with bcrypt (salt rounds: 12+)
   - Implement rate limiting on login/registration
   - Account lockout after failed attempts
   - Secure password reset flow (expiring tokens)
   - JWT token security (short expiration, signed with strong secret)
   - Implement 2FA (Two-Factor Authentication) option
   - Session management and timeout

5. **Data Encryption**:
   - HTTPS/TLS for all connections
   - Encrypt sensitive data at rest (database)
   - Use environment variables for secrets
   - Never hardcode API keys or secrets
   - Implement field-level encryption for PII
   - Secure database credentials

6. **GDPR Compliance**:
   - Implement user consent management
   - Clear privacy policy
   - Data export functionality (user's data in machine-readable format)
   - Data deletion functionality (right to be forgotten)
   - Data retention policy
   - Cookie consent banner
   - Data processing agreement with third parties
   - Data breach notification procedure

7. **API Security**:
   - Implement rate limiting per endpoint
   - Input validation on all API endpoints
   - Authentication required for protected routes
   - Role-based access control (RBAC)
   - API key management for external integrations
   - Implement API versioning
   - Validate content-type and accept headers

8. **Security Headers**:
   - Set X-Frame-Options: DENY
   - Set X-Content-Type-Options: nosniff
   - Set X-XSS-Protection: 1; mode=block
   - Set Strict-Transport-Security (HSTS)
   - Set Content-Security-Policy (CSP)
   - Set Referrer-Policy
   - Remove X-Powered-By header

9. **Dependency Security**:
   - Regular dependency updates
   - Use npm audit to find vulnerabilities
   - Use Snyk or Dependabot for continuous monitoring
   - Lock package versions
   - Review third-party libraries for security

10. **Error Handling Security**:
    - Never expose stack traces to users
    - Generic error messages
    - Log detailed errors server-side
    - Implement proper HTTP status codes
    - Don't leak sensitive information in error messages

11. **Logging & Auditing**:
    - Log all authentication events
    - Log authorization failures
    - Log data access by admins
    - Implement audit trail for sensitive operations
    - Regular log review process
    - Secure log storage

12. **Secure Configuration**:
    - Disable debug mode in production
    - Use secure cookie flags (httpOnly, secure, sameSite)
    - Implement CORS properly (restrict origins)
    - Disable unnecessary HTTP methods
    - Secure database configuration
    - Disable directory listing

13. **Security Testing**:
    - Regular security audits (pentesting)
    - Automated security scanning
    - Dependency vulnerability scanning
    - Code review for security issues
    - Implement security CI/CD checks

Please implement a robust security posture that protects users and complies with regulations like GDPR.
```

---

## 🏗️ Kekurangan Infrastruktur

### 13. **Deployment & DevOps**
- **Status**: ❌ Manual Only
- **Yang Kurang**:
  - CI/CD pipeline
  - Automated testing
  - Docker containerization
  - Cloud deployment
  - Load balancing
- **Prioritas**: 🟠 HIGH

**🤖 AI Development Prompt:**
```
Implement comprehensive deployment and DevOps infrastructure for Sinaesta:

1. **Docker Containerization**:
   - Create Dockerfile for frontend (multi-stage build)
   - Create Dockerfile for backend (if separate)
   - Create docker-compose.yml for local development
   - Dockerize PostgreSQL/MySQL database
   - Dockerize Redis (if caching implemented)
   - Optimize image sizes (use alpine variants)
   - Implement health checks
   - Volume mounting for data persistence

2. **CI/CD Pipeline** (GitHub Actions or GitLab CI):
   - Setup automated testing on every PR
   - Run linters (ESLint, Prettier)
   - Run type checking (TypeScript)
   - Build verification
   - Security scanning (npm audit, Snyk)
   - Automated deployment to staging on merge
   - Manual approval for production deployment
   - Rollback capability

3. **Environment Management**:
   - Development environment (local)
   - Staging environment (for testing)
   - Production environment (live)
   - Environment-specific configuration
   - .env.example file
   - Secrets management (AWS Secrets Manager or similar)
   - Environment variable validation

4. **Cloud Deployment**:
   - Choose cloud provider: AWS, GCP, Azure, or Vercel/Railway
   - Frontend: Deploy to Vercel/Netlify (CDN) or S3+CloudFront
   - Backend: Deploy to EC2, ECS, or serverless (Lambda)
   - Database: Managed service (RDS, Cloud SQL)
   - Setup SSL/TLS certificates
   - Custom domain configuration
   - CDN setup for static assets

5. **Monitoring & Logging**:
   - Setup application monitoring (New Relic, Datadog, or AWS CloudWatch)
   - Centralized logging (ELK stack, CloudWatch Logs)
   - Error tracking (Sentry)
   - Uptime monitoring (UptimeRobot, Pingdom)
   - Performance monitoring (Lighthouse CI)
   - Alert configuration (Slack, email)

6. **Load Balancing & Scaling**:
   - Setup load balancer (AWS ALB, Nginx)
   - Auto-scaling for application servers
   - Database read replicas
   - Connection pooling
   - CDN for static assets (Cloudflare, AWS CloudFront)
   - Horizontal scaling strategy

7. **Backup Strategy**:
   - Automated daily database backups
   - Backup retention policy (7-30 days)
   - Point-in-time recovery
   - Backup encryption
   - Off-site backup storage
   - Regular backup restoration tests

8. **Infrastructure as Code**:
   - Use Terraform or AWS CloudFormation
   - Version control infrastructure configuration
   - Infrastructure for multiple environments
   - Cost monitoring and optimization
   - Resource tagging

9. **Zero-Downtime Deployment**:
   - Blue-green deployment strategy
   - Rolling updates
   - Database migration strategy
   - Feature flags for gradual rollout
   - Health check endpoints
   - Graceful shutdown handling

10. **Performance Optimization**:
    - Enable Gzip/Brotli compression
    - Configure caching headers
    - Enable HTTP/2 or HTTP/3
    - Optimize database queries
    - Implement connection pooling
    - CDN configuration

11. **Security Hardening**:
    - Firewall rules (security groups)
    - VPC/network isolation
    - Regular security updates
    - WAF (Web Application Firewall)
    - DDoS protection
    - Security headers configuration

12. **Disaster Recovery**:
    - Multi-region deployment (optional)
    - Failover procedures
    - Recovery time objectives (RTO)
    - Recovery point objectives (RPO)
    - Regular disaster recovery drills

Please implement a production-ready deployment pipeline with automated testing, monitoring, and scaling capabilities.
```

### 14. **Backup & Disaster Recovery**
- **Status**: ❌ No Backup
- **Yang Kurang**:
  - Database backup strategy
  - Data recovery procedures
  - Disaster recovery plan
  - Version control for data
- **Prioritas**: 🟠 HIGH

**🤖 AI Development Prompt:**
```
Implement comprehensive backup and disaster recovery strategy for Sinaesta:

1. **Database Backup Strategy**:
   - Automated daily backups at off-peak hours
   - Incremental backups throughout the day
   - Weekly full backups
   - Backup retention policy: daily (7 days), weekly (4 weeks), monthly (12 months)
   - Backup encryption at rest
   - Compress backups to save storage
   - Validate backup integrity after creation
   - Monitor backup success/failure

2. **Backup Storage**:
   - Store backups in multiple regions (if possible)
   - Off-site backup storage (AWS S3, Glacier)
   - Replicate backups to different availability zones
   - Storage cost optimization (lifecycle policies)
   - Secure backup access (IAM roles)

3. **File Backup**:
   - Backup uploaded files and documents
   - Backup configuration files
   - Backup application code (via Git)
   - Backup environment variables (secure storage)
   - Backup SSL certificates

4. **Recovery Procedures**:
   - Document step-by-step recovery procedures
   - Recovery Time Objective (RTO): Target <4 hours
   - Recovery Point Objective (RPO): Target <1 hour data loss
   - Test recovery procedures monthly
   - Create recovery scripts for automation
   - Prioritize critical data (users, exams, results)

5. **Disaster Recovery Plan**:
   - Identify potential disasters (data center outage, cyber attack, natural disaster)
   - Define response team and responsibilities
   - Communication plan (stakeholders, users)
   - Failover procedures to backup systems
   - Business continuity plan
   - Post-disaster review process

6. **Point-in-Time Recovery**:
   - Enable database point-in-time recovery
   - Binary log archiving (MySQL) or WAL archiving (PostgreSQL)
   - Transaction log backups
   - Ability to restore to any specific timestamp

7. **Backup Verification**:
   - Regular backup restoration tests
   - Verify data integrity after restore
   - Test backup and restore speed
   - Document test results and issues
   - Implement backup success monitoring

8. **High Availability Setup**:
   - Database replication (master-slave or multi-primary)
   - Load balancer for application servers
   - Failover to standby systems
   - Health checks and automatic failover
   - DNS failover for quick switch

9. **Data Versioning**:
   - Track changes to critical data
   - Implement soft deletes (mark as deleted, don't remove)
   - Audit trail for data modifications
   - Data change history for exams and questions
   - Rollback capability for accidental changes

10. **Monitoring & Alerting**:
    - Monitor backup job success/failure
    - Alert on backup failures
    - Monitor storage capacity
    - Alert on nearing storage limits
    - Dashboard for backup status

11. **Security**:
    - Encrypt backups at rest
    - Secure backup access with least privilege
    - Regularly rotate backup encryption keys
    - Audit backup access logs
    - Compliance with data retention laws

12. **Documentation**:
    - Detailed disaster recovery documentation
    - Runbooks for common scenarios
    - Contact information for recovery team
    - Service provider contact information
    - Regular documentation updates

Please implement a robust backup and disaster recovery strategy that ensures business continuity and protects against data loss.
```

### 15. **API Documentation**
- **Status**: ❌ No Documentation
- **Yang Kurang**:
  - OpenAPI/Swagger docs
  - API testing tools
  - Integration guides
  - Rate limiting documentation
- **Prioritas**: 🟢 LOW

**🤖 AI Development Prompt:**
```
Implement comprehensive API documentation for Sinaesta:

1. **OpenAPI/Swagger Documentation**:
   - Use Swagger/OpenAPI 3.0 specification
   - Choose library: Swagger UI, Redoc, or Stoplight
   - Document all API endpoints (GET, POST, PUT, DELETE)
   - Define request/response schemas
   - Add authentication requirements (Bearer tokens)
   - Document rate limiting per endpoint
   - Add example requests and responses
   - Include error responses with codes

2. **API Documentation Structure**:
   - Group endpoints by resource (Auth, Users, Exams, Questions, etc.)
   - Provide overview/introduction page
   - Include getting started guide
   - Document authentication flow
   - Add pagination information
   - Include filtering and sorting options
   - Provide code examples in multiple languages (JavaScript, Python, curl)

3. **Interactive Documentation**:
   - Interactive "Try it out" feature
   - Auto-generate from OpenAPI spec
   - Live API testing from docs
   - Real-time response display
   - Request builder interface

4. **Integration Guides**:
   - Quick start guide for developers
   - Authentication tutorial
   - Common use case examples:
     * Create and take an exam
     * Import questions from Excel
     * Get user analytics
     * OSCE simulation flow
   - Best practices guide
   - Error handling guide

5. **Code Examples**:
   - JavaScript/TypeScript examples
   - Python examples
   - cURL examples
   - React integration examples
   - Example applications/tutorials

6. **SDK Generation**:
   - Generate client SDKs from OpenAPI spec
   - Provide TypeScript/JavaScript client
   - Provide Python client
   - Include usage documentation for SDKs
   - Auto-update SDKs on API changes

7. **API Testing Tools**:
   - Integrate Postman collection
   - Provide Postman environment configuration
   - Include test data in collection
   - Document testing procedures
   - Provide sample test scripts

8. **Versioning Documentation**:
   - Document API versioning strategy
   - Maintain documentation for each version
   - Document deprecation notices
   - Migration guides between versions
   - Changelog for API changes

9. **Performance Documentation**:
   - Document rate limits per endpoint
   - Describe caching strategies
   - Provide performance expectations
   - Document best practices for efficiency
   - Batch operation documentation

10. **Security Documentation**:
    - Authentication documentation
    - Authorization examples
    - API key management
    - Security best practices
    - Common security pitfalls

11. **Support Resources**:
    - FAQ section
    - Troubleshooting guide
    - Contact information for support
    - Community forum link (if available)
    - Issue reporting guide

12. **Documentation Deployment**:
    - Host documentation on separate subdomain (docs.example.com)
    - Keep documentation in sync with code
    - Automate documentation updates on deployment
    - Version documentation alongside API
    - Add search functionality

Please create comprehensive, developer-friendly API documentation that makes integration easy and clear.
```

---

## 🎯 Fitur yang Kurang/Belum Lengkap

### 16. **OSCE Virtual Patient**
- **Status**: ⚠️ Mock Implementation
- **Yang Kurang**:
  - Real AI-powered patient responses
  - Voice interaction (Gemini Live)
  - Advanced scenario branching
  - Emotional intelligence
- **Prioritas**: 🟡 MEDIUM

**🤖 AI Development Prompt:**
```
Implement advanced AI-powered OSCE virtual patient simulation for Sinaesta:

1. **AI-Powered Patient Responses**:
   - Integrate Google Gemini Live for real-time conversations
   - Create patient personas with distinct personalities
   - Implement natural language understanding
   - Context-aware responses based on medical questions
   - Dynamic response generation
   - Emotional state modeling
   - Medical knowledge integration

2. **Voice Interaction**:
   - Integrate Web Speech API for speech-to-text
   - Integrate text-to-speech for patient voice
   - Support multiple languages (Bahasa Indonesia, English)
   - Real-time voice processing
   - Voice command support
   - Audio recording for review
   - Voice quality optimization

3. **Advanced Scenario Branching**:
   - Create decision tree-based scenarios
   - Multiple outcome paths based on student actions
   - Dynamic difficulty adjustment
   - Real-time scenario adaptation
   - Branching logic engine
   - Scenario state management
   - Progress tracking per scenario

4. **Emotional Intelligence**:
   - Model patient emotions (anxiety, fear, relief, etc.)
   - Detect student empathy levels
   - Adapt patient responses based on student approach
   - Emotional feedback on interactions
   - Mood tracking throughout scenario
   - Empathy scoring

5. **Scenario Types**:
   - History taking scenarios
   - Physical examination scenarios
   - Breaking bad news scenarios
   - Emergency scenarios
   - Chronic disease management
   - Pediatric scenarios
   - Elderly care scenarios

6. **Performance Evaluation**:
   - Real-time feedback during scenario
   - Post-scenario detailed assessment
   - Score multiple dimensions:
     * Clinical knowledge
     * Communication skills
     * Empathy
     * Professionalism
     * Time management
   - AI-generated feedback report
   - Strengths and weaknesses analysis
   - Improvement suggestions

7. **Patient Variety**:
   - Different ages, genders, ethnicities
   - Various medical conditions
   - Different personalities (cooperative, difficult, anxious)
   - Comorbidities and complex cases
   - Emergency vs. routine cases

8. **Interactive Elements**:
   - Patient avatar or visual representation
   - Vital signs display
   - Medical history view
   - Lab results access
   - Physical exam tools
   - Diagnostic ordering
   - Treatment planning interface

9. **Data Persistence**:
   - Save scenario attempts
   - Track performance over time
   - Scenario completion history
   - Feedback archive
   - Progress statistics
   - Compare attempts across sessions

10. **Mentor Integration**:
    - Allow mentors to review scenario attempts
    - Mentor override of AI feedback
    - Custom scenario creation by mentors
    - Share best scenarios
    - Mentor comments on attempts

11. **Technical Implementation**:
    - Create components/OSCEVirtualPatient.tsx
    - Create services/geminiLiveService.ts for AI integration
    - Implement Web Speech API hooks
    - Create scenario engine with branching logic
    - Implement state machine for patient emotions
    - Real-time feedback UI components

12. **UI/UX**:
    - Clean, professional medical interface
    - Voice interaction controls (mute, pause)
    - Text input as fallback
    - Real-time transcription display
    - Patient emotion indicators
    - Scenario progress indicator
    - Timer for time-limited scenarios

Please implement a sophisticated OSCE simulation with realistic AI-powered virtual patients and comprehensive feedback.
```

### 17. **Advanced Analytics**
- **Status**: ⚠️ Basic Charts
- **Yang Kurang**:
  - Predictive analytics
  - Learning path recommendations
  - Performance forecasting
  - Comparative analysis
- **Prioritas**: 🟢 LOW

**🤖 AI Development Prompt:**
```
Implement advanced analytics and machine learning features for Sinaesta:

1. **Predictive Analytics**:
   - Predict student exam performance
   - Identify at-risk students
   - Predict exam completion probability
   - Forecast learning curve
   - Predict topic mastery timeline
   - Identify knowledge gaps before exams
   - Success probability for specialty selection

2. **Learning Path Recommendations**:
   - AI-powered personalized learning paths
   - Recommend next topics based on performance
   - Adaptive difficulty adjustment
   - Suggest review topics
   - Personalized study schedule
   - Recommend exam order based on progress
   - Suggest OSCE scenarios to practice

3. **Performance Forecasting**:
   - Project future performance based on trends
   - Estimate time to reach goals
   - Predict exam readiness date
   - Forecast specialty qualification
   - Track improvement velocity
   - Compare to peer benchmarks

4. **Comparative Analysis**:
   - Compare performance to peers in same specialty
   - Rank within cohort
   - Benchmark against top performers
   - Identify relative strengths/weaknesses
   - Performance percentile rankings
   - Historical self-comparison

5. **Advanced Metrics**:
   - Knowledge retention tracking
   - Learning efficiency metrics
   - Study time vs. performance correlation
   - Topic mastery progression
   - Exam attempt pattern analysis
   - Flashcard effectiveness metrics

6. **Machine Learning Integration**:
   - Train models on historical student data
   - Feature engineering for predictions
   - Model validation and testing
   - A/B testing for recommendations
   - Model performance monitoring
   - Retraining pipeline

7. **Data Visualization**:
   - Create components/AdvancedAnalytics.tsx
   - Interactive charts with drill-down capability
   - Heatmaps for topic performance
   - Radar charts for skill assessment
   - Progress over time visualizations
   - Comparison charts (peer vs. self)
   - Predictive trend lines

8. **Dashboard Components**:
   - Predictive performance card
   - Learning path recommendations section
   - Peer comparison panel
   - Knowledge gap visualization
   - Study efficiency metrics
   - Growth projections

9. **Export & Reporting**:
   - Detailed analytics reports (PDF)
   - Export data to CSV/Excel
   - Share analytics with mentors
   - Performance certificates
   - Progress tracking over time

10. **Personalization**:
    - Customize analytics dashboard per user
    - Show relevant metrics based on role
    - Specialty-specific analytics
    - Custom time range filters
    - Favorite metrics and charts

11. **Mentor Analytics**:
    - Class performance overview
    - Individual student progress tracking
    - Identify students needing attention
    - Teaching effectiveness metrics
    - Curriculum performance analysis

12. **Technical Implementation**:
    - Create services/analyticsService.ts
    - Implement ML models (TensorFlow.js or Python backend)
    - Create data pipeline for ML features
    - Implement recommendation engine
    - Optimize query performance for large datasets

Please implement advanced analytics with ML-powered insights to help students and mentors make data-driven decisions.
```

### 18. **Collaborative Learning**
- **Status**: ❌ Single User Only
- **Yang Kurang**:
  - Study groups
  - Peer-to-peer discussions
  - Collaborative case solving
  - Group competitions
- **Prioritas**: 🟢 LOW

**🤖 AI Development Prompt:**
```
Implement collaborative learning features for Sinaesta:

1. **Study Groups**:
   - Create study group functionality
   - Group creation and management
   - Invite/join groups by code or link
   - Group-specific resources (exams, flashcards)
   - Group chat/discussion board
   - Shared study schedules
   - Group progress tracking

2. **Peer-to-Peer Discussions**:
   - Create forums/discussion boards
   - Topic-based threads
   - Question and answer format
   - Upvote/downvote helpful answers
   - Best answer marking by mentors
   - Mention/tag other users
   - Rich text formatting
   - Attach files and images

3. **Collaborative Case Solving**:
   - Collaborative case study sessions
   - Real-time collaboration (similar to Google Docs)
   - Shared whiteboard for medical cases
   - Group problem-solving exercises
   - Role-based case assignments
   - Submit group solutions
   - Peer review of solutions

4. **Group Competitions**:
   - Create group exam competitions
   - Leaderboards by group
   - Group challenges and tournaments
   - Collaborative goals
   - Group achievement badges
   - Rewards for top groups

5. **Real-Time Collaboration**:
   - Use WebSocket for real-time updates
   - Live typing indicators
   - Presence indicators (who's online)
   - Live cursors in shared documents
   - Real-time notifications
   - Conflict resolution for simultaneous edits

6. **Social Features**:
   - User profiles with achievements
   - Follow other students
   - Social feed (study activity)
   - Share progress to feed
   - Like and comment on achievements
   - Study buddy suggestions

7. **Group Learning Features**:
   - Share flashcards with group
   - Collaborative flashcard creation
   - Group quiz sessions
   - Study session scheduling
   - Video call integration (optional)
   - Screen sharing for study sessions

8. **Mentor-Guided Groups**:
   - Mentor-led study groups
   - Scheduled mentor sessions
   - Mentor Q&A sessions
   - Mentor-curated group content
   - Progress reports from mentors

9. **Gamification for Collaboration**:
   - Points for helping peers
   - Badges for contributions
   - Reputation system
   - Leaderboard for helpful users
   - Group achievements
   - Collaboration streaks

10. **Privacy & Permissions**:
    - Public vs. private groups
    - Group member management (approve/reject)
    - Moderation tools
    - Report inappropriate content
    - Block/mute users
    - Group content permissions

11. **Components**:
    - Create components/StudyGroups.tsx
    - Create components/DiscussionForum.tsx
    - Create components/GroupChat.tsx
    - Create components/CollaborativeWhiteboard.tsx
    - Create components/Leaderboard.tsx (group version)
    - Create components/UserProfile.tsx

12. **Integration**:
    - Integrate with existing exam system (group exams)
    - Integrate with flashcards (shared decks)
    - Integrate with OSCE (group scenarios)
    - Real-time notifications for collaboration
    - Activity feed in dashboard

Please implement engaging collaborative features that foster peer learning and community building.
```

### 19. **Content Management System**
- **Status**: ⚠️ Basic Admin Panel
- **Yang Kurang**:
  - Rich text editor for content
  - Media library management
  - Version control for questions
  - Content approval workflow
- **Prioritas**: 🟡 MEDIUM

**🤖 AI Development Prompt:**
```
Implement a comprehensive content management system for Sinaesta:

1. **Rich Text Editor**:
   - Integrate a rich text editor (TinyMCE, Quill, or Tiptap)
   - Support for:
     * Text formatting (bold, italic, underline, etc.)
     * Headings (H1-H6)
     * Lists (ordered, unordered)
     * Links
     * Images (upload or URL)
     * Tables
     * Code blocks
     * Math equations (LaTeX support for medical formulas)
   - Create custom toolbar with medical-specific tools
   - Implement image resizing in editor
   - Add spell check
   - Word count character count

2. **Media Library Management**:
   - Create components/MediaLibrary.tsx
   - Upload and manage images, videos, documents
   - Organize media in folders
   - Search and filter media
   - Drag and drop upload
   - Image editing (crop, resize, rotate)
   - Alt text for accessibility
   - Media usage tracking
   - Delete unused media
   - Bulk operations

3. **Version Control for Content**:
   - Track all versions of questions and exams
   - View version history
   - Compare versions side-by-side
   - Revert to previous versions
   - Version notes/commit messages
   - Version author attribution
   - Timestamp for each version
   - Draft vs. published versions

4. **Content Approval Workflow**:
   - Draft content creation
   - Submit for review
   - Review queue for mentors/admins
   - Approve or reject content
   - Request changes with comments
   - Publish approved content
   - Multi-stage approval (review → approve → publish)
   - Email notifications for reviewers

5. **Content Organization**:
   - Tag system for content
   - Categories and subcategories
   - Difficulty levels
   - Specialty classification
   - Custom metadata fields
   - Content search with filters
   - Content bulk editing
   - Import/export content

6. **Collaboration Tools**:
   - Multiple editors for content
   - Comments on content drafts
   - Assign content to reviewers
   - Content ownership tracking
   - Co-author attribution
   - Real-time collaboration (optional)

7. **Content Templates**:
   - Question templates by type
   - Exam templates
   - OSCE scenario templates
   - Custom template creation
   - Template library
   - Quick create from template

8. **Content Analytics**:
   - Track content usage (exam usage, success rate)
   - Identify popular questions
   - Identify poorly performing questions
   - Content engagement metrics
   - Review frequency analytics
   - Content quality scores

9. **Content Export/Import**:
   - Export content to various formats (JSON, CSV, Excel, PDF)
   - Import content from external sources
   - Bulk import questions
   - Validate imported content
   - Migration tools

10. **Permissions & Access**:
    - Role-based content permissions
    - Content owner rights
    - Reviewer permissions
    - Publisher permissions
    - Content visibility settings
    - Specialty-based access control

11. **Components**:
    - Create components/ContentEditor.tsx with rich text editor
    - Create components/MediaLibrary.tsx
    - Create components/ContentVersionHistory.tsx
    - Create components/ContentApprovalQueue.tsx
    - Create components/ContentTemplates.tsx
    - Create components/ContentAnalytics.tsx

12. **Integration**:
    - Integrate with ExamCreator (use rich text editor)
    - Integrate with OSCE scenario editor
    - Integrate with flashcard creation
    - Media library integration across all content areas
    - Version control for all editable content

Please implement a powerful CMS that makes content creation, review, and management efficient and collaborative.
```

### 20. **Accessibility Features**
- **Status**: ❌ Not Implemented
- **Yang Kurang**:
  - Screen reader support
  - Keyboard navigation
  - High contrast mode
  - Text-to-speech
- **Prioritas**: 🟢 LOW

**🤖 AI Development Prompt:**
```
Implement comprehensive accessibility features for Sinaesta to ensure WCAG 2.1 AA compliance:

1. **Screen Reader Support**:
   - Implement proper ARIA labels and roles
   - Use semantic HTML elements
   - Add descriptive alt text for all images
   - Implement live regions for dynamic content
   - Add aria-labels for interactive elements without text
   - Ensure proper heading hierarchy (h1-h6)
   - Add descriptive link text (avoid "click here")
   - Test with NVDA, JAWS, VoiceOver, and TalkBack

2. **Keyboard Navigation**:
   - Ensure all functionality is keyboard accessible
   - Implement visible focus indicators (outline, background color)
   - Support Tab, Shift+Tab, Enter, Space, Escape keys
   - Skip navigation links
   - Logical tab order (visual and DOM order match)
   - Keyboard shortcuts for common actions
   - Focus trap in modals
   - Handle keyboard focus after dynamic content changes

3. **High Contrast Mode**:
   - Create high contrast theme option
   - Ensure 4.5:1 contrast ratio for normal text
   - Ensure 3:1 contrast ratio for large text
   - Ensure 3:1 contrast ratio for UI components
   - Test contrast with color blindness simulators
   - Don't rely on color alone to convey information
   - Add text labels alongside color-coded elements

4. **Text-to-Speech**:
   - Integrate Web Speech API for text-to-speech
   - Add TTS controls (play, pause, stop)
   - Support for exam questions and answers
   - Read aloud for feedback and instructions
   - Voice speed control
   - Multiple language support
   - Visual indicator when TTS is active

5. **Visual Accessibility**:
   - Resizable text (up to 200% without breaking layout)
   - Scalable vector icons (SVG)
   - Responsive design for different screen sizes
   - Consistent and predictable layout
   - Clear and readable fonts (sans-serif, adequate size)
   - Sufficient line height and letter spacing
   - Avoid automatic content (no flashing, no auto-play video/audio)

6. **Motion & Animation**:
   - Respect prefers-reduced-motion media query
   - Provide option to disable animations
   - No automatic animations longer than 5 seconds
   - Pause, stop, hide controls for moving content
   - No content that flashes more than 3 times per second

7. **Forms Accessibility**:
   - Associated labels for all form inputs
   - Required field indicators
   - Error messages linked to inputs (aria-describedby)
   - Inline validation feedback
   - Clear error messages
   - Success states with confirmation
   - Autocomplete attributes where appropriate

8. **Color Blindness Support**:
   - Ensure color is not the only indicator
   - Use patterns, icons, or text alongside colors
   - Test with deuteranopia, protanopia, tritanopia simulators
   - Provide alternative visual indicators
   - Avoid red/green for critical information
   - Use colorblind-friendly color palettes

9. **Audio Accessibility**:
   - Captions for all video content
   - Transcripts for audio content
   - Visual indicators for audio events
   - Volume controls for all audio
   - No auto-playing audio/video
   - Alternative for audio-only content

10. **Accessibility Testing**:
    - Automated testing with axe-core or Lighthouse
    - Manual testing with keyboard
    - Screen reader testing
    - Color blindness testing
    - Real user testing with disabilities
    - Regular accessibility audits

11. **Accessibility Settings**:
    - Create components/AccessibilitySettings.tsx
    - High contrast toggle
    - Text size slider
    - Disable animations toggle
    - TTS toggle and controls
    - Screen reader hints toggle
    - Persist accessibility preferences

12. **Documentation**:
    - Accessibility statement page
    - Keyboard shortcut guide
    - Screen reader instructions
    - Known accessibility limitations
    - Contact for accessibility issues
    - Accessibility features list

Please ensure Sinaesta is usable by everyone regardless of disability, following WCAG 2.1 AA guidelines.
```

---

## 📋 Summary Prioritas

### 🔴 CRITICAL (Wajib Segera)
1. Backend & Database
2. Authentication System
3. Testing Framework

### 🟠 HIGH (Segera)
4. API & Data Management
5. File Upload/Storage
6. Real-time Features
7. Deployment & DevOps
8. Backup & Recovery

### 🟡 MEDIUM (Nanti)
9. Email Notifications
10. Payment System
11. Security & Compliance
12. Content Management
13. OSCE Enhancement
14. Advanced Analytics

### 🟢 LOW (Bila Ada Waktu)
15. Performance Optimization
16. Mobile Enhancement
17. Collaborative Learning
18. Accessibility
19. API Documentation
20. Advanced AI Features

---

## 💡 Rekomendasi Pengembangan

### Phase 1: Foundation (1-2 bulan)
- Setup backend (Node.js + Express + PostgreSQL)
- Implement real authentication
- Create basic API endpoints
- Setup testing framework

### Phase 2: Core Features (2-3 bulan)
- File upload & storage
- Email notifications
- Real-time features (WebSocket)
- Payment integration

### Phase 3: Enhancement (3-6 bulan)
- Advanced analytics
- Mobile optimization
- Security hardening
- Performance optimization

### Phase 4: Advanced Features (6+ bulan)
- AI enhancements
- Collaborative features
- Accessibility
- Enterprise features

---

*Dokumen ini dibuat berdasarkan analisis codebase Sinaesta pada tanggal 22 Januari 2025*