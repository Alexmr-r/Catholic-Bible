package com.bibliacatolica.api.domain.service;

import com.bibliacatolica.api.domain.model.ReadingProgress;
import com.bibliacatolica.api.domain.port.out.ReadingProgressRepositoryPort;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ReadingProgressService")
class ReadingProgressServiceTest {

    @Mock
    private ReadingProgressRepositoryPort repository;

    @InjectMocks
    private ReadingProgressService service;

    private UUID userId;
    private LocalDate today;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        today = LocalDate.now();
    }

    @Nested
    @DisplayName("markAsComplete()")
    class MarkTests {
        @Test
        @DisplayName("Crea nuevo progreso")
        void shouldCreate() {
            when(repository.existsByUserIdAndDate(userId, today)).thenReturn(false);
            when(repository.save(any())).thenAnswer(i -> i.getArgument(0));
            ReadingProgress r = service.markAsComplete(userId, today, null);
            assertNotNull(r);
            assertEquals(userId, r.getUserId());
            verify(repository).save(any());
        }

        @Test
        @DisplayName("Devuelve existente si ya completado")
        void shouldReturnExisting() {
            ReadingProgress existing = ReadingProgress.builder()
                    .id(UUID.randomUUID()).userId(userId).date(today).build();
            when(repository.existsByUserIdAndDate(userId, today)).thenReturn(true);
            when(repository.findByUserIdAndDate(userId, today)).thenReturn(Optional.of(existing));
            ReadingProgress r = service.markAsComplete(userId, today, null);
            assertEquals(existing.getId(), r.getId());
            verify(repository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("getCurrentStreak()")
    class StreakTests {
        @Test
        @DisplayName("0 sin progreso")
        void zero() {
            when(repository.findByUserIdOrderByDateDesc(userId)).thenReturn(Collections.emptyList());
            assertEquals(0, service.getCurrentStreak(userId));
        }

        @Test
        @DisplayName("0 si racha rota")
        void broken() {
            when(repository.findByUserIdOrderByDateDesc(userId)).thenReturn(List.of(
                    ReadingProgress.builder().id(UUID.randomUUID()).userId(userId)
                            .date(today.minusDays(3)).completedAt(LocalDateTime.now()).build()));
            assertEquals(0, service.getCurrentStreak(userId));
        }

        @Test
        @DisplayName("Cuenta 3 días consecutivos")
        void threeDays() {
            when(repository.findByUserIdOrderByDateDesc(userId)).thenReturn(Arrays.asList(
                    ReadingProgress.builder().id(UUID.randomUUID()).userId(userId)
                            .date(today).completedAt(LocalDateTime.now()).build(),
                    ReadingProgress.builder().id(UUID.randomUUID()).userId(userId)
                            .date(today.minusDays(1)).completedAt(LocalDateTime.now()).build(),
                    ReadingProgress.builder().id(UUID.randomUUID()).userId(userId)
                            .date(today.minusDays(2)).completedAt(LocalDateTime.now()).build()));
            assertEquals(3, service.getCurrentStreak(userId));
        }
    }

    @Test
    @DisplayName("isDateCompleted() delega al repositorio")
    void isCompleted() {
        when(repository.existsByUserIdAndDate(userId, today)).thenReturn(true);
        assertTrue(service.isDateCompleted(userId, today));
    }

    @Test
    @DisplayName("unmarkAsComplete() delega al repositorio")
    void unmark() {
        service.unmarkAsComplete(userId, today);
        verify(repository).deleteByUserIdAndDate(userId, today);
    }
}
