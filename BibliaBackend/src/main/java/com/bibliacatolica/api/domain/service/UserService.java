package com.bibliacatolica.api.domain.service;

import com.bibliacatolica.api.domain.exception.BusinessRuleException;
import com.bibliacatolica.api.domain.exception.ResourceNotFoundException;
import com.bibliacatolica.api.domain.model.User;
import com.bibliacatolica.api.domain.port.in.UserUseCase;
import com.bibliacatolica.api.domain.port.out.UserRepositoryPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Servicio de dominio para operaciones de usuario
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserService implements UserUseCase {

    private final UserRepositoryPort userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public User updateProfile(UUID userId, String fullName) {
        log.debug("Actualizando perfil del usuario: userId={}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        // Crear nueva instancia con el nombre actualizado
        User updatedUser = User.builder()
                .id(user.getId())
                .email(user.getEmail())
                .passwordHash(user.getPasswordHash())
                .fullName(fullName.trim())
                .emailVerified(user.isEmailVerified())
                .active(user.isActive())
                .createdAt(user.getCreatedAt())
                .updatedAt(LocalDateTime.now())
                .build();

        return userRepository.update(updatedUser);
    }

    @Override
    @Transactional
    public void changePassword(UUID userId, String currentPassword, String newPassword) {
        log.debug("Cambiando contraseña del usuario: userId={}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        // Verificar contraseña actual
        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new BusinessRuleException("La contraseña actual es incorrecta");
        }

        // Validar que la nueva contraseña sea diferente
        if (passwordEncoder.matches(newPassword, user.getPasswordHash())) {
            throw new BusinessRuleException("La nueva contraseña debe ser diferente a la actual");
        }

        // Actualizar contraseña
        String newPasswordHash = passwordEncoder.encode(newPassword);
        User updatedUser = user.withNewPassword(newPasswordHash);

        userRepository.update(updatedUser);
        log.info("Contraseña actualizada exitosamente para usuario: {}", userId);
    }

    @Override
    @Transactional
    public void deleteAccount(UUID userId) {
        log.debug("Eliminando cuenta del usuario: userId={}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        userRepository.deleteById(userId);
        log.info("Cuenta eliminada exitosamente: {}", user.getEmail());
    }
}
