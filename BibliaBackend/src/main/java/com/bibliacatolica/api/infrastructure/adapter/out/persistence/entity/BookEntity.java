package com.bibliacatolica.api.infrastructure.adapter.out.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

/**
 * Entidad JPA para libros de la Biblia
 */
@Entity
@Table(name = "books")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookEntity {

    @Id
    @Column(length = 50)
    private String id;  // e.g., "genesis", "matthew"

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 10)
    private String abbreviation;

    @Column(nullable = false, length = 10)
    private String testament;  // "old" or "new"

    @Column(nullable = false, length = 50)
    private String category;

    @Column(name = "total_chapters", nullable = false)
    private int totalChapters;

    @Column(name = "order_index", nullable = false)
    private int orderIndex;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 100)
    private String author;

    @Column(name = "historical_context", columnDefinition = "TEXT")
    private String historicalContext;

    @OneToMany(mappedBy = "book", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<ChapterEntity> chapters = new ArrayList<>();
}
