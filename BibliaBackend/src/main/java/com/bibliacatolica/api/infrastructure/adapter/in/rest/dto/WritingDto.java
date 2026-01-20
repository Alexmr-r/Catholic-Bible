package com.bibliacatolica.api.infrastructure.adapter.in.rest.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

/**
 * DTOs para escritos/reflexiones
 */
public class WritingDto {

    public record CreateWritingRequest(
            @NotBlank(message = "El título es requerido")
            @Size(max = 255, message = "El título no puede exceder 255 caracteres")
            String title,

            @NotBlank(message = "El contenido es requerido")
            String content,

            String bookId,
            Integer chapter,
            Integer verse,
            List<String> tags
    ) {}

    public record UpdateWritingRequest(
            @Size(max = 255, message = "El título no puede exceder 255 caracteres")
            String title,
            String content,
            List<String> tags
    ) {}

    public record WritingResponse(
            String id,
            String title,
            String content,
            String preview,
            VerseReferenceDto verseReference,
            List<String> tags,
            boolean isFavorite,
            String createdAt,
            String updatedAt
    ) {}

    public record VerseReferenceDto(
            String bookId,
            String bookName,
            int chapter,
            int verse,
            String reference
    ) {}

    public record WritingListResponse(
            List<WritingResponse> writings,
            int total
    ) {}
}

