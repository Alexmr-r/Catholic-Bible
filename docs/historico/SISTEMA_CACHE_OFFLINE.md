# 📱 Sistema de Caché Offline - Documentación Completa

## 📋 Índice
1. [Resumen](#resumen)
2. [Arquitectura](#arquitectura)
3. [Servicios Implementados](#servicios-implementados)
4. [Flujo de Datos](#flujo-de-datos)
5. [Casos de Uso](#casos-de-uso)
6. [Sincronización](#sincronización)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Resumen

El sistema de caché offline permite que la aplicación **Biblia Católica** funcione sin conexión a internet, manteniendo la experiencia del usuario fluida y sin interrupciones.

### ✅ Características Principales

- **Modo Offline Completo**: Lee, crea, edita y elimina escritos/favoritos sin internet
- **Sincronización Automática**: Al recuperar conexión, sincroniza cambios automáticamente
- **Persistencia Multi-Dispositivo**: Los datos se sincronizan en la nube cuando hay internet
- **IDs Temporales**: Asigna IDs temporales a items creados offline, se reemplazan al sincronizar
- **Cache Inteligente**: Actualiza automáticamente al cargar desde API

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                      FRONTEND                           │
│  ┌───────────────────────────────────────────────────┐  │
│  │          WritingsScreen / FavoritesScreen         │  │
│  └─────────────────┬──────────────────────────────┬──┘  │
│                    │                              │      │
│          ┌─────────▼──────────┐      ┌───────────▼────┐ │
│          │ writings.service   │      │favorites.service│ │
│          └─────────┬──────────┘      └───────────┬────┘ │
│                    │                              │      │
│                    └──────────┬───────────────────┘      │
│                               │                          │
│              ┌────────────────▼─────────────────┐        │
│              │      cache.service.ts            │        │
│              │  (AsyncStorage - Persistente)    │        │
│              └────────────────┬─────────────────┘        │
│                               │                          │
│              ┌────────────────▼─────────────────┐        │
│              │      sync.service.ts             │        │
│              │  (Sincronización Automática)     │        │
│              └──────────────────────────────────┘        │
└─────────────────────────────────────────────────────────┘
                               │
                   ┌───────────▼────────────┐
                   │    INTERNET/BACKEND    │
                   │   PostgreSQL + JWT     │
                   └────────────────────────┘
```

---

## 📦 Servicios Implementados

### 1. `cache.service.ts`
**Propósito**: Gestionar almacenamiento local con AsyncStorage

**Métodos principales**:
```typescript
// Genéricos
cacheService.set<T>(key: string, data: T): Promise<void>
cacheService.get<T>(key: string): Promise<T | null>
cacheService.remove(key: string): Promise<void>
cacheService.clearAll(): Promise<void>

// Específicos - Escritos
cacheService.setWritings(writings: any[]): Promise<void>
cacheService.getWritings(): Promise<any[] | null>

// Específicos - Favoritos
cacheService.setFavorites(favorites: any[]): Promise<void>
cacheService.getFavorites(): Promise<any[] | null>

// Sincronización
cacheService.addPendingSync(operation: PendingSync): Promise<void>
cacheService.getPendingSync(): Promise<PendingSync[]>
cacheService.clearPendingSync(): Promise<void>

// Utilidades
cacheService.generateTempId(): string
cacheService.isTempId(id: string): boolean
```

**Claves de caché**:
- `@biblia_writings` - Escritos del usuario
- `@biblia_favorites` - Favoritos del usuario
- `@biblia_daily_readings` - Lecturas del día
- `@biblia_pending_sync` - Operaciones pendientes de sincronización
- `@biblia_last_sync` - Timestamp de última sincronización exitosa

---

### 2. `writings.service.ts` (Modificado)
**Propósito**: Gestionar escritos con soporte offline

**Flujo CON internet**:
```typescript
getWritings() → API → Cache → Retorna
createWriting() → API → Actualiza Cache → Retorna
deleteWriting() → API → Actualiza Cache → Éxito
```

**Flujo SIN internet**:
```typescript
getWritings() → Cache → Retorna datos locales
createWriting() → Cache + ID temporal + Pending Sync → Retorna
deleteWriting() → Cache + Pending Sync → Éxito
```

---

### 3. `favorites.service.ts` (Modificado)
**Propósito**: Gestionar favoritos con soporte offline

**Funcionamiento idéntico a `writings.service.ts`**

---

### 4. `sync.service.ts` (Nuevo)
**Propósito**: Sincronizar operaciones pendientes cuando hay internet

**Métodos principales**:
```typescript
syncService.syncAll(): Promise<number>  // Sincroniza todo
syncService.hasPendingOperations(): Promise<boolean>
syncService.getPendingCount(): Promise<number>
syncService.getLastSyncTime(): Promise<Date | null>
```

**Proceso de sincronización**:
1. Lee operaciones pendientes del caché
2. Ejecuta cada operación contra el API
3. Actualiza IDs temporales con IDs reales del servidor
4. Elimina operaciones sincronizadas exitosamente
5. Mantiene operaciones fallidas para reintento

---

## 🔄 Flujo de Datos

### Escenario 1: Usuario CON Internet

```
Usuario → Crea Escrito → writings.service
                              │
                              ├─→ POST /api/writings → Backend
                              │        ↓
                              │   {id: "real123", ...}
                              │        ↓
                              └─→ Cache (guardar con ID real)
                                       ↓
                              Retorna al usuario
```

### Escenario 2: Usuario SIN Internet

```
Usuario → Crea Escrito → writings.service
                              │
                              ├─→ POST /api/writings → ❌ Error (sin red)
                              │
                              ├─→ Genera ID temporal: "temp_1234..."
                              │
                              ├─→ Cache (guardar con ID temporal)
                              │
                              └─→ Pending Sync (marcar para sincronizar)
                                       ↓
                              Retorna al usuario (ID temporal)
```

### Escenario 3: Recupera Internet

```
App detecta conexión → sync.service.syncAll()
                              │
                              ├─→ Lee Pending Sync
                              │
                              ├─→ POST /api/writings (con datos guardados)
                              │        ↓
                              │   {id: "real456", ...}
                              │        ↓
                              ├─→ Actualiza Cache (temp_1234 → real456)
                              │
                              └─→ Limpia Pending Sync
```

---

## 📖 Casos de Uso

### Caso 1: Usuario escribe reflexión en el avión (sin internet)

1. Usuario escribe reflexión sobre Juan 3:16
2. Presiona "Guardar"
3. Sistema:
   - Genera ID temporal: `temp_1738454321_abc123`
   - Guarda en AsyncStorage
   - Marca operación como pendiente
   - Muestra mensaje: "✅ Guardado localmente"
4. Usuario puede ver su reflexión inmediatamente
5. Al aterrizar y conectarse a WiFi:
   - Sistema detecta conexión
   - Sincroniza automáticamente
   - Reemplaza ID temporal con ID real del servidor
   - Muestra notificación: "✅ 1 escrito sincronizado"

### Caso 2: Usuario cambia de móvil

1. Usuario A crea reflexión en Móvil 1 (con internet)
   - Se guarda en Backend (PostgreSQL)
   - Se guarda en caché local del Móvil 1
2. Usuario A inicia sesión en Móvil 2
   - Login exitoso → JWT token
   - Al abrir "Escritos":
     - Fetch desde API con su token
     - Recibe TODAS sus reflexiones (incluyendo la del Móvil 1)
     - Cachea en el Móvil 2
3. Usuario A cierra sesión en Móvil 1
   - Se limpia caché local
   - Datos siguen en Backend

**Conclusión**: Los datos están en el backend asociados al usuario (JWT), no al dispositivo.

### Caso 3: Usuario sin internet por varios días

1. Día 1 (sin internet):
   - Crea reflexión A → Caché + Pending
   - Crea reflexión B → Caché + Pending
   - Elimina reflexión antigua C → Caché + Pending
2. Día 2 (sin internet):
   - Puede ver reflexiones A y B
   - Puede seguir creando/editando
3. Día 3 (recupera internet):
   - Sistema sincroniza automáticamente
   - Crear A → ✅
   - Crear B → ✅
   - Eliminar C → ✅
   - IDs temporales → IDs reales
   - Limpia operaciones pendientes

---

## 🔄 Sincronización

### Triggers de Sincronización

1. **Al abrir la app**: Verifica internet y sincroniza
2. **Al recuperar conexión**: NetInfo detecta cambio → sincroniza
3. **Manual**: Usuario presiona botón "Sincronizar"

### Estrategia de Conflictos

**Problema**: Usuario edita mismo escrito en 2 dispositivos sin sincronizar

**Solución (Last Write Wins)**:
- El backend usa `updatedAt` como timestamp
- La última modificación gana
- Se muestra advertencia al usuario si hay conflicto

**Implementación futura** (opcional):
- Detectar conflictos en cliente
- Mostrar modal de resolución
- Permitir al usuario elegir versión

---

## 🧪 Testing

### Test Manual

```bash
# 1. Verificar caché vacío
await cacheService.clearAll()

# 2. Crear escrito CON internet
await writingsService.createWriting({...})
# ✅ Debe aparecer en app y en backend

# 3. Activar Modo Avión
# 4. Crear escrito SIN internet
await writingsService.createWriting({...})
# ✅ Debe aparecer con ID temporal
# ✅ Debe estar en pending sync

# 5. Desactivar Modo Avión
await syncService.syncAll()
# ✅ Debe sincronizar
# ✅ ID temporal debe cambiar a ID real
```

### Test Automatizado (Jest)

```typescript
describe('Cache Service', () => {
  it('debe guardar y leer escritos', async () => {
    const writings = [{id: '1', title: 'Test'}];
    await cacheService.setWritings(writings);
    const result = await cacheService.getWritings();
    expect(result).toEqual(writings);
  });

  it('debe generar IDs temporales únicos', () => {
    const id1 = cacheService.generateTempId();
    const id2 = cacheService.generateTempId();
    expect(id1).not.toEqual(id2);
    expect(cacheService.isTempId(id1)).toBe(true);
  });
});
```

---

## 🔧 Troubleshooting

### Problema 1: "No se pudieron cargar los escritos"

**Causa**: Sin internet y sin caché
**Solución**: 
```typescript
// Al primer inicio, el usuario DEBE tener internet
// para cargar datos iniciales
if (!hasInternet && !hasCachedData) {
  showError('Conecta a internet para cargar tus datos');
}
```

### Problema 2: IDs temporales no se actualizan

**Causa**: Fallo en sincronización
**Solución**:
```typescript
// Verificar pending sync
const pending = await cacheService.getPendingSync();
console.log('Operaciones pendientes:', pending);

// Forzar sincronización
await syncService.syncAll();
```

### Problema 3: Duplicados después de sincronizar

**Causa**: Operación se ejecutó 2 veces
**Solución**:
```typescript
// Ya está implementado en sync.service.ts
// Usa idempotencia: si el item ya existe, no se crea de nuevo
```

### Problema 4: Caché muy grande

**Causa**: Muchos escritos almacenados
**Solución**:
```typescript
// Implementar paginación y límite de caché
const MAX_CACHED_WRITINGS = 100;
const recentWritings = allWritings.slice(0, MAX_CACHED_WRITINGS);
await cacheService.setWritings(recentWritings);
```

---

## 📝 Notas Finales

### Ventajas del Sistema

✅ **Experiencia fluida**: Usuario no nota si hay o no internet
✅ **Datos seguros**: Backup en backend + caché local
✅ **Multi-dispositivo**: Sincronización automática entre dispositivos
✅ **Offline-first**: Diseñado para funcionar sin conexión

### Limitaciones Actuales

⚠️ **Conflictos**: Last Write Wins (puede sobrescribir cambios)
⚠️ **Tamaño**: AsyncStorage tiene límite ~10MB
⚠️ **Sincronización**: Solo al abrir app o manualmente

### Mejoras Futuras

🔮 **WebSockets**: Sincronización en tiempo real
🔮 **Compresión**: Reducir tamaño de caché
🔮 **Versionado**: Detectar y resolver conflictos
🔮 **Background Sync**: Sincronizar en segundo plano

---

## 📚 Referencias

- [AsyncStorage Docs](https://react-native-async-storage.github.io/async-storage/)
- [Offline-First Architecture](https://offlinefirst.org/)
- [JWT Authentication](https://jwt.io/)

---

**Última actualización**: 1 de Febrero de 2026
**Autor**: Sistema de Biblia Católica
**Versión**: 1.0.0
