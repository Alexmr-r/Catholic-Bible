package com.bibliacatolica.api.application.service;

import com.bibliacatolica.api.domain.exception.ResourceNotFoundException;
import com.bibliacatolica.api.domain.model.Highlight;
import com.bibliacatolica.api.domain.model.HighlightColor;
import com.bibliacatolica.api.domain.port.in.HighlightUseCase;
import com.bibliacatolica.api.domain.port.out.HighlightRepositoryPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Servicio de aplicación para operaciones de resaltado
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class HighlightService implements HighlightUseCase {

    private final HighlightRepositoryPort highlightRepository;

    @Override
    @Transactional
    public Highlight highlightVerse(UUID userId, HighlightCommand command) {
        log.info("Usuario {} resaltando versículo: {} {}:{} con color {}",
                userId, command.bookId(), command.chapterNumber(), command.verseNumber(), command.color());

        // Verificar si ya existe un resaltado
        var existing = highlightRepository.findByUserIdAndVerse(
                userId, command.bookId(), command.chapterNumber(), command.verseNumber());

        if (existing.isPresent()) {
            // Actualizar color
            Highlight updated = existing.get().withColor(command.color());
            return highlightRepository.update(updated);
        }

        // Crear nuevo resaltado
        Highlight highlight = Highlight.builder()
                .id(UUID.randomUUID())
                .userId(userId)
                .bookId(command.bookId())
                .chapterNumber(command.chapterNumber())
                .verseNumber(command.verseNumber())
                .color(command.color())
                .createdAt(LocalDateTime.now())
                .build();

        return highlightRepository.save(highlight);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Highlight> getChapterHighlights(UUID userId, String bookId, int chapterNumber) {
        log.debug("Obteniendo resaltados del capítulo {}.{} para usuario {}", bookId, chapterNumber, userId);
        return highlightRepository.findByUserIdAndChapter(userId, bookId, chapterNumber);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Highlight> getUserHighlights(UUID userId) {
        log.debug("Obteniendo todos los resaltados del usuario: {}", userId);
        return highlightRepository.findByUserId(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Highlight> getHighlightsByColor(UUID userId, HighlightColor color) {
        log.debug("Obteniendo resaltados del usuario {} con color {}", userId, color);
        return highlightRepository.findByUserIdAndColor(userId, color);
    }

    @Override
    @Transactional
    public void removeHighlight(UUID userId, String bookId, int chapter, int verse) {
        log.info("Usuario {} eliminando resaltado: {} {}:{}", userId, bookId, chapter, verse);
        highlightRepository.deleteByUserIdAndVerse(userId, bookId, chapter, verse);
    }

    @Override
    @Transactional
    public void removeHighlightById(UUID userId, UUID highlightId) {
        log.info("Usuario {} eliminando resaltado por ID: {}", userId, highlightId);

        if (highlightRepository.findByIdAndUserId(highlightId, userId).isEmpty()) {
            throw new ResourceNotFoundException("Resaltado", highlightId.toString());
        }

        highlightRepository.deleteByIdAndUserId(highlightId, userId);
    }
}

