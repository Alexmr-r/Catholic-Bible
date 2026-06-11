# ❓ FAQ: Swagger y Persistencia de Datos

## 🔍 Pregunta 1: ¿Por qué no veo Swagger?

### Respuesta corta:
✅ **SÍ, tienes que correr la aplicación primero.**

Swagger NO es un archivo, es una página web que genera tu API cuando está corriendo.

### Explicación:

```
❌ INCORRECTO: Buscar Swagger en archivos
   No lo encontrarás porque no existe como archivo

✅ CORRECTO: Acceder cuando la API está corriendo
   http://localhost:8080/api/v1/swagger-ui.html
```

### Paso a paso:

#### Opción A: Con Docker
```bash
# 1. Levantar Docker
cd BibliaBackend
docker-compose up

# 2. Esperar a que diga:
# "Started BibliaApplication in X seconds"

# 3. AHORA SÍ abrir navegador:
http://localhost:8080/api/v1/swagger-ui.html
```

#### Opción B: Local (sin Docker)
```bash
# Terminal 1: Solo PostgreSQL
docker-compose up postgres

# Terminal 2: API local
./mvnw spring-boot:run

# Esperar mensaje:
# "Started BibliaApplication in X seconds"

# Ahora abrir:
http://localhost:8080/api/v1/swagger-ui.html
```

### ¿Cómo saber si está lista?

```bash
# Test 1: Health check
curl http://localhost:8080/api/v1/actuator/health

# Respuesta esperada:
{"status":"UP"}

# Test 2: Ver logs
docker-compose logs -f api | grep "Started"
# O si es local:
# Busca en la consola: "Started BibliaApplication"
```

### URLs importantes:

| URL | ¿Para qué? |
|-----|-----------|
| http://localhost:8080/api/v1/swagger-ui.html | 📖 Documentación interactiva |
| http://localhost:8080/api/v1/api-docs | 📄 JSON de OpenAPI |
| http://localhost:8080/api/v1/actuator/health | ✅ Health check |
| http://localhost:8080/api/v1/books | 📚 Endpoint de libros |

---

## 🔄 Pregunta 2: ¿Cuándo necesito rebuild vs cuándo no?

### LA REGLA DE ORO:

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  🔨 ¿Cambios en CÓDIGO?        → docker-compose up --build  │
│  💾 ¿Cambios en DATOS?         → NO hace falta rebuild      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Tabla de decisión:

| ¿Qué cambiaste? | ¿Necesitas rebuild? | Comando |
|-----------------|---------------------|---------|
| **Código Java** (Controllers, Services, etc.) | ✅ SÍ | `docker-compose up --build` |
| **application.yml** | ✅ SÍ | `docker-compose up --build` |
| **pom.xml** (dependencias) | ✅ SÍ | `docker-compose up --build` |
| **Dockerfile** | ✅ SÍ | `docker-compose build --no-cache` |
| **Nuevos archivos SQL** (V4, V5...) | ✅ SÍ | `docker-compose restart api` |
| | | |
| **Registro de usuario** | ❌ NO | (Los datos se guardan automáticamente) |
| **Añadir favoritos** | ❌ NO | (Los datos se guardan automáticamente) |
| **Login/Logout** | ❌ NO | (Los datos se guardan automáticamente) |
| **Cualquier INSERT/UPDATE** | ❌ NO | (Los datos se guardan automáticamente) |

### Ejemplos prácticos:

#### Ejemplo 1: Añadiste un nuevo endpoint
```java
// AuthController.java - AÑADISTE ESTO:
@PostMapping("/logout")
public ResponseEntity<?> logout() {
    return ResponseEntity.ok("Logged out");
}
```

**¿Qué hacer?**
```bash
# Docker está corriendo:
docker-compose up --build

# O si usas local:
# Ctrl+C y volver a ejecutar
./mvnw spring-boot:run
```

#### Ejemplo 2: Usuario se registra
```bash
# Usuario hace POST a /register
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"juan@test.com","password":"Pass123"}'
```

**¿Qué hacer?**
```bash
# NADA. Los datos ya están en la base de datos.
# Aunque pares Docker y lo vuelvas a levantar:
docker-compose down
docker-compose up

# El usuario juan@test.com sigue ahí ✅
```

#### Ejemplo 3: Usuario añade favoritos
```bash
# Usuario añade un favorito
curl -X POST http://localhost:8080/api/v1/favorites \
  -H "Authorization: Bearer TOKEN" \
  -d '{"bookId":"john","chapterNumber":3,"verseNumber":16}'
```

**¿Qué hacer?**
```bash
# NADA. El favorito ya está guardado en PostgreSQL.
# Puedes:
docker-compose down       # ✅ Favorito persiste
docker-compose restart    # ✅ Favorito persiste
docker-compose up --build # ✅ Favorito persiste

# Solo se pierde con:
docker-compose down -v    # ❌ Borra TODO
```

---

## 💾 Pregunta 3: ¿Dónde se guardan los datos de usuarios/favoritos?

