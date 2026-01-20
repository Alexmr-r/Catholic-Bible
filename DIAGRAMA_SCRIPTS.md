# 🎨 Diagrama Visual: ¿Qué hace cada script?

## 📊 prod-start.sh (Producción)

```
TÚ EJECUTAS:
./prod-start.sh
      ↓
┌─────────────────────────────────────────────────────────────┐
│ PASO 1: Verificar Docker                                    │
│   command -v docker                                         │
│   command -v docker-compose                                 │
└─────────────────────────────────────────────────────────────┘
      ↓
┌─────────────────────────────────────────────────────────────┐
│ PASO 2: Construir imagen de la API                         │
│   cd BibliaBackend/                                         │
│   docker-compose build    ← LEE: Dockerfile                │
│                                                              │
│   ¿Qué hace Dockerfile?                                     │
│   1. FROM eclipse-temurin:21-jdk-alpine                     │
│   2. COPY pom.xml                                           │
│   3. RUN ./mvnw dependency:go-offline                       │
│   4. COPY src                                               │
│   5. RUN ./mvnw package     ← COMPILA tu código Java       │
│   6. Crea archivo .jar                                      │
│   7. Guarda todo en una "imagen Docker"                    │
└─────────────────────────────────────────────────────────────┘
      ↓
┌─────────────────────────────────────────────────────────────┐
│ PASO 3: Levantar contenedores                              │
│   docker-compose up -d    ← LEE: docker-compose.yml        │
│                                                              │
│   ¿Qué hace docker-compose.yml?                            │
│   1. Crea red: biblia-network                              │
│   2. Crea volumen: postgres_data                           │
│   3. Levanta contenedor "postgres":                        │
│      - Imagen: postgres:16-alpine                          │
│      - Puerto: 5432                                        │
│      - Variables: POSTGRES_DB, POSTGRES_USER, etc.         │
│   4. Levanta contenedor "api":                             │
│      - Usa imagen construida en PASO 2                     │
│      - Puerto: 8080                                        │
│      - Espera a que postgres esté "healthy"                │
└─────────────────────────────────────────────────────────────┘
      ↓
┌─────────────────────────────────────────────────────────────┐
│ PASO 4: Esperar servicios                                  │
│                                                              │
│ Esperar PostgreSQL:                                         │
│   for i in {1..30}; do                                      │
│     docker-compose ps postgres | grep "healthy"            │
│   done                                                      │
│                                                              │
│ Esperar API:                                                │
│   for i in {1..60}; do                                      │
│     curl http://localhost:8080/api/v1/actuator/health      │
│   done                                                      │
│                                                              │
│ ⚠️ AQUÍ OCURRE LA MAGIA DE FLYWAY (AUTOMÁTICO):            │
│                                                              │
│ Cuando Spring Boot arranca dentro del contenedor "api":    │
│                                                              │
│   1. Spring Boot lee application.yml                       │
│   2. Ve: spring.flyway.enabled: true                       │
│   3. Activa Flyway automáticamente                         │
│   4. Flyway busca: src/main/resources/db/migration/        │
│   5. Encuentra:                                             │
│      - V1__initial_schema.sql                              │
│      - V2__seed_books.sql                                  │
│      - V3__seed_sample_data.sql                            │
│   6. Ejecuta cada uno EN ORDEN                             │
│   7. Guarda en tabla: flyway_schema_history                │
│                                                              │
│   ⭐ TODO ESTO PASA DENTRO DEL CONTENEDOR                  │
│   ⭐ NO NECESITAS HACER NADA                               │
│   ⭐ ES COMPLETAMENTE AUTOMÁTICO                           │
│                                                              │
│ Puedes ver los logs:                                        │
│   docker-compose logs api | grep Flyway                     │
└─────────────────────────────────────────────────────────────┘
      ↓
┌─────────────────────────────────────────────────────────────┐
│ PASO 5: Importar Bible data (MANUAL)                       │
│                                                              │
│ if [ ! -f .prod-state/bible_imported ]; then               │
│   cd BibliaBackend/scripts/                                │
│   python3 import_bible_data.py  ← AQUÍ SE EJECUTA         │
│ fi                                                          │
│                                                              │
│ ¿Qué hace import_bible_data.py?                            │
│                                                              │
│   1. import psycopg2                                       │
│   2. conn = psycopg2.connect(                              │
│        host='localhost',    ← Conecta FUERA de Docker     │
│        port=5432,           ← Puerto expuesto              │
│        database='biblia_db'                                │
│      )                                                     │
│   3. Abre: ../../BibliaAppExpo/bible_raw.json             │
│   4. DELETE FROM verses;                                   │
│      DELETE FROM sections;                                 │
│      DELETE FROM chapters;                                 │
│   5. Para cada libro en JSON:                              │
│        Para cada capítulo:                                 │
│          INSERT INTO chapters ...                          │
│          INSERT INTO sections ...                          │
│          Para cada versículo:                              │
│            INSERT INTO verses ...                          │
│   6. Resultado: 31,102 versículos insertados               │
│                                                              │
│   ⭐ ESTO SE EJECUTA DESDE TU MAC                          │
│   ⭐ CONECTA A POSTGRES VÍA localhost:5432                │
│   ⭐ SOLO OCURRE LA PRIMERA VEZ                           │
│                                                              │
│ Segunda vez:                                                │
│   El archivo .prod-state/bible_imported existe             │
│   → Se salta este paso                                     │
└─────────────────────────────────────────────────────────────┘
      ↓
✅ TODO LISTO
```

