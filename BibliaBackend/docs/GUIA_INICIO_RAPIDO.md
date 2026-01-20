# 🚀 Guía de Inicio Rápido - Biblia API

## 📋 Pasos para levantar todo desde cero

### 1️⃣ Levantar Docker (Primera vez)

```bash
cd BibliaBackend
docker-compose up
```

**¿Qué está pasando?**
```
✅ PostgreSQL se está iniciando
✅ Tu API se está compilando (tarda 3-5 min la primera vez)
✅ Flyway está creando las tablas
✅ Se están insertando los 73 libros de la Biblia
```

**Espera hasta ver:**
```
biblia-api    | Started BibliaApplication in 8.5 seconds
```

### 2️⃣ Verificar que todo funciona

Abre tu navegador:

**Swagger (Documentación de la API):**
```
http://localhost:8080/api/v1/swagger-ui.html
```

**Health Check:**
```
http://localhost:8080/api/v1/actuator/health
```

**pgAdmin (Ver base de datos):**
```bash
# Primero, levanta con el profile dev
docker-compose --profile dev up

# Luego abre:
http://localhost:5050

# Credenciales:
Email: admin@biblia.com
Password: admin123

# Conectar a PostgreSQL:
Host: postgres
Port: 5432
Database: biblia_db
Username: biblia_user
Password: biblia_secret_2024
```

### 3️⃣ Importar toda la Biblia

**Opción A: Con Python instalado**

```bash
# Terminal nueva (deja Docker corriendo)
cd BibliaBackend/scripts

# Instalar dependencias
pip3 install psycopg2-binary

# Ejecutar script
python3 import_bible_data.py
```

**Opción B: Usando el script helper**

```bash
cd BibliaBackend/scripts
chmod +x run_import.sh
./run_import.sh
```

**¿Qué está pasando?**
```
✅ Leyendo bible_raw.json
✅ Conectando a PostgreSQL
✅ Importando Génesis (50 capítulos)
✅ Importando Éxodo (40 capítulos)
...
✅ Importando Apocalipsis (22 capítulos)

📊 RESUMEN:
   Libros:     73
   Capítulos:  1,189
   Versículos: 31,102
```

**Tiempo estimado:** 30-60 segundos

### 4️⃣ Probar la API

**Obtener todos los libros:**
```bash
curl http://localhost:8080/api/v1/books
```

**Obtener capítulo de Génesis:**
```bash
curl http://localhost:8080/api/v1/books/genesis/chapters/1
```

**Buscar versículos:**
```bash
curl "http://localhost:8080/api/v1/bible/search?query=amor"
```

---

## 🔄 Workflow diario de desarrollo

### Opción 1: Desarrollo local (Recomendado)

**Terminal 1 - Base de datos:**
```bash
cd BibliaBackend
docker-compose up postgres
```

**Terminal 2 - API local:**
```bash
cd BibliaBackend
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

**Ventajas:**
- ⚡ Cambios instantáneos (hot-reload)
- 🚀 No necesitas reconstruir Docker
- 🔍 Fácil debugging en IntelliJ

**Para hacer cambios:**
1. Edita tu código en IntelliJ
2. Guarda (Cmd+S)
3. Spring Boot reinicia automáticamente en 5 segundos

### Opción 2: Todo en Docker

**Levantar todo:**
```bash
docker-compose up
```

**Cuando hagas cambios en el código:**
```bash
docker-compose up --build
```

---

## 🛠️ Comandos útiles

### Docker

```bash
# Levantar todo
docker-compose up

# Levantar en segundo plano
docker-compose up -d

# Ver logs
docker-compose logs -f api
docker-compose logs -f postgres

# Detener todo
docker-compose down

# Detener y borrar datos (⚠️ cuidado)
docker-compose down -v

# Reconstruir imagen
docker-compose build api

# Ver estado
docker-compose ps

# Entrar al contenedor
docker-compose exec api sh
docker-compose exec postgres psql -U biblia_user -d biblia_db
```

### Base de datos

```bash
# Conectar a PostgreSQL
docker-compose exec postgres psql -U biblia_user -d biblia_db

