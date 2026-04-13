/**
 * SERVICIO: Descarga de Biblia en Inglés para Offline
 * Gestiona descarga, almacenamiento y lectura offline
 *
 * NOTA: En Expo Go, expo-file-system puede tener problemas.
 * Usamos AsyncStorage como storage principal para compatibilidad.
 * En production build funcionará mejor con file-system.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { API_CONFIG } from './config';

const STORAGE_KEY = '@english_bible_offline_downloaded';
const BIBLE_FILE_NAME = 'bible_english_offline.json';
// Acceso seguro a constantes de FileSystem
const BIBLE_FILE_URI = (FileSystem.documentDirectory || '') + BIBLE_FILE_NAME;
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

      const fileInfo = await FileSystem.getInfoAsync(BIBLE_FILE_URI);
      return fileInfo.exists;
    } catch (error) {
      console.error('Error checking download status:', error);
      return false;
    }
  },

  async download(onProgress: (progress: number) => void): Promise<void> {
    console.log('🚀 Iniciando descarga desde:', DOWNLOAD_URL);

    try {
      // Obtener el token de autenticación para evitar el Error 403
      const token = await AsyncStorage.getItem('accessToken');
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Usar FileSystem para una descarga más robusta y directa a archivo
      const downloadResumable = FileSystem.createDownloadResumable(
        DOWNLOAD_URL,
        BIBLE_FILE_URI,
        { headers }, // Pasamos los headers correctamente
        (downloadProgress) => {
          if (downloadProgress.totalBytesExpectedToWrite > 0) {
            const progress = (downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite) * 100;
            onProgress(progress);
          } else {
            // Indicar progreso indeterminado si el servidor no envía el tamaño
            onProgress(0);
          }
        }
      );

      const result = await downloadResumable.downloadAsync();

      if (result && result.status === 200) {
        await AsyncStorage.setItem(STORAGE_KEY, 'true');
        console.log('✅ Biblia descargada y guardada en:', result.uri);
        onProgress(100);
      } else {
        throw new Error(`Error en la descarga: Status ${result?.status}`);
      }
    } catch (error) {
      console.error('❌ Error fatal en descarga:', error);
      throw error;
    }
  },

  async delete(): Promise<void> {
    try {
      await FileSystem.deleteAsync(BIBLE_FILE_URI, { idempotent: true });
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error deleting bible file:', error);
    }
  },

  getFilePath: () => BIBLE_FILE_URI,
};

export const BibleOfflineService = {
  _cache: null as OfflineBibleData | null,

  async loadData(): Promise<OfflineBibleData> {
    if (this._cache) return this._cache;
    if (!(await BibleOfflineDownloadService.isDownloaded())) {
      throw new Error('Biblia offline no descargada');
    }
    const content = await FileSystem.readAsStringAsync(BIBLE_FILE_URI);
    if (!content) throw new Error('Datos de Biblia no encontrados');
    this._cache = JSON.parse(content);
    return this._cache!;
  },

  clearCache() { this._cache = null; },

  async getBook(bookId: string): Promise<OfflineBibleBook | null> {
    const data = await this.loadData();
    const bid = bookId.toLowerCase();
    return data.books.find((b: any) => b.id.toLowerCase() === bid) || null;
  },

  async getChapter(bookId: string, chapterNumber: number): Promise<OfflineBibleChapter | null> {
    const book = await this.getBook(bookId);
    if (!book) return null;
    return book.chapters.find((c: any) => c.chapter === chapterNumber) || null;
  },

  async getVerse(bookId: string, chapterNumber: number, verseNumber: number): Promise<OfflineBibleVerse | null> {
    const chapter = await this.getChapter(bookId, chapterNumber);
    if (!chapter) return null;
    return chapter.verses.find((v: any) => v.verse === verseNumber) || null;
  },

  async searchVerses(query: string, limit = 50) {
    const data = await this.loadData();
    const results: { bookId: string; bookName: string; chapter: number; verse: number; text: string }[] = [];
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
