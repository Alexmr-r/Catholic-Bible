# Biblia Católica API

Backend REST API para la aplicación de Biblia Católica, desarrollado con Spring Boot 3 y arquitectura hexagonal.

## 🏗️ Arquitectura

El proyecto sigue una **arquitectura hexagonal (puertos y adaptadores)** con las siguientes capas:

```
src/main/java/com/bibliacatolica/api/
├── domain/                    # Capa de dominio (núcleo)
│   ├── model/                 # Entidades de dominio
│   ├── port/
│   │   ├── in/               # Puertos de entrada (casos de uso)
│   │   └── out/              # Puertos de salida (repositorios)
│   └── exception/            # Excepciones de dominio
├── application/              # Capa de aplicación
│   └── service/              # Implementación de casos de uso
└── infrastructure/           # Capa de infraestructura
    ├── adapter/
    │   ├── in/rest/          # Adaptadores REST (controllers)
    │   └── out/persistence/  # Adaptadores de persistencia
    └── config/               # Configuración (security, web)
```

## 🚀 Tecnologías

- **Java 21**
- **Spring Boot 3.2.5**
- **Spring Security** con JWT
- **Spring Data JPA**
- **PostgreSQL 16**
- **Flyway** para migraciones
- **Lombok**
- **MapStruct**
- **Docker & Docker Compose**
- **Swagger/OpenAPI 3**

## 📋 Requisitos Previos

- Java 21+
- Maven 3.9+
- Docker y Docker Compose
- PostgreSQL 16 (o usar Docker)

## 🛠️ Instalación y Ejecución

### Con Docker (recomendado)

```bash
# Clonar el repositorio
cd BibliaBackend

# Iniciar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f api
```

La API estará disponible en: `http://localhost:8080/api/v1`

### Sin Docker

```bash
# 1. Iniciar PostgreSQL localmente

# 2. Crear la base de datos
createdb -U postgres biblia_db

# 3. Compilar el proyecto
./mvnw clean package -DskipTests

# 4. Ejecutar
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

## 📚 Documentación API

Una vez iniciada la aplicación, accede a:

- **Swagger UI**: http://localhost:8080/api/v1/swagger-ui.html
- **OpenAPI JSON**: http://localhost:8080/api/v1/api-docs

## 🔌 Endpoints Principales

### Autenticación
```
POST /api/v1/auth/register    - Registrar usuario
POST /api/v1/auth/login       - Iniciar sesión
POST /api/v1/auth/refresh     - Refrescar token
POST /api/v1/auth/logout      - Cerrar sesión
GET  /api/v1/auth/me          - Usuario actual
```

### Biblia
```
GET /api/v1/bible/books                           - Todos los libros
GET /api/v1/bible/books/old-testament             - Antiguo Testamento
GET /api/v1/bible/books/new-testament             - Nuevo Testamento
GET /api/v1/bible/books/{bookId}                  - Detalle de libro
GET /api/v1/bible/books/{bookId}/chapters/{num}   - Capítulo completo
GET /api/v1/bible/search?query=amor               - Buscar versículos
```

### Favoritos
```
GET    /api/v1/favorites              - Listar favoritos
POST   /api/v1/favorites              - Agregar favorito
PUT    /api/v1/favorites/{id}         - Actualizar favorito
DELETE /api/v1/favorites/{id}         - Eliminar favorito
GET    /api/v1/favorites/check        - Verificar si es favorito
```

### Resaltados
```
GET    /api/v1/highlights             - Listar resaltados
GET    /api/v1/highlights/chapter     - Resaltados de un capítulo
POST   /api/v1/highlights             - Crear resaltado
DELETE /api/v1/highlights/{id}        - Eliminar resaltado
```

### Escritos
```
GET    /api/v1/writings               - Listar escritos
GET    /api/v1/writings/{id}          - Obtener escrito
POST   /api/v1/writings               - Crear escrito
PUT    /api/v1/writings/{id}          - Actualizar escrito
PATCH  /api/v1/writings/{id}/favorite - Toggle favorito
DELETE /api/v1/writings/{id}          - Eliminar escrito
```

### Lectura Diaria
```
GET  /api/v1/daily-reading/today              - Lectura de hoy
GET  /api/v1/daily-reading/{date}             - Lectura por fecha
GET  /api/v1/daily-reading/week               - Lecturas de la semana
POST /api/v1/daily-reading/{id}/mark-read     - Marcar como leída
POST /api/v1/daily-reading/{id}/reflection    - Guardar reflexión
GET  /api/v1/daily-reading/history            - Historial
```

## 🗄️ Base de Datos

### Diagrama ER simplificado

```
users ─────────┬─────────── favorites
               │
               ├─────────── highlights
               │
               ├─────────── writings
               │
               ├─────────── reading_history
               │
               └─────────── user_progress

books ─────────┬─────────── chapters ─────── sections ─────── verses
               │
               └─────────── daily_readings
```

### Migraciones

Las migraciones se ejecutan automáticamente con Flyway al iniciar la aplicación:

- `V1__initial_schema.sql` - Esquema de tablas
- `V2__seed_books.sql` - Catálogo de 73 libros
- `V3__seed_sample_data.sql` - Datos de ejemplo

## 🔐 Seguridad

- Autenticación basada en JWT
- Tokens de acceso (24h) y refresh (7 días)
- Endpoints públicos: Biblia (lectura), Auth
- Endpoints protegidos: Favoritos, Escritos, etc.

## 🧪 Tests

```bash
# Ejecutar todos los tests
./mvnw test

# Tests con cobertura
./mvnw test jacoco:report
```

## 📦 Estructura de Respuestas

### Éxito
```json
{
  "id": "uuid",
  "data": {...}
}
```

### Error
```json
{
  "status": 404,
  "errorCode": "RESOURCE_NOT_FOUND",
  "message": "Libro no encontrado con identificador: xyz",
  "timestamp": "2024-01-15T10:30:00"
}
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea tu rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

---

Desarrollado con ❤️ para llevar la Palabra de Dios a todo el mundo.

