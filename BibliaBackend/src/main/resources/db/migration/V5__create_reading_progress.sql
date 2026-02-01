-- =====================================================
-- V5: Crear tabla de progreso de lecturas (Reading Progress)
-- =====================================================
-- Tabla para almacenar qué días el usuario ha completado su lectura diaria
-- Permite mostrar calendario de constancia visual

CREATE TABLE IF NOT EXISTS reading_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    daily_reading_id UUID REFERENCES daily_readings(id) ON DELETE SET NULL,
    completed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Índices para consultas rápidas
    CONSTRAINT reading_progress_user_date_unique UNIQUE (user_id, date)
);

-- Índice para consultas por usuario y fecha
CREATE INDEX IF NOT EXISTS idx_reading_progress_user_date
ON reading_progress(user_id, date DESC);

-- Índice para consultas por mes (para calendario)
CREATE INDEX IF NOT EXISTS idx_reading_progress_user_month
ON reading_progress(user_id, EXTRACT(YEAR FROM date), EXTRACT(MONTH FROM date));

-- Comentarios
COMMENT ON TABLE reading_progress IS 'Registro de lecturas diarias completadas por usuario';
COMMENT ON COLUMN reading_progress.user_id IS 'Usuario que completó la lectura';
COMMENT ON COLUMN reading_progress.date IS 'Fecha de la lectura completada (sin hora)';
COMMENT ON COLUMN reading_progress.daily_reading_id IS 'Referencia a la lectura diaria (puede ser NULL si se eliminó)';
COMMENT ON COLUMN reading_progress.completed_at IS 'Timestamp exacto de cuando se marcó como completada';
