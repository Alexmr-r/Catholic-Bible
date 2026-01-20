# Cambios en DailyReadingScreen

## 📋 Resumen
Ajustes visuales en la pantalla de Lectura Diaria para que coincida con el diseño HTML de referencia.

## 🎨 Cambios Realizados

### 1. **Opacidad de la Imagen Hero**
- ✅ Reducida de `0.75` a `0.4`
- **Por qué**: La imagen se veía muy fuerte/oscura. Ahora es más suave y transparente como en el diseño original.

### 2. **Altura de la Imagen Hero**
- ✅ Reducida de `256px` a `220px`
- **Por qué**: La imagen era demasiado alta. Ahora es más compacta y equilibrada.

### 3. **Color del Título de la Lectura**
- ✅ Cambiado de `colors.primary.DEFAULT` (#6B9080) a `colors.primary.dark` (#4A665A)
- **Por qué**: El verde era muy claro. Ahora es más intenso y legible como en el HTML.

### 4. **Degradado en la Imagen Hero**
- ✅ Agregado `LinearGradient` en la parte inferior
- **Colores**: De `rgba(250, 250, 245, 0)` a `rgba(250, 250, 245, 1)` (transparente → crema)
- **Altura**: 80px
- **Por qué**: Eliminaba el corte abrupto de la imagen con el fondo. Ahora hay una transición suave.

### 5. **Espaciado del Texto del Evangelio**
- ✅ Texto en una sola línea sin saltos de línea innecesarios en JSX
- ✅ Ajustado `lineHeight` del `dropCap` de `48` a `32`
- **Por qué**: Los saltos de línea en JSX creaban espacios extra. Ahora el texto fluye naturalmente.

## 📦 Dependencias Añadidas
- `expo-linear-gradient` (ya estaba instalado en el proyecto)

## 🔧 Archivos Modificados
- `/src/screens/DailyReadingScreen.tsx`

## 📸 Comparación

### Antes:
- Imagen muy oscura y fuerte
- Imagen muy alta
- Verde del título muy claro
- Corte abrupto de la imagen
- Espaciado extraño en el primer párrafo

### Después:
- Imagen suave y transparente (opacidad 0.4)
- Imagen compacta (220px)
- Verde del título más intenso
- Degradado suave en la parte inferior
- Texto fluido sin espaciados raros

## ✅ Estado
Todos los cambios aplicados y verificados sin errores de compilación.

