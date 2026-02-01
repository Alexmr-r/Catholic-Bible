package com.bibliacatolica.api.infrastructure.adapter.in.rest.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTOs para el Calendar de Constancia (Reading Progress)
 */
public class ReadingProgressDto {

    /**
     * Request para marcar una lectura como completada
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MarkReadingRequest {

        @NotNull(message = "La fecha es obligatoria")
        @JsonFormat(pattern = "yyyy-MM-dd")
        private LocalDate date;

        private UUID dailyReadingId; // Opcional
    }

    /**
     * Response con información de progreso de lectura
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReadingProgressResponse {

        private UUID id;
        private UUID userId;

        @JsonFormat(pattern = "yyyy-MM-dd")
        private LocalDate date;

        private UUID dailyReadingId;

        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime completedAt;

        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime createdAt;
    }

    /**
     * Response para la racha actual
     */
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class StreakResponse {
        private int streak;
    }
}
