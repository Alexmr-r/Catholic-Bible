# CatholicVerse Backoffice — Documentación Técnica Completa

> **Fecha de creación**: Mayo 2026  
> **Última actualización**: Junio 2026  
> **URL de Producción (Cloudflare Pages)**: https://catholic-verse-admin.pages.dev  
> **Stack Frontend**: React 19 + TypeScript + Vite (Vanilla CSS, sin Tailwind)  
> **Stack Backend**: Spring Boot 3 + Java 21 + PostgreSQL 16 (Arquitectura Hexagonal)

---

## 1. Resumen Ejecutivo

El **CatholicVerse Backoffice** es un panel de administración web completo que permite gestionar en tiempo real el ecosistema de la aplicación móvil CatholicVerse. Conecta directamente con la base de datos PostgreSQL de producción a través del backend Spring Boot existente.

### Funcionalidades Principales
| Módulo | Descripción | Estado |
|--------|-------------|--------|
| **Login Administrativo** | Portal de autenticación con credenciales de administrador | ✅ Completado |
| **Dashboard Dinámico** | KPIs reales (usuarios, premium, conversión, activos) desde PostgreSQL | ✅ Completado |
| **CRM de Usuarios** | Listado, filtrado, cambio de plan y eliminación GDPR de usuarios | ✅ Completado |
| **CMS Litúrgico** | CRUD completo de lecturas diarias litúrgicas | ✅ Completado |
| **Bible Editor (CMS)** | Corrección de erratas en versículos bíblicos en caliente | ✅ Completado |
| **Audit Logs** | Visor de logs reales de base de datos (registros, favoritos, diarios) | ✅ Completado |
| **Settings** | Configuración de endpoints, claves API y prompt del asistente IA | ✅ Completado |
| **Tema Claro/Oscuro** | Selector dinámico de tema con persistencia en localStorage | ✅ Completado |

---

## 2. Endpoints del Backend Creados (AdminController.java)

Se creó un nuevo controlador REST completo en el backend de Spring Boot:

**Archivo**: `BibliaBackend/src/main/java/com/bibliacatolica/api/infrastructure/adapter/in/rest/controller/AdminController.java`

### 2.1 Gestión de Usuarios & CRM

| Método | Endpoint | Descripción | Request Body |
|--------|----------|-------------|--------------|
| `GET` | `/admin/users` | Lista todos los usuarios registrados en PostgreSQL | — |
| `PUT` | `/admin/users/{userId}/plan` | Cambia el plan del usuario (Premium / Free) sin pasarela de pago | `{ "plan": "Premium" }` |
| `DELETE` | `/admin/users/{userId}` | Elimina al usuario de la tabla `users` (cumplimiento GDPR / Apple) | — |

> **⚠️ IMPORTANTE sobre DELETE /admin/users/{userId}**: Este endpoint elimina al usuario de la tabla `users`, pero **NO borra la tabla `user_trials`**. Esto es intencional y crítico: si el usuario vuelve a registrarse con el mismo correo, el backend detectará en `user_trials` que ya usó su período de prueba gratuito de 7 días y no le dará otro trial nuevo. La seguridad anti-abuso de trials está 100% preservada.

### 2.2 Gestión de Lecturas Litúrgicas (CMS)

| Método | Endpoint | Descripción | Request Body |
|--------|----------|-------------|--------------|
| `GET` | `/admin/daily-readings` | Lista todas las lecturas litúrgicas programadas | — |
| `POST` | `/admin/daily-readings` | Crea o actualiza una lectura litúrgica para una fecha | `{ date, title, badge, bookId, bookName, chapterNumber, verseNumbers, readingText, officialReflection }` |
| `DELETE` | `/admin/daily-readings/{date}` | Elimina la lectura litúrgica de una fecha específica (ej. `2026-05-22`) | — |

### 2.3 CMS de Contenido Bíblico (Corrección de Erratas)

| Método | Endpoint | Descripción | Request Body |
|--------|----------|-------------|--------------|
| `PUT` | `/admin/bible/verses` | Modifica el texto de un versículo directamente en PostgreSQL | `{ "bookId": "...", "chapterNumber": 1, "verseNumber": 3, "text": "nuevo texto" }` |

### 2.4 Telemetría Dinámica y Logs de Transacciones Reales (Nuevos Endpoints)

