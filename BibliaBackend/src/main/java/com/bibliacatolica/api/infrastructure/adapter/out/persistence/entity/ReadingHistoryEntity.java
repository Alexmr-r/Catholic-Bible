package com.bibliacatolica.api.infrastructure.adapter.out.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entidad JPA para historial de lectura
 */
@Entity
@Table(name = "reading_history",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "daily_reading_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReadingHistoryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "daily_reading_id", nullable = false)
    private UUID dailyReadingId;

    @Column(name = "user_reflection", columnDefinition = "TEXT")
    private String userReflection;

    @Column(name = "read_at", nullable = false)
    private LocalDateTime readAt;
}

