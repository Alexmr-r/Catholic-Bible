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
                        request.fullName()
                )
        );

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
                        request.password()
                )
        );

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
                user.getFullName()
        ));
    }

    // ========== Métodos privados ==========

    private AuthDto.AuthResponse toAuthResponse(AuthenticationUseCase.AuthResult result) {
        return new AuthDto.AuthResponse(
                new AuthDto.UserDto(
                        result.user().getId().toString(),
                        result.user().getEmail(),
                        result.user().getFullName()
                ),
                result.accessToken(),
                result.refreshToken(),
                result.expiresIn()
        );
    }
}

