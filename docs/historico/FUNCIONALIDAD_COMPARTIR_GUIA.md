# 📤 Funcionalidad de Compartir - Guía Completa

## ⚠️ Diferencia importante: Compartir enlaces (url) en iOS y Android

> **Para máxima compatibilidad, SIEMPRE incluye el enlace dentro del campo `message`.**
>
> - En **Android**, el campo `url` es ignorado. Solo se comparte lo que esté en `message`.
> - En **iOS**, puedes usar `url` y/o `message`, pero si quieres que el enlace funcione igual en ambas plataformas, ponlo en `message`.

### Ejemplo universal recomendado
```js
await Share.share({
  message: 'Lee esto: https://miweb.com',
  title: 'Comparte esto'
});
```

---

## 📱 ¿Cómo funciona realmente el parámetro `url` en Share.share()?

| Propiedad | Android | iOS |
|-----------|---------|-----|
| message   | ✅      | ✅  |
| title     | ✅      | ✅  |
| url       | ❌ (ignorado) | ✅ (puede mostrar preview) |

- **Android:** Solo usa `message`. El enlace debe ir dentro del texto.
- **iOS:** Puedes usar `url`, pero para máxima compatibilidad, pon el enlace en `message`.

---

## 🎯 ¿Qué es la Funcionalidad de Compartir?

La funcionalidad de **compartir** (Share) permite a los usuarios compartir contenido de tu app (textos, links, imágenes) con otras aplicaciones del dispositivo como WhatsApp, Email, Messenger, etc.

En React Native, esto se logra usando la **API Share** nativa, que está integrada en el framework.

---

## 🔧 Cómo Funciona

### 1. **API Share de React Native**

React Native proporciona una API nativa llamada `Share` que:
- Es **multiplataforma** (iOS y Android)
- Abre el **menú nativo de compartir** del sistema operativo
- No requiere librerías externas
- Es muy fácil de usar

---

## 📖 Implementación Paso a Paso

### Paso 1: Importar Share

```typescript
import {Share} from 'react-native';
```

Es parte del core de React Native, no necesitas instalar nada.

---

### Paso 2: Crear la Función de Compartir

```typescript
const handleShare = async () => {
  try {
    // Ejemplo universal: el enlace va en message
    const result = await Share.share({
      message: '¡Hola! Mira este mensaje y este enlace: https://miweb.com',
      title: 'Título del contenido',
    });

    // Manejar el resultado
    if (result.action === Share.sharedAction) {
      if (result.activityType) {
        // Compartido con actividad específica (iOS)
        console.log('Compartido con:', result.activityType);
      } else {
        // Compartido (Android)
        console.log('Contenido compartido');
      }
    } else if (result.action === Share.dismissedAction) {
      // Usuario canceló
      console.log('Compartir cancelado');
    }
  } catch (error) {
    Alert.alert('Error', 'No se pudo compartir');
    console.error('Error:', error);
  }
};
```

---

### Paso 3: Conectar a un Botón

```typescript
<TouchableOpacity onPress={handleShare}>
  <MaterialIcons name="share" size={24} color="blue" />
  <Text>Compartir</Text>
</TouchableOpacity>
```

---

## 📊 Propiedades de Share.share()

### Propiedades Principales

| Propiedad | Tipo | Descripción | Plataforma |
|-----------|------|-------------|------------|
| `message` | string | Texto a compartir | iOS + Android |
| `title` | string | Título del contenido | Android |
| `url` | string | URL a compartir | iOS |

### Ejemplo Completo

```typescript
await Share.share({
  message: 'Texto que quieres compartir y el enlace: https://miweb.com',  // Obligatorio en Android y recomendado en iOS
  title: 'Título del mensaje',             // Solo Android
  url: 'https://example.com',              // Solo iOS, pero NO es universal
});
```

> **Recomendación:** Para que el enlace se comparta siempre, ponlo en `message`.

