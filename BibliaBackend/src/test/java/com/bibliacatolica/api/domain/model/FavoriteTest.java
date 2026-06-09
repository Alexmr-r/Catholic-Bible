package com.bibliacatolica.api.domain.model;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests unitarios para el modelo de dominio Favorite
 */
@DisplayName("Favorite - Modelo de Dominio")
class FavoriteTest {

    private Favorite createTestFavorite() {
        return Favorite.builder()
                .id(UUID.randomUUID())
                .userId(UUID.randomUUID())
                .bookId("genesis")
                .bookName("Génesis")
                .chapterNumber(1)
                .verseNumber(1)
                .verseText("En el principio creó Dios los cielos y la tierra.")
                .tags(List.of("creación", "Dios", "favorito"))
                .note("Mi versículo favorito")
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("getReference() devuelve solo libro y capítulo sin versículo")
    void shouldReturnReferenceWithoutVerse() {
        Favorite fav = createTestFavorite();
        assertEquals("Génesis 1", fav.getReference());
    }

    @Test
    @DisplayName("hasTag() encuentra tags sin importar mayúsculas")
    void shouldFindTagCaseInsensitive() {
        Favorite fav = createTestFavorite();

        assertTrue(fav.hasTag("creación"));
        assertTrue(fav.hasTag("DIOS"));
        assertTrue(fav.hasTag("Favorito"));
        assertFalse(fav.hasTag("noexiste"));
    }

    @Test
    @DisplayName("hasTag() devuelve false con tags null")
    void shouldReturnFalseWithNullTags() {
        Favorite fav = Favorite.builder()
                .id(UUID.randomUUID())
                .userId(UUID.randomUUID())
                .bookId("genesis")
                .bookName("Génesis")
                .chapterNumber(1)
                .verseNumber(1)
                .verseText("Texto")
                .tags(null)
                .build();

        assertFalse(fav.hasTag("algo"));
    }

    @Test
    @DisplayName("withTags() crea nueva instancia con tags actualizados")
    void shouldCreateNewInstanceWithUpdatedTags() {
        Favorite original = createTestFavorite();
        List<String> newTags = List.of("nuevo", "tag");

        Favorite updated = original.withTags(newTags);

        assertEquals(newTags, updated.getTags());
        assertEquals(original.getBookId(), updated.getBookId());
        assertNotSame(original, updated);
    }

    @Test
    @DisplayName("withNote() crea nueva instancia con nota actualizada")
    void shouldCreateNewInstanceWithUpdatedNote() {
        Favorite original = createTestFavorite();
        Favorite updated = original.withNote("Nueva nota");

        assertEquals("Nueva nota", updated.getNote());
        assertEquals(original.getVerseText(), updated.getVerseText());
        assertNotSame(original, updated);
    }
}
