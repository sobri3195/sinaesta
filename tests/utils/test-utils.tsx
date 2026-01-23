import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';

// Mock the API service to avoid real API calls during testing
vi.mock('../services/apiService', () => ({
  apiService: {
    login: vi.fn(),
    register: vi.fn(),
    getMe: vi.fn(),
    refreshToken: vi.fn(),
    logout: vi.fn(),
    getExams: vi.fn(),
    createExam: vi.fn(),
    updateExam: vi.fn(),
    deleteExam: vi.fn(),
    submitExam: vi.fn(),
    getResults: vi.fn(),
    uploadFile: vi.fn(),
    deleteFile: vi.fn(),
  }
}));

// Mock the auth service
vi.mock('../services/authService', () => ({
  authService: {
    getCurrentUser: vi.fn(),
    isAuthenticated: vi.fn(),
    hasPermission: vi.fn(),
    getToken: vi.fn(),
    setToken: vi.fn(),
    removeToken: vi.fn(),
  }
}));

// Mock the Gemini service
vi.mock('../services/geminiService', () => ({
  generateExamQuestions: vi.fn(),
  generateAnswerOptions: vi.fn(),
  generateExplanations: vi.fn(),
  generateExamOverview: vi.fn(),
  generateExamThumbnail: vi.fn(),
  generatePerformanceFeedback: vi.fn(),
  generateFlashcards: vi.fn(),
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

interface AllTheProvidersProps {
  children: React.ReactNode;
}

const AllTheProviders: React.FC<AllTheProvidersProps> = ({ children }) => {
  return (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react';

// Override render method
export { customRender as render };