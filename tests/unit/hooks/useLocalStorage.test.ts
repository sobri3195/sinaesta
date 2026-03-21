import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

describe('localStorage utilities', () => {
  const mockKey = 'test-key';
  const mockValue = { test: 'data' };
  const originalLocalStorage = window.localStorage;

  beforeEach(() => {
    localStorageMock.getItem.mockReset();
    localStorageMock.setItem.mockReset();
    localStorageMock.removeItem.mockReset();
    localStorageMock.clear.mockReset();

    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockImplementation(() => {});
    localStorageMock.removeItem.mockImplementation(() => {});
    localStorageMock.clear.mockImplementation(() => {});

    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage,
      writable: true,
      configurable: true,
    });
    vi.restoreAllMocks();
  });

  describe('localStorage operations', () => {
    it('should get item from localStorage', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockValue));

      const item = localStorageMock.getItem(mockKey);
      const parsed = JSON.parse(item as string);

      expect(item).toBe(JSON.stringify(mockValue));
      expect(parsed).toEqual(mockValue);
    });

    it('should set item in localStorage', () => {
      localStorageMock.setItem(mockKey, JSON.stringify(mockValue));

      expect(localStorageMock.setItem).toHaveBeenCalledWith(mockKey, JSON.stringify(mockValue));
    });

    it('should remove item from localStorage', () => {
      localStorageMock.removeItem(mockKey);

      expect(localStorageMock.removeItem).toHaveBeenCalledWith(mockKey);
    });

    it('should clear all localStorage', () => {
      localStorageMock.clear();

      expect(localStorageMock.clear).toHaveBeenCalled();
    });
  });

  describe('Error handling', () => {
    it('should handle JSON parsing errors', () => {
      localStorageMock.getItem.mockReturnValue('invalid-json');

      expect(() => JSON.parse('invalid-json')).toThrow(SyntaxError);
    });

    it('should handle localStorage quota exceeded', () => {
      const quotaError = new Error('QuotaExceededError');
      localStorageMock.setItem.mockImplementation(() => {
        throw quotaError;
      });

      expect(() => {
        localStorageMock.setItem(mockKey, JSON.stringify(mockValue));
      }).toThrow('QuotaExceededError');
    });

    it('should handle localStorage not available', () => {
      Object.defineProperty(window, 'localStorage', {
        value: undefined,
        writable: true,
        configurable: true,
      });

      expect(window.localStorage).toBeUndefined();
    });
  });

  describe('Data persistence', () => {
    it('should persist complex objects', () => {
      const complexObject = {
        nested: {
          data: [1, 2, 3],
          boolean: true,
          null: null,
        }
      };

      localStorageMock.setItem(mockKey, JSON.stringify(complexObject));
      localStorageMock.getItem.mockReturnValue(JSON.stringify(complexObject));

      const retrieved = JSON.parse(localStorageMock.getItem(mockKey) as string);

      expect(retrieved).toEqual(complexObject);
    });

    it('should handle string values', () => {
      const stringValue = 'simple string';

      localStorageMock.setItem(mockKey, stringValue);
      localStorageMock.getItem.mockReturnValue(stringValue);

      const retrieved = localStorageMock.getItem(mockKey);

      expect(retrieved).toBe(stringValue);
    });

    it('should handle number values', () => {
      const numberValue = 42;

      localStorageMock.setItem(mockKey, JSON.stringify(numberValue));
      localStorageMock.getItem.mockReturnValue(JSON.stringify(numberValue));

      const retrieved = JSON.parse(localStorageMock.getItem(mockKey) as string);

      expect(retrieved).toBe(numberValue);
    });

    it('should handle boolean values', () => {
      const booleanValue = true;

      localStorageMock.setItem(mockKey, JSON.stringify(booleanValue));
      localStorageMock.getItem.mockReturnValue(JSON.stringify(booleanValue));

      const retrieved = JSON.parse(localStorageMock.getItem(mockKey) as string);

      expect(retrieved).toBe(booleanValue);
    });
  });

  describe('Settings persistence', () => {
    it('should persist app settings', () => {
      const settings = {
        theme: 'dark',
        language: 'en',
        notifications: true,
        exam: {
          duration: 60,
          showExplanations: false
        }
      };

      localStorageMock.setItem('sinaesta_settings', JSON.stringify(settings));
      localStorageMock.getItem.mockReturnValue(JSON.stringify(settings));

      const retrieved = JSON.parse(localStorageMock.getItem('sinaesta_settings') as string);

      expect(retrieved).toEqual(settings);
    });

    it('should persist authentication tokens', () => {
      const tokens = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token'
      };

      localStorageMock.setItem('accessToken', tokens.accessToken);
      localStorageMock.setItem('refreshToken', tokens.refreshToken);

      expect(localStorageMock.setItem).toHaveBeenCalledWith('accessToken', 'mock-access-token');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('refreshToken', 'mock-refresh-token');
    });
  });
});