# O desde tu Mac (si tienes psql):
psql -h localhost -p 5432 -U biblia_user -d biblia_db

# Contar datos
SELECT COUNT(*) FROM books;      -- Debe ser 73
SELECT COUNT(*) FROM chapters;   -- Debe ser 1,189 (después del script)
SELECT COUNT(*) FROM verses;     -- Debe ser 31,102 (después del script)

# Ver migraciones ejecutadas
SELECT * FROM flyway_schema_history;

# Ver estructura de una tabla
\d books

# Listar todas las tablas
\dt

# Salir
\q
```

### Maven

```bash
# Compilar
./mvnw clean package

# Ejecutar tests
./mvnw test

# Ejecutar localmente
./mvnw spring-boot:run

# Con profile específico
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

---

## 🧪 Probar la API con ejemplos

### 1. Registrar usuario

```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@example.com",
    "password": "MiPassword123!",
    "fullName": "Juan Pérez"
  }'
```

**Respuesta esperada:**
```json
{
  "accessToken": "eyJhbGciOiJIUzUxMiJ9...",
  "refreshToken": "eyJhbGciOiJIUzUxMiJ9...",
  "tokenType": "Bearer",
  "expiresIn": 86400000,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "juan@example.com",
    "fullName": "Juan Pérez"
  }
}
```

### 2. Login

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@example.com",
    "password": "MiPassword123!"
  }'
```

### 3. Obtener libros del Antiguo Testamento

```bash
curl http://localhost:8080/api/v1/books?testament=old
```

### 4. Obtener capítulo completo

```bash
curl http://localhost:8080/api/v1/books/genesis/chapters/1
```

**Respuesta esperada:**
```json
{
  "bookId": "genesis",
  "bookName": "Génesis",
  "chapterNumber": 1,
  "version": "Biblia de Jerusalén",
  "sections": [
    {
      "title": "La Creación",
      "orderIndex": 1,
      "verses": [
        {
          "verseNumber": 1,
          "text": "En el principio creó Dios los cielos y la tierra.",
          "hasNote": false
        },
        ...
      ]
    }
  ]
}
```

### 5. Buscar versículos

```bash
curl "http://localhost:8080/api/v1/bible/search?query=amor&testament=new"
```

### 6. Añadir favorito (requiere autenticación)

```bash
# Guarda tu token
TOKEN="eyJhbGciOiJIUzUxMiJ9..."

curl -X POST http://localhost:8080/api/v1/favorites \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bookId": "john",
    "bookName": "San Juan",
    "chapterNumber": 3,
    "verseNumber": 16,
    "verseText": "Porque tanto amó Dios al mundo...",
    "tags": ["amor", "salvación"],
    "note": "Versículo favorito"
  }'
```

### 7. Obtener lectura diaria

```bash
curl http://localhost:8080/api/v1/daily-readings/today
```

---

## 📊 Verificar estado de la base de datos

### Después de Flyway (sin script Python)

```sql
-- Conectar a la base de datos
docker-compose exec postgres psql -U biblia_user -d biblia_db

-- Ver estado
SELECT 
  'books' as tabla, COUNT(*) as filas FROM books
UNION ALL
SELECT 'chapters', COUNT(*) FROM chapters
UNION ALL
SELECT 'sections', COUNT(*) FROM sections
UNION ALL
SELECT 'verses', COUNT(*) FROM verses;

-- Resultado esperado:
-- books     | 73
-- chapters  | 2
-- sections  | 2
-- verses    | 33
```

### Después del script Python

```sql
-- Ver estado
SELECT 
  'books' as tabla, COUNT(*) as filas FROM books
UNION ALL
SELECT 'chapters', COUNT(*) FROM chapters
UNION ALL
SELECT 'sections', COUNT(*) FROM sections
UNION ALL
SELECT 'verses', COUNT(*) FROM verses;

