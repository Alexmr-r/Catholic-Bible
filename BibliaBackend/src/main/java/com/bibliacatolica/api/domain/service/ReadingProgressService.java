package com.bibliacatolica.api.domain.service;

import com.bibliacatolica.api.domain.model.ReadingProgress;
import com.bibliacatolica.api.domain.port.in.ReadingProgressUseCase;
import com.bibliacatolica.api.domain.port.out.ReadingProgressRepositoryPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Servicio de dominio para progreso de lecturas
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ReadingProgressService implements ReadingProgressUseCase {

    private final ReadingProgressRepositoryPort repository;

    @Override
    @Transactional
    public ReadingProgress markAsComplete(UUID userId, LocalDate date, UUID dailyReadingId) {
        log.debug("Marcando lectura como completada: userId={}, date={}", userId, date);

        // Verificar si ya existe
        if (repository.existsByUserIdAndDate(userId, date)) {
            log.warn("La lectura ya está marcada como completada para esta fecha");
            return repository.findByUserIdAndDate(userId, date)
                    .orElseThrow(() -> new RuntimeException("Error al obtener progreso existente"));
        }

        ReadingProgress progress = ReadingProgress.builder()
                .id(UUID.randomUUID())
                .userId(userId)
                .date(date)
                .dailyReadingId(dailyReadingId)
                .completedAt(LocalDateTime.now())
                .createdAt(LocalDateTime.now())
                .build();

        return repository.save(progress);
    }

    @Override
    @Transactional
    public void unmarkAsComplete(UUID userId, LocalDate date) {
        log.debug("Desmarcando lectura: userId={}, date={}", userId, date);
        repository.deleteByUserIdAndDate(userId, date);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isDateCompleted(UUID userId, LocalDate date) {
        return repository.existsByUserIdAndDate(userId, date);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReadingProgress> getMonthProgress(UUID userId, int year, int month) {
        log.debug("Obteniendo progreso del mes: userId={}, year={}, month={}", userId, year, month);
        return repository.findByUserIdAndYearMonth(userId, year, month);
    }

    @Override
    @Transactional(readOnly = true)
    public int getCurrentStreak(UUID userId) {
        log.debug("Calculando racha actual para userId={}", userId);

        List<ReadingProgress> allProgress = repository.findByUserIdOrderByDateDesc(userId);

        if (allProgress.isEmpty()) {
            return 0;
        }

        int streak = 0;
        LocalDate today = LocalDate.now();
        LocalDate checkDate = today;

        // Verificar si la última lectura fue hoy o ayer (dar margen de 1 día)
        LocalDate lastReadingDate = allProgress.get(0).getDate();
        long daysDiff = java.time.temporal.ChronoUnit.DAYS.between(lastReadingDate, today);

        if (daysDiff > 1) {
            // Racha rota (más de 1 día sin leer)
            return 0;
        }

        // Contar días consecutivos hacia atrás
        for (ReadingProgress progress : allProgress) {
            LocalDate progressDate = progress.getDate();
            long diff = java.time.temporal.ChronoUnit.DAYS.between(progressDate, checkDate);

            if (diff == 0) {
                streak++;
                checkDate = checkDate.minusDays(1);
            } else if (diff > 1) {
                // Racha rota
                break;
            }
        }

        return streak;
    }
}
