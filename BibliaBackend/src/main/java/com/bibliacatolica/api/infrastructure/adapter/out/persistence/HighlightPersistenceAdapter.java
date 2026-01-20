package com.bibliacatolica.api.infrastructure.adapter.out.persistence;

import com.bibliacatolica.api.domain.model.Highlight;
import com.bibliacatolica.api.domain.model.HighlightColor;
import com.bibliacatolica.api.domain.port.out.HighlightRepositoryPort;
import com.bibliacatolica.api.infrastructure.adapter.out.persistence.entity.HighlightEntity;
import com.bibliacatolica.api.infrastructure.adapter.out.persistence.repository.JpaHighlightRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Adaptador de persistencia para resaltados
 */
@Component
@RequiredArgsConstructor
public class HighlightPersistenceAdapter implements HighlightRepositoryPort {

    private final JpaHighlightRepository jpaHighlightRepository;

    @Override
    public Highlight save(Highlight highlight) {
        HighlightEntity entity = toEntity(highlight);
        HighlightEntity saved = jpaHighlightRepository.save(entity);
        return toDomain(saved);
    }

    @Override
    public Optional<Highlight> findById(UUID id) {
        return jpaHighlightRepository.findById(id).map(this::toDomain);
    }

    @Override
    public Optional<Highlight> findByIdAndUserId(UUID id, UUID userId) {
        return jpaHighlightRepository.findByIdAndUserId(id, userId).map(this::toDomain);
    }

    @Override
    public List<Highlight> findByUserId(UUID userId) {
        return jpaHighlightRepository.findByUserId(userId).stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Highlight> findByUserIdAndChapter(UUID userId, String bookId, int chapterNumber) {
        return jpaHighlightRepository.findByUserIdAndBookIdAndChapterNumber(userId, bookId, chapterNumber).stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Highlight> findByUserIdAndColor(UUID userId, HighlightColor color) {
        return jpaHighlightRepository.findByUserIdAndColor(userId, color).stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<Highlight> findByUserIdAndVerse(UUID userId, String bookId, int chapter, int verse) {
        return jpaHighlightRepository.findByUserIdAndBookIdAndChapterNumberAndVerseNumber(
                userId, bookId, chapter, verse).map(this::toDomain);
    }

    @Override
    public boolean existsByUserIdAndVerse(UUID userId, String bookId, int chapter, int verse) {
        return jpaHighlightRepository.existsByUserIdAndBookIdAndChapterNumberAndVerseNumber(
                userId, bookId, chapter, verse);
    }

    @Override
    public Highlight update(Highlight highlight) {
        return save(highlight);
    }

    @Override
    public void deleteById(UUID id) {
        jpaHighlightRepository.deleteById(id);
    }

    @Override
    @Transactional
    public void deleteByIdAndUserId(UUID id, UUID userId) {
        jpaHighlightRepository.deleteByIdAndUserId(id, userId);
    }

    @Override
    @Transactional
    public void deleteByUserIdAndVerse(UUID userId, String bookId, int chapter, int verse) {
        jpaHighlightRepository.deleteByUserIdAndVerse(userId, bookId, chapter, verse);
    }

    // ========== Mappers ==========

    private HighlightEntity toEntity(Highlight highlight) {
        return HighlightEntity.builder()
                .id(highlight.getId())
                .userId(highlight.getUserId())
                .bookId(highlight.getBookId())
                .chapterNumber(highlight.getChapterNumber())
                .verseNumber(highlight.getVerseNumber())
                .color(highlight.getColor())
                .createdAt(highlight.getCreatedAt())
                .build();
    }

    private Highlight toDomain(HighlightEntity entity) {
        return Highlight.builder()
                .id(entity.getId())
                .userId(entity.getUserId())
                .bookId(entity.getBookId())
                .chapterNumber(entity.getChapterNumber())
                .verseNumber(entity.getVerseNumber())
                .color(entity.getColor())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
