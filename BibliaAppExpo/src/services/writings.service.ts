import { apiClient } from './api.client';

// ========== Types ==========

export interface Writing {
  id: string;
  title: string;
  content: string;
  bookId?: string;
  bookName?: string;
  chapter?: number;
  verse?: number;
  tags: string[];
  isFavorite: boolean;
  wordCount: number;
  createdAt: string;
  updatedAt: string;
}

// Respuesta del API (tiene verseReference anidado)
interface ApiWritingResponse {
  id: string;
  title: string;
  content: string;
  preview?: string;
  verseReference?: {
    bookId: string;
    bookName: string;
    chapter: number;
    verse: number;
    reference: string;
  };
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ApiWritingListResponse {
  writings: ApiWritingResponse[];
  total: number;
}

export interface WritingListResponse {
  writings: Writing[];
  total: number;
}

export interface CreateWritingRequest {
  title: string;
  content: string;
  bookId?: string;
  chapter?: number;
  verse?: number;
  tags?: string[];
}

export interface UpdateWritingRequest {
  title?: string;
  content?: string;
  tags?: string[];
}

export interface WritingFilter {
  sortBy?: 'recent' | 'oldest' | 'title' | 'wordCount';
  bookId?: string;
  favoritesOnly?: boolean;
  search?: string;
}

// ========== Helper ==========

function mapApiToWriting(apiWriting: ApiWritingResponse): Writing {
  return {
    id: apiWriting.id,
    title: apiWriting.title,
    content: apiWriting.content,
    bookId: apiWriting.verseReference?.bookId,
    bookName: apiWriting.verseReference?.bookName,
    chapter: apiWriting.verseReference?.chapter,
    verse: apiWriting.verseReference?.verse,
    tags: apiWriting.tags || [],
    isFavorite: apiWriting.isFavorite,
    wordCount: apiWriting.content?.split(/\s+/).length || 0,
    createdAt: apiWriting.createdAt,
    updatedAt: apiWriting.updatedAt,
  };
}

// ========== API Service ==========

class WritingsService {
  /**
   * Get all writings for the current user
   */
  async getWritings(filter?: WritingFilter): Promise<WritingListResponse> {
    const params = new URLSearchParams();

    if (filter?.sortBy) params.append('sortBy', filter.sortBy);
    if (filter?.bookId) params.append('bookId', filter.bookId);
    if (filter?.favoritesOnly) params.append('favoritesOnly', 'true');
    if (filter?.search) params.append('search', filter.search);

    const queryString = params.toString();
    const response = await apiClient.get<ApiWritingListResponse>(
      `/writings${queryString ? `?${queryString}` : ''}`
    );

    return {
      writings: response.writings.map(mapApiToWriting),
      total: response.total,
    };
  }

  /**
   * Get a single writing by ID
   */
  async getWriting(writingId: string): Promise<Writing> {
    const response = await apiClient.get<ApiWritingResponse>(`/writings/${writingId}`);
    return mapApiToWriting(response);
  }

  /**
   * Create a new writing
   */
  async createWriting(request: CreateWritingRequest): Promise<Writing> {
    const response = await apiClient.post<ApiWritingResponse>('/writings', request);
    return mapApiToWriting(response);
  }

  /**
   * Update an existing writing
   */
  async updateWriting(writingId: string, request: UpdateWritingRequest): Promise<Writing> {
    const response = await apiClient.put<ApiWritingResponse>(`/writings/${writingId}`, request);
    return mapApiToWriting(response);
  }

  /**
   * Delete a writing
   */
  async deleteWriting(writingId: string): Promise<void> {
    await apiClient.delete(`/writings/${writingId}`);
  }

  /**
   * Toggle favorite status
   */
  async toggleFavorite(writingId: string): Promise<Writing> {
    const response = await apiClient.post<ApiWritingResponse>(`/writings/${writingId}/toggle-favorite`, {});
    return mapApiToWriting(response);
  }

  /**
   * Get writings related to a specific verse
   */
  async getWritingsByVerse(bookId: string, chapter: number, verse: number): Promise<Writing[]> {
    const response = await apiClient.get<ApiWritingListResponse>(
      `/writings/verse?bookId=${bookId}&chapter=${chapter}&verse=${verse}`
    );
    return response.writings.map(mapApiToWriting);
  }
}

export const writingsService = new WritingsService();

