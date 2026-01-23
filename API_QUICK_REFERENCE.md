# API Service Layer - Quick Reference

Quick reference guide for the Sinaesta API service layer.

## Table of Contents

- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Common Patterns](#common-patterns)
- [Cheat Sheet](#cheat-sheet)

## Installation

Dependencies are already installed. If needed:

```bash
npm install zustand axios
```

## Basic Usage

### 1. Simple Query

```typescript
import { useExams } from './hooks/useApi';

function MyComponent() {
  const { data, isLoading, error } = useExams();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>{data?.exams.length} exams found</div>;
}
```

### 2. Simple Mutation

```typescript
import { useCreateExam } from './hooks/useApi';
import { useUIStore } from './stores/uiStore';

function CreateExamButton() {
  const addToast = useUIStore(state => state.addToast);
  const createExam = useCreateExam({
    onSuccess: () => addToast({ type: 'success', message: 'Created!' })
  });
  
  return (
    <button onClick={() => createExam.mutate(examData)}>
      Create Exam
    </button>
  );
}
```

### 3. Authentication

```typescript
import { useLogin } from './hooks/useApi';
import { useAuthStore } from './stores/authStore';

function LoginForm() {
  const setAuth = useAuthStore(state => state.setAuth);
  const login = useLogin({
    onSuccess: (data) => setAuth(data.user, data.accessToken, data.refreshToken)
  });
  
  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      login.mutate({ email, password });
    }}>
      {/* form fields */}
    </form>
  );
}
```

## Common Patterns

### Fetch and Display List

```typescript
import { useExams } from './hooks/useApi';
import { useExamStore } from './stores/examStore';

function ExamsList() {
  const filters = useExamStore(state => state.filters);
  const { data, isLoading } = useExams(filters);
  
  return (
    <div>
      {isLoading ? <Loader /> : (
        data?.exams.map(exam => <ExamCard key={exam.id} exam={exam} />)
      )}
    </div>
  );
}
```

### Search with Filters

```typescript
import { useExams } from './hooks/useApi';
import { useExamStore } from './stores/examStore';

function ExamsFilter() {
  const { filters, setFilters } = useExamStore();
  const { data, refetch } = useExams(filters);
  
  return (
    <div>
      <input
        value={filters.search || ''}
        onChange={(e) => setFilters({ search: e.target.value })}
      />
      <select
        value={filters.difficulty || ''}
        onChange={(e) => setFilters({ difficulty: e.target.value })}
      >
        <option value="">All</option>
        <option value="Easy">Easy</option>
        <option value="Medium">Medium</option>
        <option value="Hard">Hard</option>
      </select>
      <button onClick={() => refetch()}>Refresh</button>
    </div>
  );
}
```

### Create with Form

```typescript
import { useState } from 'react';
import { useCreateExam } from './hooks/useApi';

function CreateExamForm() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    topic: '',
    difficulty: 'Medium',
    durationMinutes: 60
  });
  
  const createExam = useCreateExam({
    onSuccess: () => {
      alert('Exam created!');
      setFormData({ /* reset */ });
    }
  });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    createExam.mutate(formData);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        placeholder="Title"
      />
      {/* other fields */}
      <button type="submit" disabled={createExam.isLoading}>
        {createExam.isLoading ? 'Creating...' : 'Create'}
      </button>
    </form>
  );
}
```

### Update with Optimistic UI

```typescript
import { useUpdateExam } from './hooks/useApi';
import { useExamStore } from './stores/examStore';

function ExamEditForm({ examId }) {
  const updateExam = useUpdateExam({
    onMutate: ({ id, data }) => {
      // Optimistically update UI
      useExamStore.getState().updateExam(id, data);
    },
    onError: (error, { id }, context) => {
      // Rollback on error
      console.error('Update failed', error);
    },
    onSuccess: () => {
      alert('Exam updated!');
    }
  });
  
  const handleUpdate = (newTitle) => {
    updateExam.mutate({
      id: examId,
      data: { title: newTitle }
    });
  };
  
  return <div>{/* form */}</div>;
}
```

### Delete with Confirmation

```typescript
import { useDeleteExam } from './hooks/useApi';
import { useUIStore } from './stores/uiStore';

function DeleteExamButton({ examId }) {
  const addToast = useUIStore(state => state.addToast);
  const deleteExam = useDeleteExam({
    onSuccess: () => {
      addToast({ type: 'success', message: 'Exam deleted!' });
    },
    onError: (error) => {
      addToast({ type: 'error', message: 'Failed to delete exam' });
    }
  });
  
  const handleDelete = () => {
    if (confirm('Are you sure?')) {
      deleteExam.mutate(examId);
    }
  };
  
  return (
    <button onClick={handleDelete} disabled={deleteExam.isLoading}>
      {deleteExam.isLoading ? 'Deleting...' : 'Delete'}
    </button>
  );
}
```

### Submit Form with Loading State

```typescript
import { useSubmitExam } from './hooks/useApi';
import { useUIStore } from './stores/uiStore';

function ExamTaker({ examId, answers }) {
  const setLoading = useUIStore(state => state.setLoading);
  const submitExam = useSubmitExam({
    onMutate: () => setLoading('submit', true),
    onSettled: () => setLoading('submit', false),
    onSuccess: (result) => {
      console.log('Score:', result.score);
    }
  });
  
  const handleSubmit = () => {
    submitExam.mutate({ examId, data: { answers } });
  };
  
  return <button onClick={handleSubmit}>Submit Exam</button>;
}
```

### Display Toast Notifications

```typescript
import { useUIStore } from './stores/uiStore';

function ToastContainer() {
  const toasts = useUIStore(state => state.toasts);
  const removeToast = useUIStore(state => state.removeToast);
  
  return (
    <div className="fixed top-4 right-4 space-y-2 z-50">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`p-4 rounded shadow-lg ${
            toast.type === 'success' ? 'bg-green-500' :
            toast.type === 'error' ? 'bg-red-500' :
            toast.type === 'warning' ? 'bg-yellow-500' :
            'bg-blue-500'
          } text-white cursor-pointer`}
          onClick={() => removeToast(toast.id)}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
```

### Conditional Queries

```typescript
import { useExam } from './hooks/useApi';

function ExamDetails({ examId }) {
  const { data, isLoading } = useExam(examId, {
    enabled: !!examId // Only fetch if examId exists
  });
  
  if (!examId) return <div>No exam selected</div>;
  if (isLoading) return <div>Loading...</div>;
  
  return <div>{data?.title}</div>;
}
```

### Polling/Auto-refresh

```typescript
import { useMyResults } from './hooks/useApi';

function ResultsPage() {
  const { data, refetch } = useMyResults({}, {
    refetchInterval: 30000, // Refetch every 30 seconds
    refetchOnWindowFocus: true // Refetch when window gains focus
  });
  
  return <div>{/* results */}</div>;
}
```

## Cheat Sheet

### Hooks

| Hook | Purpose | Example |
|------|---------|---------|
| `useQuery` | GET requests with caching | `useQuery('key', fn, options)` |
| `useMutation` | POST/PUT/DELETE operations | `useMutation(fn, options)` |
| `useExams` | Get exams list | `useExams(filters)` |
| `useExam` | Get single exam | `useExam(id)` |
| `useCreateExam` | Create exam | `useCreateExam(options)` |
| `useUpdateExam` | Update exam | `useUpdateExam(options)` |
| `useDeleteExam` | Delete exam | `useDeleteExam(options)` |
| `useSubmitExam` | Submit exam answers | `useSubmitExam(options)` |
| `useFlashcards` | Get flashcards | `useFlashcards(params)` |
| `useOSCEStations` | Get OSCE stations | `useOSCEStations(params)` |
| `useMyResults` | Get my results | `useMyResults(params)` |
| `useUserStats` | Get user statistics | `useUserStats(params)` |

### Stores

| Store | Purpose | Key Methods |
|-------|---------|-------------|
| `useAuthStore` | Authentication state | `setAuth`, `clearAuth`, `updateUser` |
| `useExamStore` | Exam data cache | `setExams`, `updateExam`, `setFilters` |
| `useUIStore` | UI state | `addToast`, `openModal`, `setLoading` |

### API Endpoints

| Endpoint | Method | Usage |
|----------|--------|-------|
| `authEndpoints.login` | POST | Login user |
| `authEndpoints.register` | POST | Register user |
| `examEndpoints.getExams` | GET | Get exams list |
| `examEndpoints.createExam` | POST | Create exam |
| `examEndpoints.updateExam` | PUT | Update exam |
| `examEndpoints.deleteExam` | DELETE | Delete exam |
| `resultEndpoints.getMyResults` | GET | Get my results |
| `flashcardEndpoints.getFlashcards` | GET | Get flashcards |
| `osceEndpoints.getOSCEStations` | GET | Get OSCE stations |

### Query Options

```typescript
{
  enabled: boolean,              // Enable/disable query
  refetchOnWindowFocus: boolean, // Refetch on window focus
  refetchInterval: number,       // Refetch interval in ms
  cacheTime: number,             // Cache time in ms
  staleTime: number,             // Stale time in ms
  retry: number,                 // Number of retries
  onSuccess: (data) => void,     // Success callback
  onError: (error) => void       // Error callback
}
```

### Mutation Options

```typescript
{
  onMutate: (variables) => any,       // Before mutation
  onSuccess: (data, variables, context) => void,  // On success
  onError: (error, variables, context) => void,   // On error
  onSettled: (data, error, variables, context) => void, // Always
  retry: number,                      // Number of retries
  invalidateQueries: string[]         // Clear these caches
}
```

### Error Handling

```typescript
import { ApiError, ApiErrorCode } from './services/apiClient';

try {
  await someAction();
} catch (error) {
  if (error instanceof ApiError) {
    switch (error.code) {
      case ApiErrorCode.UNAUTHORIZED:
        // Redirect to login
        break;
      case ApiErrorCode.VALIDATION_ERROR:
        // Show validation errors
        break;
      case ApiErrorCode.NETWORK_ERROR:
        // Show network error message
        break;
      default:
        // Generic error handling
    }
  }
}
```

### Cache Management

```typescript
import { clearQueryCache } from './hooks/useQuery';
import { apiClient } from './services/apiClient';

// Clear all query cache
clearQueryCache();

// Clear specific pattern
clearQueryCache('exams');

// Clear API client cache
apiClient.clearCache();
apiClient.clearCache('exams');
```

### Toast Notifications

```typescript
import { useUIStore } from './stores/uiStore';

const addToast = useUIStore(state => state.addToast);

addToast({
  type: 'success', // 'success' | 'error' | 'warning' | 'info'
  message: 'Action completed!',
  duration: 5000 // Optional, default 5000ms
});
```

### Loading States

```typescript
import { useUIStore } from './stores/uiStore';

const { setLoading, isLoading } = useUIStore();

// Set loading
setLoading('myAction', true);

// Check loading
if (isLoading('myAction')) {
  // Show loading spinner
}

// Clear loading
setLoading('myAction', false);
```

### Authentication

```typescript
import { useAuthStore } from './stores/authStore';

const { user, isAuthenticated, setAuth, clearAuth } = useAuthStore();

// Login
setAuth(user, accessToken, refreshToken);

// Logout
clearAuth();

// Check if authenticated
if (isAuthenticated) {
  // User is logged in
}

// Get current user
console.log(user?.name);
```

## Common Mistakes to Avoid

### ❌ Don't use async/await in component body

```typescript
// Wrong
function MyComponent() {
  const data = await fetchData(); // Error!
  return <div>{data}</div>;
}

// Correct
function MyComponent() {
  const { data } = useQuery('key', fetchData);
  return <div>{data}</div>;
}
```

### ❌ Don't forget loading states

```typescript
// Wrong
function MyComponent() {
  const { data } = useExams();
  return <div>{data.exams.map(/* ... */)}</div>; // Crashes if data is null
}

// Correct
function MyComponent() {
  const { data, isLoading } = useExams();
  if (isLoading) return <Loader />;
  return <div>{data?.exams.map(/* ... */)}</div>;
}
```

### ❌ Don't mutate directly without invalidation

```typescript
// Wrong
const updateExam = useUpdateExam();

// Correct
const updateExam = useUpdateExam({
  invalidateQueries: ['exams', 'exam']
});
```

### ❌ Don't ignore errors

```typescript
// Wrong
const createExam = useCreateExam();
createExam.mutate(data); // No error handling

// Correct
const createExam = useCreateExam({
  onError: (error) => {
    console.error(error);
    addToast({ type: 'error', message: error.message });
  }
});
```

## Quick Commands

```bash
# Start development
npm run dev:all

# Run tests
npm test

# Type check
npx tsc --noEmit

# Clear all caches
# (In browser console)
localStorage.clear()
sessionStorage.clear()
```

## Useful Resources

- Full Documentation: `API_SERVICE_LAYER.md`
- Type Definitions: `types/api.ts`
- Endpoint Examples: `services/endpoints/`
- Hook Examples: `hooks/useApi.ts`
- Store Examples: `stores/`

## Support

For issues or questions:
1. Check the full documentation: `API_SERVICE_LAYER.md`
2. Review type definitions: `types/api.ts`
3. Check existing examples in the codebase
4. Look at test files for usage patterns
