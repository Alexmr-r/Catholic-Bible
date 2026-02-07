package com.bibliacatolica.api.domain.port.out;

import com.bibliacatolica.api.domain.model.DailyReading;
import com.bibliacatolica.api.domain.model.ReadingHistory;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Puerto de salida para persistencia de lecturas diarias
 */
public interface DailyReadingRepositoryPort {

    Optional<DailyReading> findByDate(LocalDate date);

    List<DailyReading> findByDateBetween(LocalDate startDate, LocalDate endDate);

    List<DailyReading> findAll();

    DailyReading save(DailyReading dailyReading);

    ReadingHistory saveHistory(ReadingHistory history);

    Optional<ReadingHistory> findHistoryByUserAndReading(UUID userId, UUID dailyReadingId);

    List<ReadingHistory> findHistoryByUserId(UUID userId);

    List<ReadingHistory> findHistoryByUserIdAndDateRange(UUID userId, LocalDate startDate, LocalDate endDate);

    ReadingHistory updateHistory(ReadingHistory history);

    boolean hasUserReadToday(UUID userId, UUID dailyReadingId);
}

