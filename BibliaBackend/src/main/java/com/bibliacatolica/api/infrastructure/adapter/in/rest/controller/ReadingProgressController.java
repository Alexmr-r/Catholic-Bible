package com.bibliacatolica.api.infrastructure.adapter.in.rest.controller;

import com.bibliacatolica.api.domain.model.ReadingProgress;
import com.bibliacatolica.api.domain.port.in.ReadingProgressUseCase;
import com.bibliacatolica.api.domain.port.out.UserRepositoryPort;
import com.bibliacatolica.api.infrastructure.adapter.in.rest.dto.ReadingProgressDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Controlador REST para el calendario de constancia (progreso de lecturas)
 */
@Slf4j
@RestController
@RequestMapping("/reading-progress")
@RequiredArgsConstructor
@Tag(name = "Calendario de Constancia", description = "Endpoints para registrar y consultar lecturas completadas")
@SecurityRequirement(name = "Bearer Authentication")
public class ReadingProgressController {

    private final ReadingProgressUseCase readingProgressUseCase;
    private final UserRepositoryPort userRepository;

    /**
     * Marcar una lectura como completada
     */
    @PostMapping
    @Operation(summary = "Marcar lectura completada",
               description = "Registra que el usuario completó la lectura de un día específico")
    public ResponseEntity<ReadingProgressDto.ReadingProgressResponse> markAsComplete(
            @Valid @RequestBody ReadingProgressDto.MarkReadingRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        log.debug("Marcando lectura como completada para usuario: {} en fecha: {}",
                  userDetails.getUsername(), request.getDate());

        UUID userId = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"))
                .getId();

        ReadingProgress progress = readingProgressUseCase.markAsComplete(
                userId,
                request.getDate(),
                request.getDailyReadingId()
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(toResponse(progress));
    }

    /**
     * Desmarcar una lectura (si se equivocó)
     */
    @DeleteMapping
    @Operation(summary = "Desmarcar lectura",
               description = "Elimina el registro de lectura completada de un día específico")
    public ResponseEntity<Void> unmarkAsComplete(
            @RequestParam LocalDate date,
            @AuthenticationPrincipal UserDetails userDetails) {

        log.debug("Desmarcando lectura para usuario: {} en fecha: {}",
                  userDetails.getUsername(), date);

        UUID userId = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"))
                .getId();

        readingProgressUseCase.unmarkAsComplete(userId, date);

        return ResponseEntity.noContent().build();
    }

    /**
     * Obtener progreso de un mes específico para el calendario
     */
    @GetMapping
    @Operation(summary = "Obtener progreso del mes",
               description = "Devuelve todas las lecturas completadas de un mes específico")
    public ResponseEntity<List<ReadingProgressDto.ReadingProgressResponse>> getMonthProgress(
            @RequestParam int year,
            @RequestParam int month,
            @AuthenticationPrincipal UserDetails userDetails) {

        log.debug("Obteniendo progreso del mes {}/{} para usuario: {}",
                  month, year, userDetails.getUsername());

        UUID userId = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"))
                .getId();

        List<ReadingProgress> progressList = readingProgressUseCase.getMonthProgress(userId, year, month);

        return ResponseEntity.ok(
                progressList.stream()
                        .map(this::toResponse)
                        .collect(Collectors.toList())
        );
    }

    /**
     * Obtener racha actual de días consecutivos
     */
    @GetMapping("/streak")
    @Operation(summary = "Obtener racha actual",
               description = "Devuelve el número de días consecutivos con lectura completada")
    public ResponseEntity<ReadingProgressDto.StreakResponse> getCurrentStreak(
            @AuthenticationPrincipal UserDetails userDetails) {

        log.debug("Obteniendo racha actual para usuario: {}", userDetails.getUsername());

        UUID userId = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"))
                .getId();

        int streak = readingProgressUseCase.getCurrentStreak(userId);

        return ResponseEntity.ok(new ReadingProgressDto.StreakResponse(streak));
    }

    /**
     * Verificar si una fecha específica está completada
     */
    @GetMapping("/check")
    @Operation(summary = "Verificar si está completada",
               description = "Verifica si el usuario completó la lectura de una fecha específica")
    public ResponseEntity<Boolean> isDateCompleted(
            @RequestParam LocalDate date,
            @AuthenticationPrincipal UserDetails userDetails) {

        log.debug("Verificando si fecha {} está completada para usuario: {}",
                  date, userDetails.getUsername());

        UUID userId = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"))
                .getId();

        boolean completed = readingProgressUseCase.isDateCompleted(userId, date);

        return ResponseEntity.ok(completed);
    }

    // ========== Métodos auxiliares ==========

    private ReadingProgressDto.ReadingProgressResponse toResponse(ReadingProgress progress) {
        return ReadingProgressDto.ReadingProgressResponse.builder()
                .id(progress.getId())
                .userId(progress.getUserId())
                .date(progress.getDate())
                .dailyReadingId(progress.getDailyReadingId())
                .completedAt(progress.getCompletedAt())
                .createdAt(progress.getCreatedAt())
                .build();
    }
}
