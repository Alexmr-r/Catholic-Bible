package com.bibliacatolica.api.domain.port.out;

import com.bibliacatolica.api.domain.model.ReadingProgress;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Puerto de salida para persistencia de progreso de lecturas
 */
public interface ReadingProgressRepositoryPort {

    /**
     * Guardar progreso de lectura
     */
    ReadingProgress save(ReadingProgress progress);

    /**
     * Buscar por usuario y fecha
     */
    Optional<ReadingProgress> findByUserIdAndDate(UUID userId, LocalDate date);

    /**
     * Eliminar por usuario y fecha
     */
    void deleteByUserIdAndDate(UUID userId, LocalDate date);

    /**
     * Obtener todos los registros de un mes específico
     */
    List<ReadingProgress> findByUserIdAndYearMonth(UUID userId, int year, int month);

    /**
     * Obtener todos los registros de un usuario (ordenados por fecha descendente)
     */
    List<ReadingProgress> findByUserIdOrderByDateDesc(UUID userId);

    /**
     * Verificar si existe un registro para usuario y fecha
     */
    boolean existsByUserIdAndDate(UUID userId, LocalDate date);
}
