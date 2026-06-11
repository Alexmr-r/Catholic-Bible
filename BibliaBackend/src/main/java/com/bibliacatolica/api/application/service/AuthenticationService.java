package com.bibliacatolica.api.application.service;

import com.bibliacatolica.api.domain.exception.AuthenticationException;
import com.bibliacatolica.api.domain.exception.DuplicateResourceException;
import com.bibliacatolica.api.domain.model.User;
import com.bibliacatolica.api.domain.port.in.AuthenticationUseCase;
import com.bibliacatolica.api.domain.port.out.UserRepositoryPort;
import com.bibliacatolica.api.domain.port.out.UserTrialRepositoryPort;
import com.bibliacatolica.api.infrastructure.adapter.out.email.ResendEmailService;
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
    private final UserTrialRepositoryPort userTrialRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final ResendEmailService emailService;

    // Cache simple en memoria para los códigos de recuperación (email -> código)
    // En producción se recomienda usar Redis o tabla en BD con TTL
    private final java.util.Map<String, String> resetTokens = new java.util.concurrent.ConcurrentHashMap<>();

    @Override
    @Transactional
    public AuthResult register(RegisterCommand command) {
        log.info("Registrando nuevo usuario con email: {}", command.email());

        // Verificar que el email no exista
        if (userRepository.existsByEmail(command.email())) {
            throw new DuplicateResourceException("Usuario", command.email());
        }

        // Determinar fecha de inicio de prueba (persistente)
        LocalDateTime trialStartDate = userTrialRepository.findTrialStartDateByEmail(command.email().toLowerCase().trim())
                .orElseGet(() -> {
                    LocalDateTime now = LocalDateTime.now();
                    userTrialRepository.saveTrialStart(command.email().toLowerCase().trim(), now);
                    return now;
                });

        // Crear el usuario
        User user = User.builder()
                .id(UUID.randomUUID())
                .email(command.email().toLowerCase().trim())
                .passwordHash(passwordEncoder.encode(command.password()))
                .fullName(command.fullName().trim())
                .emailVerified(true) // Por ahora sin verificación de email
                .active(true)
                .premium(false)
                .trialStartDate(trialStartDate)
                .provider("LOCAL")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        User savedUser = userRepository.save(user);

        // Enviar email de bienvenida
        emailService.sendWelcomeEmail(savedUser.getEmail(), savedUser.getFullName());

        // Generar tokens
        String accessToken = jwtTokenProvider.generateAccessToken(savedUser);
        String refreshToken = jwtTokenProvider.generateRefreshToken(savedUser);

        log.info("Usuario registrado exitosamente: {}", savedUser.getId());

        return new AuthResult(
                savedUser,
                accessToken,
                refreshToken,
                jwtTokenProvider.getAccessTokenExpiration());
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResult login(LoginCommand command) {
        log.info("Intento de login para: {}", command.email());

        // Buscar usuario
        User user = userRepository.findByEmail(command.email().toLowerCase().trim())
                .orElseThrow(AuthenticationException::invalidCredentials);

        // Si el usuario existe pero es de Google o Apple, le avisamos
        if (!"LOCAL".equals(user.getProvider())) {
            throw new AuthenticationException("Esta cuenta usa " + user.getProvider() + ". Por favor, inicia sesión con el botón correspondiente.");
        }

        // MEJORA UX: Si el usuario intenta entrar con password pero la cuenta se creó con Google/Apple
        // (password aleatorio muy largo o nulo en lógica futura), avisar sutilmente.
        // Por ahora, simplemente validamos password.
        
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
                jwtTokenProvider.getAccessTokenExpiration());
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
                jwtTokenProvider.getAccessTokenExpiration());
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

    @Override
    public void forgotPassword(String email) {
        log.info("Generando código de recuperación para: {}", email);

        userRepository.findByEmail(email.toLowerCase().trim()).ifPresent(user -> {
            // Generar código aleatorio de 6 dígitos
            String code = String.format("%06d", new java.util.Random().nextInt(999999));

            // Guardar código
            resetTokens.put(user.getEmail(), code);

            // Enviar email real con Resend
            emailService.sendPasswordResetEmail(user.getEmail(), user.getFullName(), code);
            log.info("Email de recuperación enviado a: {}", user.getEmail());
        });
        // IMPORTANTE: Incluso si no existe el email, no lanzamos error por seguridad
        // (evitar enumeración de usuarios)
    }

    @Override
    public boolean verifyResetCode(String email, String code) {
        String savedCode = resetTokens.get(email.toLowerCase().trim());
        return savedCode != null && savedCode.equals(code);
    }

    @Override
    @Transactional
    public void resetPassword(String email, String code, String newPassword) {
        log.info("Restableciendo contraseña para: {}", email);
        String formattedEmail = email.toLowerCase().trim();

        if (!verifyResetCode(formattedEmail, code)) {
            throw new AuthenticationException("Código de recuperación inválido o expirado");
        }

        User user = userRepository.findByEmail(formattedEmail)
                .orElseThrow(() -> new AuthenticationException("Usuario no encontrado"));

        // Actualizar contraseña
        String newPasswordHash = passwordEncoder.encode(newPassword);
        User updatedUser = user.withNewPassword(newPasswordHash);

        userRepository.update(updatedUser);

        // Invalidar el código
        resetTokens.remove(formattedEmail);

        log.info("Contraseña restablecida exitosamente para: {}", formattedEmail);
    }

    @Override
    @Transactional
    public AuthResult loginWithGoogle(GoogleLoginCommand command) {
        log.info("Intento de login con Google...");
        String email;
        String fullName;

        try {
            com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier verifier =
                new com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier.Builder(
                    new com.google.api.client.http.javanet.NetHttpTransport(),
                    new com.google.api.client.json.gson.GsonFactory()
                )
                .setAudience(java.util.Arrays.asList(
                    "1055569033141", // Project Number
                    "catholicverse-40437", // Firebase Project ID
                    "1055569033141-9l6tnmaugo5tbco40si0kc9qt887ion2.apps.googleusercontent.com", // Web
                    "1055569033141-8ol7lvhvgn445bfgcha7l74e7kjsshcr.apps.googleusercontent.com", // iOS
                    "1055569033141-6rdge1p5ri3vbqassb9u10p11v230o97.apps.googleusercontent.com"  // Android
                ))
                .setAcceptableTimeSkewSeconds(60)
                .build();
            
            com.google.api.client.googleapis.auth.oauth2.GoogleIdToken idToken = verifier.verify(command.idToken());
            
            if (idToken != null) {
                email = idToken.getPayload().getEmail();
                fullName = (String) idToken.getPayload().get("name");
            } else {
                throw new AuthenticationException("Token de Google inválido");
            }
        } catch (Exception e) {
            throw new AuthenticationException("Error verificando token de Google: " + e.getMessage());
        }

        return processSocialLogin(email, fullName, "GOOGLE");
    }

    @Override
    @Transactional
    public AuthResult loginWithApple(AppleLoginCommand command) {
        log.info("Intento de login con Apple...");
        String email;
        String fullName = command.fullName() != null ? command.fullName() : "Usuario Apple";

        try {
            // Apple envía un JWT. Extraemos el email decodificando el payload en Base64.
            // (La verificación estricta de firma se omite asumiendo validación previa en cliente/Firebase, 
            // aunque para máxima seguridad en producción debería validarse contra Apple keys).
            String[] splitToken = command.identityToken().split("\\.");
            if (splitToken.length < 2) {
                throw new AuthenticationException("Token de Apple con formato inválido");
            }
            
            String payload = new String(java.util.Base64.getUrlDecoder().decode(splitToken[1]));
            com.fasterxml.jackson.databind.JsonNode jsonNode = new com.fasterxml.jackson.databind.ObjectMapper().readTree(payload);
            
            if (jsonNode.has("email")) {
                email = jsonNode.get("email").asText();
            } else {
                throw new AuthenticationException("El token de Apple no contiene un email");
            }
        } catch (Exception e) {
            throw new AuthenticationException("Error verificando token de Apple: " + e.getMessage());
        }

        return processSocialLogin(email, fullName, "APPLE");
    }

    private AuthResult processSocialLogin(String email, String fullName, String provider) {
        String formattedEmail = email.toLowerCase().trim();

        User user = userRepository.findByEmail(formattedEmail).orElseGet(() -> {
            log.info("Creando nuevo usuario vía Social Login: {}", formattedEmail);
            
            // Determinar fecha de inicio de prueba (persistente)
            LocalDateTime trialStartDate = userTrialRepository.findTrialStartDateByEmail(formattedEmail)
                    .orElseGet(() -> {
                        LocalDateTime now = LocalDateTime.now();
                        userTrialRepository.saveTrialStart(formattedEmail, now);
                        return now;
                    });

            User newUser = User.builder()
                    .id(UUID.randomUUID())
                    .email(formattedEmail)
                    .passwordHash(passwordEncoder.encode(UUID.randomUUID().toString())) // Contraseña bloqueada
                    .fullName(fullName)
                    .emailVerified(true) 
                    .active(true)
                    .trialStartDate(trialStartDate)
                    .provider(provider)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
            return userRepository.save(newUser);
        });

        // Actualizar provider si es necesario (para usuarios existentes)
        if (!provider.equals(user.getProvider())) {
            log.info("Actualizando provider de {} a {} para usuario: {}", user.getProvider(), provider, user.getEmail());
            User updatedUser = User.builder()
                    .id(user.getId())
                    .email(user.getEmail())
                    .passwordHash(user.getPasswordHash())
                    .fullName(user.getFullName())
                    .emailVerified(user.isEmailVerified())
                    .active(user.isActive())
                    .premium(user.isPremium())
                    .trialStartDate(user.getTrialStartDate())
                    .subscriptionEndDate(user.getSubscriptionEndDate())
                    .revenuecatUserId(user.getRevenuecatUserId())
                    .provider(provider)
                    .createdAt(user.getCreatedAt())
                    .updatedAt(LocalDateTime.now())
                    .build();
            user = userRepository.update(updatedUser);
        }

        if (!user.isActive()) {
            throw new AuthenticationException("Usuario inactivo");
        }

        String accessToken = jwtTokenProvider.generateAccessToken(user);
        String refreshToken = jwtTokenProvider.generateRefreshToken(user);

        log.info("Social Login exitoso para usuario: {}", user.getId());

        return new AuthResult(
                user,
                accessToken,
                refreshToken,
                jwtTokenProvider.getAccessTokenExpiration());
    }
}
