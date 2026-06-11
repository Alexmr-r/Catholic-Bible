# 📅 CALENDARIO DE CONSTANCIA - Guía de Implementación

## 🎯 Objetivo
Permitir al usuario marcar lecturas diarias como completadas y ver un calendario visual de su progreso.

---

## 📦 Archivos a Crear

### 1. Backend - Migración SQL ✅
**Archivo**: `/BibliaBackend/src/main/resources/db/migration/V5__create_reading_progress.sql`

```sql
CREATE TABLE reading_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    daily_reading_id UUID REFERENCES daily_readings(id),
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, date)
);
CREATE INDEX idx_reading_progress_user_date ON reading_progress(user_id, date DESC);
```

### 2. Frontend - Servicio de Reading Progress
**Archivo**: `/BibliaAppExpo/src/services/reading-progress.service.ts`

**Métodos principales**:
- `markAsComplete(date, dailyReadingId)` - Marcar como completada
- `isDateCompleted(date)` - Verificar si está completada
- `getMonthProgress(year, month)` - Obtener días completados del mes
- Soporte caché offline (igual que writings/favorites)

### 3. Frontend - Pantalla de Calendario
**Archivo**: `/BibliaAppExpo/src/screens/ReadingCalendarScreen.tsx`

**Componentes**:
- Grid de 7x6 (días de la semana)
- Días completados con círculo verde
- Navegación entre meses
- Indicador de racha actual

### 4. Modificar DailyReadingScreen
**Cambios**:
- Cambiar bookmark icon a check_circle
- Al hacer clic: marcar/desmarcar como completada
- Mostrar estado visual (completada o no)

---

## 🔄 Flujo Completo

### CON INTERNET
```
Usuario marca lectura como completada
    ↓
POST /api/reading-progress {date, dailyReadingId}
    ↓
Backend guarda en PostgreSQL
    ↓
Frontend cachea en AsyncStorage
    ↓
✅ Aparece en calendario
```

### SIN INTERNET
```
Usuario marca lectura como completada
    ↓
Guardar en AsyncStorage con ID temporal
    ↓
Marcar como "pending sync"
    ↓
✅ Aparece en calendario (local)
    ↓
Al recuperar internet → Sincronizar con backend
```

---

## 🎨 Cambios de UI

### DailyReadingScreen - Botón de Completar

**ANTES**:
```tsx
<MaterialIcons name="bookmark" size={22} />
```

**DESPUÉS**:
```tsx
<MaterialIcons 
  name={isCompleted ? "check_circle" : "check_circle_outline"} 
  size={24}
  color={isCompleted ? colors.primary.DEFAULT : colors.ink.light}
/>
```

### Calendario - Días Completados

```tsx
<View style={[
  styles.dayCell,
  isCompleted && styles.dayCompleted  // Círculo verde
]}>
  <Text style={[
    styles.dayNumber,
    isCompleted && styles.dayNumberCompleted
  ]}>
    {day}
  </Text>
</View>
```

**Estilos**:
```typescript
dayCompleted: {
  backgroundColor: colors.primary.light,
  borderRadius: 9999,
},
dayNumberCompleted: {
  color: colors.primary.dark,
  fontWeight: '700',
}
```

---

## 📊 Estructura de Datos

### ReadingProgress (TypeScript)
```typescript
interface ReadingProgress {
  id: string;
  userId: string;
  date: string;  // "2026-02-01"
  dailyReadingId?: string;
  completedAt: string;  // ISO timestamp
}
```

### Caché Local (AsyncStorage)
```typescript
{
  "@biblia_reading_progress": {
    data: ReadingProgress[],
    timestamp: number
  }
}
```

---

## 🚀 Pasos de Implementación

### Paso 1: Backend
1. Aplicar migración V5 (reiniciar backend)
2. Crear controller `/api/v1/reading-progress`:
   - POST `/reading-progress` - Marcar como completada
   - GET `/reading-progress?year=2026&month=2` - Obtener mes
   - DELETE `/reading-progress?date=2026-02-01` - Desmarcar

### Paso 2: Frontend - Servicio
1. Crear `reading-progress.service.ts`
2. Implementar métodos con soporte offline
3. Integrar con `cache.service.ts`
4. Agregar a `sync.service.ts` para sincronización

### Paso 3: Frontend - DailyReadingScreen
1. Import `readingProgressService`
2. Agregar estado `isCompleted`
3. Cambiar icono a `check_circle`
4. Al hacer clic: llamar `markAsComplete()` o `unmark()`
5. Mostrar feedback visual

### Paso 4: Frontend - Calendario
1. Crear `ReadingCalendarScreen.tsx`
2. Implementar grid de calendario
3. Cargar días completados del mes actual
4. Navegación entre meses (← →)
5. Agregar a navegación (bottom tabs o modal)

---

## 🎯 Resultado Final

El usuario podrá:
✅ Marcar lecturas como completadas (con/sin internet)
✅ Ver calendario visual de su progreso
✅ Navegar entre meses
✅ Ver racha de días consecutivos
✅ Sincronizar automáticamente con el backend

---

## 📝 Notas Importantes

1. **Fecha sin hora**: Usar `YYYY-MM-DD` para evitar problemas de timezone
2. **Un registro por día**: UNIQUE constraint en (user_id, date)
3. **Caché offline**: Funciona igual que Writings y Favorites
4. **Sincronización**: Automática al recuperar conexión
5. **Multi-dispositivo**: Los datos se sincronizan en la nube

---

**Estado**: ⏳ Migración SQL creada, pendiente implementación de servicios y UI

**Próximo paso**: Crear `reading-progress.service.ts` con soporte offline
