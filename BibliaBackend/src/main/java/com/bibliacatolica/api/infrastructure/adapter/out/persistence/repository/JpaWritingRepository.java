package com.bibliacatolica.api.infrastructure.adapter.out.persistence.repository;

import com.bibliacatolica.api.infrastructure.adapter.out.persistence.entity.WritingEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JpaWritingRepository extends JpaRepository<WritingEntity, UUID> {

    List<WritingEntity> findByUserIdOrderByUpdatedAtDesc(UUID userId);

    Optional<WritingEntity> findByIdAndUserId(UUID id, UUID userId);

    List<WritingEntity> findByUserIdAndIsFavoriteTrueOrderByUpdatedAtDesc(UUID userId);

    @Query("SELECT w FROM WritingEntity w WHERE w.userId = :userId " +
           "AND (LOWER(w.title) LIKE LOWER(CONCAT('%', :searchText, '%')) " +
           "OR LOWER(w.content) LIKE LOWER(CONCAT('%', :searchText, '%')))")
    List<WritingEntity> searchByUserIdAndText(
            @Param("userId") UUID userId,
            @Param("searchText") String searchText);

    @Query("SELECT w FROM WritingEntity w WHERE w.userId = :userId " +
           "AND w.verseReference LIKE CONCAT(:bookId, '%')")
    List<WritingEntity> findByUserIdAndVerseReferenceLike(
            @Param("userId") UUID userId,
            @Param("bookId") String bookId);

    @Modifying
    @Query("DELETE FROM WritingEntity w WHERE w.id = :id AND w.userId = :userId")
    void deleteByIdAndUserId(@Param("id") UUID id, @Param("userId") UUID userId);

    long countByUserId(UUID userId);
}

