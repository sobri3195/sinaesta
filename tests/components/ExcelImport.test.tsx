import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExcelImport } from '../../../components/ExcelImport';
import { createMockUser } from '../../utils/mockData';

// Mock xlsx library
vi.mock('xlsx', () => ({
  readFile: vi.fn(),
  utils: {
    json_to_sheet: vi.fn(),
    sheet_to_json: vi.fn(() => [
      {
        question: 'What is the capital of France?',
        option1: 'Paris',
        option2: 'London',
        option3: 'Berlin',
        option4: 'Madrid',
        correctAnswer: 'Paris',
        explanation: 'Paris is the capital of France.',
        category: 'Geography',
        difficulty: 'Easy'
      }
    ])
  }
}));

const mockProps = {
  user: createMockUser(),
  onImportComplete: vi.fn(),
  onClose: vi.fn(),
};

describe('ExcelImport', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders import interface', () => {
    render(<ExcelImport {...mockProps} />);

    expect(screen.getByText('Import Questions from Excel')).toBeInTheDocument();
    expect(screen.getByText(/download template/i)).toBeInTheDocument();
    expect(screen.getByText(/choose file/i)).toBeInTheDocument();
  });

  it('downloads template file', async () => {
    const { utils } = await import('xlsx');
    
    render(<ExcelImport {...mockProps} />);

    const downloadButton = screen.getByRole('button', { name: /download template/i });
    await user.click(downloadButton);

    expect(utils.json_to_sheet).toHaveBeenCalled();
    expect(utils.sheet_to_json).toHaveBeenCalled();
  });

  it('validates file type', async () => {
    render(<ExcelImport {...mockProps} />);

    const fileInput = screen.getByLabelText(/choose file/i);
    
    // Create a mock file that is not Excel
    const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' });
    await user.upload(fileInput, invalidFile);

    await waitFor(() => {
      expect(screen.getByText(/please select an excel file/i)).toBeInTheDocument();
    });
  });

  it('processes valid Excel file', async () => {
    const { utils } = await import('xlsx');
    vi.mocked(utils.sheet_to_json).mockReturnValue([
      {
        question: 'What is the capital of France?',
        option1: 'Paris',
        option2: 'London',
        option3: 'Berlin',
        option4: 'Madrid',
        correctAnswer: 'Paris',
        explanation: 'Paris is the capital of France.',
        category: 'Geography',
        difficulty: 'Easy'
      }
    ]);

    render(<ExcelImport {...mockProps} />);

    const fileInput = screen.getByLabelText(/choose file/i);
    
    // Create a mock Excel file
    const excelFile = new File(['mock'], 'questions.xlsx', { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    await user.upload(fileInput, excelFile);

    await waitFor(() => {
      expect(screen.getByText(/processing file/i)).toBeVisible();
    });

    await waitFor(() => {
      expect(screen.getByText(/1 question imported/i)).toBeVisible();
      expect(mockProps.onImportComplete).toHaveBeenCalledWith([
        expect.objectContaining({
          question: 'What is the capital of France?',
          category: 'Geography'
        })
      ]);
    });
  });

  it('handles invalid Excel structure', async () => {
    const { utils } = await import('xlsx');
    vi.mocked(utils.sheet_to_json).mockReturnValue([
      {
        // Missing required fields
        question: 'What is the capital?'
        // Missing options, correctAnswer, etc.
      }
    ]);

    render(<ExcelImport {...mockProps} />);

    const fileInput = screen.getByLabelText(/choose file/i);
    const excelFile = new File(['mock'], 'questions.xlsx', { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    await user.upload(fileInput, excelFile);

    await waitFor(() => {
      expect(screen.getByText(/invalid file format/i)).toBeInTheDocument();
    });
  });

  it('handles file processing errors', async () => {
    const { readFile } = await import('xlsx');
    vi.mocked(readFile).mockImplementation(() => {
      throw new Error('File read error');
    });

    render(<ExcelImport {...mockProps} />);

    const fileInput = screen.getByLabelText(/choose file/i);
    const excelFile = new File(['mock'], 'questions.xlsx', { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    await user.upload(fileInput, excelFile);

    await waitFor(() => {
      expect(screen.getByText(/error processing file/i)).toBeInTheDocument();
    });
  });

  it('shows preview of imported questions', async () => {
    const { utils } = await import('xlsx');
    vi.mocked(utils.sheet_to_json).mockReturnValue([
      {
        question: 'What is the capital of France?',
        option1: 'Paris',
        option2: 'London',
        option3: 'Berlin',
        option4: 'Madrid',
        correctAnswer: 'Paris',
        explanation: 'Paris is the capital of France.',
        category: 'Geography',
        difficulty: 'Easy'
      },
      {
        question: 'What is 2+2?',
        option1: '3',
        option2: '4',
        option3: '5',
        option4: '6',
        correctAnswer: '4',
        explanation: 'Basic arithmetic.',
        category: 'Mathematics',
        difficulty: 'Easy'
      }
    ]);

    render(<ExcelImport {...mockProps} />);

    const fileInput = screen.getByLabelText(/choose file/i);
    const excelFile = new File(['mock'], 'questions.xlsx', { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    await user.upload(fileInput, excelFile);

    await waitFor(() => {
      expect(screen.getByText(/2 questions imported/i)).toBeInTheDocument();
      expect(screen.getByText('What is the capital of France?')).toBeVisible();
      expect(screen.getByText('What is 2+2?')).toBeVisible();
    });
  });

  it('allows editing imported questions', async () => {
    const { utils } = await import('xlsx');
    vi.mocked(utils.sheet_to_json).mockReturnValue([
      {
        question: 'What is the capital of France?',
        option1: 'Paris',
        option2: 'London',
        option3: 'Berlin',
        option4: 'Madrid',
        correctAnswer: 'Paris',
        explanation: 'Paris is the capital of France.',
        category: 'Geography',
        difficulty: 'Easy'
      }
    ]);

    render(<ExcelImport {...mockProps} />);

    const fileInput = screen.getByLabelText(/choose file/i);
    const excelFile = new File(['mock'], 'questions.xlsx', { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    await user.upload(fileInput, excelFile);

    await waitFor(() => {
      expect(screen.getByText(/1 question imported/i)).toBeVisible();
    });

    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);

    expect(screen.getByText(/edit question/i)).toBeVisible();
    
    // Edit the question
    const questionInput = screen.getByLabelText(/question text/i);
    await user.clear(questionInput);
    await user.type(questionInput, 'What is the largest planet?');
    
    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    expect(screen.getByText(/What is the largest planet?/i)).toBeVisible();
  });

  it('cancels import and calls onClose', async () => {
    render(<ExcelImport {...mockProps} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it('confirms import and calls onImportComplete', async () => {
    const { utils } = await import('xlsx');
    vi.mocked(utils.sheet_to_json).mockReturnValue([
      {
        question: 'What is the capital of France?',
        option1: 'Paris',
        option2: 'London',
        option3: 'Berlin',
        option4: 'Madrid',
        correctAnswer: 'Paris',
        explanation: 'Paris is the capital of France.',
        category: 'Geography',
        difficulty: 'Easy'
      }
    ]);

    render(<ExcelImport {...mockProps} />);

    const fileInput = screen.getByLabelText(/choose file/i);
    const excelFile = new File(['mock'], 'questions.xlsx', { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    await user.upload(fileInput, excelFile);

    await waitFor(() => {
      expect(screen.getByText(/1 question imported/i)).toBeVisible();
    });

    const confirmButton = screen.getByRole('button', { name: /confirm import/i });
    await user.click(confirmButton);

    expect(mockProps.onImportComplete).toHaveBeenCalledWith([
      expect.objectContaining({
        question: 'What is the capital of France?',
        category: 'Geography'
      })
    ]);
  });

  it('removes individual questions', async () => {
    const { utils } = await import('xlsx');
    vi.mocked(utils.sheet_to_json).mockReturnValue([
      {
        question: 'What is the capital of France?',
        option1: 'Paris',
        option2: 'London',
        option3: 'Berlin',
        option4: 'Madrid',
        correctAnswer: 'Paris',
        explanation: 'Paris is the capital of France.',
        category: 'Geography',
        difficulty: 'Easy'
      }
    ]);

    render(<ExcelImport {...mockProps} />);

    const fileInput = screen.getByLabelText(/choose file/i);
    const excelFile = new File(['mock'], 'questions.xlsx', { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    await user.upload(fileInput, excelFile);

    await waitFor(() => {
      expect(screen.getByText('What is the capital of France?')).toBeVisible();
    });

    const removeButton = screen.getByRole('button', { name: /remove/i });
    await user.click(removeButton);

    await waitFor(() => {
      expect(screen.getByText(/no questions imported/i)).toBeVisible();
    });
  });
});