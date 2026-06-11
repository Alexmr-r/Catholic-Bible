# 🗄️ Arquitectura de Caché, Datos Offline y Estado
> *Documento maestro que aborda todo el ecosistema de persistencia de bases de datos offline de CatholicVerse, unificando los antiguos historiales de caché y lógica de la Biblia offline.*

## 1. El Reto Offline First (Modo Avión)
La aplicación exige como requerimiento empresarial que los usuarios puedan descargar la Biblia completa y leerla en misas o vuelos sin internet.
**Arquitectura de Solución:**
1. **NetworkContext**: Detecta constantemente el API status (`isOnline()`).
2. Si el usuario pierde conexión, las pantallas interceptan el error 404/500 de `api.client` y redirigen silenciosamente al almacenamiento local asíncrono o a SQLite encriptado (dependiendo si se pre-descargó o solo se cachó en RAM).
3. Todo esto fue documentado exhaustivamente en `TESTING_MODO_OFFLINE.md` y `SISTEMA_CACHE_OFFLINE.md`.

## 2. Biblias y Procesamiento
- La API original de la Biblia (JSON crudo de 9MB `bible_raw.json`) se ingiere a petición durante el Onboarding o desde el módulo "Mis Descargas".
- **Lógica de fallback:** Si el backend central se cae, la lectura diaria no se destruye. La App calcula basándose en el UTC Timestamp qué versículo tocaba hoy y utiliza la base de datos descargada para ensamblar dinámicamente el `DailyReadingScreen`.

## 3. Estado Asíncrono e Hitrial de Usuario (Sync Queue)
Qué pasa si el usuario guarda 5 reflexiones y marca 3 favoritos estando Offline en una iglesia?
- **SyncQueue (Cola de Sincronización):** En el archivo `SISTEMA_CACHE_SINCRONIZACION.md` creamos una lógica en segundo plano. Las notas offline se apilan en el `AsyncStorage` con una flag `isSynced: false`. 
- **Rebote:** Cuando `NetworkContext` detecta conexión estable, dispara silenicosamente un Worker en background que agarra la cola y empuja las reflexiones al backend (Spring Boot), resolviendo conflictos de UUID y manteniendo el Dashboard siempre fresco en web y móviles simultáneamente.