-- Resultado esperado:
-- books     | 73
-- chapters  | 1,189
-- sections  | 1,189
-- verses    | 31,102

-- Ver libros con más versículos
SELECT 
  b.name,
  COUNT(v.id) as total_verses
FROM books b
JOIN chapters c ON b.id = c.book_id
JOIN sections s ON c.id = s.chapter_id
JOIN verses v ON s.id = v.section_id
GROUP BY b.name
ORDER BY total_verses DESC
LIMIT 10;
```

---

## 🐛 Solución de problemas

### Problema: Puerto 8080 ya en uso

```bash
# Ver qué está usando el puerto
lsof -i :8080

# Matar el proceso
kill -9 <PID>

# O cambiar el puerto en docker-compose.yml
ports:
  - "8081:8080"
```

### Problema: Puerto 5432 ya en uso

```bash
# Detener PostgreSQL local
brew services stop postgresql

# O cambiar el puerto
ports:
  - "5433:5432"

# Luego actualizar el script Python:
DB_CONFIG = {
    'port': 5433,  # ← Cambiar aquí
}
```

### Problema: Script Python no conecta

```bash
# 1. Verificar que postgres está corriendo
docker-compose ps

# 2. Verificar conexión
docker-compose exec postgres psql -U biblia_user -d biblia_db -c "SELECT 1"

# 3. Instalar dependencias
pip3 install psycopg2-binary

# 4. Verificar configuración en import_bible_data.py
DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'database': 'biblia_db',
    'user': 'biblia_user',
    'password': 'biblia_secret_2024'
}
```

### Problema: Flyway falla

```bash
# Resetear todo
docker-compose down -v
docker-compose up

# Ver logs detallados
docker-compose logs api | grep -A 50 Flyway
```

### Problema: Cambios no se reflejan

```bash
# Si estás usando Docker:
docker-compose build api
docker-compose up

# Si estás usando local:
# Detén con Ctrl+C y vuelve a ejecutar
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

### Problema: Base de datos corrupta

```bash
# Opción 1: Resetear volumen
docker-compose down -v
docker-compose up
cd scripts && python3 import_bible_data.py

# Opción 2: Limpiar solo datos de capítulos
docker-compose exec postgres psql -U biblia_user -d biblia_db -c "
  DELETE FROM verses;
  DELETE FROM sections;
  DELETE FROM chapters;
"
cd scripts && python3 import_bible_data.py
```

---

## 📝 Checklist de verificación

Después de levantar todo, verifica:

- [ ] Docker corriendo: `docker-compose ps`
- [ ] PostgreSQL healthy: `docker-compose ps` (debe decir "healthy")
- [ ] API respondiendo: `curl http://localhost:8080/api/v1/actuator/health`
- [ ] Swagger accesible: Abre navegador en `http://localhost:8080/api/v1/swagger-ui.html`
- [ ] 73 libros en DB: `SELECT COUNT(*) FROM books;`
- [ ] Script Python ejecutado: `SELECT COUNT(*) FROM verses;` (debe ser 31,102)
- [ ] Puedes registrar usuario
- [ ] Puedes hacer login
- [ ] Puedes obtener capítulos
- [ ] Puedes buscar versículos

---

## 🎯 Próximos pasos

1. **Explora la API con Swagger**
   - http://localhost:8080/api/v1/swagger-ui.html

2. **Conecta tu frontend**
   - Actualiza `API_URL` en tu app Expo
   - Usa el token JWT en las peticiones

3. **Añade más datos**
   - Crea lecturas diarias
   - Añade más datos de ejemplo

4. **Personaliza**
   - Modifica los endpoints
   - Añade nuevas funcionalidades

---

## 📚 Documentación adicional

- `EXPLICACION_DOCKERIZACION.md` - Entender Docker desde cero
- `COMO_FUNCIONA_DOCKER_Y_MIGRACIONES.md` - Recompilación y migraciones
- `DIAGRAMA_MIGRACIONES.md` - Diagramas visuales
- `README.md` - Documentación general

---

¡Listo para empezar! 🚀

