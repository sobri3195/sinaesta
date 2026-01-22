// API Service for Sinaesta - communicates with backend API

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem('accessToken');

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data.data || data;
  }

  private async requestWithAuth<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    let token = localStorage.getItem('accessToken');

    const makeRequest = async (accessToken: string) => {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        ...options.headers,
      };

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        // Try to refresh token
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          try {
            const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${refreshToken}`,
              },
              body: JSON.stringify({ refreshToken }),
            });

            if (refreshResponse.ok) {
              const refreshData = await refreshResponse.json();
              localStorage.setItem('accessToken', refreshData.data.accessToken);
              return makeRequest(refreshData.data.accessToken);
            }
          } catch (error) {
            console.error('Token refresh failed:', error);
          }
        }

        // Clear tokens and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/';
        throw new Error('Session expired');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      return data.data || data;
    };

    return makeRequest(token!);
  }

  // Auth endpoints
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
    });
  }

  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async logout(refreshToken: string) {
    return this.request('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  async refreshToken(refreshToken: string) {
    return this.request('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  // User endpoints
  async getCurrentUser() {
    return this.requestWithAuth('/users/me');
  }

  async getUser(id: string) {
    return this.requestWithAuth(`/users/${id}`);
  }

  async updateUser(id: string, data: any) {
    return this.requestWithAuth(`/users/${id}`, {
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
    const queryString = new URLSearchParams(params as any).toString();
    return this.requestWithAuth(`/users?${queryString}`);
  }

  // Exam endpoints
  async getExams(params?: {
    specialty?: string;
    difficulty?: string;
    mode?: string;
    page?: number;
    limit?: number;
  }) {
    const queryString = new URLSearchParams(params as any).toString();
    return this.requestWithAuth(`/exams?${queryString}`);
  }

  async getExam(id: string) {
    return this.requestWithAuth(`/exams/${id}`);
  }

  async createExam(data: any) {
    return this.requestWithAuth('/exams', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateExam(id: string, data: any) {
    return this.requestWithAuth(`/exams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteExam(id: string) {
    return this.requestWithAuth(`/exams/${id}`, {
      method: 'DELETE',
    });
  }

  async addQuestionToExam(examId: string, question: any) {
    return this.requestWithAuth(`/exams/${examId}/questions`, {
      method: 'POST',
      body: JSON.stringify(question),
    });
  }

  async submitExam(examId: string, answers: number[], auditLog?: any[]) {
    return this.requestWithAuth(`/exams/${examId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ examId, answers, auditLog }),
    });
  }

  async getExamResults(examId: string, userId?: string) {
    const queryString = userId ? `?userId=${userId}` : '';
    return this.requestWithAuth(`/exams/${examId}/results${queryString}`);
  }

  // Results endpoints
  async getMyResults(params?: { page?: number; limit?: number }) {
    const queryString = new URLSearchParams(params as any).toString();
    return this.requestWithAuth(`/results/my-results?${queryString}`);
  }

  async getResult(id: string) {
    return this.requestWithAuth(`/results/${id}`);
  }

  async getAllResults(params?: {
    userId?: string;
    examId?: string;
    page?: number;
    limit?: number;
  }) {
    const queryString = new URLSearchParams(params as any).toString();
    return this.requestWithAuth(`/results?${queryString}`);
  }

  async getResultStats(params?: { examId?: string; specialty?: string }) {
    const queryString = new URLSearchParams(params as any).toString();
    return this.requestWithAuth(`/results/stats/overview?${queryString}`);
  }

  // Flashcard endpoints
  async getFlashcards(params?: {
    category?: string;
    mastered?: boolean;
    page?: number;
    limit?: number;
  }) {
    const queryString = new URLSearchParams(params as any).toString();
    return this.requestWithAuth(`/flashcards?${queryString}`);
  }

  async getFlashcard(id: string) {
    return this.requestWithAuth(`/flashcards/${id}`);
  }

  async createFlashcard(data: {
    front: string;
    back: string;
    category?: string;
  }) {
    return this.requestWithAuth('/flashcards', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateFlashcard(
    id: string,
    data: {
      front?: string;
      back?: string;
      category?: string;
      mastered?: boolean;
    }
  ) {
    return this.requestWithAuth(`/flashcards/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteFlashcard(id: string) {
    return this.requestWithAuth(`/flashcards/${id}`, {
      method: 'DELETE',
    });
  }

  async getFlashcardDecks() {
    return this.requestWithAuth('/flashcards/decks/all');
  }

  async createFlashcardDeck(data: {
    title: string;
    topic: string;
    cards: any[];
  }) {
    return this.requestWithAuth('/flashcards/decks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // OSCE endpoints
  async getOSCEStations(params?: {
    specialty?: string;
    page?: number;
    limit?: number;
  }) {
    const queryString = new URLSearchParams(params as any).toString();
    return this.requestWithAuth(`/osce/stations?${queryString}`);
  }

  async getOSCEStation(id: string) {
    return this.requestWithAuth(`/osce/stations/${id}`);
  }

  async createOSCEStation(data: any) {
    return this.requestWithAuth('/osce/stations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateOSCEStation(id: string, data: any) {
    return this.requestWithAuth(`/osce/stations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteOSCEStation(id: string) {
    return this.requestWithAuth(`/osce/stations/${id}`, {
      method: 'DELETE',
    });
  }

  async getOSCEAttempts(params?: {
    stationId?: string;
    page?: number;
    limit?: number;
  }) {
    const queryString = new URLSearchParams(params as any).toString();
    return this.requestWithAuth(`/osce/attempts?${queryString}`);
  }

  async getOSCEAttempt(id: string) {
    return this.requestWithAuth(`/osce/attempts/${id}`);
  }

  async submitOSCEAttempt(stationId: string, performance: any) {
    return this.requestWithAuth('/osce/attempts', {
      method: 'POST',
      body: JSON.stringify({ stationId, performance }),
    });
  }

  async updateOSCEAttempt(
    id: string,
    data: {
      feedback?: string;
      score?: number;
    }
  ) {
    return this.requestWithAuth(`/osce/attempts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
}

export const apiService = new ApiService();
