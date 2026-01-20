package com.bibliacatolica.api.domain.model;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Entidad de dominio que representa la lectura litúrgica del día
 */
@Getter
@Builder
public class DailyReading {

    private final UUID id;
    private final LocalDate date;
    private final String title;
    private final String badge;
    private final String imageUrl;
    private final String bookId;
    private final String bookName;
    private final int chapterNumber;
    private final List<Integer> verseNumbers;
    private final String readingText;
    private final String officialReflection;

    public String getBiblicalReference() {
        if (verseNumbers == null || verseNumbers.isEmpty()) {
            return String.format("%s %d", bookName, chapterNumber);
        }
        int first = verseNumbers.get(0);
        int last = verseNumbers.get(verseNumbers.size() - 1);
        if (first == last) {
            return String.format("%s %d:%d", bookName, chapterNumber, first);
        }
        return String.format("%s %d:%d-%d", bookName, chapterNumber, first, last);
    }

    public boolean isToday() {
        return LocalDate.now().equals(date);
    }

    public ReadingType getReadingType() {
        return ReadingType.fromBadge(badge);
    }

    public enum ReadingType {
        GOSPEL("EVANGELIO"),
        FIRST_READING("PRIMERA LECTURA"),
        SECOND_READING("SEGUNDA LECTURA"),
        PSALM("SALMO"),
        OTHER("OTRO");

        private final String badge;

        ReadingType(String badge) {
            this.badge = badge;
        }

        public static ReadingType fromBadge(String badge) {
            for (ReadingType type : values()) {
                if (type.badge.equalsIgnoreCase(badge)) {
                    return type;
                }
            }
            return OTHER;
        }
    }
}