---

## 🎨 Casos de Uso en la App Biblia

### 1. **Compartir Lectura Diaria** (DailyReadingScreen)

```typescript
const handleShare = async () => {
  if (!dailyReading) return;

  try {
    // Construir el mensaje
    const message = `📖 Lectura del día - ${formatDate(dailyReading.date)}\n\n` +
                    `${dailyReading.biblicalReference}\n\n` +
                    `"${dailyReading.readingText}"\n\n` +
                    `🙏 Compartido desde Biblia App`;
    
    // Compartir
    const result = await Share.share({
      message: message,
      title: `Lectura del día - ${dailyReading.biblicalReference}`,
    });

    // Manejar resultado (opcional)
    if (result.action === Share.sharedAction) {
      console.log('Lectura compartida');
    }
  } catch (error) {
    Alert.alert('Error', 'No se pudo compartir');
  }
};
```

**¿Qué hace?**
- Toma la lectura del día completa
- Formatea un mensaje bonito con emojis
- Abre el menú de compartir nativo
- El usuario elige dónde compartir (WhatsApp, Email, etc.)

---

### 2. **Compartir Versículos Seleccionados** (ChapterReadingScreen)

```typescript
const handleShare = async () => {
  if (selectedVerses.length === 0 || !chapterData) return;

  try {
    const minVerse = Math.min(...selectedVerses);
    const maxVerse = Math.max(...selectedVerses);
    
    // Obtener el texto de los versículos seleccionados
    let versesText = '';
    chapterData.sections.forEach(section => {
      section.verses.forEach(verse => {
        if (selectedVerses.includes(verse.number)) {
          versesText += `${verse.number}. ${verse.text}\n`;
        }
      });
    });

    // Crear referencia
    const reference = selectedVerses.length === 1
      ? `${bookName} ${currentChapter}:${minVerse}`
      : `${bookName} ${currentChapter}:${minVerse}-${maxVerse}`;

    // Construir mensaje
    const message = `📖 ${reference}\n\n${versesText}\n🙏 Compartido desde Biblia App`;

    // Compartir
    const result = await Share.share({
      message: message,
      title: reference,
    });

    if (result.action === Share.sharedAction) {
      console.log('Versículos compartidos');
    }
    
    cancelSelection();  // Salir del modo selección
  } catch (error) {
    Alert.alert('Error', 'No se pudo compartir');
    cancelSelection();
  }
};
```

**¿Qué hace?**
- Toma los versículos que el usuario seleccionó
- Construye una referencia (ej: Juan 3:16-17)
- Extrae el texto de cada versículo
- Formatea todo en un mensaje legible
- Comparte y sale del modo selección

---

## 🎭 Experiencia del Usuario

### En iOS

```
Usuario hace clic en "Compartir"
         ↓
Se abre el Activity Sheet nativo de iOS
         ↓
Aparecen apps disponibles:
- WhatsApp
- Email
- Messenger
- Twitter
- Copiar
- Más...
         ↓
Usuario elige una app
         ↓
La app seleccionada se abre con el texto pre-llenado
         ↓
Usuario envía
```

### En Android

```
Usuario hace clic en "Compartir"
         ↓
Se abre el Share Sheet nativo de Android
         ↓
Aparecen apps disponibles:
- WhatsApp
- Gmail
- Telegram
- Messages
- Copiar al portapapeles
- Más...
         ↓
Usuario elige una app
         ↓
La app seleccionada se abre con el texto
         ↓
Usuario envía
```

---

## 📱 Diferencias iOS vs Android

| Aspecto | iOS | Android |
|---------|-----|---------|
| **title** | Se usa en algunos contextos | Se muestra en el share sheet |
| **url** | Funciona, puede mostrar preview | Ignorado, NO se comparte |
| **message** | Obligatorio | Obligatorio |
| **Resultado** | Incluye `activityType` | Solo `sharedAction` |
| **Cancelar** | `dismissedAction` | `dismissedAction` |

