package com.bibliacatolica.api.infrastructure.adapter.in.rest.controller;

import com.bibliacatolica.api.domain.model.Book;
import com.bibliacatolica.api.domain.model.Chapter;
import com.bibliacatolica.api.domain.model.SearchResult;
import com.bibliacatolica.api.domain.model.Testament;
import com.bibliacatolica.api.domain.port.in.BibleUseCase;
import com.bibliacatolica.api.infrastructure.adapter.in.rest.dto.BibleDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST para contenido bíblico
 */
@Slf4j
@RestController
@RequestMapping("/bible")
@RequiredArgsConstructor
@Tag(name = "Biblia", description = "Endpoints para acceder al contenido bíblico")
public class BibleController {

    private final BibleUseCase bibleUseCase;

    @GetMapping("/books")
    @Operation(summary = "Obtener todos los libros", description = "Lista todos los libros organizados por testamento")
    public ResponseEntity<BibleDto.BooksResponse> getAllBooks() {
        log.debug("Obteniendo todos los libros");

        BibleUseCase.BooksResponse books = bibleUseCase.getAllBooks();

        return ResponseEntity.ok(new BibleDto.BooksResponse(
                books.oldTestament().stream().map(this::toBookDto).toList(),
                books.newTestament().stream().map(this::toBookDto).toList()
        ));
    }

    @GetMapping("/books/old-testament")
    @Operation(summary = "Obtener libros del AT", description = "Lista todos los libros del Antiguo Testamento")
    public ResponseEntity<List<BibleDto.BookDto>> getOldTestamentBooks() {
        log.debug("Obteniendo libros del Antiguo Testamento");

        List<Book> books = bibleUseCase.getBooksByTestament(Testament.OLD);
        return ResponseEntity.ok(books.stream().map(this::toBookDto).toList());
    }

    @GetMapping("/books/new-testament")
    @Operation(summary = "Obtener libros del NT", description = "Lista todos los libros del Nuevo Testamento")
    public ResponseEntity<List<BibleDto.BookDto>> getNewTestamentBooks() {
        log.debug("Obteniendo libros del Nuevo Testamento");

        List<Book> books = bibleUseCase.getBooksByTestament(Testament.NEW);
        return ResponseEntity.ok(books.stream().map(this::toBookDto).toList());
    }

