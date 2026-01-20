package com.bibliacatolica.api.domain.model;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Entidad de dominio que representa un escrito personal/reflexión del usuario
 */
@Getter
@Builder
public class Writing {

    private final UUID id;
    private final UUID userId;
    private final String title;
    private final String content;
    private final VerseReference verseReference;
    private final List<String> tags;
    private final boolean isFavorite;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;

    /**
     * Verifica si el escrito está asociado a un versículo
     */
    public boolean hasVerseReference() {
        return verseReference != null;
    }

    /**
     * Obtiene una vista previa del contenido
     */
    public String getPreview(int maxLength) {
        if (content == null || content.isEmpty()) {
            return "";
        }
        if (content.length() <= maxLength) {
            return content;
        }
        return content.substring(0, maxLength) + "...";
    }

    /**
     * Value object para referencia a versículos
     */
    @Getter
    @Builder
    public static class VerseReference {
        private final String bookId;
        private final String bookName;
        private final int chapter;
        private final int verse;

        public String getDisplayReference() {
            return String.format("%s %d:%d", bookName, chapter, verse);
        }
    }
}

