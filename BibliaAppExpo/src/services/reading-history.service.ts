/**
 * Servicio de Historial de Lectura
 * Guarda las últimas lecturas del usuario para "Continuar Lectura" y "Búsquedas Recientes"
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const READING_HISTORY_KEY = '@reading_history';
const SEARCH_HISTORY_KEY = '@search_history';
const MAX_READING_HISTORY = 10; // Máximo 10 lecturas recientes
const MAX_SEARCH_HISTORY = 20; // Máximo 20 búsquedas

export interface ReadingHistoryItem {
  bookId: string;
  bookName: string;
  chapter: number;
  testament: 'old' | 'new';
  timestamp: string; // ISO string
}

export interface SearchHistoryItem {
  query: string;
  timestamp: string;
  resultCount?: number;
}

class ReadingHistoryService {
  /**
   * Añade una lectura al historial
   */
  async addReading(reading: Omit<ReadingHistoryItem, 'timestamp'>): Promise<void> {
    try {
      const history = await this.getReadingHistory();

      // Eliminar la misma lectura si ya existe (para moverla al inicio)
      const filtered = history.filter(
        item => !(item.bookId === reading.bookId && item.chapter === reading.chapter)
      );

      // Añadir al inicio
      const newItem: ReadingHistoryItem = {
        ...reading,
        timestamp: new Date().toISOString(),
      };

      filtered.unshift(newItem);

      // Mantener solo las últimas MAX_READING_HISTORY
      const trimmed = filtered.slice(0, MAX_READING_HISTORY);

      await AsyncStorage.setItem(READING_HISTORY_KEY, JSON.stringify(trimmed));
    } catch (error) {
      console.error('[ReadingHistory] Error añadiendo lectura:', error);
    }
  }

  /**
   * Obtiene el historial de lectura
   */
  async getReadingHistory(): Promise<ReadingHistoryItem[]> {
    try {
      const data = await AsyncStorage.getItem(READING_HISTORY_KEY);
      if (!data) return [];

      return JSON.parse(data);
    } catch (error) {
      console.error('[ReadingHistory] Error obteniendo historial:', error);
      return [];
    }
  }

  /**
   * Obtiene la última lectura (para "Continuar Lectura")
   */
  async getLastReading(): Promise<ReadingHistoryItem | null> {
    try {
      const history = await this.getReadingHistory();
      return history[0] || null;
    } catch (error) {
      console.error('[ReadingHistory] Error obteniendo última lectura:', error);
      return null;
    }
  }

  /**
   * Limpia el historial de lectura
   */
  async clearReadingHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(READING_HISTORY_KEY);
    } catch (error) {
      console.error('[ReadingHistory] Error limpiando historial:', error);
    }
  }

  // ==========================================
  // BÚSQUEDAS RECIENTES
  // ==========================================

  /**
   * Añade una búsqueda al historial
   */
  async addSearch(query: string, resultCount?: number): Promise<void> {
    try {
      if (!query.trim()) return;

      const history = await this.getSearchHistory();

      // Eliminar la misma búsqueda si ya existe
      const filtered = history.filter(item => item.query.toLowerCase() !== query.toLowerCase());

      // Añadir al inicio
      const newItem: SearchHistoryItem = {
        query: query.trim(),
        timestamp: new Date().toISOString(),
        resultCount,
      };

      filtered.unshift(newItem);

      // Mantener solo las últimas MAX_SEARCH_HISTORY
      const trimmed = filtered.slice(0, MAX_SEARCH_HISTORY);

      await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(trimmed));
    } catch (error) {
      console.error('[ReadingHistory] Error añadiendo búsqueda:', error);
    }
  }

  /**
   * Obtiene el historial de búsquedas
   */
  async getSearchHistory(): Promise<SearchHistoryItem[]> {
    try {
      const data = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
      if (!data) return [];

      return JSON.parse(data);
    } catch (error) {
      console.error('[ReadingHistory] Error obteniendo historial de búsquedas:', error);
      return [];
    }
  }

  /**
   * Elimina una búsqueda específica del historial
   */
  async removeSearch(query: string): Promise<void> {
    try {
      const history = await this.getSearchHistory();
      const filtered = history.filter(item => item.query !== query);
      await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('[ReadingHistory] Error eliminando búsqueda:', error);
    }
  }

  /**
   * Limpia el historial de búsquedas
   */
  async clearSearchHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(SEARCH_HISTORY_KEY);
    } catch (error) {
      console.error('[ReadingHistory] Error limpiando historial de búsquedas:', error);
    }
  }
}

export const readingHistoryService = new ReadingHistoryService();
