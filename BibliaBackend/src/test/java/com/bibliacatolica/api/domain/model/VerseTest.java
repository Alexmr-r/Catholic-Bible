package com.bibliacatolica.api.domain.model;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests unitarios para el modelo de dominio Verse
 */
@DisplayName("Verse - Modelo de Dominio")
class VerseTest {

    @Test
    @DisplayName("getSimpleText() formatea correctamente el número y texto")
    void shouldFormatSimpleTextCorrectly() {
        Verse verse = Verse.builder()
                .id(UUID.randomUUID())
                .verseNumber(3)
                .text("En el principio creó Dios los cielos y la tierra.")
                .build();

        assertEquals("3 En el principio creó Dios los cielos y la tierra.", verse.getSimpleText());
    }

    @Test
    @DisplayName("containsText() encuentra texto sin importar mayúsculas/minúsculas")
    void shouldFindTextCaseInsensitive() {
        Verse verse = Verse.builder()
                .id(UUID.randomUUID())
                .verseNumber(1)
                .text("Porque tanto amó Dios al mundo")
                .build();

        assertTrue(verse.containsText("amó"));
        assertTrue(verse.containsText("AMÓ"));
        assertTrue(verse.containsText("dios"));
        assertFalse(verse.containsText("cielo"));
    }

    @Test
    @DisplayName("withText() crea nueva instancia preservando otros campos")
    void shouldCreateNewInstanceWithUpdatedText() {
        UUID originalId = UUID.randomUUID();
        Verse original = Verse.builder()
                .id(originalId)
                .verseNumber(5)
                .text("Texto original")
                .hasNote(true)
                .noteText("Una nota")
                .build();

        Verse updated = original.withText("Texto corregido");

        assertEquals("Texto corregido", updated.getText());
        assertEquals(originalId, updated.getId());
        assertEquals(5, updated.getVerseNumber());
        assertTrue(updated.isHasNote());
        assertEquals("Una nota", updated.getNoteText());
    }

    @Test
    @DisplayName("containsText() devuelve false para texto vacío")
    void shouldHandleEmptySearchText() {
        Verse verse = Verse.builder()
                .id(UUID.randomUUID())
                .verseNumber(1)
                .text("Un versículo")
                .build();

        assertTrue(verse.containsText("")); // String.contains("") siempre retorna true
    }
}
