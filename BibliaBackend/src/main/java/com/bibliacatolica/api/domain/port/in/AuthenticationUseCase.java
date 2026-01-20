package com.bibliacatolica.api.domain.port.in;

import com.bibliacatolica.api.domain.model.User;

import java.util.UUID;

/**
 * Puerto de entrada para operaciones de autenticación
 */
public interface AuthenticationUseCase {

    /**
     * Registra un nuevo usuario
     */
    AuthResult register(RegisterCommand command);

    /**
     * Inicia sesión
     */
    AuthResult login(LoginCommand command);

    /**
     * Refresca el token de acceso
     */
    AuthResult refreshToken(String refreshToken);

    /**
     * Cierra sesión (invalida el token)
     */
    void logout(UUID userId, String token);

    /**
     * Obtiene el usuario actual por token
     */
    User getCurrentUser(String token);

    // ========== Commands ==========

    record RegisterCommand(
        String email,
        String password,
        String fullName
    ) {}

    record LoginCommand(
        String email,
        String password
    ) {}

    // ========== Result ==========

    record AuthResult(
        User user,
        String accessToken,
        String refreshToken,
        long expiresIn
    ) {}
}

