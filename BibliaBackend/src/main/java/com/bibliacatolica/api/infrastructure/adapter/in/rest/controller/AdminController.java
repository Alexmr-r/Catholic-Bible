package com.bibliacatolica.api.infrastructure.adapter.in.rest.controller;

import com.bibliacatolica.api.domain.model.DailyReading;
import com.bibliacatolica.api.domain.model.User;
import com.bibliacatolica.api.domain.model.Verse;
import com.bibliacatolica.api.domain.port.in.BibleUseCase;
import com.bibliacatolica.api.domain.port.in.DailyReadingUseCase;
import com.bibliacatolica.api.domain.port.out.UserRepositoryPort;
import com.bibliacatolica.api.domain.exception.ResourceNotFoundException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Controlador administrativo (Backoffice / CMS) para CatholicVerse
 */
@Slf4j
@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
@Tag(name = "Administración", description = "Endpoints de gestión teológica (CMS) y de suscripción para el panel de administración")
public class AdminController {

    private final UserRepositoryPort userRepository;
    private final DailyReadingUseCase dailyReadingUseCase;
    private final BibleUseCase bibleUseCase;
    private final com.bibliacatolica.api.domain.port.out.DailyReadingRepositoryPort dailyReadingRepositoryPort;

    // ========== GESTIÓN DE USUARIOS & CRM ==========

    @GetMapping("/users")
    @Operation(summary = "Listar todos los usuarios", description = "Obtiene la lista completa de usuarios registrados para el panel CRM.")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        log.info("Admin Portal: Solicitando lista completa de usuarios");
        List<UserDto> users = userRepository.findAll().stream()
                .map(u -> new UserDto(
                        u.getId().toString(),
                        u.getFullName(),
                        u.getEmail(),
                        u.isPremium() ? "Premium" : "Free",
                        u.getCreatedAt() != null ? u.getCreatedAt().toLocalDate().toString() : "2025-10-12",
                        "Today"
                ))
                .toList();
        return ResponseEntity.ok(users);
    }

    @PutMapping("/users/{userId}/plan")
    @Operation(summary = "Actualizar plan de suscripción", description = "Modifica manualmente el plan del usuario (Premium o Free) sin pasar por pasarela de pago.")
    public ResponseEntity<Void> updateUserPlan(
            @PathVariable UUID userId,
            @RequestBody UpdatePlanRequest request) {
        log.info("Admin Portal: Modificando plan de usuario {} a {}", userId, request.plan());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", userId.toString()));
        
        User updatedUser = user.withPremium("Premium".equalsIgnoreCase(request.plan()));
        userRepository.update(updatedUser);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/users/{userId}")
    @Operation(summary = "Cumplimiento de Privacidad (GDPR)", description = "Elimina permanentemente a un usuario y todos sus datos teológicos/perfil de la base de datos.")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID userId) {
        log.warn("Admin Portal: Ejecutando borrado GDPR destructivo para usuario: {}", userId);
        userRepository.deleteById(userId);
        return ResponseEntity.noContent().build();
    }

    // ========== GESTIÓN DE LECTURAS LITÚRGICAS (CMS) ==========

    @GetMapping("/daily-readings")
    @Operation(summary = "Listar lecturas litúrgicas", description = "Obtiene todas las lecturas litúrgicas programadas en el CMS.")
    public ResponseEntity<List<DailyReading>> getScheduledReadings() {
        log.info("Admin Portal: Listando lecturas litúrgicas para el CMS");
        return ResponseEntity.ok(dailyReadingRepositoryPort.findAll());
    }

    @PostMapping("/daily-readings")
    @Operation(summary = "Guardar/Programar lectura litúrgica", description = "Crea o actualiza una lectura asignada a una fecha litúrgica específica.")
    public ResponseEntity<DailyReading> saveDailyReading(@RequestBody SaveReadingRequest request) {
        log.info("Admin Portal: Guardando lectura para la fecha {}", request.date());
        
        DailyReading reading = DailyReading.builder()
                .date(LocalDate.parse(request.date()))
                .title(request.title())
                .badge(request.badge())
                .imageUrl(request.imageUrl() != null ? request.imageUrl() : "https://images.unsplash.com/photo-1544427920-c49ccfb85579")
                .bookId(request.bookId())
                .bookName(request.bookName())
                .chapterNumber(request.chapterNumber())
                .verseNumbers(request.verseNumbers())
                .readingText(request.readingText())
                .officialReflection(request.officialReflection())
                .build();
                
        DailyReading saved = dailyReadingUseCase.saveDailyReading(reading);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/daily-readings/{date}")
    @Operation(summary = "Eliminar lectura litúrgica", description = "Elimina la lectura litúrgica de una fecha específica del calendario.")
    public ResponseEntity<Void> deleteDailyReading(@PathVariable String date) {
        log.info("Admin Portal: Borrando lectura litúrgica del día: {}", date);
        dailyReadingUseCase.deleteDailyReadingByDate(LocalDate.parse(date));
        return ResponseEntity.noContent().build();
    }

    // ========== CMS DE CONTENIDO BÍBLICO (Edición de Erratas) ==========

    @PutMapping("/bible/verses")
    @Operation(summary = "Corregir errata en versículo", description = "Modifica directamente el texto de un versículo en PostgreSQL sin recurrir a scripts Flyway.")
    public ResponseEntity<VerseDto> updateVerseText(@RequestBody UpdateVerseRequest request) {
        log.info("Admin Portal: CMS corrigiendo errata en {}.{}:{}", request.bookId(), request.chapterNumber(), request.verseNumber());
        Verse updated = bibleUseCase.updateVerseText(
                request.bookId(),
                request.chapterNumber(),
                request.verseNumber(),
                request.text()
        );
        return ResponseEntity.ok(new VerseDto(updated.getVerseNumber(), updated.getText()));
    }

    // ========== DTOs LOCALES PARA API ==========

    public record UserDto(String id, String name, String email, String plan, String joined, String lastLogin) {}
    public record UpdatePlanRequest(String plan) {}
    public record SaveReadingRequest(
            String date,
            String title,
            String badge,
            String imageUrl,
            String bookId,
            String bookName,
            int chapterNumber,
            List<Integer> verseNumbers,
            String readingText,
            String officialReflection
    ) {}
    public record UpdateVerseRequest(
            String bookId,
            int chapterNumber,
            int verseNumber,
            String text
    ) {}
    public record VerseDto(int verseNumber, String text) {}
}
