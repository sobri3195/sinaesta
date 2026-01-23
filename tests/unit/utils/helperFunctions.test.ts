import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Simple utility function to test
export const add = (a: number, b: number) => a + b;
export const multiply = (a: number, b: number) => a * b;
export const divide = (a: number, b: number) => {
  if (b === 0) throw new Error('Division by zero');
  return a / b;
};

describe('Utility Functions', () => {
  beforeEach(() => {
    // Setup before each test
  });

  afterEach(() => {
    // Cleanup after each test
    vi.clearAllMocks();
  });

  describe('add', () => {
    it('should add two positive numbers correctly', () => {
      expect(add(2, 3)).toBe(5);
    });

    it('should add negative numbers correctly', () => {
      expect(add(-1, -2)).toBe(-3);
    });

    it('should add mixed positive and negative numbers', () => {
      expect(add(5, -3)).toBe(2);
    });
  });

  describe('multiply', () => {
    it('should multiply two positive numbers correctly', () => {
      expect(multiply(4, 5)).toBe(20);
    });

    it('should handle multiplication by zero', () => {
      expect(multiply(5, 0)).toBe(0);
    });

    it('should multiply negative numbers correctly', () => {
      expect(multiply(-2, 3)).toBe(-6);
    });
  });

  describe('divide', () => {
    it('should divide two numbers correctly', () => {
      expect(divide(10, 2)).toBe(5);
    });

    it('should throw error when dividing by zero', () => {
      expect(() => divide(10, 0)).toThrow('Division by zero');
    });

    it('should handle decimal results', () => {
      expect(divide(7, 2)).toBe(3.5);
    });
  });

  describe('Mock examples', () => {
    it('should demonstrate vitest mocking', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      console.log('Test message');
      
      expect(consoleSpy).toHaveBeenCalledWith('Test message');
      expect(consoleSpy).toHaveBeenCalledTimes(1);
      
      consoleSpy.mockRestore();
    });

    it('should demonstrate async mocking', async () => {
      const asyncFunction = vi.fn().mockResolvedValue('async result');
      
      const result = await asyncFunction();
      
      expect(result).toBe('async result');
      expect(asyncFunction).toHaveBeenCalledTimes(1);
    });
  });
});