Con el fin de eliminar cualquier dato "mockeado" o estático del portal administrativo, se crearon los siguientes endpoints:

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/admin/dashboard-stats` | Genera estadísticas de telemetría dinámicas sobre el volumen de usuarios, suscripciones premium reales, estimación de sesiones activas en base a la concurrencia física y distribución geográfica por dominios de email (`.es`, `.mx`, `.cl`, etc.). |
| `GET` | `/admin/audit-logs` | Recopila logs de transacciones del sistema combinando usuarios creados (`AUTH`), reflexiones guardadas (`AI_ENGINE`), y versículos marcados como favoritos (`DATABASE`), ordenados en tiempo real por fecha descendente. |

### 2.5 DTOs Creados (Records de Java)

```java
public record UserDto(String id, String name, String email, String plan, String joined, String lastLogin) {}
public record UpdatePlanRequest(String plan) {}
public record SaveReadingRequest(String date, String title, String badge, String imageUrl, 
                                  String bookId, String bookName, int chapterNumber, 
                                  List<Integer> verseNumbers, String readingText, String officialReflection) {}
public record UpdateVerseRequest(String bookId, int chapterNumber, int verseNumber, String text) {}
public record VerseDto(int verseNumber, String text) {}

// Telemetría & Logs
public record DashboardStatsResponse(long totalUsers, long premiumUsers, long activeNow, long aiQueriesCount, List<DistributionDto> userDistribution, List<TrendingPromptDto> trendingPrompts) {}
public record DistributionDto(String country, long count, int percentage) {}
public record TrendingPromptDto(String prompt, long queries) {}
public record AuditLogResponse(String id, String timestamp, String source, String level, String message, String executionTime) {}
```

---

## 3. Archivos del Backend Modificados

### 3.1 Archivos Creados desde Cero
| Archivo | Ruta | Descripción |
|---------|------|-------------|
| `AdminController.java` | `infrastructure/adapter/in/rest/controller/` | Controlador REST administrativo completo con endpoints de CRM, CMS, Telemetría y Logs. |

### 3.2 Archivos Modificados (Cambios Puntuales)

| Archivo | Cambio Realizado |
|---------|-----------------|
| **`User.java`** (domain/model) | Añadido método inmutable `withPremium(boolean)` para cambiar el estado premium sin mutar el objeto original |
| **`Verse.java`** (domain/model) | Añadido método inmutable `withText(String)` para actualizar texto de versículos |
| **`BibleUseCase.java`** (domain/port/in) | Añadida firma `updateVerseText(bookId, chapter, verse, text)` |
| **`BibleService.java`** (application/service) | Implementación de `updateVerseText` usando `withText()` del dominio |
| **`BiblePersistenceAdapter.java`** (infrastructure/adapter/out) | Implementado `saveVerse(Verse)` para persistir cambios en PostgreSQL |
| **`DailyReadingUseCase.java`** (domain/port/in) | Añadidas firmas `saveDailyReading()` y `deleteDailyReadingByDate()` |
| **`DailyReadingService.java`** (application/service) | Implementación de save y delete para lecturas litúrgicas |
| **`DailyReadingRepositoryPort.java`** (domain/port/out) | Añadidas firmas `findAll()`, `save()` y `delete(UUID)` |
| **`DailyReadingPersistenceAdapter.java`** (infrastructure/adapter/out) | Implementación de las operaciones de persistencia |
| **`UserRepositoryPort.java`** (domain/port/out) | Añadida firma `findAll()` para listar todos los usuarios |
| **`UserPersistenceAdapter.java`** (infrastructure/adapter/out) | Implementado `findAll()` consultando la tabla `users` |
| **`SecurityConfig.java`** (infrastructure/config/security) | Añadida regla `.requestMatchers("/admin/**").permitAll()` para acceso público temporal en desarrollo |
| **`application.yml`** (resources) | Añadida la URL del backoffice a `cors.allowed-origins` en el perfil de producción para prevenir bloqueos de CORS. |

---

## 4. Archivos del Frontend (React + TypeScript)

### 4.1 Detalle de Mejoras en la Interfaz de Usuario (UI/UX)
- **Eliminación del Destello Blanco (Visual Polish)**: Se añadieron estilos inline de fondo directamente dentro de las etiquetas `<html>` y `<body>` de `index.html` (`background-color: #1a160d`) para asegurar un fondo oscuro unificado antes de que React cargue.
- **Header Profile Dropdown**: Se eliminó la campana de notificaciones estática y se reemplazó el texto del usuario por un menú desplegable interactivo que permite navegar a Settings o desloguearse.
- **Logout Integrado**: La acción de Logout borra la sesión persistida en localStorage y redirige al portal de Login.

### 4.2 Detalle de Cada Componente

#### `Login.tsx` — Portal de Autenticación
- **Credenciales**: Usuario `admin` / Contraseña `catholicadmin`
- Almacena estado de sesión en `localStorage('isAuthenticated')`

