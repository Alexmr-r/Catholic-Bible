/**
 * SERVICIO: Descarga de Biblia en Inglés para Offline
 * Gestiona descarga, almacenamiento y lectura offline
 *
 * NOTA: En Expo Go, expo-file-system puede tener problemas.
 * Usamos AsyncStorage como storage principal para compatibilidad.
 * En production build funcionará mejor con file-system.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from './config';

const STORAGE_KEY = '@english_bible_offline_downloaded';
const BIBLE_DATA_KEY = '@english_bible_offline_data';
const DOWNLOAD_URL = `${API_CONFIG.BASE_URL}/bible/english/download`;

export interface DownloadState {
  isDownloaded: boolean;
  isDownloading: boolean;
  progress: number;
  error: string | null;
}

// Tipos que coinciden con BibleDto del backend
export interface OfflineBibleData {
  translation: string;
  language: string;
  books: OfflineBibleBook[];
}

export interface OfflineBibleBook {
  id: string;
  name: string;
  chapters: OfflineBibleChapter[];
}

export interface OfflineBibleChapter {
  chapter: number;
  verses: OfflineBibleVerse[];
}

export interface OfflineBibleVerse {
  verse: number;
  text: string;
}

export const BibleOfflineDownloadService = {
  async isDownloaded(): Promise<boolean> {
    try {
      const downloaded = await AsyncStorage.getItem(STORAGE_KEY);
      if (downloaded !== 'true') return false;
      const bibleData = await AsyncStorage.getItem(BIBLE_DATA_KEY);
      return bibleData !== null;
    } catch {
      return false;
    }
  },

  async download(onProgress: (progress: number) => void): Promise<void> {
    try {
      // Descargar usando fetch
      const response = await fetch(DOWNLOAD_URL);

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const contentLength = response.headers.get('content-length');
      const total = contentLength ? parseInt(contentLength, 10) : 0;

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No se pudo iniciar la descarga');
      }

      const chunks: Uint8Array[] = [];
      let received = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
        received += value.length;

        if (total > 0) {
          const progress = (received / total) * 100;
          onProgress(Math.min(progress, 99));
        }
      }

      // Combinar chunks y convertir a string
      const allChunks = new Uint8Array(received);
      let position = 0;
      for (const chunk of chunks) {
        allChunks.set(chunk, position);
        position += chunk.length;
      }

      const text = new TextDecoder().decode(allChunks);

      // Guardar en AsyncStorage
      await AsyncStorage.setItem(BIBLE_DATA_KEY, text);
      await AsyncStorage.setItem(STORAGE_KEY, 'true');
      onProgress(100);
    } catch (error) {
      // Limpiar datos parciales
      try {
        await AsyncStorage.removeItem(BIBLE_DATA_KEY);
      } catch {}
      throw error;
    }
  },

  async delete(): Promise<void> {
    await AsyncStorage.removeItem(BIBLE_DATA_KEY);
    await AsyncStorage.removeItem(STORAGE_KEY);
  },

  getFilePath: () => '', // Sin uso en esta implementación
};

export const BibleOfflineService = {
  _cache: null as OfflineBibleData | null,

  async loadData(): Promise<OfflineBibleData> {
    if (this._cache) return this._cache;
    if (!(await BibleOfflineDownloadService.isDownloaded())) {
      throw new Error('Biblia offline no descargada');
    }
    const content = await AsyncStorage.getItem(BIBLE_DATA_KEY);
    if (!content) throw new Error('Datos de Biblia no encontrados');
    this._cache = JSON.parse(content);
    return this._cache!;
  },

  clearCache() { this._cache = null; },

  async getBook(bookId: string): Promise<OfflineBibleBook | null> {
    const data = await this.loadData();
    return data.books.find(b => b.id === bookId) || null;
  },

  async getChapter(bookId: string, chapterNumber: number): Promise<OfflineBibleChapter | null> {
    const book = await this.getBook(bookId);
    if (!book) return null;
    return book.chapters.find(c => c.chapter === chapterNumber) || null;
  },

  async getVerse(bookId: string, chapterNumber: number, verseNumber: number): Promise<OfflineBibleVerse | null> {
    const chapter = await this.getChapter(bookId, chapterNumber);
    if (!chapter) return null;
    return chapter.verses.find(v => v.verse === verseNumber) || null;
  },

  async searchVerses(query: string, limit = 50) {
    const data = await this.loadData();
    const results: {bookId: string; bookName: string; chapter: number; verse: number; text: string}[] = [];
    const q = query.toLowerCase();

    for (const book of data.books) {
      for (const ch of book.chapters) {
        for (const v of ch.verses) {
          if (v.text.toLowerCase().includes(q)) {
            results.push({
              bookId: book.id,
              bookName: book.name,
              chapter: ch.chapter,
              verse: v.verse,
              text: v.text
            });
            if (results.length >= limit) return results;
          }
        }
      }
    }
    return results;
  },
};

// Alias para compatibilidad
export const EnglishBibleDownloadService = BibleOfflineDownloadService;
export const EnglishBibleOfflineService = BibleOfflineService;
