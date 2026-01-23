import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Settings } from '../../../components/Settings';
import { createMockUser, mockSettingsData } from '../../utils/mockData';
import { AppSettings, User } from '../../../types';

const mockProps = {
  user: createMockUser(),
  settings: mockSettingsData,
  onUpdateSettings: vi.fn(),
  onClose: vi.fn(),
};

describe('Settings', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders settings interface', () => {
    render(<Settings {...mockProps} />);

    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('General')).toBeInTheDocument();
    expect(screen.getByText('Exam')).toBeInTheDocument();
    expect(screen.getByText('Flashcards')).toBeInTheDocument();
  });

  it('allows changing theme', async () => {
    render(<Settings {...mockProps} />);

    const themeSelect = screen.getByLabelText(/theme/i);
    await user.selectOptions(themeSelect, 'dark');

    expect(themeSelect).toHaveValue('dark');
  });

  it('toggles notifications', async () => {
    render(<Settings {...mockProps} />);

    const emailNotifications = screen.getByLabelText(/email notifications/i);
    await user.click(emailNotifications);

    expect(emailNotifications).not.toBeChecked();
  });

  it('saves settings successfully', async () => {
    render(<Settings {...mockProps} />);

    const saveButton = screen.getByRole('button', { name: /save settings/i });
    await user.click(saveButton);

    expect(mockProps.onUpdateSettings).toHaveBeenCalledWith(mockProps.settings);
    expect(screen.getByText(/settings saved/i)).toBeInTheDocument();
  });

  it('exports settings to file', async () => {
    const blobSpy = vi.spyOn(Blob.prototype, 'click');
    const createElementSpy = vi.spyOn(document, 'createElement');

    render(<Settings {...mockProps} />);

    const exportButton = screen.getByRole('button', { name: /export settings/i });
    await user.click(exportButton);

    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(blobSpy).toHaveBeenCalled();

    blobSpy.mockRestore();
    createElementSpy.mockRestore();
  });

  it('imports settings from file', async () => {
    const mockFileContent = JSON.stringify({
      theme: 'dark',
      language: 'es',
      notifications: {
        email: false,
        push: true
      }
    });

    render(<Settings {...mockProps} />);

    const importButton = screen.getByRole('button', { name: /import settings/i });
    const fileInput = screen.getByLabelText(/choose file/i);

    // Mock file selection
    const mockFile = new File([mockFileContent], 'settings.json', { type: 'application/json' });
    await user.upload(fileInput, mockFile);

    await waitFor(() => {
      expect(screen.getByText(/settings imported/i)).toBeInTheDocument();
    });
  });

  it('validates imported settings format', async () => {
    render(<Settings {...mockProps} />);

    const fileInput = screen.getByLabelText(/choose file/i);
    const mockFile = new File(['invalid json'], 'settings.json', { type: 'application/json' });
    
    await user.upload(fileInput, mockFile);

    await waitFor(() => {
      expect(screen.getByText(/failed to import/i)).toBeInTheDocument();
    });
  });

  it('resets settings to defaults', async () => {
    render(<Settings {...mockProps} />);

    // Change some settings
    const themeSelect = screen.getByLabelText(/theme/i);
    await user.selectOptions(themeSelect, 'dark');

    // Reset to defaults
    const resetButton = screen.getByRole('button', { name: /reset to defaults/i });
    await user.click(resetButton);

    // Should show confirmation dialog
    expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
  });

  it('closes settings modal', async () => {
    render(<Settings {...mockProps} />);

    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);

    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it('shows about section', () => {
    render(<Settings {...mockProps} />);

    // Navigate to about tab
    const aboutTab = screen.getByText('About');
    user.click(aboutTab);

    expect(screen.getByText('About Sinaesta')).toBeInTheDocument();
    expect(screen.getByText(/version/i)).toBeInTheDocument();
  });

  it('handles save errors gracefully', async () => {
    const errorProps = {
      ...mockProps,
      onUpdateSettings: vi.fn().mockImplementation(() => {
        throw new Error('Save failed');
      })
    };

    render(<Settings {...errorProps} />);

    const saveButton = screen.getByRole('button', { name: /save settings/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/failed to save/i)).toBeInTheDocument();
    });
  });
});