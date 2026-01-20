package com.bibliacatolica.api.infrastructure.adapter.out.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

/**
 * Entidad JPA para versículos de la Biblia
 */
@Entity
@Table(name = "verses", indexes = {
    @Index(name = "idx_verse_text", columnList = "text")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VerseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "section_id", nullable = false)
    private SectionEntity section;

    @Column(name = "verse_number", nullable = false)
    private int verseNumber;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String text;

    @Column(name = "has_note", nullable = false)
    @Builder.Default
    private boolean hasNote = false;

    @Column(name = "note_text", columnDefinition = "TEXT")
    private String noteText;
}

