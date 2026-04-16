package com.bibliacatolica.api.infrastructure.adapter.in.rest.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTOs para autenticación
 */
public class AuthDto {

        public record RegisterRequest(
                        @NotBlank(message = "El email es requerido") @Email(message = "Email inválido") String email,

                        @NotBlank(message = "La contraseña es requerida") @Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres") String password,

                        @NotBlank(message = "El nombre es requerido") @Size(min = 2, max = 100, message = "El nombre debe tener entre 2 y 100 caracteres") String fullName) {
        }

        public record LoginRequest(
                        @NotBlank(message = "El email es requerido") @Email(message = "Email inválido") String email,

                        @NotBlank(message = "La contraseña es requerida") String password) {
        }

        public record RefreshTokenRequest(
                        @NotBlank(message = "El refresh token es requerido") String refreshToken) {
        }

        public record AuthResponse(
                        UserDto user,
                        String accessToken,
                        String refreshToken,
                        long expiresIn) {
        }

        public record ForgotPasswordRequest(
                        @NotBlank(message = "El email es requerido") @Email(message = "Email inválido") String email) {
        }

        public record VerifyResetCodeRequest(
                        @NotBlank(message = "El email es requerido") @Email(message = "Email inválido") String email,

                        @NotBlank(message = "El código es requerido") String code) {
        }

        public record ResetPasswordRequest(
                        @NotBlank(message = "El email es requerido") @Email(message = "Email inválido") String email,

                        @NotBlank(message = "El código es requerido") String code,

                        @NotBlank(message = "La nueva contraseña es requerida") @Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres") String newPassword) {
        }

        public record GoogleLoginRequest(
                        @NotBlank(message = "El token de Google es requerido") String idToken) {
        }

        public record AppleLoginRequest(
                        @NotBlank(message = "El token de Apple es requerido") String identityToken,
                        String fullName) {
        }

        public record UserDto(
                        String id,
                        String email,
                        String fullName,
                        boolean isPremium,
                        boolean isTrialActive,
                        java.time.LocalDateTime trialStartDate) {
        }
}
