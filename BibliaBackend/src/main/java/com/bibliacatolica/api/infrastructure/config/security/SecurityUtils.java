package com.bibliacatolica.api.infrastructure.config.security;

import com.bibliacatolica.api.infrastructure.config.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Utilidad para obtener información del usuario autenticado
 */
@Component
@RequiredArgsConstructor
public class SecurityUtils {

    private final JwtTokenProvider jwtTokenProvider;

    /**
     * Obtiene el ID del usuario actualmente autenticado
     */
    public UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("No hay usuario autenticado");
        }

        // El principal es el email del usuario
        String email = authentication.getName();
        // En este caso necesitamos obtener el ID desde el contexto
        // Esto requiere que guardemos el userId en el contexto durante la autenticación
        return null; // Se implementará con el UserDetails personalizado
    }

    /**
     * Obtiene el email del usuario actualmente autenticado
     */
    public String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("No hay usuario autenticado");
        }
        return authentication.getName();
    }

    /**
     * Verifica si hay un usuario autenticado
     */
    public boolean isAuthenticated() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.isAuthenticated()
                && !"anonymousUser".equals(authentication.getPrincipal());
    }
}

