package com.bibliacatolica.api.domain.port.in;

import com.bibliacatolica.api.domain.model.DailyReading;
import com.bibliacatolica.api.domain.model.ReadingHistory;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Puerto de entrada para operaciones de lectura diaria
 */
public interface DailyReadingUseCase {

    /**
     * Obtiene la lectura del día
     */
    DailyReading getTodayReading();

    /**
     * Obtiene la lectura de una fecha específica
     */
    DailyReading getReadingByDate(LocalDate date);

    /**
     * Obtiene las lecturas de un rango de fechas
     */
    List<DailyReading> getReadingsForWeek(LocalDate startDate);

    /**
     * Marca una lectura como leída por el usuario
     */
    ReadingHistory markAsRead(UUID userId, UUID readingId);

    /**
     * Guarda la reflexión del usuario para una lectura
     */
    ReadingHistory saveReflection(UUID userId, UUID readingId, String reflection);

    /**
     * Obtiene el historial de lecturas del usuario
     */
    List<ReadingHistoryDetail> getUserReadingHistory(UUID userId);

    /**
     * Obtiene el historial de un mes específico
     */
    List<ReadingHistoryDetail> getUserReadingHistoryByMonth(UUID userId, int year, int month);

    /**
     * Verifica si el usuario ha leído hoy
     */
    boolean hasReadToday(UUID userId);

    /**
     * Guarda o programa una lectura litúrgica diaria (CMS)
     */
    DailyReading saveDailyReading(DailyReading dailyReading);

    /**
     * Elimina una lectura litúrgica programada por fecha (CMS)
     */
    void deleteDailyReadingByDate(LocalDate date);

    // ========== DTOs ==========

    record ReadingHistoryDetail(
        DailyReading reading,
        ReadingHistory history,
        boolean hasReflection
    ) {}
}

