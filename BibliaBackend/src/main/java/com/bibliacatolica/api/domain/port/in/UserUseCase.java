package com.bibliacatolica.api.domain.port.in;

import com.bibliacatolica.api.domain.model.User;

import java.util.UUID;

/**
 * Puerto de entrada para operaciones de usuario
 */
public interface UserUseCase {

    /**
     * Actualiza el perfil del usuario (solo nombre completo)
     */
    User updateProfile(UUID userId, String fullName);

    /**
     * Cambia la contraseña del usuario
     */
    void changePassword(UUID userId, String currentPassword, String newPassword);

    /**
     * Elimina la cuenta del usuario
     */
    void deleteAccount(UUID userId);
}
