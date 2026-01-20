package com.bibliacatolica.api.application.service;

import com.bibliacatolica.api.domain.exception.ResourceNotFoundException;
import com.bibliacatolica.api.domain.model.Favorite;
import com.bibliacatolica.api.domain.model.Verse;
import com.bibliacatolica.api.domain.port.in.FavoriteUseCase;
import com.bibliacatolica.api.domain.port.out.BibleRepositoryPort;
import com.bibliacatolica.api.domain.port.out.FavoriteRepositoryPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Servicio de aplicación para operaciones de favoritos
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FavoriteService implements FavoriteUseCase {

    private final FavoriteRepositoryPort favoriteRepository;
    private final BibleRepositoryPort bibleRepository;

    @Override
    @Transactional
    public Favorite addFavorite(UUID userId, AddFavoriteCommand command) {
        log.info("Usuario {} agregando favorito: {} {}:{}",
                userId, command.bookId(), command.chapterNumber(), command.verseNumber());


        // Obtener el versículo para obtener el texto y nombre del libro
        Verse verse = bibleRepository.findVerse(command.bookId(), command.chapterNumber(), command.verseNumber())
                .orElseThrow(() -> new ResourceNotFoundException("Versículo",
                        String.format("%s %d:%d", command.bookId(), command.chapterNumber(), command.verseNumber())));

        // Obtener nombre del libro
        String bookName = bibleRepository.findBookById(command.bookId())
                .map(book -> book.getName())
                .orElse(command.bookId());

        Favorite favorite = Favorite.builder()
                .id(UUID.randomUUID())
                .userId(userId)
                .bookId(command.bookId())
                .bookName(bookName)
                .chapterNumber(command.chapterNumber())
                .verseNumber(command.verseNumber())
                .verseText(verse.getText())
                .tags(command.tags())
                .note(command.note())
                .createdAt(LocalDateTime.now())
                .build();

        return favoriteRepository.save(favorite);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Favorite> getUserFavorites(UUID userId) {
        log.debug("Obteniendo favoritos del usuario: {}", userId);
        return favoriteRepository.findByUserId(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Favorite> getUserFavorites(UUID userId, FavoriteFilter filter) {
        log.debug("Obteniendo favoritos del usuario {} con filtro", userId);

        if (filter.testament() != null && !filter.testament().isEmpty()) {
            return favoriteRepository.findByUserIdAndTestament(userId, filter.testament());
        }
        if (filter.bookId() != null && !filter.bookId().isEmpty()) {
            return favoriteRepository.findByUserIdAndBookId(userId, filter.bookId());
        }
        if (filter.tags() != null && !filter.tags().isEmpty()) {
            return favoriteRepository.findByUserIdAndTags(userId, filter.tags());
        }

        return favoriteRepository.findByUserId(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Favorite> searchFavorites(UUID userId, String searchText) {
        log.debug("Buscando favoritos del usuario {} con texto: {}", userId, searchText);
        return favoriteRepository.searchByUserIdAndText(userId, searchText);
    }

    @Override
    @Transactional
    public Favorite updateFavorite(UUID userId, UUID favoriteId, UpdateFavoriteCommand command) {
        log.info("Usuario {} actualizando favorito: {}", userId, favoriteId);

        Favorite existing = favoriteRepository.findByIdAndUserId(favoriteId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Favorito", favoriteId.toString()));

        Favorite updated = Favorite.builder()
                .id(existing.getId())
                .userId(existing.getUserId())
                .bookId(existing.getBookId())
                .bookName(existing.getBookName())
                .chapterNumber(existing.getChapterNumber())
                .verseNumber(existing.getVerseNumber())
                .verseText(existing.getVerseText())
                .tags(command.tags() != null ? command.tags() : existing.getTags())
                .note(command.note() != null ? command.note() : existing.getNote())
                .createdAt(existing.getCreatedAt())
                .build();

        return favoriteRepository.update(updated);
    }

    @Override
    @Transactional
    public void removeFavorite(UUID userId, UUID favoriteId) {
        log.info("Usuario {} eliminando favorito: {}", userId, favoriteId);

        if (favoriteRepository.findByIdAndUserId(favoriteId, userId).isEmpty()) {
            throw new ResourceNotFoundException("Favorito", favoriteId.toString());
        }

        favoriteRepository.deleteByIdAndUserId(favoriteId, userId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isFavorite(UUID userId, String bookId, int chapter, int verse) {
        return favoriteRepository.existsByUserIdAndVerse(userId, bookId, chapter, verse);
    }
}

