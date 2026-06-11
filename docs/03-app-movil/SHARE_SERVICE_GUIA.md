# 📤 Servicio de Compartir - Guía de Uso

## Ubicación
`src/services/share.service.ts`

## Descripción
Servicio centralizado y profesional para compartir contenido de la app. Maneja diferentes tipos de contenido con formatos optimizados para cada plataforma.

## Características

### ✅ Implementadas
- **Formatos profesionales**: Texto bien estructurado con emojis y formato limpio
- **Truncado inteligente**: Textos largos se truncan sin cortar palabras
- **Manejo de errores**: Errores consistentes y logging preparado
- **Multi-tipo**: Soporta versículos, capítulos, lecturas, reflexiones, escritos
- **Cross-platform**: Funciona en iOS y Android
- **Analytics ready**: Logging preparado para métricas

### 📊 Tipos de Contenido

| Tipo | Método | Descripción |
|------|--------|-------------|
| `verse` | `shareVerse()` | Versículo individual |
| `verses` | `shareVerses()` | Múltiples versículos |
| `chapter` | `shareChapter()` | Capítulo completo |
| `daily_reading` | `shareDailyReading()` | Lectura del día |
| `reflection` | `shareReflection()` | Reflexión personal |
| `writing` | `shareWriting()` | Escrito personal |

## Uso

### Importar
```typescript
import { shareService } from '../services/share.service';
```

### Compartir Versículo Individual
```typescript
const result = await shareService.shareVerse({
  bookName: 'Juan',
  chapter: 3,
  verseNumber: 16,
  verseText: 'Porque de tal manera amó Dios al mundo...',
});

if (result.action === 'error') {
  Alert.alert('Error', 'No se pudo compartir');
}
```

### Compartir Múltiples Versículos
```typescript
const result = await shareService.shareVerses({
  bookName: 'Salmos',
  chapter: 23,
  startVerse: 1,
  endVerse: 6,
  versesText: '1. El Señor es mi pastor...\n2. En lugares de...',
});
```

### Compartir Capítulo Completo
```typescript
const result = await shareService.shareChapter({
  bookName: 'Génesis',
  chapter: 1,
  sections: [
    {
      title: 'La creación',
      verses: [
        { number: 1, text: 'En el principio...' },
        { number: 2, text: 'La tierra estaba...' },
      ],
    },
  ],
});
```

### Compartir Lectura del Día
```typescript
const result = await shareService.shareDailyReading({
  date: '2026-02-07',
  reference: 'Juan 3:16-18',
  text: 'Porque de tal manera amó Dios al mundo...',
  reflection: 'Mi reflexión personal...', // Opcional
});
```

### Compartir Reflexión
```typescript
const result = await shareService.shareReflection({
  title: 'Mi reflexión sobre el amor',
  content: 'Hoy aprendí que el amor de Dios...',
  reference: 'Juan 3:16', // Opcional
  date: '2026-02-07',
});
```

### Compartir Escrito
```typescript
const result = await shareService.shareWriting({
  title: 'Meditación matutina',
  content: 'Esta mañana reflexioné sobre...',
  reference: 'Salmo 23:1-3', // Opcional
});
```

## Resultado de Compartir

```typescript
interface ShareResult {
  success: boolean;
  action: 'shared' | 'dismissed' | 'error';
  activityType?: string; // Solo iOS - ej: 'com.apple.UIKit.activity.CopyToPasteboard'
  error?: string;
}
```

### Manejo de Resultados
```typescript
const result = await shareService.shareVerse({...});

switch (result.action) {
  case 'shared':
    console.log('¡Contenido compartido!');
    if (result.activityType) {
      console.log('Compartido vía:', result.activityType);
    }
    break;
    
  case 'dismissed':
    console.log('Usuario canceló');
    break;
    
  case 'error':
    Alert.alert('Error', result.error || 'No se pudo compartir');
    break;
}
```

## Formato de Mensajes

### Versículo Individual
```
📖 Juan 3:16

"Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito..."

— Compartido desde Biblia App
```

### Múltiples Versículos
```
📖 Salmos 23:1-3

1. El Señor es mi pastor, nada me faltará.
2. En lugares de delicados pastos me hará descansar...
3. Confortará mi alma...

— Compartido desde Biblia App
```

### Lectura del Día
```
📅 Lectura del día
viernes, 7 de febrero de 2026

📖 Juan 3:16-18

"Porque de tal manera amó Dios al mundo..."

✍️ Mi reflexión:
Hoy aprendí que el amor de Dios es incondicional...

— Compartido desde Biblia App
```

### Capítulo Completo
```
📖 Génesis 1

📜 La creación

1. En el principio creó Dios los cielos y la tierra.
2. La tierra estaba desordenada y vacía...
...

— Compartido desde Biblia App
```

## Límites de Texto

| Tipo | Límite |
|------|--------|
| Capítulo completo | 3000 caracteres |
| Lectura del día | 800 caracteres (texto) + 300 (reflexión) |
| Reflexión | 1000 caracteres |
| Escrito | 1500 caracteres |

Los textos que excedan el límite se truncan inteligentemente sin cortar palabras.

## Analytics (Preparado)

El servicio registra eventos de compartir:
```typescript
{
  event: 'share',
  contentType: 'verse',
  action: 'shared',
  activityType: 'com.apple.UIKit.activity.Message',
  timestamp: '2026-02-07T10:30:00.000Z',
  platform: 'ios'
}
```

Para integrar con tu servicio de analytics, descomenta la línea en `logShareEvent()`:
```typescript
// analytics.logEvent('share', event);
```

## Pantallas que Usan el Servicio

| Pantalla | Uso |
|----------|-----|
| `DailyReadingScreen` | `shareDailyReading()` - Lectura del día con reflexión |
| `ChapterReadingScreen` | `shareVerse()`, `shareVerses()`, `shareChapter()` |
| `WritingDetailScreen` | `shareWriting()` (pendiente de integrar) |
| `FavoritesScreen` | `shareVerse()` (pendiente de integrar) |

## Mejoras Futuras

- [ ] Compartir como imagen (screenshot decorado)
- [ ] Plantillas personalizables
- [ ] Historial de compartidos
- [ ] Estadísticas de compartir
- [ ] Deep links para abrir en la app