> **Resumen:**
> - Si quieres compartir un enlace en ambas plataformas, SIEMPRE inclúyelo en el campo `message`.
> - El campo `url` es útil solo para iOS, pero no es multiplataforma.

---

## ✨ Mejores Prácticas

### 1. **Siempre usar try-catch**
```typescript
try {
  await Share.share({...});
} catch (error) {
  // Manejar error
}
```

### 2. **Formatear bien el mensaje**
```typescript
// ❌ Mal
const message = dailyReading.text;

// ✅ Bien
const message = `📖 ${reference}\n\n"${text}"\n\nLee más: https://miweb.com/lectura/123\n\n🙏 Compartido desde Biblia App`;
```

### 3. **Incluir contexto**
- Título o referencia
- Emojis para hacerlo visual
- Crédito de la app al final

### 4. **Manejar casos vacíos**
```typescript
if (!data) return;  // No compartir si no hay datos
```

### 5. **Dar feedback al usuario**
```typescript
if (result.action === Share.sharedAction) {
  // Opcional: mostrar toast de éxito
  console.log('Compartido exitosamente');
}
```

---

## 🔍 Código Resultado en Share.share()

```typescript
type ShareResult = {
  action: 'sharedAction' | 'dismissedAction';
  activityType?: string;  // Solo iOS
};
```

### Valores de `action`

- **`Share.sharedAction`**: Usuario compartió el contenido
- **`Share.dismissedAction`**: Usuario canceló

### Valores de `activityType` (Solo iOS)

Ejemplos:
- `com.apple.UIKit.activity.Message` - Mensajes
- `com.apple.UIKit.activity.Mail` - Email
- `com.apple.UIKit.activity.CopyToPasteboard` - Copiar
- `net.whatsapp.WhatsApp.ShareExtension` - WhatsApp

---

## 🧪 Testing

### Cómo Probar

1. **En Simulador/Emulador:**
   - iOS: Funciona pero apps limitadas
   - Android: Funciona con apps instaladas

2. **En Dispositivo Real:**
   - Mejor experiencia
   - Todas las apps aparecen
   - Puedes compartir realmente

### Ejemplo de Test

```typescript
// Test unitario
describe('handleShare', () => {
  it('should call Share.share with correct message', async () => {
    const spy = jest.spyOn(Share, 'share');
    
    await handleShare();
    
    expect(spy).toHaveBeenCalledWith({
      message: expect.stringContaining('Lectura del día'),
      title: expect.any(String),
    });
  });
});
```

---

## 🎨 Variaciones y Casos Avanzados

### 1. **Compartir con URL (iOS y Android - universal)**

```typescript
// Universal: el enlace va en message
await Share.share({
  message: 'Mira esta lectura: https://biblia.app/lectura/123',
  title: 'Lectura del día',
});
```

```typescript
// Solo iOS (no recomendado si quieres compatibilidad)
await Share.share({
  message: 'Mira esta lectura',
  url: 'https://biblia.app/lectura/123',
});
```

> **Conclusión:**
> - Si quieres que el enlace se comparta en todos los dispositivos, SIEMPRE ponlo en `message`.

---

## 📊 Archivos Modificados en el Proyecto

### 1. **DailyReadingScreen.tsx**

#### Cambios:
```typescript
// 1. Añadir import
import {Share} from 'react-native';

// 2. Reemplazar función
const handleShare = async () => {
  // Implementación real
};
```

**Líneas modificadas:**
- Import: Línea ~1-13
- Función: Línea ~97-120

---

### 2. **ChapterReadingScreen.tsx**

#### Cambios:
```typescript
// 1. Añadir import
import {Share} from 'react-native';

