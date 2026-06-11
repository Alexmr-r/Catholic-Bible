# 🚀 Guía de Despliegue en Producción (VPS, Web y Stores)

> **Documento consolidado (junio 2026).** Sustituye a `DEPLOYMENT_QUICKSTART.md`, `DESPLIEGUE_NUBE_GUIA.md` y `BACKEND_DEPLOYMENT_AND_SCRIPTS.md` (archivados en `docs/historico/`). Refleja el flujo de despliegue **real actual**: JAR precompilado + `prod-start.sh` + Cloudflare. La IA en producción es **Cloudflare Workers AI** (Ollama está comentado en `docker-compose.yml`; ver `../07-decisiones-y-pendientes/IA_DECISION_ARQUITECTURA.md`).

---

## 1. Infraestructura

| Pieza | Dónde | Cómo se despliega |
|---|---|---|
| Backend API (Spring Boot) | Droplet DigitalOcean `137.184.139.1` (Ubuntu + Docker) | `./prod-start.sh` (JAR precompilado + scp) |
| PostgreSQL 16 | Mismo Droplet (contenedor `biblia-postgres`, volumen persistente) | docker-compose |
| Web pública | Cloudflare Pages (`getcatholicverse.com`) | `npm run deploy` desde `CatholicVerseWeb/` |
| Backoffice | Cloudflare Pages (`catholic-verse-admin.pages.dev`) | build + deploy de `CatholicVerseBackoffice/` |
| App móvil | App Store / Google Play | EAS Build |
| IA (LLM) | Cloudflare Workers AI (serverless) | Sin despliegue: solo `CLOUDFLARE_*` en `.env` |

---

## 2. Despliegue del backend: estrategia "pre-compilación local"

El Droplet de 1 GB RAM (plan de 6 $) no aguanta compilar Maven dentro de Docker. Por eso:

1. **Compilar en local (Mac):**
   ```bash
   cd BibliaBackend && ./mvnw clean install -DskipTests
   ```
2. **Desplegar con el script (hace todo lo demás):**
   ```bash
   ./prod-start.sh
   ```
   El script: regenera el `Dockerfile` de producción (imagen `eclipse-temurin:21-jre-alpine` que solo arranca el JAR), verifica que exista `target/biblia-api-1.0.0.jar`, lo sube por **scp** junto al `docker-compose.yml` (y el `.env` si lo confirmas), y reinicia los contenedores en el servidor con `docker compose up -d --build api`.

> [!TIP]
> **Futuro:** con un servidor de 4 GB+ RAM convendría volver a compilación interna (CI/CD) para que el despliegue sea 100 % automático desde el código fuente.

### Primera vez en un servidor limpio

```bash
ssh root@137.184.139.1
apt update && apt install -y docker.io docker-compose unzip
mkdir -p /root/BibliaBackend
# crear /root/BibliaBackend/.env con las credenciales (ver §3)
# después, desde el Mac: ./prod-start.sh
```

### Variables de entorno (`.env` en el servidor)

```env
POSTGRES_USER=...
POSTGRES_PASSWORD=...
JWT_SECRET=una_clave_gigante_y_secreta
RESEND_API_KEY=re_...
SPRING_AI_PROVIDER=cloudflare
CLOUDFLARE_ACCOUNT_ID=...
CLOUDFLARE_API_TOKEN=...
```

> ⚠️ El compose arranca la API con `SPRING_PROFILES_ACTIVE: docker`. El perfil `prod` del `application.yml` (Swagger off, CORS en lista blanca, JWT sin fallback) **solo se activa si cambias esa variable a `prod`** — pendiente recogido en la deuda técnica de `../01-sistema/DOCUMENTACION_MAESTRA_2026.md`.

### Mantenimiento y diagnóstico (scripts en la raíz del repo)

| Script | Qué hace |
|---|---|
| `prod-start.sh` | Despliegue completo (ver arriba) |
| `prod-stop.sh` | Para los contenedores remotos |
| `prod-reload-api.sh` / `prod-reload-backend.sh` | Recarga remota tras cambios |
| `prod-logs.sh` / `grep-prod-logs.sh` | Logs remotos (en vivo / filtrados) |
| `prod-inspect.sh` / `prod-inspect-compose.sh` | Estado de contenedores y compose remotos |

---

## 3. Dominio y Cloudflare

1. En Cloudflare (zona `getcatholicverse.com`), registro **A** `api` → IP del Droplet, con **proxy activado** (nube naranja) para tener SSL.
2. SSL en modo **Flexible** (detalle completo en `../01-sistema/ARQUITECTURA_RED_Y_SEGURIDAD.md`).
3. La App ya apunta a `https://api.getcatholicverse.com` en `BibliaAppExpo/src/services/config.ts`: un cambio de servidor no requiere recompilar la app.

---

## 4. Webs (Cloudflare Pages)

**Web pública** (`CatholicVerseWeb/`):
```bash
cd CatholicVerseWeb
npm run deploy   # la primera vez: npm install
```
Cloudflare devuelve una URL `*.pages.dev` de previsualización; el dominio oficial se gestiona en Workers & Pages → Custom Domains.

**Backoffice** (`CatholicVerseBackoffice/`): build de Vite y deploy a Cloudflare Pages (`catholic-verse-admin.pages.dev`). Documentación completa en `../04-backoffice-y-web/BACKOFFICE_ADMIN_DOCUMENTACION.md`.

---

## 5. App móvil: testing privado antes de publicar

⚠️ **Nunca se lanza al público a la primera.**

- **Apple:** TestFlight (enlace privado, pagos en Sandbox).
- **Google:** Pruebas internas de Play Console.

Tras certificar login, pagos y lecturas en dispositivo real durante al menos un día, se publica mundialmente. Guías paso a paso: las guías de `../06-tiendas-y-pagos/`.
