import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginSelectionModal } from '../../../components/LoginSelectionModal';
import { createMockUser } from '../../utils/mockData';

// Mock the auth context
vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({
    login: vi.fn(),
    register: vi.fn(),
    isLoading: false,
  })
}));

interface LoginSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (credentials: { email: string; password: string }) => Promise<void>;
  onRegister: (data: { email: string; password: string; name: string; role: string }) => Promise<void>;
}

const mockProps: LoginSelectionModalProps = {
  isOpen: true,
  onClose: vi.fn(),
  onLogin: vi.fn(),
  onRegister: vi.fn(),
};

describe('LoginSelectionModal', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders login selection modal when open', () => {
    render(<LoginSelectionModal {...mockProps} />);

    expect(screen.getByText('Welcome to Sinaesta')).toBeInTheDocument();
    expect(screen.getByText('Choose your login type')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /student login/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /admin login/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /mentor login/i })).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<LoginSelectionModal {...mockProps} isOpen={false} />);

    expect(screen.queryByText('Welcome to Sinaesta')).not.toBeInTheDocument();
  });

  it('closes modal when close button is clicked', async () => {
    render(<LoginSelectionModal {...mockProps} />);

    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);

    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it('shows student login form when student button is clicked', async () => {
    render(<LoginSelectionModal {...mockProps} />);

    const studentButton = screen.getByRole('button', { name: /student login/i });
    await user.click(studentButton);

    expect(screen.getByText('Student Login')).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('shows admin login form when admin button is clicked', async () => {
    render(<LoginSelectionModal {...mockProps} />);

    const adminButton = screen.getByRole('button', { name: /admin login/i });
    await user.click(adminButton);

    expect(screen.getByText('Admin Login')).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('shows mentor login form when mentor button is clicked', async () => {
    render(<LoginSelectionModal {...mockProps} />);

    const mentorButton = screen.getByRole('button', { name: /mentor login/i });
    await user.click(mentorButton);

    expect(screen.getByText('Mentor Login')).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('handles student login', async () => {
    const mockLogin = vi.fn().mockResolvedValue(undefined);
    
    render(<LoginSelectionModal {...mockProps} onLogin={mockLogin} />);

    // Click student login
    const studentButton = screen.getByRole('button', { name: /student login/i });
    await user.click(studentButton);

    // Fill login form
    await user.type(screen.getByLabelText(/email/i), 'student@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');

    // Submit login
    const loginButton = screen.getByRole('button', { name: /login/i });
    await user.click(loginButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'student@example.com',
        password: 'password123'
      });
    });
  });

  it('validates login form', async () => {
    render(<LoginSelectionModal {...mockProps} />);

    // Click student login
    const studentButton = screen.getByRole('button', { name: /student login/i });
    await user.click(studentButton);

    // Try to submit empty form
    const loginButton = screen.getByRole('button', { name: /login/i });
    await user.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('shows registration form when register link is clicked', async () => {
    render(<LoginSelectionModal {...mockProps} />);

    // Click student login
    const studentButton = screen.getByRole('button', { name: /student login/i });
    await user.click(studentButton);

    // Click register link
    const registerLink = screen.getByRole('link', { name: /register here/i });
    await user.click(registerLink);

    expect(screen.getByText('Student Registration')).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  it('handles student registration', async () => {
    const mockRegister = vi.fn().mockResolvedValue(undefined);
    
    render(<LoginSelectionModal {...mockProps} onRegister={mockRegister} />);

    // Click student login first
    const studentButton = screen.getByRole('button', { name: /student login/i });
    await user.click(studentButton);

    // Click register link
    const registerLink = screen.getByRole('link', { name: /register here/i });
    await user.click(registerLink);

    // Fill registration form
    await user.type(screen.getByLabelText(/name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');

    // Submit registration
    const registerButton = screen.getByRole('button', { name: /register/i });
    await user.click(registerButton);

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        email: 'john@example.com',
        password: 'password123',
        name: 'John Doe',
        role: 'STUDENT'
      });
    });
  });

  it('validates registration form', async () => {
    render(<LoginSelectionModal {...mockProps} />);

    // Click student login
    const studentButton = screen.getByRole('button', { name: /student login/i });
    await user.click(studentButton);

    // Click register link
    const registerLink = screen.getByRole('link', { name: /register here/i });
    await user.click(registerLink);

    // Try to submit empty form
    const registerButton = screen.getByRole('button', { name: /register/i });
    await user.click(registerButton);

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('toggles password visibility', async () => {
    render(<LoginSelectionModal {...mockProps} />);

    // Click student login
    const studentButton = screen.getByRole('button', { name: /student login/i });
    await user.click(studentButton);

    const passwordInput = screen.getByLabelText(/password/i);
    const toggleButton = screen.getByRole('button', { name: '' }); // Eye icon button

    expect(passwordInput).toHaveAttribute('type', 'password');

    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
  });

  it('handles login errors', async () => {
    const mockLogin = vi.fn().mockRejectedValue(new Error('Invalid credentials'));
    
    render(<LoginSelectionModal {...mockProps} onLogin={mockLogin} />);

    // Click student login
    const studentButton = screen.getByRole('button', { name: /student login/i });
    await user.click(studentButton);

    // Fill and submit login form
    await user.type(screen.getByLabelText(/email/i), 'student@example.com');
    await user.type(screen.getByLabelText(/password/i), 'wrongpassword');

    const loginButton = screen.getByRole('button', { name: /login/i });
    await user.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  it('shows loading state during login', async () => {
    const mockLogin = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));
    
    render(<LoginSelectionModal {...mockProps} onLogin={mockLogin} />);

    // Click student login
    const studentButton = screen.getByRole('button', { name: /student login/i });
    await user.click(studentButton);

    // Fill and submit login form
    await user.type(screen.getByLabelText(/email/i), 'student@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');

    const loginButton = screen.getByRole('button', { name: /login/i });
    await user.click(loginButton);

    expect(screen.getByText(/logging in/i)).toBeInTheDocument();
    expect(loginButton).toBeDisabled();
  });

  it('navigates back to role selection', async () => {
    render(<LoginSelectionModal {...mockProps} />);

    // Click student login
    const studentButton = screen.getByRole('button', { name: /student login/i });
    await user.click(studentButton);

    // Click back button
    const backButton = screen.getByRole('button', { name: /back/i });
    await user.click(backButton);

    expect(screen.getByText('Choose your login type')).toBeInTheDocument();
  });
});