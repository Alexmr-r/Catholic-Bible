package com.bibliacatolica.api.infrastructure.adapter.in.rest.controller;

import com.bibliacatolica.api.domain.model.Favorite;
import com.bibliacatolica.api.domain.port.in.FavoriteUseCase;
import com.bibliacatolica.api.domain.port.out.UserRepositoryPort;
import com.bibliacatolica.api.infrastructure.adapter.in.rest.dto.FavoriteDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
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
 * Controlador REST para gestión de favoritos
 */
@Slf4j
@RestController
@RequestMapping("/favorites")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Favoritos", description = "Endpoints para gestionar versículos favoritos")
public class FavoriteController {

    private final FavoriteUseCase favoriteUseCase;
    private final UserRepositoryPort userRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    @GetMapping
    @Operation(summary = "Listar favoritos", description = "Obtiene todos los favoritos del usuario")
    public ResponseEntity<FavoriteDto.FavoriteListResponse> getFavorites(
            @AuthenticationPrincipal UserDetails userDetails,
            @Parameter(description = "Filtrar por testamento (old/new/all)")
            @RequestParam(required = false) String testament,
            @Parameter(description = "Filtrar por libro")
            @RequestParam(required = false) String bookId,
            @Parameter(description = "Texto para buscar")
            @RequestParam(required = false) String search) {

        UUID userId = getUserId(userDetails);
        log.debug("Obteniendo favoritos para usuario: {}", userId);

        List<Favorite> favorites;
        if (search != null && !search.isEmpty()) {
            favorites = favoriteUseCase.searchFavorites(userId, search);
        } else if (testament != null || bookId != null) {
            favorites = favoriteUseCase.getUserFavorites(userId,
                    new FavoriteUseCase.FavoriteFilter(testament, bookId, null));
        } else {
            favorites = favoriteUseCase.getUserFavorites(userId);
        }

        return ResponseEntity.ok(new FavoriteDto.FavoriteListResponse(
                favorites.stream().map(this::toFavoriteResponse).toList(),
                favorites.size()
        ));
    }

    @PostMapping
    @Operation(summary = "Agregar favorito", description = "Agrega un versículo a favoritos")
    public ResponseEntity<FavoriteDto.FavoriteResponse> addFavorite(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody FavoriteDto.AddFavoriteRequest request) {

        UUID userId = getUserId(userDetails);
        log.info("Usuario {} agregando favorito: {} {}:{}",
                userId, request.bookId(), request.chapterNumber(), request.verseNumber());

        Favorite favorite = favoriteUseCase.addFavorite(userId,
                new FavoriteUseCase.AddFavoriteCommand(
                        request.bookId(),
                        request.chapterNumber(),
                        request.verseNumber(),
                        request.tags(),
                        request.note()
                ));

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(toFavoriteResponse(favorite));
    }

    @PutMapping("/{favoriteId}")
    @Operation(summary = "Actualizar favorito", description = "Actualiza tags o nota de un favorito")
    public ResponseEntity<FavoriteDto.FavoriteResponse> updateFavorite(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID favoriteId,
            @Valid @RequestBody FavoriteDto.UpdateFavoriteRequest request) {

        UUID userId = getUserId(userDetails);
        log.info("Usuario {} actualizando favorito: {}", userId, favoriteId);

        Favorite favorite = favoriteUseCase.updateFavorite(userId, favoriteId,
                new FavoriteUseCase.UpdateFavoriteCommand(request.tags(), request.note()));

        return ResponseEntity.ok(toFavoriteResponse(favorite));
    }

    @DeleteMapping("/{favoriteId}")
    @Operation(summary = "Eliminar favorito", description = "Elimina un favorito")
    public ResponseEntity<Void> removeFavorite(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID favoriteId) {

        UUID userId = getUserId(userDetails);
        log.info("Usuario {} eliminando favorito: {}", userId, favoriteId);

        favoriteUseCase.removeFavorite(userId, favoriteId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/check")
    @Operation(summary = "Verificar favorito", description = "Verifica si un versículo está en favoritos")
    public ResponseEntity<Boolean> isFavorite(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam String bookId,
            @RequestParam int chapter,
            @RequestParam int verse) {

        UUID userId = getUserId(userDetails);
        boolean isFavorite = favoriteUseCase.isFavorite(userId, bookId, chapter, verse);

        return ResponseEntity.ok(isFavorite);
    }

    // ========== Métodos privados ==========

    private UUID getUserId(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalStateException("Usuario no encontrado"))
                .getId();
    }

    private FavoriteDto.FavoriteResponse toFavoriteResponse(Favorite favorite) {
        return new FavoriteDto.FavoriteResponse(
                favorite.getId().toString(),
                favorite.getBookId(),
                favorite.getBookName(),
                favorite.getChapterNumber(),
                favorite.getVerseNumber(),
                favorite.getVerseText(),
                favorite.getReference(),
                favorite.getTags(),
                favorite.getNote(),
                favorite.getCreatedAt().format(DATE_FORMATTER)
        );
    }
}

