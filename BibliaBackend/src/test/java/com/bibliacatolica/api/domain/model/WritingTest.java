package com.bibliacatolica.api.domain.model;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests unitarios para el modelo de dominio Writing
 */
@DisplayName("Writing - Modelo de Dominio")
class WritingTest {

    @Test
    @DisplayName("hasVerseReference() devuelve true cuando tiene referencia")
    void shouldReturnTrueWhenHasVerseReference() {
        Writing writing = Writing.builder()
                .id(UUID.randomUUID())
                .userId(UUID.randomUUID())
                .title("Mi reflexión")
                .content("Contenido de la reflexión")
                .verseReference(Writing.VerseReference.builder()
                        .bookId("john")
                        .bookName("San Juan")
                        .chapter(3)
                        .verse(16)
                        .build())
                .createdAt(LocalDateTime.now())
                .build();

        assertTrue(writing.hasVerseReference());
    }

    @Test
    @DisplayName("hasVerseReference() devuelve false cuando no tiene referencia")
    void shouldReturnFalseWhenNoVerseReference() {
        Writing writing = Writing.builder()
                .id(UUID.randomUUID())
                .userId(UUID.randomUUID())
                .title("Reflexión libre")
                .content("Sin versículo asociado")
                .verseReference(null)
                .createdAt(LocalDateTime.now())
                .build();

        assertFalse(writing.hasVerseReference());
    }

    @Test
    @DisplayName("getPreview() trunca contenido largo con '...'")
    void shouldTruncateLongContent() {
        String longContent = "Este es un contenido muy largo que debería ser truncado para la vista previa";
        Writing writing = Writing.builder()
                .id(UUID.randomUUID())
                .userId(UUID.randomUUID())
                .title("Título")
                .content(longContent)
                .createdAt(LocalDateTime.now())
                .build();

        String preview = writing.getPreview(20);
        assertEquals("Este es un contenido...", preview);
        assertEquals(23, preview.length()); // 20 + "..."
    }

    @Test
    @DisplayName("getPreview() devuelve contenido completo si es corto")
    void shouldReturnFullContentIfShort() {
        Writing writing = Writing.builder()
                .id(UUID.randomUUID())
                .userId(UUID.randomUUID())
                .title("Título")
                .content("Corto")
                .createdAt(LocalDateTime.now())
                .build();

        assertEquals("Corto", writing.getPreview(100));
    }

    @Test
    @DisplayName("getPreview() devuelve vacío si no hay contenido")
    void shouldReturnEmptyForNullContent() {
        Writing writing = Writing.builder()
                .id(UUID.randomUUID())
                .userId(UUID.randomUUID())
                .title("Título")
                .content(null)
                .createdAt(LocalDateTime.now())
                .build();

        assertEquals("", writing.getPreview(100));
    }

    @Test
    @DisplayName("getPreview() devuelve vacío para contenido vacío")
    void shouldReturnEmptyForEmptyContent() {
        Writing writing = Writing.builder()
                .id(UUID.randomUUID())
                .userId(UUID.randomUUID())
                .title("Título")
                .content("")
                .createdAt(LocalDateTime.now())
                .build();

        assertEquals("", writing.getPreview(100));
    }

    @Test
    @DisplayName("VerseReference.getDisplayReference() formatea correctamente")
    void shouldFormatVerseReferenceCorrectly() {
        Writing.VerseReference ref = Writing.VerseReference.builder()
                .bookId("matthew")
                .bookName("San Mateo")
                .chapter(5)
                .verse(3)
                .build();

        assertEquals("San Mateo 5:3", ref.getDisplayReference());
    }
}
