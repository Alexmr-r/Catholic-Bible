# 🎨 Guía de Colores - Biblia Católica App

## 📋 Propósito

Este documento establece las **mejores prácticas** para el uso de colores en la aplicación, garantizando **consistencia visual**, **mantenibilidad** y **accesibilidad**.

---

## 🏗️ Arquitectura de Colores

### ✅ Principio Fundamental

**"Un solo lugar para definir, muchos lugares para usar"**

- ✅ **TODOS los colores** se definen en `src/theme/colors.ts`
- ✅ **NINGÚN color hardcodeado** en componentes o pantallas
- ✅ **SIEMPRE importar** desde `colors.ts`

---

## 📁 Estructura del Archivo `colors.ts`

```typescript
// src/theme/colors.ts

// 🎨 Paleta de colores - Biblia Católica App
// Basado en el diseño HTML con colores litúrgicos y sobrios

export const colors = {
  // 1. Fondos principales
  ivory: { ... },
  cream: '#FAFAF5',
  paper: '#F4F1EA',
  
  // 2. Textos
  charcoal: { ... },
  ink: { ... },
  
  // 3. Colores primarios
  primary: { ... },
  secondary: '#A4C3B2',
  
  // 4. Acentos
  gold: { ... },
  burgundy: { ... },
  sky: '#8ECAE6',
  
  // 5. Dark Mode
  background: { ... },
  surface: { ... },
};
```

---

## 📐 Categorías de Colores

### 1️⃣ **Fondos Principales**

Usados para el fondo de pantallas y secciones principales.

| Color | Valor | Uso |
|-------|-------|-----|
| `ivory.DEFAULT` | `#FAF9F6` | Fondo principal de pantallas |
| `ivory.shade` | `#F2EFE9` | Fondos de inputs, tarjetas sutiles |
| `ivory.border` | `#E6E2D8` | Bordes sutiles, divisores |
| `cream` | `#FAFAF5` | Alternativa de fondo, navegación |
| `paper` | `#F4F1EA` | Tarjetas, overlays, secciones destacadas |

**✅ Ejemplo de Uso:**
```typescript
// En un componente
import {colors} from '../theme/colors';

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.ivory.DEFAULT, // ✅ Correcto
  },
  card: {
    backgroundColor: colors.paper, // ✅ Correcto
    borderColor: colors.ivory.border, // ✅ Correcto
  },
});
```

**❌ NO hagas esto:**
```typescript
// ❌ INCORRECTO - Color hardcodeado
backgroundColor: '#FAF9F6',
backgroundColor: 'white',
backgroundColor: '#FFFFFF',
```

---

### 2️⃣ **Textos**

Colores para todo el contenido de texto.

| Color | Valor | Uso |
|-------|-------|-----|
| `charcoal.DEFAULT` | `#374151` | Texto principal, cuerpo |
| `charcoal.muted` | `#6B7280` | Texto secundario, placeholders |
| `charcoal.dark` | `#1F2937` | Títulos, énfasis |
| `ink.DEFAULT` | `#374151` | Texto de lectura (alternativa) |
| `ink.light` | `#6B7280` | Texto terciario, iconos inactivos |

**✅ Ejemplo de Uso:**
```typescript
const styles = StyleSheet.create({
  title: {
    color: colors.charcoal.dark, // ✅ Títulos principales
  },
  body: {
    color: colors.charcoal.DEFAULT, // ✅ Texto de cuerpo
  },
  caption: {
    color: colors.charcoal.muted, // ✅ Texto secundario
  },
  placeholder: {
    color: `${colors.charcoal.muted}80`, // ✅ 50% opacity
  },
});
```

**🎨 Tip - Transparencias:**
```typescript
// Para agregar transparencia, usa template strings con hex
color: `${colors.charcoal.DEFAULT}CC`, // 80% opacity
color: `${colors.charcoal.muted}80`,   // 50% opacity
color: `${colors.charcoal.muted}40`,   // 25% opacity

// Tabla de valores hex para opacidad:
// FF = 100%, CC = 80%, 99 = 60%, 80 = 50%, 66 = 40%, 40 = 25%
```

---

### 3️⃣ **Colores Primarios**

Colores principales de la identidad de la app.

