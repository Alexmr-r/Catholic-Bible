package com.bibliacatolica.api.domain.model;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entidad de dominio que representa un resaltado de versículo
 */
@Getter
@Builder
public class Highlight {

    private final UUID id;
    private final UUID userId;
    private final String bookId;
    private final int chapterNumber;
    private final int verseNumber;
    private final HighlightColor color;
    private final LocalDateTime createdAt;

    /**
     * Obtiene la referencia del versículo resaltado
     */
    public String getReference() {
        return String.format("%s %d:%d", bookId, chapterNumber, verseNumber);
    }

    /**
     * Crea una nueva instancia con color actualizado
     */
    public Highlight withColor(HighlightColor newColor) {
        return Highlight.builder()
                .id(this.id)
                .userId(this.userId)
                .bookId(this.bookId)
                .chapterNumber(this.chapterNumber)
                .verseNumber(this.verseNumber)
                .color(newColor)
                .createdAt(this.createdAt)
                .build();
    }
}

