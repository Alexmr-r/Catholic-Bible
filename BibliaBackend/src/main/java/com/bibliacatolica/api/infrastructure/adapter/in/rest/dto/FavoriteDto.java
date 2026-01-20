package com.bibliacatolica.api.infrastructure.adapter.in.rest.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

/**
 * DTOs para favoritos
 */
public class FavoriteDto {

    public record AddFavoriteRequest(
            @NotBlank(message = "El ID del libro es requerido")
            String bookId,

            @NotNull(message = "El número de capítulo es requerido")
            @Min(value = 1, message = "El capítulo debe ser mayor a 0")
            Integer chapterNumber,

            @NotNull(message = "El número de versículo es requerido")
            @Min(value = 1, message = "El versículo debe ser mayor a 0")
            Integer verseNumber,

            List<String> tags,
            String note
    ) {}

    public record UpdateFavoriteRequest(
            List<String> tags,
            String note
    ) {}

    public record FavoriteResponse(
            String id,
            String bookId,
            String bookName,
            int chapterNumber,
            int verseNumber,
            String verseText,
            String reference,
            List<String> tags,
            String note,
            String createdAt
    ) {}

    public record FavoriteListResponse(
            List<FavoriteResponse> favorites,
            int total
    ) {}
}

