package com.bibliacatolica.api.domain.exception;

/**
 * Excepción lanzada cuando se viola una regla de negocio
 */
public class BusinessRuleException extends DomainException {

    public BusinessRuleException(String message) {
        super(message, "BUSINESS_RULE_VIOLATION");
    }

    public BusinessRuleException(String message, String errorCode) {
        super(message, errorCode);
    }
}

