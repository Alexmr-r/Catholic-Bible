package com.bibliacatolica.api.infrastructure.adapter.out.persistence;

import com.bibliacatolica.api.domain.model.DailyReading;
import com.bibliacatolica.api.domain.model.ReadingHistory;
import com.bibliacatolica.api.domain.port.out.DailyReadingRepositoryPort;
import com.bibliacatolica.api.infrastructure.adapter.out.persistence.entity.DailyReadingEntity;
import com.bibliacatolica.api.infrastructure.adapter.out.persistence.entity.ReadingHistoryEntity;
import com.bibliacatolica.api.infrastructure.adapter.out.persistence.repository.JpaDailyReadingRepository;
import com.bibliacatolica.api.infrastructure.adapter.out.persistence.repository.JpaReadingHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Adaptador de persistencia para lecturas diarias
 */
@Component
@RequiredArgsConstructor
public class DailyReadingPersistenceAdapter implements DailyReadingRepositoryPort {

    private final JpaDailyReadingRepository dailyReadingRepository;
    private final JpaReadingHistoryRepository readingHistoryRepository;

    @Override
    public Optional<DailyReading> findByDate(LocalDate date) {
        return dailyReadingRepository.findByDate(date).map(this::toDailyReadingDomain);
    }

    @Override
    public List<DailyReading> findByDateBetween(LocalDate startDate, LocalDate endDate) {
        return dailyReadingRepository.findByDateBetweenOrderByDateDesc(startDate, endDate).stream()
                .map(this::toDailyReadingDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<DailyReading> findAll() {
        return dailyReadingRepository.findAll().stream()
                .map(this::toDailyReadingDomain)
                .collect(Collectors.toList());
    }

    @Override
    public DailyReading save(DailyReading dailyReading) {
        DailyReadingEntity entity = toDailyReadingEntity(dailyReading);
        DailyReadingEntity saved = dailyReadingRepository.save(entity);
        return toDailyReadingDomain(saved);
    }

    @Override
    public void delete(UUID id) {
        dailyReadingRepository.deleteById(id);
    }

    @Override
    public ReadingHistory saveHistory(ReadingHistory history) {
        ReadingHistoryEntity entity = toHistoryEntity(history);
        ReadingHistoryEntity saved = readingHistoryRepository.save(entity);
        return toHistoryDomain(saved);
    }

    @Override
    public Optional<ReadingHistory> findHistoryByUserAndReading(UUID userId, UUID dailyReadingId) {
        return readingHistoryRepository.findByUserIdAndDailyReadingId(userId, dailyReadingId)
                .map(this::toHistoryDomain);
    }

    @Override
    public List<ReadingHistory> findHistoryByUserId(UUID userId) {
        return readingHistoryRepository.findByUserIdOrderByReadAtDesc(userId).stream()
                .map(this::toHistoryDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<ReadingHistory> findHistoryByUserIdAndDateRange(UUID userId, LocalDate startDate, LocalDate endDate) {
        return readingHistoryRepository.findByUserIdAndDateRange(userId, startDate, endDate).stream()
                .map(this::toHistoryDomain)
                .collect(Collectors.toList());
    }

    @Override
    public ReadingHistory updateHistory(ReadingHistory history) {
        return saveHistory(history);
    }

    @Override
    public boolean hasUserReadToday(UUID userId, UUID dailyReadingId) {
        return readingHistoryRepository.existsByUserIdAndDailyReadingId(userId, dailyReadingId);
    }

    // ========== Mappers ==========

    private DailyReadingEntity toDailyReadingEntity(DailyReading domain) {
        return DailyReadingEntity.builder()
                .id(domain.getId())
                .date(domain.getDate())
                .title(domain.getTitle())
                .badge(domain.getBadge())
                .imageUrl(domain.getImageUrl())
                .bookId(domain.getBookId())
                .bookName(domain.getBookName())
                .chapterNumber(domain.getChapterNumber())
                .verseNumbers(domain.getVerseNumbers() != null
                        ? domain.getVerseNumbers().toArray(new Integer[0])
                        : null)
                .readingText(domain.getReadingText())
                .officialReflection(domain.getOfficialReflection())
                .build();
    }

    private DailyReading toDailyReadingDomain(DailyReadingEntity entity) {
        return DailyReading.builder()
                .id(entity.getId())
                .date(entity.getDate())
                .title(entity.getTitle())
                .badge(entity.getBadge())
                .imageUrl(entity.getImageUrl())
                .bookId(entity.getBookId())
                .bookName(entity.getBookName())
                .chapterNumber(entity.getChapterNumber())
                .verseNumbers(entity.getVerseNumbers() != null
                        ? Arrays.asList(entity.getVerseNumbers())
                        : List.of())
                .readingText(entity.getReadingText())
                .officialReflection(entity.getOfficialReflection())
                .build();
    }

    private ReadingHistoryEntity toHistoryEntity(ReadingHistory domain) {
        return ReadingHistoryEntity.builder()
                .id(domain.getId())
                .userId(domain.getUserId())
                .dailyReadingId(domain.getDailyReadingId())
                .userReflection(domain.getUserReflection())
                .readAt(domain.getReadAt())
                .build();
    }

    private ReadingHistory toHistoryDomain(ReadingHistoryEntity entity) {
        return ReadingHistory.builder()
                .id(entity.getId())
                .userId(entity.getUserId())
                .dailyReadingId(entity.getDailyReadingId())
                .userReflection(entity.getUserReflection())
                .readAt(entity.getReadAt())
                .build();
    }
}

