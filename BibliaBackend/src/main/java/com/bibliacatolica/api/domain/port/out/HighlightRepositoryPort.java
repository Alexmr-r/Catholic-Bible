package com.bibliacatolica.api.domain.port.out;

import com.bibliacatolica.api.domain.model.Highlight;
import com.bibliacatolica.api.domain.model.HighlightColor;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Puerto de salida para persistencia de resaltados
 */
public interface HighlightRepositoryPort {

    /**
     * Guarda un resaltado
     */
    Highlight save(Highlight highlight);

    /**
     * Busca un resaltado por ID
     */
    Optional<Highlight> findById(UUID id);

    /**
     * Busca un resaltado por ID y usuario
     */
    Optional<Highlight> findByIdAndUserId(UUID id, UUID userId);

    /**
     * Obtiene todos los resaltados de un usuario
     */
    List<Highlight> findByUserId(UUID userId);

    /**
     * Obtiene resaltados de un capítulo específico
     */
    List<Highlight> findByUserIdAndChapter(UUID userId, String bookId, int chapter);

    /**
     * Obtiene resaltados por color
     */
    List<Highlight> findByUserIdAndColor(UUID userId, HighlightColor color);

    /**
     * Busca un resaltado específico
     */
    Optional<Highlight> findByUserIdAndVerse(UUID userId, String bookId, int chapter, int verse);

    /**
     * Verifica si existe un resaltado
     */
    boolean existsByUserIdAndVerse(UUID userId, String bookId, int chapter, int verse);

    /**
     * Actualiza un resaltado
     */
    Highlight update(Highlight highlight);

    /**
     * Elimina un resaltado
     */
    void deleteById(UUID id);

    /**
     * Elimina un resaltado por usuario
     */
    void deleteByIdAndUserId(UUID id, UUID userId);

    /**
     * Elimina resaltado por versículo
     */
    void deleteByUserIdAndVerse(UUID userId, String bookId, int chapter, int verse);
}

