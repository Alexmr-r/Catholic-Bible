package com.bibliacatolica.api.application.service;

import com.bibliacatolica.api.domain.exception.ResourceNotFoundException;
import com.bibliacatolica.api.domain.model.DailyReading;
import com.bibliacatolica.api.domain.model.ReadingHistory;
import com.bibliacatolica.api.domain.port.in.DailyReadingUseCase;
import com.bibliacatolica.api.domain.port.out.DailyReadingRepositoryPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Servicio de aplicación que implementa los casos de uso de lectura diaria
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DailyReadingService implements DailyReadingUseCase {

    private final DailyReadingRepositoryPort dailyReadingRepository;

    @Override
    @Transactional(readOnly = true)
    public DailyReading getTodayReading() {
        log.debug("Obteniendo lectura del día");
        return getReadingByDate(LocalDate.now());
    }

    @Override
    @Transactional(readOnly = true)
    public DailyReading getReadingByDate(LocalDate date) {
        log.debug("Obteniendo lectura para fecha: {}", date);

        // Intentar obtener lectura existente
        Optional<DailyReading> existingReading = dailyReadingRepository.findByDate(date);

        if (existingReading.isPresent()) {
            return existingReading.get();
        }

        // Si no existe, generar una lectura dinámica basada en la fecha
        // Usamos el día del año para seleccionar una lectura del pool
        return generateDynamicReading(date);
    }

    /**
     * Genera una lectura dinámica para fechas que no tienen lectura predefinida
     * Usa el día del año para seleccionar consistentemente la misma lectura para la misma fecha
     */
    private DailyReading generateDynamicReading(LocalDate date) {
        log.debug("Generando lectura dinámica para fecha: {}", date);

        // Obtener todas las lecturas disponibles
        List<DailyReading> allReadings = dailyReadingRepository.findAll();

        if (allReadings.isEmpty()) {
            throw new ResourceNotFoundException("Lectura diaria", date.toString());
        }

        // Usar el día del año para seleccionar consistentemente
        int dayOfYear = date.getDayOfYear();
        int index = dayOfYear % allReadings.size();

        DailyReading baseReading = allReadings.get(index);

        // Crear una copia con la fecha solicitada
        return DailyReading.builder()
                .id(UUID.nameUUIDFromBytes(("reading-" + date.toString()).getBytes()))
                .date(date)
                .title(baseReading.getTitle())
                .badge(baseReading.getBadge())
                .imageUrl(baseReading.getImageUrl())
                .bookId(baseReading.getBookId())
                .bookName(baseReading.getBookName())
                .chapterNumber(baseReading.getChapterNumber())
                .verseNumbers(baseReading.getVerseNumbers())
                .readingText(baseReading.getReadingText())
                .officialReflection(baseReading.getOfficialReflection())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<DailyReading> getReadingsForWeek(LocalDate startDate) {
        log.debug("Obteniendo lecturas de la semana desde: {}", startDate);
        LocalDate endDate = startDate.plusDays(6);
        return dailyReadingRepository.findByDateBetween(startDate, endDate);
    }

    @Override
    @Transactional
    public ReadingHistory markAsRead(UUID userId, UUID readingId) {
        log.info("Usuario {} marcando lectura {} como leída", userId, readingId);

        // Verificar que la lectura existe
        dailyReadingRepository.findByDate(LocalDate.now())
                .filter(r -> r.getId().equals(readingId))
                .orElseThrow(() -> new ResourceNotFoundException("Lectura diaria", readingId.toString()));

        // Verificar si ya existe un registro
        Optional<ReadingHistory> existing = dailyReadingRepository
                .findHistoryByUserAndReading(userId, readingId);

        if (existing.isPresent()) {
            return existing.get();
        }

        // Crear nuevo registro de historial
        ReadingHistory history = ReadingHistory.builder()
                .id(UUID.randomUUID())
                .userId(userId)
                .dailyReadingId(readingId)
                .readAt(LocalDateTime.now())
                .build();

        return dailyReadingRepository.saveHistory(history);
    }

    @Override
    @Transactional
    public ReadingHistory saveReflection(UUID userId, UUID readingId, String reflection) {
        log.info("Usuario {} guardando reflexión para lectura {}", userId, readingId);

        // Buscar o crear historial
        ReadingHistory history = dailyReadingRepository
                .findHistoryByUserAndReading(userId, readingId)
                .orElseGet(() -> {
                    // Crear nuevo registro si no existe
                    return dailyReadingRepository.saveHistory(
                            ReadingHistory.builder()
                                    .id(UUID.randomUUID())
                                    .userId(userId)
                                    .dailyReadingId(readingId)
                                    .readAt(LocalDateTime.now())
                                    .build()
                    );
                });

        // Actualizar con la reflexión
        ReadingHistory updated = history.withReflection(reflection);
        return dailyReadingRepository.updateHistory(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReadingHistoryDetail> getUserReadingHistory(UUID userId) {
        log.debug("Obteniendo historial de lecturas para usuario: {}", userId);

        List<ReadingHistory> histories = dailyReadingRepository.findHistoryByUserId(userId);

        return histories.stream()
                .map(history -> {
                    // Obtener la lectura asociada
                    // En una implementación real, esto debería optimizarse con un JOIN
                    DailyReading reading = null; // Se obtendría de la BD
                    return new ReadingHistoryDetail(
                            reading,
                            history,
                            history.hasReflection()
                    );
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReadingHistoryDetail> getUserReadingHistoryByMonth(UUID userId, int year, int month) {
        log.debug("Obteniendo historial del mes {}/{} para usuario: {}", month, year, userId);

        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.plusMonths(1).minusDays(1);

        List<ReadingHistory> histories = dailyReadingRepository
                .findHistoryByUserIdAndDateRange(userId, startDate, endDate);

        return histories.stream()
                .map(history -> new ReadingHistoryDetail(null, history, history.hasReflection()))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasReadToday(UUID userId) {
        log.debug("Verificando si usuario {} ha leído hoy", userId);

        return dailyReadingRepository.findByDate(LocalDate.now())
                .map(reading -> dailyReadingRepository.hasUserReadToday(userId, reading.getId()))
                .orElse(false);
    }

    @Override
    @Transactional
    public DailyReading saveDailyReading(DailyReading dailyReading) {
        log.info("CMS: Guardando lectura litúrgica para fecha {}", dailyReading.getDate());
        // Si el id es nulo, asignamos uno aleatorio
        if (dailyReading.getId() == null) {
            dailyReading = baseReadingWithGeneratedId(dailyReading);
        }
        return dailyReadingRepository.save(dailyReading);
    }

    private DailyReading baseReadingWithGeneratedId(DailyReading reading) {
        return DailyReading.builder()
                .id(UUID.randomUUID())
                .date(reading.getDate())
                .title(reading.getTitle())
                .badge(reading.getBadge())
                .imageUrl(reading.getImageUrl())
                .bookId(reading.getBookId())
                .bookName(reading.getBookName())
                .chapterNumber(reading.getChapterNumber())
                .verseNumbers(reading.getVerseNumbers())
                .readingText(reading.getReadingText())
                .officialReflection(reading.getOfficialReflection())
                .build();
    }

    @Override
    @Transactional
    public void deleteDailyReadingByDate(LocalDate date) {
        log.info("CMS: Eliminando lectura litúrgica de fecha {}", date);
        dailyReadingRepository.findByDate(date).ifPresent(reading -> {
            dailyReadingRepository.delete(reading.getId());
        });
    }
}

