package com.bibliacatolica.api.domain.model;

import lombok.Builder;
import lombok.Getter;

import java.util.List;
import java.util.UUID;

/**
 * Entidad de dominio que representa un capítulo de un libro bíblico
 */
@Getter
@Builder
public class Chapter {

    private final UUID id;
    private final String bookId;
    private final int chapterNumber;
    private final String version;        // e.g., "Biblia de Jerusalén"
    private final List<Section> sections;
    private final ChapterReference previousChapter;
    private final ChapterReference nextChapter;

    /**
     * Obtiene el total de versículos en el capítulo
     */
    public int getTotalVerses() {
        return sections.stream()
                .mapToInt(section -> section.getVerses().size())
                .sum();
    }

    /**
     * Obtiene la referencia completa del capítulo
     */
    public String getReference() {
        return String.format("%s %d", bookId, chapterNumber);
    }

    /**
     * Value object para referencias a capítulos
     */
    @Getter
    @Builder
    public static class ChapterReference {
        private final String bookId;
        private final String bookName;
        private final int chapterNumber;

        public String getDisplayName() {
            return String.format("%s %d", bookName, chapterNumber);
        }
    }
}

