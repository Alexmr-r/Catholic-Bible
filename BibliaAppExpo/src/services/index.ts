// Exportar todos los servicios
export { apiClient } from './api.client';
export { authService } from './auth.service';
export { bibleService } from './bible.service';
export { favoritesService } from './favorites.service';
export { API_CONFIG } from './config';

// Exportar tipos
export type { User, AuthResponse, RegisterRequest, LoginRequest } from './auth.service';
export type { Book, BooksResponse, Chapter, Verse, Section, SearchResult, SearchResponse } from './bible.service';
export type { Favorite, AddFavoriteRequest, UpdateFavoriteRequest } from './favorites.service';

