/**
 * HOOK: useOfflineBible
 *
 * Proporciona acceso a la Biblia de forma inteligente:
 * - Con conexión: Usa el backend API
 * - Sin conexión + Biblia descargada: Usa datos locales
 * - Sin conexión + NO descargada: Indica que necesita descargar
 */

import { useState, useEffect, useCallback } from 'react';
import { useIsOnline } from '../contexts/NetworkContext';
import {
  BibleOfflineDownloadService,
  BibleOfflineService,
  OfflineBibleChapter,
} from '../services/english-bible-download.service';

interface UseOfflineBibleResult {
  // Estado
  isOnline: boolean;
  isBibleDownloaded: boolean;
  isLoading: boolean;

  // Indica si puede usar la Biblia (online O tiene descarga)
  canUseBible: boolean;

  // Si está offline y no tiene descarga, debe ir a descargar
  needsDownload: boolean;

  // Métodos para obtener datos (automáticamente elige fuente)
  getChapter: (bookId: string, chapter: number) => Promise<OfflineBibleChapter | null>;
  searchVerses: (query: string, limit?: number) => Promise<any[]>;

  // Forzar re-check del estado
  refresh: () => Promise<void>;
}

export const useOfflineBible = (): UseOfflineBibleResult => {
  const isOnline = useIsOnline();
  const [isBibleDownloaded, setIsBibleDownloaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar si la Biblia está descargada
  const checkDownloadStatus = useCallback(async () => {
    try {
      const downloaded = await BibleOfflineDownloadService.isDownloaded();
      setIsBibleDownloaded(downloaded);
    } catch (error) {
      console.error('[useOfflineBible] Error checking download:', error);
      setIsBibleDownloaded(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkDownloadStatus();
  }, [checkDownloadStatus]);

  // Puede usar la Biblia si está online O tiene la descarga
  const canUseBible = isOnline || isBibleDownloaded;

  // Necesita descargar si está offline y NO tiene la descarga
  const needsDownload = !isOnline && !isBibleDownloaded;

  /**
   * Obtener un capítulo - elige fuente automáticamente
   */
  const getChapter = useCallback(async (
    bookId: string,
    chapter: number
  ): Promise<OfflineBibleChapter | null> => {
    // Si está online, el componente debería usar la API directamente
    // Este método es principalmente para uso offline
    if (!isOnline && isBibleDownloaded) {
      try {
        return await BibleOfflineService.getChapter(bookId, chapter);
      } catch (error) {
        console.error('[useOfflineBible] Error getting chapter offline:', error);
        return null;
      }
    }

    // Si está online, retornar null para que el componente use la API
    return null;
  }, [isOnline, isBibleDownloaded]);

  /**
   * Buscar versículos - elige fuente automáticamente
   */
  const searchVerses = useCallback(async (
    query: string,
    limit = 50
  ): Promise<any[]> => {
    if (!isOnline && isBibleDownloaded) {
      try {
        return await BibleOfflineService.searchVerses(query, limit);
      } catch (error) {
        console.error('[useOfflineBible] Error searching offline:', error);
        return [];
      }
    }

    // Si está online, retornar vacío para que el componente use la API
    return [];
  }, [isOnline, isBibleDownloaded]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    await checkDownloadStatus();
  }, [checkDownloadStatus]);

  return {
    isOnline,
    isBibleDownloaded,
    isLoading,
    canUseBible,
    needsDownload,
    getChapter,
    searchVerses,
    refresh,
  };
};

export default useOfflineBible;
