package com.bibliacatolica.api.domain.exception;

/**
 * Excepción lanzada cuando se intenta crear un recurso duplicado
 */
public class DuplicateResourceException extends DomainException {

    public DuplicateResourceException(String resourceType, String identifier) {
        super(
            String.format("%s ya existe con identificador: %s", resourceType, identifier),
            "DUPLICATE_RESOURCE"
        );
    }

    public DuplicateResourceException(String message) {
        super(message, "DUPLICATE_RESOURCE");
    }
}

