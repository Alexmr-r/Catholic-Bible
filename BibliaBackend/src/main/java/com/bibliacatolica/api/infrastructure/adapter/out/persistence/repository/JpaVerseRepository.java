package com.bibliacatolica.api.infrastructure.adapter.out.persistence.repository;

import com.bibliacatolica.api.infrastructure.adapter.out.persistence.entity.VerseEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JpaVerseRepository extends JpaRepository<VerseEntity, UUID> {

    List<VerseEntity> findBySectionId(UUID sectionId);

    @Query("SELECT v FROM VerseEntity v " +
           "JOIN v.section s " +
           "JOIN s.chapter c " +
           "WHERE c.book.id = :bookId " +
           "AND c.chapterNumber = :chapterNumber " +
           "AND v.verseNumber = :verseNumber")
    Optional<VerseEntity> findByBookAndChapterAndVerse(
            @Param("bookId") String bookId,
            @Param("chapterNumber") int chapterNumber,
            @Param("verseNumber") int verseNumber);

    @Query("SELECT v FROM VerseEntity v " +
           "JOIN v.section s " +
           "JOIN s.chapter c " +
           "WHERE c.book.id = :bookId " +
           "AND c.chapterNumber = :chapterNumber " +
           "AND v.verseNumber BETWEEN :startVerse AND :endVerse " +
           "ORDER BY v.verseNumber ASC")
    List<VerseEntity> findByBookAndChapterAndVerseRange(
            @Param("bookId") String bookId,
            @Param("chapterNumber") int chapterNumber,
            @Param("startVerse") int startVerse,
            @Param("endVerse") int endVerse);

    @Query("SELECT v FROM VerseEntity v " +
           "JOIN v.section s " +
           "WHERE s.chapter.id = :chapterId " +
           "ORDER BY s.orderIndex ASC, v.verseNumber ASC")
    List<VerseEntity> findByChapterId(@Param("chapterId") UUID chapterId);

    @Query(value = "SELECT v.* FROM verses v " +
           "JOIN sections s ON v.section_id = s.id " +
           "JOIN chapters c ON s.chapter_id = c.id " +
           "WHERE LOWER(v.text) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "ORDER BY c.book_id, c.chapter_number, v.verse_number " +
           "LIMIT :limit OFFSET :offset", nativeQuery = true)
    List<VerseEntity> searchByText(
            @Param("query") String query,
            @Param("limit") int limit,
            @Param("offset") int offset);

    @Query(value = "SELECT COUNT(*) FROM verses v " +
           "WHERE LOWER(v.text) LIKE LOWER(CONCAT('%', :query, '%'))", nativeQuery = true)
    long countByTextContaining(@Param("query") String query);
}

