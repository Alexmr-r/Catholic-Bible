# 📥 Modo Offline Completo - Implementación

## Resumen
Sistema completo de modo offline para la app de la Biblia. Permite:
- Descargar la Biblia en inglés para uso sin conexión
- Cachear la liturgia del día automáticamente
- Guardar favoritos/escritos offline y sincronizar cuando vuelva la conexión
- Detectar automáticamente el estado de conexión

## ✅ Funcionalidades Implementadas

### 1. Detección de Conexión + Sincronización Automática

**NetworkContext** (`src/contexts/NetworkContext.tsx`):
- Usa `@react-native-community/netinfo`
- Detecta cambios de conexión en tiempo real
- **Sincroniza automáticamente** datos pendientes cuando vuelve la conexión

```typescript
const isOnline = useIsOnline(); // true/false
```

### 2. Favoritos y Escritos Offline

**YA IMPLEMENTADO en `favorites.service.ts` y `writings.service.ts`:**
- Sin internet → Guarda en caché local con ID temporal
- Marca la operación para sincronización (`addPendingSync`)
- Cuando vuelve internet → `syncService.syncAll()` sube todo a la BD

### 3. Descarga de Biblia (Opcional)

**ManageDownloadsScreen** + **english-bible-download.service.ts**:
- El usuario decide si descarga la Biblia (~10 MB)
- NO se cachea automáticamente (muy pesado)
- Si está offline sin descarga → Redirige a pantalla de descarga

### 4. Caché de Liturgia del Día

**cache.service.ts** + **DailyReadingScreen.tsx**:
- Cada día que visita se guarda en caché
- TTL de 24 horas
- Si está offline → Usa caché si existe

## Comportamiento por Pantalla

| Pantalla | Online | Offline + Descarga | Offline sin Descarga |
|----------|--------|-------------------|---------------------|
| Lectura del Día | API → Cachea | Usa caché | "No disponible" |
| Biblia/Búsqueda | API | Datos locales | Alert → Descargar |
| Leer Capítulo | API | Datos locales | Alert → Descargar |
| Favoritos | API | Caché + Sync | Caché + Sync |
| Escritos | API | Caché + Sync | Caché + Sync |

## Configuración

La URL del backend se configura en **un solo lugar**:

**`src/services/config.ts`:**
```typescript
// ⚠️ CAMBIA ESTA IP SI CAMBIAS DE RED WIFI
const LOCAL_IP = '192.168.1.44';
```

Todos los servicios (API, descarga de Biblia) usan esta configuración.

## Decisiones de Diseño

### ❌ NO pre-cargamos liturgia de la semana
- Añade complejidad innecesaria
- El usuario solo ve un día a la vez normalmente
- Si visita un día, ese día queda cacheado

### ❌ NO cacheamos la Biblia automáticamente
- Son ~10 MB, demasiado pesado
- El usuario decide si quiere descargarla
- Sin descarga + sin internet = "Descarga para usar offline"

### ✅ SÍ sincronizamos automáticamente al reconectar
- Favoritos y escritos creados offline
- Se suben a la BD cuando vuelve internet
- Transparente para el usuario

## Archivos Principales

| Archivo | Función |
|---------|---------|
| `NetworkContext.tsx` | Detecta conexión + sincroniza |
| `cache.service.ts` | Caché local (favoritos, escritos, liturgia) |
| `sync.service.ts` | Sincroniza pendientes con BD |
| `english-bible-download.service.ts` | Descarga/lee Biblia offline |
| `ManageDownloadsScreen.tsx` | UI para descargar Biblia |
| `useOfflineBible.ts` | Hook inteligente para offline |

---
**Estado:** ✅ Implementación completa
**Fecha:** Febrero 2026