#### `Dashboard.tsx` — Panel de KPIs Dinámicos
- Realiza una consulta `GET /admin/dashboard-stats` al cargar para obtener la telemetría calculada en tiempo real por el backend.
- Muestra el total de usuarios, miembros premium, concurrencia aproximada actual (`activeNow`), consultas acumuladas de Ollama y la distribución geográfica del tráfico analizando las extensiones de correos de la base de datos PostgreSQL.
- Degrada graciosamente a un Sandbox local si el backend está desconectado.

#### `Users.tsx` — CRM de Usuarios
- CRUD interactivo para cambiar planes o borrar cuentas (Derecho al Olvido de Apple).

#### `Content.tsx` — CMS de Contenido
-CRUD de lecturas litúrgicas diarias y edición en caliente de versículos de la Biblia.

#### `Logs.tsx` — Audit Logs
- Consulta dinámica al endpoint `/admin/audit-logs` para mostrar el visor de logs del sistema extraídos de las actividades de los usuarios en PostgreSQL (altas, modificaciones, favoritos, lecturas).
- Ofrece filtros de fuentes y muestra estados de conexión en directo de Spring, PostgreSQL y Ollama.

#### `Settings.tsx` — Configuración del Sistema
- Configuración de URLs de APIs (`https://api.getcatholicverse.com/api/v1`), Ollama, claves de RevenueCat, y prompts teológicos.

---

## 5. Arquitectura de Conexión, CORS y HTTPS

### 5.1 ¿Qué estaba fallando en la red?
Cuando el administrador accedía al panel web en `https://catholic-verse-admin.pages.dev` e intentaba conectarse al backend usando `http://137.184.139.1:8080`, el navegador bloqueaba las llamadas de forma inmediata debido a dos restricciones de seguridad modernas:
1. **Mixed Content (Contenido Mixto)**: Una página servida a través de un protocolo seguro (`HTTPS`) tiene estrictamente prohibido realizar peticiones HTTP no cifradas (`HTTP`). Los navegadores bloquean estas peticiones para prevenir ataques man-in-the-middle.
2. **CORS (Cross-Origin Resource Sharing)**: Dado que el panel web se ejecuta en un dominio diferente al de la API, el backend de Spring Boot debe autorizar explícitamente el origen de la petición. Si no está en la lista de permitidos (`cors.allowed-origins`), el servidor responde con un error `403 Forbidden`.

### 5.2 Solución Implementada
Para solucionar estos problemas y habilitar el canal de producción:
- **Tránsito Seguro por Cloudflare Proxy**: Configuramos la base URL del backend en la vista de Settings para apuntar a `https://api.getcatholicverse.com/api/v1`. Al pasar a través de Cloudflare, la petición HTTP viaja encriptada bajo HTTPS, evitando Mixed Content. Cloudflare realiza la terminación SSL y redirige la petición internamente al puerto 80 del servidor.
- **CORS Whitelisting**: Se actualizó el archivo `application.yml` en la configuración de producción para registrar y autorizar el origen de Cloudflare Pages del panel administrativo:
  ```yaml
  cors:
    allowed-origins: "https://catholic-verse-admin.pages.dev,http://localhost:5173"
  ```
- **Firma de CORS**: Se reforzó `AdminController.java` para aceptar CORS a nivel de controlador.

---

## 6. Flujo de Datos Completo (Diagrama)

```
┌─────────────────────────────────┐
│   CatholicVerse Backoffice      │
│   (React + TypeScript + Vite)   │
│   Cloudflare Pages              │
│   https://catholic-verse-admin  │
│   .pages.dev                    │
└──────────┬──────────────────────┘
           │ fetch() REST API (HTTPS Cifrado)
           │ Destino: https://api.getcatholicverse.com
           ▼
┌─────────────────────────────────┐
│   Cloudflare Proxy (SSL Term)   │
│   Mapea SSL a conexión interna  │
└──────────┬──────────────────────┘
           │ HTTP (Puerto 80/8080)
           ▼
┌─────────────────────────────────┐
│   Spring Boot Backend           │
│   AdminController.java          │
│   /admin/dashboard-stats        │
│   /admin/audit-logs             │
│   IP: 137.184.139.1             │
└──────────┬──────────────────────┘
           │ JPA / Hibernate
           ▼
┌─────────────────────────────────┐
│   PostgreSQL 16                 │
│   Tablas: users, verses, books, │
│   chapters, daily_readings,     │
│   writings, favorites           │
│   DB: biblia_prod               │
└─────────────────────────────────┘
```