---

## 📊 dev-start.sh (Desarrollo)

```
TÚ EJECUTAS:
./dev-start.sh
      ↓
┌─────────────────────────────────────────────────────────────┐
│ PASO 1: Verificar dependencias                             │
│   - Docker ✓                                                │
│   - Java ✓                                                  │
│   - Node.js ✓                                               │
│   - Python3 ✓                                               │
└─────────────────────────────────────────────────────────────┘
      ↓
┌─────────────────────────────────────────────────────────────┐
│ PASO 2: Levantar SOLO PostgreSQL en Docker                 │
│   cd BibliaBackend/                                         │
│   docker-compose up -d postgres  ← Solo este servicio     │
│                                                              │
│   La API NO se levanta en Docker                           │
└─────────────────────────────────────────────────────────────┘
      ↓
┌─────────────────────────────────────────────────────────────┐
│ PASO 3: Migraciones (solo primera vez)                     │
│                                                              │
│ if [ ! -f .dev-state/migrations_done ]; then               │
│   ./mvnw clean package -DskipTests                         │
│   ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev &  │
│   API_PID=$!                                               │
│                                                              │
│   # Esperar que Spring Boot arranque                       │
│   # Flyway ejecuta migraciones automáticamente            │
│                                                              │
│   kill $API_PID    ← Matar API temporal                   │
│   touch .dev-state/migrations_done                         │
│ fi                                                          │
└─────────────────────────────────────────────────────────────┘
      ↓
┌─────────────────────────────────────────────────────────────┐
│ PASO 4: Importar Bible data (solo primera vez)             │
│                                                              │
│ if [ ! -f .dev-state/bible_imported ]; then                │
│   cd BibliaBackend/scripts/                                │
│   python3 import_bible_data.py                             │
│   touch .dev-state/bible_imported                          │
│ fi                                                          │
└─────────────────────────────────────────────────────────────┘
      ↓
┌─────────────────────────────────────────────────────────────┐
│ PASO 5: Levantar API LOCAL (no Docker)                     │
│   ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev &  │
│   API_PID=$!                                               │
│   echo $API_PID > .dev-state/api.pid                       │
│                                                              │
│   ⭐ HOT-RELOAD ACTIVADO                                   │
│   ⭐ Cambios se aplican automáticamente                    │
└─────────────────────────────────────────────────────────────┘
      ↓
┌─────────────────────────────────────────────────────────────┐
│ PASO 6: Levantar Frontend Expo                             │
│   cd BibliaAppExpo/                                         │
│   npm start &                                               │
│   EXPO_PID=$!                                              │
│   echo $EXPO_PID > .dev-state/expo.pid                     │
└─────────────────────────────────────────────────────────────┘
      ↓
✅ TODO LISTO
```

---

## 🔄 prod-reload-api.sh

```
TÚ EJECUTAS:
./prod-reload-api.sh
      ↓
┌─────────────────────────────────────────────────────────────┐
│ PASO 1: Verificar que PostgreSQL está corriendo            │
│   docker ps | grep biblia-postgres                         │
└─────────────────────────────────────────────────────────────┘
      ↓
┌─────────────────────────────────────────────────────────────┐
│ PASO 2: Reconstruir SOLO imagen de la API                  │
│   cd BibliaBackend/                                         │
│   docker-compose build api    ← Re-lee Dockerfile         │
│                                                              │
│   Dockerfile vuelve a:                                      │
│   1. Copiar código nuevo                                    │
│   2. Compilar: ./mvnw package                              │
│   3. Crear nueva imagen                                    │
│                                                              │
│   PostgreSQL NO se toca ✅                                 │
└─────────────────────────────────────────────────────────────┘
      ↓
┌─────────────────────────────────────────────────────────────┐
│ PASO 3: Recrear SOLO contenedor API                        │
│   docker-compose up -d --no-deps --force-recreate api      │
│                                                              │
│   --no-deps         = No reiniciar postgres                │
│   --force-recreate  = Forzar recrear el contenedor        │
│   api               = Solo este servicio                   │
│                                                              │
│   PostgreSQL sigue corriendo ✅                            │
│   Datos intactos ✅                                        │
└─────────────────────────────────────────────────────────────┘
      ↓
┌─────────────────────────────────────────────────────────────┐
│ PASO 4: Esperar que API esté lista                         │
│   curl http://localhost:8080/api/v1/actuator/health        │
└─────────────────────────────────────────────────────────────┘
      ↓
✅ API ACTUALIZADA (datos intactos)
```