| Color | Valor | Uso |
|-------|-------|-----|
| `primary.DEFAULT` | `#6B9080` | Botones principales, elementos activos |
| `primary.dark` | `#4A665A` | Hover states, énfasis |
| `secondary` | `#A4C3B2` | Acentos secundarios |

**✅ Ejemplo de Uso:**
```typescript
const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary.DEFAULT, // ✅ Botón principal
  },
  buttonPressed: {
    backgroundColor: colors.primary.dark, // ✅ Estado activo
  },
  navItemActive: {
    color: colors.primary.DEFAULT, // ✅ Tab activo
  },
});
```

---

### 4️⃣ **Acentos**

Colores para resaltar elementos importantes.

| Color | Valor | Uso |
|-------|-------|-----|
| `gold.DEFAULT` | `#D4AF37` | Iconos, detalles especiales |
| `gold.light` | `#EBD698` | Fondos sutiles con gold |
| `gold.dim` | `#B09050` | Gold apagado, iconos secundarios |
| `gold.accent` | `#D4A373` | Drop caps, ornamentos |
| `burgundy.DEFAULT` | `#903040` | Botones de acción, llamadas |
| `burgundy.dark` | `#70202C` | Hover, énfasis burgundy |
| `burgundy.accent` | `#9D5C63` | Badges, etiquetas |
| `sky` | `#8ECAE6` | Interacciones, links |

**✅ Ejemplo de Uso:**
```typescript
const styles = StyleSheet.create({
  badge: {
    backgroundColor: colors.burgundy.accent, // ✅ Badge "EVANGELIO"
  },
  dropCap: {
    color: colors.gold.accent, // ✅ Primera letra grande
  },
  icon: {
    color: colors.gold.dim, // ✅ Iconos en inputs
  },
  link: {
    color: colors.sky, // ✅ Enlaces interactivos
  },
});
```

---

### 5️⃣ **Dark Mode** (Futuro)

Colores preparados para modo oscuro.

| Color | Valor | Uso |
|-------|-------|-----|
| `background.light` | `#FAFAF5` | Fondo claro |
| `background.dark` | `#1C1C1E` | Fondo oscuro |
| `surface.light` | `#FFFFFF` | Superficie clara |
| `surface.dark` | `#2C2C2E` | Superficie oscura |
| `surface.highlight` | `#2C2C2E` | Highlight oscuro |

---

## ✅ Reglas de Uso

### 1. **SIEMPRE importar colors**
```typescript
// ✅ Al inicio de cada archivo de pantalla/componente
import {colors} from '../theme/colors';
```

### 2. **NUNCA hardcodear colores**
```typescript
// ❌ INCORRECTO
backgroundColor: '#FAF9F6'
backgroundColor: 'white'
color: '#374151'

// ✅ CORRECTO
backgroundColor: colors.ivory.DEFAULT
backgroundColor: colors.paper
color: colors.charcoal.DEFAULT
```

### 3. **Usar transparencias con template strings**
```typescript
// ✅ CORRECTO - Transparencia dinámica
backgroundColor: `${colors.primary.DEFAULT}20`, // 12% opacity
color: `${colors.charcoal.muted}80`, // 50% opacity
```

### 4. **Comentar usos especiales**
```typescript
checkboxBox: {
  backgroundColor: colors.ivory.shade, // Mismo fondo que inputs
  borderColor: colors.ivory.border,
},
```

---

## 🎯 Mapeo con Diseño HTML

| HTML (Tailwind) | colors.ts | Uso |
|-----------------|-----------|-----|
| `bg-cream` | `colors.cream` | Fondo |
| `bg-paper` | `colors.paper` | Tarjetas |
| `text-ink` | `colors.ink.DEFAULT` | Texto principal |
| `text-ink-light` | `colors.ink.light` | Texto secundario |
| `text-primary` | `colors.primary.DEFAULT` | Primario |
| `bg-primary` | `colors.primary.DEFAULT` | Botón primario |
| `text-accent-gold` | `colors.gold.accent` | Drop cap |
| `bg-accent-burgundy` | `colors.burgundy.accent` | Badge |
| `text-accent-sky` | `colors.sky` | Links interactivos |
| `border-border-light` | `colors.ivory.border` | Bordes |

---

## 🚀 Flujo de Trabajo

### Cuando necesites un color:

1. **¿Ya existe en `colors.ts`?**
   - ✅ SÍ → Úsalo directamente
   - ❌ NO → Continúa al paso 2

