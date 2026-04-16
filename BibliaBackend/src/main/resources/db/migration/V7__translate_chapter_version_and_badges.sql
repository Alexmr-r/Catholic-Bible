-- Translate chapter version
UPDATE chapters 
SET version = 'Jerusalem Bible' 
WHERE version = 'Biblia de Jerusalén';

-- Translate daily reading badges
UPDATE daily_readings SET badge = 'GOSPEL' WHERE badge = 'EVANGELIO';
UPDATE daily_readings SET badge = 'PSALM' WHERE badge = 'SALMO';
UPDATE daily_readings SET badge = 'OLD TESTAMENT' WHERE badge = 'ANTIGUO TESTAMENTO';
UPDATE daily_readings SET badge = 'NEW TESTAMENT' WHERE badge = 'NUEVO TESTAMENTO';
UPDATE daily_readings SET badge = 'READING' WHERE badge = 'LECTURA';