### Respuesta:
**En el volumen de PostgreSQL.** Son permanentes (a menos que uses `down -v`).

### Visualización:

```
┌────────────────────────────────────────────────────┐
│           ANATOMÍA DE TUS DATOS                    │
└────────────────────────────────────────────────────┘

📁 /var/lib/docker/volumes/bibliabackend_postgres_data/
    └── _data/
        └── (Aquí viven TODOS los datos)
            ├── 73 libros (V2__seed_books.sql)
            ├── 31,102 versículos (import_bible_data.py)
            ├── Usuarios registrados
            ├── Favoritos
            ├── Highlights
            ├── Writings
            └── Reading history

┌────────────────────────────────────────────────────┐
│           ¿QUÉ SOBREVIVE A QUÉ?                    │
└────────────────────────────────────────────────────┘

docker-compose down
  ├─ Usuarios ✅ Persisten
  ├─ Favoritos ✅ Persisten
  ├─ Versículos ✅ Persisten
  └─ TODO ✅ Persiste

docker-compose restart
  ├─ Usuarios ✅ Persisten
  ├─ Favoritos ✅ Persisten
  └─ TODO ✅ Persiste

docker-compose up --build
  ├─ Recompila código ✅
  ├─ Usuarios ✅ Persisten
  ├─ Favoritos ✅ Persisten
  └─ TODO ✅ Persiste

Reiniciar tu Mac
  └─ TODO ✅ Persiste

docker-compose down -v  ⚠️ PELIGRO
  ├─ Usuarios ❌ SE BORRAN
  ├─ Favoritos ❌ SE BORRAN
  └─ TODO ❌ SE BORRA
```

---

## 🎯 Casos de uso comunes

### Caso 1: Desarrollo normal (añadiendo usuarios, favoritos)

```bash
# 1. Levantar una vez
docker-compose up

# 2. Usuarios usan tu app:
#    - Se registran
#    - Añaden favoritos
#    - Hacen búsquedas
#    - Todo se guarda en PostgreSQL

# 3. Paras Docker al final del día
docker-compose down

# 4. Al día siguiente
docker-compose up

# ✅ TODOS los usuarios y favoritos siguen ahí
```

### Caso 2: Modificas un controller

```bash
# 1. API está corriendo
docker-compose up

# 2. Modificas código:
# AuthController.java - añades nuevo método

# 3. Aplicar cambios
docker-compose up --build

# ✅ Código actualizado
# ✅ Datos de usuarios/favoritos intactos
```

### Caso 3: Añades nueva migración SQL

```bash
# 1. Creas nuevo archivo
echo "CREATE INDEX idx_users_email ON users(email);" > \
  src/main/resources/db/migration/V4__add_user_index.sql

# 2. Reiniciar API (NO rebuild necesario)
docker-compose restart api

# Flyway detecta V4 y lo ejecuta automáticamente
# ✅ Índice creado
# ✅ Datos existentes intactos
```

### Caso 4: Quieres empezar de cero (testing)

```bash
# ⚠️ ESTO BORRA TODO

# 1. Destruir volumen
docker-compose down -v

# 2. Levantar de nuevo
docker-compose up

# 3. Reimportar Biblia
cd scripts && python3 import_bible_data.py

# Resultado:
# ✅ Biblia completa
# ❌ Usuarios borrados
# ❌ Favoritos borrados
```

---

## 🔍 Cómo verificar tus datos

### Ver usuarios registrados:

```bash
# Opción 1: Con psql
docker-compose exec postgres psql -U biblia_user -d biblia_db \
  -c "SELECT id, email, full_name, created_at FROM users;"

# Opción 2: Con la API
curl http://localhost:8080/api/v1/actuator/health
```

### Ver favoritos de un usuario:

```bash
# Primero obtén el token del usuario
TOKEN="eyJhbGciOiJIUzUxMiJ9..."

# Luego:
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/v1/favorites
```

### Ver estadísticas:

```bash
docker-compose exec postgres psql -U biblia_user -d biblia_db

-- En psql:
SELECT 
  'Users' as tabla, COUNT(*) as total FROM users
UNION ALL
SELECT 'Favorites', COUNT(*) FROM favorites
UNION ALL
SELECT 'Highlights', COUNT(*) FROM highlights
UNION ALL
SELECT 'Verses', COUNT(*) FROM verses;

-- Salir:
\q
```

---

## 🚀 Workflow recomendado

### Para desarrollo diario:

```bash
# Día 1: Setup inicial
docker-compose up
cd scripts && python3 import_bible_data.py

# Desarrollo:
# - Modificas código
# - Pruebas con Swagger: http://localhost:8080/api/v1/swagger-ui.html
# - Usuarios se registran, añaden favoritos, etc.

# Fin del día:
docker-compose down

# Día 2:
docker-compose up
# ✅ Todo sigue ahí (usuarios, favoritos, etc.)

# Solo cuando modificas CÓDIGO:
docker-compose up --build
```

