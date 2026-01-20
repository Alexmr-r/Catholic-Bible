package com.bibliacatolica.api.domain.port.out;

import com.bibliacatolica.api.domain.model.Writing;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Puerto de salida para persistencia de escritos/reflexiones
 */
public interface WritingRepositoryPort {

    /**
     * Guarda un escrito
     */
    Writing save(Writing writing);

    /**
     * Busca un escrito por ID
     */
    Optional<Writing> findById(UUID id);

    /**
     * Busca un escrito por ID y usuario
     */
    Optional<Writing> findByIdAndUserId(UUID id, UUID userId);

    /**
     * Obtiene todos los escritos de un usuario
     */
    List<Writing> findByUserId(UUID userId);

    /**
     * Obtiene escritos favoritos de un usuario
     */
    List<Writing> findFavoritesByUserId(UUID userId);

    /**
     * Busca escritos por tags
     */
    List<Writing> findByUserIdAndTags(UUID userId, List<String> tags);

    /**
     * Busca escritos por texto
     */
    List<Writing> searchByUserIdAndText(UUID userId, String searchText);

    /**
     * Obtiene escritos asociados a un versículo
     */
    List<Writing> findByUserIdAndVerse(UUID userId, String bookId, int chapter, int verse);

    /**
     * Actualiza un escrito
     */
    Writing update(Writing writing);

    /**
     * Elimina un escrito
     */
    void deleteById(UUID id);

    /**
     * Elimina un escrito por usuario
     */
    void deleteByIdAndUserId(UUID id, UUID userId);

    /**
     * Cuenta escritos de un usuario
     */
    long countByUserId(UUID userId);
}

