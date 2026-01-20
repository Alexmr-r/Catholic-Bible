package com.bibliacatolica.api.infrastructure.adapter.out.persistence.repository;

import com.bibliacatolica.api.infrastructure.adapter.out.persistence.entity.DailyReadingEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JpaDailyReadingRepository extends JpaRepository<DailyReadingEntity, UUID> {

    Optional<DailyReadingEntity> findByDate(LocalDate date);

    List<DailyReadingEntity> findByDateBetweenOrderByDateDesc(LocalDate startDate, LocalDate endDate);
}

