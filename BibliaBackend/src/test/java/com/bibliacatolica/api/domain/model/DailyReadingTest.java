package com.bibliacatolica.api.domain.model;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests unitarios para el modelo de dominio DailyReading
 */
@DisplayName("DailyReading - Modelo de Dominio")
class DailyReadingTest {

    @Test
    @DisplayName("getBiblicalReference() con rango de versículos")
    void shouldFormatReferenceWithVerseRange() {
        DailyReading reading = DailyReading.builder()
                .id(UUID.randomUUID())
                .date(LocalDate.now())
                .title("Evangelio")
                .bookName("San Juan")
                .chapterNumber(3)
                .verseNumbers(Arrays.asList(16, 17, 18))
                .build();

        assertEquals("San Juan 3:16-18", reading.getBiblicalReference());
    }

    @Test
    @DisplayName("getBiblicalReference() con un solo versículo")
    void shouldFormatReferenceWithSingleVerse() {
        DailyReading reading = DailyReading.builder()
                .id(UUID.randomUUID())
                .date(LocalDate.now())
                .title("Lectura")
                .bookName("Génesis")
                .chapterNumber(1)
                .verseNumbers(Collections.singletonList(1))
                .build();

        assertEquals("Génesis 1:1", reading.getBiblicalReference());
    }

    @Test
    @DisplayName("getBiblicalReference() sin versículos muestra solo capítulo")
    void shouldFormatReferenceWithoutVerses() {
        DailyReading reading = DailyReading.builder()
                .id(UUID.randomUUID())
                .date(LocalDate.now())
                .title("Lectura")
                .bookName("Salmos")
                .chapterNumber(23)
                .verseNumbers(Collections.emptyList())
                .build();

        assertEquals("Salmos 23", reading.getBiblicalReference());
    }

    @Test
    @DisplayName("getBiblicalReference() con verseNumbers null")
    void shouldFormatReferenceWithNullVerses() {
        DailyReading reading = DailyReading.builder()
                .id(UUID.randomUUID())
                .date(LocalDate.now())
                .title("Lectura")
                .bookName("Salmos")
                .chapterNumber(23)
                .verseNumbers(null)
                .build();

        assertEquals("Salmos 23", reading.getBiblicalReference());
    }

    @Test
    @DisplayName("isToday() devuelve true para la fecha de hoy")
    void shouldReturnTrueForTodayDate() {
        DailyReading reading = DailyReading.builder()
                .id(UUID.randomUUID())
                .date(LocalDate.now())
                .title("Hoy")
                .bookName("Test")
                .chapterNumber(1)
                .build();

        assertTrue(reading.isToday());
    }

    @Test
    @DisplayName("isToday() devuelve false para otra fecha")
    void shouldReturnFalseForOtherDate() {
        DailyReading reading = DailyReading.builder()
                .id(UUID.randomUUID())
                .date(LocalDate.now().minusDays(1))
                .title("Ayer")
                .bookName("Test")
                .chapterNumber(1)
                .build();

        assertFalse(reading.isToday());
    }

    @Test
    @DisplayName("getReadingType() mapea correctamente los badges")
    void shouldMapBadgesToReadingTypes() {
        assertEquals(DailyReading.ReadingType.GOSPEL,
                DailyReading.ReadingType.fromBadge("EVANGELIO"));
        assertEquals(DailyReading.ReadingType.FIRST_READING,
                DailyReading.ReadingType.fromBadge("PRIMERA LECTURA"));
        assertEquals(DailyReading.ReadingType.PSALM,
                DailyReading.ReadingType.fromBadge("SALMO"));
        assertEquals(DailyReading.ReadingType.OTHER,
                DailyReading.ReadingType.fromBadge("DESCONOCIDO"));
    }

    @Test
    @DisplayName("getReadingType() es case-insensitive")
    void shouldMapBadgesCaseInsensitive() {
        assertEquals(DailyReading.ReadingType.GOSPEL,
                DailyReading.ReadingType.fromBadge("evangelio"));
        assertEquals(DailyReading.ReadingType.PSALM,
                DailyReading.ReadingType.fromBadge("salmo"));
    }
}
