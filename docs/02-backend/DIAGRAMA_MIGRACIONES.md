# 🎨 Diagrama Visual: Flyway y Migraciones

> ⚠️ **Nota de contexto (junio 2026):** este documento didáctico se escribió en la fase inicial del proyecto (migraciones V1–V3, Biblia de Jerusalén en español). **Los conceptos siguen siendo válidos**, pero el estado actual es: migraciones **V1–V11**, contenido bíblico **CPDV en inglés** (V6), 10 controladores REST y nuevas tablas (trials, progreso, suscripciones). El estado real verificado está en `DOCUMENTACION_MAESTRA_2026.md`.

## 📊 Qué hace cada archivo

```
┌─────────────────────────────────────────────────────────────────┐
│                         ARQUITECTURA                             │
└─────────────────────────────────────────────────────────────────┘

📁 BibliaBackend/
│
├── 🐳 docker-compose.yml
│   └──> Define 3 servicios:
│       ├── postgres    (Base de datos)
│       ├── api         (Tu aplicación)
│       └── pgadmin     (Interfaz web)
│
├── 🐳 Dockerfile
│   └──> Cómo construir la imagen de tu API
│
├── 📂 src/main/resources/
│   │
│   ├── ⚙️ application.yml
│   │   └──> Configuración de Spring Boot
│   │       ├── Profile: dev    → localhost:5432
│   │       ├── Profile: docker → postgres:5432
│   │       └── Flyway enabled: true
│   │
│   └── 📂 db/migration/          ← AQUÍ VIVEN LOS SQL
│       ├── V1__initial_schema.sql
│       ├── V2__seed_books.sql
│       └── V3__seed_sample_data.sql
│
└── 📂 scripts/
    ├── 🐍 import_bible_data.py   ← Script manual
    └── 📜 run_import.sh


┌─────────────────────────────────────────────────────────────────┐
│                    FLUJO DE EJECUCIÓN                            │
└─────────────────────────────────────────────────────────────────┘

                docker-compose up
                        ↓
        ┌───────────────┴───────────────┐
        ↓                               ↓
   [POSTGRES]                        [API]
   Servicio 1                     Servicio 2
        │                               │
        │ 1. Inicia PostgreSQL          │
        │ 2. Crea biblia_db            │
        │ 3. Healthcheck OK ✅          │
        │                               │
        │                               │ 4. Espera healthcheck
        │                               │ 5. Compila código
        │                               │ 6. Spring Boot inicia
        │                               ↓
        │                         [FLYWAY AUTO]
        │                               │
        │ ←─────────────────────────────┤ 7. Conecta a postgres:5432
        │                               │
        │ ←─────────────────────────────┤ 8. ¿Existe flyway_schema_history?
        │ NO                            │
        ├──────────────────────────────→│ 9. Crear tabla
        │                               │
        │ ←─────────────────────────────┤ 10. Leer db/migration/
        │                               │     Encuentra:
        │                               │     - V1__initial_schema.sql
        │                               │     - V2__seed_books.sql
        │                               │     - V3__seed_sample_data.sql
        │                               │
        │ ←─────────────────────────────┤ 11. Ejecutar V1
        │ CREATE TABLE users;           │
        │ CREATE TABLE books;           │
        │ CREATE TABLE chapters;        │
        │ ... (12 tablas)               │
        │                               │
        │ ←─────────────────────────────┤ 12. Registrar V1 en historial
        │ INSERT INTO                   │
        │ flyway_schema_history         │
        │                               │
        │ ←─────────────────────────────┤ 13. Ejecutar V2
        │ INSERT INTO books             │
        │ (73 libros)                   │
        │                               │
        │ ←─────────────────────────────┤ 14. Registrar V2
        │                               │
        │ ←─────────────────────────────┤ 15. Ejecutar V3
        │ INSERT INTO chapters          │
        │ INSERT INTO verses            │
        │ (datos de ejemplo)            │
        │                               │
        │ ←─────────────────────────────┤ 16. Registrar V3
        │                               │
        │                               ↓
        │                          [API LISTA]
        │                          ✅ puerto 8080
        │
        ↓
   [POSTGRES LISTO]
   ✅ puerto 5432


┌─────────────────────────────────────────────────────────────────┐
│              CONTENIDO DE CADA MIGRACIÓN                         │
└─────────────────────────────────────────────────────────────────┘

📄 V1__initial_schema.sql (172 líneas)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ¿Qué hace?     → Crea la ESTRUCTURA de la base de datos
  ¿Cuándo?       → Primera vez que levantas Docker
  ¿Se repite?    → NO (Flyway lo sabe)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255),
    password_hash VARCHAR(255),
    ...
  );

  CREATE TABLE books (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100),
    testament VARCHAR(10),
    ...
  );

  CREATE TABLE chapters (
    id UUID PRIMARY KEY,
    book_id VARCHAR(50) REFERENCES books(id),
    chapter_number INTEGER,
    ...
  );

  CREATE TABLE sections (
    id UUID PRIMARY KEY,
    chapter_id UUID REFERENCES chapters(id),
    ...
  );

  CREATE TABLE verses (
    id UUID PRIMARY KEY,
    section_id UUID REFERENCES sections(id),
    verse_number INTEGER,
    text TEXT,
    ...
  );

  ... (7 tablas más)


📄 V2__seed_books.sql (119 líneas)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ¿Qué hace?     → Inserta los 73 LIBROS de la Biblia
  ¿Cuándo?       → Inmediatamente después de V1
  ¿Se repite?    → NO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  -- ANTIGUO TESTAMENTO (46 libros)
  INSERT INTO books VALUES
    ('genesis', 'Génesis', 'Gn', 'old', 'Pentateuco', 50, ...),
    ('exodus', 'Éxodo', 'Ex', 'old', 'Pentateuco', 40, ...),
    ('leviticus', 'Levítico', 'Lv', 'old', 'Pentateuco', 27, ...),
    ...
    ('malachi', 'Malaquías', 'Ml', 'old', 'Profetas Menores', 3, ...),

  -- NUEVO TESTAMENTO (27 libros)
    ('matthew', 'San Mateo', 'Mt', 'new', 'Evangelios', 28, ...),
    ('mark', 'San Marcos', 'Mc', 'new', 'Evangelios', 16, ...),
    ...
    ('revelation', 'Apocalipsis', 'Ap', 'new', 'Profético', 22, ...);

  📊 Total: 73 filas en tabla books


📄 V3__seed_sample_data.sql (92 líneas)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ¿Qué hace?     → Inserta DATOS DE PRUEBA
  ¿Cuándo?       → Inmediatamente después de V2
  ¿Se repite?    → NO
  ¿Es completo?  → NO, solo 2 capítulos de ejemplo
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  -- Mateo Capítulo 1
  INSERT INTO chapters VALUES
    ('550e8400-...', 'matthew', 1, 'Biblia de Jerusalén');

  INSERT INTO sections VALUES
    ('550e8400-...', 'chapter_id', 'Genealogía de Jesús', 1);

  INSERT INTO verses VALUES
    (..., 1, 'Libro de la generación de Jesucristo...'),
    (..., 2, 'Abraham engendró a Isaac...'),
    ... (25 versículos)

  -- Génesis Capítulo 1
  INSERT INTO chapters VALUES
    ('550e8400-...', 'genesis', 1, 'Biblia de Jerusalén');

  INSERT INTO verses VALUES
    (..., 1, 'En el principio creó Dios...'),
    (..., 2, 'Y la tierra estaba desordenada...'),
    ... (8 versículos)

  -- Una lectura diaria de ejemplo
  INSERT INTO daily_readings VALUES (...);

  📊 Total:
     - 2 capítulos
     - 2 secciones
     - 33 versículos
     - 1 lectura diaria


🐍 import_bible_data.py (273 líneas)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ¿Qué hace?     → Inserta TODA LA BIBLIA completa
  ¿Cuándo?       → TÚ lo ejecutas manualmente
  ¿Se repite?    → Puedes ejecutarlo cuantas veces quieras
  ¿Es completo?  → SÍ, todos los versículos
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  1. Lee: bible_raw.json
     {
       "translation": "Biblia de Jerusalén",
       "books": [
         {
           "name": "Genesis",
           "chapters": [
             {
               "chapter": 1,
               "verses": [
                 {"verse": 1, "text": "En el principio..."},
                 {"verse": 2, "text": "Y la tierra..."},
                 ...
               ]
             },
             ...
           ]
         },
         ...
       ]
     }

  2. Limpia datos existentes:
     DELETE FROM verses;
     DELETE FROM sections;
     DELETE FROM chapters;

  3. Para cada libro (73 libros):
     Para cada capítulo (~1,189 capítulos):
       INSERT INTO chapters ...
       INSERT INTO sections ...
       Para cada versículo (~31,102 versículos):
         INSERT INTO verses ...

  4. Usa batch inserts (rápido)

  📊 Total:
     - 73 libros (ya existían en V2)
     - 1,189 capítulos
     - 1,189 secciones
     - 31,102 versículos


┌─────────────────────────────────────────────────────────────────┐
│                 ESTADO DE LA BASE DE DATOS                       │
└─────────────────────────────────────────────────────────────────┘

🔵 DESPUÉS DE FLYWAY (V1 + V2 + V3):
┌──────────────────────────────────────┐
│ books           → 73 filas           │  ✅ COMPLETO
│ chapters        → 2 filas            │  ⚠️ Solo ejemplo
│ sections        → 2 filas            │  ⚠️ Solo ejemplo
│ verses          → 33 filas           │  ⚠️ Solo ejemplo
│ users           → 0 filas            │  ⚠️ Vacía
│ favorites       → 0 filas            │  ⚠️ Vacía
│ daily_readings  → 1 fila             │  ⚠️ Solo ejemplo
│ ...                                  │
└──────────────────────────────────────┘

🟢 DESPUÉS DEL SCRIPT PYTHON:
┌──────────────────────────────────────┐
│ books           → 73 filas           │  ✅ COMPLETO
│ chapters        → 1,189 filas        │  ✅ COMPLETO
│ sections        → 1,189 filas        │  ✅ COMPLETO
│ verses          → 31,102 filas       │  ✅ COMPLETO
│ users           → 0 filas            │  ⚠️ Vacía
│ favorites       → 0 filas            │  ⚠️ Vacía
│ daily_readings  → 1 fila             │  ⚠️ Solo ejemplo
│ ...                                  │
└──────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                     TABLA DE CONTROL                             │
└─────────────────────────────────────────────────────────────────┘

Flyway crea esta tabla automáticamente:

┌─────────────────────────────────────────────────────────────────┐
│ flyway_schema_history                                            │
├─────────────────────────────────────────────────────────────────┤
│ installed_rank │ version │ description     │ script           │  │
├────────────────┼─────────┼─────────────────┼──────────────────┤  │
│       1        │    1    │ initial schema  │ V1__initial_...  │  │
│       2        │    2    │ seed books      │ V2__seed_books.. │  │
│       3        │    3    │ seed sample data│ V3__seed_sample..│  │
└─────────────────────────────────────────────────────────────────┘

  ¿Para qué sirve?
  ✅ Flyway sabe qué scripts ya ejecutó
  ✅ NO ejecuta el mismo script dos veces
  ✅ Si añades V4, solo ejecuta V4


┌─────────────────────────────────────────────────────────────────┐
│                    COMANDOS PRÁCTICOS                            │
└─────────────────────────────────────────────────────────────────┘

# Ver estado de las migraciones
docker-compose exec api sh
psql -h postgres -U biblia_user -d biblia_db
SELECT * FROM flyway_schema_history;
\q
exit

# Contar datos
docker-compose exec postgres psql -U biblia_user -d biblia_db -c "
  SELECT 'books' as tabla, COUNT(*) FROM books
  UNION ALL
  SELECT 'chapters', COUNT(*) FROM chapters
  UNION ALL
  SELECT 'verses', COUNT(*) FROM verses;
"

# Ver logs de Flyway
docker-compose logs api | grep -i flyway

# Ejecutar script Python
cd BibliaBackend/scripts
python3 import_bible_data.py


┌─────────────────────────────────────────────────────────────────┐
│                      PREGUNTAS FRECUENTES                        │
└─────────────────────────────────────────────────────────────────┘

❓ ¿Puedo modificar V2__seed_books.sql después de ejecutarlo?
❌ NO. Flyway detecta el cambio y falla. Solución:
   - Borra todo: docker-compose down -v
   - Modifica V2
   - Levanta de nuevo: docker-compose up

❓ ¿Cómo añado más datos iniciales?
✅ Crea V4__mi_nueva_migracion.sql
   docker-compose restart api
   (Se ejecuta automáticamente)

❓ ¿El script Python borra los libros?
❌ NO. Solo borra chapters, sections y verses.
   Los libros (de V2) permanecen intactos.

❓ ¿Puedo ejecutar el script Python varias veces?
✅ SÍ. Limpia y reimporta todo cada vez.

❓ ¿Flyway se ejecuta cada vez que levanto Docker?
✅ SÍ, pero no hace nada si ya ejecutó las migraciones.
   Solo ejecuta las nuevas (V4, V5, etc.)

