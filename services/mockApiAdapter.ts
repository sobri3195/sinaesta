/**
 * Mock API Adapter
 * 
 * This adapter intercepts API calls and routes them to the mock backend
 * when demo mode is active. It provides seamless integration between
 * the existing apiService and demoAuthService.
 */

import { demoAuthService } from './demoAuthService';

interface MockApiConfig {
  enabled: boolean;
  logRequests: boolean;
  simulateDelay: boolean;
  delayMs: number;
}

class MockApiAdapter {
  private config: MockApiConfig = {
    enabled: false,
    logRequests: true,
    simulateDelay: true,
    delayMs: 300
  };

  constructor() {
    // Auto-detect demo mode from demoAuthService
    this.updateConfigFromDemo();
  }

  private updateConfigFromDemo() {
    this.config.enabled = !demoAuthService.isBackendActive();
    this.config.logRequests = demoAuthService.isDebugMode();
  }

  /**
   * Check if mock API should intercept this request
   */
  shouldIntercept(url: string): boolean {
    this.updateConfigFromDemo();
    
    // Don't intercept if backend is enabled
    if (!this.config.enabled) {
      return false;
    }

    // Don't intercept external URLs
    if (url.startsWith('http://') || url.startsWith('https://')) {
      if (!url.includes('localhost') && !url.includes('127.0.0.1')) {
        return false;
      }
    }

    return true;
  }

  /**
   * Extract endpoint path from full URL
   */
  private extractEndpoint(url: string): string {
    try {
      // Remove base URL if present
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      let endpoint = url;

      if (url.startsWith(apiBase)) {
        endpoint = url.substring(apiBase.length);
      } else if (url.startsWith('/api')) {
        endpoint = url.substring(4);
      }

      // Ensure endpoint starts with /
      if (!endpoint.startsWith('/')) {
        endpoint = '/' + endpoint;
      }

      return endpoint;
    } catch (error) {
      console.error('Error extracting endpoint:', error);
      return url;
    }
  }

  /**
   * Parse request body based on content type
   */
  private parseRequestBody(body: any, headers: Record<string, string>): any {
    if (!body) return undefined;

    const contentType = headers['Content-Type'] || headers['content-type'] || '';

    // If it's FormData, return as-is
    if (typeof FormData !== 'undefined' && body instanceof FormData) {
      return body;
    }

    // If it's already parsed, return as-is
    if (typeof body === 'object' && !(body instanceof FormData)) {
      return body;
    }

    // If it's a string and JSON content type, parse it
    if (typeof body === 'string' && contentType.includes('application/json')) {
      try {
        return JSON.parse(body);
      } catch {
        return body;
      }
    }

    return body;
  }

  /**
   * Intercept and handle API request with mock backend
   */
  async intercept(url: string, options: RequestInit = {}): Promise<Response> {
    const endpoint = this.extractEndpoint(url);
    const method = (options.method || 'GET').toUpperCase();
    const headers = (options.headers as Record<string, string>) || {};
    const body = this.parseRequestBody(options.body, headers);

    if (this.config.logRequests) {
      console.log(`[MockAPI] Intercepting: ${method} ${endpoint}`);
    }

    try {
      // Call mock backend
      const result = await demoAuthService.mockBackendRequest(endpoint, method, body);

      // Create mock Response object
      const mockResponse = new Response(JSON.stringify(result), {
        status: 200,
        statusText: 'OK',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return mockResponse;

    } catch (error: any) {
      // Create error response
      const errorResponse = new Response(
        JSON.stringify({
          error: error.message || 'Mock API error',
          details: error
        }),
        {
          status: error.status || 400,
          statusText: error.message || 'Bad Request',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return errorResponse;
    }
  }

  /**
   * Enhanced fetch that automatically uses mock API when in demo mode
   */
  async fetch(url: string, options: RequestInit = {}): Promise<Response> {
    if (this.shouldIntercept(url)) {
      return this.intercept(url, options);
    }

    // Fall back to real fetch
    return fetch(url, options);
  }

  /**
   * Get configuration
   */
  getConfig(): MockApiConfig {
    this.updateConfigFromDemo();
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  setConfig(config: Partial<MockApiConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Enable/disable mock API
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    demoAuthService.setBackendEnabled(!enabled);
  }

  /**
   * Check if mock API is enabled
   */
  isEnabled(): boolean {
    this.updateConfigFromDemo();
    return this.config.enabled;
  }
}

// Export singleton instance
export const mockApiAdapter = new MockApiAdapter();

/**
 * Enhanced fetch function that automatically uses mock API when appropriate
 */
export const enhancedFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  return mockApiAdapter.fetch(url, options);
};

/**
 * Hook for components to check if mock API is active
 */
export const useMockApi = () => {
  return {
    isEnabled: mockApiAdapter.isEnabled(),
    config: mockApiAdapter.getConfig(),
    setEnabled: (enabled: boolean) => mockApiAdapter.setEnabled(enabled)
  };
};

export default mockApiAdapter;
