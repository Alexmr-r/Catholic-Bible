package com.bibliacatolica.api.domain.model;

import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

/**
 * Entidad de dominio que representa un versículo de la Biblia
 */
@Getter
@Builder
public class Verse {

    private final UUID id;
    private final int verseNumber;
    private final String text;
    private final boolean hasNote;      // Si tiene nota de estudio
    private final String noteText;       // Contenido de la nota (opcional)

    /**
     * Crea una representación simple del versículo
     */
    public String getSimpleText() {
        return String.format("%d %s", verseNumber, text);
    }

    /**
     * Verifica si el versículo contiene una palabra o frase
     */
    public boolean containsText(String searchText) {
        return text.toLowerCase().contains(searchText.toLowerCase());
    }

    /**
     * Crea una nueva instancia con texto modificado para corregir erratas
     */
    public Verse withText(String newText) {
        return Verse.builder()
                .id(this.id)
                .verseNumber(this.verseNumber)
                .text(newText)
                .hasNote(this.hasNote)
                .noteText(this.noteText)
                .build();
    }
}

