package com.bibliacatolica.api.infrastructure.adapter.out.persistence;

import com.bibliacatolica.api.domain.model.*;
import com.bibliacatolica.api.domain.port.out.BibleRepositoryPort;
import com.bibliacatolica.api.infrastructure.adapter.out.persistence.entity.*;
import com.bibliacatolica.api.infrastructure.adapter.out.persistence.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Adaptador de persistencia para contenido bíblico
 */
@Component
@RequiredArgsConstructor
public class BiblePersistenceAdapter implements BibleRepositoryPort {

    private final JpaBookRepository bookRepository;
    private final JpaChapterRepository chapterRepository;
    private final JpaVerseRepository verseRepository;

    @Override
    public List<Book> findAllBooks() {
        return bookRepository.findAllByOrderByOrderIndexAsc().stream()
                .map(this::toBookDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Book> findBooksByTestament(Testament testament) {
        String testamentCode = testament == Testament.OLD ? "old" : "new";
        return bookRepository.findByTestamentOrderByOrderIndexAsc(testamentCode).stream()
                .map(this::toBookDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<Book> findBookById(String bookId) {
        return bookRepository.findById(bookId).map(this::toBookDomain);
    }

    @Override
    public Book saveBook(Book book) {
        BookEntity entity = toBookEntity(book);
        BookEntity saved = bookRepository.save(entity);
        return toBookDomain(saved);
    }

    @Override
    public Optional<Chapter> findChapter(String bookId, int chapterNumber) {
        return chapterRepository.findByBookIdAndChapterNumber(bookId, chapterNumber)
                .map(entity -> toChapterDomain(entity, bookId));
    }

    @Override
    public Optional<Chapter> findChapter(String bookId, int chapterNumber, String version) {
        return chapterRepository.findByBookIdAndChapterNumberAndVersion(bookId, chapterNumber, version)
                .map(entity -> toChapterDomain(entity, bookId));
    }

    @Override
    public List<Chapter> findChaptersByBookId(String bookId) {
        return chapterRepository.findByBookIdOrderByChapterNumberAsc(bookId).stream()
                .map(entity -> toChapterDomain(entity, bookId))
                .collect(Collectors.toList());
    }

    @Override
    public Chapter saveChapter(Chapter chapter) {
        // Implementación básica - se requiere lógica más compleja para guardar secciones y versículos
        throw new UnsupportedOperationException("Saving chapters not implemented yet");
    }

    @Override
    public Optional<Verse> findVerse(String bookId, int chapterNumber, int verseNumber) {
        return verseRepository.findByBookAndChapterAndVerse(bookId, chapterNumber, verseNumber)
                .map(this::toVerseDomain);
    }

    @Override
    public List<Verse> findVerses(String bookId, int chapterNumber, int startVerse, int endVerse) {
        return verseRepository.findByBookAndChapterAndVerseRange(bookId, chapterNumber, startVerse, endVerse).stream()
                .map(this::toVerseDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Verse> findVersesByChapter(UUID chapterId) {
        return verseRepository.findByChapterId(chapterId).stream()
                .map(this::toVerseDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Verse saveVerse(Verse verse) {
        throw new UnsupportedOperationException("Saving verses not implemented yet");
    }

    @Override
    public List<SearchResult> searchVerses(String query, int limit, int offset) {
        return verseRepository.searchByText(query, limit, offset).stream()
                .map(entity -> toSearchResult(entity, query))
                .collect(Collectors.toList());
    }

    @Override
    public List<SearchResult> searchVersesByTestament(String query, Testament testament, int limit, int offset) {
        // Por simplicidad, buscamos todos y filtramos
        // En producción, usar una query nativa con JOIN a books
        return searchVerses(query, limit, offset);
    }

    @Override
    public List<SearchResult> searchVersesByBook(String query, String bookId, int limit, int offset) {
        return searchVerses(query, limit, offset).stream()
                .filter(r -> r.getBookId().equals(bookId))
                .collect(Collectors.toList());
    }

    @Override
    public long countSearchResults(String query) {
        return verseRepository.countByTextContaining(query);
    }

    @Override
    public long countSearchResultsByTestament(String query, Testament testament) {
        // Por simplicidad, contar todos
        return countSearchResults(query);
    }

    // ========== Mappers ==========

    private Book toBookDomain(BookEntity entity) {
        return Book.builder()
                .id(entity.getId())
                .name(entity.getName())
                .abbreviation(entity.getAbbreviation())
                .testament("old".equals(entity.getTestament()) ? Testament.OLD : Testament.NEW)
                .category(mapCategory(entity.getCategory()))
                .totalChapters(entity.getTotalChapters())
                .orderIndex(entity.getOrderIndex())
                .description(entity.getDescription())
                .author(entity.getAuthor())
                .historicalContext(entity.getHistoricalContext())
                .build();
    }

    private BookEntity toBookEntity(Book book) {
        return BookEntity.builder()
                .id(book.getId())
                .name(book.getName())
                .abbreviation(book.getAbbreviation())
                .testament(book.getTestament() == Testament.OLD ? "old" : "new")
                .category(book.getCategory().name())
                .totalChapters(book.getTotalChapters())
                .orderIndex(book.getOrderIndex())
                .description(book.getDescription())
                .author(book.getAuthor())
                .historicalContext(book.getHistoricalContext())
                .build();
    }

    private Chapter toChapterDomain(ChapterEntity entity, String bookId) {
        Book book = findBookById(bookId).orElse(null);

        Chapter.ChapterReference previousChapter = null;
        Chapter.ChapterReference nextChapter = null;

        if (entity.getChapterNumber() > 1) {
            previousChapter = Chapter.ChapterReference.builder()
                    .bookId(bookId)
                    .bookName(book != null ? book.getName() : bookId)
                    .chapterNumber(entity.getChapterNumber() - 1)
                    .build();
        }

        if (book != null && entity.getChapterNumber() < book.getTotalChapters()) {
            nextChapter = Chapter.ChapterReference.builder()
                    .bookId(bookId)
                    .bookName(book.getName())
                    .chapterNumber(entity.getChapterNumber() + 1)
                    .build();
        }

        List<Section> sections = entity.getSections() != null
                ? entity.getSections().stream().map(this::toSectionDomain).collect(Collectors.toList())
                : new ArrayList<>();

        return Chapter.builder()
                .id(entity.getId())
                .bookId(entity.getBook().getId())
                .chapterNumber(entity.getChapterNumber())
                .version(entity.getVersion())
                .sections(sections)
                .previousChapter(previousChapter)
                .nextChapter(nextChapter)
                .build();
    }

    private Section toSectionDomain(SectionEntity entity) {
        return Section.builder()
                .title(entity.getTitle())
                .orderIndex(entity.getOrderIndex())
                .verses(entity.getVerses() != null
                        ? entity.getVerses().stream().map(this::toVerseDomain).collect(Collectors.toList())
                        : new ArrayList<>())
                .build();
    }

    private Verse toVerseDomain(VerseEntity entity) {
        return Verse.builder()
                .id(entity.getId())
                .verseNumber(entity.getVerseNumber())
                .text(entity.getText())
                .hasNote(entity.isHasNote())
                .noteText(entity.getNoteText())
                .build();
    }

    private SearchResult toSearchResult(VerseEntity entity, String query) {
        SectionEntity section = entity.getSection();
        ChapterEntity chapter = section != null ? section.getChapter() : null;
        BookEntity book = chapter != null ? chapter.getBook() : null;

        return SearchResult.builder()
                .bookId(book != null ? book.getId() : "unknown")
                .bookName(book != null ? book.getName() : "Unknown")
                .chapterNumber(chapter != null ? chapter.getChapterNumber() : 0)
                .verseNumber(entity.getVerseNumber())
                .text(entity.getText())
                .highlightedText(highlightText(entity.getText(), query))
                .build();
    }

    private BookCategory mapCategory(String category) {
        if (category == null) return BookCategory.HISTORICAL;
        return switch (category.toLowerCase()) {
            case "pentateuco", "pentateuch" -> BookCategory.PENTATEUCH;
            case "históricos", "historicos", "historical" -> BookCategory.HISTORICAL;
            case "sapienciales", "wisdom" -> BookCategory.WISDOM;
            case "profetas mayores", "prophets_major" -> BookCategory.PROPHETS_MAJOR;
            case "profetas menores", "prophets_minor" -> BookCategory.PROPHETS_MINOR;
            case "evangelios", "gospels" -> BookCategory.GOSPELS;
            case "historia", "history" -> BookCategory.HISTORY;
            case "cartas de san pablo", "pauline_letters" -> BookCategory.PAULINE_LETTERS;
            case "cartas católicas", "catholic_letters" -> BookCategory.CATHOLIC_LETTERS;
            case "profético", "prophetic" -> BookCategory.PROPHETIC;
            default -> BookCategory.HISTORICAL;
        };
    }

    private String highlightText(String text, String query) {
        if (text == null || query == null) return text;
        try {
            return text.replaceAll("(?i)(" + java.util.regex.Pattern.quote(query) + ")", "<mark>$1</mark>");
        } catch (Exception e) {
            return text;
        }
    }
}
