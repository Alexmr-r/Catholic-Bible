package com.bibliacatolica.api.infrastructure.adapter.out.persistence.repository;

import com.bibliacatolica.api.infrastructure.adapter.out.persistence.entity.FavoriteEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JpaFavoriteRepository extends JpaRepository<FavoriteEntity, UUID> {

    List<FavoriteEntity> findByUserIdOrderByCreatedAtDesc(UUID userId);

    Optional<FavoriteEntity> findByIdAndUserId(UUID id, UUID userId);

    Optional<FavoriteEntity> findByUserIdAndBookIdAndChapterNumberAndVerseNumber(
            UUID userId, String bookId, int chapterNumber, int verseNumber);

    boolean existsByUserIdAndBookIdAndChapterNumberAndVerseNumber(
            UUID userId, String bookId, int chapterNumber, int verseNumber);

    List<FavoriteEntity> findByUserIdAndBookId(UUID userId, String bookId);

    @Query("SELECT f FROM FavoriteEntity f WHERE f.userId = :userId " +
           "AND (LOWER(f.verseText) LIKE LOWER(CONCAT('%', :searchText, '%')) " +
           "OR LOWER(f.note) LIKE LOWER(CONCAT('%', :searchText, '%')))")
    List<FavoriteEntity> searchByUserIdAndText(
            @Param("userId") UUID userId,
            @Param("searchText") String searchText);

    @Modifying
    @Query("DELETE FROM FavoriteEntity f WHERE f.id = :id AND f.userId = :userId")
    void deleteByIdAndUserId(@Param("id") UUID id, @Param("userId") UUID userId);

    long countByUserId(UUID userId);
}

