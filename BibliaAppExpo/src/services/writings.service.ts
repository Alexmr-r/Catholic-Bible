/**
 * ==========================================
 * SERVICIO DE ESCRITOS (WRITINGS)
 * ==========================================
 *
 * Estrategia de Caché Offline:
 * 1. CON INTERNET: Fetch desde API → Guardar en caché → Retornar
 * 2. SIN INTERNET: Leer desde caché → Retornar datos locales
 * 3. CREAR/EDITAR SIN INTERNET: Guardar en caché con flag "pendiente" → Sincronizar después
 *
 * ==========================================
 */

import { apiClient } from './api.client';
import { cacheService } from './cache.service';

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
   *
   * CON INTERNET: Fetch desde API → Cachear → Retornar
   * SIN INTERNET: Leer desde caché → Retornar datos locales
   */
  async getWritings(filter?: WritingFilter): Promise<WritingListResponse> {
    const params = new URLSearchParams();

    if (filter?.sortBy) params.append('sortBy', filter.sortBy);
    if (filter?.bookId) params.append('bookId', filter.bookId);
    if (filter?.favoritesOnly) params.append('favoritesOnly', 'true');
    if (filter?.search) params.append('search', filter.search);

    const queryString = params.toString();

    // 1. ⚡ LEER CACHÉ LOCAL PRIMERO
    let localData = await cacheService.getWritings() || [];

    // 2. 🌍 SINCRONIZACIÓN SILENCIOSA EN FONDO
    apiClient.get<ApiWritingListResponse>(
      `/writings${queryString ? `?${queryString}` : ''}`
    )
      .then(async (response) => {
        const writings = response.writings.map(mapApiToWriting);
        if (writings.length > 0) {
          await cacheService.setWritings(writings);
          console.log('[Writings] 🔄 Caché actualizado en segundo plano');
        }
      })
      .catch(() => {
        console.warn('[Writings] ⚠️ Error silencioso de red al sincronizar en fondo');
      });

    // Aplicar filtros locales simulando al servidor
    if (filter?.bookId) {
      localData = localData.filter(w => w.bookId === filter.bookId);
    }
    if (filter?.favoritesOnly) {
      localData = localData.filter(w => w.isFavorite);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      localData = localData.filter(w =>
        w.title?.toLowerCase().includes(q) ||
        w.content?.toLowerCase().includes(q) ||
        w.tags?.some((t: string) => t.toLowerCase().includes(q))
      );
    }
    if (filter?.sortBy) {
      if (filter.sortBy === 'recent') localData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      if (filter.sortBy === 'oldest') localData.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      if (filter.sortBy === 'title') localData.sort((a, b) => a.title.localeCompare(b.title));
    }

    return {
      writings: localData,
      total: localData.length,
    };
  }

  /**
   * Get a single writing by ID
   */
  async getWriting(writingId: string): Promise<Writing> {
    const cachedWritings = await cacheService.getWritings() || [];
    const cachedWriting = cachedWritings.find(w => w.id === writingId);

    if (cachedWriting) {
      apiClient.get<ApiWritingResponse>(`/writings/${writingId}`)
        .then(async (response) => {
          const freshWriting = mapApiToWriting(response);
          const latestCache = await cacheService.getWritings() || [];
          const exists = latestCache.some(w => w.id === writingId);
          const merged = exists
            ? latestCache.map(w => w.id === writingId ? freshWriting : w)
            : [freshWriting, ...latestCache];
          await cacheService.setWritings(merged);
          console.log('[Writings] 🔄 Escrito sincronizado en segundo plano');
        })
        .catch(() => {
          console.warn('[Writings] ⚠️ Error silencioso al sincronizar escrito en fondo');
        });

      return cachedWriting;
    }

    const response = await apiClient.get<ApiWritingResponse>(`/writings/${writingId}`);
    const writing = mapApiToWriting(response);
    const merged = [writing, ...cachedWritings.filter(w => w.id !== writingId)];
    await cacheService.setWritings(merged);

    return writing;
  }

  /**
   * Create a new writing
   *
   * CON INTERNET: POST a API → Cachear → Retornar
   * SIN INTERNET: Guardar con ID temporal → Marcar para sincronización → Retornar
   */
  async createWriting(request: CreateWritingRequest): Promise<Writing> {
    try {
      // ✅ Intentar crear en API (CON INTERNET)
      const response = await apiClient.post<ApiWritingResponse>('/writings', request);
      const writing = mapApiToWriting(response);

      // 💾 Actualizar caché
      const cachedWritings = await cacheService.getWritings() || [];
      cachedWritings.unshift(writing); // Agregar al inicio
      await cacheService.setWritings(cachedWritings);

      console.log('[Writings] ✅ Escrito creado en API y cacheado');
      return writing;
    } catch (error) {
      // ⚠️ Sin internet - guardar localmente con ID temporal
      console.warn('[Writings] ⚠️ Sin internet, guardando localmente...', error);

      const tempId = cacheService.generateTempId();
      const tempWriting: Writing = {
        id: tempId,
        title: request.title,
        content: request.content,
        bookId: request.bookId,
        bookName: request.bookId || undefined,
        chapter: request.chapter,
        verse: request.verse,
        tags: request.tags || [],
        isFavorite: false,
        wordCount: request.content.split(/\s+/).length,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // 💾 Guardar en caché
      const cachedWritings = await cacheService.getWritings() || [];
      cachedWritings.unshift(tempWriting);
      await cacheService.setWritings(cachedWritings);

      // 📝 Marcar para sincronización cuando haya internet
      await cacheService.addPendingSync({
        type: 'create',
        entity: 'writing',
        data: request,
        timestamp: Date.now(),
        tempId: tempId,
      });

      console.log('[Writings] 📱 Escrito guardado offline con ID temporal');
      return tempWriting;
    }
  }

  /**
   * Update an existing writing
   *
   * CON INTERNET: PUT a API → Actualizar caché → Retornar
   * SIN INTERNET: Actualizar solo en caché → Marcar para sincronización → Retornar
   */
  async updateWriting(writingId: string, request: UpdateWritingRequest): Promise<Writing> {
    try {
      // ✅ Intentar actualizar en API (CON INTERNET)
      const response = await apiClient.put<ApiWritingResponse>(`/writings/${writingId}`, request);
      const updatedWriting = mapApiToWriting(response);

      // 💾 Actualizar en caché
      const cachedWritings = await cacheService.getWritings() || [];
      const updated = cachedWritings.map(w => w.id === writingId ? updatedWriting : w);
      await cacheService.setWritings(updated);

      console.log('[Writings] ✅ Escrito actualizado en API y caché');
      return updatedWriting;
    } catch (error) {
      // ⚠️ Sin internet - actualizar solo en caché
      console.warn('[Writings] ⚠️ Sin internet, actualizando caché...', error);

      const cachedWritings = await cacheService.getWritings() || [];
      const existingWriting = cachedWritings.find(w => w.id === writingId);

      if (!existingWriting) {
        throw new Error('Escrito no encontrado en caché');
      }

      const updatedWriting: Writing = {
        ...existingWriting,
        title: request.title ?? existingWriting.title,
        content: request.content ?? existingWriting.content,
        tags: request.tags ?? existingWriting.tags,
        wordCount: request.content ? request.content.split(/\s+/).length : existingWriting.wordCount,
        updatedAt: new Date().toISOString(),
      };

      const updated = cachedWritings.map(w => w.id === writingId ? updatedWriting : w);
      await cacheService.setWritings(updated);

      // 📝 Marcar para sincronización cuando haya internet
      await cacheService.addPendingSync({
        type: 'update',
        entity: 'writing',
        data: { writingId, ...request },
        timestamp: Date.now(),
      });

      console.log('[Writings] 📱 Escrito actualizado offline');
      return updatedWriting;
    }
  }

  /**
   * Delete a writing
   *
   * CON INTERNET: DELETE en API → Actualizar caché → Éxito
   * SIN INTERNET: Eliminar de caché → Marcar para sincronización → Éxito
   */
  async deleteWriting(writingId: string): Promise<void> {
    try {
      // ✅ Intentar eliminar en API (CON INTERNET)
      await apiClient.delete(`/writings/${writingId}`);

      // 💾 Eliminar del caché
      const cachedWritings = await cacheService.getWritings() || [];
      const updated = cachedWritings.filter(w => w.id !== writingId);
      await cacheService.setWritings(updated);

      console.log('[Writings] ✅ Escrito eliminado en API y caché');
    } catch (error) {
      // ⚠️ Sin internet - eliminar solo del caché
      console.warn('[Writings] ⚠️ Sin internet, eliminando de caché...', error);

      const cachedWritings = await cacheService.getWritings() || [];
      const updated = cachedWritings.filter(w => w.id !== writingId);
      await cacheService.setWritings(updated);

      // 📝 Marcar para sincronización (solo si NO es ID temporal)
      if (!cacheService.isTempId(writingId)) {
        await cacheService.addPendingSync({
          type: 'delete',
          entity: 'writing',
          data: { writingId },
          timestamp: Date.now(),
        });
      }

      console.log('[Writings] 📱 Escrito eliminado offline');
    }
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
  /**
   * Carga escritos directamente desde la caché local (sin tocar API)
   */
  async loadFromCache(): Promise<Writing[]> {
    return await cacheService.getWritings() || [];
  }
}

export const writingsService = new WritingsService();

