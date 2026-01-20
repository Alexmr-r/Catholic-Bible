package com.bibliacatolica.api.domain.model;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entidad de dominio que representa un usuario del sistema.
 * Esta es una clase inmutable que pertenece a la capa de dominio.
 */
@Getter
@Builder
public class User {

    private final UUID id;
    private final String email;
    private final String passwordHash;
    private final String fullName;
    private final boolean emailVerified;
    private final boolean active;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;

    /**
     * Verifica si el usuario puede iniciar sesión
     */
    public boolean canLogin() {
        return active && emailVerified;
    }

    /**
     * Crea una nueva instancia con email verificado
     */
    public User withEmailVerified() {
        return User.builder()
                .id(this.id)
                .email(this.email)
                .passwordHash(this.passwordHash)
                .fullName(this.fullName)
                .emailVerified(true)
                .active(this.active)
                .createdAt(this.createdAt)
                .updatedAt(LocalDateTime.now())
                .build();
    }

    /**
     * Crea una nueva instancia con contraseña actualizada
     */
    public User withNewPassword(String newPasswordHash) {
        return User.builder()
                .id(this.id)
                .email(this.email)
                .passwordHash(newPasswordHash)
                .fullName(this.fullName)
                .emailVerified(this.emailVerified)
                .active(this.active)
                .createdAt(this.createdAt)
                .updatedAt(LocalDateTime.now())
                .build();
    }
}

