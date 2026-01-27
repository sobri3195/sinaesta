import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiService } from '../../../services/apiService';
import { createMockUser, createMockExam, createMockExamResult, mockLoginResponse } from '../../utils/mockData';

// Mock fetch
const mockFetch = vi.fn();

describe('apiService', () => {
  const mockBaseURL = 'http://localhost:3001/api';
  const mockToken = 'mock-jwt-token';
  const localStorageMock = {
    getItem: vi.fn((key: string) => (key === 'accessToken' ? mockToken : null)),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  };

  beforeEach(() => {
    mockFetch.mockReset();
    global.fetch = mockFetch;

    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
      configurable: true,
    });

    localStorageMock.getItem.mockImplementation((key: string) =>
      key === 'accessToken' ? mockToken : null
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Authentication', () => {
    it('should login successfully', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockResponse = {
        ok: true,
        json: async () => mockLoginResponse
      };

      mockFetch.mockResolvedValue(mockResponse);

      const result = await apiService.login(loginData);

      expect(result).toEqual(mockLoginResponse);
      expect(mockFetch).toHaveBeenCalledWith(`${mockBaseURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });
    });

    it('should handle login failure', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const mockResponse = {
        ok: false,
        status: 401,
        json: async () => ({ error: 'Invalid credentials' })
      };

      mockFetch.mockResolvedValue(mockResponse);

      await expect(apiService.login(loginData)).rejects.toThrow('Invalid credentials');
    });

    it('should register successfully', async () => {
      const registerData = {
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
        role: 'STUDENT'
      };

      const mockResponse = {
        ok: true,
        json: async () => mockLoginResponse
      };

      mockFetch.mockResolvedValue(mockResponse);

      const result = await apiService.register(registerData);

      expect(result).toEqual(mockLoginResponse);
      expect(mockFetch).toHaveBeenCalledWith(`${mockBaseURL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      });
    });

    it('should logout successfully', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ success: true })
      };

      mockFetch.mockResolvedValue(mockResponse);

      await apiService.logout();

      expect(mockFetch).toHaveBeenCalledWith(`${mockBaseURL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${mockToken}`,
        },
      });
    });
  });

  describe('User Management', () => {
    it('should get current user profile', async () => {
      const mockUser = createMockUser();
      const mockResponse = {
        ok: true,
        json: async () => mockUser
      };

      mockFetch.mockResolvedValue(mockResponse);

      const result = await apiService.getMe();

      expect(result).toEqual(mockUser);
      expect(mockFetch).toHaveBeenCalledWith(`${mockBaseURL}/users/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${mockToken}`,
        },
      });
    });

    it('should handle unauthorized access', async () => {
      const mockResponse = {
        ok: false,
        status: 401,
        json: async () => ({ error: 'Unauthorized' })
      };

      mockFetch.mockResolvedValue(mockResponse);

      await expect(apiService.getMe()).rejects.toThrow('Session expired');
    });
  });

  describe('Exam Management', () => {
    it('should get exams list', async () => {
      const mockExams = Array.from({ length: 5 }, () => createMockExam());
      const mockResponse = {
        ok: true,
        json: async () => ({
          exams: mockExams,
          total: 5
        })
      };

      mockFetch.mockResolvedValue(mockResponse);

      const result = await apiService.getExams();

      expect(result).toEqual({
        exams: mockExams,
        total: 5
      });
      expect(mockFetch).toHaveBeenCalledWith(`${mockBaseURL}/exams`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${mockToken}`,
        },
      });
    });

    it('should get single exam by id', async () => {
      const mockExam = createMockExam({ id: 'exam-123' });
      const mockResponse = {
        ok: true,
        json: async () => mockExam
      };

      mockFetch.mockResolvedValue(mockResponse);

      const result = await apiService.getExam('exam-123');

      expect(result).toEqual(mockExam);
      expect(mockFetch).toHaveBeenCalledWith(`${mockBaseURL}/exams/exam-123`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${mockToken}`,
        },
      });
    });

    it('should create new exam', async () => {
      const examData = {
        title: 'New Exam',
        description: 'Exam description',
        topic: 'Cardiology',
        difficulty: 'Medium',
        duration: 60
      };

      const mockExam = createMockExam(examData);
      const mockResponse = {
        ok: true,
        json: async () => mockExam
      };

      mockFetch.mockResolvedValue(mockResponse);

      const result = await apiService.createExam(examData);

      expect(result).toEqual(mockExam);
      expect(mockFetch).toHaveBeenCalledWith(`${mockBaseURL}/exams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mockToken}`,
        },
        body: JSON.stringify(examData),
      });
    });

    it('should update existing exam', async () => {
      const examId = 'exam-123';
      const updateData = {
        title: 'Updated Exam',
        description: 'Updated description'
      };

      const mockUpdatedExam = createMockExam({ id: examId, ...updateData });
      const mockResponse = {
        ok: true,
        json: async () => mockUpdatedExam
      };

      mockFetch.mockResolvedValue(mockResponse);

      const result = await apiService.updateExam(examId, updateData);

      expect(result).toEqual(mockUpdatedExam);
      expect(mockFetch).toHaveBeenCalledWith(`${mockBaseURL}/exams/${examId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mockToken}`,
        },
        body: JSON.stringify(updateData),
      });
    });

    it('should delete exam', async () => {
      const examId = 'exam-123';
      const mockResponse = {
        ok: true,
        json: async () => ({ success: true })
      };

      mockFetch.mockResolvedValue(mockResponse);

      await apiService.deleteExam(examId);

      expect(mockFetch).toHaveBeenCalledWith(`${mockBaseURL}/exams/${examId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${mockToken}`,
        },
      });
    });
  });

  describe('Exam Submission', () => {
    it('should submit exam answers', async () => {
      const examId = 'exam-123';
      const answers = {
        question1: 'answer1',
        question2: 'answer2'
      };

      const mockResult = createMockExamResult();
      const mockResponse = {
        ok: true,
        json: async () => mockResult
      };

      mockFetch.mockResolvedValue(mockResponse);

      const result = await apiService.submitExam(examId, answers);

      expect(result).toEqual(mockResult);
      expect(mockFetch).toHaveBeenCalledWith(`${mockBaseURL}/exams/${examId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mockToken}`,
        },
        body: JSON.stringify({ answers }),
      });
    });
  });

  describe('Results Management', () => {
    it('should get exam results', async () => {
      const examId = 'exam-123';
      const mockResult = createMockExamResult();
      const mockResponse = {
        ok: true,
        json: async () => mockResult
      };

      mockFetch.mockResolvedValue(mockResponse);

      const result = await apiService.getExamResults(examId);

      expect(result).toEqual(mockResult);
      expect(mockFetch).toHaveBeenCalledWith(`${mockBaseURL}/exams/${examId}/results`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${mockToken}`,
        },
      });
    });
  });

  describe('File Upload', () => {
    it('should upload file successfully', async () => {
      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      const mockResponse = {
        ok: true,
        json: async () => ({ url: 'http://example.com/file.pdf' })
      };

      mockFetch.mockResolvedValue(mockResponse);

      const result = await apiService.uploadFile(file);

      expect(result).toEqual({ url: 'http://example.com/file.pdf' });
      expect(mockFetch).toHaveBeenCalledWith(`${mockBaseURL}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${mockToken}`,
        },
        body: expect.any(FormData),
      });
    });

    it('should delete file successfully', async () => {
      const fileId = 'file-123';
      const mockResponse = {
        ok: true,
        json: async () => ({ success: true })
      };

      mockFetch.mockResolvedValue(mockResponse);

      await apiService.deleteFile(fileId);

      expect(mockFetch).toHaveBeenCalledWith(`${mockBaseURL}/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${mockToken}`,
        },
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(apiService.getExams()).rejects.toThrow('Network error');
    });

    it('should handle server errors', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal server error' })
      };

      mockFetch.mockResolvedValue(mockResponse);

      await expect(apiService.getExams()).rejects.toThrow('Internal server error');
    });

    it('should handle timeout errors', async () => {
      mockFetch.mockImplementation(() =>
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout')), 100)
        )
      );

      await expect(apiService.getExams()).rejects.toThrow('Request timeout');
    });
  });
});
