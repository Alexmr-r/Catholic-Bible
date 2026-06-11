# 📖 Implementación de Pantalla de Ajustes de Lectura

## 📅 Fecha
2 de febrero de 2026

## 🎯 Objetivo
Crear una pantalla completa dedicada para ajustar las preferencias de lectura, accesible desde el Perfil del usuario. Basada en el diseño HTML de referencia con ajustes para React Native.

## ✨ Características Implementadas

### 1. **Navegación**
- Se agregó la ruta `ReadingSettings` al `RootStackParamList`
- Navegación desde ProfileScreen al hacer clic en "Ajustes de Lectura"
- Botón de retroceso con icono `chevron-left` en color dorado

### 2. **Header**
- Título centrado: "Ajustes de Lectura"
- Fondo semi-transparente con efecto de glassmorphism
- Layout balanceado con espaciador a la derecha

### 3. **Tamaño de Fuente**
- Slider horizontal de 80% a 150% (en incrementos de 5%)
- Iconos de `format-size` pequeño y grande en los extremos
- Badge dinámico que muestra el nivel: "Pequeño", "Intermedio", "Grande"
- Vista previa en tiempo real con la frase: "Tu palabra es una lámpara a mis pies"
- Card con fondo blanco semi-transparente y bordes suaves

### 4. **Estilo de Tipografía**
- Grid con 2 opciones: Clásica (Serif) y Moderna (Sans)
- Cada tarjeta muestra:
  - Muestra del alfabeto "Aa" en la fuente correspondiente
  - Etiqueta en mayúsculas (CLÁSICA/MODERNA)
  - Subtítulo (Serif/Sans Serif)
- Estado activo:
  - Borde dorado
  - Fondo blanco sólido
  - Etiqueta en color dorado
  - Sombra suave
  - Opacidad 100%
- Estado inactivo:
  - Sin borde (transparente)
  - Fondo gris claro
  - Opacidad 60%

### 5. **Vista Previa**
- Card con fondo blanco semi-transparente (muestra el fondo real de la app)
- Texto de ejemplo: Génesis 1:1-3
- Altura máxima de 160px con overflow hidden
- Degradado sutil al final usando `LinearGradient` de expo
- Aplica en tiempo real:
  - Tamaño de fuente seleccionado
  - Familia de fuente seleccionada
- Nota informativa debajo: "El tema Marfil/Sepia está optimizado para una lectura prolongada y descanso visual"

## 🎨 Diseño y Estilos

### Colores Principales
- **Fondo principal**: `colors.ivory.DEFAULT` (#FAF9F6)
- **Cards**: Blanco semi-transparente (rgba(255, 255, 255, 0.3))
- **Acentos**: `colors.gold.DEFAULT` (#D4AF37)
- **Texto**: `colors.charcoal.DEFAULT` (#374151)
- **Texto secundario**: `colors.ink.light` (#6B7280)

### Espaciado y Compacidad
- Padding del scroll: 24px horizontal, 8px superior, 40px inferior
- Separación entre secciones: 24px
- Padding de cards reducido: 20-24px para que todo quepa en una pantalla
- MaxWidth del contenido: 448px (centrado)

### Tipografía
- Título del header: 18px, bold, serif
- Títulos de sección: 12px, bold, uppercase, tracking amplio
- Etiquetas: 11px con tracking muy amplio (2.2)
- Texto de preview: 19px base (ajustable)

## 🔧 Integración con Contexto

### TextSettingsContext
La pantalla utiliza el contexto existente para:
- Leer valores actuales: `settings.fontSize`, `settings.fontFamily`
- Actualizar valores: `updateFontSize()`, `updateFontFamily()`
- Persistencia automática en AsyncStorage

### Estados
- Todos los cambios son instantáneos y se reflejan en tiempo real
- No hay botones de "Guardar" o "Cancelar" (cambios automáticos)
- Los cambios persisten y se aplican en todas las pantallas de lectura

## 📱 Componentes Utilizados

### Nativos de React Native
- `View`, `Text`, `ScrollView`, `TouchableOpacity`, `StyleSheet`

### Expo
- `LinearGradient` (expo-linear-gradient): Para el degradado en la vista previa
- `MaterialIcons` (@expo/vector-icons): Iconos de la interfaz

### Terceros
- `Slider` (@react-native-community/slider): Control deslizante del tamaño

## 🔗 Archivos Relacionados

### Creados
- `src/screens/ReadingSettingsScreen.tsx`

### Modificados
- `src/screens/ProfileScreen.tsx`: Handler de navegación
- `src/navigation/AppNavigator.tsx`: Ruta y tipo agregados

### Utilizados
- `src/contexts/TextSettingsContext.tsx`: Gestión de estado
- `src/theme/colors.ts`: Paleta de colores

## 📊 Estructura de Archivos

```
BibliaAppExpo/
├── src/
│   ├── screens/
│   │   ├── ReadingSettingsScreen.tsx ✅ NUEVO
│   │   └── ProfileScreen.tsx ✏️ MODIFICADO
│   ├── navigation/
│   │   └── AppNavigator.tsx ✏️ MODIFICADO
│   ├── contexts/
│   │   └── TextSettingsContext.tsx
│   └── theme/
│       └── colors.ts
```

## ✅ Validaciones Realizadas

- ✅ Sin errores de TypeScript
- ✅ Navegación funcional desde Perfil
- ✅ Slider funciona correctamente
- ✅ Cambio de fuente funciona
- ✅ Vista previa se actualiza en tiempo real
- ✅ Todo cabe en una pantalla sin scroll excesivo
- ✅ Degradado funciona correctamente con el fondo real
- ✅ Espaciado adecuado entre secciones

## 🎯 Mejoras Futuras (Opcionales)

1. **Temas adicionales**
   - Modo nocturno/oscuro
   - Tema sepia como opción
   - Personalización de colores

2. **Más opciones de fuentes**
   - OpenDyslexic para accesibilidad
   - Más familias de fuentes

3. **Ajustes avanzados**
   - Interlineado personalizable
   - Márgenes ajustables
   - Espaciado entre palabras

4. **Animaciones**
   - Transición suave al cambiar valores
   - Feedback háptico en iOS

## 📝 Notas Técnicas

### Diferencias con HTML de Referencia
- **Degradado**: Se usa `LinearGradient` en lugar de CSS `background: linear-gradient`
- **Backdrop Blur**: No disponible en React Native, se usa opacidad en su lugar
- **Transition**: No soportado, los cambios son inmediatos
- **Fondo de preview**: Se usa el fondo real de la app (ivory) en lugar de sepia fijo

### Optimizaciones
- Cálculo de label de tamaño en función local
- Uso de hooks de contexto para evitar prop drilling
- Estilos optimizados con StyleSheet
- Tamaños y padding reducidos para mejor aprovechamiento del espacio

---

**Implementado por**: GitHub Copilot  
**Basado en**: Diseño HTML de referencia (`code.html`)  
**Estado**: ✅ Completado y funcional
