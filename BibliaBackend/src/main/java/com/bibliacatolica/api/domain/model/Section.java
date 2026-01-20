package com.bibliacatolica.api.domain.model;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

/**
 * Entidad de dominio que representa una sección dentro de un capítulo
 * Las secciones agrupan versículos bajo un título temático
 */
@Getter
@Builder
public class Section {

    private final String title;
    private final int orderIndex;
    private final List<Verse> verses;

    /**
     * Obtiene el rango de versículos de esta sección
     */
    public String getVerseRange() {
        if (verses.isEmpty()) {
            return "";
        }
        int first = verses.get(0).getVerseNumber();
        int last = verses.get(verses.size() - 1).getVerseNumber();
        return first == last ? String.valueOf(first) : String.format("%d-%d", first, last);
    }
}

