package com.bibliacatolica.api.domain.port.in;

import com.bibliacatolica.api.domain.model.Highlight;
import com.bibliacatolica.api.domain.model.HighlightColor;

import java.util.List;
import java.util.UUID;

/**
 * Puerto de entrada para operaciones de resaltado de versículos
 */
public interface HighlightUseCase {

    /**
     * Crea o actualiza un resaltado
     */
    Highlight highlightVerse(UUID userId, HighlightCommand command);

    /**
     * Obtiene los resaltados de un capítulo
     */
    List<Highlight> getChapterHighlights(UUID userId, String bookId, int chapterNumber);

    /**
     * Obtiene todos los resaltados del usuario
     */
    List<Highlight> getUserHighlights(UUID userId);

    /**
     * Obtiene resaltados por color
     */
    List<Highlight> getHighlightsByColor(UUID userId, HighlightColor color);

    /**
     * Elimina un resaltado
     */
    void removeHighlight(UUID userId, String bookId, int chapter, int verse);

    /**
     * Elimina un resaltado por ID
     */
    void removeHighlightById(UUID userId, UUID highlightId);

    // ========== Commands ==========

    record HighlightCommand(
        String bookId,
        int chapterNumber,
        int verseNumber,
        HighlightColor color
    ) {}
}

