package com.bibliacatolica.api.domain.model;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests unitarios para el modelo de dominio Highlight
 */
@DisplayName("Highlight - Modelo de Dominio")
class HighlightTest {

    @Test
    @DisplayName("getReference() formatea correctamente la referencia")
    void shouldFormatReferenceCorrectly() {
        Highlight highlight = Highlight.builder()
                .id(UUID.randomUUID())
                .userId(UUID.randomUUID())
                .bookId("genesis")
                .chapterNumber(1)
                .verseNumber(1)
                .color(HighlightColor.YELLOW)
                .createdAt(LocalDateTime.now())
                .build();

        assertEquals("genesis 1:1", highlight.getReference());
    }

    @Test
    @DisplayName("withColor() crea nueva instancia con color actualizado")
    void shouldCreateNewInstanceWithUpdatedColor() {
        Highlight original = Highlight.builder()
                .id(UUID.randomUUID())
                .userId(UUID.randomUUID())
                .bookId("john")
                .chapterNumber(3)
                .verseNumber(16)
                .color(HighlightColor.YELLOW)
                .createdAt(LocalDateTime.now())
                .build();

        Highlight updated = original.withColor(HighlightColor.BLUE);

        assertEquals(HighlightColor.BLUE, updated.getColor());
        assertEquals(original.getBookId(), updated.getBookId());
        assertEquals(original.getChapterNumber(), updated.getChapterNumber());
        assertNotSame(original, updated);
    }
}
