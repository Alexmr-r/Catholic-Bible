# 🔴 Funcionalidades Mockeadas - Pendientes de Integración con API

## 📋 Resumen

Este documento lista **todas las funcionalidades que actualmente están mockeadas** y necesitan ser implementadas cuando se conecte el backend.

Cada funcionalidad está claramente marcada con `🔴 MOCKEADO` en el código y tiene comentarios `TODO:` con instrucciones de implementación.

---

## 📱 DailyReadingScreen

### 1. **Carga de Lectura del Día** 🔴
**Ubicación:** `DailyReadingScreen.tsx` línea ~20  
**Estado:** MOCKEADO  
**Descripción:** Los datos de la lectura diaria están hardcodeados en el código.

**TODO:**
```typescript
// GET /api/daily-reading?date={selectedDate}
useEffect(() => {
  const loadDailyReading = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/daily-reading?date=${new Date().toISOString()}`);
      const data = await response.json();
      setReadingData(data);
    } catch (error) {
      console.error('Error loading daily reading:', error);
    } finally {
      setIsLoading(false);
    }
  };
  loadDailyReading();
}, []);
```

**Estructura esperada de la API:**
```json
{
  "id": "reading-2024-10-24",
  "date": "2024-10-24",
  "title": "Según San Lucas 1:26-38",
  "dateFormatted": "Martes, 24 de Octubre",
  "imageUrl": "https://...",
  "badge": "EVANGELIO",
  "paragraphs": [
    "En aquel tiempo, el ángel Gabriel...",
    "Y entrando el ángel...",
    "Mas ella, cuando le vio..."
  ]
}
```

---

### 2. **Selector de Calendario** 🔴
**Ubicación:** `DailyReadingScreen.tsx` → `handleCalendar()`  
**Estado:** MOCKEADO  
**Descripción:** El botón del calendario no abre ningún selector.

**TODO:**
```typescript
const handleCalendar = () => {
  // Opción 1: Modal nativo
  setShowCalendarModal(true);
  
  // Opción 2: Librería react-native-calendars
  // npm install react-native-calendars
};
```

---

### 3. **Reproducir Audio** 🔴
**Ubicación:** `DailyReadingScreen.tsx` → `handlePlayAudio()`  
**Estado:** MOCKEADO  
**Descripción:** No se reproduce ningún audio de la lectura.

**TODO:**
```typescript
// POST /api/daily-reading/audio
const handlePlayAudio = async () => {
  try {
    const response = await fetch(`/api/daily-reading/${readingId}/audio`);
    const { audioUrl } = await response.json();
    
    // Usar expo-av para reproducir
    const { sound } = await Audio.Sound.createAsync({ uri: audioUrl });
    await sound.playAsync();
  } catch (error) {
    console.error('Error playing audio:', error);
  }
};
```

**Librerías necesarias:**
- `expo-av` para reproducción de audio

---

### 4. **Compartir Lectura** 🔴
**Ubicación:** `DailyReadingScreen.tsx` → `handleShare()`  
**Estado:** MOCKEADO  
**Descripción:** No se comparte la lectura.

**TODO:**
```typescript
import { Share } from 'react-native';

