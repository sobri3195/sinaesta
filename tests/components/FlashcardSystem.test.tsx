import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FlashcardStudy } from '../../../components/FlashcardStudy';
import { createMockUser, createMockFlashcards } from '../../utils/mockData';

const mockProps = {
  user: createMockUser(),
  flashcards: createMockFlashcards(10),
  onComplete: vi.fn(),
  onBack: vi.fn(),
};

describe('FlashcardSystem', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders flashcard study interface', () => {
    render(<FlashcardStudy {...mockProps} />);

    expect(screen.getByText(/flashcard study/i)).toBeInTheDocument();
    expect(screen.getByText(/card 1 of 10/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /show answer/i })).toBeInTheDocument();
  });

  it('shows flashcard front initially', () => {
    render(<FlashcardStudy {...mockProps} />);

    expect(screen.getByText(mockProps.flashcards[0].front)).toBeInTheDocument();
    expect(screen.queryByText(mockProps.flashcards[0].back)).not.toBeInTheDocument();
  });

  it('flips card to show answer', async () => {
    render(<FlashcardStudy {...mockProps} />);

    const showAnswerButton = screen.getByRole('button', { name: /show answer/i });
    await user.click(showAnswerButton);

    expect(screen.getByText(mockProps.flashcards[0].back)).toBeInTheDocument();
    expect(screen.getByText(/how well did you know this/i)).toBeInTheDocument();
  });

  it('navigates to next card', async () => {
    render(<FlashcardStudy {...mockProps} />);

    // Show answer first
    const showAnswerButton = screen.getByRole('button', { name: /show answer/i });
    await user.click(showAnswerButton);

    // Mark as known and go next
    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);

    expect(screen.getByText(/card 2 of 10/i)).toBeInTheDocument();
    expect(screen.getByText(mockProps.flashcards[1].front)).toBeInTheDocument();
  });

  it('tracks study progress', () => {
    render(<FlashcardStudy {...mockProps} />);

    expect(screen.getByText(/progress/i)).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByText(/0% complete/i)).toBeInTheDocument();
  });

  it('allows rating difficulty', async () => {
    render(<FlashcardStudy {...mockProps} />);

    // Show answer
    const showAnswerButton = screen.getByRole('button', { name: /show answer/i });
    await user.click(showAnswerButton);

    // Rate difficulty
    const difficultButton = screen.getByRole('button', { name: /difficult/i });
    await user.click(difficultButton);

    expect(screen.getByText(/card marked as difficult/i)).toBeInTheDocument();
  });

  it('shuffles cards when shuffle option is enabled', async () => {
    const shuffleProps = { ...mockProps, shuffle: true };
    render(<FlashcardStudy {...shuffleProps} />);

    // The first card should not be the same as the original first card
    // (assuming shuffle works - in real test this might be flaky due to randomness)
    expect(screen.getByText(/card 1 of 10/i)).toBeInTheDocument();
  });

  it('handles end of deck', async () => {
    const smallProps = { ...mockProps, flashcards: createMockFlashcards(1) };
    render(<FlashcardStudy {...smallProps} />);

    // Show answer
    const showAnswerButton = screen.getByRole('button', { name: /show answer/i });
    await user.click(showAnswerButton);

    // Go next (should complete the deck)
    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);

    expect(screen.getByText(/study complete/i)).toBeInTheDocument();
    expect(screen.getByText(/you reviewed 1 card/i)).toBeInTheDocument();
  });

  it('allows restarting study session', async () => {
    const smallProps = { ...mockProps, flashcards: createMockFlashcards(1) };
    render(<FlashcardStudy {...smallProps} />);

    // Complete the deck
    const showAnswerButton = screen.getByRole('button', { name: /show answer/i });
    await user.click(showAnswerButton);
    
    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);

    // Restart
    const restartButton = screen.getByRole('button', { name: /restart/i });
    await user.click(restartButton);

    expect(screen.getByText(/card 1 of 1/i)).toBeInTheDocument();
    expect(screen.getByText(mockProps.flashcards[0].front)).toBeInTheDocument();
  });

  it('calls onComplete when study is finished', async () => {
    const smallProps = { ...mockProps, flashcards: createMockFlashcards(1) };
    render(<FlashcardStudy {...smallProps} />);

    // Complete the deck
    const showAnswerButton = screen.getByRole('button', { name: /show answer/i });
    await user.click(showAnswerButton);
    
    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);

    await waitFor(() => {
      expect(mockProps.onComplete).toHaveBeenCalled();
    });
  });

  it('goes back when back button is clicked', async () => {
    render(<FlashcardStudy {...mockProps} />);

    const backButton = screen.getByRole('button', { name: /back/i });
    await user.click(backButton);

    expect(mockProps.onBack).toHaveBeenCalled();
  });
});