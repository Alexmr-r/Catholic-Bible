package com.bibliacatolica.api.domain.service;

import com.bibliacatolica.api.domain.exception.BusinessRuleException;
import com.bibliacatolica.api.domain.exception.ResourceNotFoundException;
import com.bibliacatolica.api.domain.model.User;
import com.bibliacatolica.api.domain.port.out.UserRepositoryPort;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * Tests unitarios para UserService
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("UserService - Servicio de Dominio")
class UserServiceTest {

    @Mock
    private UserRepositoryPort userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private UUID userId;
    private User testUser;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        testUser = User.builder()
                .id(userId)
                .email("test@example.com")
                .passwordHash("hashedOldPassword")
                .fullName("Juan Pérez")
                .emailVerified(true)
                .active(true)
                .premium(false)
                .provider("LOCAL")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    @Nested
    @DisplayName("updateProfile()")
    class UpdateProfileTests {

        @Test
        @DisplayName("Actualiza el nombre correctamente")
        void shouldUpdateFullNameSuccessfully() {
            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(userRepository.update(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

            User result = userService.updateProfile(userId, "  María García  ");

            assertEquals("María García", result.getFullName());
            verify(userRepository).findById(userId);
            verify(userRepository).update(any(User.class));
        }

        @Test
        @DisplayName("Lanza excepción si el usuario no existe")
        void shouldThrowWhenUserNotFound() {
            when(userRepository.findById(userId)).thenReturn(Optional.empty());

            assertThrows(ResourceNotFoundException.class,
                    () -> userService.updateProfile(userId, "Nuevo Nombre"));

            verify(userRepository, never()).update(any());
        }
    }

    @Nested
    @DisplayName("changePassword()")
    class ChangePasswordTests {

        @Test
        @DisplayName("Cambia la contraseña correctamente")
        void shouldChangePasswordSuccessfully() {
            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(passwordEncoder.matches("oldPassword", "hashedOldPassword")).thenReturn(true);
            when(passwordEncoder.matches("newPassword", "hashedOldPassword")).thenReturn(false);
            when(passwordEncoder.encode("newPassword")).thenReturn("hashedNewPassword");
            when(userRepository.update(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

            assertDoesNotThrow(() ->
                    userService.changePassword(userId, "oldPassword", "newPassword"));

            verify(passwordEncoder).encode("newPassword");
            verify(userRepository).update(any(User.class));
        }

        @Test
        @DisplayName("Lanza excepción si la contraseña actual es incorrecta")
        void shouldThrowWhenCurrentPasswordIsWrong() {
            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(passwordEncoder.matches("wrongPassword", "hashedOldPassword")).thenReturn(false);

            BusinessRuleException ex = assertThrows(BusinessRuleException.class,
                    () -> userService.changePassword(userId, "wrongPassword", "newPassword"));

            assertTrue(ex.getMessage().contains("contraseña actual es incorrecta"));
            verify(userRepository, never()).update(any());
        }

        @Test
        @DisplayName("Lanza excepción si la nueva contraseña es igual a la actual")
        void shouldThrowWhenNewPasswordSameAsOld() {
            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(passwordEncoder.matches("samePassword", "hashedOldPassword")).thenReturn(true);

            BusinessRuleException ex = assertThrows(BusinessRuleException.class,
                    () -> userService.changePassword(userId, "samePassword", "samePassword"));

            assertTrue(ex.getMessage().contains("debe ser diferente"));
            verify(userRepository, never()).update(any());
        }

        @Test
        @DisplayName("Lanza excepción si el usuario no existe")
        void shouldThrowWhenUserNotFound() {
            when(userRepository.findById(userId)).thenReturn(Optional.empty());

            assertThrows(ResourceNotFoundException.class,
                    () -> userService.changePassword(userId, "old", "new"));
        }
    }

    @Nested
    @DisplayName("deleteAccount()")
    class DeleteAccountTests {

        @Test
        @DisplayName("Elimina la cuenta correctamente")
        void shouldDeleteAccountSuccessfully() {
            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            doNothing().when(userRepository).deleteById(userId);

            assertDoesNotThrow(() -> userService.deleteAccount(userId));

            verify(userRepository).deleteById(userId);
        }

        @Test
        @DisplayName("Lanza excepción si el usuario no existe")
        void shouldThrowWhenUserNotFound() {
            when(userRepository.findById(userId)).thenReturn(Optional.empty());

            assertThrows(ResourceNotFoundException.class,
                    () -> userService.deleteAccount(userId));

            verify(userRepository, never()).deleteById(any());
        }
    }
}
