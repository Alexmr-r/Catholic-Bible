package com.bibliacatolica.api.domain.model;

/**
 * Enum que representa los colores disponibles para resaltado de versículos
 * Colores suaves/pastel para mejor legibilidad
 */
public enum HighlightColor {
    YELLOW("yellow", "#FEF08A"),    // Amarillo pastel
    GREEN("green", "#BBF7D0"),      // Verde pastel
    BLUE("blue", "#BFDBFE"),        // Azul pastel
    PINK("pink", "#FBCFE8"),        // Rosa pastel
    ORANGE("orange", "#FED7AA"),    // Naranja pastel
    PURPLE("purple", "#DDD6FE");    // Morado pastel

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

