import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExamCreator } from '../../../components/ExamCreator';
import { createMockUser, createMockExam } from '../../utils/mockData';
import { User, Exam } from '../../../types';

// Mock the Gemini service
vi.mock('../../../services/geminiService', () => ({
  generateExamQuestions: vi.fn(),
  generateExamOverview: vi.fn(),
  generateExamThumbnail: vi.fn(),
}));

// Mock the API service
vi.mock('../../../services/apiService', () => ({
  apiService: {
    createExam: vi.fn(),
    updateExam: vi.fn(),
    getExams: vi.fn(),
  }
}));

const mockProps = {
  user: createMockUser(),
  onBack: vi.fn(),
  onExamCreated: vi.fn(),
  initialExam: undefined
};

describe('ExamCreator', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders exam creation form', () => {
    render(<ExamCreator {...mockProps} />);

    expect(screen.getByText('Create New Exam')).toBeInTheDocument();
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/topic/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/difficulty/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/duration/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /generate questions/i })).toBeInTheDocument();
  });

  it('allows input in form fields', async () => {
    render(<ExamCreator {...mockProps} />);

    const titleInput = screen.getByLabelText(/title/i);
    const descriptionInput = screen.getByLabelText(/description/i);

    await user.type(titleInput, 'Test Exam');
    await user.type(descriptionInput, 'This is a test exam description');

    expect(titleInput).toHaveValue('Test Exam');
    expect(descriptionInput).toHaveValue('This is a test exam description');
  });

  it('validates required fields', async () => {
    render(<ExamCreator {...mockProps} />);

    const generateButton = screen.getByRole('button', { name: /generate questions/i });

    await user.click(generateButton);

    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument();
      expect(screen.getByText(/topic is required/i)).toBeInTheDocument();
    });
  });

  it('generates questions with AI', async () => {
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

    const { generateExamQuestions } = await import('../../../services/geminiService');
    vi.mocked(generateExamQuestions).mockResolvedValue(mockQuestions);

    render(<ExamCreator {...mockProps} />);

    // Fill required fields
    await user.type(screen.getByLabelText(/title/i), 'Geography Test');
    await user.selectOptions(screen.getByLabelText(/topic/i), 'Geography');
    await user.selectOptions(screen.getByLabelText(/difficulty/i), 'Easy');
    await user.type(screen.getByLabelText(/duration/i), '60');

    const generateButton = screen.getByRole('button', { name: /generate questions/i });
    await user.click(generateButton);

    await waitFor(() => {
      expect(generateExamQuestions).toHaveBeenCalledWith(
        'Geography',
        'Easy',
        10,
        []
      );
    });

    await waitFor(() => {
      expect(screen.getByText('What is the capital of France?')).toBeInTheDocument();
    });
  });

  it('handles AI generation errors', async () => {
    const { generateExamQuestions } = await import('../../../services/geminiService');
    vi.mocked(generateExamQuestions).mockRejectedValue(new Error('AI generation failed'));

    render(<ExamCreator {...mockProps} />);

    // Fill required fields
    await user.type(screen.getByLabelText(/title/i), 'Geography Test');
    await user.selectOptions(screen.getByLabelText(/topic/i), 'Geography');
    await user.selectOptions(screen.getByLabelText(/difficulty/i), 'Easy');
    await user.type(screen.getByLabelText(/duration/i), '60');

    const generateButton = screen.getByRole('button', { name: /generate questions/i });
    await user.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText(/failed to generate questions/i)).toBeInTheDocument();
    });
  });

  it('saves exam successfully', async () => {
    const { apiService } = await import('../../../services/apiService');
    vi.mocked(apiService.createExam).mockResolvedValue(createMockExam());

    render(<ExamCreator {...mockProps} />);

    // Fill required fields
    await user.type(screen.getByLabelText(/title/i), 'Geography Test');
    await user.selectOptions(screen.getByLabelText(/topic/i), 'Geography');
    await user.selectOptions(screen.getByLabelText(/difficulty/i), 'Easy');
    await user.type(screen.getByLabelText(/duration/i), '60');

    const saveButton = screen.getByRole('button', { name: /save exam/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(apiService.createExam).toHaveBeenCalled();
      expect(mockProps.onExamCreated).toHaveBeenCalled();
    });
  });

  it('loads existing exam for editing', () => {
    const existingExam = createMockExam({
      title: 'Existing Exam',
      description: 'Existing description',
      topic: 'Cardiology',
      difficulty: 'Medium',
      duration: 90
    });

    render(<ExamCreator {...mockProps} initialExam={existingExam} />);

    expect(screen.getByText('Edit Exam')).toBeInTheDocument();
    expect(screen.getByLabelText(/title/i)).toHaveValue('Existing Exam');
    expect(screen.getByLabelText(/description/i)).toHaveValue('Existing description');
    expect(screen.getByLabelText(/topic/i)).toHaveValue('Cardiology');
    expect(screen.getByLabelText(/difficulty/i)).toHaveValue('Medium');
    expect(screen.getByLabelText(/duration/i)).toHaveValue('90');
  });

  it('updates existing exam', async () => {
    const existingExam = createMockExam();
    const { apiService } = await import('../../../services/apiService');
    vi.mocked(apiService.updateExam).mockResolvedValue(existingExam);

    render(<ExamCreator {...mockProps} initialExam={existingExam} />);

    const titleInput = screen.getByLabelText(/title/i);
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated Exam Title');

    const saveButton = screen.getByRole('button', { name: /update exam/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(apiService.updateExam).toHaveBeenCalledWith(
        existingExam.id,
        expect.objectContaining({
          title: 'Updated Exam Title'
        })
      );
      expect(mockProps.onExamCreated).toHaveBeenCalled();
    });
  });

  it('handles save errors', async () => {
    const { apiService } = await import('../../../services/apiService');
    vi.mocked(apiService.createExam).mockRejectedValue(new Error('Save failed'));

    render(<ExamCreator {...mockProps} />);

    // Fill required fields
    await user.type(screen.getByLabelText(/title/i), 'Geography Test');
    await user.selectOptions(screen.getByLabelText(/topic/i), 'Geography');
    await user.selectOptions(screen.getByLabelText(/difficulty/i), 'Easy');
    await user.type(screen.getByLabelText(/duration/i), '60');

    const saveButton = screen.getByRole('button', { name: /save exam/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/failed to save exam/i)).toBeInTheDocument();
    });
  });

  it('calls onBack when back button is clicked', async () => {
    render(<ExamCreator {...mockProps} />);

    const backButton = screen.getByRole('button', { name: /back/i });
    await user.click(backButton);

    expect(mockProps.onBack).toHaveBeenCalled();
  });

  it('adds questions manually', async () => {
    render(<ExamCreator {...mockProps} />);

    // Fill required fields
    await user.type(screen.getByLabelText(/title/i), 'Manual Test');
    await user.selectOptions(screen.getByLabelText(/topic/i), 'Geography');
    await user.selectOptions(screen.getByLabelText(/difficulty/i), 'Easy');
    await user.type(screen.getByLabelText(/duration/i), '60');

    const addQuestionButton = screen.getByRole('button', { name: /add question/i });
    await user.click(addQuestionButton);

    // Should show question input fields
    await waitFor(() => {
      expect(screen.getByText(/question text/i)).toBeInTheDocument();
      expect(screen.getByText(/option 1/i)).toBeInTheDocument();
      expect(screen.getByText(/correct answer/i)).toBeInTheDocument();
    });
  });
});