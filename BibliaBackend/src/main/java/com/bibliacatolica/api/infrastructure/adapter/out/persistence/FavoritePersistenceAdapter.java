package com.bibliacatolica.api.infrastructure.adapter.out.persistence;

import com.bibliacatolica.api.domain.model.Favorite;
import com.bibliacatolica.api.domain.port.out.FavoriteRepositoryPort;
import com.bibliacatolica.api.infrastructure.adapter.out.persistence.entity.FavoriteEntity;
import com.bibliacatolica.api.infrastructure.adapter.out.persistence.repository.JpaFavoriteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Adaptador de persistencia para favoritos
 */
@Component
@RequiredArgsConstructor
public class FavoritePersistenceAdapter implements FavoriteRepositoryPort {

    private final JpaFavoriteRepository jpaFavoriteRepository;

    @Override
    public Favorite save(Favorite favorite) {
        FavoriteEntity entity = toEntity(favorite);
        FavoriteEntity saved = jpaFavoriteRepository.save(entity);
        return toDomain(saved);
    }

    @Override
    public Optional<Favorite> findById(UUID id) {
        return jpaFavoriteRepository.findById(id).map(this::toDomain);
    }

    @Override
    public Optional<Favorite> findByIdAndUserId(UUID id, UUID userId) {
        return jpaFavoriteRepository.findByIdAndUserId(id, userId).map(this::toDomain);
    }

    @Override
    public List<Favorite> findByUserId(UUID userId) {
        return jpaFavoriteRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Favorite> findByUserIdAndTestament(UUID userId, String testament) {
        // Simplificado - en producción hacer JOIN con books
        return findByUserId(userId);
    }

    @Override
    public List<Favorite> findByUserIdAndBookId(UUID userId, String bookId) {
        return jpaFavoriteRepository.findByUserIdAndBookId(userId, bookId).stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Favorite> findByUserIdAndTags(UUID userId, List<String> tags) {
        // Simplificado - filtrar en memoria
        return findByUserId(userId).stream()
                .filter(f -> f.getTags() != null && f.getTags().stream().anyMatch(tags::contains))
                .collect(Collectors.toList());
    }

    @Override
    public List<Favorite> searchByUserIdAndText(UUID userId, String searchText) {
        return jpaFavoriteRepository.searchByUserIdAndText(userId, searchText).stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public boolean existsByUserIdAndVerse(UUID userId, String bookId, int chapter, int verse) {
        return jpaFavoriteRepository.existsByUserIdAndBookIdAndChapterNumberAndVerseNumber(
                userId, bookId, chapter, verse);
    }

    @Override
    public Optional<Favorite> findByUserIdAndVerse(UUID userId, String bookId, int chapter, int verse) {
        return jpaFavoriteRepository.findByUserIdAndBookIdAndChapterNumberAndVerseNumber(
                userId, bookId, chapter, verse).map(this::toDomain);
    }

    @Override
    public Favorite update(Favorite favorite) {
        return save(favorite);
    }

    @Override
    public void deleteById(UUID id) {
        jpaFavoriteRepository.deleteById(id);
    }

    @Override
    @Transactional
    public void deleteByIdAndUserId(UUID id, UUID userId) {
        jpaFavoriteRepository.deleteByIdAndUserId(id, userId);
    }

    @Override
    public long countByUserId(UUID userId) {
        return jpaFavoriteRepository.countByUserId(userId);
    }

    // ========== Mappers ==========

    private FavoriteEntity toEntity(Favorite favorite) {
        return FavoriteEntity.builder()
                .id(favorite.getId())
                .userId(favorite.getUserId())
                .bookId(favorite.getBookId())
                .bookName(favorite.getBookName())
                .chapterNumber(favorite.getChapterNumber())
                .verseNumber(favorite.getVerseNumber())
                .verseText(favorite.getVerseText())
                .tags(favorite.getTags() != null ? favorite.getTags().toArray(new String[0]) : null)
                .note(favorite.getNote())
                .createdAt(favorite.getCreatedAt())
                .build();
    }

    private Favorite toDomain(FavoriteEntity entity) {
        return Favorite.builder()
                .id(entity.getId())
                .userId(entity.getUserId())
                .bookId(entity.getBookId())
                .bookName(entity.getBookName())
                .chapterNumber(entity.getChapterNumber())
                .verseNumber(entity.getVerseNumber())
                .verseText(entity.getVerseText())
                .tags(entity.getTags() != null ? Arrays.asList(entity.getTags()) : List.of())
                .note(entity.getNote())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
