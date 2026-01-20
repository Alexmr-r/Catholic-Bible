package com.bibliacatolica.api.domain.port.out;

import com.bibliacatolica.api.domain.model.Favorite;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Puerto de salida para persistencia de favoritos
 */
public interface FavoriteRepositoryPort {

    /**
     * Guarda un favorito
     */
    Favorite save(Favorite favorite);

    /**
     * Busca un favorito por ID
     */
    Optional<Favorite> findById(UUID id);

    /**
     * Busca un favorito por ID y usuario
     */
    Optional<Favorite> findByIdAndUserId(UUID id, UUID userId);

    /**
     * Obtiene todos los favoritos de un usuario
     */
    List<Favorite> findByUserId(UUID userId);

    /**
     * Obtiene favoritos de un usuario filtrados por testamento
     */
    List<Favorite> findByUserIdAndTestament(UUID userId, String testament);

    /**
     * Obtiene favoritos de un usuario filtrados por libro
     */
    List<Favorite> findByUserIdAndBookId(UUID userId, String bookId);

    /**
     * Obtiene favoritos de un usuario filtrados por tags
     */
    List<Favorite> findByUserIdAndTags(UUID userId, List<String> tags);

    /**
     * Busca favoritos por texto
     */
    List<Favorite> searchByUserIdAndText(UUID userId, String searchText);

    /**
     * Verifica si un versículo es favorito
     */
    boolean existsByUserIdAndVerse(UUID userId, String bookId, int chapter, int verse);

    /**
     * Busca un favorito específico
     */
    Optional<Favorite> findByUserIdAndVerse(UUID userId, String bookId, int chapter, int verse);

    /**
     * Actualiza un favorito
     */
    Favorite update(Favorite favorite);

    /**
     * Elimina un favorito
     */
    void deleteById(UUID id);

    /**
     * Elimina un favorito por usuario
     */
    void deleteByIdAndUserId(UUID id, UUID userId);

    /**
     * Cuenta favoritos de un usuario
     */
    long countByUserId(UUID userId);
}

