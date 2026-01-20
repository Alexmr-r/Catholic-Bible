-- =====================================================
-- V1: Esquema inicial de la base de datos Biblia Católica
-- =====================================================

-- Tabla de usuarios
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email_verified BOOLEAN NOT NULL DEFAULT false,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- Tabla de libros de la Biblia
CREATE TABLE books (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    abbreviation VARCHAR(10) NOT NULL,
    testament VARCHAR(10) NOT NULL CHECK (testament IN ('old', 'new')),
    category VARCHAR(50) NOT NULL,
    total_chapters INTEGER NOT NULL,
    order_index INTEGER NOT NULL,
    description TEXT,
    author VARCHAR(100),
    historical_context TEXT
);

CREATE INDEX idx_books_testament ON books(testament);
CREATE INDEX idx_books_order ON books(order_index);

-- Tabla de capítulos
CREATE TABLE chapters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id VARCHAR(50) NOT NULL REFERENCES books(id),
    chapter_number INTEGER NOT NULL,
    version VARCHAR(50) NOT NULL DEFAULT 'Biblia de Jerusalén',
    UNIQUE(book_id, chapter_number, version)
);

CREATE INDEX idx_chapters_book ON chapters(book_id);

-- Tabla de secciones (subdividen los capítulos)
CREATE TABLE sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    order_index INTEGER NOT NULL
);

CREATE INDEX idx_sections_chapter ON sections(chapter_id);

-- Tabla de versículos
CREATE TABLE verses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    verse_number INTEGER NOT NULL,
    text TEXT NOT NULL,
    has_note BOOLEAN NOT NULL DEFAULT false,
    note_text TEXT
);

CREATE INDEX idx_verses_section ON verses(section_id);
CREATE INDEX idx_verses_text ON verses USING gin(to_tsvector('spanish', text));

-- Tabla de favoritos
CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    book_id VARCHAR(50) NOT NULL REFERENCES books(id),
    book_name VARCHAR(100) NOT NULL,
    chapter_number INTEGER NOT NULL,
    verse_number INTEGER NOT NULL,
    verse_text TEXT NOT NULL,
    tags TEXT[],
    note TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, book_id, chapter_number, verse_number)
);

CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_favorites_book ON favorites(book_id);

-- Tabla de resaltados
CREATE TABLE highlights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    book_id VARCHAR(50) NOT NULL REFERENCES books(id),
    chapter_number INTEGER NOT NULL,
    verse_number INTEGER NOT NULL,
    color VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, book_id, chapter_number, verse_number)
);

CREATE INDEX idx_highlights_user ON highlights(user_id);
CREATE INDEX idx_highlights_chapter ON highlights(user_id, book_id, chapter_number);

-- Tabla de escritos/reflexiones
CREATE TABLE writings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    verse_reference JSONB,
    tags TEXT[],
    is_favorite BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_writings_user ON writings(user_id);
CREATE INDEX idx_writings_favorite ON writings(user_id, is_favorite);

-- Tabla de lecturas diarias
CREATE TABLE daily_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    badge VARCHAR(50) NOT NULL,
    image_url TEXT,
    book_id VARCHAR(50) NOT NULL REFERENCES books(id),
    book_name VARCHAR(100) NOT NULL,
    chapter_number INTEGER NOT NULL,
    verse_numbers INTEGER[],
    reading_text TEXT NOT NULL,
    official_reflection TEXT
);

CREATE INDEX idx_daily_readings_date ON daily_readings(date);

-- Tabla de historial de lectura
CREATE TABLE reading_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    daily_reading_id UUID NOT NULL REFERENCES daily_readings(id) ON DELETE CASCADE,
    user_reflection TEXT,
    read_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, daily_reading_id)
);

CREATE INDEX idx_reading_history_user ON reading_history(user_id);

-- Tabla de progreso del usuario
CREATE TABLE user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    book_id VARCHAR(50) NOT NULL REFERENCES books(id),
    chapter_number INTEGER NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT false,
    last_read_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, book_id, chapter_number)
);

CREATE INDEX idx_user_progress_user ON user_progress(user_id);

-- Tabla de historial de búsquedas
CREATE TABLE search_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    results_count INTEGER,
    searched_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_search_history_user ON search_history(user_id);

