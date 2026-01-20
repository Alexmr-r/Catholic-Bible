package com.bibliacatolica.api.infrastructure.adapter.out.persistence.repository;

import com.bibliacatolica.api.domain.model.HighlightColor;
import com.bibliacatolica.api.infrastructure.adapter.out.persistence.entity.HighlightEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JpaHighlightRepository extends JpaRepository<HighlightEntity, UUID> {

    List<HighlightEntity> findByUserId(UUID userId);

    Optional<HighlightEntity> findByIdAndUserId(UUID id, UUID userId);

    List<HighlightEntity> findByUserIdAndBookIdAndChapterNumber(UUID userId, String bookId, int chapterNumber);

    List<HighlightEntity> findByUserIdAndColor(UUID userId, HighlightColor color);

    Optional<HighlightEntity> findByUserIdAndBookIdAndChapterNumberAndVerseNumber(
            UUID userId, String bookId, int chapterNumber, int verseNumber);

    boolean existsByUserIdAndBookIdAndChapterNumberAndVerseNumber(
            UUID userId, String bookId, int chapterNumber, int verseNumber);

    @Modifying
    @Query("DELETE FROM HighlightEntity h WHERE h.id = :id AND h.userId = :userId")
    void deleteByIdAndUserId(@Param("id") UUID id, @Param("userId") UUID userId);

    @Modifying
    @Query("DELETE FROM HighlightEntity h WHERE h.userId = :userId " +
           "AND h.bookId = :bookId AND h.chapterNumber = :chapter AND h.verseNumber = :verse")
    void deleteByUserIdAndVerse(
            @Param("userId") UUID userId,
            @Param("bookId") String bookId,
            @Param("chapter") int chapter,
            @Param("verse") int verse);
}

