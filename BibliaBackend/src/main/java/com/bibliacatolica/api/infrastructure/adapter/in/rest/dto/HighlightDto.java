package com.bibliacatolica.api.infrastructure.adapter.in.rest.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

/**
 * DTOs para resaltados
 */
public class HighlightDto {

    public record HighlightRequest(
            @NotBlank(message = "El ID del libro es requerido")
            String bookId,

            @NotNull(message = "El número de capítulo es requerido")
            @Min(value = 1, message = "El capítulo debe ser mayor a 0")
            Integer chapterNumber,

            @NotNull(message = "El número de versículo es requerido")
            @Min(value = 1, message = "El versículo debe ser mayor a 0")
            Integer verseNumber,

            @NotBlank(message = "El color es requerido")
            String color
    ) {}

    public record HighlightResponse(
            String id,
            String bookId,
            int chapterNumber,
            int verseNumber,
            String color,
            String createdAt
    ) {}

    public record ChapterHighlightsResponse(
            String bookId,
            int chapterNumber,
            List<HighlightResponse> highlights
    ) {}
}