// 2. Reemplazar función
const handleShare = async () => {
  // Implementación real
};
```

**Líneas modificadas:**
- Import: Línea ~1-9
- Función: Línea ~293-330

---

## 🎯 Resultado Final

### Antes ❌
```typescript
const handleShare = () => {
  Alert.alert(
    '🔗 Compartir',
    'Funcionalidad en desarrollo.',
    [{text: 'Entendido'}]
  );
};
```
- No compartía nada
- Solo mostraba un Alert
- Experiencia frustrante

### Ahora ✅
```typescript
const handleShare = async () => {
  const message = `📖 ${reference}\n\n${text}\n\n🙏 Compartido desde Biblia App`;
  
  const result = await Share.share({
    message: message,
    title: reference,
  });
  
  // Maneja resultado
};
```
- Comparte realmente
- Abre menú nativo
- Usuario elige app de destino
- Experiencia nativa y profesional

---

## 🚀 Cómo Usar en Futuros Proyectos

### Template Básico

```typescript
import {Share, Alert} from 'react-native';

const handleShare = async () => {
  try {
    // 1. Preparar el contenido
    const message = 'Tu mensaje aquí';
    const title = 'Título';

    // 2. Compartir
    const result = await Share.share({
      message,
      title,
    });

    // 3. Manejar resultado (opcional)
    if (result.action === Share.sharedAction) {
      console.log('Compartido');
    } else if (result.action === Share.dismissedAction) {
      console.log('Cancelado');
    }
  } catch (error) {
    Alert.alert('Error', 'No se pudo compartir');
    console.error(error);
  }
};
```

### Checklist de Implementación

- [ ] Importar `Share` de `react-native`
- [ ] Crear función `handleShare` con `async`
- [ ] Usar `try-catch` para manejar errores
- [ ] Preparar mensaje con formato bonito
- [ ] Llamar `Share.share()` con `message` y `title`
- [ ] Manejar resultado (opcional)
- [ ] Conectar función a un botón
- [ ] Probar en dispositivo real

---

## 🎓 Conceptos Clave

### 1. **API Nativa**
Share usa las APIs nativas de iOS y Android, por eso funciona tan bien.

### 2. **Async/Await**
Es una Promise, siempre usar `await` y `async`.

### 3. **Multiplataforma**
Un solo código funciona en iOS y Android.

### 4. **Sin Dependencias**
No necesitas librerías externas, viene con React Native.

### 5. **Flexible**
Puedes compartir texto, URLs, y con expo-sharing, también archivos.

---

## 📚 Recursos Adicionales

### Documentación Oficial
- [React Native Share API](https://reactnative.dev/docs/share)

### Alternativas
- `expo-sharing`: Para compartir archivos
- `react-native-share`: Más opciones (requiere instalación)

### Expo Sharing (Para archivos)
```bash
npx expo install expo-sharing
```

```typescript
import * as Sharing from 'expo-sharing';

await Sharing.shareAsync('file://path/to/file', {
  mimeType: 'application/pdf',
  dialogTitle: 'Compartir archivo',
});
```

---

## ✅ Resumen

La funcionalidad de compartir es:

✅ **Fácil de implementar** - Solo necesitas `Share.share()`
✅ **Nativa** - Usa el menú del sistema operativo
✅ **Multiplataforma** - Un código para iOS y Android
✅ **Sin librerías** - Viene con React Native
✅ **Profesional** - Experiencia de usuario excelente
✅ **Flexible** - Puedes compartir lo que quieras

**Con 10 líneas de código tienes una funcionalidad completa de compartir.** 🎉

---

## 🎯 Próximos Pasos

1. ✅ Ya implementado en DailyReadingScreen
2. ✅ Ya implementado en ChapterReadingScreen
3. 📝 Puedes implementarlo en otras pantallas siguiendo el mismo patrón
4. 🎨 Personaliza el mensaje según tu contenido
5. 🚀 Prueba en dispositivo real para mejor experiencia

---

**¡Ahora sabes cómo implementar la funcionalidad de compartir en cualquier app React Native!** 📤✨
