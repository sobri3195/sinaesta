# API Service Layer Documentation

Comprehensive API service layer and data management system for Sinaesta platform.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [API Client](#api-client)
3. [API Endpoints](#api-endpoints)
4. [Custom Hooks](#custom-hooks)
5. [State Management](#state-management)
6. [Error Handling](#error-handling)
7. [Caching Strategy](#caching-strategy)
8. [Usage Examples](#usage-examples)
9. [Best Practices](#best-practices)

## Architecture Overview

The API service layer follows a modular architecture:

```
services/
├── apiClient.ts          # Enhanced axios-based API client
├── apiService.ts         # Legacy service (for compatibility)
├── authService.ts        # Authentication service
└── endpoints/            # Typed API endpoint modules
    ├── authEndpoints.ts
    ├── userEndpoints.ts
    ├── examEndpoints.ts
    ├── resultEndpoints.ts
    ├── flashcardEndpoints.ts
    ├── osceEndpoints.ts
    └── analyticsEndpoints.ts

hooks/
├── useQuery.ts           # GET requests with caching
├── useMutation.ts        # POST/PUT/DELETE operations
└── useApi.ts             # Pre-configured API hooks

stores/
├── authStore.ts          # Authentication state
├── examStore.ts          # Exam data cache
└── uiStore.ts            # UI state (modals, toasts, loading)

types/
└── api.ts                # Comprehensive API type definitions
```

## API Client

The `ApiClient` class provides:

- **Automatic token refresh** - Handles 401 errors and refreshes tokens seamlessly
- **Request/response interceptors** - Centralized logging and error handling
- **Retry logic** - Exponential backoff for failed requests
- **Request deduplication** - Prevents duplicate simultaneous requests
- **Response caching** - Configurable cache with TTL
- **Offline detection** - Queues requests when offline
- **Request cancellation** - Automatic cleanup on component unmount

### Configuration

```typescript
import { ApiClient } from './services/apiClient';

const apiClient = new ApiClient({
  baseURL: 'http://localhost:3001/api',
  timeout: 30000,
  enableCache: true,
  cacheTTL: 5 * 60 * 1000,
  enableRetry: true,
  maxRetries: 3,
  retryDelay: 1000,
  enableDeduplication: true,
  enableLogging: true
});
```

### Methods

```typescript
// Basic methods
apiClient.get<T>(url, config)
apiClient.post<T>(url, data, config)
apiClient.put<T>(url, data, config)
apiClient.patch<T>(url, data, config)
apiClient.delete<T>(url, config)

// File upload with progress
apiClient.uploadFile<T>(url, file, onProgress)

// Cache management
apiClient.clearCache(pattern?)

// Custom request
apiClient.request<T>(config)
```

## API Endpoints

Typed API endpoint modules organized by domain:

### Auth Endpoints

```typescript
import { authEndpoints } from './services/endpoints';

// Login
const response = await authEndpoints.login({
  email: 'user@example.com',
  password: 'password123'
});

// Register
const response = await authEndpoints.register({
  email: 'user@example.com',
  password: 'password123',
  name: 'John Doe',
  role: 'STUDENT'
});

// Logout
await authEndpoints.logout({ refreshToken });

// Refresh token
const response = await authEndpoints.refreshToken({ refreshToken });

// Password reset
await authEndpoints.forgotPassword({ email: 'user@example.com' });
await authEndpoints.resetPassword({ token, password: 'newpassword' });

// Email verification
await authEndpoints.verifyEmail({ token });
```

### Exam Endpoints

```typescript
import { examEndpoints } from './services/endpoints';

// Get exams list
const { exams, total } = await examEndpoints.getExams({
  specialty: 'Cardiology',
  difficulty: 'Medium',
  page: 1,
  limit: 10
});

// Get single exam
const exam = await examEndpoints.getExam(examId);

// Create exam
const exam = await examEndpoints.createExam({
  title: 'Cardiology Exam',
  description: 'Advanced cardiology assessment',
  durationMinutes: 60,
  topic: 'Cardiology',
  difficulty: 'Medium'
});

// Update exam
const exam = await examEndpoints.updateExam(examId, { title: 'Updated Title' });

// Delete exam
await examEndpoints.deleteExam(examId);

// Submit exam
const result = await examEndpoints.submitExam(examId, {
  answers: [0, 1, 2, 3],
  auditLog: []
});
```

### User Endpoints

```typescript
import { userEndpoints } from './services/endpoints';

// Get current user
const user = await userEndpoints.getCurrentUser();

// Get user by ID
const user = await userEndpoints.getUser(userId);

// Get all users (admin)
const { users, total } = await userEndpoints.getUsers({
  role: 'STUDENT',
  page: 1,
  limit: 20
});

// Update user
const user = await userEndpoints.updateUser(userId, {
  name: 'Updated Name',
  targetSpecialty: 'Cardiology'
});

// Delete user
await userEndpoints.deleteUser(userId);
```

### Result Endpoints

```typescript
import { resultEndpoints } from './services/endpoints';

// Get my results
const { results, total } = await resultEndpoints.getMyResults({
  page: 1,
  limit: 10
});

// Get result details
const result = await resultEndpoints.getResult(resultId);

// Get all results (admin)
const { results, total } = await resultEndpoints.getAllResults({
  userId,
  examId,
  page: 1
});

// Get statistics
const stats = await resultEndpoints.getResultStats({
  examId,
  specialty: 'Cardiology'
});
```

### Flashcard Endpoints

```typescript
import { flashcardEndpoints } from './services/endpoints';

// Get flashcards
const { flashcards, total } = await flashcardEndpoints.getFlashcards({
  category: 'Cardiology',
  mastered: false
});

// Create flashcard
const flashcard = await flashcardEndpoints.createFlashcard({
  front: 'What is the normal heart rate?',
  back: '60-100 bpm',
  category: 'Cardiology'
});

// Update flashcard
const flashcard = await flashcardEndpoints.updateFlashcard(id, {
  mastered: true
});

// Delete flashcard
await flashcardEndpoints.deleteFlashcard(id);

// Get decks
const decks = await flashcardEndpoints.getFlashcardDecks();

// Create deck
const deck = await flashcardEndpoints.createFlashcardDeck({
  title: 'Cardiology Basics',
  topic: 'Cardiology',
  cards: []
});
```

### OSCE Endpoints

```typescript
import { osceEndpoints } from './services/endpoints';

// Get stations
const { stations, total } = await osceEndpoints.getOSCEStations({
  specialty: 'Internal Medicine'
});

// Create station
const station = await osceEndpoints.createOSCEStation({
  title: 'History Taking - Chest Pain',
  scenario: 'Patient presents with chest pain...',
  instruction: 'Take focused history...',
  durationMinutes: 10,
  checklist: []
});

// Submit attempt
const attempt = await osceEndpoints.submitOSCEAttempt({
  stationId,
  performance: {
    checklistScores: []
  }
});

// Get history
const attempts = await osceEndpoints.getOSCEHistory(userId);
```

### Analytics Endpoints

```typescript
import { analyticsEndpoints } from './services/endpoints';

// Get user stats
const stats = await analyticsEndpoints.getUserStats({
  userId,
  period: 'month'
});

// Get exam stats
const stats = await analyticsEndpoints.getExamStats(examId);

// Get performance trends
const trends = await analyticsEndpoints.getPerformanceTrends({
  userId,
  period: 'month',
  granularity: 'week'
});
```

## Custom Hooks

### useQuery Hook

For GET requests with caching and automatic refetching:

```typescript
import { useQuery } from './hooks/useQuery';

function MyComponent() {
  const { data, isLoading, isError, error, refetch } = useQuery(
    'exams', // Cache key
    () => examEndpoints.getExams(), // Query function
    {
      enabled: true, // Enable/disable query
      refetchOnWindowFocus: true, // Refetch on window focus
      refetchInterval: 30000, // Refetch every 30 seconds
      cacheTime: 5 * 60 * 1000, // Cache for 5 minutes
      staleTime: 60000, // Consider stale after 1 minute
      retry: 3, // Retry 3 times on failure
      onSuccess: (data) => console.log('Success!', data),
      onError: (error) => console.error('Error!', error)
    }
  );

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error?.message}</div>;

  return <div>{/* Render data */}</div>;
}
```

### useMutation Hook

For POST/PUT/DELETE operations with optimistic updates:

```typescript
import { useMutation } from './hooks/useMutation';
import { clearQueryCache } from './hooks/useQuery';

function MyComponent() {
  const { mutate, mutateAsync, isLoading, isError, error, isSuccess } = useMutation(
    examEndpoints.createExam,
    {
      onMutate: async (variables) => {
        // Optimistic update - cancel queries and snapshot current state
        return { previousExams: /* snapshot */ };
      },
      onSuccess: (data, variables, context) => {
        console.log('Exam created!', data);
      },
      onError: (error, variables, context) => {
        console.error('Failed to create exam', error);
        // Roll back optimistic update
      },
      onSettled: (data, error, variables, context) => {
        // Always run after success or error
      },
      retry: 2,
      invalidateQueries: ['exams'] // Clear cache for these queries
    }
  );

  const handleCreate = () => {
    mutate({
      title: 'New Exam',
      description: 'Description',
      durationMinutes: 60,
      topic: 'Cardiology',
      difficulty: 'Medium'
    });
  };

  return <button onClick={handleCreate}>Create Exam</button>;
}
```

### Pre-configured API Hooks

```typescript
import {
  useLogin,
  useRegister,
  useLogout,
  useExams,
  useExam,
  useCreateExam,
  useUpdateExam,
  useDeleteExam,
  useSubmitExam,
  useFlashcards,
  useCreateFlashcard,
  useOSCEStations,
  useSubmitOSCEAttempt,
  useMyResults,
  useUserStats
} from './hooks/useApi';

function ExamsPage() {
  // Get exams with automatic caching
  const { data: examsData, isLoading, refetch } = useExams({
    specialty: 'Cardiology',
    page: 1,
    limit: 10
  });

  // Create exam mutation
  const createExam = useCreateExam({
    onSuccess: () => {
      console.log('Exam created!');
      refetch(); // Refetch exams list
    }
  });

  // Delete exam mutation
  const deleteExam = useDeleteExam({
    onSuccess: () => {
      refetch();
    }
  });

  return (
    <div>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div>
          {examsData?.exams.map((exam) => (
            <div key={exam.id}>
              {exam.title}
              <button onClick={() => deleteExam.mutate(exam.id)}>
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

## State Management

### Auth Store

```typescript
import { useAuthStore } from './stores/authStore';

function MyComponent() {
  const { user, isAuthenticated, setAuth, clearAuth } = useAuthStore();

  const handleLogin = async () => {
    const response = await authEndpoints.login(credentials);
    setAuth(response.user, response.accessToken, response.refreshToken);
  };

  const handleLogout = () => {
    clearAuth();
  };

  return (
    <div>
      {isAuthenticated ? (
        <div>Welcome, {user?.name}!</div>
      ) : (
        <div>Please log in</div>
      )}
    </div>
  );
}
```

### Exam Store

```typescript
import { useExamStore } from './stores/examStore';

function ExamsPage() {
  const {
    filters,
    setFilters,
    selectedExam,
    setSelectedExam,
    updateExam,
    removeExam
  } = useExamStore();

  return (
    <div>
      <input
        value={filters.search || ''}
        onChange={(e) => setFilters({ search: e.target.value })}
      />
    </div>
  );
}
```

### UI Store

```typescript
import { useUIStore } from './stores/uiStore';

function MyComponent() {
  const { addToast, openModal, setLoading } = useUIStore();

  const handleAction = async () => {
    setLoading('myAction', true);
    try {
      await someApiCall();
      addToast({
        type: 'success',
        message: 'Action completed successfully!'
      });
    } catch (error) {
      addToast({
        type: 'error',
        message: 'Action failed!'
      });
    } finally {
      setLoading('myAction', false);
    }
  };

  return <button onClick={handleAction}>Do Action</button>;
}

// Toast component
function ToastContainer() {
  const { toasts, removeToast } = useUIStore();

  return (
    <div className="fixed top-4 right-4 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`p-4 rounded ${toast.type}`}
          onClick={() => removeToast(toast.id)}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
```

## Error Handling

### ApiError Class

```typescript
import { ApiError, ApiErrorCode } from './services/apiClient';

try {
  await examEndpoints.getExam(examId);
} catch (error) {
  if (error instanceof ApiError) {
    console.log('Error code:', error.code);
    console.log('Status code:', error.statusCode);
    console.log('Message:', error.message);
    console.log('Is retryable:', error.isRetryable);
    console.log('Details:', error.details);
  }
}
```

### Error Codes

- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Insufficient permissions
- `TOKEN_EXPIRED` - Access token expired
- `INVALID_CREDENTIALS` - Invalid email/password
- `VALIDATION_ERROR` - Input validation failed
- `NOT_FOUND` - Resource not found
- `ALREADY_EXISTS` - Resource already exists
- `CONFLICT` - Resource conflict
- `INTERNAL_ERROR` - Server error
- `SERVICE_UNAVAILABLE` - Service temporarily unavailable
- `TIMEOUT` - Request timeout
- `NETWORK_ERROR` - Network connection error
- `OFFLINE` - No internet connection
- `RATE_LIMIT_EXCEEDED` - Too many requests

## Caching Strategy

### Query Cache

The `useQuery` hook automatically caches GET requests:

```typescript
// Cache configuration
const { data } = useQuery('exams', fetchExams, {
  cacheTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  staleTime: 60000, // Consider stale after 1 minute
});
```

### Manual Cache Management

```typescript
import { clearQueryCache } from './hooks/useQuery';

// Clear all cache
clearQueryCache();

// Clear specific pattern
clearQueryCache('exams');
```

### API Client Cache

```typescript
import { apiClient } from './services/apiClient';

// Clear all cache
apiClient.clearCache();

// Clear specific pattern
apiClient.clearCache('exams');
```

## Usage Examples

### Complete Login Flow

```typescript
import { useLogin } from './hooks/useApi';
import { useAuthStore } from './stores/authStore';
import { useUIStore } from './stores/uiStore';

function LoginForm() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const addToast = useUIStore((state) => state.addToast);

  const login = useLogin({
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken);
      addToast({
        type: 'success',
        message: 'Login successful!'
      });
    },
    onError: (error) => {
      addToast({
        type: 'error',
        message: error.message || 'Login failed'
      });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    login.mutate({
      email: e.target.email.value,
      password: e.target.password.value
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      <button type="submit" disabled={login.isLoading}>
        {login.isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

### Complete Exam Management

```typescript
import { useExams, useCreateExam, useDeleteExam } from './hooks/useApi';
import { useExamStore } from './stores/examStore';
import { useUIStore } from './stores/uiStore';

function ExamsPage() {
  const filters = useExamStore((state) => state.filters);
  const setFilters = useExamStore((state) => state.setFilters);
  const addToast = useUIStore((state) => state.addToast);

  const { data, isLoading, refetch } = useExams(filters);

  const createExam = useCreateExam({
    onSuccess: () => {
      addToast({ type: 'success', message: 'Exam created!' });
      refetch();
    }
  });

  const deleteExam = useDeleteExam({
    onSuccess: () => {
      addToast({ type: 'success', message: 'Exam deleted!' });
      refetch();
    }
  });

  return (
    <div>
      <input
        placeholder="Search..."
        value={filters.search || ''}
        onChange={(e) => setFilters({ search: e.target.value })}
      />

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div>
          {data?.exams.map((exam) => (
            <div key={exam.id}>
              <h3>{exam.title}</h3>
              <button onClick={() => deleteExam.mutate(exam.id)}>
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

## Best Practices

### 1. Use Custom Hooks

Always prefer custom hooks over direct API calls:

```typescript
// ❌ Don't
const exams = await examEndpoints.getExams();

// ✅ Do
const { data: exams } = useExams();
```

### 2. Handle Loading and Error States

```typescript
function MyComponent() {
  const { data, isLoading, isError, error } = useExams();

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorMessage error={error} />;

  return <div>{/* Render data */}</div>;
}
```

### 3. Use Optimistic Updates

```typescript
const updateExam = useUpdateExam({
  onMutate: async ({ id, data }) => {
    // Snapshot current state
    const previous = examStore.getState().selectedExam;
    
    // Optimistically update UI
    examStore.getState().updateExam(id, data);
    
    return { previous };
  },
  onError: (error, variables, context) => {
    // Roll back on error
    if (context?.previous) {
      examStore.getState().setSelectedExam(context.previous);
    }
  }
});
```

### 4. Invalidate Related Queries

```typescript
const createExam = useCreateExam({
  invalidateQueries: ['exams', 'userStats']
});
```

### 5. Use Toast Notifications

```typescript
const addToast = useUIStore((state) => state.addToast);

try {
  await someAction();
  addToast({ type: 'success', message: 'Success!' });
} catch (error) {
  addToast({ type: 'error', message: 'Error!' });
}
```

### 6. Persist Important State

Auth and exam stores use Zustand's persist middleware to maintain state across refreshes.

### 7. Type Everything

Always use TypeScript types for better development experience:

```typescript
import type { Exam, CreateExamRequest } from './types';

const { data } = useExams(); // data is typed as GetExamsResponse
const createExam = useCreateExam(); // accepts CreateExamRequest
```

### 8. Handle Offline Scenarios

The API client automatically detects offline state and queues requests:

```typescript
try {
  await examEndpoints.createExam(data);
} catch (error) {
  if (error.code === ApiErrorCode.OFFLINE) {
    // Handle offline scenario
  }
}
```

### 9. Use Cache Wisely

Configure cache based on data volatility:

```typescript
// Frequently changing data - short cache
const { data } = useResults({}, { cacheTime: 30000 });

// Rarely changing data - long cache
const { data } = useOSCEStations({}, { cacheTime: 10 * 60 * 1000 });
```

### 10. Clean Up on Unmount

The hooks automatically handle cleanup, but for manual requests:

```typescript
useEffect(() => {
  const controller = new AbortController();
  
  fetchData(controller.signal);
  
  return () => controller.abort();
}, []);
```

## Migration from Old API Service

If migrating from the old `apiService.ts`:

```typescript
// Old
import { apiService } from './services/apiService';
const exams = await apiService.getExams();

// New
import { useExams } from './hooks/useApi';
const { data: exams } = useExams();

// Or direct endpoint usage
import { examEndpoints } from './services/endpoints';
const exams = await examEndpoints.getExams();
```

The old `apiService.ts` is maintained for backward compatibility but new code should use the new API layer.

## Performance Tips

1. **Use pagination** - Always paginate large datasets
2. **Debounce search** - Debounce search inputs to reduce API calls
3. **Memoize expensive computations** - Use React.useMemo for expensive operations
4. **Lazy load components** - Use React.lazy for code splitting
5. **Optimize re-renders** - Use proper React hooks dependencies
6. **Cache aggressively** - Long cache times for static data
7. **Batch requests** - Combine multiple requests when possible
8. **Use request deduplication** - Enabled by default in apiClient

## Troubleshooting

### Token Refresh Issues

If you experience token refresh loops:

```typescript
// Check token expiry
const token = localStorage.getItem('accessToken');
console.log('Token:', token);

// Clear auth and re-login
useAuthStore.getState().clearAuth();
```

### Cache Issues

If you see stale data:

```typescript
import { clearQueryCache } from './hooks/useQuery';
clearQueryCache(); // Clear all cache
```

### Network Issues

Check network connectivity:

```typescript
if (!navigator.onLine) {
  console.log('Offline');
}
```

Enable debug logging:

```typescript
// In development, logs are enabled by default
// Check browser console for API logs
```

## API Response Formats

All API responses follow this format:

```typescript
// Success response
{
  success: true,
  data: { /* response data */ }
}

// Error response
{
  success: false,
  error: "Error message",
  code: "ERROR_CODE",
  details: { /* additional error details */ }
}

// Paginated response
{
  success: true,
  data: {
    items: [ /* array of items */ ],
    total: 100,
    page: 1,
    limit: 10,
    totalPages: 10
  }
}
```

## License

This API service layer is part of the Sinaesta platform.
