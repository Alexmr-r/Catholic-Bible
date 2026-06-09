package com.bibliacatolica.api.domain.model;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests unitarios para el modelo de dominio User
 */
@DisplayName("User - Modelo de Dominio")
class UserTest {

    private User createBaseUser() {
        return User.builder()
                .id(UUID.randomUUID())
                .email("test@example.com")
                .passwordHash("hashedPassword123")
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
    @DisplayName("isTrialActive()")
    class TrialActiveTests {

        @Test
        @DisplayName("Devuelve true si la prueba fue iniciada hace menos de 7 días")
        void shouldReturnTrueWhenTrialStartedRecently() {
            User user = User.builder()
                    .id(UUID.randomUUID())
                    .email("trial@test.com")
                    .trialStartDate(LocalDateTime.now().minusDays(3))
                    .build();

            assertTrue(user.isTrialActive());
        }

        @Test
        @DisplayName("Devuelve false si la prueba expiró (más de 7 días)")
        void shouldReturnFalseWhenTrialExpired() {
            User user = User.builder()
                    .id(UUID.randomUUID())
                    .email("expired@test.com")
                    .trialStartDate(LocalDateTime.now().minusDays(8))
                    .build();

            assertFalse(user.isTrialActive());
        }

        @Test
        @DisplayName("Devuelve false si trialStartDate es null")
        void shouldReturnFalseWhenNoTrialStartDate() {
            User user = User.builder()
                    .id(UUID.randomUUID())
                    .email("notrial@test.com")
                    .trialStartDate(null)
                    .build();

            assertFalse(user.isTrialActive());
        }

        @Test
        @DisplayName("Devuelve true en el límite exacto de 7 días")
        void shouldReturnTrueOnExactBoundary() {
            // Justo antes de los 7 días
            User user = User.builder()
                    .id(UUID.randomUUID())
                    .email("boundary@test.com")
                    .trialStartDate(LocalDateTime.now().minusDays(6).minusHours(23))
                    .build();

            assertTrue(user.isTrialActive());
        }
    }

    @Nested
    @DisplayName("hasPremiumAccess()")
    class PremiumAccessTests {

        @Test
        @DisplayName("Devuelve true si el usuario es premium")
        void shouldReturnTrueWhenPremium() {
            User user = User.builder()
                    .id(UUID.randomUUID())
                    .premium(true)
                    .build();

            assertTrue(user.hasPremiumAccess());
        }

        @Test
        @DisplayName("Devuelve true si tiene trial activo aunque no sea premium")
        void shouldReturnTrueWhenTrialActive() {
            User user = User.builder()
                    .id(UUID.randomUUID())
                    .premium(false)
                    .trialStartDate(LocalDateTime.now().minusDays(1))
                    .build();

            assertTrue(user.hasPremiumAccess());
        }

        @Test
        @DisplayName("Devuelve false si no es premium y no tiene trial")
        void shouldReturnFalseWhenNotPremiumAndNoTrial() {
            User user = User.builder()
                    .id(UUID.randomUUID())
                    .premium(false)
                    .trialStartDate(null)
                    .build();

            assertFalse(user.hasPremiumAccess());
        }
    }

    @Nested
    @DisplayName("canLogin()")
    class CanLoginTests {

        @Test
        @DisplayName("Devuelve true si está activo y verificado")
        void shouldReturnTrueWhenActiveAndVerified() {
            User user = User.builder()
                    .id(UUID.randomUUID())
                    .active(true)
                    .emailVerified(true)
                    .build();

            assertTrue(user.canLogin());
        }

        @Test
        @DisplayName("Devuelve false si no está activo")
        void shouldReturnFalseWhenNotActive() {
            User user = User.builder()
                    .id(UUID.randomUUID())
                    .active(false)
                    .emailVerified(true)
                    .build();

            assertFalse(user.canLogin());
        }

        @Test
        @DisplayName("Devuelve false si el email no está verificado")
        void shouldReturnFalseWhenEmailNotVerified() {
            User user = User.builder()
                    .id(UUID.randomUUID())
                    .active(true)
                    .emailVerified(false)
                    .build();

            assertFalse(user.canLogin());
        }
    }

    @Nested
    @DisplayName("Métodos with*()")
    class ImmutableUpdateTests {

        @Test
        @DisplayName("withEmailVerified() crea nueva instancia con email verificado")
        void shouldCreateNewInstanceWithEmailVerified() {
            User original = createBaseUser();
            User verified = original.withEmailVerified();

            assertTrue(verified.isEmailVerified());
            assertEquals(original.getEmail(), verified.getEmail());
            assertEquals(original.getId(), verified.getId());
            assertNotSame(original, verified);
        }

        @Test
        @DisplayName("withNewPassword() crea nueva instancia con nueva contraseña")
        void shouldCreateNewInstanceWithNewPassword() {
            User original = createBaseUser();
            User updated = original.withNewPassword("newHashedPassword");

            assertEquals("newHashedPassword", updated.getPasswordHash());
            assertEquals(original.getEmail(), updated.getEmail());
            assertNotSame(original, updated);
        }

        @Test
        @DisplayName("withPremium() crea nueva instancia con estado premium")
        void shouldCreateNewInstanceWithPremiumStatus() {
            User original = createBaseUser();
            assertFalse(original.isPremium());

            User premiumUser = original.withPremium(true);
            assertTrue(premiumUser.isPremium());
            assertEquals(original.getId(), premiumUser.getId());
            assertNotSame(original, premiumUser);
        }
    }
}
