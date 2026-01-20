package com.bibliacatolica.api.domain.model;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Entidad de dominio que representa un versículo favorito del usuario
 */
@Getter
@Builder
public class Favorite {

    private final UUID id;
    private final UUID userId;
    private final String bookId;
    private final String bookName;
    private final int chapterNumber;
    private final int verseNumber;
    private final String verseText;
    private final List<String> tags;
    private final String note;
    private final LocalDateTime createdAt;

    /**
     * Obtiene la referencia del favorito
     * SIEMPRE muestra solo "Libro Capítulo" sin número de versículo
     * Ejemplo: "Génesis 1", "Éxodo 20", "Juan 3"
     */
    public String getReference() {
        return String.format("%s %d", bookName, chapterNumber);
    }

    /**
     * Verifica si tiene una etiqueta específica
     */
    public boolean hasTag(String tag) {
        return tags != null && tags.stream()
                .anyMatch(t -> t.equalsIgnoreCase(tag));
    }

    /**
     * Crea una nueva instancia con tags actualizados
     */
    public Favorite withTags(List<String> newTags) {
        return Favorite.builder()
                .id(this.id)
                .userId(this.userId)
                .bookId(this.bookId)
                .bookName(this.bookName)
                .chapterNumber(this.chapterNumber)
                .verseNumber(this.verseNumber)
                .verseText(this.verseText)
                .tags(newTags)
                .note(this.note)
                .createdAt(this.createdAt)
                .build();
    }

    /**
     * Crea una nueva instancia con nota actualizada
     */
    public Favorite withNote(String newNote) {
        return Favorite.builder()
                .id(this.id)
                .userId(this.userId)
                .bookId(this.bookId)
                .bookName(this.bookName)
                .chapterNumber(this.chapterNumber)
                .verseNumber(this.verseNumber)
                .verseText(this.verseText)
                .tags(this.tags)
                .note(newNote)
                .createdAt(this.createdAt)
                .build();
    }
}

