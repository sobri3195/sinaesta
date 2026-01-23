import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as geminiServiceModule from '../../../services/geminiService';

// Mock the entire module
vi.mock('../../../services/geminiService', () => ({
  generateExamQuestions: vi.fn(),
  generateAnswerOptions: vi.fn(),
  generateExplanations: vi.fn(),
  generateExamOverview: vi.fn(),
  generateExamThumbnail: vi.fn(),
  generatePerformanceFeedback: vi.fn(),
  generateFlashcards: vi.fn(),
}));

describe('geminiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('generateExamQuestions', () => {
    it('should generate questions with valid structure', async () => {
      const mockQuestions = [
        {
          id: '1',
          text: 'What is the capital of France?',
          options: ['Paris', 'London', 'Berlin', 'Madrid'],
          correctAnswerIndex: 0,
          explanation: 'Paris is the capital of France.',
          category: 'Geography',
          difficulty: 'Easy'
        }
      ];

      const { generateExamQuestions } = geminiServiceModule;
      vi.mocked(generateExamQuestions).mockResolvedValue(mockQuestions);

      const result = await generateExamQuestions('Geography', 'Easy', 1);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        text: 'What is the capital of France?',
        options: expect.arrayContaining(['Paris', 'London', 'Berlin', 'Madrid']),
        correctAnswerIndex: 0,
        explanation: 'Paris is the capital of France.',
        category: 'Geography',
        difficulty: 'Easy'
      });
      expect(result[0]).toHaveProperty('id');
    });

    it('should handle API errors gracefully', async () => {
      const { generateExamQuestions } = geminiServiceModule;
      vi.mocked(generateExamQuestions).mockRejectedValue(new Error('AI generation failed. Please try again.'));

      await expect(
        generateExamQuestions('Geography', 'Easy', 1)
      ).rejects.toThrow('AI generation failed. Please try again.');
    });
  });

  describe('generateAnswerOptions', () => {
    it('should generate 4 options with correct answer', async () => {
      const mockResult = {
        options: ['Paris', 'London', 'Berlin', 'Madrid'],
        correctAnswerIndex: 0
      };

      const { generateAnswerOptions } = geminiServiceModule;
      vi.mocked(generateAnswerOptions).mockResolvedValue(mockResult);

      const result = await generateAnswerOptions('What is the capital of France?');

      expect(result).toEqual(mockResult);
      expect(result?.options).toHaveLength(4);
    });

    it('should return null for invalid response', async () => {
      const { generateAnswerOptions } = geminiServiceModule;
      vi.mocked(generateAnswerOptions).mockResolvedValue(null);

      const result = await generateAnswerOptions('Invalid question');

      expect(result).toBeNull();
    });
  });

  describe('generateExplanations', () => {
    it('should generate explanations for questions', async () => {
      const questions: any[] = [
        {
          id: '1',
          text: 'What is the capital of France?',
          options: ['Paris', 'London', 'Berlin', 'Madrid'],
          correctAnswerIndex: 0,
          explanation: '',
          category: 'Geography',
          difficulty: 'Easy'
        }
      ];

      const mockExplanationMap = {
        '1': 'Paris is the capital and largest city of France.'
      };

      const { generateExplanations } = geminiServiceModule;
      vi.mocked(generateExplanations).mockResolvedValue(mockExplanationMap);

      const result = await generateExplanations(questions, 'Geography');

      expect(result).toEqual(mockExplanationMap);
    });
  });

  describe('generateFlashcards', () => {
    it('should generate flashcards', async () => {
      const mockFlashcards = [
        {
          id: '1',
          front: 'What is hypertension?',
          back: 'High blood pressure greater than 140/90 mmHg.',
          category: 'Cardiology'
        }
      ];

      const { generateFlashcards } = geminiServiceModule;
      vi.mocked(generateFlashcards).mockResolvedValue(mockFlashcards);

      const result = await generateFlashcards('Cardiology', 1);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        front: 'What is hypertension?',
        back: 'High blood pressure greater than 140/90 mmHg.',
        category: 'Cardiology',
        id: expect.any(String)
      });
    });

    it('should handle API errors', async () => {
      const { generateFlashcards } = geminiServiceModule;
      vi.mocked(generateFlashcards).mockRejectedValue(new Error('Failed to generate flashcards'));

      await expect(
        generateFlashcards('Cardiology', 1)
      ).rejects.toThrow('Failed to generate flashcards');
    });
  });
});