package com.bibliacatolica.api.domain.port.in;

import com.bibliacatolica.api.domain.model.Favorite;

import java.util.List;
import java.util.UUID;

/**
 * Puerto de entrada para operaciones de favoritos
 */
public interface FavoriteUseCase {

    Favorite addFavorite(UUID userId, AddFavoriteCommand command);

    List<Favorite> getUserFavorites(UUID userId);

    List<Favorite> getUserFavorites(UUID userId, FavoriteFilter filter);

    List<Favorite> searchFavorites(UUID userId, String searchText);

    Favorite updateFavorite(UUID userId, UUID favoriteId, UpdateFavoriteCommand command);

    void removeFavorite(UUID userId, UUID favoriteId);

    boolean isFavorite(UUID userId, String bookId, int chapter, int verse);

    record AddFavoriteCommand(
        String bookId,
        int chapterNumber,
        int verseNumber,
        List<String> tags,
        String note
    ) {}

    record UpdateFavoriteCommand(
        List<String> tags,
        String note
    ) {}

    record FavoriteFilter(
        String testament,
        String bookId,
        List<String> tags
    ) {}
}

