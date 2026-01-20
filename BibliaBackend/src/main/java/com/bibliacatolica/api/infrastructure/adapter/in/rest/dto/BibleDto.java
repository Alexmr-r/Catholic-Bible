package com.bibliacatolica.api.infrastructure.adapter.in.rest.dto;

import java.util.List;

/**
 * DTOs para contenido bíblico
 */
public class BibleDto {

    public record BooksResponse(
            List<BookDto> oldTestament,
            List<BookDto> newTestament
    ) {}

    public record BookDto(
            String id,
            String name,
            String abbreviation,
            String testament,
            String category,
            int totalChapters,
            String description
    ) {}

    public record BookDetailDto(
            String id,
            String name,
            String abbreviation,
            String testament,
            String category,
            int totalChapters,
            String description,
            String author,
            String historicalContext
    ) {}

    public record ChapterResponse(
            String book,
            String bookName,
            int chapter,
            String version,
            List<SectionDto> sections,
            ChapterReferenceDto previousChapter,
            ChapterReferenceDto nextChapter
    ) {}

    public record SectionDto(
            String title,
            List<VerseDto> verses
    ) {}

    public record VerseDto(
            int number,
            String text,
            boolean hasNote
    ) {}

    public record ChapterReferenceDto(
            String bookId,
            String bookName,
            int chapter
    ) {}

    public record SearchRequest(
            String query,
            String testament,
            List<String> bookIds,
            Integer page,
            Integer pageSize
    ) {}

    public record SearchResponse(
            List<SearchResultDto> results,
            long total,
            int page,
            int pageSize,
            boolean hasMore
    ) {}

    public record SearchResultDto(
            String bookId,
            String bookName,
            int chapter,
            int verse,
            String text,
            String highlightedText
    ) {}
}

