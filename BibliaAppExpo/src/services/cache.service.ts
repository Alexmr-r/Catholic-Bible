/**
 * ==========================================
 * SERVICIO DE CACHÉ LOCAL - AsyncStorage
 * ==========================================
 *
 * Propósito: Persistir datos localmente para que la app funcione sin internet
 *
 * Estrategia:
 * 1. CON INTERNET: Leer del backend → Guardar en caché
 * 2. SIN INTERNET: Leer del caché local
 * 3. SINCRONIZACIÓN: Al recuperar internet, sincronizar cambios pendientes
 *
 * Ventajas:
 * - ✅ App funciona offline
 * - ✅ Datos persisten al cambiar de dispositivo (si hay cuenta)
 * - ✅ Sincronización automática
 * - ✅ Experiencia fluida para el usuario
 *
 * Datos que se cachean:
 * - Escritos (Writings)
 * - Favoritos (Favorites)
 * - Lecturas del día (Daily Readings)
 *
 * ==========================================
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// ========== CONSTANTES ==========

const CACHE_KEYS = {
  WRITINGS: '@biblia_writings',
  FAVORITES: '@biblia_favorites',
  DAILY_READINGS: '@biblia_daily_readings',
  PENDING_SYNC: '@biblia_pending_sync',
  LAST_SYNC: '@biblia_last_sync',
};

// ========== TIPOS ==========

interface PendingSync {
  type: 'create' | 'update' | 'delete';
  entity: 'writing' | 'favorite' | 'reading_progress';
  data: any;
  timestamp: number;
  tempId?: string; // ID temporal para items creados offline
}

// ========== SERVICIO DE CACHÉ ==========

class CacheService {
  /**
   * ==========================================
   * MÉTODOS GENÉRICOS DE CACHÉ
   * ==========================================
   */

  /**
   * Guardar datos en caché
   * @param key - Clave del caché
   * @param data - Datos a guardar (se serializan a JSON)
   */
  async set<T>(key: string, data: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(data);
      await AsyncStorage.setItem(key, jsonValue);
      console.log(`[Cache] ✅ Datos guardados: ${key}`);
    } catch (error) {
      console.error(`[Cache] ❌ Error guardando ${key}:`, error);
      throw error;
    }
  }

  /**
   * Leer datos del caché
   * @param key - Clave del caché
   * @returns Datos deserializados o null si no existen
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      if (jsonValue === null) {
        console.log(`[Cache] ⚠️ No hay datos para: ${key}`);
        return null;
      }
      console.log(`[Cache] ✅ Datos leídos: ${key}`);
      return JSON.parse(jsonValue) as T;
    } catch (error) {
      console.error(`[Cache] ❌ Error leyendo ${key}:`, error);
      return null;
    }
  }

  /**
   * Eliminar datos del caché
   * @param key - Clave del caché
   */
  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
      console.log(`[Cache] 🗑️ Datos eliminados: ${key}`);
    } catch (error) {
      console.error(`[Cache] ❌ Error eliminando ${key}:`, error);
    }
  }

  /**
   * Limpiar TODO el caché (útil al cerrar sesión)
   */
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(Object.values(CACHE_KEYS));
      console.log('[Cache] 🧹 Caché limpiado completamente');
    } catch (error) {
      console.error('[Cache] ❌ Error limpiando caché:', error);
    }
  }

  /**
   * ==========================================
   * MÉTODOS ESPECÍFICOS - ESCRITOS (WRITINGS)
   * ==========================================
   */

  /**
   * Guardar escritos en caché
   */
  async setWritings(writings: any[]): Promise<void> {
    await this.set(CACHE_KEYS.WRITINGS, {
      data: writings,
      timestamp: Date.now(),
    });
  }

  /**
   * Leer escritos del caché
   */
  async getWritings(): Promise<any[] | null> {
    const cached = await this.get<{ data: any[]; timestamp: number }>(CACHE_KEYS.WRITINGS);
    return cached?.data || null;
  }

  /**
   * ==========================================
   * MÉTODOS ESPECÍFICOS - FAVORITOS
   * ==========================================
   */

  /**
   * Guardar favoritos en caché
   */
  async setFavorites(favorites: any[]): Promise<void> {
    await this.set(CACHE_KEYS.FAVORITES, {
      data: favorites,
      timestamp: Date.now(),
    });
  }

  /**
   * Leer favoritos del caché
   */
  async getFavorites(): Promise<any[] | null> {
    const cached = await this.get<{ data: any[]; timestamp: number }>(CACHE_KEYS.FAVORITES);
    return cached?.data || null;
  }

  /**
   * ==========================================
   * MÉTODOS ESPECÍFICOS - LECTURA DEL DÍA
   * ==========================================
   */

  /**
   * Guardar lectura del día en caché
   * @param date - Fecha en formato YYYY-MM-DD
   * @param reading - Datos de la lectura
   */
  async setDailyReading(date: string, reading: any): Promise<void> {
    const key = `${CACHE_KEYS.DAILY_READINGS}:${date}`;
    await this.set(key, {
      data: reading,
      timestamp: Date.now(),
      expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 horas
    });
    console.log(`[Cache] 📖 Lectura del día guardada: ${date}`);
  }

  /**
   * Leer lectura del día del caché
   * @param date - Fecha en formato YYYY-MM-DD
   * @returns Datos de la lectura o null si no existe/expiró
   */
  async getDailyReading(date: string): Promise<any | null> {
    const key = `${CACHE_KEYS.DAILY_READINGS}:${date}`;
    const cached = await this.get<{ data: any; timestamp: number; expiresAt: number }>(key);

    if (!cached) return null;

    // Verificar si expiró (pero aún lo devolvemos para offline)
    if (cached.expiresAt < Date.now()) {
      console.log(`[Cache] ⚠️ Lectura del día expirada pero disponible: ${date}`);
    }

    return cached.data;
  }

  /**
   * Verificar si hay lectura del día en caché
   */
  async hasDailyReading(date: string): Promise<boolean> {
    const reading = await this.getDailyReading(date);
    return reading !== null;
  }

  /**
   * Limpiar lecturas del día antiguas (más de 7 días)
   */
  async cleanOldDailyReadings(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const dailyReadingKeys = keys.filter(k => k.startsWith(CACHE_KEYS.DAILY_READINGS));
      const now = Date.now();
      const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);

      for (const key of dailyReadingKeys) {
        const cached = await this.get<{ expiresAt: number }>(key);
        if (cached && cached.expiresAt < sevenDaysAgo) {
          await this.remove(key);
          console.log(`[Cache] 🗑️ Lectura antigua eliminada: ${key}`);
        }
      }
    } catch (error) {
      console.error('[Cache] ❌ Error limpiando lecturas antiguas:', error);
    }
  }

  /**
   * ==========================================
   * SINCRONIZACIÓN - Operaciones pendientes
   * ==========================================
   */

  /**
   * Agregar operación pendiente de sincronización
   * (Se usa cuando el usuario crea/edita/elimina algo SIN internet)
   */
  async addPendingSync(operation: PendingSync): Promise<void> {
    try {
      const pending = await this.get<PendingSync[]>(CACHE_KEYS.PENDING_SYNC) || [];
      pending.push(operation);
      await this.set(CACHE_KEYS.PENDING_SYNC, pending);
      console.log('[Cache] 📝 Operación pendiente agregada:', operation.type, operation.entity);
    } catch (error) {
      console.error('[Cache] ❌ Error agregando operación pendiente:', error);
    }
  }

  /**
   * Obtener operaciones pendientes de sincronización
   */
  async getPendingSync(): Promise<PendingSync[]> {
    return await this.get<PendingSync[]>(CACHE_KEYS.PENDING_SYNC) || [];
  }

  /**
   * Limpiar operaciones pendientes (después de sincronizar exitosamente)
   */
  async clearPendingSync(): Promise<void> {
    await this.remove(CACHE_KEYS.PENDING_SYNC);
    console.log('[Cache] ✅ Operaciones pendientes limpiadas');
  }

  /**
   * Registrar última sincronización exitosa
   */
  async setLastSync(): Promise<void> {
    await this.set(CACHE_KEYS.LAST_SYNC, Date.now());
  }

  /**
   * Obtener timestamp de última sincronización
   */
  async getLastSync(): Promise<number | null> {
    return await this.get<number>(CACHE_KEYS.LAST_SYNC);
  }

  /**
   * ==========================================
   * UTILIDADES
   * ==========================================
   */

  /**
   * Generar ID temporal para items creados offline
   */
  generateTempId(): string {
    return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Verificar si un ID es temporal
   */
  isTempId(id: string): boolean {
    return id.startsWith('temp_');
  }
}

// ========== EXPORTAR SINGLETON ==========

export const cacheService = new CacheService();
export { CACHE_KEYS, PendingSync };
