import { apiClient } from './api.client';

// ========== Types ==========

export interface Favorite {
  id: string;
  bookId: string;
  bookName: string;
  chapterNumber: number;
  verseNumber: number;
  verseText: string;
  reference: string;
  tags: string[];
  note?: string;
  createdAt: string;
}

export interface AddFavoriteRequest {
  bookId: string;
  chapterNumber: number;
  verseNumber: number;
  tags?: string[];
  note?: string;
}

export interface UpdateFavoriteRequest {
  tags?: string[];
  note?: string;
}

// ========== Favorites Service ==========

export const favoritesService = {
  /**
   * Obtiene todos los favoritos del usuario
   */
  async getFavorites(options?: {
    testament?: string;
    bookId?: string;
    search?: string;
  }): Promise<{ favorites: Favorite[]; total: number }> {
    const params = new URLSearchParams();
    if (options?.testament) params.append('testament', options.testament);
    if (options?.bookId) params.append('bookId', options.bookId);
    if (options?.search) params.append('search', options.search);

    const queryString = params.toString();
    return apiClient.get(`/favorites${queryString ? `?${queryString}` : ''}`);
  },

  /**
   * Agrega un versículo a favoritos
   */
  async addFavorite(data: AddFavoriteRequest): Promise<Favorite> {
    return apiClient.post<Favorite>('/favorites', data);
  },

  /**
   * Actualiza un favorito
   */
  async updateFavorite(favoriteId: string, data: UpdateFavoriteRequest): Promise<Favorite> {
    return apiClient.put<Favorite>(`/favorites/${favoriteId}`, data);
  },

  /**
   * Elimina un favorito
   */
  async removeFavorite(favoriteId: string): Promise<void> {
    return apiClient.delete(`/favorites/${favoriteId}`);
  },

  /**
   * Verifica si un versículo está en favoritos
   */
  async isFavorite(bookId: string, chapter: number, verse: number): Promise<boolean> {
    return apiClient.get<boolean>(
      `/favorites/check?bookId=${bookId}&chapter=${chapter}&verse=${verse}`
    );
  },
};

export default favoritesService;

