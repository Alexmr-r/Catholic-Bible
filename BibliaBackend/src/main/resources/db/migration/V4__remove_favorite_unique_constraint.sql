-- Migración V4: Eliminar constraint único de favoritos
-- Permite que un usuario tenga múltiples favoritos del mismo versículo inicial
-- con diferentes rangos (ej: Génesis 1:1 Y Génesis 1:1-5)

-- El constraint único ya fue eliminado manualmente
-- Esta migración solo registra el cambio en el historial de Flyway

-- Verificar que el constraint no existe (debe devolver 0)
SELECT COUNT(*) FROM pg_constraint
WHERE conname = 'favorites_user_id_book_id_chapter_number_verse_number_key';

-- Comentario explicativo
COMMENT ON TABLE favorites IS 'Tabla de favoritos. Permite múltiples favoritos del mismo versículo con diferentes tags/rangos.';



