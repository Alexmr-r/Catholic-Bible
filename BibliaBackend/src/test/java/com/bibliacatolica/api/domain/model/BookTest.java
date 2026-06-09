package com.bibliacatolica.api.domain.model;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests unitarios para el modelo de dominio Book
 */
@DisplayName("Book - Modelo de Dominio")
class BookTest {

    @Test
    @DisplayName("isOldTestament() devuelve true para libros del AT")
    void shouldReturnTrueForOldTestamentBook() {
        Book book = Book.builder()
                .id("genesis")
                .name("Génesis")
                .abbreviation("Gn")
                .testament(Testament.OLD)
                .category(BookCategory.PENTATEUCH)
                .totalChapters(50)
                .orderIndex(1)
                .build();

        assertTrue(book.isOldTestament());
        assertFalse(book.isNewTestament());
    }

    @Test
    @DisplayName("isNewTestament() devuelve true para libros del NT")
    void shouldReturnTrueForNewTestamentBook() {
        Book book = Book.builder()
                .id("matthew")
                .name("San Mateo")
                .abbreviation("Mt")
                .testament(Testament.NEW)
                .category(BookCategory.GOSPELS)
                .totalChapters(28)
                .orderIndex(40)
                .build();

        assertFalse(book.isOldTestament());
        assertTrue(book.isNewTestament());
    }

    @Test
    @DisplayName("getFullReference() formatea correctamente nombre y abreviatura")
    void shouldFormatFullReferenceCorrectly() {
        Book book = Book.builder()
                .id("genesis")
                .name("Génesis")
                .abbreviation("Gn")
                .testament(Testament.OLD)
                .category(BookCategory.PENTATEUCH)
                .totalChapters(50)
                .orderIndex(1)
                .build();

        assertEquals("Génesis (Gn)", book.getFullReference());
    }
}
