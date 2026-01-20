package com.bibliacatolica.api.infrastructure.adapter.in.rest.controller;

import com.bibliacatolica.api.domain.model.Writing;
import com.bibliacatolica.api.domain.port.in.WritingUseCase;
import com.bibliacatolica.api.domain.port.out.UserRepositoryPort;
import com.bibliacatolica.api.infrastructure.adapter.in.rest.dto.WritingDto;
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
 * Controlador REST para gestión de escritos/reflexiones
 */
@Slf4j
@RestController
@RequestMapping("/writings")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Escritos", description = "Endpoints para gestionar escritos y reflexiones personales")
public class WritingController {

    private final WritingUseCase writingUseCase;
    private final UserRepositoryPort userRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    @GetMapping
    @Operation(summary = "Listar escritos", description = "Obtiene todos los escritos del usuario")
    public ResponseEntity<WritingDto.WritingListResponse> getWritings(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String bookId,
            @RequestParam(required = false) Boolean favoritesOnly,
            @RequestParam(required = false) String search) {

        UUID userId = getUserId(userDetails);
        log.debug("Obteniendo escritos para usuario: {}", userId);

        List<Writing> writings;
        if (search != null && !search.isEmpty()) {
            writings = writingUseCase.searchWritings(userId, search);
        } else if (sortBy != null || bookId != null || favoritesOnly != null) {
            writings = writingUseCase.getUserWritings(userId,
                    new WritingUseCase.WritingFilter(sortBy, bookId, favoritesOnly));
        } else {
            writings = writingUseCase.getUserWritings(userId);
        }

        return ResponseEntity.ok(new WritingDto.WritingListResponse(
                writings.stream().map(this::toWritingResponse).toList(),
                writings.size()
        ));
    }

    @GetMapping("/{writingId}")
    @Operation(summary = "Obtener escrito", description = "Obtiene un escrito por ID")
    public ResponseEntity<WritingDto.WritingResponse> getWriting(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID writingId) {

        UUID userId = getUserId(userDetails);
        log.debug("Obteniendo escrito {} para usuario {}", writingId, userId);

        Writing writing = writingUseCase.getWriting(userId, writingId);
        return ResponseEntity.ok(toWritingResponse(writing));
    }

    @PostMapping
    @Operation(summary = "Crear escrito", description = "Crea un nuevo escrito/reflexión")
    public ResponseEntity<WritingDto.WritingResponse> createWriting(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody WritingDto.CreateWritingRequest request) {

        UUID userId = getUserId(userDetails);
        log.info("Usuario {} creando escrito: {}", userId, request.title());

        Writing writing = writingUseCase.createWriting(userId,
                new WritingUseCase.CreateWritingCommand(
                        request.title(),
                        request.content(),
                        request.bookId(),
                        request.chapter(),
                        request.verse(),
                        request.tags()
                ));

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(toWritingResponse(writing));
    }

    @PutMapping("/{writingId}")
    @Operation(summary = "Actualizar escrito", description = "Actualiza un escrito existente")
    public ResponseEntity<WritingDto.WritingResponse> updateWriting(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID writingId,
            @Valid @RequestBody WritingDto.UpdateWritingRequest request) {

        UUID userId = getUserId(userDetails);
        log.info("Usuario {} actualizando escrito: {}", userId, writingId);

        Writing writing = writingUseCase.updateWriting(userId, writingId,
                new WritingUseCase.UpdateWritingCommand(
                        request.title(),
                        request.content(),
                        request.tags()
                ));

        return ResponseEntity.ok(toWritingResponse(writing));
    }

    @PatchMapping("/{writingId}/favorite")
    @Operation(summary = "Toggle favorito", description = "Marca o desmarca un escrito como favorito")
    public ResponseEntity<WritingDto.WritingResponse> toggleFavorite(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID writingId) {

        UUID userId = getUserId(userDetails);
        log.info("Usuario {} toggling favorito para escrito: {}", userId, writingId);

        Writing writing = writingUseCase.toggleFavorite(userId, writingId);
        return ResponseEntity.ok(toWritingResponse(writing));
    }

    @DeleteMapping("/{writingId}")
    @Operation(summary = "Eliminar escrito", description = "Elimina un escrito")
    public ResponseEntity<Void> deleteWriting(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID writingId) {

        UUID userId = getUserId(userDetails);
        log.info("Usuario {} eliminando escrito: {}", userId, writingId);

        writingUseCase.deleteWriting(userId, writingId);
        return ResponseEntity.noContent().build();
    }

    // ========== Métodos privados ==========

    private UUID getUserId(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalStateException("Usuario no encontrado"))
                .getId();
    }

    private WritingDto.WritingResponse toWritingResponse(Writing writing) {
        WritingDto.VerseReferenceDto verseRef = null;
        if (writing.hasVerseReference()) {
            Writing.VerseReference ref = writing.getVerseReference();
            verseRef = new WritingDto.VerseReferenceDto(
                    ref.getBookId(),
                    ref.getBookName(),
                    ref.getChapter(),
                    ref.getVerse(),
                    ref.getDisplayReference()
            );
        }

        return new WritingDto.WritingResponse(
                writing.getId().toString(),
                writing.getTitle(),
                writing.getContent(),
                writing.getPreview(100),
                verseRef,
                writing.getTags(),
                writing.isFavorite(),
                writing.getCreatedAt().format(DATE_FORMATTER),
                writing.getUpdatedAt().format(DATE_FORMATTER)
        );
    }
}

