package com.bibliacatolica.api.domain.exception;

/**
 * Excepción lanzada cuando no se encuentra un recurso
 */
public class ResourceNotFoundException extends DomainException {

    public ResourceNotFoundException(String resourceType, String identifier) {
        super(
            String.format("%s no encontrado con identificador: %s", resourceType, identifier),
            "RESOURCE_NOT_FOUND"
        );
    }

    public ResourceNotFoundException(String message) {
        super(message, "RESOURCE_NOT_FOUND");
    }
}
