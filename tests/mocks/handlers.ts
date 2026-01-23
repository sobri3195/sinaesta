import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { createMockUser, createMockExam, createMockExamResult } from '../utils/mockData';

// Mock API endpoints
export const handlers = [
  // Auth endpoints
  http.post('/api/auth/login', async ({ request }) => {
    const body = await request.json();
    const { email } = body;
    
    // Mock successful login
    if (email === 'test@example.com') {
      return HttpResponse.json({
        user: createMockUser({ email }),
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token'
      });
    }
    
    return HttpResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  }),

  http.post('/api/auth/register', async ({ request }) => {
    const body = await request.json();
    const { email } = body;
    
    return HttpResponse.json({
      user: createMockUser({ email }),
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token'
    });
  }),

  http.post('/api/auth/logout', () => {
    return HttpResponse.json({ success: true });
  }),

  http.get('/api/users/me', () => {
    return HttpResponse.json(createMockUser());
  }),

  // Exam endpoints
  http.get('/api/exams', () => {
    return HttpResponse.json({
      exams: Array.from({ length: 5 }, () => createMockExam()),
      total: 5
    });
  }),

  http.get('/api/exams/:id', ({ params }) => {
    const { id } = params;
    return HttpResponse.json(createMockExam({ id }));
  }),

  http.post('/api/exams', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(createMockExam(body));
  }),

  http.put('/api/exams/:id', async ({ params, request }) => {
    const { id } = params;
    const body = await request.json();
    return HttpResponse.json(createMockExam({ id, ...body }));
  }),

  http.delete('/api/exams/:id', ({ params }) => {
    const { id } = params;
    return HttpResponse.json({ success: true, id });
  }),

  // Exam submission endpoints
  http.post('/api/exams/:id/submit', async ({ params, request }) => {
    const { id } = params;
    const body = await request.json();
    return HttpResponse.json(createMockExamResult({ examId: id, ...body }));
  }),

  // Results endpoints
  http.get('/api/results', () => {
    return HttpResponse.json({
      results: Array.from({ length: 10 }, () => createMockExamResult()),
      total: 10
    });
  }),

  http.get('/api/results/:id', ({ params }) => {
    const { id } = params;
    return HttpResponse.json(createMockExamResult({ id }));
  }),

  // File upload endpoints
  http.post('/api/upload', async ({ request }) => {
    const formData = await request.formData();
    return HttpResponse.json({
      filename: 'mock-file.jpg',
      url: 'https://example.com/mock-file.jpg',
      size: 1024
    });
  }),

  http.delete('/api/files/:filename', ({ params }) => {
    const { filename } = params;
    return HttpResponse.json({ success: true, filename });
  }),

  // Flashcard endpoints
  http.get('/api/flashcards', () => {
    return HttpResponse.json({
      flashcards: [],
      total: 0
    });
  }),

  http.post('/api/flashcards', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: 'mock-flashcard-id',
      ...body
    });
  }),

  // Generic error handling for 404s
  http.all('*', () => {
    return HttpResponse.json(
      { error: 'Not Found' },
      { status: 404 }
    );
  })
];

// Setup MSW server
export const server = setupServer(...handlers);

// Start server before all tests
export function startMockServer() {
  server.listen({ onUnhandledRequest: 'error' });
}

// Close server after all tests
export function closeMockServer() {
  server.close();
}

// Reset handlers between tests
export function resetMockServer() {
  server.resetHandlers();
}