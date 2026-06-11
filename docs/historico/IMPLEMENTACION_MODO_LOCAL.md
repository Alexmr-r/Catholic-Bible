# 📱 Implementación del Modo Local (Offline) — Biblia Católica App

> Documento creado: 30 de marzo de 2026  
> Resumen técnico de cómo funciona el modo offline

---

## 🏗️ Arquitectura General

La app sigue un patrón **"Caché Primero" (Cache-First)** para las pantallas de datos del usuario:

```
┌─────────┐     ┌──────────────┐     ┌──────────┐
│  Pantalla │────▶│  Caché Local  │────▶│  Mostrar  │  (instantáneo)
│ (Screen)  │    │ (AsyncStorage)│    │  al usuario│
└─────────┘     └──────────────┘     └──────────┘
     │
     │  ¿Hay internet?
     │
     ├── SÍ ──▶ Intentar API ──▶ Actualizar pantalla + guardar en caché
     │
     └── NO ──▶ Usar solo los datos de caché (no intenta conectar)
```

---

## 📦 Servicios Involucrados

### 1. `cache.service.ts` — Persistencia Local
Usa `AsyncStorage` (almacenamiento clave-valor del dispositivo) para guardar:

| Clave | Datos | Pantalla |
|-------|-------|----------|
| `@biblia_writings` | Escritos del usuario | Escritos |
| `@biblia_favorites` | Favoritos del usuario | Favoritos |
| `@biblia_daily_reading` | Lectura del día | Lectura Diaria |

Cada entrada se guarda con su `timestamp` para saber qué tan antigua es.

### 2. `favorites.service.ts` — Servicio de Favoritos
```typescript
// Método para leer SOLO de caché (sin API)
async loadFromCache(): Promise<Favorite[]> {
  return await cacheService.getFavorites() || [];
}

// Método principal (API + caché como fallback)
async getFavorites(): Promise<{ favorites, total }> {
  try {
    const response = await apiClient.get('/favorites');
    // ⚠️ Solo cachea si hay datos reales (NUNCA sobreescribe con vacío)
    if (response.favorites.length > 0) {
      await cacheService.setFavorites(response.favorites);
    }
    return response;
  } catch (error) {
    // Fallback a caché
    const cached = await cacheService.getFavorites();
    if (cached && cached.length > 0) return { favorites: cached, total: cached.length };
    throw new Error('SIN_DATOS_OFFLINE');
  }
}
```

### 3. `writings.service.ts` — Servicio de Escritos
Idéntica lógica que favoritos: `loadFromCache()` + `getWritings()` con protección contra cacheo vacío.

---

## 📱 Pantallas — Flujo de Carga

### Favoritos (`FavoritesScreen.tsx`) y Escritos (`WritingsScreen.tsx`)

```typescript
const loadFavorites = async () => {
  // 1. SIEMPRE leer caché primero (instantáneo)
  const cachedData = await favoritesService.loadFromCache();
  if (cachedData.length > 0) {
    setFavorites(cachedData);   // Mostrar inmediatamente
    setIsLoading(false);
  }

  // 2. Solo intentar API si hay conexión
  if (isOnline) {
    try {
      const response = await favoritesService.getFavorites();
      setFavorites(response.favorites);  // Actualizar con datos frescos
    } catch (apiErr) {
      // Si ya tenemos caché, ignorar error silenciosamente
    }
  } else {
    // Sin conexión y sin caché → mensaje amable
    if (cachedData.length === 0) {
      setIsOfflineEmpty(true);
    }
  }
};
```

### Lectura del Día (`DailyReadingScreen.tsx`)
- Misma lógica pero con `dailyReadingService`
- Si está offline y no hay caché, muestra: *"Recupera la conexión para leer la lectura del día."*

---

## 🎨 Estados Visuales Offline

### Estado 1: Offline CON datos en caché
- ✅ Se muestran los datos normalmente
- 📌 Aparece un `OfflineBanner` discreto en la parte superior indicando que está sin conexión

