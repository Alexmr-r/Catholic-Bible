package com.bibliacatolica.api.domain.port.out;

import com.bibliacatolica.api.domain.model.UserProgress;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Puerto de salida para persistencia del progreso de lectura del usuario
 */
public interface UserProgressRepositoryPort {

    /**
     * Guarda o actualiza el progreso
     */
    UserProgress save(UserProgress progress);

    /**
     * Obtiene el progreso de un capítulo específico
     */
    Optional<UserProgress> findByUserIdAndChapter(UUID userId, String bookId, int chapterNumber);

    /**
     * Obtiene todo el progreso de un usuario
     */
    List<UserProgress> findByUserId(UUID userId);

    /**
     * Obtiene el progreso de un usuario para un libro
     */
    List<UserProgress> findByUserIdAndBookId(UUID userId, String bookId);

    /**
     * Obtiene los capítulos completados por un usuario
     */
    List<UserProgress> findCompletedByUserId(UUID userId);

    /**
     * Obtiene el último capítulo leído por un usuario
     */
    Optional<UserProgress> findLastReadByUserId(UUID userId);

    /**
     * Cuenta los capítulos completados de un libro
     */
    long countCompletedByUserIdAndBookId(UUID userId, String bookId);

    /**
     * Calcula el porcentaje de progreso de un libro
     */
    double calculateBookProgress(UUID userId, String bookId, int totalChapters);
}