    @GetMapping("/english/download")
    @Operation(summary = "Descargar Biblia completa", description = "Descarga toda la Biblia en formato JSON para uso offline")
    public ResponseEntity<BibleDto.FullBibleDownload> downloadFullBible() {
        log.info("Generando descarga completa de la Biblia para uso offline");

        // Obtener todos los libros
        BibleUseCase.BooksResponse allBooks = bibleUseCase.getAllBooks();

        List<BibleDto.BookWithChapters> booksWithChapters = new java.util.ArrayList<>();

        // Procesar Antiguo Testamento
        for (Book book : allBooks.oldTestament()) {
            booksWithChapters.add(getBookWithAllChapters(book));
        }

        // Procesar Nuevo Testamento
        for (Book book : allBooks.newTestament()) {
            booksWithChapters.add(getBookWithAllChapters(book));
        }

        log.info("Descarga generada: {} libros", booksWithChapters.size());

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=\"bible_offline.json\"")
                .body(new BibleDto.FullBibleDownload(
                        "Biblia de Jerusalén",
                        "es",
                        booksWithChapters
                ));
    }

    private BibleDto.BookWithChapters getBookWithAllChapters(Book book) {
        List<BibleDto.ChapterWithVerses> chapters = new java.util.ArrayList<>();

        for (int i = 1; i <= book.getTotalChapters(); i++) {
            try {
                Chapter chapter = bibleUseCase.getChapter(book.getId(), i);
                List<BibleDto.SimpleVerse> verses = chapter.getSections().stream()
                        .flatMap(section -> section.getVerses().stream())
                        .map(verse -> new BibleDto.SimpleVerse(verse.getVerseNumber(), verse.getText()))
                        .toList();
                chapters.add(new BibleDto.ChapterWithVerses(i, verses));
            } catch (Exception e) {
                log.warn("Error obteniendo capítulo {} de {}: {}", i, book.getId(), e.getMessage());
            }
        }

        return new BibleDto.BookWithChapters(book.getId(), book.getName(), chapters);
    }

    @GetMapping("/books/{bookId}")
    @Operation(summary = "Obtener detalle de libro", description = "Obtiene información detallada de un libro")
    public ResponseEntity<BibleDto.BookDetailDto> getBook(
            @Parameter(description = "ID del libro", example = "genesis")
            @PathVariable String bookId) {
        log.debug("Obteniendo libro: {}", bookId);

        Book book = bibleUseCase.getBookById(bookId);
        return ResponseEntity.ok(toBookDetailDto(book));
    }

    @GetMapping("/books/{bookId}/chapters/{chapterNumber}")
    @Operation(summary = "Obtener capítulo", description = "Obtiene un capítulo completo con sus versículos")
    public ResponseEntity<BibleDto.ChapterResponse> getChapter(
            @Parameter(description = "ID del libro", example = "matthew")
            @PathVariable String bookId,
            @Parameter(description = "Número de capítulo", example = "1")
            @PathVariable int chapterNumber,
            @Parameter(description = "Versión de la Biblia", example = "Biblia de Jerusalén")
            @RequestParam(required = false) String version) {
        log.debug("Obteniendo capítulo {} de {}", chapterNumber, bookId);

        Chapter chapter = version != null
                ? bibleUseCase.getChapter(bookId, chapterNumber, version)
                : bibleUseCase.getChapter(bookId, chapterNumber);

        return ResponseEntity.ok(toChapterResponse(chapter));
    }

    @GetMapping("/search")
    @Operation(summary = "Buscar versículos", description = "Busca versículos por texto")
    public ResponseEntity<BibleDto.SearchResponse> searchVerses(
            @Parameter(description = "Texto a buscar", example = "amor")
            @RequestParam String query,
            @Parameter(description = "Filtrar por testamento (old/new)")
            @RequestParam(required = false) String testament,
            @Parameter(description = "Lista de IDs de libros para filtrar")
            @RequestParam(required = false) List<String> bookIds,
            @Parameter(description = "Número de página (0-based)")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Tamaño de página")
            @RequestParam(defaultValue = "20") int pageSize) {
        log.info("Buscando versículos: query={}, testament={}", query, testament);

        Testament testamentFilter = testament != null ? Testament.fromCode(testament) : null;

        SearchResult.SearchResultPage results = bibleUseCase.searchVerses(
                new BibleUseCase.SearchQuery(query, testamentFilter, bookIds, page, pageSize)
        );

        return ResponseEntity.ok(toSearchResponse(results));
    }

    // ========== Métodos de conversión ==========

    private BibleDto.BookDto toBookDto(Book book) {
        return new BibleDto.BookDto(
                book.getId(),
                book.getName(),
                book.getAbbreviation(),
                book.getTestament().getCode(),
                book.getCategory().getDisplayName(),
                book.getTotalChapters(),
                book.getDescription()
        );
    }

    private BibleDto.BookDetailDto toBookDetailDto(Book book) {
        return new BibleDto.BookDetailDto(
                book.getId(),
                book.getName(),
                book.getAbbreviation(),
                book.getTestament().getCode(),
                book.getCategory().getDisplayName(),
                book.getTotalChapters(),
                book.getDescription(),
                book.getAuthor(),
                book.getHistoricalContext()
        );
    }

    private BibleDto.ChapterResponse toChapterResponse(Chapter chapter) {
        return new BibleDto.ChapterResponse(
                chapter.getBookId(),
                chapter.getBookId(), // TODO: Obtener nombre del libro
                chapter.getChapterNumber(),
                chapter.getVersion(),
                chapter.getSections().stream()
                        .map(section -> new BibleDto.SectionDto(
                                section.getTitle(),
                                section.getVerses().stream()
                                        .map(verse -> new BibleDto.VerseDto(
                                                verse.getVerseNumber(),
                                                verse.getText(),
                                                verse.isHasNote()
                                        ))
                                        .toList()
                        ))
                        .toList(),
                chapter.getPreviousChapter() != null
                        ? new BibleDto.ChapterReferenceDto(
                                chapter.getPreviousChapter().getBookId(),
                                chapter.getPreviousChapter().getBookName(),
                                chapter.getPreviousChapter().getChapterNumber())
                        : null,
                chapter.getNextChapter() != null
                        ? new BibleDto.ChapterReferenceDto(
                                chapter.getNextChapter().getBookId(),
                                chapter.getNextChapter().getBookName(),
                                chapter.getNextChapter().getChapterNumber())
                        : null
        );
    }

    private BibleDto.SearchResponse toSearchResponse(SearchResult.SearchResultPage page) {
        return new BibleDto.SearchResponse(
                page.getResults().stream()
                        .map(r -> new BibleDto.SearchResultDto(
                                r.getBookId(),
                                r.getBookName(),
                                r.getChapterNumber(),
                                r.getVerseNumber(),
                                r.getText(),
                                r.getHighlightedText()
                        ))
                        .toList(),
                page.getTotalResults(),
                page.getPage(),
                page.getPageSize(),
                page.isHasMore()
        );
    }
}

