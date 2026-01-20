package com.bibliacatolica.api.domain.port.in;

import com.bibliacatolica.api.domain.model.Writing;

import java.util.List;
import java.util.UUID;

/**
 * Puerto de entrada para operaciones de escritos/reflexiones
 */
public interface WritingUseCase {

    /**
     * Crea un nuevo escrito
     */
    Writing createWriting(UUID userId, CreateWritingCommand command);

    /**
     * Obtiene un escrito por ID
     */
    Writing getWriting(UUID userId, UUID writingId);

    /**
     * Obtiene todos los escritos de un usuario
     */
    List<Writing> getUserWritings(UUID userId);

    /**
     * Obtiene escritos filtrados
     */
    List<Writing> getUserWritings(UUID userId, WritingFilter filter);

    /**
     * Busca en escritos del usuario
     */
    List<Writing> searchWritings(UUID userId, String searchText);

    /**
     * Actualiza un escrito
     */
    Writing updateWriting(UUID userId, UUID writingId, UpdateWritingCommand command);

    /**
     * Marca/desmarca un escrito como favorito
     */
    Writing toggleFavorite(UUID userId, UUID writingId);

    /**
     * Elimina un escrito
     */
    void deleteWriting(UUID userId, UUID writingId);

    // ========== Commands ==========

    record CreateWritingCommand(
        String title,
        String content,
        String bookId,
        Integer chapter,
        Integer verse,
        List<String> tags
    ) {}

    record UpdateWritingCommand(
        String title,
        String content,
        List<String> tags
    ) {}

    record WritingFilter(
        String sortBy,       // "recent", "book", "favorites"
        String bookId,
        Boolean favoritesOnly
    ) {}
}

