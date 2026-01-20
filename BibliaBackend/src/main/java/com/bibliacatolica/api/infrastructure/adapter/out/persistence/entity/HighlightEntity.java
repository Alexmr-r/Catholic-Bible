package com.bibliacatolica.api.infrastructure.adapter.out.persistence.entity;

import com.bibliacatolica.api.domain.model.HighlightColor;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entidad JPA para resaltados de versículos
 */
@Entity
@Table(name = "highlights", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "book_id", "chapter_number", "verse_number"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HighlightEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "book_id", nullable = false, length = 50)
    private String bookId;

    @Column(name = "chapter_number", nullable = false)
    private int chapterNumber;

    @Column(name = "verse_number", nullable = false)
    private int verseNumber;

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private HighlightColor color;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}

