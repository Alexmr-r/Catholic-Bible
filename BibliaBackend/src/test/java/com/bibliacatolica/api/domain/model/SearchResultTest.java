package com.bibliacatolica.api.domain.model;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests unitarios para SearchResult y SearchResultPage
 */
@DisplayName("SearchResult - Modelo de Dominio")
class SearchResultTest {

    @Test
    @DisplayName("getReference() formatea correctamente la referencia")
    void shouldFormatReferenceCorrectly() {
        SearchResult result = SearchResult.builder()
                .bookId("john")
                .bookName("San Juan")
                .chapterNumber(3)
                .verseNumber(16)
                .text("Porque tanto amó Dios al mundo...")
                .highlightedText("Porque tanto <b>amó</b> Dios al mundo...")
                .relevanceScore(0.95)
                .build();

        assertEquals("San Juan 3:16", result.getReference());
    }

    @Test
    @DisplayName("SearchResultPage.getTotalPages() calcula páginas correctamente")
    void shouldCalculateTotalPages() {
        SearchResult.SearchResultPage page = SearchResult.SearchResultPage.builder()
                .results(java.util.Collections.emptyList())
                .totalResults(45)
                .page(0)
                .pageSize(20)
                .hasMore(true)
                .build();

        assertEquals(3, page.getTotalPages()); // ceil(45/20) = 3
    }

    @Test
    @DisplayName("SearchResultPage.getTotalPages() devuelve 1 para resultados menores que pageSize")
    void shouldReturnOnePageForFewResults() {
        SearchResult.SearchResultPage page = SearchResult.SearchResultPage.builder()
                .results(java.util.Collections.emptyList())
                .totalResults(5)
                .page(0)
                .pageSize(20)
                .hasMore(false)
                .build();

        assertEquals(1, page.getTotalPages());
    }

    @Test
    @DisplayName("SearchResultPage.getTotalPages() devuelve 0 para sin resultados")
    void shouldReturnZeroPagesForNoResults() {
        SearchResult.SearchResultPage page = SearchResult.SearchResultPage.builder()
                .results(java.util.Collections.emptyList())
                .totalResults(0)
                .page(0)
                .pageSize(20)
                .hasMore(false)
                .build();

        assertEquals(0, page.getTotalPages());
    }
}
