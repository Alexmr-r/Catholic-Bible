package com.bibliacatolica.api.domain.model;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Modelo de dominio para el progreso de lecturas (Calendario de Constancia)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReadingProgress {

    private UUID id;
    private UUID userId;
    private LocalDate date;
    private UUID dailyReadingId; // Puede ser null
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
}
