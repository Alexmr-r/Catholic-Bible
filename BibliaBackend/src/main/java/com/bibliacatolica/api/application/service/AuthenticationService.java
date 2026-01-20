package com.bibliacatolica.api.application.service;

import com.bibliacatolica.api.domain.exception.AuthenticationException;
import com.bibliacatolica.api.domain.exception.DuplicateResourceException;
import com.bibliacatolica.api.domain.model.User;
import com.bibliacatolica.api.domain.port.in.AuthenticationUseCase;
import com.bibliacatolica.api.domain.port.out.UserRepositoryPort;
import com.bibliacatolica.api.infrastructure.config.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Servicio de aplicación que implementa los casos de uso de autenticación
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthenticationService implements AuthenticationUseCase {

    private final UserRepositoryPort userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Override
    @Transactional
    public AuthResult register(RegisterCommand command) {
        log.info("Registrando nuevo usuario con email: {}", command.email());

        // Verificar que el email no exista
        if (userRepository.existsByEmail(command.email())) {
            throw new DuplicateResourceException("Usuario", command.email());
        }

        // Crear el usuario
        User user = User.builder()
                .id(UUID.randomUUID())
                .email(command.email().toLowerCase().trim())
                .passwordHash(passwordEncoder.encode(command.password()))
                .fullName(command.fullName().trim())
                .emailVerified(true) // Por ahora sin verificación de email
                .active(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        User savedUser = userRepository.save(user);

        // Generar tokens
        String accessToken = jwtTokenProvider.generateAccessToken(savedUser);
        String refreshToken = jwtTokenProvider.generateRefreshToken(savedUser);

        log.info("Usuario registrado exitosamente: {}", savedUser.getId());

        return new AuthResult(
                savedUser,
                accessToken,
                refreshToken,
                jwtTokenProvider.getAccessTokenExpiration()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResult login(LoginCommand command) {
        log.info("Intento de login para: {}", command.email());

        // Buscar usuario
        User user = userRepository.findByEmail(command.email().toLowerCase().trim())
                .orElseThrow(AuthenticationException::invalidCredentials);

        // Verificar contraseña
        if (!passwordEncoder.matches(command.password(), user.getPasswordHash())) {
            log.warn("Contraseña incorrecta para usuario: {}", command.email());
            throw AuthenticationException.invalidCredentials();
        }

        // Verificar que el usuario esté activo
        if (!user.isActive()) {
            log.warn("Usuario inactivo intentó hacer login: {}", command.email());
            throw new AuthenticationException("Usuario inactivo");
        }

        // Generar tokens
        String accessToken = jwtTokenProvider.generateAccessToken(user);
        String refreshToken = jwtTokenProvider.generateRefreshToken(user);

        log.info("Login exitoso para usuario: {}", user.getId());

        return new AuthResult(
                user,
                accessToken,
                refreshToken,
                jwtTokenProvider.getAccessTokenExpiration()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResult refreshToken(String refreshToken) {
        log.debug("Refrescando token");

        // Validar el refresh token
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw AuthenticationException.invalidToken();
        }

        // Obtener el usuario del token
        UUID userId = jwtTokenProvider.getUserIdFromToken(refreshToken);
        User user = userRepository.findById(userId)
                .orElseThrow(AuthenticationException::invalidToken);

        // Generar nuevos tokens
        String newAccessToken = jwtTokenProvider.generateAccessToken(user);
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(user);

        return new AuthResult(
                user,
                newAccessToken,
                newRefreshToken,
                jwtTokenProvider.getAccessTokenExpiration()
        );
    }

    @Override
    public void logout(UUID userId, String token) {
        log.info("Logout para usuario: {}", userId);
        // En una implementación completa, aquí invalidaríamos el token
        // agregándolo a una blacklist o eliminando el refresh token de la BD
        jwtTokenProvider.invalidateToken(token);
    }

    @Override
    @Transactional(readOnly = true)
    public User getCurrentUser(String token) {
        if (!jwtTokenProvider.validateToken(token)) {
            throw AuthenticationException.invalidToken();
        }

        UUID userId = jwtTokenProvider.getUserIdFromToken(token);
        return userRepository.findById(userId)
                .orElseThrow(AuthenticationException::invalidToken);
    }
}

