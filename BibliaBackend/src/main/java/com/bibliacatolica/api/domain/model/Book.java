package com.bibliacatolica.api.domain.model;

import lombok.Builder;
import lombok.Getter;

/**
 * Entidad de dominio que representa un libro de la Biblia
 */
@Getter
@Builder
public class Book {

    private final String id;           // e.g., "genesis", "matthew"
    private final String name;          // e.g., "Génesis", "San Mateo"
    private final String abbreviation;  // e.g., "Gn", "Mt"
    private final Testament testament;
    private final BookCategory category;
    private final int totalChapters;
    private final int orderIndex;       // Orden en la Biblia
    private final String description;
    private final String author;
    private final String historicalContext;

    /**
     * Verifica si el libro pertenece al Antiguo Testamento
     */
    public boolean isOldTestament() {
        return testament == Testament.OLD;
    }

    /**
     * Verifica si el libro pertenece al Nuevo Testamento
     */
    public boolean isNewTestament() {
        return testament == Testament.NEW;
    }

    /**
     * Obtiene la referencia completa del libro
     */
    public String getFullReference() {
        return String.format("%s (%s)", name, abbreviation);
    }
}

