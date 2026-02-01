package com.bibliacatolica.api.infrastructure.adapter.out.persistence.repository;

import com.bibliacatolica.api.infrastructure.adapter.out.persistence.entity.ReadingProgressEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repositorio JPA para Reading Progress
 */
@Repository
public interface ReadingProgressJpaRepository extends JpaRepository<ReadingProgressEntity, UUID> {

    /**
     * Buscar por usuario y fecha
     */
    Optional<ReadingProgressEntity> findByUserIdAndDate(UUID userId, LocalDate date);

    /**
     * Eliminar por usuario y fecha
     */
    void deleteByUserIdAndDate(UUID userId, LocalDate date);

    /**
     * Verificar si existe
     */
    boolean existsByUserIdAndDate(UUID userId, LocalDate date);

    /**
     * Obtener registros de un mes específico
     */
    @Query("SELECT rp FROM ReadingProgressEntity rp " +
           "WHERE rp.userId = :userId " +
           "AND EXTRACT(YEAR FROM rp.date) = :year " +
           "AND EXTRACT(MONTH FROM rp.date) = :month " +
           "ORDER BY rp.date ASC")
    List<ReadingProgressEntity> findByUserIdAndYearMonth(
            @Param("userId") UUID userId,
            @Param("year") int year,
            @Param("month") int month);

    /**
     * Obtener todos los registros de un usuario ordenados por fecha descendente
     */
    List<ReadingProgressEntity> findByUserIdOrderByDateDesc(UUID userId);
}
