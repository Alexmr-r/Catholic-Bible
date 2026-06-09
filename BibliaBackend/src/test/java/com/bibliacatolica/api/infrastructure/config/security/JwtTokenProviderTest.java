package com.bibliacatolica.api.infrastructure.config.security;

import com.bibliacatolica.api.domain.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Field;
import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests unitarios para JwtTokenProvider
 */
@DisplayName("JwtTokenProvider - Seguridad")
class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;
    private User testUser;

    @BeforeEach
    void setUp() throws Exception {
        jwtTokenProvider = new JwtTokenProvider();

        // Inyectar valores via reflection (simulando @Value)
        setField(jwtTokenProvider, "jwtSecret",
                "dGVzdFNlY3JldEtleUZvclRlc3RpbmdQdXJwb3Nlc09ubHlWZXJ5TG9uZ0FuZFNlY3VyZUtleQ==");
        setField(jwtTokenProvider, "accessTokenExpiration", 86400000L);
        setField(jwtTokenProvider, "refreshTokenExpiration", 604800000L);

        // Invocar @PostConstruct manualmente
        jwtTokenProvider.init();

        testUser = User.builder()
                .id(UUID.randomUUID())
                .email("test@example.com")
                .fullName("Test User")
                .emailVerified(true)
                .active(true)
                .premium(false)
                .createdAt(LocalDateTime.now())
                .build();
    }

    private void setField(Object target, String fieldName, Object value) throws Exception {
        Field field = target.getClass().getDeclaredField(fieldName);
        field.setAccessible(true);
        field.set(target, value);
    }

    @Nested
    @DisplayName("Generación de Tokens")
    class TokenGenerationTests {

        @Test
        @DisplayName("Genera access token no nulo")
        void shouldGenerateAccessToken() {
            String token = jwtTokenProvider.generateAccessToken(testUser);
            assertNotNull(token);
            assertFalse(token.isEmpty());
        }

        @Test
        @DisplayName("Genera refresh token no nulo")
        void shouldGenerateRefreshToken() {
            String token = jwtTokenProvider.generateRefreshToken(testUser);
            assertNotNull(token);
            assertFalse(token.isEmpty());
        }

        @Test
        @DisplayName("Access y refresh tokens son diferentes")
        void shouldGenerateDifferentTokens() {
            String access = jwtTokenProvider.generateAccessToken(testUser);
            String refresh = jwtTokenProvider.generateRefreshToken(testUser);
            assertNotEquals(access, refresh);
        }
    }

    @Nested
    @DisplayName("Validación de Tokens")
    class TokenValidationTests {

        @Test
        @DisplayName("Valida token correcto")
        void shouldValidateCorrectToken() {
            String token = jwtTokenProvider.generateAccessToken(testUser);
            assertTrue(jwtTokenProvider.validateToken(token));
        }

        @Test
        @DisplayName("Rechaza token inválido")
        void shouldRejectInvalidToken() {
            assertFalse(jwtTokenProvider.validateToken("invalid.token.here"));
        }

        @Test
        @DisplayName("Rechaza token vacío")
        void shouldRejectEmptyToken() {
            assertFalse(jwtTokenProvider.validateToken(""));
        }

        @Test
        @DisplayName("Rechaza token invalidado (logout)")
        void shouldRejectInvalidatedToken() {
            String token = jwtTokenProvider.generateAccessToken(testUser);
            assertTrue(jwtTokenProvider.validateToken(token));

            jwtTokenProvider.invalidateToken(token);
            assertFalse(jwtTokenProvider.validateToken(token));
        }
    }

    @Nested
    @DisplayName("Extracción de Claims")
    class ClaimExtractionTests {

        @Test
        @DisplayName("Extrae userId del token")
        void shouldExtractUserIdFromToken() {
            String token = jwtTokenProvider.generateAccessToken(testUser);
            UUID extractedId = jwtTokenProvider.getUserIdFromToken(token);
            assertEquals(testUser.getId(), extractedId);
        }

        @Test
        @DisplayName("Extrae email del token")
        void shouldExtractEmailFromToken() {
            String token = jwtTokenProvider.generateAccessToken(testUser);
            String email = jwtTokenProvider.getEmailFromToken(token);
            assertEquals("test@example.com", email);
        }
    }

    @Nested
    @DisplayName("resolveToken()")
    class ResolveTokenTests {

        @Test
        @DisplayName("Extrae token del header Bearer")
        void shouldExtractTokenFromBearerHeader() {
            String result = jwtTokenProvider.resolveToken("Bearer mytoken123");
            assertEquals("mytoken123", result);
        }

        @Test
        @DisplayName("Devuelve null para header sin Bearer")
        void shouldReturnNullForNonBearerHeader() {
            assertNull(jwtTokenProvider.resolveToken("Basic something"));
        }

        @Test
        @DisplayName("Devuelve null para header null")
        void shouldReturnNullForNullHeader() {
            assertNull(jwtTokenProvider.resolveToken(null));
        }
    }
}
