# 📚 Documentación de CatholicVerse

> **¿Primera vez aquí?** Lee [`01-sistema/DOCUMENTACION_MAESTRA_2026.md`](./01-sistema/DOCUMENTACION_MAESTRA_2026.md): es el documento canónico, **verificado línea a línea contra el código** (junio 2026). Si cualquier otro documento lo contradice, manda la Maestra.

Toda la documentación del proyecto vive en esta carpeta, organizada por temas:

```
docs/
├── 01-sistema/                  ← Qué es y cómo funciona TODO el sistema
├── 02-backend/                  ← Guías didácticas del backend (Spring Boot)
├── 03-app-movil/                ← Guías del frontend (React Native / Expo)
├── 04-backoffice-y-web/         ← Panel admin y web pública
├── 05-despliegue/               ← Cómo llevar todo a producción
├── 06-tiendas-y-pagos/          ← App Store, Google Play, RevenueCat, Firebase
├── 07-decisiones-y-pendientes/  ← Decisiones de arquitectura y TODOs
├── 08-tfc/                      ← Entregables académicos del TFC
└── historico/                   ← Archivo de fases pasadas (NO refleja el estado actual)
```

---

## 01-sistema — Visión global

| Documento | Qué cuenta |
|---|---|
| [DOCUMENTACION_MAESTRA_2026.md](./01-sistema/DOCUMENTACION_MAESTRA_2026.md) | ⭐ **El documento principal**: arquitectura, catálogo completo de endpoints, BD, seguridad JWT, IA RAG, offline, suscripciones, deuda técnica y Q&A de defensa |
| [ARQUITECTURA_RED_Y_SEGURIDAD.md](./01-sistema/ARQUITECTURA_RED_Y_SEGURIDAD.md) | Red: Cloudflare, SSL Flexible, CORS y perfiles de Spring |
| [MODELO_DATOS_BBDD.md](./01-sistema/MODELO_DATOS_BBDD.md) | Modelo y diccionario de datos (PostgreSQL, Flyway V1–V11) |
| [ANALISIS_FUNCIONAL.md](./01-sistema/ANALISIS_FUNCIONAL.md) | Casos de uso y requisitos funcionales |
| [GUIA_TESTS.md](./01-sistema/GUIA_TESTS.md) | Qué prueba cada test (backend y app) |

## 02-backend — Guías didácticas (Spring Boot + Docker)

> Escritas en la fase inicial; los conceptos son válidos y llevan un aviso de contexto al inicio. Para el estado actual exacto, la Maestra.

[README.md](./02-backend/README.md) (visión general y endpoints) · [INDICE_DOCUMENTACION.md](./02-backend/INDICE_DOCUMENTACION.md) (índice y orden de lectura) · [ARQUITECTURA_BACKEND.md](./02-backend/ARQUITECTURA_BACKEND.md) · [CLASES_DETALLADAS.md](./02-backend/CLASES_DETALLADAS.md) · [INYECCION_DEPENDENCIAS_Y_CONFIG.md](./02-backend/INYECCION_DEPENDENCIAS_Y_CONFIG.md) · [EXPLICACION_DOCKERIZACION.md](./02-backend/EXPLICACION_DOCKERIZACION.md) · [COMO_FUNCIONA_DOCKER_Y_MIGRACIONES.md](./02-backend/COMO_FUNCIONA_DOCKER_Y_MIGRACIONES.md) · [GUIA_MIGRACIONES_FLYWAY.md](./02-backend/GUIA_MIGRACIONES_FLYWAY.md) · [DIAGRAMA_MIGRACIONES.md](./02-backend/DIAGRAMA_MIGRACIONES.md) · [GUIA_INICIO_RAPIDO.md](./02-backend/GUIA_INICIO_RAPIDO.md) · [CHEAT_SHEET.md](./02-backend/CHEAT_SHEET.md) · [FAQ_SWAGGER_Y_DATOS.md](./02-backend/FAQ_SWAGGER_Y_DATOS.md) · [RESPUESTAS_DIRECTAS.md](./02-backend/RESPUESTAS_DIRECTAS.md)

## 03-app-movil — Frontend (React Native + Expo)

| Documento | Qué cuenta |
|---|---|
| [GUIA_DESARROLLO.md](./03-app-movil/GUIA_DESARROLLO.md) | Entorno de desarrollo: prebuild, simuladores iOS/Android, troubleshooting |
| [GUIA_COLORES.md](./03-app-movil/GUIA_COLORES.md) | Sistema de colores (`src/theme/colors.ts`) y buenas prácticas |
| [RESPONSIVE_PATTERN.md](./03-app-movil/RESPONSIVE_PATTERN.md) | Patrón de pantallas responsive sin scroll |
| [MEJORES_PRACTICAS_NAVEGACION.md](./03-app-movil/MEJORES_PRACTICAS_NAVEGACION.md) | React Navigation tipado con TypeScript |
| [GUIA_DESARROLLO_TTS.md](./03-app-movil/GUIA_DESARROLLO_TTS.md) | Narrador IA offline (sherpa-onnx + Piper) |
| [FIX_TTS_AND_PAYWALL_STABILITY.md](./03-app-movil/FIX_TTS_AND_PAYWALL_STABILITY.md) | ⚠️ Workaround vigente: crash TTS en Android (patch a sherpa-onnx 0.2.6) y estabilidad RevenueCat |
| [SHARE_SERVICE_GUIA.md](./03-app-movil/SHARE_SERVICE_GUIA.md) | Servicio de compartir (`share.service.ts`) |
| [SOCIAL_AUTH_GUIDE.md](./03-app-movil/SOCIAL_AUTH_GUIDE.md) | Cómo funciona el login con Google y Apple en Expo |
| [LOGICA_DESCARGA_TOKEN.md](./03-app-movil/LOGICA_DESCARGA_TOKEN.md) | Autenticación en la descarga de la Biblia offline |
| [ANDROID_ASSETS_SPLASH.md](./03-app-movil/ANDROID_ASSETS_SPLASH.md) | Splash screens e iconos en Android 12+ vs iOS |
| [SOLUCION_CONECTIVIDAD_ANDROID.md](./03-app-movil/SOLUCION_CONECTIVIDAD_ANDROID.md) | Detección de red fiable en Android (NetInfo) |

