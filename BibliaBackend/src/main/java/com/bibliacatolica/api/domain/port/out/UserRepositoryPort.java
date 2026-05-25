package com.bibliacatolica.api.domain.port.out;

import com.bibliacatolica.api.domain.model.User;

import java.util.Optional;
import java.util.UUID;

/**
 * Puerto de salida para persistencia de usuarios
 */
public interface UserRepositoryPort {

    /**
     * Guarda un nuevo usuario
     */
    User save(User user);

    /**
     * Busca un usuario por ID
     */
    Optional<User> findById(UUID id);

    /**
     * Busca un usuario por email
     */
    Optional<User> findByEmail(String email);

    /**
     * Verifica si existe un usuario con el email dado
     */
    boolean existsByEmail(String email);

    /**
     * Actualiza un usuario existente
     */
    User update(User user);

    /**
     * Elimina un usuario por ID
     */
    void deleteById(UUID id);

    /**
     * Obtiene todos los usuarios de la base de datos (CMS / Backoffice)
     */
    java.util.List<User> findAll();
}

