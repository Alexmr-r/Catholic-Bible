package com.bibliacatolica.api.infrastructure.adapter.in.rest.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTOs para operaciones de usuario
 */
public class UserDto {

    public record UpdateProfileRequest(
            @NotBlank(message = "El nombre es requerido")
            @Size(min = 2, max = 100, message = "El nombre debe tener entre 2 y 100 caracteres")
            String fullName
    ) {}

    public record ChangePasswordRequest(
            @NotBlank(message = "La contraseña actual es requerida")
            String currentPassword,

            @NotBlank(message = "La nueva contraseña es requerida")
            @Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres")
            String newPassword
    ) {}

    public record UserProfileDto(
            String id,
            String email,
            String fullName
    ) {}
}
