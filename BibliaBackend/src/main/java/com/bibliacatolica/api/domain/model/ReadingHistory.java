package com.bibliacatolica.api.domain.model;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entidad de dominio que representa el historial de lectura de un usuario
 */
@Getter
@Builder
public class ReadingHistory {

    private final UUID id;
    private final UUID userId;
    private final UUID dailyReadingId;
    private final String userReflection;
    private final LocalDateTime readAt;

    /**
     * Verifica si el usuario ha escrito una reflexión
     */
    public boolean hasReflection() {
        return userReflection != null && !userReflection.trim().isEmpty();
    }

    /**
     * Crea una nueva instancia con reflexión actualizada
     */
    public ReadingHistory withReflection(String newReflection) {
        return ReadingHistory.builder()
                .id(this.id)
                .userId(this.userId)
                .dailyReadingId(this.dailyReadingId)
                .userReflection(newReflection)
                .readAt(this.readAt)
                .build();
    }
}

