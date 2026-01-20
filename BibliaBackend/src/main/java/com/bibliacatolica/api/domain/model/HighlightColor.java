package com.bibliacatolica.api.domain.model;

/**
 * Enum que representa los colores disponibles para resaltado de versículos
 */
public enum HighlightColor {
    GOLD("gold", "#D4AF37"),
    PRIMARY("primary", "#36454F"),
    SECONDARY("secondary", "#A65E6E"),
    BURGUNDY("burgundy", "#722F37"),
    SKY("sky", "#6B9AC4");

    private final String name;
    private final String hexCode;

    HighlightColor(String name, String hexCode) {
        this.name = name;
        this.hexCode = hexCode;
    }

    public String getName() {
        return name;
    }

    public String getHexCode() {
        return hexCode;
    }

    public static HighlightColor fromName(String name) {
        for (HighlightColor color : values()) {
            if (color.name.equalsIgnoreCase(name)) {
                return color;
            }
        }
        throw new IllegalArgumentException("Unknown highlight color: " + name);
    }
}