---

## 🔄 dev-reload-api.sh

```
TÚ EJECUTAS:
./dev-reload-api.sh
      ↓
┌─────────────────────────────────────────────────────────────┐
│ PASO 1: Detener API actual                                 │
│   API_PID=$(cat .dev-state/api.pid)                        │
│   kill $API_PID                                            │
└─────────────────────────────────────────────────────────────┘
      ↓
┌─────────────────────────────────────────────────────────────┐
│ PASO 2: Recompilar                                         │
│   cd BibliaBackend/                                         │
│   ./mvnw clean package -DskipTests                         │
│                                                              │
│   Esto genera nuevo .jar con tus cambios                   │
└─────────────────────────────────────────────────────────────┘
      ↓
┌─────────────────────────────────────────────────────────────┐
│ PASO 3: Reiniciar API                                      │
│   ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev &  │
│   API_PID=$!                                               │
│   echo $API_PID > .dev-state/api.pid                       │
│                                                              │
│   PostgreSQL NO se toca ✅                                 │
│   Frontend NO se toca ✅                                   │
│   Datos intactos ✅                                        │
└─────────────────────────────────────────────────────────────┘
      ↓
✅ API ACTUALIZADA
```

---

## 📝 Archivos de control

```
.prod-state/
├── migrations_done    ← Si existe: no ejecutar migraciones
└── bible_imported     ← Si existe: no ejecutar script Python

.dev-state/
├── migrations_done    ← Si existe: no ejecutar migraciones
├── bible_imported     ← Si existe: no ejecutar script Python
├── api.pid           ← PID del proceso Java
├── expo.pid          ← PID del proceso Expo
├── api.log           ← Logs de la API
└── expo.log          ← Logs de Expo
```

**¿Cómo borrar estado?**
```bash
# Desarrollo
rm -rf .dev-state

# Producción
rm -rf .prod-state

# La próxima vez que ejecutes el script,
# será como "primera vez" y ejecutará todo de nuevo
```

---

## 🎯 Resumen visual

### Primera vez:

```
prod-start.sh
├── Docker build         (compila API)
├── Docker up           (PostgreSQL + API)
├── Flyway AUTOMÁTICO   (migraciones SQL)
└── Python MANUAL       (importa 31,102 versículos)

Archivos creados:
.prod-state/migrations_done ✓
.prod-state/bible_imported ✓
```

### Segunda vez:

```
prod-start.sh
├── Docker build         (compila API)
├── Docker up           (PostgreSQL + API)
├── Flyway lee tabla flyway_schema_history
│   └── "Ya ejecuté V1, V2, V3, no hago nada"
└── Ve archivo .prod-state/bible_imported
    └── "Ya importé la Biblia, no hago nada"

¡Listo en 2-3 minutos!
```

### Cuando cambias código:

```
prod-reload-api.sh
├── Docker build api    (solo API, no PostgreSQL)
└── Docker recreate api (solo contenedor API)

PostgreSQL: Intacto ✓
Datos: Intactos ✓
```

---

## 💡 Puntos clave

1. **Flyway es AUTOMÁTICO**
   - Se ejecuta cuando Spring Boot arranca
   - Está dentro del contenedor API
   - Revisa tabla `flyway_schema_history`
   - Solo ejecuta migraciones nuevas

2. **Script Python es MANUAL**
   - Se ejecuta desde tu Mac
   - Conecta a `localhost:5432`
   - Solo ocurre una vez (archivo de control)

3. **Reload solo toca API**
   - PostgreSQL sigue corriendo
   - Datos no se borran
   - Rápido: 2-3 minutos

4. **Archivos de control**
   - Marcan qué ya se ejecutó
   - Evitan repetir tareas pesadas
   - Se pueden borrar para "reset"

