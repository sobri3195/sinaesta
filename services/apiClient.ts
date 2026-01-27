/**
 * Enhanced API Client with Advanced Features
 * - Automatic token refresh
 * - Request/response interceptors
 * - Retry logic with exponential backoff
 * - Request deduplication
 * - Response caching
 * - Offline detection
 * - Centralized error handling
 * - Request cancellation
 */

import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { demoAuthService } from './demoAuthService';
import {
  ApiErrorCode,
  ApiErrorResponse,
  RequestConfig,
  CacheEntry,
  PendingRequest,
  ApiResponse
} from '../types/api';

// ============================================================================
// Custom API Error Class
// ============================================================================

export class ApiError extends Error {
  public readonly code: ApiErrorCode;
  public readonly statusCode?: number;
  public readonly details?: any;
  public readonly timestamp: number;
  public readonly isRetryable: boolean;

  constructor(
    message: string,
    code: ApiErrorCode = ApiErrorCode.UNKNOWN,
    statusCode?: number,
    details?: any
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = Date.now();
    this.isRetryable = this.determineIfRetryable();
    
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  private determineIfRetryable(): boolean {
    const retryableCodes = [
      ApiErrorCode.TIMEOUT,
      ApiErrorCode.NETWORK_ERROR,
      ApiErrorCode.SERVICE_UNAVAILABLE,
      ApiErrorCode.RATE_LIMIT_EXCEEDED
    ];
    const retryableStatusCodes = [408, 429, 500, 502, 503, 504];
    
    return (
      retryableCodes.includes(this.code) ||
      (this.statusCode !== undefined && retryableStatusCodes.includes(this.statusCode))
    );
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
      timestamp: this.timestamp,
      isRetryable: this.isRetryable
    };
  }
}

// ============================================================================
// API Client Configuration
// ============================================================================

interface ApiClientConfig {
  baseURL: string;
  timeout: number;
  enableCache: boolean;
  cacheTTL: number;
  enableRetry: boolean;
  maxRetries: number;
  retryDelay: number;
  enableDeduplication: boolean;
  enableLogging: boolean;
}

const defaultConfig: ApiClientConfig = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 30000, // 30 seconds
  enableCache: true,
  cacheTTL: 5 * 60 * 1000, // 5 minutes
  enableRetry: true,
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  enableDeduplication: true,
  enableLogging: import.meta.env.DEV || false
};

// ============================================================================
// API Client Class
// ============================================================================

export class ApiClient {
  private axiosInstance: AxiosInstance;
  private config: ApiClientConfig;
  private cache: Map<string, CacheEntry<any>>;
  private pendingRequests: Map<string, PendingRequest>;
  private isRefreshing: boolean;
  private refreshSubscribers: ((token: string) => void)[];
  private offlineQueue: (() => Promise<any>)[];
  private isOnline: boolean;

  constructor(config?: Partial<ApiClientConfig>) {
    this.config = { ...defaultConfig, ...config };
    this.cache = new Map();
    this.pendingRequests = new Map();
    this.isRefreshing = false;
    this.refreshSubscribers = [];
    this.offlineQueue = [];
    this.isOnline = navigator.onLine;

    // Create axios instance
    this.axiosInstance = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Setup interceptors
    this.setupRequestInterceptor();
    this.setupResponseInterceptor();

    // Setup online/offline detection
    this.setupOfflineDetection();

    // Cleanup cache periodically
    this.startCacheCleanup();
  }

  // ============================================================================
  // Request Interceptor
  // ============================================================================

  private setupRequestInterceptor(): void {
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Add auth token
        const token = localStorage.getItem('accessToken');
        if (token && !config.headers['Authorization']) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }

        // Log request in development
        if (this.config.enableLogging) {
          console.log('[API Request]', {
            method: config.method?.toUpperCase(),
            url: config.url,
            params: config.params,
            data: config.data
          });
        }

