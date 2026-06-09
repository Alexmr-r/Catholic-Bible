package com.bibliacatolica.api.domain.exception;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests unitarios para las excepciones de dominio
 */
@DisplayName("Excepciones de Dominio")
class DomainExceptionsTest {

    @Test
    @DisplayName("ResourceNotFoundException con tipo y ID")
    void shouldCreateResourceNotFoundWithTypeAndId() {
        ResourceNotFoundException ex = new ResourceNotFoundException("Usuario", "123");
        assertEquals("RESOURCE_NOT_FOUND", ex.getErrorCode());
        assertTrue(ex.getMessage().contains("Usuario"));
        assertTrue(ex.getMessage().contains("123"));
    }

    @Test
    @DisplayName("ResourceNotFoundException con mensaje simple")
    void shouldCreateResourceNotFoundWithMessage() {
        ResourceNotFoundException ex = new ResourceNotFoundException("No encontrado");
        assertEquals("RESOURCE_NOT_FOUND", ex.getErrorCode());
        assertEquals("No encontrado", ex.getMessage());
    }

    @Test
    @DisplayName("BusinessRuleException con mensaje")
    void shouldCreateBusinessRuleException() {
        BusinessRuleException ex = new BusinessRuleException("Regla violada");
        assertEquals("BUSINESS_RULE_VIOLATION", ex.getErrorCode());
        assertEquals("Regla violada", ex.getMessage());
    }

    @Test
    @DisplayName("BusinessRuleException con código personalizado")
    void shouldCreateBusinessRuleWithCustomCode() {
        BusinessRuleException ex = new BusinessRuleException("Error", "CUSTOM_CODE");
        assertEquals("CUSTOM_CODE", ex.getErrorCode());
    }

    @Test
    @DisplayName("Todas las excepciones extienden DomainException")
    void shouldExtendDomainException() {
        assertTrue(DomainException.class.isAssignableFrom(ResourceNotFoundException.class));
        assertTrue(DomainException.class.isAssignableFrom(BusinessRuleException.class));
    }

    @Test
    @DisplayName("DomainException es RuntimeException")
    void shouldBeRuntimeException() {
        assertTrue(RuntimeException.class.isAssignableFrom(DomainException.class));
    }
}
