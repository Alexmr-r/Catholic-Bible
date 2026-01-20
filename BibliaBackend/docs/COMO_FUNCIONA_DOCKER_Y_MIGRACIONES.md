# 🔄 Cómo Funciona Docker, Recompilación y Migraciones

## 📋 Índice
1. [¿Cuándo se recompila tu API en Docker?](#cuándo-se-recompila-tu-api-en-docker)
2. [¿Qué pasa con la base de datos cuando Docker está corriendo?](#qué-pasa-con-la-base-de-datos)
3. [¿Qué mete el script Python exactamente?](#qué-mete-el-script-python)
4. [¿Dónde se ejecutan los archivos SQL?](#dónde-se-ejecutan-los-archivos-sql)
5. [Flyway: El sistema de migraciones](#flyway-el-sistema-de-migraciones)
6. [Flujo completo explicado](#flujo-completo-explicado)

---

## 🔨 ¿Cuándo se recompila tu API en Docker?

### ❌ Docker NO recompila automáticamente

**Respuesta directa:** Docker **NO** detecta cambios automáticamente. Es como una foto: una vez que construyes la imagen, queda congelada.

### 🔄 ¿Cuándo SÍ se recompila?

#### Caso 1: Primera vez
```bash
docker-compose up
```
**¿Qué pasa?**
```
1. Docker ve que no existe la imagen "biblia-api"
2. Lee el Dockerfile
3. Compila tu código (mvnw package)
4. Crea la imagen
5. Levanta el contenedor
```

#### Caso 2: Hiciste cambios en el código
```bash
# Opción A: Reconstruir y levantar
docker-compose up --build

# Opción B: Solo reconstruir
docker-compose build api
docker-compose up

# Opción C: Forzar desde cero (sin caché)
docker-compose build --no-cache api
docker-compose up
```

**¿Qué pasa?**
```
1. Docker ve tus cambios en src/
2. Recompila: mvnw package
3. Genera nuevo .jar
4. Crea nueva imagen
5. Destruye el contenedor viejo
6. Levanta contenedor nuevo con tu código actualizado
```

### ⚡ Workflow recomendado durante desarrollo

#### Opción 1: Desarrollo local (SIN Docker)
```bash
# Terminal 1: Levanta solo PostgreSQL
docker-compose up postgres

# Terminal 2: Ejecuta tu API localmente
cd BibliaBackend
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

**Ventajas:**
- ✅ Cambios instantáneos (Spring DevTools)
- ✅ No necesitas reconstruir imagen
- ✅ Más rápido para desarrollar
- ✅ Puedes usar hot-reload

**application.yml automáticamente usa:**
```yaml
# Profile: dev (local)
datasource:
  url: jdbc:postgresql://localhost:5432/biblia_db
```

#### Opción 2: Todo en Docker
```bash
# Cada vez que cambies código:
docker-compose up --build
```

**Ventajas:**
- ✅ Simula producción exacta
- ✅ Asegura que funciona en Docker

**Desventajas:**
- ❌ Lento (recompila cada vez)
- ❌ No hay hot-reload

### 📊 Comparación de tiempos

| Acción | Tiempo |
|--------|--------|
| Primera compilación Docker | 3-5 minutos |
| Recompilación (con caché) | 30-60 segundos |
| Recompilación (sin caché) | 3-5 minutos |
| API local (sin Docker) | 10-20 segundos |
| Hot-reload (Spring DevTools) | 2-5 segundos |

---

## 💾 ¿Qué pasa con la base de datos cuando Docker está corriendo?

### 🔒 La base de datos NO se borra

**Respuesta directa:** Los datos están en un **volumen persistente**. No se borran aunque pares Docker.

### 📦 Volumen de PostgreSQL

```yaml
# En docker-compose.yml
volumes:
  postgres_data:    # ← Aquí viven tus datos
    driver: local
```

**Ubicación real en tu Mac:**
```
/var/lib/docker/volumes/bibliabackend_postgres_data/_data
```

### 🔄 Comportamiento según comandos

#### 1. `docker-compose down`
```bash
docker-compose down
```
**¿Qué pasa?**
- ❌ Para los contenedores
- ❌ Elimina los contenedores
- ✅ **MANTIENE** el volumen postgres_data
- ✅ **MANTIENE** todos tus datos

**Resultado:** Cuando vuelvas a hacer `up`, tus datos siguen ahí.

#### 2. `docker-compose down -v` ⚠️ PELIGRO
```bash
docker-compose down -v
```
**¿Qué pasa?**
- ❌ Para los contenedores
- ❌ Elimina los contenedores
- ❌ **ELIMINA** el volumen postgres_data
- ❌ **PIERDES** todos tus datos

**Resultado:** Base de datos vacía. Flyway la recrea desde cero.

#### 3. `docker-compose restart`
```bash
docker-compose restart postgres
```
**¿Qué pasa?**
- 🔄 Reinicia el contenedor
- ✅ **MANTIENE** todos los datos
- ✅ No ejecuta migraciones de nuevo

### 🎯 Estados de la base de datos

```
┌──────────────────────────────────────────────┐
│           CICLO DE VIDA DE DATOS             │
├──────────────────────────────────────────────┤
│                                              │
│  1. docker-compose up (primera vez)         │
│     ├─ Crea volumen postgres_data           │
│     ├─ PostgreSQL se inicia vacío           │
│     ├─ API se conecta                       │
│     └─ Flyway ejecuta migraciones:          │
│        ├─ V1: Crea tablas                   │
│        ├─ V2: Inserta 73 libros             │
│        └─ V3: Inserta datos de ejemplo      │
│                                              │
│  2. docker-compose down                     │
│     ├─ Para contenedores                    │
│     └─ Volumen persiste ✅                  │
│                                              │
│  3. docker-compose up (segunda vez)         │
│     ├─ Usa volumen existente                │
│     ├─ Datos siguen ahí ✅                  │
│     └─ Flyway NO ejecuta migraciones        │
│        (ya están aplicadas)                 │
│                                              │
│  4. docker-compose down -v                  │
│     ├─ Para contenedores                    │
│     └─ ELIMINA volumen ❌                   │
│                                              │
│  5. docker-compose up (después de -v)       │
│     ├─ Crea nuevo volumen                   │
│     ├─ Base de datos vacía                  │
│     └─ Flyway ejecuta TODO de nuevo         │
│                                              │
└──────────────────────────────────────────────┘
```

### 🔍 Verificar estado de volúmenes

```bash
# Ver volúmenes
docker volume ls

# Ver detalles
docker volume inspect bibliabackend_postgres_data

# Ver espacio usado
docker system df -v
```

---

## 📝 ¿Qué mete el script Python exactamente?

### 🎯 Respuesta corta

El script Python mete **SOLO** capítulos y versículos. NO toca la tabla `books`.

### 📊 Comparación: ¿Qué hace cada cosa?

| Archivo | ¿Qué mete? | ¿Cuándo? |
|---------|------------|----------|
| **V1__initial_schema.sql** | Crea TODAS las tablas (estructura) | Automático con Docker |
| **V2__seed_books.sql** | Inserta 73 libros en tabla `books` | Automático con Docker |
| **V3__seed_sample_data.sql** | Inserta datos de PRUEBA (Mateo 1 + Génesis 1) | Automático con Docker |
| **import_bible_data.py** | Inserta TODOS los capítulos y versículos | MANUAL (tú lo ejecutas) |

### 🔍 Detalle del script Python

**Ubicación del script:**
```
/BibliaBackend/scripts/import_bible_data.py
```

**¿Qué hace EXACTAMENTE?**

```python
# 1. Lee el archivo bible_raw.json
json_file = '../BibliaAppExpo/bible_raw.json'

# 2. LIMPIA datos existentes (¡CUIDADO!)
DELETE FROM verses       # ← Borra todos los versículos
DELETE FROM sections     # ← Borra todas las secciones
DELETE FROM chapters     # ← Borra todos los capítulos
# ⚠️ NO toca la tabla books

# 3. Para cada libro en el JSON:
for book in bible_raw.json:
    # 3a. Busca el libro en la tabla books
    #     (debe existir gracias a V2__seed_books.sql)
    
    # 3b. Para cada capítulo:
    for chapter in book.chapters:
        # Inserta en tabla chapters
        INSERT INTO chapters (book_id, chapter_number, version)
        VALUES ('genesis', 1, 'Biblia de Jerusalén')
        
        # Crea una sección por capítulo
        INSERT INTO sections (chapter_id, title, order_index)
        VALUES (chapter_id, '', 1)
        
        # 3c. Para cada versículo:
        for verse in chapter.verses:
            # Inserta en tabla verses (batch de 100)
            INSERT INTO verses (section_id, verse_number, text)
            VALUES (section_id, 1, 'En el principio...')
```

### 📈 Estadísticas del script

**Datos que importa:**
```
✅ ~1,189 capítulos
✅ ~1,189 secciones (una por capítulo)
✅ ~31,102 versículos

❌ NO importa libros (ya están en V2)
❌ NO importa tablas (ya están en V1)
```

### 🎨 Ejemplo visual

```
ANTES de ejecutar el script:
┌─────────────────────────────────┐
│ books (73 filas)                │  ← V2__seed_books.sql
│   - genesis                     │
│   - exodus                      │
│   - matthew                     │
│   - ...                         │
├─────────────────────────────────┤
│ chapters (2 filas)              │  ← V3__seed_sample_data.sql
│   - matthew, capítulo 1         │
│   - genesis, capítulo 1         │
├─────────────────────────────────┤
│ sections (2 filas)              │
├─────────────────────────────────┤
│ verses (33 filas)               │
│   - Solo versículos de ejemplo  │
└─────────────────────────────────┘

DESPUÉS de ejecutar el script:
┌─────────────────────────────────┐
│ books (73 filas)                │  ← Igual, NO cambia
│   - genesis                     │
│   - exodus                      │
│   - matthew                     │
│   - ...                         │
├─────────────────────────────────┤
│ chapters (1,189 filas)          │  ← TODOS los capítulos
│   - genesis 1, 2, 3...50        │
│   - matthew 1, 2, 3...28        │
│   - ...                         │
├─────────────────────────────────┤
│ sections (1,189 filas)          │  ← Una por capítulo
├─────────────────────────────────┤
│ verses (31,102 filas)           │  ← TODOS los versículos
│   - Génesis 1:1                 │
│   - Génesis 1:2                 │
│   - ...                         │
│   - Apocalipsis 22:21           │
└─────────────────────────────────┘
```

### ⚠️ IMPORTANTE: El script BORRA datos antes de importar

```python
def clear_bible_data(conn):
    cursor.execute("DELETE FROM verses")
    cursor.execute("DELETE FROM sections")
    cursor.execute("DELETE FROM chapters")
```

**¿Por qué?** Para evitar duplicados si lo ejecutas varias veces.

---

## 🚀 ¿Dónde se ejecutan los archivos SQL?

### 🎯 Sistema Flyway

**Flyway** es como un "Git para bases de datos". Controla qué scripts SQL se han ejecutado.

### 📍 Ubicación de los archivos SQL

```
BibliaBackend/
└── src/
    └── main/
        └── resources/
            └── db/
                └── migration/        ← Aquí están los .sql
                    ├── V1__initial_schema.sql
                    ├── V2__seed_books.sql
                    └── V3__seed_sample_data.sql
```

### ⚙️ Configuración en application.yml

```yaml
spring:
  flyway:
    enabled: true                       # ← Flyway activado
    baseline-on-migrate: true
    locations: classpath:db/migration   # ← Busca aquí
```

### 🔄 ¿Cuándo se ejecutan?

```
1. docker-compose up
   ↓
2. Contenedor postgres inicia
   ↓
3. Healthcheck: ¿Postgres listo? → SÍ
   ↓
4. Contenedor api inicia
   ↓
5. Spring Boot arranca
   ↓
6. Flyway se activa automáticamente
   ↓
7. Flyway conecta a PostgreSQL
   ↓
8. Flyway crea tabla: flyway_schema_history
   ↓
9. Flyway revisa qué scripts faltan ejecutar
   ↓
10. Ejecuta scripts EN ORDEN:
    ├─ V1__initial_schema.sql    (crea tablas)
    ├─ V2__seed_books.sql        (inserta 73 libros)
    └─ V3__seed_sample_data.sql  (datos de ejemplo)
    ↓
11. Guarda en flyway_schema_history:
    ✅ V1 ejecutado el 2026-01-17
    ✅ V2 ejecutado el 2026-01-17
    ✅ V3 ejecutado el 2026-01-17
    ↓
12. API lista para recibir peticiones
```

### 📊 Tabla de control: flyway_schema_history

Flyway crea esta tabla automáticamente:

```sql
SELECT * FROM flyway_schema_history;
```

| installed_rank | version | description | type | script | checksum | installed_on | success |
|----------------|---------|-------------|------|--------|----------|--------------|---------|
| 1 | 1 | initial schema | SQL | V1__initial_schema.sql | 123456789 | 2026-01-17 10:00 | true |
| 2 | 2 | seed books | SQL | V2__seed_books.sql | 987654321 | 2026-01-17 10:00 | true |
| 3 | 3 | seed sample data | SQL | V3__seed_sample_data.sql | 456789123 | 2026-01-17 10:00 | true |

**¿Para qué sirve?**
- Flyway sabe qué ya ejecutó
- NO ejecuta el mismo script dos veces
- Si añades V4, solo ejecuta V4

### 🔐 Reglas de Flyway

#### ✅ Permitido
```
1. Añadir nuevas migraciones:
   V4__add_new_table.sql
   V5__add_column.sql

2. Levantar y bajar Docker:
   No ejecuta nada de nuevo
```

#### ❌ NO permitido
```
1. Modificar un script ya ejecutado:
   V2__seed_books.sql  ← Si lo cambias, Flyway falla

2. Cambiar el orden:
   Renombrar V2 a V4  ← Flyway se confunde
```

### 🛠️ ¿Cómo añadir nuevas migraciones?

```bash
# 1. Crea nuevo archivo
touch src/main/resources/db/migration/V4__add_daily_readings_index.sql

# 2. Escribe tu SQL
-- V4__add_daily_readings_index.sql
CREATE INDEX idx_daily_readings_book ON daily_readings(book_id);

# 3. Reinicia Docker (o solo la API)
docker-compose restart api

# 4. Flyway detecta V4 y lo ejecuta automáticamente
```

### 🔍 Ver logs de Flyway

```bash
# Ver logs de la API
docker-compose logs api

# Buscar líneas de Flyway
docker-compose logs api | grep Flyway
```

**Output esperado:**
```
INFO  Flyway Community Edition 10.10.0
INFO  Database: jdbc:postgresql://postgres:5432/biblia_db (PostgreSQL 16.1)
INFO  Successfully validated 3 migrations
INFO  Current version of schema "public": 3
INFO  Schema "public" is up to date. No migration necessary.
```

---

## 🎬 Flujo completo explicado

### 🚀 Primera vez que levantas Docker

```
PASO 1: docker-compose up
┌─────────────────────────────────────────────┐
│ Docker lee: docker-compose.yml             │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│ Servicio: postgres                          │
│ - Descarga imagen postgres:16-alpine       │
│ - Crea volumen: postgres_data              │
│ - Inicia PostgreSQL                        │
│ - Crea DB: biblia_db                       │
│ - Crea usuario: biblia_user                │
│ - Healthcheck: ✅ READY                    │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│ Servicio: api                               │
│ - Lee Dockerfile                            │
│ - Etapa Builder:                            │
│   ├─ Descarga dependencias Maven           │
│   └─ Compila: mvnw package                 │
│ - Etapa Runtime:                            │
│   └─ Copia el .jar                         │
│ - Crea imagen: biblia-api                  │
│ - Inicia contenedor                        │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│ Spring Boot arranca                         │
│ - Lee application.yml                       │
│ - Profile activo: docker                    │
│ - Conecta a: postgres:5432                 │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│ Flyway se activa                            │
│ - Conecta a PostgreSQL                     │
│ - Crea tabla: flyway_schema_history        │
│ - Busca archivos en: db/migration/         │
│ - Encuentra:                                │
│   ├─ V1__initial_schema.sql                │
│   ├─ V2__seed_books.sql                    │
│   └─ V3__seed_sample_data.sql              │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│ Flyway ejecuta V1__initial_schema.sql       │
│ ✅ Crea tabla: users                       │
│ ✅ Crea tabla: books                       │
│ ✅ Crea tabla: chapters                    │
│ ✅ Crea tabla: sections                    │
│ ✅ Crea tabla: verses                      │
│ ✅ Crea tabla: favorites                   │
│ ✅ Crea tabla: highlights                  │
│ ✅ Crea tabla: writings                    │
│ ✅ Crea tabla: daily_readings              │
│ ✅ Crea tabla: reading_history             │
│ ✅ Crea tabla: user_progress               │
│ ✅ Crea tabla: search_history              │
│ ✅ Registra en flyway_schema_history       │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│ Flyway ejecuta V2__seed_books.sql           │
│ ✅ INSERT 73 libros en tabla books         │
│   - 46 Antiguo Testamento                  │
│   - 27 Nuevo Testamento                    │
│ ✅ Registra en flyway_schema_history       │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│ Flyway ejecuta V3__seed_sample_data.sql     │
│ ✅ INSERT Mateo capítulo 1 (25 versículos) │
│ ✅ INSERT Génesis capítulo 1 (8 versículos)│
│ ✅ INSERT 1 lectura diaria                 │
│ ✅ Registra en flyway_schema_history       │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│ API lista ✅                                │
│ - Escuchando en: http://localhost:8080     │
│ - Swagger: /api/v1/swagger-ui.html         │
│ - Health: /api/v1/actuator/health          │
└─────────────────────────────────────────────┘

ESTADO DE LA BASE DE DATOS:
┌─────────────────────────────────────────────┐
│ ✅ 12 tablas creadas                        │
│ ✅ 73 libros insertados                     │
│ ✅ 2 capítulos de ejemplo                   │
│ ✅ 33 versículos de ejemplo                 │
│ ❌ ~31,000 versículos faltantes             │
└─────────────────────────────────────────────┘
```

### 🔄 Levantas Docker de nuevo (después de `docker-compose down`)

```
PASO 1: docker-compose up
┌─────────────────────────────────────────────┐
│ Servicio: postgres                          │
│ - Usa imagen ya descargada                 │
│ - Usa volumen existente: postgres_data     │
│ - Datos persisten ✅                       │
│ - Healthcheck: ✅ READY                    │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│ Servicio: api                               │
│ - Usa imagen ya construida                 │
│ - NO recompila (a menos que uses --build)  │
│ - Inicia contenedor                        │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│ Flyway se activa                            │
│ - Conecta a PostgreSQL                     │
│ - Lee flyway_schema_history                │
│ - Ve que V1, V2, V3 ya están ejecutados    │
│ - NO ejecuta nada ✅                       │
│ - "Schema is up to date"                   │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│ API lista ✅                                │
│ - Todo igual que antes                     │
│ - Datos intactos                           │
└─────────────────────────────────────────────┘
```

### 🐍 Ejecutas el script Python

```
PASO 1: Levantar Docker
docker-compose up -d

PASO 2: Ejecutar script
cd BibliaBackend/scripts
python3 import_bible_data.py

┌─────────────────────────────────────────────┐
│ Script conecta a: localhost:5432            │
│ - Usuario: biblia_user                      │
│ - Base de datos: biblia_db                 │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│ Script lee: bible_raw.json                  │
│ - Encuentra 73 libros                       │
│ - Cada libro con sus capítulos             │
│ - Cada capítulo con sus versículos         │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│ Script LIMPIA datos existentes ⚠️           │
│ DELETE FROM verses;                         │
│ DELETE FROM sections;                       │
│ DELETE FROM chapters;                       │
│ (NO toca la tabla books)                   │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│ Script IMPORTA cada libro                   │
│                                             │
│ [1/73] Procesando: Genesis                 │
│   INSERT chapters (50 capítulos)           │
│   INSERT sections (50 secciones)           │
│   INSERT verses (1,533 versículos)         │
│   ✓ Completado                             │
│                                             │
│ [2/73] Procesando: Exodus                  │
│   INSERT chapters (40 capítulos)           │
│   INSERT sections (40 secciones)           │
│   INSERT verses (1,213 versículos)         │
│   ✓ Completado                             │
│                                             │
│ ... (repite para 73 libros)                │
│                                             │
│ [73/73] Procesando: Revelation             │
│   INSERT chapters (22 capítulos)           │
│   INSERT sections (22 secciones)           │
│   INSERT verses (404 versículos)           │
│   ✓ Completado                             │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│ RESUMEN                                     │
│ Libros importados:     73                   │
│ Capítulos importados:  1,189                │
│ Versículos importados: 31,102               │
│ ✓ Importación completada exitosamente!     │
└─────────────────────────────────────────────┘

ESTADO FINAL DE LA BASE DE DATOS:
┌─────────────────────────────────────────────┐
│ ✅ 73 libros                                │
│ ✅ 1,189 capítulos (TODOS)                 │
│ ✅ 1,189 secciones                          │
│ ✅ 31,102 versículos (TODA LA BIBLIA)      │
└─────────────────────────────────────────────┘
```

---

## 🎯 Resumen ejecutivo

### Recompilación de la API
```bash
# ❌ NO se recompila automáticamente
docker-compose up

# ✅ SÍ se recompila
docker-compose up --build
```

### Base de datos
```bash
# ✅ Datos persisten
docker-compose down
docker-compose up

# ❌ Datos se borran
docker-compose down -v
docker-compose up
```

### Migraciones SQL
```
✅ Se ejecutan automáticamente al iniciar
✅ Solo la primera vez (Flyway las controla)
✅ Ubicación: src/main/resources/db/migration/
```

### Script Python
```
❌ NO se ejecuta automáticamente
✅ Debes ejecutarlo manualmente
✅ Importa ~31,000 versículos
✅ Solo necesitas ejecutarlo una vez
```

### Flujo recomendado
```
1. docker-compose up              # Primera vez
2. python3 import_bible_data.py   # Importar toda la Biblia
3. Desarrollar localmente:
   - docker-compose up postgres   # Solo DB
   - ./mvnw spring-boot:run       # API local
4. Antes de commitear:
   - docker-compose up --build    # Probar en Docker
```

---

## 🆘 Troubleshooting

### Problema: Cambié código pero no se actualiza
```bash
# Solución
docker-compose build api
docker-compose up
```

### Problema: Base de datos corrupta
```bash
# Solución: Resetear todo
docker-compose down -v
docker-compose up
python3 scripts/import_bible_data.py
```

### Problema: Flyway dice "migration failed"
```bash
# Solución: Limpiar historial
docker-compose down -v
docker-compose up
```

### Problema: Script Python no conecta
```bash
# 1. Verificar que postgres esté corriendo
docker-compose ps

# 2. Verificar puerto
docker-compose port postgres 5432

# 3. Probar conexión
psql -h localhost -p 5432 -U biblia_user -d biblia_db
# Password: biblia_secret_2024
```

---

¡Todo claro! 🎉

