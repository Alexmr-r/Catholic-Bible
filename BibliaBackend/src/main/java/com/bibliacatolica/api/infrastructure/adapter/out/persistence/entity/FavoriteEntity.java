package com.bibliacatolica.api.infrastructure.adapter.out.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entidad JPA para favoritos
 */
@Entity
@Table(name = "favorites")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FavoriteEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "book_id", nullable = false, length = 50)
    private String bookId;

    @Column(name = "book_name", nullable = false, length = 100)
    private String bookName;

    @Column(name = "chapter_number", nullable = false)
    private int chapterNumber;

    @Column(name = "verse_number", nullable = false)
    private int verseNumber;

    @Column(name = "verse_text", nullable = false, columnDefinition = "TEXT")
    private String verseText;

    @Column(columnDefinition = "TEXT[]")
    private String[] tags;

    @Column(columnDefinition = "TEXT")
    private String note;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}

