/**
 * ==========================================
 * SERVICIO DE PROGRESO DE LECTURAS
 * ==========================================
 * Gestiona el registro de lecturas completadas con soporte offline
 */

import { apiClient } from './api.client';
import { cacheService } from './cache.service';

export interface ReadingProgress {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  dailyReadingId?: string;
  completedAt: string;
}

export interface CalendarMonth {
  year: number;
  month: number;
  completedDates: string[];
}

class ReadingProgressService {
  /**
   * Marcar lectura como completada
   * CON INTERNET: API → Caché
   * SIN INTERNET: Caché → Pending Sync
   */
  async markAsComplete(date: string, dailyReadingId?: string): Promise<ReadingProgress> {
    try {
      const response = await apiClient.post<ReadingProgress>('/reading-progress', {
        date,
        dailyReadingId,
      });
      await this.addToCache(response);
      console.log('[ReadingProgress] ✅ Marcada en API y cacheada');
      return response;
    } catch (error) {
      console.warn('[ReadingProgress] ⚠️ Sin internet, guardando localmente');
      const tempProgress: ReadingProgress = {
        id: cacheService.generateTempId(),
        userId: 'temp',
        date,
        dailyReadingId,
        completedAt: new Date().toISOString(),
      };
      await this.addToCache(tempProgress);
      await cacheService.addPendingSync({
        type: 'create',
        entity: 'reading_progress' as any,
        data: { date, dailyReadingId },
        timestamp: Date.now(),
        tempId: tempProgress.id,
      });
      return tempProgress;
    }
  }

  /**
   * Desmarcar lectura (si se equivocó)
   */
  async unmarkAsComplete(date: string): Promise<void> {
    try {
      await apiClient.delete(`/reading-progress?date=${date}`);
      await this.removeFromCache(date);
      console.log('[ReadingProgress] ✅ Desmarcada en API y caché');
    } catch (error) {
      console.warn('[ReadingProgress] ⚠️ Sin internet, desmarcando en caché');
      await this.removeFromCache(date);
      await cacheService.addPendingSync({
        type: 'delete',
        entity: 'reading_progress' as any,
        data: { date },
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Verificar si una fecha está completada
   */
  async isDateCompleted(date: string): Promise<boolean> {
    const cached = await this.getFromCache();
    return cached.some(p => p.date === date);
  }

  /**
   * Obtener progreso de un mes para el calendario
   * CON INTERNET: API → Caché
   * SIN INTERNET: Caché
   */
  async getMonthProgress(year: number, month: number): Promise<CalendarMonth> {
    try {
      const response = await apiClient.get<ReadingProgress[]>(
        `/reading-progress?year=${year}&month=${month}`
      );
      await this.updateCacheForMonth(response, year, month);
      console.log('[ReadingProgress] ✅ Mes cargado desde API');
      return {
        year,
        month,
        completedDates: response.map(p => p.date),
      };
    } catch (error) {
      console.warn('[ReadingProgress] ⚠️ Sin internet, leyendo caché');
      const cached = await this.getFromCache();
      const filtered = cached.filter(p => {
        const d = new Date(p.date);
        return d.getFullYear() === year && d.getMonth() + 1 === month;
      });
      return {
        year,
        month,
        completedDates: filtered.map(p => p.date),
      };
    }
  }

  /**
   * Obtener racha actual de días consecutivos
   */
  async getCurrentStreak(): Promise<number> {
    const cached = await this.getFromCache();
    if (cached.length === 0) return 0;

    const sortedDates = cached
      .map(p => new Date(p.date))
      .sort((a, b) => b.getTime() - a.getTime());

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let checkDate = new Date(today);

    for (const date of sortedDates) {
      const diff = Math.floor((checkDate.getTime() - date.getTime()) / 86400000);
      if (diff === 0) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (diff > 1) {
        break;
      }
    }

    return streak;
  }

  /**
   * GESTIÓN DE CACHÉ
   */
  private async addToCache(progress: ReadingProgress): Promise<void> {
    const cached = await this.getFromCache();
    const filtered = cached.filter(p => p.date !== progress.date);
    filtered.push(progress);
    await cacheService.set('@biblia_reading_progress', { data: filtered, timestamp: Date.now() });
  }

  private async removeFromCache(date: string): Promise<void> {
    const cached = await this.getFromCache();
    const filtered = cached.filter(p => p.date !== date);
    await cacheService.set('@biblia_reading_progress', { data: filtered, timestamp: Date.now() });
  }

  private async getFromCache(): Promise<ReadingProgress[]> {
    const cached = await cacheService.get<{ data: ReadingProgress[] }>('@biblia_reading_progress');
    return cached?.data || [];
  }

  private async updateCacheForMonth(
    monthData: ReadingProgress[],
    year: number,
    month: number
  ): Promise<void> {
    const cached = await this.getFromCache();
    const filtered = cached.filter(p => {
      const d = new Date(p.date);
      return !(d.getFullYear() === year && d.getMonth() + 1 === month);
    });
    const updated = [...filtered, ...monthData];
    await cacheService.set('@biblia_reading_progress', { data: updated, timestamp: Date.now() });
  }

  async clearCache(): Promise<void> {
    await cacheService.remove('@biblia_reading_progress');
  }
}

export const readingProgressService = new ReadingProgressService();
