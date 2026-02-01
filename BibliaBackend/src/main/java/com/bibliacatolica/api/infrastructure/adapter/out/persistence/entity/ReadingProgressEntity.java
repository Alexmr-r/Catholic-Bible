package com.bibliacatolica.api.infrastructure.adapter.out.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entidad JPA para progreso de lecturas (Calendario de Constancia)
 */
@Entity
@Table(name = "reading_progress",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "date"}),
       indexes = {
           @Index(name = "idx_reading_progress_user_date", columnList = "user_id, date DESC"),
           @Index(name = "idx_reading_progress_user_month",
                  columnList = "user_id, date")
       })
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReadingProgressEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "date", nullable = false)
    private LocalDate date;

    @Column(name = "daily_reading_id")
    private UUID dailyReadingId;

    @Column(name = "completed_at", nullable = false)
    private LocalDateTime completedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (completedAt == null) {
            completedAt = LocalDateTime.now();
        }
    }
}
