# 📱 Sistema de Caché y Sincronización Offline

## Índice
1. [Explicación Sencilla](#-explicación-sencilla-para-todos)
2. [Documentación Técnica](#-documentación-técnica)
3. [Calendario y Modo Offline](#-calendario-y-modo-offline)

---

## 🌟 Explicación Sencilla (Para Todos)

### ¿Qué pasa cuando no tienes internet?

Imagina que la app es como una libreta que puedes usar en cualquier lugar:

| Acción | Con Internet | Sin Internet |
|--------|--------------|--------------|
| **Leer la Biblia** | Lee del servidor | Lee la descarga local (si la descargaste) |
| **Ver lectura del día** | Descarga y guarda | Muestra la que guardó antes |
| **Escribir una reflexión** | Guarda en el servidor | Guarda en tu teléfono → Sube cuando vuelva internet |
| **Añadir a favoritos** | Guarda en el servidor | Guarda en tu teléfono → Sube cuando vuelva internet |
| **Marcar lectura como completada** | Guarda en el servidor | Guarda en tu teléfono → Sube cuando vuelva internet |
| **Ver calendario** | Descarga del servidor | Muestra lo que ya tenía guardado |

### ¿Cómo funciona la sincronización?

1. **Estás sin internet** → Guardas algo (reflexión, favorito, etc.)
2. La app lo guarda en tu teléfono con una "nota" que dice "pendiente de subir"
3. **Vuelve el internet** → La app detecta la conexión automáticamente
4. **Se sincroniza solo** → Sube todo lo pendiente al servidor
5. ¡Listo! Tus datos están seguros en la nube

### ¿Qué NO funciona sin internet?

- ❌ **Leer la Biblia** si no la descargaste antes
- ❌ **Ver la lectura de un día** que no visitaste antes
- ❌ **Buscar en la Biblia** si no la descargaste

### ¿Qué SÍ funciona sin internet?

- ✅ **Escribir reflexiones** (se sincronizan después)
- ✅ **Añadir favoritos** (se sincronizan después)
- ✅ **Marcar lecturas completadas** (se sincronizan después)
- ✅ **Ver el calendario** con las fechas que ya cargaste antes
- ✅ **Leer la Biblia** si la descargaste

---

## 🔧 Documentación Técnica

### Arquitectura General

```
┌─────────────────────────────────────────────────────────────┐
│                         APP                                  │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │   Screens   │───▶│  Services   │───▶│   API/Cache │      │
│  └─────────────┘    └─────────────┘    └──────┬──────┘      │
│                                               │              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              NetworkContext                          │    │
│  │  - Detecta estado de conexión                       │    │
│  │  - Dispara sincronización al reconectar             │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    ALMACENAMIENTO                            │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │ AsyncStorage│    │ expo-file-  │    │   Backend   │      │
│  │   (caché)   │    │   system    │    │ PostgreSQL  │      │
│  └─────────────┘    └─────────────┘    └─────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Librerías Utilizadas

| Librería | Versión | Propósito |
|----------|---------|-----------|
| `@react-native-async-storage/async-storage` | ^1.x | Almacenamiento key-value persistente |
| `@react-native-community/netinfo` | SDK 54+ | Detección de estado de red |
| `expo-file-system` | SDK 54+ | Almacenamiento de archivos (Biblia offline) |

### Servicios Principales

#### 1. CacheService (`cache.service.ts`)

**Propósito:** Gestiona el almacenamiento local con AsyncStorage.

```typescript
// Claves de almacenamiento
const CACHE_KEYS = {
  WRITINGS: '@biblia_writings',
  FAVORITES: '@biblia_favorites',
  DAILY_READINGS: '@biblia_daily_readings',
  PENDING_SYNC: '@biblia_pending_sync',
  LAST_SYNC: '@biblia_last_sync',
};

// Estructura de operación pendiente
interface PendingSync {
  type: 'create' | 'update' | 'delete';
  entity: 'writing' | 'favorite' | 'reading_progress';
  data: any;
  timestamp: number;
  tempId?: string;
}
```

**Métodos principales:**
- `set<T>(key, data)` / `get<T>(key)` - CRUD genérico
- `setWritings()` / `getWritings()` - Caché de escritos
- `setFavorites()` / `getFavorites()` - Caché de favoritos
- `setDailyReading(date, reading)` / `getDailyReading(date)` - Caché de liturgia
- `addPendingSync(operation)` - Añade operación pendiente
- `getPendingSync()` / `clearPendingSync()` - Gestión de pendientes

#### 2. SyncService (`sync.service.ts`)

**Propósito:** Sincroniza operaciones pendientes con el servidor.

```typescript
class SyncService {
  async syncAll(): Promise<number> {
    // 1. Obtener operaciones pendientes
    const pending = await cacheService.getPendingSync();
    
    // 2. Ejecutar cada una contra el API
    for (const op of pending) {
      await this.syncOperation(op);
    }
    
    // 3. Actualizar IDs temporales con reales
    // 4. Limpiar operaciones completadas
  }
}
```

**Entidades soportadas:**
- `writing` - Crear, actualizar, eliminar escritos
- `favorite` - Crear, actualizar, eliminar favoritos
- `reading_progress` - Marcar/desmarcar lecturas completadas

#### 3. NetworkContext (`NetworkContext.tsx`)

**Propósito:** Contexto React que detecta cambios de conexión.

```typescript
export const NetworkProvider = ({children}) => {
  const wasOffline = useRef(false);
  
  const handleNetworkChange = async (state) => {
    // Si estábamos offline y ahora online → sincronizar
    if (wasOffline.current && state.isConnected) {
      await syncService.syncAll();
    }
    wasOffline.current = !state.isConnected;
  };
  
  useEffect(() => {
    NetInfo.addEventListener(handleNetworkChange);
  }, []);
};
```

**Hooks disponibles:**
- `useNetwork()` - Estado completo de conexión
- `useIsOnline()` - Boolean simplificado

### Flujo de Datos

#### Escritura Offline

```
Usuario crea reflexión sin internet
         │
         ▼
writingsService.createWriting(data)
         │
         ▼
┌────────────────────────────────────┐
│  try { apiClient.post() }          │
│  catch (error) {                   │
│    // Sin internet                 │
│    tempId = generateTempId()       │
│    cacheService.setWritings(...)   │
│    cacheService.addPendingSync({   │
│      type: 'create',               │
│      entity: 'writing',            │
│      data: request,                │
│      tempId: tempId                │
│    })                              │
│  }                                 │
└────────────────────────────────────┘
         │
         ▼
Usuario ve su reflexión (desde caché)
         │
         ▼
[Más tarde, vuelve internet]
         │
         ▼
NetworkContext detecta reconexión
         │
         ▼
syncService.syncAll()
         │
         ▼
apiClient.post('/writings', data)
         │
         ▼
updateCachedWritingId(tempId, realId)
         │
         ▼
✅ Datos sincronizados con servidor
```

### Gestión de IDs Temporales

Cuando se crea algo offline, se genera un ID temporal:

```typescript
generateTempId(): string {
  return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

isTempId(id: string): boolean {
  return id.startsWith('temp_');
}
```

Cuando se sincroniza:
1. El servidor devuelve el ID real
2. Se actualiza el caché reemplazando `temp_xxx` por el ID real
3. La app sigue funcionando sin interrupciones

---

## 📅 Calendario y Modo Offline

### ¿Qué guarda el calendario?

El calendario **solo guarda las fechas completadas**, NO el contenido de las lecturas.

```typescript
interface ReadingProgress {
  id: string;
  date: string;        // "2026-02-07"
  completedAt: string; // ISO timestamp
}
```

**Tamaño aproximado:** ~50 bytes por día = ~1.5 KB por mes = ~18 KB por año

**Esto es muy ligero** ✅

### Comportamiento Offline del Calendario

| Situación | Qué pasa |
|-----------|----------|
| Ver mes actual | Muestra fechas completadas que estén en caché |
| Navegar a otro mes | Si lo cargó antes → lo tiene. Si no → vacío |
| Marcar día completado | Se guarda en caché + se sincroniza después |
| Pulsar en un día con lectura cacheada | Muestra la tarjeta con la lectura |
| Pulsar en un día SIN lectura cacheada | Muestra tarjeta "Lectura no disponible" |

### UI de Error Offline en Calendario

Cuando el usuario pulsa un día que no tiene cacheado mientras está offline, ve:

```
┌─────────────────────────────────────┐
│         ☁️ (icono cloud-off)        │
│                                     │
│      Lectura no disponible          │
│                                     │
│  Sin conexión a internet. Esta      │
│  lectura no está guardada en tu     │
│  dispositivo.                       │
│                                     │
│  Conéctate a internet para ver el   │
│  contenido de este día.             │
└─────────────────────────────────────┘
```

### Decisión: ¿Qué hacemos si está offline?

**Opción elegida: Dejar entrar, mostrar lo que hay**

```
Usuario sin internet abre calendario
         │
         ▼
¿Tiene datos en caché de este mes?
         │
    ┌────┴────┐
    SÍ        NO
    │         │
    ▼         ▼
 Muestra    Muestra
 fechas     calendario
 verdes     vacío
    │         │
    └────┬────┘
         │
         ▼
Usuario pulsa un día
         │
         ▼
¿Tiene esa lectura en caché?
         │
    ┌────┴────┐
    SÍ        NO
    │         │
    ▼         ▼
 Abre la   Mensaje:
 lectura   "Sin conexión,
           lectura no
           disponible"
```

### ¿Por qué NO bloqueamos el calendario offline?

1. **El calendario es muy ligero** - Solo son fechas, no contenido
2. **El usuario puede marcar días** - Y se sincroniza después
3. **Mejor UX** - Frustración si bloqueamos algo que sí puede funcionar
4. **Las lecturas individuales sí tienen manejo** - Muestran mensaje si no están

### Implementación Actual

```typescript
// reading-progress.service.ts
async getMonthProgress(year, month): Promise<CalendarMonth> {
  try {
    // Con internet: API → Caché
    const response = await apiClient.get(`/reading-progress?year=${year}&month=${month}`);
    await this.updateCacheForMonth(response, year, month);
    return { completedDates: response.map(p => p.date) };
  } catch (error) {
    // Sin internet: Leer caché
    const cached = await this.getFromCache();
    const filtered = cached.filter(/* filtrar por mes */);
    return { completedDates: filtered.map(p => p.date) };
  }
}
```

---

## 📊 Resumen de Almacenamiento

| Dato | Ubicación | Tamaño | Sincronización |
|------|-----------|--------|----------------|
| Escritos | AsyncStorage | ~1 KB cada uno | ✅ Bidireccional |
| Favoritos | AsyncStorage | ~200 bytes cada uno | ✅ Bidireccional |
| Lectura del día | AsyncStorage | ~5 KB por día | Solo lectura |
| Progreso calendario | AsyncStorage | ~50 bytes por día | ✅ Bidireccional |
| Biblia offline | expo-file-system | ~10 MB | Solo descarga manual |

---

## ✅ Checklist de Funcionalidades Offline

- [x] Detección automática de conexión
- [x] Sincronización automática al reconectar
- [x] Escritos: crear, editar, eliminar offline
- [x] Favoritos: crear, eliminar offline
- [x] Reading progress: marcar/desmarcar offline
- [x] Caché de liturgia del día visitado
- [x] Calendario funciona con datos cacheados
- [x] Descarga opcional de Biblia completa
- [x] IDs temporales actualizados tras sincronizar

---

**Última actualización:** Febrero 2026
