-- =====================================================
-- V10: Add auth provider to users table
-- =====================================================

ALTER TABLE users 
ADD COLUMN provider VARCHAR(20) NOT NULL DEFAULT 'LOCAL';

-- Marcar como GOOGLE a los que tienen un password hash generado aleatoriamente (estimación)
-- O mejor, dejarlo en LOCAL por defecto y que se actualice en el próximo login social.
-- Pero para los nuevos, ya será preciso.