### Para testing/demos:

```bash
# Opción A: Usa datos existentes
docker-compose up
# Los usuarios y datos de ayer siguen ahí

# Opción B: Empezar de cero
docker-compose down -v
docker-compose up
cd scripts && python3 import_bible_data.py
# Base de datos fresca
```

---

## 📊 Diagrama de flujos

```
┌────────────────────────────────────────────────────────┐
│         FLUJO: Usuario se registra                     │
└────────────────────────────────────────────────────────┘

1. POST /api/v1/auth/register
        ↓
2. AuthController recibe request
        ↓
3. AuthService valida y guarda:
   INSERT INTO users (email, password_hash, full_name)
   VALUES ('juan@test.com', '$2a$10...', 'Juan')
        ↓
4. PostgreSQL guarda en volumen:
   /var/lib/docker/volumes/.../users
        ↓
5. Response con token JWT
        ↓
✅ Usuario guardado permanentemente


┌────────────────────────────────────────────────────────┐
│         FLUJO: Usuario añade favorito                  │
└────────────────────────────────────────────────────────┘

1. POST /api/v1/favorites
   Header: Authorization: Bearer TOKEN
        ↓
2. JwtAuthFilter valida token
        ↓
3. FavoritesController recibe request
        ↓
4. FavoritesService guarda:
   INSERT INTO favorites (user_id, book_id, chapter_number...)
   VALUES ('user-uuid', 'john', 3, 16, ...)
        ↓
5. PostgreSQL guarda en volumen
        ↓
✅ Favorito guardado permanentemente


┌────────────────────────────────────────────────────────┐
│         FLUJO: Modificas código y rebuild              │
└────────────────────────────────────────────────────────┘

1. Modificas AuthController.java
        ↓
2. docker-compose up --build
        ↓
3. Docker recompila código nuevo
        ↓
4. Crea nueva imagen con código actualizado
        ↓
5. Destruye contenedor viejo
        ↓
6. Crea contenedor nuevo
        ↓
7. Contenedor nuevo conecta a PostgreSQL
        ↓
8. PostgreSQL usa MISMO volumen
        ↓
✅ Código actualizado
✅ Datos intactos (usuarios, favoritos, etc.)
```

---

## 💡 Tips finales

### 1. Verificar que Swagger está disponible:
```bash
# Método 1: curl
curl http://localhost:8080/api/v1/swagger-ui.html

# Método 2: Ver logs
docker-compose logs api | grep "Swagger"

# Método 3: Health check
curl http://localhost:8080/api/v1/actuator/health
```

### 2. Diferencia entre código y datos:

```
CÓDIGO (necesita rebuild):
├── Controllers
├── Services
├── Repositories
├── Configurations
└── application.yml

DATOS (NO necesita rebuild):
├── Registros en tabla users
├── Registros en tabla favorites
├── Registros en tabla verses
└── Cualquier INSERT/UPDATE/DELETE
```

### 3. Backups de datos importantes:

```bash
# Exportar todos los usuarios
docker-compose exec postgres pg_dump \
  -U biblia_user -d biblia_db \
  -t users -t favorites \
  > backup_users_$(date +%Y%m%d).sql

# Restaurar
docker-compose exec -T postgres psql \
  -U biblia_user -d biblia_db \
  < backup_users_20260117.sql
```

### 4. Ver cambios en tiempo real:

```bash
# Terminal 1: API con logs
docker-compose up

# Terminal 2: Monitorear base de datos
watch -n 2 'docker-compose exec postgres psql -U biblia_user -d biblia_db \
  -c "SELECT COUNT(*) as usuarios FROM users"'
```

---

## ✅ Checklist rápido

Antes de pensar "¿necesito rebuild?", pregúntate:

- [ ] ¿Modifiqué archivos .java? → ✅ Rebuild
- [ ] ¿Modifiqué application.yml? → ✅ Rebuild
- [ ] ¿Modifiqué pom.xml? → ✅ Rebuild
- [ ] ¿Añadí nueva migración SQL? → ✅ Restart API
- [ ] ¿Solo se registró un usuario? → ❌ No hacer nada
- [ ] ¿Solo se añadió un favorito? → ❌ No hacer nada
- [ ] ¿Solo hice queries? → ❌ No hacer nada

---

## 🆘 Si algo falla

```bash
# 1. Verificar que todo está corriendo
docker-compose ps

# 2. Ver logs
docker-compose logs -f api

# 3. Verificar salud
curl http://localhost:8080/api/v1/actuator/health

# 4. Último recurso (sin perder datos)
docker-compose restart

# 5. Último último recurso (pierdes datos)
docker-compose down -v
docker-compose up
cd scripts && python3 import_bible_data.py
```

---

**Resumen en 3 líneas:**
1. Swagger solo funciona cuando la API está corriendo
2. Solo necesitas rebuild cuando cambias CÓDIGO
3. Los datos (usuarios, favoritos) persisten automáticamente en el volumen

¿Todo claro? 🎉