## 04-backoffice-y-web

[BACKOFFICE_ADMIN_DOCUMENTACION.md](./04-backoffice-y-web/BACKOFFICE_ADMIN_DOCUMENTACION.md) — Panel de administración completo (React 19 + Vite): páginas, endpoints `/admin`, despliegue. La web pública se describe en la Maestra (sección 12) y en `CatholicVerseWeb/README.md`.

## 05-despliegue

| Documento | Qué cuenta |
|---|---|
| [GUIA_DESPLIEGUE.md](./05-despliegue/GUIA_DESPLIEGUE.md) | ⭐ Todo el despliegue: VPS DigitalOcean, scripts `prod-*`, variables de entorno, Cloudflare Pages, TestFlight |
| [GUIA_SUBIDAS_Y_CLOUDFLARE.md](./05-despliegue/GUIA_SUBIDAS_Y_CLOUDFLARE.md) | Flujo de subida de cada componente y ajustes de Cloudflare (timeouts, IA) |

## 06-tiendas-y-pagos

| Documento | Qué cuenta |
|---|---|
| [APP_STORE_CONNECT_GUIA.md](./06-tiendas-y-pagos/APP_STORE_CONNECT_GUIA.md) | Apple: App ID, App Store Connect, suscripciones |
| [GOOGLE_PLAY_CONSOLE_GUIA.md](./06-tiendas-y-pagos/GOOGLE_PLAY_CONSOLE_GUIA.md) | Google Play Console + Service Account para RevenueCat |
| [GUIA_PUBLICACION_PLAY_STORE.md](./06-tiendas-y-pagos/GUIA_PUBLICACION_PLAY_STORE.md) | Publicación en Google Play |
| [GUIA_DEFINITIVA_REVENUECAT.md](./06-tiendas-y-pagos/GUIA_DEFINITIVA_REVENUECAT.md) | RevenueCat: entitlement `CatholicVerse Premium`, offerings, paquetes |
| [CHECKLIST_REVENUECAT_STORES.md](./06-tiendas-y-pagos/CHECKLIST_REVENUECAT_STORES.md) | Solución de errores de pago (`ITEM_UNAVAILABLE`, ofertas vacías) |
| [GUIA_FIREBASE_VS_GOOGLE_CLOUD.md](./06-tiendas-y-pagos/GUIA_FIREBASE_VS_GOOGLE_CLOUD.md) | Qué consola usar para cada cosa (Google Sign-In) |
| [CONFIGURACION_GOOGLE_AUTH.md](./06-tiendas-y-pagos/CONFIGURACION_GOOGLE_AUTH.md) | Credenciales reales de Google/Apple Auth (client IDs verificados) |

## 07-decisiones-y-pendientes

| Documento | Qué cuenta |
|---|---|
| [IA_DECISION_ARQUITECTURA.md](./07-decisiones-y-pendientes/IA_DECISION_ARQUITECTURA.md) | ⭐ Decisión: Cloudflare Workers AI en lugar de Ollama (y cómo revertirla) |
| [POST_MORTEM_BILINGUE.md](./07-decisiones-y-pendientes/POST_MORTEM_BILINGUE.md) | Decisión: Biblia en español pospuesta a V2.0 |
| [TODO_DROP_CAP.md](./07-decisiones-y-pendientes/TODO_DROP_CAP.md) | Pendiente: drop cap real en la lectura |

> Más deuda técnica priorizada: sección 16 de la [Documentación Maestra](./01-sistema/DOCUMENTACION_MAESTRA_2026.md#16-deuda-técnica-y-riesgos-conocidos).

## 08-tfc — Entregables académicos

[HITO_1_TFC.md](./08-tfc/HITO_1_TFC.md) (propuesta) · [MEMORIA_TFC.md](./08-tfc/MEMORIA_TFC.md) (memoria completa)

## historico/ — Archivo

Documentos de fases pasadas: logs de implementación pantalla a pantalla (`historico/frontend/`), correcciones ya aplicadas, planes superados (Ollama, mocks) y antiguos docs "maestros" sustituidos. **No usar como referencia del estado actual**; se conservan para no perder el historial.

---

### Documentación fuera de `docs/`

- `README.md` (raíz) — inicio rápido del monorepo y scripts
- `BibliaAppExpo/README.md`, `CatholicVerseBackoffice/README.md`, `CatholicVerseWeb/README.md` — resumen de cada proyecto
- `postman/README.md` — colección Postman (58 peticiones)
- `documentacion-web.html` y `assets/` — visor HTML de documentación

**Última reorganización:** 11 de junio de 2026.
