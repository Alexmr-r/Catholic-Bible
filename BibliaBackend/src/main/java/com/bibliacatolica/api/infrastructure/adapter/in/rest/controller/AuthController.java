package com.bibliacatolica.api.infrastructure.adapter.in.rest.controller;

import com.bibliacatolica.api.domain.model.User;
import com.bibliacatolica.api.domain.port.in.AuthenticationUseCase;
import com.bibliacatolica.api.infrastructure.adapter.in.rest.dto.AuthDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controlador REST para autenticación
 */
@Slf4j
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Autenticación", description = "Endpoints para registro, login y gestión de sesión")
public class AuthController {

        private final AuthenticationUseCase authenticationUseCase;

        @PostMapping("/register")
        @Operation(summary = "Registrar nuevo usuario", description = "Crea una nueva cuenta de usuario")
        public ResponseEntity<AuthDto.AuthResponse> register(
                        @Valid @RequestBody AuthDto.RegisterRequest request) {
                log.info("Solicitud de registro para: {}", request.email());

                AuthenticationUseCase.AuthResult result = authenticationUseCase.register(
                                new AuthenticationUseCase.RegisterCommand(
                                                request.email(),
                                                request.password(),
                                                request.fullName()));

                return ResponseEntity
                                .status(HttpStatus.CREATED)
                                .body(toAuthResponse(result));
        }

        @PostMapping("/login")
        @Operation(summary = "Iniciar sesión", description = "Autentica al usuario y devuelve tokens")
        public ResponseEntity<AuthDto.AuthResponse> login(
                        @Valid @RequestBody AuthDto.LoginRequest request) {
                log.info("Solicitud de login para: {}", request.email());

                AuthenticationUseCase.AuthResult result = authenticationUseCase.login(
                                new AuthenticationUseCase.LoginCommand(
                                                request.email(),
                                                request.password()));

                return ResponseEntity.ok(toAuthResponse(result));
        }

        @PostMapping("/refresh")
        @Operation(summary = "Refrescar token", description = "Obtiene un nuevo access token usando el refresh token")
        public ResponseEntity<AuthDto.AuthResponse> refreshToken(
                        @Valid @RequestBody AuthDto.RefreshTokenRequest request) {
                log.debug("Solicitud de refresh token");

                AuthenticationUseCase.AuthResult result = authenticationUseCase.refreshToken(request.refreshToken());

                return ResponseEntity.ok(toAuthResponse(result));
        }

        @PostMapping("/logout")
        @Operation(summary = "Cerrar sesión", description = "Invalida el token actual")
        public ResponseEntity<Void> logout(@RequestHeader("Authorization") String authHeader) {
                log.info("Solicitud de logout");

                String token = authHeader.replace("Bearer ", "");
                User user = authenticationUseCase.getCurrentUser(token);
                authenticationUseCase.logout(user.getId(), token);

                return ResponseEntity.noContent().build();
        }

        @GetMapping("/me")
        @Operation(summary = "Obtener usuario actual", description = "Devuelve los datos del usuario autenticado")
        public ResponseEntity<AuthDto.UserDto> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
                String token = authHeader.replace("Bearer ", "");
                User user = authenticationUseCase.getCurrentUser(token);

                return ResponseEntity.ok(new AuthDto.UserDto(
                                user.getId().toString(),
                                user.getEmail(),
                                user.getFullName(),
                                user.isPremium(),
                                user.isTrialActive(),
                                user.getTrialStartDate()));
        }

        @PostMapping("/forgot-password")
        @Operation(summary = "Olvidé mi contraseña", description = "Inicia el proceso enviando un código de 6 dígitos al correo (modo simulado actual)")
        public ResponseEntity<Void> forgotPassword(@Valid @RequestBody AuthDto.ForgotPasswordRequest request) {
                log.info("Solicitud de forgot password para: {}", request.email());
                authenticationUseCase.forgotPassword(request.email());
                return ResponseEntity.ok().build();
        }

        @PostMapping("/verify-reset-code")
        @Operation(summary = "Verificar código", description = "Comprueba si el código de 6 dígitos es válido")
        public ResponseEntity<java.util.Map<String, Boolean>> verifyResetCode(
                        @Valid @RequestBody AuthDto.VerifyResetCodeRequest request) {
                log.info("Verificando código para: {}", request.email());
                boolean isValid = authenticationUseCase.verifyResetCode(request.email(), request.code());
                return ResponseEntity.ok(java.util.Map.of("valid", isValid));
        }

        @PostMapping("/reset-password")
        @Operation(summary = "Restablecer contraseña", description = "Cambia la contraseña utilizando el código validado")
        public ResponseEntity<Void> resetPassword(@Valid @RequestBody AuthDto.ResetPasswordRequest request) {
                log.info("Restableciendo contraseña para: {}", request.email());
                authenticationUseCase.resetPassword(request.email(), request.code(), request.newPassword());
                return ResponseEntity.ok().build();
        }

        @PostMapping("/google")
        @Operation(summary = "Login con Google", description = "Verifica el token de Google y autentica al usuario")
        public ResponseEntity<AuthDto.AuthResponse> loginWithGoogle(
                        @Valid @RequestBody AuthDto.GoogleLoginRequest request) {
                log.info("Solicitud de login con Google recibida");

                AuthenticationUseCase.AuthResult result = authenticationUseCase.loginWithGoogle(
                                new AuthenticationUseCase.GoogleLoginCommand(request.idToken()));

                return ResponseEntity.ok(toAuthResponse(result));
        }

        @PostMapping("/apple")
        @Operation(summary = "Login con Apple", description = "Verifica el token de Apple y autentica al usuario")
        public ResponseEntity<AuthDto.AuthResponse> loginWithApple(
                        @Valid @RequestBody AuthDto.AppleLoginRequest request) {
                log.info("Solicitud de login con Apple recibida");

                AuthenticationUseCase.AuthResult result = authenticationUseCase.loginWithApple(
                                new AuthenticationUseCase.AppleLoginCommand(request.identityToken(),
                                                request.fullName()));

                return ResponseEntity.ok(toAuthResponse(result));
        }

        // ========== Métodos privados ==========

        private AuthDto.AuthResponse toAuthResponse(AuthenticationUseCase.AuthResult result) {
                return new AuthDto.AuthResponse(
                                new AuthDto.UserDto(
                                                result.user().getId().toString(),
                                                result.user().getEmail(),
                                                result.user().getFullName(),
                                                result.user().isPremium(),
                                                result.user().isTrialActive(),
                                                result.user().getTrialStartDate()),
                                result.accessToken(),
                                result.refreshToken(),
                                result.expiresIn());
        }
}
