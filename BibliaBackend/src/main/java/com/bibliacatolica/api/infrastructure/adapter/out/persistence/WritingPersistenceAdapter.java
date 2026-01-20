package com.bibliacatolica.api.infrastructure.adapter.out.persistence;

import com.bibliacatolica.api.domain.model.Writing;
import com.bibliacatolica.api.domain.port.out.WritingRepositoryPort;
import com.bibliacatolica.api.infrastructure.adapter.out.persistence.entity.WritingEntity;
import com.bibliacatolica.api.infrastructure.adapter.out.persistence.repository.JpaWritingRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Adaptador de persistencia para escritos/reflexiones
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class WritingPersistenceAdapter implements WritingRepositoryPort {

    private final JpaWritingRepository jpaWritingRepository;
    private final ObjectMapper objectMapper;

    @Override
    public Writing save(Writing writing) {
        WritingEntity entity = toEntity(writing);
        WritingEntity saved = jpaWritingRepository.save(entity);
        return toDomain(saved);
    }

    @Override
    public Optional<Writing> findById(UUID id) {
        return jpaWritingRepository.findById(id).map(this::toDomain);
    }

    @Override
    public Optional<Writing> findByIdAndUserId(UUID id, UUID userId) {
        return jpaWritingRepository.findByIdAndUserId(id, userId).map(this::toDomain);
    }

    @Override
    public List<Writing> findByUserId(UUID userId) {
        return jpaWritingRepository.findByUserIdOrderByUpdatedAtDesc(userId).stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Writing> findFavoritesByUserId(UUID userId) {
        return jpaWritingRepository.findByUserIdAndIsFavoriteTrueOrderByUpdatedAtDesc(userId).stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Writing> findByUserIdAndTags(UUID userId, List<String> tags) {
        // Simplificado - filtrar en memoria
        return findByUserId(userId).stream()
                .filter(w -> w.getTags() != null && w.getTags().stream().anyMatch(tags::contains))
                .collect(Collectors.toList());
    }

    @Override
    public List<Writing> searchByUserIdAndText(UUID userId, String searchText) {
        return jpaWritingRepository.searchByUserIdAndText(userId, searchText).stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Writing> findByUserIdAndVerse(UUID userId, String bookId, int chapter, int verse) {
        return jpaWritingRepository.findByUserIdAndVerseReferenceLike(userId, bookId).stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Writing update(Writing writing) {
        return save(writing);
    }

    @Override
    public void deleteById(UUID id) {
        jpaWritingRepository.deleteById(id);
    }

    @Override
    @Transactional
    public void deleteByIdAndUserId(UUID id, UUID userId) {
        jpaWritingRepository.deleteByIdAndUserId(id, userId);
    }

    @Override
    public long countByUserId(UUID userId) {
        return jpaWritingRepository.countByUserId(userId);
    }

    // ========== Mappers ==========

    private WritingEntity toEntity(Writing writing) {
        String verseRefJson = null;
        if (writing.getVerseReference() != null) {
            try {
                verseRefJson = objectMapper.writeValueAsString(writing.getVerseReference());
            } catch (JsonProcessingException e) {
                log.error("Error serializing verse reference", e);
            }
        }

        return WritingEntity.builder()
                .id(writing.getId())
                .userId(writing.getUserId())
                .title(writing.getTitle())
                .content(writing.getContent())
                .verseReference(verseRefJson)
                .tags(writing.getTags() != null ? writing.getTags().toArray(new String[0]) : null)
                .isFavorite(writing.isFavorite())
                .createdAt(writing.getCreatedAt())
                .updatedAt(writing.getUpdatedAt())
                .build();
    }

    private Writing toDomain(WritingEntity entity) {
        Writing.VerseReference verseRef = null;
        if (entity.getVerseReference() != null) {
            try {
                verseRef = objectMapper.readValue(entity.getVerseReference(), Writing.VerseReference.class);
            } catch (JsonProcessingException e) {
                log.error("Error deserializing verse reference", e);
            }
        }

        return Writing.builder()
                .id(entity.getId())
                .userId(entity.getUserId())
                .title(entity.getTitle())
                .content(entity.getContent())
                .verseReference(verseRef)
                .tags(entity.getTags() != null ? Arrays.asList(entity.getTags()) : List.of())
                .isFavorite(entity.isFavorite())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
