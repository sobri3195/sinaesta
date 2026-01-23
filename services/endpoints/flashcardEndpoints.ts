/**
 * Flashcard API Endpoints
 * Typed API functions for flashcard operations
 */

import { apiClient } from '../apiClient';
import {
  GetFlashcardsRequest,
  GetFlashcardsResponse,
  CreateFlashcardRequest,
  UpdateFlashcardRequest,
  DeleteFlashcardRequest,
  GetFlashcardDecksRequest,
  CreateFlashcardDeckRequest
} from '../../types/api';

export const flashcardEndpoints = {
  /**
   * Get flashcards list
   * @param params - Filter and pagination params
   * @returns Paginated list of flashcards
   */
  async getFlashcards(params?: GetFlashcardsRequest): Promise<GetFlashcardsResponse> {
    return apiClient.get('/flashcards', { params });
  },

  /**
   * Get single flashcard by ID
   * @param id - Flashcard ID
   * @returns Flashcard data
   */
  async getFlashcard(id: string): Promise<any> {
    return apiClient.get(`/flashcards/${id}`);
  },

  /**
   * Create new flashcard
   * @param data - Flashcard data
   * @returns Created flashcard
   */
  async createFlashcard(data: CreateFlashcardRequest): Promise<any> {
    return apiClient.post('/flashcards', data);
  },

  /**
   * Update existing flashcard
   * @param id - Flashcard ID
   * @param data - Updated flashcard data
   * @returns Updated flashcard
   */
  async updateFlashcard(id: string, data: UpdateFlashcardRequest): Promise<any> {
    return apiClient.put(`/flashcards/${id}`, data);
  },

  /**
   * Delete flashcard
   * @param id - Flashcard ID
   */
  async deleteFlashcard(id: string): Promise<void> {
    await apiClient.delete(`/flashcards/${id}`);
  },

  /**
   * Get flashcard decks
   * @returns List of flashcard decks
   */
  async getFlashcardDecks(): Promise<any> {
    return apiClient.get('/flashcards/decks/all');
  },

  /**
   * Create flashcard deck
   * @param data - Deck data
   * @returns Created deck
   */
  async createFlashcardDeck(data: CreateFlashcardDeckRequest): Promise<any> {
    return apiClient.post('/flashcards/decks', data);
  }
};
