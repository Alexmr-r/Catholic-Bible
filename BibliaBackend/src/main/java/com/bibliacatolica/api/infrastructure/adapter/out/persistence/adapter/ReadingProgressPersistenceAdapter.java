package com.bibliacatolica.api.infrastructure.adapter.out.persistence.adapter;

import com.bibliacatolica.api.domain.model.ReadingProgress;
import com.bibliacatolica.api.domain.port.out.ReadingProgressRepositoryPort;
import com.bibliacatolica.api.infrastructure.adapter.out.persistence.entity.ReadingProgressEntity;
import com.bibliacatolica.api.infrastructure.adapter.out.persistence.repository.ReadingProgressJpaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Adaptador de persistencia para Reading Progress
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ReadingProgressPersistenceAdapter implements ReadingProgressRepositoryPort {

    private final ReadingProgressJpaRepository jpaRepository;

    @Override
    @Transactional
    public ReadingProgress save(ReadingProgress progress) {
        ReadingProgressEntity entity = toEntity(progress);
        ReadingProgressEntity saved = jpaRepository.save(entity);
        return toDomain(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<ReadingProgress> findByUserIdAndDate(UUID userId, LocalDate date) {
        return jpaRepository.findByUserIdAndDate(userId, date)
                .map(this::toDomain);
    }

    @Override
    @Transactional
    public void deleteByUserIdAndDate(UUID userId, LocalDate date) {
        jpaRepository.deleteByUserIdAndDate(userId, date);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReadingProgress> findByUserIdAndYearMonth(UUID userId, int year, int month) {
        return jpaRepository.findByUserIdAndYearMonth(userId, year, month)
                .stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReadingProgress> findByUserIdOrderByDateDesc(UUID userId) {
        return jpaRepository.findByUserIdOrderByDateDesc(userId)
                .stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByUserIdAndDate(UUID userId, LocalDate date) {
        return jpaRepository.existsByUserIdAndDate(userId, date);
    }

    // ========== Mappers ==========

    private ReadingProgressEntity toEntity(ReadingProgress domain) {
        return ReadingProgressEntity.builder()
                .id(domain.getId())
                .userId(domain.getUserId())
                .date(domain.getDate())
                .dailyReadingId(domain.getDailyReadingId())
                .completedAt(domain.getCompletedAt())
                .createdAt(domain.getCreatedAt())
                .build();
    }

    private ReadingProgress toDomain(ReadingProgressEntity entity) {
        return ReadingProgress.builder()
                .id(entity.getId())
                .userId(entity.getUserId())
                .date(entity.getDate())
                .dailyReadingId(entity.getDailyReadingId())
                .completedAt(entity.getCompletedAt())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