const handleShare = async () => {
  try {
    await Share.share({
      message: `Lectura del día: ${readingData.title}\n\n${readingData.paragraphs[0]}`,
      url: `https://app.com/reading/${readingId}`,
      title: 'Lectura del Día'
    });
  } catch (error) {
    console.error('Error sharing:', error);
  }
};
```

---

### 5. **Guardar en Favoritos (Bookmark)** 🔴
**Ubicación:** `DailyReadingScreen.tsx` → `handleBookmark()`  
**Estado:** MOCKEADO  
**Descripción:** No se guarda en favoritos.

**TODO:**
```typescript
// POST /api/bookmarks
const handleBookmark = async () => {
  try {
    await fetch('/api/bookmarks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: currentUser.id,
        readingId: readingData.id,
        date: new Date()
      })
    });
    setIsBookmarked(true);
    Alert.alert('Éxito', 'Guardado en favoritos');
  } catch (error) {
    console.error('Error bookmarking:', error);
  }
};
```

---

### 6. **Guardar Reflexión** 🔴
**Ubicación:** `DailyReadingScreen.tsx` → `handleSaveReflection()`  
**Estado:** MOCKEADO  
**Descripción:** La reflexión no se guarda en la base de datos.

**TODO:**
```typescript
// POST /api/reflections
const handleSaveReflection = async () => {
  if (!reflection.trim()) {
    Alert.alert('Error', 'Escribe tu reflexión primero');
    return;
  }
  
  try {
    await fetch('/api/reflections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: currentUser.id,
        readingId: readingData.id,
        text: reflection,
        date: new Date()
      })
    });
    Alert.alert('Éxito', 'Reflexión guardada correctamente');
  } catch (error) {
    console.error('Error saving reflection:', error);
    Alert.alert('Error', 'No se pudo guardar la reflexión');
  }
};
```

---

### 7. **Navegación a Biblia** 🔴
**Ubicación:** `DailyReadingScreen.tsx` → Bottom Nav  
**Estado:** MOCKEADO  
**Descripción:** El botón "Biblia" no navega a ninguna pantalla.

**TODO:**
```typescript
// Crear BibleScreen.tsx
// Agregar ruta en AppNavigator.tsx
navigation.navigate('Bible');
```

---

### 8. **Navegación a Favoritos** 🔴
**Ubicación:** `DailyReadingScreen.tsx` → Bottom Nav  
**Estado:** MOCKEADO  
**Descripción:** El botón "Favoritos" no navega a ninguna pantalla.

**TODO:**
```typescript
// Crear FavoritesScreen.tsx
// Agregar ruta en AppNavigator.tsx
navigation.navigate('Favorites');
```

---

## 📝 WritingsScreen

### 9. **Carga de Escritos** 🔴
**Ubicación:** `WritingsScreen.tsx` línea ~25  
**Estado:** MOCKEADO  
**Descripción:** Los escritos están hardcodeados en el código.

**TODO:**
```typescript
// GET /api/writings?filter={activeFilter}
useEffect(() => {
  const loadWritings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/writings?filter=${activeFilter}&userId=${currentUser.id}`);
      const data = await response.json();
      setWritings(data);
    } catch (error) {
      console.error('Error loading writings:', error);
    } finally {
      setIsLoading(false);
    }
  };
  loadWritings();
}, [activeFilter]);
```

**Estructura esperada de la API:**
```json
[
  {
    "id": "1",
    "userId": "user-123",
    "verse": "Salmo 23:1",
    "verseReference": {
      "book": "Salmos",
      "chapter": 23,
      "verse": 1
    },
    "date": "2024-10-12",
    "dateFormatted": "12 Oct",
    "text": "Hoy sentí mucha paz al leer esto...",
    "preview": "Hoy sentí mucha paz al leer esto. \"El Señor es mi pastor...\"",
    "icon": "auto-stories",
    "iconColor": "#6F8F99",
    "tags": ["paz", "trabajo"],
    "isFavorite": false
  }
]
```

---

### 10. **Búsqueda de Escritos** 🔴
**Ubicación:** `WritingsScreen.tsx` → `handleSearch()`  
**Estado:** MOCKEADO  
**Descripción:** El botón de búsqueda no abre ninguna pantalla.

**TODO:**
```typescript
// Crear WritingsSearchScreen.tsx
// Agregar ruta en AppNavigator.tsx
const handleSearch = () => {
  navigation.navigate('WritingsSearch');
};
```

---

### 11. **Crear Nuevo Escrito** 🔴
**Ubicación:** `WritingsScreen.tsx` → `handleNewWriting()`  
**Estado:** MOCKEADO  
**Descripción:** El FAB no navega a la pantalla de creación.

**TODO:**
```typescript
// Crear NewWritingScreen.tsx
// Agregar ruta en AppNavigator.tsx
const handleNewWriting = () => {
  navigation.navigate('NewWriting');
};
```

---

### 12. **Ver Detalle de Escrito** 🔴
**Ubicación:** `WritingsScreen.tsx` → `handleViewWriting()`  
**Estado:** MOCKEADO  
**Descripción:** No navega al detalle del escrito.

**TODO:**
```typescript
// Crear WritingDetailScreen.tsx
// Agregar ruta en AppNavigator.tsx
const handleViewWriting = (id: string) => {
  navigation.navigate('WritingDetail', { writingId: id });
};
```

---

### 13. **Filtros de Escritos** 🔴
**Ubicación:** `WritingsScreen.tsx` → `activeFilter` state  
**Estado:** PARCIALMENTE IMPLEMENTADO  
**Descripción:** Los filtros cambian el estado pero no filtran datos reales.

**TODO:**
```typescript
// Los filtros deben hacer una nueva petición a la API
const handleFilterChange = (filter: string) => {
  setActiveFilter(filter);
  // Se recargará automáticamente con el useEffect que depende de activeFilter
};

// GET /api/writings?filter=recientes
// GET /api/writings?filter=libro
// GET /api/writings?filter=favoritos
```

---

### 14. **Navegación a Biblia** 🔴
**Ubicación:** `WritingsScreen.tsx` → Bottom Nav  
**Estado:** MOCKEADO  
**Descripción:** El botón "Biblia" no navega a ninguna pantalla.

**TODO:**
```typescript
navigation.navigate('Bible');
```

---

### 15. **Navegación a Favoritos** 🔴
**Ubicación:** `WritingsScreen.tsx` → Bottom Nav  
**Estado:** MOCKEADO  
**Descripción:** El botón "Favoritos" no navega a ninguna pantalla.

**TODO:**
```typescript
navigation.navigate('Favorites');
```

---

## ✅ LoginScreen y RegisterScreen

Las pantallas de Login y Register **YA ESTÁN PREPARADAS** con todos los comentarios TODO y estructura lista para API.

Ver: `LOGIN_IMPLEMENTACION.md` y `REGISTER_SCREEN_IMPLEMENTACION.md`

---

## 🎯 Resumen de Prioridades

### Alta Prioridad (MVP)
1. ✅ **Login** - Ya preparado
2. ✅ **Register** - Ya preparado
3. 🔴 **Carga de Lectura del Día** - Crítico
4. 🔴 **Guardar Reflexión** - Crítico
5. 🔴 **Carga de Escritos** - Crítico
6. 🔴 **Crear Nuevo Escrito** - Crítico

### Media Prioridad
7. 🔴 **Ver Detalle de Escrito**
8. 🔴 **Guardar en Favoritos**
9. 🔴 **Selector de Calendario**
10. 🔴 **Compartir Lectura**

### Baja Prioridad (Features)
11. 🔴 **Reproducir Audio**
12. 🔴 **Búsqueda de Escritos**
13. 🔴 **Pantalla de Biblia**
14. 🔴 **Pantalla de Favoritos**

---

## 📦 Librerías Necesarias

```bash
# Para audio
npm install expo-av

# Para calendario (opcional)
npm install react-native-calendars

# Para fechas
npm install date-fns

# Para gestos (si se necesita)
npm install react-native-gesture-handler
```

---

## 🔍 Cómo Encontrar los TODOs

Busca en el código:
```bash
# Buscar todos los TODOs
grep -r "TODO:" src/

# Buscar funcionalidades mockeadas
grep -r "🔴 MOCKEADO" src/

# Buscar console.logs de mockeo
grep -r "console.log('🔴" src/
```

---

## 📝 Notas para el Backend

### Endpoints Necesarios:

```
# Lecturas
GET    /api/daily-reading?date={date}
GET    /api/daily-reading/{id}/audio

# Reflexiones
POST   /api/reflections
GET    /api/reflections?userId={userId}&readingId={readingId}

# Escritos
GET    /api/writings?userId={userId}&filter={filter}
POST   /api/writings
GET    /api/writings/{id}
PUT    /api/writings/{id}
DELETE /api/writings/{id}

# Favoritos
POST   /api/bookmarks
GET    /api/bookmarks?userId={userId}
DELETE /api/bookmarks/{id}

# Autenticación (ya documentado en otros archivos)
POST   /api/auth/login
POST   /api/auth/register
POST   /api/auth/forgot-password
```

---

## 🚀 Estado Actual

| Pantalla | Estado | % Completado |
|----------|--------|--------------|
| LoginScreen | ✅ Preparada | 100% |
| RegisterScreen | ✅ Preparada | 100% |
| DailyReadingScreen | 🔴 Mockeada | 30% |
| WritingsScreen | 🔴 Mockeada | 40% |
| BibleScreen | ❌ No existe | 0% |
| FavoritesScreen | ❌ No existe | 0% |

**Total del proyecto:** ~45% completado (Frontend estructura lista, falta integración con API)

