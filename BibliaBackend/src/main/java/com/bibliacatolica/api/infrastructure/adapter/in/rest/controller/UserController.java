package com.bibliacatolica.api.infrastructure.adapter.in.rest.controller;

import com.bibliacatolica.api.domain.model.User;
import com.bibliacatolica.api.domain.port.in.AuthenticationUseCase;
import com.bibliacatolica.api.domain.port.in.UserUseCase;
import com.bibliacatolica.api.infrastructure.adapter.in.rest.dto.UserDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controlador REST para operaciones de usuario
 */
@Slf4j
@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Tag(name = "Usuario", description = "Endpoints para gestión de perfil de usuario")
@SecurityRequirement(name = "Bearer Authentication")
public class UserController {

    private final UserUseCase userUseCase;
    private final AuthenticationUseCase authenticationUseCase;

    @PutMapping("/me")
    @Operation(summary = "Actualizar perfil", description = "Actualiza el nombre completo del usuario actual")
    public ResponseEntity<UserDto.UserProfileDto> updateProfile(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody UserDto.UpdateProfileRequest request) {

        String token = authHeader.replace("Bearer ", "");
        User currentUser = authenticationUseCase.getCurrentUser(token);

        log.info("Actualizando perfil de usuario: {}", currentUser.getEmail());

        User updatedUser = userUseCase.updateProfile(currentUser.getId(), request.fullName());

        return ResponseEntity.ok(new UserDto.UserProfileDto(
                updatedUser.getId().toString(),
                updatedUser.getEmail(),
                updatedUser.getFullName()
        ));
    }

    @PutMapping("/me/password")
    @Operation(summary = "Cambiar contraseña", description = "Cambia la contraseña del usuario actual")
    public ResponseEntity<Void> changePassword(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody UserDto.ChangePasswordRequest request) {

        String token = authHeader.replace("Bearer ", "");
        User currentUser = authenticationUseCase.getCurrentUser(token);

        log.info("Cambiando contraseña de usuario: {}", currentUser.getEmail());

        userUseCase.changePassword(
                currentUser.getId(),
                request.currentPassword(),
                request.newPassword()
        );

        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/me")
    @Operation(summary = "Eliminar cuenta", description = "Elimina la cuenta del usuario actual de forma permanente")
    public ResponseEntity<Void> deleteAccount(
            @RequestHeader("Authorization") String authHeader) {

        String token = authHeader.replace("Bearer ", "");
        User currentUser = authenticationUseCase.getCurrentUser(token);

        log.info("Eliminando cuenta de usuario: {}", currentUser.getEmail());

        userUseCase.deleteAccount(currentUser.getId());

        return ResponseEntity.noContent().build();
    }
}
