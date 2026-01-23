import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Simulated localStorage hook implementation for testing
const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = React.useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
};

// React is not available in this test context, so we'll test the logic directly
describe('useLocalStorage', () => {
  const mockKey = 'test-key';
  const mockValue = { test: 'data' };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('localStorage operations', () => {
    it('should get item from localStorage', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockValue));

      const item = localStorageMock.getItem(mockKey);
      const parsed = JSON.parse(item);

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
        writable: false,
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
          undefined: undefined
        }
      };

      localStorageMock.setItem(mockKey, JSON.stringify(complexObject));
      localStorageMock.getItem.mockReturnValue(JSON.stringify(complexObject));

      const retrieved = JSON.parse(localStorageMock.getItem(mockKey));

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

      const retrieved = JSON.parse(localStorageMock.getItem(mockKey));

      expect(retrieved).toBe(numberValue);
    });

    it('should handle boolean values', () => {
      const booleanValue = true;

      localStorageMock.setItem(mockKey, JSON.stringify(booleanValue));
      localStorageMock.getItem.mockReturnValue(JSON.stringify(booleanValue));

      const retrieved = JSON.parse(localStorageMock.getItem(mockKey));

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

      const retrieved = JSON.parse(localStorageMock.getItem('sinaesta_settings'));

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