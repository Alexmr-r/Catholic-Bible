package com.bibliacatolica.api.domain.port.in;

import com.bibliacatolica.api.domain.model.Book;
import com.bibliacatolica.api.domain.model.Chapter;
import com.bibliacatolica.api.domain.model.SearchResult;
import com.bibliacatolica.api.domain.model.Testament;
import com.bibliacatolica.api.domain.model.Verse;

import java.util.List;

/**
 * Puerto de entrada para operaciones de contenido bíblico
 */
public interface BibleUseCase {

    // ========== Libros ==========

    /**
     * Obtiene todos los libros organizados por testamento
     */
    BooksResponse getAllBooks();

    /**
     * Obtiene los libros de un testamento
     */
    List<Book> getBooksByTestament(Testament testament);

    /**
     * Obtiene un libro por su ID
     */
    Book getBookById(String bookId);

    // ========== Capítulos ==========

    /**
     * Obtiene un capítulo completo
     */
    Chapter getChapter(String bookId, int chapterNumber);

    /**
     * Obtiene un capítulo con una versión específica
     */
    Chapter getChapter(String bookId, int chapterNumber, String version);

    // ========== Versículos ==========

    /**
     * Obtiene un versículo específico
     */
    Verse getVerse(String bookId, int chapter, int verse);

    /**
     * Obtiene un rango de versículos
     */
    List<Verse> getVerses(String bookId, int chapter, int startVerse, int endVerse);

    // ========== Búsqueda ==========

    /**
     * Busca versículos
     */
    SearchResult.SearchResultPage searchVerses(SearchQuery query);

    // ========== DTOs ==========

    record BooksResponse(
        List<Book> oldTestament,
        List<Book> newTestament
    ) {}

    record SearchQuery(
        String query,
        Testament testament,
        List<String> bookIds,
        int page,
        int pageSize
    ) {
        public SearchQuery {
            if (page < 0) page = 0;
            if (pageSize <= 0 || pageSize > 100) pageSize = 20;
        }
    }
}

