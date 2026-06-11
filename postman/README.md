# Biblia Católica API — Colección Postman

Pruebas para **todo el backend** (Spring Boot, `http://localhost:8080/api/v1`).

## Archivos
- `BibliaCatolica.postman_collection.json` — 58 peticiones en 10 carpetas.
- `BibliaCatolica.postman_environment.json` — entorno `Local` con todas las variables.

## Importar
1. Postman → **Import** → arrastra ambos `.json`.
2. Arriba a la derecha, selecciona el entorno **"Biblia Católica - Local"**.

## Uso
1. Ejecuta **Auth → Register** o **Auth → Login**. El `accessToken`, `refreshToken` y `userId` se guardan **automáticamente** (script en la pestaña *Tests*) y se inyectan como Bearer en las peticiones protegidas.
2. Las peticiones que crean recursos (Add Favorite, Highlight Verse, Create Writing) guardan su `id` en variables (`favoriteId`, `highlightId`, `writingId`) para usarlas en Update/Delete.
3. Cada petición incluye tests básicos (status 2xx + tiempo de respuesta).

## Variables clave
`baseUrl`, `accessToken`, `refreshToken`, `userId`, `testEmail`, `testPassword`, `bookId`, `chapterNumber`, `readingDate`, `readingId`, `resetCode`, `favoriteId`, `highlightId`, `writingId`.

## Carpetas
Auth · Users · Bible · Daily Reading · Reading Progress · Favorites · Highlights · Writings · AI Chat · Admin

> Endpoints públicos (según `SecurityConfig`): `/auth/**`, `/bible/books/**`, `/bible/english/download`, `/daily-reading/**`, `POST /chat`, `/admin/**`. El resto requiere Bearer token.
> Para correr toda la colección: **Collection Runner** (ejecuta Login primero).
