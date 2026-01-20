package com.bibliacatolica.api.infrastructure.adapter.in.rest.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.List;

/**
 * DTOs para lectura diaria
 */
public class DailyReadingDto {

    public record DailyReadingResponse(
            String id,
            String date,
            String title,
            String badge,
            String imageUrl,
            String bookId,
            String bookName,
            int chapterNumber,
            List<Integer> verseNumbers,
            String readingText,
            String biblicalReference,
            String officialReflection
    ) {}

    public record SaveReflectionRequest(
            @NotBlank(message = "La reflexión es requerida")
            String reflection
    ) {}

    public record ReadingHistoryResponse(
            String id,
            DailyReadingResponse reading,
            String userReflection,
            boolean hasReflection,
            String readAt
    ) {}

    public record WeekReadingsResponse(
            List<DailyReadingResponse> readings,
            String startDate,
            String endDate
    ) {}

    public record ReadingStatusResponse(
            boolean hasReadToday,
            DailyReadingResponse todayReading
    ) {}
}

