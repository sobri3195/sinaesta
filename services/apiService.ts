// API Service for Sinaesta - communicates with backend API
//
// NOTE: This service is maintained for backward compatibility with existing
// components and tests.
//
// New code should prefer:
// - services/apiClient.ts (enhanced axios client)
// - services/endpoints/* (typed endpoint modules)
// - hooks/* (useQuery/useMutation/useApi)
//
// See API_SERVICE_LAYER.md for complete documentation.

import { ApiError } from './apiClient';
import { ApiErrorCode } from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type RequestInterceptor = (input: {
  url: string;
  init: RequestInit;
}) => Promise<{ url: string; init: RequestInit }> | { url: string; init: RequestInit };

type ResponseInterceptor = (input: {
  url: string;
  init: RequestInit;
  response: Response;
  data: any;
}) => Promise<any> | any;

interface RequestMeta {
  timeoutMs?: number;
  cache?: boolean;
  cacheTTL?: number;
  swr?: boolean;
  dedupe?: boolean;
  skipAuth?: boolean;
  responseSchema?: { parse: (data: unknown) => unknown };
  requestSchema?: { parse: (data: unknown) => unknown };
  _retry?: boolean;
}

interface CacheEntry {
  expiresAt: number;
  value: any;
}

class ApiService {
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];

  private cache = new Map<string, CacheEntry>();
  private pending = new Map<string, Promise<any>>();

  private refreshInFlight: Promise<string | null> | null = null;

  constructor() {
    this.addRequestInterceptor(({ url, init }) => {
      if (import.meta.env.DEV) {
        const method = (init.method || 'GET').toUpperCase();
        console.log('[apiService]', method, url);
      }
      return { url, init };
    });

    this.addResponseInterceptor(({ url, init, response, data }) => {
      if (import.meta.env.DEV) {
        const method = (init.method || 'GET').toUpperCase();
        console.log('[apiService]', method, url, response.status);
      }
      return data;
    });
  }

  addRequestInterceptor(interceptor: RequestInterceptor) {
    this.requestInterceptors.push(interceptor);
  }

  addResponseInterceptor(interceptor: ResponseInterceptor) {
    this.responseInterceptors.push(interceptor);
  }

  createAbortController() {
    return new AbortController();
  }

  private getAuthHeader(skipAuth?: boolean): Record<string, string> {
    if (skipAuth) return {};
    const token = localStorage.getItem('accessToken');
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  }

  private getRequestKey(method: HttpMethod, url: string, body?: unknown): string {
    return `${method}:${url}:${body ? JSON.stringify(body) : ''}`;
  }

  private getCacheKey(method: HttpMethod, url: string): string {
    return `${method}:${url}`;
  }

  private async parseResponseBody(response: Response): Promise<any> {
    const anyResponse = response as any;

    if (typeof anyResponse.json === 'function') {
      try {
        return await anyResponse.json();
      } catch {
        // fall through
      }
    }

    if (typeof anyResponse.text === 'function') {
      const text = await anyResponse.text();
      if (!text) return null;
      try {
        return JSON.parse(text);
      } catch {
        return text;
      }
    }

    return null;
  }

  private mapStatusToCode(status: number): ApiErrorCode {
    switch (status) {
      case 400:
        return ApiErrorCode.VALIDATION_ERROR;
      case 401:
        return ApiErrorCode.UNAUTHORIZED;
      case 403:
        return ApiErrorCode.FORBIDDEN;
      case 404:
        return ApiErrorCode.NOT_FOUND;
      case 409:
        return ApiErrorCode.CONFLICT;
      case 429:
        return ApiErrorCode.RATE_LIMIT_EXCEEDED;
      case 500:
        return ApiErrorCode.INTERNAL_ERROR;
      case 503:
        return ApiErrorCode.SERVICE_UNAVAILABLE;
      default:
        return ApiErrorCode.UNKNOWN;
    }
  }

  private async refreshAccessToken(): Promise<string | null> {
    if (this.refreshInFlight) return this.refreshInFlight;

    this.refreshInFlight = (async () => {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) return null;

      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await this.parseResponseBody(response);

      if (!response.ok) {
        return null;
      }

      const payload = data?.data || data;
      const newAccessToken: string | undefined = payload?.accessToken;
      const newRefreshToken: string | undefined = payload?.refreshToken;

      if (newAccessToken) {
        localStorage.setItem('accessToken', newAccessToken);
      }
      if (newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken);
      }

      return newAccessToken || null;
    })().finally(() => {
      this.refreshInFlight = null;
    });

    return this.refreshInFlight;
  }

  private clearAuthAndRedirect() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');

    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    meta: RequestMeta = {}
  ): Promise<T> {
    if (typeof navigator !== 'undefined' && navigator && !navigator.onLine) {
      throw new ApiError('No internet connection', ApiErrorCode.OFFLINE);
    }

    const method = ((options.method || 'GET') as HttpMethod).toUpperCase() as HttpMethod;

    const url = `${API_BASE_URL}${endpoint}`;

    const headers: Record<string, string> = {
      ...this.getAuthHeader(meta.skipAuth),
      ...(options.headers as Record<string, string> | undefined),
    };

    const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
    const hasBody = options.body !== undefined && options.body !== null;

    if (hasBody && !isFormData && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    if (meta.requestSchema && hasBody && typeof options.body === 'string') {
      meta.requestSchema.parse(JSON.parse(options.body));
    }

    const init: RequestInit = {
      ...options,
      method,
      headers,
    };

    let intercepted = { url, init };
    for (const interceptor of this.requestInterceptors) {
      intercepted = await interceptor(intercepted);
    }

    const finalUrl = intercepted.url;
    const finalInit = intercepted.init;

    const cacheKey = this.getCacheKey(method, finalUrl);
    const cacheTTL = meta.cacheTTL ?? 60_000;

    if (method === 'GET' && (meta.cache || meta.swr)) {
      const cached = this.cache.get(cacheKey);
      if (cached) {
        const isFresh = cached.expiresAt > Date.now();
        if (isFresh || meta.swr) {
          if (!isFresh && meta.swr) {
            void this.request<T>(endpoint, options, { ...meta, cache: true, swr: false }).catch(() => null);
          }
          return cached.value as T;
        }
      }
    }

    const dedupeKey = this.getRequestKey(method, finalUrl, finalInit.body);
    if (method === 'GET' && meta.dedupe) {
      const pending = this.pending.get(dedupeKey);
      if (pending) {
        return pending as Promise<T>;
      }
    }

    const timeoutMs = meta.timeoutMs;
    const abortController = !finalInit.signal && timeoutMs !== undefined ? new AbortController() : null;

    const timeoutId = abortController && timeoutMs !== undefined
      ? window.setTimeout(() => abortController.abort(), timeoutMs)
      : null;

    const doFetch = async (): Promise<T> => {
      try {
        const fetchInit: RequestInit = { ...finalInit };
        if (!fetchInit.signal && abortController) {
          fetchInit.signal = abortController.signal;
        }

        const response = await fetch(finalUrl, fetchInit);

        const data = await this.parseResponseBody(response);

        if (response.status === 401 && !meta._retry && !meta.skipAuth) {
          const newToken = await this.refreshAccessToken();
          if (newToken) {
            return this.request<T>(endpoint, options, { ...meta, _retry: true });
          }
          this.clearAuthAndRedirect();
          throw new ApiError('Session expired', ApiErrorCode.UNAUTHORIZED, 401);
        }

        if (!response.ok) {
          const message = data?.error || data?.message || 'Request failed';
          throw new ApiError(message, this.mapStatusToCode(response.status), response.status, data);
        }

        const payload = data?.data !== undefined ? data.data : data;

        const validated = meta.responseSchema ? meta.responseSchema.parse(payload) : payload;

        let interceptedData = validated;
        for (const interceptor of this.responseInterceptors) {
          interceptedData = await interceptor({
            url: finalUrl,
            init: finalInit,
            response,
            data: interceptedData,
          });
        }

    if (method === 'GET' && (meta.cache || meta.swr)) {
      this.cache.set(cacheKey, {
        expiresAt: Date.now() + cacheTTL,
        value: interceptedData,
      });
    }

        return interceptedData as T;
      } catch (err: any) {
        if (err?.name === 'AbortError') {
          throw new ApiError('Request aborted', ApiErrorCode.TIMEOUT);
        }
        throw err;
      } finally {
        if (timeoutId) window.clearTimeout(timeoutId);
      }
    };

    const promise = doFetch().finally(() => {
      this.pending.delete(dedupeKey);
    });

    if (method === 'GET' && meta.dedupe) {
      this.pending.set(dedupeKey, promise);
    }

    return promise;
  }

  // --------------------------------------------------------------------------
  // Auth
  // --------------------------------------------------------------------------

  /**
   * Login
   * Supports both legacy signature (email, password) and object-based signature.
   */
  async login(email: string, password: string): Promise<any>;
  async login(credentials: { email: string; password: string; rememberMe?: boolean }): Promise<any>;
  async login(arg1: any, arg2?: any): Promise<any> {
    const body =
      typeof arg1 === 'string'
        ? { email: arg1, password: arg2 }
        : arg1;

    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    }, { skipAuth: true });
  }

  async register(data: {
    email: string;
    password: string;
    name: string;
    role: string;
    targetSpecialty?: string;
    institution?: string;
    strNumber?: string;
  }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }, { skipAuth: true });
  }

  async logout(refreshToken?: string) {
    if (refreshToken) {
      return this.request('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });
    }

    return this.request('/auth/logout', {
      method: 'POST',
      headers: this.getAuthHeader(false),
    }, { skipAuth: false });
  }

  async refreshToken(refreshToken: string) {
    return this.request('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }, { skipAuth: true });
  }

  // --------------------------------------------------------------------------
  // Users
  // --------------------------------------------------------------------------

  async getMe() {
    return this.request('/users/me', { method: 'GET' });
  }

  async getCurrentUser() {
    return this.getMe();
  }

  async getUser(id: string) {
    return this.request(`/users/${id}`, { method: 'GET' });
  }

  async updateUser(id: string, data: any) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getUsers(params?: {
    role?: string;
    specialty?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return this.request(`/users${queryString}`, { method: 'GET' });
  }

  // --------------------------------------------------------------------------
  // Exams
  // --------------------------------------------------------------------------

  async getExams(params?: {
    specialty?: string;
    difficulty?: string;
    mode?: string;
    page?: number;
    limit?: number;
  }) {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return this.request(`/exams${queryString}`, { method: 'GET' });
  }

  async getExam(id: string) {
    return this.request(`/exams/${id}`, { method: 'GET' });
  }

  async createExam(data: any) {
    return this.request('/exams', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateExam(id: string, data: any) {
    return this.request(`/exams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteExam(id: string) {
    return this.request(`/exams/${id}`, {
      method: 'DELETE',
    });
  }

  async addQuestionToExam(examId: string, question: any) {
    return this.request(`/exams/${examId}/questions`, {
      method: 'POST',
      body: JSON.stringify(question),
    });
  }

  async submitExam(examId: string, answers: any, auditLog?: any[]) {
    return this.request(`/exams/${examId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers, auditLog }),
    });
  }

  async getExamResults(examId: string, userId?: string) {
    const queryString = userId ? `?userId=${userId}` : '';
    return this.request(`/exams/${examId}/results${queryString}`, { method: 'GET' });
  }

  // --------------------------------------------------------------------------
  // Results
  // --------------------------------------------------------------------------

  async getResults(params?: { page?: number; limit?: number }) {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return this.request(`/results${queryString}`, { method: 'GET' });
  }

  async getMyResults(params?: { page?: number; limit?: number }) {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return this.request(`/results/my-results${queryString}`, { method: 'GET' });
  }

  async getResult(id: string) {
    return this.request(`/results/${id}`, { method: 'GET' });
  }

  async getAllResults(params?: {
    userId?: string;
    examId?: string;
    page?: number;
    limit?: number;
  }) {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return this.request(`/results${queryString}`, { method: 'GET' });
  }

  async getResultStats(params?: { examId?: string; specialty?: string }) {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return this.request(`/results/stats/overview${queryString}`, { method: 'GET' });
  }

  // --------------------------------------------------------------------------
  // Flashcards
  // --------------------------------------------------------------------------

  async getFlashcards(params?: {
    category?: string;
    mastered?: boolean;
    page?: number;
    limit?: number;
  }) {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return this.request(`/flashcards${queryString}`, { method: 'GET' });
  }

  async getFlashcard(id: string) {
    return this.request(`/flashcards/${id}`, { method: 'GET' });
  }

  async createFlashcard(data: { front: string; back: string; category?: string }) {
    return this.request('/flashcards', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateFlashcard(id: string, data: { front?: string; back?: string; category?: string; mastered?: boolean }) {
    return this.request(`/flashcards/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteFlashcard(id: string) {
    return this.request(`/flashcards/${id}`, { method: 'DELETE' });
  }

  async getFlashcardDecks() {
    return this.request('/flashcards/decks/all', { method: 'GET' });
  }

  async createFlashcardDeck(data: { title: string; topic: string; cards: any[] }) {
    return this.request('/flashcards/decks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // --------------------------------------------------------------------------
  // OSCE
  // --------------------------------------------------------------------------

  async getOSCEStations(params?: { specialty?: string; page?: number; limit?: number }) {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return this.request(`/osce/stations${queryString}`, { method: 'GET' });
  }

  async getOSCEStation(id: string) {
    return this.request(`/osce/stations/${id}`, { method: 'GET' });
  }

  async createOSCEStation(data: any) {
    return this.request('/osce/stations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateOSCEStation(id: string, data: any) {
    return this.request(`/osce/stations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteOSCEStation(id: string) {
    return this.request(`/osce/stations/${id}`, { method: 'DELETE' });
  }

  async getOSCEAttempts(params?: { stationId?: string; page?: number; limit?: number }) {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return this.request(`/osce/attempts${queryString}`, { method: 'GET' });
  }

  async getOSCEAttempt(id: string) {
    return this.request(`/osce/attempts/${id}`, { method: 'GET' });
  }

  async submitOSCEAttempt(stationId: string, performance: any) {
    return this.request('/osce/attempts', {
      method: 'POST',
      body: JSON.stringify({ stationId, performance }),
    });
  }

  async updateOSCEAttempt(id: string, data: { feedback?: string; score?: number }) {
    return this.request(`/osce/attempts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // --------------------------------------------------------------------------
  // Files
  // --------------------------------------------------------------------------

  async uploadFile(file: File, category?: string) {
    const formData = new FormData();
    formData.append('file', file);
    if (category) formData.append('category', category);

    return this.request('/upload', {
      method: 'POST',
      body: formData,
    });
  }

  async deleteFile(fileId: string) {
    return this.request(`/files/${encodeURIComponent(fileId)}`, {
      method: 'DELETE',
    });
  }

  // --------------------------------------------------------------------------
  // Utilities
  // --------------------------------------------------------------------------

  async batch<T = any>(requests: Array<{ endpoint: string; options?: RequestInit; meta?: RequestMeta }>, concurrency = 5): Promise<T[]> {
    const results: T[] = [];

    const queue = [...requests];
    const workers = new Array(Math.min(concurrency, queue.length)).fill(null).map(async () => {
      while (queue.length) {
        const next = queue.shift();
        if (!next) break;
        const res = await this.request<T>(next.endpoint, next.options, next.meta);
        results.push(res);
      }
    });

    await Promise.all(workers);
    return results;
  }
}

export const apiService = new ApiService();
