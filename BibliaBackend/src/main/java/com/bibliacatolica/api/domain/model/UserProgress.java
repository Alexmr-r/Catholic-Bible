package com.bibliacatolica.api.domain.model;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entidad de dominio que representa el progreso de lectura del usuario
 */
@Getter
@Builder
public class UserProgress {

    private final UUID id;
    private final UUID userId;
    private final String bookId;
    private final String bookName;
    private final int chapterNumber;
    private final boolean completed;
    private final LocalDateTime lastReadAt;

    /**
     * Obtiene la referencia del capítulo
     */
    public String getChapterReference() {
        return String.format("%s %d", bookName, chapterNumber);
    }

    /**
     * Crea una instancia marcada como completada
     */
    public UserProgress markAsCompleted() {
        return UserProgress.builder()
                .id(this.id)
                .userId(this.userId)
                .bookId(this.bookId)
                .bookName(this.bookName)
                .chapterNumber(this.chapterNumber)
                .completed(true)
                .lastReadAt(LocalDateTime.now())
                .build();
    }

    /**
     * Actualiza la última fecha de lectura
     */
    public UserProgress updateLastRead() {
        return UserProgress.builder()
                .id(this.id)
                .userId(this.userId)
                .bookId(this.bookId)
                .bookName(this.bookName)
                .chapterNumber(this.chapterNumber)
                .completed(this.completed)
                .lastReadAt(LocalDateTime.now())
                .build();
    }
}

