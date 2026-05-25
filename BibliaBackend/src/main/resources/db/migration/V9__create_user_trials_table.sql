-- =====================================================
-- V9: Create user_trials table to persist trial info
-- =====================================================

CREATE TABLE user_trials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    trial_start_date TIMESTAMP NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_trials_email ON user_trials(email);

-- Migrar fechas existentes de la tabla users a user_trials
INSERT INTO user_trials (email, trial_start_date)
SELECT email, trial_start_date 
FROM users 
WHERE trial_start_date IS NOT NULL
ON CONFLICT (email) DO NOTHING;