### Estado 2: Offline SIN datos en caché
- ☁️ Icono `cloud-off` (nube tachada) en color gris suave
- 📝 Mensaje amable según la pantalla:
  - **Favoritos:** *"No hay favoritos sincronizados aún. Cuando recuperes la conexión aparecerán aquí."*
  - **Escritos:** *"No hay escritos sincronizados aún. Cuando recuperes la conexión aparecerán aquí."*
  - **Lectura Diaria:** *"Recupera la conexión para leer la lectura del día."*
- ❌ **Sin botón "Reintentar"** (no tiene sentido si no hay internet)

### Estado 3: Online con error de servidor
- ⚠️ Icono `error-outline` en color burgundy
- 📝 Mensaje de error genérico
- 🔄 **Botón "Reintentar" visible** (tiene sentido porque hay internet)

---

## 🛡️ Protecciones Implementadas

### 1. Nunca cachear datos vacíos
```typescript
// ✅ Solo cachear si el API devolvió datos reales
if (writings.length > 0) {
  await cacheService.setWritings(writings);
}
// ❌ Si el array está vacío, NO se sobreescribe la caché existente
```
**Motivo:** Evita el bug donde la API devolvía vacío y sobreescribía datos buenos del caché.

### 2. No intentar API sin internet
```typescript
if (isOnline) {
  // Intentar API
} else {
  // Solo usar caché
}
```
**Motivo:** Sin internet, intentar la API solo causaba un timeout de 4 segundos antes de fallar. Ahora se evita esa espera innecesaria.

### 3. Verificación de caché con longitud
```typescript
if (cachedFavorites && cachedFavorites.length > 0) {
  // Usar datos
}
```
**Motivo:** Un array vacío `[]` es "truthy" en JavaScript. Sin verificar `.length > 0`, se podía devolver un array vacío como si fueran datos válidos.

---

## 🔌 Detección de Conexión

### `NetworkContext.tsx`
Usa `@react-native-community/netinfo` para detectar el estado de red:

```typescript
export const useIsOnline = (): boolean => {
  // Devuelve true/false según el estado de red actual
  // Se actualiza automáticamente cuando cambia la conectividad
};
```

### `OfflineBanner.tsx`
Banner visual que aparece automáticamente cuando no hay conexión. Se muestra en la parte superior de cada pantalla relevante.

---

## 📋 Pantallas con Protección Offline

| Pantalla | Carga caché | Verifica conexión | Banner offline | Mensaje amable |
|----------|:-----------:|:-----------------:|:--------------:|:--------------:|
| FavoritesScreen | ✅ | ✅ | ✅ | ✅ |
| WritingsScreen | ✅ | ✅ | ✅ | ✅ |
| DailyReadingScreen | ✅ | ✅ | ✅ | ✅ |
| ReadingCalendarScreen | ✅ | ✅ | — | ✅ |
| ChangePasswordScreen | — | ✅ | ✅ | ✅ |
| HelpSupportScreen | — | ✅ | ✅ | ✅ |

---

## 🎨 Spinners de Carga

Todos los `ActivityIndicator` y `RefreshControl` usan `colors.primary.DEFAULT`:
- **Modo claro:** Verde (#4CAF50 o similar)
- **Modo oscuro:** Amarillo/Dorado (color primario del tema oscuro)

Esto se aplica en: Favoritos, Escritos, Lectura Diaria, Búsqueda Bíblica, Capítulos, Antiguo/Nuevo Testamento.

---

## 📁 Archivos Principales

| Archivo | Responsabilidad |
|---------|----------------|
| `services/cache.service.ts` | Lectura/escritura en AsyncStorage |
| `services/favorites.service.ts` | Lógica offline para favoritos |
| `services/writings.service.ts` | Lógica offline para escritos |
| `services/daily-reading.service.ts` | Lógica offline para lectura diaria |
| `contexts/NetworkContext.tsx` | Detección de estado de red |
| `components/OfflineBanner.tsx` | Banner visual de desconexión |
