package com.bibliacatolica.api.infrastructure.adapter.out.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

/**
 * Entidad JPA para lecturas diarias
 */
@Entity
@Table(name = "daily_readings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyReadingEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private LocalDate date;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, length = 50)
    private String badge;

    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;

    @Column(name = "book_id", nullable = false, length = 50)
    private String bookId;

    @Column(name = "book_name", nullable = false, length = 100)
    private String bookName;

    @Column(name = "chapter_number", nullable = false)
    private int chapterNumber;

    @Column(name = "verse_numbers", columnDefinition = "INTEGER[]")
    private Integer[] verseNumbers;

    @Column(name = "reading_text", nullable = false, columnDefinition = "TEXT")
    private String readingText;

    @Column(name = "official_reflection", columnDefinition = "TEXT")
    private String officialReflection;
}

