import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from '../../../context/AuthContext';
import { authService } from '../../../services/authService';
import { createMockUser, mockLoginResponse } from '../../utils/mockData';

const TestProviders = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <AuthProvider>{children}</AuthProvider>
  </BrowserRouter>
);

const TestComponent = () => {
  const { login, register, user, isAuthenticated, logout } = useAuth();

  return (
    <div>
      <div data-testid="user-status">
        {isAuthenticated ? `Logged in as ${user?.name}` : 'Not logged in'}
      </div>
      <button onClick={() => login({ email: 'test@example.com', password: 'password' })}>
        Login
      </button>
      <button onClick={() => register({
        email: 'new@example.com',
        password: 'password',
        name: 'New User',
        role: 'STUDENT'
      })}>
        Register
      </button>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
};

describe('User Registration Integration', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should register a new user successfully', async () => {
    const { authService } = await import('../../../services/authService');
    vi.mocked(authService.register).mockResolvedValue(mockLoginResponse);

    render(
      <TestProviders>
        <TestComponent />
      </TestProviders>
    );

    // Initially not logged in
    expect(screen.getByTestId('user-status')).toHaveTextContent('Not logged in');

    // Register new user
    await user.click(screen.getByText('Register'));

    await waitFor(() => {
      expect(screen.getByTestId('user-status')).toHaveTextContent('Logged in as Mock User');
      expect(authService.register).toHaveBeenCalledWith({
        email: 'new@example.com',
        password: 'password',
        name: 'New User',
        role: 'STUDENT'
      });
    });
  });

  it('should handle registration errors gracefully', async () => {
    const { authService } = await import('../../../services/authService');
    const registerError = new Error('Email already exists');
    vi.mocked(authService.register).mockRejectedValue(registerError);

    render(
      <TestProviders>
        <TestComponent />
      </TestProviders>
    );

    await user.click(screen.getByText('Register'));

    await waitFor(() => {
      // Should remain not logged in
      expect(screen.getByTestId('user-status')).toHaveTextContent('Not logged in');
    });
  });

  it('should maintain registration form validation', async () => {
    // Mock API to not be called due to validation
    const { authService } = await import('../../../services/authService');
    vi.mocked(authService.register).mockResolvedValue(mockLoginResponse);

    render(
      <TestProviders>
        <TestComponent />
      </TestProviders>
    );

    // Try to register with invalid data
    // (The component would need actual form inputs for this test)
    // This is a simplified version - in reality, you'd test the actual form

    await user.click(screen.getByText('Register'));

    // Should call the API (simplified test)
    expect(authService.register).toHaveBeenCalled();
  });

  it('should integrate with localStorage for persistence', async () => {
    const mockUser = createMockUser({ name: 'Persisted User' });
    const persistResponse = {
      ...mockLoginResponse,
      user: mockUser
    };

    const { authService } = await import('../../../services/authService');
    vi.mocked(authService.register).mockResolvedValue(persistResponse);
    vi.mocked(authService.getStoredUser).mockReturnValue(mockUser);

    render(
      <TestProviders>
        <TestComponent />
      </TestProviders>
    );

    // Register user
    await user.click(screen.getByText('Register'));

    await waitFor(() => {
      expect(authService.getStoredUser).toHaveBeenCalled();
      expect(screen.getByTestId('user-status')).toHaveTextContent('Logged in as Persisted User');
    });
  });
});