        return config;
      },
      (error) => {
        if (this.config.enableLogging) {
          console.error('[API Request Error]', error);
        }
        return Promise.reject(error);
      }
    );
  }

  // ============================================================================
  // Response Interceptor
  // ============================================================================

  private setupResponseInterceptor(): void {
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        // Log response in development
        if (this.config.enableLogging) {
          console.log('[API Response]', {
            method: response.config.method?.toUpperCase(),
            url: response.config.url,
            status: response.status,
            data: response.data
          });
        }

        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Log error in development
        if (this.config.enableLogging) {
          console.error('[API Response Error]', {
            method: originalRequest?.method?.toUpperCase(),
            url: originalRequest?.url,
            status: error.response?.status,
            error: error.message
          });
        }

        // Handle token refresh for 401 errors
        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
          // Check if it's a demo token
          let isDemoToken = false;
          try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
              const user = JSON.parse(userStr);
              isDemoToken = user.email && demoAuthService.isDemoAccount(user.email);
            }
          } catch (e) {
            console.error('Error parsing user for demo token check', e);
          }

          if (this.isRefreshing) {
            // Wait for token refresh to complete
            return new Promise((resolve) => {
              this.refreshSubscribers.push((token: string) => {
                originalRequest.headers['Authorization'] = `Bearer ${token}`;
                resolve(this.axiosInstance(originalRequest));
              });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
              throw new Error('No refresh token available');
            }

            let newAccessToken: string;
            let newRefreshToken: string | undefined;

            if (isDemoToken) {
              // Use demo token refresh
              const tokens = await demoAuthService.refreshDemoTokens(refreshToken);
              newAccessToken = tokens.accessToken;
              newRefreshToken = tokens.refreshToken;
            } else {
              // Use real token refresh
              const response = await axios.post(`${this.config.baseURL}/auth/refresh`, {
                refreshToken
              });
              const data = response.data.data;
              newAccessToken = data.accessToken;
              newRefreshToken = data.refreshToken;
            }
            
            localStorage.setItem('accessToken', newAccessToken);
            if (newRefreshToken) {
              localStorage.setItem('refreshToken', newRefreshToken);
            }

            // Notify subscribers
            this.refreshSubscribers.forEach((callback) => callback(newAccessToken));
            this.refreshSubscribers = [];

            // Retry original request
            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
            return this.axiosInstance(originalRequest);
          } catch (refreshError) {
            // Token refresh failed, clear auth and redirect
            this.clearAuth();
            window.location.href = '/';
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(this.handleError(error));
      }
    );
  }

  // ============================================================================
  // Error Handling
  // ============================================================================

  private handleError(error: AxiosError): ApiError {
    // Network errors
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        return new ApiError(
          'Request timeout',
          ApiErrorCode.TIMEOUT,
          undefined,
          { originalError: error.message }
        );
      }
      
      return new ApiError(
        'Network error occurred',
        ApiErrorCode.NETWORK_ERROR,
        undefined,
        { originalError: error.message }
      );
    }

    // HTTP errors
    const status = error.response.status;
    const data = error.response.data as ApiErrorResponse;

    let code: ApiErrorCode;
    let message: string;

    switch (status) {
      case 400:
        code = ApiErrorCode.VALIDATION_ERROR;
        message = data.error || 'Invalid request data';
        break;
      case 401:
        code = ApiErrorCode.UNAUTHORIZED;
        message = 'Unauthorized access';
        break;
      case 403:
        code = ApiErrorCode.FORBIDDEN;
        message = 'Access forbidden';
        break;
      case 404:
        code = ApiErrorCode.NOT_FOUND;
        message = 'Resource not found';
        break;
      case 409:
        code = ApiErrorCode.CONFLICT;
        message = data.error || 'Resource conflict';
        break;
      case 429:
        code = ApiErrorCode.RATE_LIMIT_EXCEEDED;
        message = 'Rate limit exceeded';
        break;
      case 500:
        code = ApiErrorCode.INTERNAL_ERROR;
        message = 'Internal server error';
        break;
      case 503:
        code = ApiErrorCode.SERVICE_UNAVAILABLE;
        message = 'Service unavailable';
        break;
      default:
        code = ApiErrorCode.UNKNOWN;
        message = data.error || 'An error occurred';
    }

    return new ApiError(message, code, status, data.details);
  }

  // ============================================================================
  // Retry Logic
  // ============================================================================

  private async retryRequest<T>(
    requestFn: () => Promise<T>,
    retries: number = this.config.maxRetries,
    delay: number = this.config.retryDelay
  ): Promise<T> {
    try {
      return await requestFn();
    } catch (error) {
      if (retries > 0 && error instanceof ApiError && error.isRetryable) {
        await this.sleep(delay);
        return this.retryRequest(requestFn, retries - 1, delay * 2); // Exponential backoff
      }
      throw error;
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // ============================================================================
  // Cache Management
  // ============================================================================

  private getCacheKey(url: string, params?: any): string {
    return `${url}${params ? JSON.stringify(params) : ''}`;
  }

  private getCachedData<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  private setCachedData<T>(key: string, data: T, ttl: number = this.config.cacheTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  private startCacheCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.cache.entries()) {
        if (now - entry.timestamp > entry.ttl) {
          this.cache.delete(key);
        }
      }
    }, 60000); // Cleanup every minute
  }

  public clearCache(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  // ============================================================================
  // Request Deduplication
  // ============================================================================

  private getRequestKey(method: string, url: string, data?: any): string {
    return `${method}:${url}${data ? JSON.stringify(data) : ''}`;
  }

  private async deduplicateRequest<T>(
    key: string,
    requestFn: () => Promise<T>
  ): Promise<T> {
    if (!this.config.enableDeduplication) {
      return requestFn();
    }

    const pending = this.pendingRequests.get(key);
    if (pending) {
      return pending.promise as Promise<T>;
    }

    const promise = requestFn().finally(() => {
      this.pendingRequests.delete(key);
    });

    this.pendingRequests.set(key, {
      promise,
      timestamp: Date.now()
    });

    return promise;
  }

  // ============================================================================
  // Offline Detection and Queue
  // ============================================================================

  private setupOfflineDetection(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processOfflineQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  private async processOfflineQueue(): Promise<void> {
    while (this.offlineQueue.length > 0) {
      const request = this.offlineQueue.shift();
      if (request) {
        try {
          await request();
        } catch (error) {
          console.error('Failed to process queued request:', error);
        }
      }
    }
  }

  // ============================================================================
  // Public Request Methods
  // ============================================================================

  public async request<T>(config: RequestConfig): Promise<T> {
    const {
      url,
      method = 'GET',
      data,
      params,
      cache = this.config.enableCache && method === 'GET',
      cacheTTL = this.config.cacheTTL,
      retries = this.config.maxRetries,
      skipAuth = false,
      ...axiosConfig
    } = config;

    // Check cache for GET requests
    if (cache && method === 'GET') {
      const cacheKey = this.getCacheKey(url, params);
      const cachedData = this.getCachedData<T>(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }

    // Check if online
    if (!this.isOnline) {
      throw new ApiError(
        'No internet connection',
        ApiErrorCode.OFFLINE
      );
    }

    // NEW: Bypass to demo mock if backend is disabled
    if (!demoAuthService.isBackendActive()) {
      try {
        return await demoAuthService.mockBackendRequest(url, method, data);
      } catch (error) {
        throw this.handleError(error as AxiosError);
      }
    }

    // Create request function
    const requestFn = async (): Promise<T> => {
      const response = await this.axiosInstance.request<ApiResponse<T>>({
        url,
        method,
        data,
        params,
        ...axiosConfig
      });

      const result = response.data.data !== undefined ? response.data.data : response.data;

      // Cache successful GET requests
      if (cache && method === 'GET') {
        const cacheKey = this.getCacheKey(url, params);
        this.setCachedData(cacheKey, result, cacheTTL);
      }

      return result as T;
    };

    // Deduplicate GET requests
    if (method === 'GET') {
      const requestKey = this.getRequestKey(method, url, params);
      return this.deduplicateRequest(requestKey, () => {
        return this.config.enableRetry
          ? this.retryRequest(requestFn, retries)
          : requestFn();
      });
    }

    // Execute with retry for non-GET requests
    return this.config.enableRetry
      ? this.retryRequest(requestFn, retries)
      : requestFn();
  }

  public async get<T>(url: string, config?: Partial<RequestConfig>): Promise<T> {
    return this.request<T>({ url, method: 'GET', ...config });
  }

  public async post<T>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<T> {
    return this.request<T>({ url, method: 'POST', data, cache: false, ...config });
  }

  public async put<T>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<T> {
    return this.request<T>({ url, method: 'PUT', data, cache: false, ...config });
  }

  public async patch<T>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<T> {
    return this.request<T>({ url, method: 'PATCH', data, cache: false, ...config });
  }

  public async delete<T>(url: string, config?: Partial<RequestConfig>): Promise<T> {
    return this.request<T>({ url, method: 'DELETE', cache: false, ...config });
  }

  // ============================================================================
  // File Upload with Progress
  // ============================================================================

  public async uploadFile<T>(
    url: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    return this.request<T>({
      url,
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent: any) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
      cache: false
    });
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  public setBaseURL(baseURL: string): void {
    this.config.baseURL = baseURL;
    this.axiosInstance.defaults.baseURL = baseURL;
  }

  public setTimeout(timeout: number): void {
    this.config.timeout = timeout;
    this.axiosInstance.defaults.timeout = timeout;
  }

  public setHeader(key: string, value: string): void {
    this.axiosInstance.defaults.headers.common[key] = value;
  }

  public removeHeader(key: string): void {
    delete this.axiosInstance.defaults.headers.common[key];
  }

  private clearAuth(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  public getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }
}

// ============================================================================
// Export Singleton Instance
// ============================================================================

export const apiClient = new ApiClient();
