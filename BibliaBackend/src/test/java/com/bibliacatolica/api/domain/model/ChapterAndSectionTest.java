package com.bibliacatolica.api.domain.model;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests unitarios para Chapter, Section y modelos relacionados
 */
@DisplayName("Chapter & Section - Modelos de Dominio")
class ChapterAndSectionTest {

    @Test
    @DisplayName("Chapter.getTotalVerses() cuenta versículos de todas las secciones")
    void shouldCountVersesAcrossAllSections() {
        Section section1 = Section.builder()
                .title("Sección 1")
                .orderIndex(0)
                .verses(List.of(
                        Verse.builder().id(UUID.randomUUID()).verseNumber(1).text("v1").build(),
                        Verse.builder().id(UUID.randomUUID()).verseNumber(2).text("v2").build()
                ))
                .build();

        Section section2 = Section.builder()
                .title("Sección 2")
                .orderIndex(1)
                .verses(List.of(
                        Verse.builder().id(UUID.randomUUID()).verseNumber(3).text("v3").build()
                ))
                .build();

        Chapter chapter = Chapter.builder()
                .id(UUID.randomUUID())
                .bookId("genesis")
                .chapterNumber(1)
                .version("Biblia de Jerusalén")
                .sections(List.of(section1, section2))
                .build();

        assertEquals(3, chapter.getTotalVerses());
    }

    @Test
    @DisplayName("Chapter.getReference() formatea correctamente")
    void shouldFormatChapterReference() {
        Chapter chapter = Chapter.builder()
                .id(UUID.randomUUID())
                .bookId("matthew")
                .chapterNumber(5)
                .version("Biblia de Jerusalén")
                .sections(Collections.emptyList())
                .build();

        assertEquals("matthew 5", chapter.getReference());
    }

    @Test
    @DisplayName("Chapter.getTotalVerses() devuelve 0 para secciones vacías")
    void shouldReturnZeroForEmptySections() {
        Chapter chapter = Chapter.builder()
                .id(UUID.randomUUID())
                .bookId("genesis")
                .chapterNumber(1)
                .version("Test")
                .sections(Collections.emptyList())
                .build();

        assertEquals(0, chapter.getTotalVerses());
    }

    @Test
    @DisplayName("ChapterReference.getDisplayName() formatea correctamente")
    void shouldFormatChapterReferenceDisplayName() {
        Chapter.ChapterReference ref = Chapter.ChapterReference.builder()
                .bookId("genesis")
                .bookName("Génesis")
                .chapterNumber(2)
                .build();

        assertEquals("Génesis 2", ref.getDisplayName());
    }

    @Test
    @DisplayName("Section.getVerseRange() con múltiples versículos")
    void shouldFormatVerseRangeWithMultipleVerses() {
        Section section = Section.builder()
                .title("Creación")
                .orderIndex(0)
                .verses(List.of(
                        Verse.builder().id(UUID.randomUUID()).verseNumber(1).text("v1").build(),
                        Verse.builder().id(UUID.randomUUID()).verseNumber(2).text("v2").build(),
                        Verse.builder().id(UUID.randomUUID()).verseNumber(3).text("v3").build()
                ))
                .build();

        assertEquals("1-3", section.getVerseRange());
    }

    @Test
    @DisplayName("Section.getVerseRange() con un solo versículo")
    void shouldFormatVerseRangeWithSingleVerse() {
        Section section = Section.builder()
                .title("Verso único")
                .orderIndex(0)
                .verses(List.of(
                        Verse.builder().id(UUID.randomUUID()).verseNumber(5).text("v5").build()
                ))
                .build();

        assertEquals("5", section.getVerseRange());
    }

    @Test
    @DisplayName("Section.getVerseRange() devuelve vacío para sección sin versículos")
    void shouldReturnEmptyForEmptySection() {
        Section section = Section.builder()
                .title("Vacía")
                .orderIndex(0)
                .verses(Collections.emptyList())
                .build();

        assertEquals("", section.getVerseRange());
    }
}
