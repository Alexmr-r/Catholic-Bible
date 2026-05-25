package com.bibliacatolica.api.application.service;

import com.bibliacatolica.api.domain.exception.ResourceNotFoundException;
import com.bibliacatolica.api.domain.model.*;
import com.bibliacatolica.api.domain.port.in.BibleUseCase;
import com.bibliacatolica.api.domain.port.out.BibleRepositoryPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Servicio de aplicación para operaciones de contenido bíblico
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BibleService implements BibleUseCase {

    private final BibleRepositoryPort bibleRepository;

    @Override
    public BooksResponse getAllBooks() {
        log.debug("Obteniendo todos los libros de la Biblia");

        List<Book> oldTestament = bibleRepository.findBooksByTestament(Testament.OLD);
        List<Book> newTestament = bibleRepository.findBooksByTestament(Testament.NEW);

        return new BooksResponse(oldTestament, newTestament);
    }

    @Override
    public List<Book> getBooksByTestament(Testament testament) {
        log.debug("Obteniendo libros del testamento: {}", testament);
        return bibleRepository.findBooksByTestament(testament);
    }

    @Override
    public Book getBookById(String bookId) {
        log.debug("Obteniendo libro: {}", bookId);
        return bibleRepository.findBookById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Libro", bookId));
    }

    @Override
    public Chapter getChapter(String bookId, int chapterNumber) {
        log.debug("Obteniendo capítulo {}.{}", bookId, chapterNumber);
        return bibleRepository.findChapter(bookId, chapterNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Capítulo",
                        String.format("%s %d", bookId, chapterNumber)));
    }

    @Override
    public Chapter getChapter(String bookId, int chapterNumber, String version) {
        log.debug("Obteniendo capítulo {}.{} versión {}", bookId, chapterNumber, version);
        return bibleRepository.findChapter(bookId, chapterNumber, version)
                .orElseThrow(() -> new ResourceNotFoundException("Capítulo",
                        String.format("%s %d (%s)", bookId, chapterNumber, version)));
    }

    @Override
    public Verse getVerse(String bookId, int chapter, int verse) {
        log.debug("Obteniendo versículo {}.{}:{}", bookId, chapter, verse);
        return bibleRepository.findVerse(bookId, chapter, verse)
                .orElseThrow(() -> new ResourceNotFoundException("Versículo",
                        String.format("%s %d:%d", bookId, chapter, verse)));
    }

    @Override
    public List<Verse> getVerses(String bookId, int chapter, int startVerse, int endVerse) {
        log.debug("Obteniendo versículos {}.{}:{}-{}", bookId, chapter, startVerse, endVerse);
        return bibleRepository.findVerses(bookId, chapter, startVerse, endVerse);
    }

    @Override
    @Transactional
    public Verse updateVerseText(String bookId, int chapter, int verse, String newText) {
        log.info("CMS: Actualizando texto de versículo {}.{}:{} -> {}", bookId, chapter, verse, newText);
        Verse currentVerse = bibleRepository.findVerse(bookId, chapter, verse)
                .orElseThrow(() -> new ResourceNotFoundException("Versículo", 
                        String.format("%s %d:%d", bookId, chapter, verse)));
        
        Verse updatedVerse = currentVerse.withText(newText);
        return bibleRepository.saveVerse(updatedVerse);
    }

    @Override
    public SearchResult.SearchResultPage searchVerses(SearchQuery query) {
        log.debug("Buscando versículos con query: {}", query.query());

        int offset = query.page() * query.pageSize();
        List<SearchResult> results;
        long totalResults;

        if (query.testament() != null) {
            results = bibleRepository.searchVersesByTestament(
                    query.query(), query.testament(), query.pageSize(), offset);
            totalResults = bibleRepository.countSearchResultsByTestament(
                    query.query(), query.testament());
        } else if (query.bookIds() != null && !query.bookIds().isEmpty()) {
            // Buscar en libros específicos
            results = bibleRepository.searchVersesByBook(
                    query.query(), query.bookIds().get(0), query.pageSize(), offset);
            totalResults = bibleRepository.countSearchResults(query.query());
        } else {
            results = bibleRepository.searchVerses(query.query(), query.pageSize(), offset);
            totalResults = bibleRepository.countSearchResults(query.query());
        }

        return SearchResult.SearchResultPage.builder()
                .results(results)
                .totalResults(totalResults)
                .page(query.page())
                .pageSize(query.pageSize())
                .hasMore(offset + results.size() < totalResults)
                .build();
    }
}