2. **¿Es del diseño HTML?**
   - ✅ SÍ → Agrégalo a `colors.ts` primero
   - ❌ NO → Consulta con el diseñador

3. **Agregar a `colors.ts`:**
   ```typescript
   // En colors.ts
   export const colors = {
     // ...existing code...
     nuevoColor: '#HEX123', // Descripción de uso
   };
   ```

4. **Usar en tu componente:**
   ```typescript
   import {colors} from '../theme/colors';
   
   const styles = StyleSheet.create({
     elemento: {
       backgroundColor: colors.nuevoColor,
     },
   });
   ```

---

## 🎨 Casos Especiales

### 1. **Colores con transparencia**
```typescript
// Overlay semi-transparente
backgroundColor: `${colors.charcoal.dark}CC`, // 80% opacity

// Fondo sutil
backgroundColor: `${colors.gold.DEFAULT}20`, // 12% opacity

// Sombras
shadowColor: colors.primary.DEFAULT,
shadowOpacity: 0.3, // 30% opacity
```

### 2. **Gradientes**
```typescript
// No se pueden hacer con colors directamente
// Usa LinearGradient de expo-linear-gradient
<LinearGradient
  colors={[
    colors.cream,
    'transparent',
    colors.cream
  ]}
/>
```

### 3. **Colores para terceros (Expo, React Native)**
```typescript
// Para barStyle, statusBarStyle, etc.
import {StatusBar} from 'expo-status-bar';

<StatusBar
  style="dark" // ✅ Usa valores predefinidos del sistema
  backgroundColor={colors.ivory.DEFAULT} // ✅ Usa colors.ts
/>
```

---

## 📊 Tabla de Referencia Rápida

| Elemento UI | Color Recomendado |
|-------------|-------------------|
| Fondo de pantalla | `colors.ivory.DEFAULT` o `colors.cream` |
| Fondo de tarjeta | `colors.paper` |
| Input background | `colors.ivory.shade` |
| Bordes sutiles | `colors.ivory.border` |
| Texto principal | `colors.charcoal.DEFAULT` |
| Texto secundario | `colors.charcoal.muted` |
| Títulos | `colors.charcoal.dark` |
| Botón primario | `colors.primary.DEFAULT` |
| Botón acción | `colors.burgundy.DEFAULT` |
| Iconos inputs | `colors.gold.dim` |
| Iconos navegación | `colors.ink.light` |
| Tab activo | `colors.primary.DEFAULT` |
| Badge | `colors.burgundy.accent` |
| Link | `colors.sky` |
| Drop cap | `colors.gold.accent` |

---

## ✅ Checklist para Nuevos Componentes

Antes de crear un componente/pantalla:

- [ ] He importado `colors` desde `src/theme/colors.ts`
- [ ] Todos mis colores vienen de `colors.ts`
- [ ] NO tengo ningún valor hex hardcodeado
- [ ] He usado transparencias con template strings cuando necesario
- [ ] He comentado usos especiales de colores
- [ ] He verificado que los colores existen en `colors.ts`

---

## 🔍 Cómo Verificar Cumplimiento

### Buscar colores hardcodeados:

```bash
# En la terminal, buscar valores hex
grep -r "#[0-9A-Fa-f]\{6\}" src/screens/ src/components/

# Si encuentra algo, revísalo y muévelo a colors.ts
```

### Buscar colores de texto literal:

```bash
# Buscar colores comunes hardcodeados
grep -r "backgroundColor: 'white'" src/
grep -r "color: 'black'" src/
grep -r "color: 'red'" src/
```

---

## 📚 Referencias

- Diseño HTML: `/Downloads/stitch_inicio_de_sesión 2/lectura_del_día_1/code.html`
- Material Design Color System: https://m3.material.io/styles/color
- iOS Human Interface Guidelines: https://developer.apple.com/design/human-interface-guidelines/color

---

## 🎯 Próximos Pasos

1. **Implementar Dark Mode** - Usar `background.dark`, `surface.dark`
2. **Agregar colores litúrgicos** - Violeta (Adviento), Verde (Tiempo Ordinario), etc.
3. **Crear variantes semánticas** - `colors.success`, `colors.error`, `colors.warning`

---

**Última actualización**: Diciembre 2025  
**Mantenedor**: Equipo de desarrollo  
**Estado**: ✅ Activo y en uso

