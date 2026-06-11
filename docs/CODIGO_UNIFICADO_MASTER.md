# 🏛️ Arquitectura Maestra de CatholicVerse

> Este archivo unifica las decenas de documentos de implementación (`.md`) que creamos a lo largo de las semanas. Los archivos antiguos se han archivado en `docs/historico_desarrollo/` para no ensuciar el proyecto.

---

## 1. 📱 Frontend (Expo / React Native)

El cliente de CatholicVerse es una App de React Native puramente nativa con las siguientes verticales de interacción:

### Funcionalidades Core:
- **Lectura Offline de la Biblia:** La lógica guarda en caché y AsyncStorage todos los capítulos descargados para que los usuarios sin cobertura puedan seguir usando la app sin bloqueos (usando la API unificada del backend o los fallbacks locales de `OfflineBanner`).
- **Sistema de Caché Inteligente:** La app sincroniza los últimos cambios de favoritos o reflexiones silenciosamente (`SISTEMA_CACHE_SINCRONIZACION.md`).
- **Búsqueda por Voz Nativa:** Implementada recientemetne usando la librería nativa de `expo-speech-recognition` totalmente empaquetada. 
- **Tematización Dinámica:** (Modo Oscuro / Claro) manejado nativamente via `ThemeContext`.

### Interfaz del Muro de Pago (*Paywall*):
El paywall está agnóstico a la moneda. Se extrae `product.priceString` dinámicamente usando las librerías oficiales de RevenueCat (`react-native-purchases`). Nunca calcules manualmente tasas de conversión, la App Store local lo procesa.

---

## 2. ☕ Backend (Spring Boot 3 + Java 21)

La capa defensiva e interactiva es un `.jar` robusto con perfiles de entornos estrictos (`dev`, `docker`, `prod`).

### Características Centrales:
- **Resend Email Service:** Para los flujos de "Olvidó su contraseña". Un código de 6 dígitos con 5 minutos de validez se cruza hasta la bandeja de entrada del solicitante usando la clave de entorno `RESEND_API_KEY`.
- **Inyección de Dependencias Rigurosa:** Las conexiones de JPA usan `validate` en producción.
- **Microservicio de IA Gen (Ollama):** Procesamiento de LLM vía una conexión REST directa aislando la potencia de CPU. La IA se consume por el `/chat` endpoint.
- **Protección JWT + CORS:** Acceso mediante token "Bearer" estricto y políticas de Origins exclusivos para evitar inyecciones. No hay contraseñas locales hardcodeadas, si `/prod` se ejecuta sin llaves, crashea por seguridad.

---

## 3. 🌐 Infraestructura y Emisión al Mundo

### Puesta en Producción Base de Datos y Servidor (DigitalOcean/Hetzner)
1. Construye el backend para Docker usando `prod-start.sh`.
2. Conecta las credenciales privadas inyectadas de AWS RDS, Supabase o una base de datos PostgreSQL interna aislada dentro del VPS.
3. Desactiva los flujos de DEBUG con `__DEV__ == false` y `logging.level.root = WARN`.

### Web Landing Page (`getcatholicverse.com`)
1. Todo el contenido público (`CatholicVerseWeb/index.html`) ha sido purgado de símbolos internacionales absolutos o se han protegido informando que Apple ajustará la divisa original automáticamente.
2. Desplegado gratuitamente usando la conexión "GitHub -> Cloudflare Pages".
3. Cloudflare brinda WAF y certificado Edge SSL inmediato.

---

## 4. ⚖️ Cumplimiento Legal (Norteamérica)

- **End User License Agreement (EULA):** Validables legalmente en los registros de cuentas, con aperturas "in-app browser" (para cumplir revisiones automáticas Apple). Escrutados y públicos bajo `/terms.html`.
- **Privacidad General:** Regulada según la estandarización PIPEDA (Canadá) y COPPA/CCPA (USA).

> **Estatus Legal del Código:** Actualmente en Fase Final Gold. Todo el desarrollo programático cumple estrictamente con las directivas corporativas y está completamente unificado bajo un único estándar de calidad global.
