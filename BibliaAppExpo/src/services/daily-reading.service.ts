import { apiClient } from './api.client';

// ========== Types ==========

export interface DailyReading {
  id: string;
  date: string;
  title: string;
  badge: string;
  imageUrl: string | null;
  bookId: string;
  bookName: string;
  chapterNumber: number;
  verseNumbers: number[];
  readingText: string;
  biblicalReference: string;
  officialReflection: string | null;
}

export interface WeekReadings {
  readings: DailyReading[];
  startDate: string;
  endDate: string;
}

export interface ReadingHistory {
  id: string;
  readingId: string;
  date: string;
  completedAt: string;
}

// ========== API Service ==========

class DailyReadingService {
  /**
   * Get today's reading
   */
  async getTodayReading(): Promise<DailyReading> {
    const response = await apiClient.get<DailyReading>('/daily-reading/today');
    return response;
  }

  /**
   * Get reading for a specific date
   */
  async getReadingByDate(date: string): Promise<DailyReading> {
    const response = await apiClient.get<DailyReading>(`/daily-reading/${date}`);
    return response;
  }

  /**
   * Get readings for a week
   */
  async getWeekReadings(startDate?: string): Promise<WeekReadings> {
    const params = startDate ? `?startDate=${startDate}` : '';
    const response = await apiClient.get<WeekReadings>(`/daily-reading/week${params}`);
    return response;
  }

  /**
   * Mark a reading as completed
   */
  async markAsRead(readingId: string): Promise<ReadingHistory> {
    const response = await apiClient.post<ReadingHistory>(`/daily-reading/${readingId}/mark-read`, {});
    return response;
  }

  /**
   * Get user's reading history
   */
  async getReadingHistory(options?: {
    startDate?: string;
    endDate?: string;
    page?: number;
    size?: number;
  }): Promise<{ history: ReadingHistory[]; totalDays: number; streak: number }> {
    const params = new URLSearchParams();
    if (options?.startDate) params.append('startDate', options.startDate);
    if (options?.endDate) params.append('endDate', options.endDate);
    if (options?.page) params.append('page', options.page.toString());
    if (options?.size) params.append('size', options.size.toString());

    const queryString = params.toString();
    const response = await apiClient.get<{ history: ReadingHistory[]; totalDays: number; streak: number }>(
      `/daily-reading/history${queryString ? `?${queryString}` : ''}`
    );
    return response;
  }

  /**
   * Get current reading streak
   */
  async getStreak(): Promise<{ currentStreak: number; longestStreak: number; totalDaysRead: number }> {
    const response = await apiClient.get<{ currentStreak: number; longestStreak: number; totalDaysRead: number }>(
      '/daily-reading/streak'
    );
    return response;
  }
}

export const dailyReadingService = new DailyReadingService();

