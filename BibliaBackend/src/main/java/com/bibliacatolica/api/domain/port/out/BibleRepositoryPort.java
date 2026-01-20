package com.bibliacatolica.api.domain.port.out;

import com.bibliacatolica.api.domain.model.Book;
import com.bibliacatolica.api.domain.model.Chapter;
import com.bibliacatolica.api.domain.model.SearchResult;
import com.bibliacatolica.api.domain.model.Testament;
import com.bibliacatolica.api.domain.model.Verse;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Puerto de salida para persistencia de contenido bíblico
 */
public interface BibleRepositoryPort {

    // ========== Libros ==========

    /**
     * Obtiene todos los libros
     */
    List<Book> findAllBooks();

    /**
     * Obtiene los libros de un testamento
     */
    List<Book> findBooksByTestament(Testament testament);

    /**
     * Busca un libro por ID
     */
    Optional<Book> findBookById(String bookId);

    /**
     * Guarda un libro
     */
    Book saveBook(Book book);

    // ========== Capítulos ==========

    /**
     * Obtiene un capítulo
     */
    Optional<Chapter> findChapter(String bookId, int chapterNumber);

    /**
     * Obtiene un capítulo con versión específica
     */
    Optional<Chapter> findChapter(String bookId, int chapterNumber, String version);

    /**
     * Obtiene todos los capítulos de un libro
     */
    List<Chapter> findChaptersByBookId(String bookId);

    /**
     * Guarda un capítulo
     */
    Chapter saveChapter(Chapter chapter);

    // ========== Versículos ==========

    /**
     * Busca un versículo específico
     */
    Optional<Verse> findVerse(String bookId, int chapter, int verseNumber);

    /**
     * Obtiene un rango de versículos
     */
    List<Verse> findVerses(String bookId, int chapter, int startVerse, int endVerse);

    /**
     * Obtiene todos los versículos de un capítulo
     */
    List<Verse> findVersesByChapter(UUID chapterId);

    /**
     * Guarda un versículo
     */
    Verse saveVerse(Verse verse);

    // ========== Búsqueda ==========

    /**
     * Busca versículos por texto
     */
    List<SearchResult> searchVerses(String query, int limit, int offset);

    /**
     * Busca versículos por texto filtrado por testamento
     */
    List<SearchResult> searchVersesByTestament(String query, Testament testament, int limit, int offset);

    /**
     * Busca versículos por texto filtrado por libro
     */
    List<SearchResult> searchVersesByBook(String query, String bookId, int limit, int offset);

    /**
     * Cuenta resultados de búsqueda
     */
    long countSearchResults(String query);

    /**
     * Cuenta resultados de búsqueda por testamento
     */
    long countSearchResultsByTestament(String query, Testament testament);
}

