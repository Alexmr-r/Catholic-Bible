package com.bibliacatolica.api.infrastructure.adapter.in.rest.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTOs para autenticación
 */
public class AuthDto {

    public record RegisterRequest(
            @NotBlank(message = "El email es requerido")
            @Email(message = "Email inválido")
            String email,

            @NotBlank(message = "La contraseña es requerida")
            @Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres")
            String password,

            @NotBlank(message = "El nombre es requerido")
            @Size(min = 2, max = 100, message = "El nombre debe tener entre 2 y 100 caracteres")
            String fullName
    ) {}

    public record LoginRequest(
            @NotBlank(message = "El email es requerido")
            @Email(message = "Email inválido")
            String email,

            @NotBlank(message = "La contraseña es requerida")
            String password
    ) {}

    public record RefreshTokenRequest(
            @NotBlank(message = "El refresh token es requerido")
            String refreshToken
    ) {}

    public record AuthResponse(
            UserDto user,
            String accessToken,
            String refreshToken,
            long expiresIn
    ) {}

    public record UserDto(
            String id,
            String email,
            String fullName
    ) {}
}

