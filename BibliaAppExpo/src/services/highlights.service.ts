import { apiClient } from './api.client';

// ========== Types ==========

export type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink' | 'orange' | 'purple';

export interface Highlight {
  id: string;
  bookId: string;
  bookName: string;
  chapterNumber: number;
  verseNumber: number;
  verseText: string;
  color: HighlightColor;
  createdAt: string;
}

export interface ChapterHighlights {
  bookId: string;
  chapter: number;
  highlights: Highlight[];
}

export interface HighlightRequest {
  bookId: string;
  chapterNumber: number;
  verseNumber: number;
  color: HighlightColor;
}

// ========== Color Config ==========

export const HIGHLIGHT_COLORS: { name: HighlightColor; hex: string; label: string }[] = [
  { name: 'yellow', hex: '#FEF08A', label: 'Amarillo' },
  { name: 'green', hex: '#BBF7D0', label: 'Verde' },
  { name: 'blue', hex: '#BFDBFE', label: 'Azul' },
  { name: 'pink', hex: '#FBCFE8', label: 'Rosa' },
  { name: 'orange', hex: '#FED7AA', label: 'Naranja' },
  { name: 'purple', hex: '#DDD6FE', label: 'Morado' },
];

export function getHighlightHex(color: HighlightColor): string {
  return HIGHLIGHT_COLORS.find(c => c.name === color)?.hex || '#FEF08A';
}

// ========== API Service ==========

class HighlightService {
  /**
   * Get all highlights for the current user
   */
  async getHighlights(color?: HighlightColor): Promise<Highlight[]> {
    const params = color ? `?color=${color}` : '';
    const response = await apiClient.get<Highlight[]>(`/highlights${params}`);
    return response;
  }

  /**
   * Get highlights for a specific chapter
   */
  async getChapterHighlights(bookId: string, chapter: number): Promise<ChapterHighlights> {
    const response = await apiClient.get<ChapterHighlights>(
      `/highlights/chapter?bookId=${bookId}&chapter=${chapter}`
    );
    return response;
  }

  /**
   * Highlight a verse
   */
  async highlightVerse(request: HighlightRequest): Promise<Highlight> {
    const response = await apiClient.post<Highlight>('/highlights', request);
    return response;
  }

  /**
   * Remove a highlight
   */
  async removeHighlight(highlightId: string): Promise<void> {
    await apiClient.delete(`/highlights/${highlightId}`);
  }

  /**
   * Remove highlight by verse (alternative method)
   */
  async removeHighlightByVerse(bookId: string, chapterNumber: number, verseNumber: number): Promise<void> {
    await apiClient.delete(
      `/highlights/verse?bookId=${bookId}&chapterNumber=${chapterNumber}&verseNumber=${verseNumber}`
    );
  }
}

export const highlightService = new HighlightService();
