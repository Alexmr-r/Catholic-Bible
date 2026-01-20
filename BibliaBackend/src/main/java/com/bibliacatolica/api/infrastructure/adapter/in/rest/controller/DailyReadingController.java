package com.bibliacatolica.api.infrastructure.adapter.in.rest.controller;

import com.bibliacatolica.api.domain.model.DailyReading;
import com.bibliacatolica.api.domain.model.ReadingHistory;
import com.bibliacatolica.api.domain.port.in.DailyReadingUseCase;
import com.bibliacatolica.api.domain.port.out.UserRepositoryPort;
import com.bibliacatolica.api.infrastructure.adapter.in.rest.dto.DailyReadingDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

/**
 * Controlador REST para lectura diaria litúrgica
 */
@Slf4j
@RestController
@RequestMapping("/daily-reading")
@RequiredArgsConstructor
@Tag(name = "Lectura Diaria", description = "Endpoints para la lectura litúrgica del día")
public class DailyReadingController {

    private final DailyReadingUseCase dailyReadingUseCase;
    private final UserRepositoryPort userRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE;
    private static final DateTimeFormatter DATETIME_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    @GetMapping("/today")
    @Operation(summary = "Lectura de hoy", description = "Obtiene la lectura litúrgica del día actual")
    public ResponseEntity<DailyReadingDto.DailyReadingResponse> getTodayReading() {
        log.debug("Obteniendo lectura del día");

        DailyReading reading = dailyReadingUseCase.getTodayReading();
        return ResponseEntity.ok(toDailyReadingResponse(reading));
    }

    @GetMapping("/{date}")
    @Operation(summary = "Lectura por fecha", description = "Obtiene la lectura de una fecha específica")
    public ResponseEntity<DailyReadingDto.DailyReadingResponse> getReadingByDate(
            @PathVariable String date) {
        log.debug("Obteniendo lectura para fecha: {}", date);

        LocalDate localDate = LocalDate.parse(date);
        DailyReading reading = dailyReadingUseCase.getReadingByDate(localDate);
        return ResponseEntity.ok(toDailyReadingResponse(reading));
    }

    @GetMapping("/week")
    @Operation(summary = "Lecturas de la semana", description = "Obtiene las lecturas de una semana")
    public ResponseEntity<DailyReadingDto.WeekReadingsResponse> getWeekReadings(
            @RequestParam(required = false) String startDate) {
        log.debug("Obteniendo lecturas de la semana desde: {}", startDate);

        LocalDate start = startDate != null ? LocalDate.parse(startDate) : LocalDate.now();
        List<DailyReading> readings = dailyReadingUseCase.getReadingsForWeek(start);

        return ResponseEntity.ok(new DailyReadingDto.WeekReadingsResponse(
                readings.stream().map(this::toDailyReadingResponse).toList(),
                start.format(DATE_FORMATTER),
                start.plusDays(6).format(DATE_FORMATTER)
        ));
    }

    @PostMapping("/{readingId}/mark-read")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Marcar como leída", description = "Marca la lectura como leída por el usuario")
    public ResponseEntity<DailyReadingDto.ReadingHistoryResponse> markAsRead(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID readingId) {

        UUID userId = getUserId(userDetails);
        log.info("Usuario {} marcando lectura {} como leída", userId, readingId);

        ReadingHistory history = dailyReadingUseCase.markAsRead(userId, readingId);
        return ResponseEntity.ok(toReadingHistoryResponse(history, null));
    }

    @PostMapping("/{readingId}/reflection")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Guardar reflexión", description = "Guarda la reflexión personal del usuario para una lectura")
    public ResponseEntity<DailyReadingDto.ReadingHistoryResponse> saveReflection(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID readingId,
            @Valid @RequestBody DailyReadingDto.SaveReflectionRequest request) {

        UUID userId = getUserId(userDetails);
        log.info("Usuario {} guardando reflexión para lectura {}", userId, readingId);

        ReadingHistory history = dailyReadingUseCase.saveReflection(userId, readingId, request.reflection());
        return ResponseEntity.ok(toReadingHistoryResponse(history, null));
    }

    @GetMapping("/history")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Historial de lecturas", description = "Obtiene el historial de lecturas del usuario")
    public ResponseEntity<List<DailyReadingDto.ReadingHistoryResponse>> getReadingHistory(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {

        UUID userId = getUserId(userDetails);
        log.debug("Obteniendo historial de lecturas para usuario: {}", userId);

        List<DailyReadingUseCase.ReadingHistoryDetail> history;
        if (year != null && month != null) {
            history = dailyReadingUseCase.getUserReadingHistoryByMonth(userId, year, month);
        } else {
            history = dailyReadingUseCase.getUserReadingHistory(userId);
        }

        return ResponseEntity.ok(history.stream()
                .map(h -> toReadingHistoryResponse(h.history(), h.reading()))
                .toList());
    }

    @GetMapping("/status")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Estado de lectura", description = "Verifica si el usuario ha leído hoy")
    public ResponseEntity<DailyReadingDto.ReadingStatusResponse> getReadingStatus(
            @AuthenticationPrincipal UserDetails userDetails) {

        UUID userId = getUserId(userDetails);

        boolean hasRead = dailyReadingUseCase.hasReadToday(userId);
        DailyReading todayReading = dailyReadingUseCase.getTodayReading();

        return ResponseEntity.ok(new DailyReadingDto.ReadingStatusResponse(
                hasRead,
                toDailyReadingResponse(todayReading)
        ));
    }

    // ========== Métodos privados ==========

    private UUID getUserId(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalStateException("Usuario no encontrado"))
                .getId();
    }

    private DailyReadingDto.DailyReadingResponse toDailyReadingResponse(DailyReading reading) {
        return new DailyReadingDto.DailyReadingResponse(
                reading.getId().toString(),
                reading.getDate().format(DATE_FORMATTER),
                reading.getTitle(),
                reading.getBadge(),
                reading.getImageUrl(),
                reading.getBookId(),
                reading.getBookName(),
                reading.getChapterNumber(),
                reading.getVerseNumbers(),
                reading.getReadingText(),
                reading.getBiblicalReference(),
                reading.getOfficialReflection()
        );
    }

    private DailyReadingDto.ReadingHistoryResponse toReadingHistoryResponse(
            ReadingHistory history, DailyReading reading) {
        return new DailyReadingDto.ReadingHistoryResponse(
                history.getId().toString(),
                reading != null ? toDailyReadingResponse(reading) : null,
                history.getUserReflection(),
                history.hasReflection(),
                history.getReadAt().format(DATETIME_FORMATTER)
        );
    }
}

