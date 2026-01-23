import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OSCEMode } from '../../../components/OSCEMode';
import { createMockUser, createTestScenario } from '../../utils/mockData';

const mockProps = {
  user: createMockUser(),
  onComplete: vi.fn(),
  onBack: vi.fn(),
};

describe('OSCESimulator', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders OSCE simulation interface', () => {
    render(<OSCEMode {...mockProps} />);

    expect(screen.getByText(/osce simulation/i)).toBeInTheDocument();
    expect(screen.getByText(/station 1/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument();
  });

  it('starts OSCE station', async () => {
    render(<OSCEMode {...mockProps} />);

    const startButton = screen.getByRole('button', { name: /start/i });
    await user.click(startButton);

    expect(screen.getByText(/patient vignette/i)).toBeInTheDocument();
    expect(screen.getByText(/instructions/i)).toBeInTheDocument();
  });

  it('handles timer countdown', () => {
    vi.useFakeTimers();
    
    render(<OSCEMode {...mockProps} />);

    const startButton = screen.getByRole('button', { name: /start/i });
    fireEvent.click(startButton);

    expect(screen.getByText(/time remaining/i)).toBeInTheDocument();
    
    // Advance timer
    vi.advanceTimersByTime(60000); // 1 minute
    expect(screen.getByText(/\d+:\d+/)).toBeInTheDocument();

    vi.useRealTimers();
  });

  it('allows interaction with simulated patient', async () => {
    render(<OSCEMode {...mockProps} />);

    const startButton = screen.getByRole('button', { name: /start/i });
    await user.click(startButton);

    // Simulate asking questions
    const questionButton = screen.getByRole('button', { name: /ask question/i });
    await user.click(questionButton);

    expect(screen.getByText(/patient response/i)).toBeInTheDocument();
  });

  it('handles OSCE station completion', async () => {
    render(<OSCEMode {...mockProps} />);

    const startButton = screen.getByRole('button', { name: /start/i });
    await user.click(startButton);

    // Simulate time completion
    vi.useFakeTimers();
    vi.advanceTimersByTime(300000); // 5 minutes
    vi.useRealTimers();

    await waitFor(() => {
      expect(screen.getByText(/station complete/i)).toBeInTheDocument();
    });
  });

  it('navigates between stations', async () => {
    render(<OSCEMode {...mockProps} />);

    const startButton = screen.getByRole('button', { name: /start/i });
    await user.click(startButton);

    // Complete first station
    vi.useFakeTimers();
    vi.advanceTimersByTime(300000);
    vi.useRealTimers();

    const nextButton = screen.getByRole('button', { name: /next station/i });
    await user.click(nextButton);

    expect(screen.getByText(/station 2/i)).toBeInTheDocument();
  });

  it('submits final assessment', async () => {
    render(<OSCEMode {...mockProps} />);

    // Mock completion of all stations
    for (let i = 1; i <= 5; i++) {
      const startButton = screen.getByRole('button', { name: /start station ${i}/i });
      if (startButton) {
        await user.click(startButton);
        
        vi.useFakeTimers();
        vi.advanceTimersByTime(300000);
        vi.useRealTimers();

        const nextButton = screen.getByRole('button', { name: i < 5 ? /next station/i : /finish/i });
        await user.click(nextButton);
      }
    }

    await waitFor(() => {
      expect(mockProps.onComplete).toHaveBeenCalled();
    });
  });
});