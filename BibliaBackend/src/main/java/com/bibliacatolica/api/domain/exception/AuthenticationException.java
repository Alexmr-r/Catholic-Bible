package com.bibliacatolica.api.domain.exception;

/**
 * Excepción lanzada para errores de autenticación
 */
public class AuthenticationException extends DomainException {

    public AuthenticationException(String message) {
        super(message, "AUTHENTICATION_ERROR");
    }

    public static AuthenticationException invalidCredentials() {
        return new AuthenticationException("Credenciales inválidas");
    }

    public static AuthenticationException expiredToken() {
        return new AuthenticationException("Token expirado");
    }

    public static AuthenticationException invalidToken() {
        return new AuthenticationException("Token inválido");
    }
}
