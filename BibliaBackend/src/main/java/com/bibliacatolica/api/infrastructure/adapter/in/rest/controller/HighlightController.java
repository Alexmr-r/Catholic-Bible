package com.bibliacatolica.api.infrastructure.adapter.in.rest.controller;

import com.bibliacatolica.api.domain.model.Highlight;
import com.bibliacatolica.api.domain.model.HighlightColor;
import com.bibliacatolica.api.domain.port.in.HighlightUseCase;
import com.bibliacatolica.api.domain.port.out.UserRepositoryPort;
import com.bibliacatolica.api.infrastructure.adapter.in.rest.dto.HighlightDto;
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

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

/**
 * Controlador REST para gestión de resaltados
 */
@Slf4j
@RestController
@RequestMapping("/highlights")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Resaltados", description = "Endpoints para gestionar resaltados de versículos")
public class HighlightController {

    private final HighlightUseCase highlightUseCase;
    private final UserRepositoryPort userRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    @GetMapping
    @Operation(summary = "Listar resaltados", description = "Obtiene todos los resaltados del usuario")
    public ResponseEntity<List<HighlightDto.HighlightResponse>> getHighlights(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) String color) {

        UUID userId = getUserId(userDetails);
        log.debug("Obteniendo resaltados para usuario: {}", userId);

        List<Highlight> highlights;
        if (color != null) {
            highlights = highlightUseCase.getHighlightsByColor(userId, HighlightColor.fromName(color));
        } else {
            highlights = highlightUseCase.getUserHighlights(userId);
        }

        return ResponseEntity.ok(highlights.stream().map(this::toHighlightResponse).toList());
    }

    @GetMapping("/chapter")
    @Operation(summary = "Resaltados de capítulo", description = "Obtiene los resaltados de un capítulo específico")
    public ResponseEntity<HighlightDto.ChapterHighlightsResponse> getChapterHighlights(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam String bookId,
            @RequestParam int chapter) {

        UUID userId = getUserId(userDetails);
        log.debug("Obteniendo resaltados del capítulo {} {} para usuario {}", bookId, chapter, userId);

        List<Highlight> highlights = highlightUseCase.getChapterHighlights(userId, bookId, chapter);

        return ResponseEntity.ok(new HighlightDto.ChapterHighlightsResponse(
                bookId,
                chapter,
                highlights.stream().map(this::toHighlightResponse).toList()
        ));
    }

    @PostMapping
    @Operation(summary = "Crear/Actualizar resaltado", description = "Resalta un versículo con un color")
    public ResponseEntity<HighlightDto.HighlightResponse> highlightVerse(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody HighlightDto.HighlightRequest request) {

        UUID userId = getUserId(userDetails);
        log.info("Usuario {} resaltando {} {}:{} con color {}",
                userId, request.bookId(), request.chapterNumber(), request.verseNumber(), request.color());

        Highlight highlight = highlightUseCase.highlightVerse(userId,
                new HighlightUseCase.HighlightCommand(
                        request.bookId(),
                        request.chapterNumber(),
                        request.verseNumber(),
                        HighlightColor.fromName(request.color())
                ));

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(toHighlightResponse(highlight));
    }

    @DeleteMapping("/{highlightId}")
    @Operation(summary = "Eliminar resaltado", description = "Elimina un resaltado por ID")
    public ResponseEntity<Void> removeHighlight(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID highlightId) {

        UUID userId = getUserId(userDetails);
        log.info("Usuario {} eliminando resaltado: {}", userId, highlightId);

        highlightUseCase.removeHighlightById(userId, highlightId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    @Operation(summary = "Eliminar resaltado por versículo", description = "Elimina el resaltado de un versículo específico")
    public ResponseEntity<Void> removeHighlightByVerse(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam String bookId,
            @RequestParam int chapter,
            @RequestParam int verse) {

        UUID userId = getUserId(userDetails);
        log.info("Usuario {} eliminando resaltado de {} {}:{}", userId, bookId, chapter, verse);

        highlightUseCase.removeHighlight(userId, bookId, chapter, verse);
        return ResponseEntity.noContent().build();
    }

    // ========== Métodos privados ==========

    private UUID getUserId(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalStateException("Usuario no encontrado"))
                .getId();
    }

    private HighlightDto.HighlightResponse toHighlightResponse(Highlight highlight) {
        return new HighlightDto.HighlightResponse(
                highlight.getId().toString(),
                highlight.getBookId(),
                highlight.getChapterNumber(),
                highlight.getVerseNumber(),
                highlight.getColor().getName(),
                highlight.getCreatedAt().format(DATE_FORMATTER)
        );
    }
}

