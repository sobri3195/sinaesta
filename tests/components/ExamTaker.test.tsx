import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExamTaker } from '../../../components/ExamTaker';
import { createMockUser, createMockExam, createMockQuestions } from '../../utils/mockData';
import { Exam } from '../../../types';

// Mock the API service
vi.mock('../../../services/apiService', () => ({
  apiService: {
    submitExam: vi.fn(),
    getExam: vi.fn(),
  }
}));

const mockProps = {
  user: createMockUser(),
  exam: createMockExam({ isPublished: true }),
  onBack: vi.fn(),
  onExamComplete: vi.fn(),
};

describe('ExamTaker', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders exam taking interface', () => {
    render(<ExamTaker {...mockProps} />);

    expect(screen.getByText(mockProps.exam.title)).toBeInTheDocument();
    expect(screen.getByText(/question 1/i)).toBeInTheDocument();
    expect(screen.getByText(mockProps.exam.questions[0].text)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
  });

  it('allows selecting answers', async () => {
    render(<ExamTaker {...mockProps} />);

    const firstOption = screen.getByText(mockProps.exam.questions[0].options[0]);
    await user.click(firstOption);

    expect(firstOption.closest('label')).toHaveClass('bg-blue-100', 'border-blue-500');
  });

  it('navigates between questions', async () => {
    render(<ExamTaker {...mockProps} />);

    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);

    expect(screen.getByText(/question 2/i)).toBeInTheDocument();

    const prevButton = screen.getByRole('button', { name: /previous/i });
    await user.click(prevButton);

    expect(screen.getByText(/question 1/i)).toBeInTheDocument();
  });

  it('shows timer countdown', () => {
    render(<ExamTaker {...mockProps} />);

    expect(screen.getByText(/time remaining/i)).toBeInTheDocument();
    expect(screen.getByText(/\d{1,2}:\d{2}/)).toBeInTheDocument();
  });

  it('handles timer expiration', async () => {
    vi.useFakeTimers();
    
    render(<ExamTaker {...mockProps} />);

    // Fast forward time to simulate timer expiration
    vi.advanceTimersByTime(mockProps.exam.duration * 60 * 1000 + 1000);

    await waitFor(() => {
      expect(screen.getByText(/time's up/i)).toBeInTheDocument();
    });

    vi.useRealTimers();
  });

  it('submits exam with all answers', async () => {
    const { apiService } = await import('../../../services/apiService');
    const mockResult = {
      id: 'result-1',
      examId: mockProps.exam.id,
      score: 85,
      totalQuestions: mockProps.exam.questions.length,
      correctAnswers: Math.floor(mockProps.exam.questions.length * 0.85),
      feedback: 'Good job!'
    };
    vi.mocked(apiService.submitExam).mockResolvedValue(mockResult);

    render(<ExamTaker {...mockProps} />);

    // Answer all questions
    for (let i = 0; i < mockProps.exam.questions.length; i++) {
      const nextButton = screen.getByRole('button', { name: /next/i });
      if (i > 0) {
        await user.click(nextButton);
      }
      
      const option = screen.getByText(mockProps.exam.questions[i].options[0]);
      await user.click(option);
    }

    const submitButton = screen.getByRole('button', { name: /submit exam/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(apiService.submitExam).toHaveBeenCalledWith(
        mockProps.exam.id,
        expect.arrayContaining([
          expect.objectContaining({
            questionId: mockProps.exam.questions[0].id,
            selectedAnswerIndex: expect.any(Number)
          })
        ])
      );
    });
  });

  it('shows confirmation before submitting', async () => {
    render(<ExamTaker {...mockProps} />);

    // Answer one question
    const option = screen.getByText(mockProps.exam.questions[0].options[0]);
    await user.click(option);

    const submitButton = screen.getByRole('button', { name: /submit exam/i });
    await user.click(submitButton);

    expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
  });

  it('handles submission errors', async () => {
    const { apiService } = await import('../../../services/apiService');
    vi.mocked(apiService.submitExam).mockRejectedValue(new Error('Submission failed'));

    render(<ExamTaker {...mockProps} />);

    // Answer all questions and submit
    const allOptions = screen.getAllByText(/Option [1-4]/);
    for (let i = 0; i < Math.min(allOptions.length, 4); i++) {
      await user.click(allOptions[i]);
    }

    const submitButton = screen.getByRole('button', { name: /submit exam/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/submission failed/i)).toBeInTheDocument();
    });
  });

  it('calls onBack when back button is clicked', async () => {
    render(<ExamTaker {...mockProps} />);

    const backButton = screen.getByRole('button', { name: /back/i });
    await user.click(backButton);

    expect(mockProps.onBack).toHaveBeenCalled();
  });

  it('shows progress indicator', () => {
    render(<ExamTaker {...mockProps} />);

    expect(screen.getByText(/question \d+ of \d+/i)).toBeInTheDocument();
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
  });

  it('allows reviewing previous answers', async () => {
    render(<ExamTaker {...mockProps} />);

    // Answer first question
    const option1 = screen.getByText(mockProps.exam.questions[0].options[0]);
    await user.click(option1);

    // Go to next question
    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);

    // Go back to first question
    const prevButton = screen.getByRole('button', { name: /previous/i });
    await user.click(prevButton);

    // Should show previous answer as selected
    expect(option1.closest('label')).toHaveClass('bg-blue-100', 'border-blue-500');
  });

  it('handles exam with no questions', () => {
    const emptyExam = createMockExam({ questions: [] });
    render(<ExamTaker {...mockProps} exam={emptyExam} />);

    expect(screen.getByText(/no questions available/i)).toBeInTheDocument();
  });

  it('shows exam instructions', () => {
    render(<ExamTaker {...mockProps} />);

    expect(screen.getByText(/instructions/i)).toBeInTheDocument();
    expect(screen.getByText(/read each question carefully/i)).toBeInTheDocument();
  });
});