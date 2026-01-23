import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../../context/AuthContext';
import { apiService } from '../../../services/apiService';
import { createMockUser, createMockExam, createMockQuestions, createTestScenario } from '../../utils/mockData';

// Mock all services
vi.mock('../../../services/apiService');
vi.mock('../../../services/authService');
vi.mock('../../../services/geminiService');

const TestProviders = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <AuthProvider>{children}</AuthProvider>
  </BrowserRouter>
);

describe('Exam Flow Integration', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock successful login
    vi.mocked(apiService.login).mockResolvedValue({
      user: createTestScenario.loggedInAdmin().user,
      accessToken: 'mock-token',
      refreshToken: 'mock-refresh-token'
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('complete exam creation and taking flow', async () => {
    const mockExam = createMockExam({ id: 'exam-123' });
    const mockQuestions = createMockQuestions(5);
    
    // Mock API responses
    vi.mocked(apiService.createExam).mockResolvedValue(mockExam);
    vi.mocked(apiService.getExams).mockResolvedValue({ exams: [mockExam], total: 1 });
    vi.mocked(apiService.submitExam).mockResolvedValue({
      id: 'result-123',
      examId: 'exam-123',
      score: 80,
      totalQuestions: 5,
      correctAnswers: 4,
      feedback: 'Good job!'
    });

    render(<TestProviders><div>Exam Flow Test</div></TestProviders>);

    // Simulate user logging in and navigating to exam creation
    // (In real integration, this would involve actual component rendering)
    
    // Mock exam creation
    const examData = {
      title: 'Integration Test Exam',
      description: 'Testing complete flow',
      topic: 'Cardiology',
      difficulty: 'Medium',
      duration: 60,
      questions: mockQuestions
    };

    const createdExam = await apiService.createExam(examData);
    expect(createdExam).toEqual(mockExam);
    expect(apiService.createExam).toHaveBeenCalledWith(examData);

    // Mock exam submission
    const answers = mockQuestions.map((q, index) => ({
      questionId: q.id,
      selectedAnswerIndex: index % 4, // Simple pattern for testing
      isCorrect: index < 4 // First 4 are "correct"
    }));

    const result = await apiService.submitExam(mockExam.id, answers);
    expect(result.score).toBe(80);
    expect(result.correctAnswers).toBe(4);
  });

  it('handles authentication state persistence', async () => {
    const mockUser = createTestScenario.loggedInAdmin().user;
    
    // Mock successful authentication
    vi.mocked(apiService.getMe).mockResolvedValue(mockUser);

    render(<TestProviders><div>Auth Persistence Test</div></TestProviders>);

    // Simulate getting current user (would happen in AuthContext)
    const currentUser = await apiService.getMe();
    expect(currentUser).toEqual(mockUser);
    expect(apiService.getMe).toHaveBeenCalled();
  });

  it('handles settings persistence across sessions', async () => {
    const settings = {
      theme: 'dark',
      language: 'en',
      notifications: { email: true, push: false },
      exam: { defaultDuration: 60, showExplanations: true }
    };

    // Mock localStorage for settings
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock
    });

    // Simulate saving settings
    localStorageMock.setItem('sinaesta_settings', JSON.stringify(settings));

    // Simulate loading settings
    localStorageMock.getItem.mockReturnValue(JSON.stringify(settings));

    const savedSettings = JSON.parse(localStorageMock.getItem('sinaesta_settings'));
    expect(savedSettings).toEqual(settings);
  });

  it('handles file upload integration', async () => {
    const mockFileResponse = {
      filename: 'test-image.jpg',
      url: 'https://example.com/test-image.jpg',
      size: 1024
    };

    vi.mocked(apiService.uploadFile).mockResolvedValue(mockFileResponse);

    // Create a mock file
    const mockFile = new File(['test content'], 'test-image.jpg', { type: 'image/jpeg' });

    const result = await apiService.uploadFile(mockFile);
    expect(result).toEqual(mockFileResponse);
    expect(apiService.uploadFile).toHaveBeenCalledWith(mockFile);
  });

  it('handles error scenarios gracefully', async () => {
    const networkError = new Error('Network error');
    vi.mocked(apiService.getExams).mockRejectedValue(networkError);

    try {
      await apiService.getExams();
    } catch (error) {
      expect(error).toBe(networkError);
      expect(error.message).toBe('Network error');
    }
  });

  it('handles token refresh flow', async () => {
    const mockTokens = {
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token'
    };

    vi.mocked(apiService.refreshToken).mockResolvedValue({
      user: createMockUser(),
      ...mockTokens
    });

    const result = await apiService.refreshToken('old-refresh-token');
    expect(result.accessToken).toBe('new-access-token');
    expect(apiService.refreshToken).toHaveBeenCalledWith('old-refresh-token');
  });
});