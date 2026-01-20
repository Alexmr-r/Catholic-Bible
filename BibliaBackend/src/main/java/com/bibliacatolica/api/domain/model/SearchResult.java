package com.bibliacatolica.api.domain.model;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

/**
 * Entidad de dominio que representa un resultado de búsqueda de versículos
 */
@Getter
@Builder
public class SearchResult {

    private final String bookId;
    private final String bookName;
    private final int chapterNumber;
    private final int verseNumber;
    private final String text;
    private final String highlightedText;  // Texto con marcas de resaltado
    private final double relevanceScore;

    /**
     * Obtiene la referencia completa del versículo
     */
    public String getReference() {
        return String.format("%s %d:%d", bookName, chapterNumber, verseNumber);
    }

    /**
     * Contenedor para resultados de búsqueda paginados
     */
    @Getter
    @Builder
    public static class SearchResultPage {
        private final List<SearchResult> results;
        private final long totalResults;
        private final int page;
        private final int pageSize;
        private final boolean hasMore;

        public int getTotalPages() {
            return (int) Math.ceil((double) totalResults / pageSize);
        }
    }
}

