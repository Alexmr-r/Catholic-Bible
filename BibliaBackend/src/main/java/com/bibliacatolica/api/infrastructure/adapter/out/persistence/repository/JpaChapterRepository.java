package com.bibliacatolica.api.infrastructure.adapter.out.persistence.repository;

import com.bibliacatolica.api.infrastructure.adapter.out.persistence.entity.ChapterEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JpaChapterRepository extends JpaRepository<ChapterEntity, UUID> {

    @Query("SELECT c FROM ChapterEntity c WHERE c.book.id = :bookId AND c.chapterNumber = :chapterNumber")
    Optional<ChapterEntity> findByBookIdAndChapterNumber(
            @Param("bookId") String bookId,
            @Param("chapterNumber") int chapterNumber);

    @Query("SELECT c FROM ChapterEntity c WHERE c.book.id = :bookId AND c.chapterNumber = :chapterNumber AND c.version = :version")
    Optional<ChapterEntity> findByBookIdAndChapterNumberAndVersion(
            @Param("bookId") String bookId,
            @Param("chapterNumber") int chapterNumber,
            @Param("version") String version);

    @Query("SELECT c FROM ChapterEntity c WHERE c.book.id = :bookId ORDER BY c.chapterNumber ASC")
    List<ChapterEntity> findByBookIdOrderByChapterNumberAsc(@Param("bookId") String bookId);
}

