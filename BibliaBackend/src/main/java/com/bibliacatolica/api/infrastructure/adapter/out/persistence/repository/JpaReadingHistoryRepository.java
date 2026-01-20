package com.bibliacatolica.api.infrastructure.adapter.out.persistence.repository;

import com.bibliacatolica.api.infrastructure.adapter.out.persistence.entity.ReadingHistoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JpaReadingHistoryRepository extends JpaRepository<ReadingHistoryEntity, UUID> {

    Optional<ReadingHistoryEntity> findByUserIdAndDailyReadingId(UUID userId, UUID dailyReadingId);

    List<ReadingHistoryEntity> findByUserIdOrderByReadAtDesc(UUID userId);

    @Query("SELECT h FROM ReadingHistoryEntity h " +
           "WHERE h.userId = :userId " +
           "AND DATE(h.readAt) BETWEEN :startDate AND :endDate " +
           "ORDER BY h.readAt DESC")
    List<ReadingHistoryEntity> findByUserIdAndDateRange(
            @Param("userId") UUID userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    boolean existsByUserIdAndDailyReadingId(UUID userId, UUID dailyReadingId);
}

