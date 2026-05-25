package com.bibliacatolica.api.domain.port.out;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Puerto de salida para persistencia de registros de prueba (trials)
 * Este registro persiste incluso si el usuario es eliminado.
 */
public interface UserTrialRepositoryPort {
    
    /**
     * Obtiene la fecha de inicio de prueba para un email dado
     */
    Optional<LocalDateTime> findTrialStartDateByEmail(String email);

    /**
     * Guarda un nuevo registro de inicio de prueba
     */
    void saveTrialStart(String email, LocalDateTime startDate);
}
