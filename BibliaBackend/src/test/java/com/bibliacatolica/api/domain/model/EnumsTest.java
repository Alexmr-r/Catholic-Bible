package com.bibliacatolica.api.domain.model;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests unitarios para los enums del dominio
 */
@DisplayName("Enums del Dominio")
class EnumsTest {

    @Nested
    @DisplayName("Testament")
    class TestamentTests {

        @Test
        @DisplayName("fromCode('old') devuelve OLD")
        void shouldReturnOldForOldCode() {
            assertEquals(Testament.OLD, Testament.fromCode("old"));
        }

        @Test
        @DisplayName("fromCode('new') devuelve NEW")
        void shouldReturnNewForNewCode() {
            assertEquals(Testament.NEW, Testament.fromCode("new"));
        }

        @Test
        @DisplayName("fromCode() es case-insensitive")
        void shouldBeCaseInsensitive() {
            assertEquals(Testament.OLD, Testament.fromCode("OLD"));
            assertEquals(Testament.NEW, Testament.fromCode("New"));
        }

        @Test
        @DisplayName("fromCode() lanza excepción para código inválido")
        void shouldThrowForInvalidCode() {
            assertThrows(IllegalArgumentException.class,
                    () -> Testament.fromCode("invalid"));
        }

        @Test
        @DisplayName("getDisplayName() devuelve nombre en español")
        void shouldReturnSpanishDisplayName() {
            assertEquals("Antiguo Testamento", Testament.OLD.getDisplayName());
            assertEquals("Nuevo Testamento", Testament.NEW.getDisplayName());
        }

        @Test
        @DisplayName("getCode() devuelve código correcto")
        void shouldReturnCorrectCode() {
            assertEquals("old", Testament.OLD.getCode());
            assertEquals("new", Testament.NEW.getCode());
        }
    }

    @Nested
    @DisplayName("HighlightColor")
    class HighlightColorTests {

        @Test
        @DisplayName("fromName() encuentra colores por nombre")
        void shouldFindColorByName() {
            assertEquals(HighlightColor.YELLOW, HighlightColor.fromName("yellow"));
            assertEquals(HighlightColor.GREEN, HighlightColor.fromName("green"));
            assertEquals(HighlightColor.BLUE, HighlightColor.fromName("blue"));
            assertEquals(HighlightColor.PINK, HighlightColor.fromName("pink"));
            assertEquals(HighlightColor.ORANGE, HighlightColor.fromName("orange"));
            assertEquals(HighlightColor.PURPLE, HighlightColor.fromName("purple"));
        }

        @Test
        @DisplayName("fromName() es case-insensitive")
        void shouldBeCaseInsensitive() {
            assertEquals(HighlightColor.YELLOW, HighlightColor.fromName("YELLOW"));
            assertEquals(HighlightColor.BLUE, HighlightColor.fromName("Blue"));
        }

        @Test
        @DisplayName("fromName() lanza excepción para color inválido")
        void shouldThrowForInvalidColor() {
            assertThrows(IllegalArgumentException.class,
                    () -> HighlightColor.fromName("invalid"));
        }

        @Test
        @DisplayName("Cada color tiene un código hex válido")
        void shouldHaveValidHexCodes() {
            for (HighlightColor color : HighlightColor.values()) {
                assertNotNull(color.getHexCode());
                assertTrue(color.getHexCode().startsWith("#"),
                        "El hex de " + color.getName() + " debe empezar con #");
                assertEquals(7, color.getHexCode().length(),
                        "El hex de " + color.getName() + " debe tener 7 caracteres (#RRGGBB)");
            }
        }

        @Test
        @DisplayName("Hay exactamente 6 colores disponibles")
        void shouldHaveExactlySixColors() {
            assertEquals(6, HighlightColor.values().length);
        }
    }

    @Nested
    @DisplayName("BookCategory")
    class BookCategoryTests {

        @Test
        @DisplayName("Categorías del AT pertenecen al testamento OLD")
        void oldTestamentCategoriesShouldHaveOldTestament() {
            assertEquals(Testament.OLD, BookCategory.PENTATEUCH.getTestament());
            assertEquals(Testament.OLD, BookCategory.HISTORICAL.getTestament());
            assertEquals(Testament.OLD, BookCategory.WISDOM.getTestament());
            assertEquals(Testament.OLD, BookCategory.PROPHETS_MAJOR.getTestament());
            assertEquals(Testament.OLD, BookCategory.PROPHETS_MINOR.getTestament());
        }

        @Test
        @DisplayName("Categorías del NT pertenecen al testamento NEW")
        void newTestamentCategoriesShouldHaveNewTestament() {
            assertEquals(Testament.NEW, BookCategory.GOSPELS.getTestament());
            assertEquals(Testament.NEW, BookCategory.HISTORY.getTestament());
            assertEquals(Testament.NEW, BookCategory.PAULINE_LETTERS.getTestament());
            assertEquals(Testament.NEW, BookCategory.CATHOLIC_LETTERS.getTestament());
            assertEquals(Testament.NEW, BookCategory.PROPHETIC.getTestament());
        }

        @Test
        @DisplayName("Cada categoría tiene un displayName no nulo")
        void shouldHaveDisplayName() {
            for (BookCategory cat : BookCategory.values()) {
                assertNotNull(cat.getDisplayName());
                assertFalse(cat.getDisplayName().isEmpty());
            }
        }

        @Test
        @DisplayName("Hay exactamente 10 categorías")
        void shouldHaveExactlyTenCategories() {
            assertEquals(10, BookCategory.values().length);
        }
    }
}
