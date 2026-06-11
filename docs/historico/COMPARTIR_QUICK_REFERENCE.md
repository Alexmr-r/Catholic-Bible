# 📤 Compartir en React Native - Quick Reference

## 🚀 Implementación en 5 Pasos

### 1. Importar
```typescript
import {Share, Alert} from 'react-native';
```

### 2. Crear Función
```typescript
const handleShare = async () => {
  try {
    const result = await Share.share({
      message: 'Tu texto aquí',
      title: 'Título',
    });
    
    if (result.action === Share.sharedAction) {
      console.log('Compartido ✅');
    }
  } catch (error) {
    Alert.alert('Error', 'No se pudo compartir');
  }
};
```

### 3. Conectar a Botón
```typescript
<TouchableOpacity onPress={handleShare}>
  <MaterialIcons name="share" size={24} />
</TouchableOpacity>
```

### 4. Formatear Mensaje
```typescript
const message = `📖 Título\n\nContenido aquí\n\n🙏 Desde Mi App`;
```

### 5. Probar
- En dispositivo real para mejor experiencia
- Verifica que aparezcan las apps instaladas

---

## 📋 API Share.share()

```typescript
await Share.share({
  message: string,    // Texto (obligatorio)
  title?: string,     // Título (Android)
  url?: string,       // URL (iOS)
});
```

### Resultado
```typescript
{
  action: 'sharedAction' | 'dismissedAction',
  activityType?: string  // Solo iOS
}
```

---

## 💡 Ejemplo Real - Compartir Versículo

```typescript
const handleShareVerse = async () => {
  const verse = "En el principio creó Dios los cielos y la tierra.";
  const reference = "Génesis 1:1";
  
  try {
    await Share.share({
      message: `📖 ${reference}\n\n"${verse}"\n\n🙏 Desde Biblia App`,
      title: reference,
    });
  } catch (error) {
    Alert.alert('Error', 'No se pudo compartir');
  }
};
```

---

## ✅ Checklist

- [ ] Import Share
- [ ] Función async/await
- [ ] try-catch
- [ ] Formatear mensaje
- [ ] Añadir title
- [ ] Conectar a botón
- [ ] Probar en dispositivo

---

## 🎯 Lo Implementado en el Proyecto

### DailyReadingScreen
```typescript
// Comparte la lectura del día completa
const handleShare = async () => {
  const message = `📖 Lectura del día - ${date}\n\n` +
                  `${reference}\n\n"${text}"\n\n🙏 Desde Biblia App`;
  await Share.share({message, title: reference});
};
```

### ChapterReadingScreen
```typescript
// Comparte versículos seleccionados
const handleShare = async () => {
  const message = `📖 ${reference}\n\n${versesText}\n\n🙏 Desde Biblia App`;
  await Share.share({message, title: reference});
};
```

---

## 🔧 Troubleshooting

**Error: Share is not defined**
```typescript
// Solución: Importar
import {Share} from 'react-native';
```

**No se muestra el title**
```typescript
// Normal en iOS - title solo funciona en Android
```

**No aparecen apps**
```typescript
// Solución: Probar en dispositivo real
// El simulador tiene apps limitadas
```

---

## 📱 Plataformas

| Feature | iOS | Android |
|---------|-----|---------|
| message | ✅ | ✅ |
| title | ❌ | ✅ |
| url | ✅ | ❌ |
| activityType | ✅ | ❌ |

---

## 🎨 Tips

1. **Usa emojis** para hacer el mensaje atractivo
2. **Incluye referencia** para dar contexto
3. **Añade crédito** de tu app al final
4. **Formatea bien** con saltos de línea
5. **Prueba en real** para mejor UX

---

## 🚀 Para Copiar y Pegar

```typescript
import {Share, Alert} from 'react-native';

const handleShare = async () => {
  try {
    const result = await Share.share({
      message: '📖 Tu contenido aquí\n\n🙏 Desde Mi App',
      title: 'Título',
    });
    
    if (result.action === Share.sharedAction) {
      console.log('Compartido');
    }
  } catch (error) {
    Alert.alert('Error', 'No se pudo compartir');
  }
};
```

---

**¡Listo! Ahora puedes implementar compartir en 2 minutos.** 📤✨
