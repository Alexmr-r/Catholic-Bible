package com.bibliacatolica.api.application.service;

import com.bibliacatolica.api.domain.exception.ResourceNotFoundException;
import com.bibliacatolica.api.domain.model.Writing;
import com.bibliacatolica.api.domain.port.in.WritingUseCase;
import com.bibliacatolica.api.domain.port.out.BibleRepositoryPort;
import com.bibliacatolica.api.domain.port.out.WritingRepositoryPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Servicio de aplicación para operaciones de escritos/reflexiones
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class WritingService implements WritingUseCase {

    private final WritingRepositoryPort writingRepository;
    private final BibleRepositoryPort bibleRepository;

    @Override
    @Transactional
    public Writing createWriting(UUID userId, CreateWritingCommand command) {
        log.info("Usuario {} creando escrito: {}", userId, command.title());

        Writing.VerseReference verseReference = null;
        if (command.bookId() != null && command.chapter() != null && command.verse() != null) {
            String bookName = bibleRepository.findBookById(command.bookId())
                    .map(book -> book.getName())
                    .orElse(command.bookId());

            verseReference = Writing.VerseReference.builder()
                    .bookId(command.bookId())
                    .bookName(bookName)
                    .chapter(command.chapter())
                    .verse(command.verse())
                    .build();
        }

        Writing writing = Writing.builder()
                .id(UUID.randomUUID())
                .userId(userId)
                .title(command.title())
                .content(command.content())
                .verseReference(verseReference)
                .tags(command.tags())
                .isFavorite(false)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        return writingRepository.save(writing);
    }

    @Override
    @Transactional(readOnly = true)
    public Writing getWriting(UUID userId, UUID writingId) {
        log.debug("Obteniendo escrito {} del usuario {}", writingId, userId);
        return writingRepository.findByIdAndUserId(writingId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Escrito", writingId.toString()));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Writing> getUserWritings(UUID userId) {
        log.debug("Obteniendo escritos del usuario: {}", userId);
        return writingRepository.findByUserId(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Writing> getUserWritings(UUID userId, WritingFilter filter) {
        log.debug("Obteniendo escritos del usuario {} con filtro", userId);

        if (filter.favoritesOnly() != null && filter.favoritesOnly()) {
            return writingRepository.findFavoritesByUserId(userId);
        }
        if (filter.bookId() != null && !filter.bookId().isEmpty()) {
            return writingRepository.findByUserIdAndVerse(userId, filter.bookId(), 0, 0);
        }

        return writingRepository.findByUserId(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Writing> searchWritings(UUID userId, String searchText) {
        log.debug("Buscando escritos del usuario {} con texto: {}", userId, searchText);
        return writingRepository.searchByUserIdAndText(userId, searchText);
    }

    @Override
    @Transactional
    public Writing updateWriting(UUID userId, UUID writingId, UpdateWritingCommand command) {
        log.info("Usuario {} actualizando escrito: {}", userId, writingId);

        Writing existing = writingRepository.findByIdAndUserId(writingId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Escrito", writingId.toString()));

        Writing updated = Writing.builder()
                .id(existing.getId())
                .userId(existing.getUserId())
                .title(command.title() != null ? command.title() : existing.getTitle())
                .content(command.content() != null ? command.content() : existing.getContent())
                .verseReference(existing.getVerseReference())
                .tags(command.tags() != null ? command.tags() : existing.getTags())
                .isFavorite(existing.isFavorite())
                .createdAt(existing.getCreatedAt())
                .updatedAt(LocalDateTime.now())
                .build();

        return writingRepository.update(updated);
    }

    @Override
    @Transactional
    public Writing toggleFavorite(UUID userId, UUID writingId) {
        log.info("Usuario {} alternando favorito del escrito: {}", userId, writingId);

        Writing existing = writingRepository.findByIdAndUserId(writingId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Escrito", writingId.toString()));

        Writing updated = Writing.builder()
                .id(existing.getId())
                .userId(existing.getUserId())
                .title(existing.getTitle())
                .content(existing.getContent())
                .verseReference(existing.getVerseReference())
                .tags(existing.getTags())
                .isFavorite(!existing.isFavorite())
                .createdAt(existing.getCreatedAt())
                .updatedAt(LocalDateTime.now())
                .build();

        return writingRepository.update(updated);
    }

    @Override
    @Transactional
    public void deleteWriting(UUID userId, UUID writingId) {
        log.info("Usuario {} eliminando escrito: {}", userId, writingId);

        if (writingRepository.findByIdAndUserId(writingId, userId).isEmpty()) {
            throw new ResourceNotFoundException("Escrito", writingId.toString());
        }

        writingRepository.deleteByIdAndUserId(writingId, userId);
    }
}

