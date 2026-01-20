package com.bibliacatolica.api.domain.model;

/**
 * Enum que representa las categorías de libros bíblicos
 */
public enum BookCategory {
    // Antiguo Testamento
    PENTATEUCH("Pentateuco", Testament.OLD),
    HISTORICAL("Históricos", Testament.OLD),
    WISDOM("Sapienciales", Testament.OLD),
    PROPHETS_MAJOR("Profetas Mayores", Testament.OLD),
    PROPHETS_MINOR("Profetas Menores", Testament.OLD),

    // Nuevo Testamento
    GOSPELS("Evangelios", Testament.NEW),
    HISTORY("Historia", Testament.NEW),
    PAULINE_LETTERS("Cartas de San Pablo", Testament.NEW),
    CATHOLIC_LETTERS("Cartas Católicas", Testament.NEW),
    PROPHETIC("Profético", Testament.NEW);

    private final String displayName;
    private final Testament testament;

    BookCategory(String displayName, Testament testament) {
        this.displayName = displayName;
        this.testament = testament;
    }

    public String getDisplayName() {
        return displayName;
    }

    public Testament getTestament() {
        return testament;
    }
}

