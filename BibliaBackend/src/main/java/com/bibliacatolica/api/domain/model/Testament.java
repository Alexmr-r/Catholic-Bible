package com.bibliacatolica.api.domain.model;

/**
 * Enum que representa los testamentos de la Biblia
 */
public enum Testament {
    OLD("Antiguo Testamento", "old"),
    NEW("Nuevo Testamento", "new");

    private final String displayName;
    private final String code;

    Testament(String displayName, String code) {
        this.displayName = displayName;
        this.code = code;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getCode() {
        return code;
    }

    public static Testament fromCode(String code) {
        for (Testament testament : values()) {
            if (testament.code.equalsIgnoreCase(code)) {
                return testament;
            }
        }
        throw new IllegalArgumentException("Unknown testament code: " + code);
    }
}

