import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import ExamTaker from '../ExamTaker';
import { Exam } from '../../types';

const buildExam = (): Exam => ({
  id: 'exam_1',
  title: 'Sample Exam',
  description: 'Test exam',
  durationMinutes: 1,
  questions: [
    {
      id: 'q1',
      text: 'Question 1',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswerIndex: 1,
      explanation: 'Because B',
      category: 'General',
      difficulty: 'Easy',
      points: 1
    }
  ],
  topic: 'General',
  difficulty: 'Easy',
  createdAt: Date.now()
});

describe('ExamTaker', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('auto-saves progress to localStorage', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<ExamTaker exam={buildExam()} onSubmit={() => {}} onExit={() => {}} />);

    await user.click(screen.getByText('Option A'));

    vi.advanceTimersByTime(5000);

    const saved = localStorage.getItem('examo_progress_exam_1');
    expect(saved).toBeTruthy();
    expect(saved).toContain('"answers"');
  });

  it('auto-submits when timer expires', () => {
    const handleSubmit = vi.fn();
    render(<ExamTaker exam={buildExam()} onSubmit={handleSubmit} onExit={() => {}} />);

    vi.advanceTimersByTime(60000);

    expect(handleSubmit).toHaveBeenCalledWith([ -1 ]);
  });

  it('submits selected answers for scoring', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const handleSubmit = vi.fn();
    render(<ExamTaker exam={buildExam()} onSubmit={handleSubmit} onExit={() => {}} />);

    await user.click(screen.getByText('Option B'));
    await user.click(screen.getByRole('button', { name: 'Submit Exam' }));

    expect(handleSubmit).toHaveBeenCalledWith([1]);
  });
});
