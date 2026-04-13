import { apiClient } from './api.client';
import { API_CONFIG } from './config';

// ========== Types ==========

export interface Book {
  id: string;
  name: string;
  abbreviation: string;
  testament: 'old' | 'new';
  category: string;
  totalChapters: number;
  description?: string;
}

export interface BooksResponse {
  oldTestament: Book[];
  newTestament: Book[];
}

export interface Verse {
  number: number;
  text: string;
  hasNote: boolean;
  hasHighlight?: boolean;
}

export interface Section {
  title: string;
  verses: Verse[];
}

export interface ChapterReference {
  bookId: string;
  bookName: string;
  chapter: number;
}

export interface Chapter {
  book: string;
  bookName: string;
  chapter: number;
  version: string;
  sections: Section[];
  previousChapter?: ChapterReference;
  nextChapter?: ChapterReference;
}

export interface SearchResult {
  bookId: string;
  bookName: string;
  chapter: number;
  verse: number;
  text: string;
  highlightedText: string;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ========== Bible Service ==========

export const bibleService = {
  /**
   * Obtiene todos los libros organizados por testamento
   */
  async getAllBooks(): Promise<BooksResponse> {
    return apiClient.get<BooksResponse>('/bible/books');
  },

  /**
   * Obtiene los libros del Antiguo Testamento
   */
  async getOldTestamentBooks(): Promise<Book[]> {
    return apiClient.get<Book[]>('/bible/books/old-testament');
  },

  /**
   * Obtiene los libros del Nuevo Testamento
   */
  async getNewTestamentBooks(): Promise<Book[]> {
    return apiClient.get<Book[]>('/bible/books/new-testament');
  },

  /**
   * Obtiene información de un libro
   */
  async getBook(bookId: string): Promise<Book> {
    return apiClient.get<Book>(`/bible/books/${bookId}`);
  },

  /**
   * Obtiene un capítulo completo
   */
  async getChapter(bookId: string, chapterNumber: number): Promise<Chapter> {
    return apiClient.get<Chapter>(`/bible/books/${bookId}/chapters/${chapterNumber}`);
  },

  /**
   * Busca versículos por texto
   */
  async searchVerses(
    query: string,
    options?: {
      testament?: 'old' | 'new';
      bookIds?: string[];
      page?: number;
      pageSize?: number;
    }
  ): Promise<SearchResponse> {
    const params = new URLSearchParams({ query });
    if (options?.testament) params.append('testament', options.testament);
    if (options?.bookIds) options.bookIds.forEach(id => params.append('bookIds', id));
    if (options?.page !== undefined) params.append('page', options.page.toString());
    if (options?.pageSize) params.append('pageSize', options.pageSize.toString());

    return apiClient.get<SearchResponse>(`/bible/search?${params.toString()}`);
  },
};

export default bibleService;

