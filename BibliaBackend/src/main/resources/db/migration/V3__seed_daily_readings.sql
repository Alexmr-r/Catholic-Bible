-- =====================================================
-- V3: Insertar lecturas diarias para 2026
-- =====================================================
-- Script que selecciona versículos ALEATORIOS de TODA la Biblia
-- Un versículo diferente por día del año
-- SIN reflexión oficial (el usuario escribe su propia reflexión)

-- Primero, crear una tabla temporal con versículos aleatorios
CREATE TEMP TABLE temp_random_verses AS
SELECT
  b.id as book_id,
  b.name as book_name,
  b.testament,
  c.chapter_number,
  v.verse_number,
  v.text as verse_text,
  CASE
    WHEN b.id IN ('matthew', 'mark', 'luke', 'john') THEN 'EVANGELIO'
    WHEN b.id = 'psalms' THEN 'SALMO'
    WHEN b.testament = 'old' THEN 'ANTIGUO TESTAMENTO'
    WHEN b.testament = 'new' THEN 'NUEVO TESTAMENTO'
    ELSE 'LECTURA'
  END as badge
FROM verses v
JOIN sections s ON v.section_id = s.id
JOIN chapters c ON s.chapter_id = c.id
JOIN books b ON c.book_id = b.id
WHERE v.text IS NOT NULL
  AND LENGTH(v.text) > 50
ORDER BY RANDOM()
LIMIT 365;

-- Ahora insertar en daily_readings con fechas secuenciales
INSERT INTO daily_readings (id, date, title, badge, image_url, book_id, book_name, chapter_number, verse_numbers, reading_text, official_reflection)
SELECT
  gen_random_uuid(),
  DATE '2026-01-01' + (ROW_NUMBER() OVER () - 1) * INTERVAL '1 day',
  CONCAT(book_name, ' ', chapter_number, ':', verse_number),
  badge,
  NULL,
  book_id,
  book_name,
  chapter_number,
  ARRAY[verse_number],
  verse_text,
  NULL
FROM temp_random_verses;

-- Limpiar tabla temporal
DROP TABLE temp_random_verses;

