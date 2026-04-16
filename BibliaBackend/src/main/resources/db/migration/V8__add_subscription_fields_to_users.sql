-- =====================================================
-- V8: Add subscription and trial fields to users table
-- =====================================================

ALTER TABLE users 
ADD COLUMN is_premium BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN trial_start_date TIMESTAMP,
ADD COLUMN subscription_end_date TIMESTAMP,
ADD COLUMN revenuecat_user_id VARCHAR(255) UNIQUE;

-- Asignar a todos los usuarios existentes un trial_start_date (7 dias desde hoy)
UPDATE users SET trial_start_date = CURRENT_TIMESTAMP WHERE trial_start_date IS NULL;
