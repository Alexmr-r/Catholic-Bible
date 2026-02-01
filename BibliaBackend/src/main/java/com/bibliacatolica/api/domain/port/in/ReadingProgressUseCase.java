package com.bibliacatolica.api.domain.port.in;

import com.bibliacatolica.api.domain.model.ReadingProgress;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Puerto de entrada para casos de uso de progreso de lecturas
 */
public interface ReadingProgressUseCase {

    /**
     * Marcar una lectura como completada
     */
    ReadingProgress markAsComplete(UUID userId, LocalDate date, UUID dailyReadingId);

    /**
     * Desmarcar una lectura
     */
    void unmarkAsComplete(UUID userId, LocalDate date);

    /**
     * Verificar si una fecha está completada
     */
    boolean isDateCompleted(UUID userId, LocalDate date);

    /**
     * Obtener progreso de un mes específico
     */
    List<ReadingProgress> getMonthProgress(UUID userId, int year, int month);

    /**
     * Obtener racha actual de días consecutivos
     */
    int getCurrentStreak(UUID userId);
}

