/**
 * ==========================================
 * SERVICIO DE FAVORITOS
 * ==========================================
 *
 * Estrategia de Caché Offline (igual que Writings):
 * 1. CON INTERNET: Fetch desde API → Guardar en caché → Retornar
 * 2. SIN INTERNET: Leer desde caché → Retornar datos locales
 * 3. CREAR/ELIMINAR SIN INTERNET: Modificar caché → Sincronizar después
 *
 * ==========================================
 */

import { apiClient } from './api.client';
import { cacheService } from './cache.service';

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
   *
   * CON INTERNET: Fetch desde API → Cachear → Retornar
   * SIN INTERNET: Leer desde caché → Retornar datos locales
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

    // 1. ⚡ LEER CACHÉ LOCAL PRIMERO (Velocidad de carga de 0ms)
    let localData = await cacheService.getFavorites() || [];

    // 2. 🌍 SINCRONIZACIÓN SILENCIOSA DE FONDO
    apiClient.get<{ favorites: Favorite[]; total: number }>(
      `/favorites${queryString ? `?${queryString}` : ''}`
    )
      .then(async (response) => {
        if (response.favorites.length > 0) {
          await cacheService.setFavorites(response.favorites);
          console.log('[Favorites] 🔄 Caché actualizado en segundo plano');
        }
      })
      .catch((error) => {
        console.warn('[Favorites] ⚠️ Error silencioso de red al sincronizar en fondo');
      });

    // Aplicar filtros a la caché local simulando al servidor para la UI optimista
    if (options?.bookId) {
      localData = localData.filter(f => f.bookId === options.bookId);
    }
    if (options?.search) {
      const q = options.search.toLowerCase();
      localData = localData.filter(f =>
        f.verseText?.toLowerCase().includes(q) ||
        f.note?.toLowerCase().includes(q) ||
        f.tags?.some((t: string) => t.toLowerCase().includes(q))
      );
    }

    return {
      favorites: localData,
      total: localData.length,
    };
  },

  /**
   * Agrega un versículo a favoritos
   *
   * CON INTERNET: POST a API → Actualizar caché → Retornar
   * SIN INTERNET: Agregar a caché con ID temporal → Sincronizar después
   */
  async addFavorite(data: AddFavoriteRequest): Promise<Favorite> {
    try {
      // ✅ Intentar crear en API (CON INTERNET)
      const response = await apiClient.post<Favorite>('/favorites', data);

      // 💾 Actualizar caché
      const cachedFavorites = await cacheService.getFavorites() || [];
      cachedFavorites.unshift(response);
      await cacheService.setFavorites(cachedFavorites);

      console.log('[Favorites] ✅ Favorito creado en API y cacheado');
      return response;
    } catch (error) {
      // ⚠️ Sin internet - guardar localmente con ID temporal
      console.warn('[Favorites] ⚠️ Sin internet, guardando localmente...', error);

      const tempId = cacheService.generateTempId();
      const tempFavorite: Favorite = {
        id: tempId,
        bookId: data.bookId,
        bookName: data.bookId, // TODO: Mapear a nombre real
        chapterNumber: data.chapterNumber,
        verseNumber: data.verseNumber,
        verseText: '', // TODO: Obtener del contexto si es posible
        reference: `${data.bookId} ${data.chapterNumber}:${data.verseNumber}`,
        tags: data.tags || [],
        note: data.note,
        createdAt: new Date().toISOString(),
      };

      // 💾 Guardar en caché
      const cachedFavorites = await cacheService.getFavorites() || [];
      cachedFavorites.unshift(tempFavorite);
      await cacheService.setFavorites(cachedFavorites);

      // 📝 Marcar para sincronización
      await cacheService.addPendingSync({
        type: 'create',
        entity: 'favorite',
        data: data,
        timestamp: Date.now(),
        tempId: tempId,
      });

      console.log('[Favorites] 📱 Favorito guardado offline con ID temporal');
      return tempFavorite;
    }
  },

  /**
   * Actualiza un favorito
   */
  async updateFavorite(favoriteId: string, data: UpdateFavoriteRequest): Promise<Favorite> {
    return apiClient.put<Favorite>(`/favorites/${favoriteId}`, data);
  },

  /**
   * Elimina un favorito
   *
   * CON INTERNET: DELETE en API → Actualizar caché → Éxito
   * SIN INTERNET: Eliminar de caché → Marcar para sincronización
   */
  async removeFavorite(favoriteId: string): Promise<void> {
    try {
      // ✅ Intentar eliminar en API (CON INTERNET)
      await apiClient.delete(`/favorites/${favoriteId}`);

      // 💾 Eliminar del caché
      const cachedFavorites = await cacheService.getFavorites() || [];
      const updated = cachedFavorites.filter(f => f.id !== favoriteId);
      await cacheService.setFavorites(updated);

      console.log('[Favorites] ✅ Favorito eliminado en API y caché');
    } catch (error) {
      // ⚠️ Sin internet - eliminar solo del caché
      console.warn('[Favorites] ⚠️ Sin internet, eliminando de caché...', error);

      const cachedFavorites = await cacheService.getFavorites() || [];
      const updated = cachedFavorites.filter(f => f.id !== favoriteId);
      await cacheService.setFavorites(updated);

      // 📝 Marcar para sincronización (solo si NO es ID temporal)
      if (!cacheService.isTempId(favoriteId)) {
        await cacheService.addPendingSync({
          type: 'delete',
          entity: 'favorite',
          data: { favoriteId },
          timestamp: Date.now(),
        });
      }

      console.log('[Favorites] 📱 Favorito eliminado offline');
    }
  },

  /**
   * Verifica si un versículo está en favoritos
   */
  async isFavorite(bookId: string, chapter: number, verse: number): Promise<boolean> {
    const localFavorites = await cacheService.getFavorites() || [];
    return !!localFavorites.find(f =>
      f.bookId === bookId &&
      f.chapterNumber === chapter &&
      f.verseNumber === verse
    );
  },
  /**
   * Carga favoritos directamente desde la caché local (sin tocar API)
   */
  async loadFromCache(): Promise<Favorite[]> {
    return await cacheService.getFavorites() || [];
  },
};

export default favoritesService;

