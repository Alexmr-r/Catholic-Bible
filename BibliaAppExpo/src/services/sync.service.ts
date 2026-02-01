/**
 * ==========================================
 * SERVICIO DE SINCRONIZACIÓN
 * ==========================================
 *
 * Propósito: Sincronizar operaciones pendientes cuando se recupera la conexión
 *
 * Funcionalidades:
 * 1. Detectar cuando hay conexión a internet
 * 2. Leer operaciones pendientes del caché
 * 3. Ejecutarlas una por una contra el API
 * 4. Actualizar IDs temporales con IDs reales
 * 5. Limpiar operaciones completadas
 *
 * Uso:
 * - Se ejecuta automáticamente al abrir la app
 * - Se puede ejecutar manualmente con el botón de "Sincronizar"
 *
 * ==========================================
 */

import { cacheService, PendingSync } from './cache.service';
import { apiClient } from './api.client';

class SyncService {
  private isSyncing = false;

  /**
   * ==========================================
   * SINCRONIZACIÓN PRINCIPAL
   * ==========================================
   */

  /**
   * Sincronizar todas las operaciones pendientes
   * @returns Número de operaciones sincronizadas exitosamente
   */
  async syncAll(): Promise<number> {
    if (this.isSyncing) {
      console.log('[Sync] ⚠️ Sincronización ya en progreso');
      return 0;
    }

    this.isSyncing = true;
    console.log('[Sync] 🔄 Iniciando sincronización...');

    try {
      const pendingOperations = await cacheService.getPendingSync();

      if (pendingOperations.length === 0) {
        console.log('[Sync] ✅ No hay operaciones pendientes');
        return 0;
      }

      console.log(`[Sync] 📋 ${pendingOperations.length} operaciones pendientes`);

      let successCount = 0;
      const failedOperations: PendingSync[] = [];

      // Ejecutar operaciones una por una
      for (const operation of pendingOperations) {
        try {
          await this.syncOperation(operation);
          successCount++;
          console.log(`[Sync] ✅ Operación sincronizada: ${operation.type} ${operation.entity}`);
        } catch (error) {
          console.error(`[Sync] ❌ Error sincronizando operación:`, operation, error);
          failedOperations.push(operation);
        }
      }

      // Si hay operaciones fallidas, volver a guardarlas
      if (failedOperations.length > 0) {
        await cacheService.set('@biblia_pending_sync', failedOperations);
        console.log(`[Sync] ⚠️ ${failedOperations.length} operaciones fallaron, se reintentarán`);
      } else {
        // Limpiar todas si se sincronizaron correctamente
        await cacheService.clearPendingSync();
        await cacheService.setLastSync();
        console.log('[Sync] ✅ Sincronización completada exitosamente');
      }

      return successCount;
    } catch (error) {
      console.error('[Sync] ❌ Error general en sincronización:', error);
      return 0;
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * ==========================================
   * SINCRONIZACIÓN DE OPERACIONES INDIVIDUALES
   * ==========================================
   */

  /**
   * Sincronizar una operación individual
   */
  private async syncOperation(operation: PendingSync): Promise<void> {
    if (operation.entity === 'writing') {
      await this.syncWritingOperation(operation);
    } else if (operation.entity === 'favorite') {
      await this.syncFavoriteOperation(operation);
    }
  }

  /**
   * Sincronizar operación de Writing
   */
  private async syncWritingOperation(operation: PendingSync): Promise<void> {
    switch (operation.type) {
      case 'create':
        // Crear en API y obtener ID real
        const createdWriting = await apiClient.post<{ id: string }>('/writings', operation.data);

        // Actualizar caché: reemplazar ID temporal con ID real
        if (operation.tempId && createdWriting?.id) {
          await this.updateCachedWritingId(operation.tempId, createdWriting.id);
        }
        break;

      case 'update':
        await apiClient.put(`/writings/${operation.data.writingId}`, operation.data);
        break;

      case 'delete':
        await apiClient.delete(`/writings/${operation.data.writingId}`);
        break;
    }
  }

  /**
   * Sincronizar operación de Favorite
   */
  private async syncFavoriteOperation(operation: PendingSync): Promise<void> {
    switch (operation.type) {
      case 'create':
        // Crear en API y obtener ID real
        const createdFavorite = await apiClient.post<{ id: string }>('/favorites', operation.data);

        // Actualizar caché: reemplazar ID temporal con ID real
        if (operation.tempId && createdFavorite?.id) {
          await this.updateCachedFavoriteId(operation.tempId, createdFavorite.id);
        }
        break;

      case 'update':
        await apiClient.put(`/favorites/${operation.data.favoriteId}`, operation.data);
        break;

      case 'delete':
        await apiClient.delete(`/favorites/${operation.data.favoriteId}`);
        break;
    }
  }

  /**
   * ==========================================
   * ACTUALIZACIÓN DE IDs TEMPORALES
   * ==========================================
   */

  /**
   * Actualizar ID temporal de un Writing con el ID real del servidor
   */
  private async updateCachedWritingId(tempId: string, realId: string): Promise<void> {
    const cachedWritings = await cacheService.getWritings() || [];
    const updated = cachedWritings.map(w =>
      w.id === tempId ? { ...w, id: realId } : w
    );
    await cacheService.setWritings(updated);
    console.log(`[Sync] 🔄 ID actualizado: ${tempId} → ${realId}`);
  }

  /**
   * Actualizar ID temporal de un Favorite con el ID real del servidor
   */
  private async updateCachedFavoriteId(tempId: string, realId: string): Promise<void> {
    const cachedFavorites = await cacheService.getFavorites() || [];
    const updated = cachedFavorites.map(f =>
      f.id === tempId ? { ...f, id: realId } : f
    );
    await cacheService.setFavorites(updated);
    console.log(`[Sync] 🔄 ID actualizado: ${tempId} → ${realId}`);
  }

  /**
   * ==========================================
   * UTILIDADES
   * ==========================================
   */

  /**
   * Verificar si hay operaciones pendientes
   */
  async hasPendingOperations(): Promise<boolean> {
    const pending = await cacheService.getPendingSync();
    return pending.length > 0;
  }

  /**
   * Obtener número de operaciones pendientes
   */
  async getPendingCount(): Promise<number> {
    const pending = await cacheService.getPendingSync();
    return pending.length;
  }

  /**
   * Obtener timestamp de última sincronización
   */
  async getLastSyncTime(): Promise<Date | null> {
    const timestamp = await cacheService.getLastSync();
    return timestamp ? new Date(timestamp) : null;
  }
}

// ========== EXPORTAR SINGLETON ==========

export const syncService = new SyncService();
