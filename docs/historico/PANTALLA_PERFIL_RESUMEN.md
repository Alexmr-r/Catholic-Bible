# 🎯 Pantalla de Perfil - Resumen Visual

## ¿Qué es?

Una nueva pantalla que muestra el perfil del usuario con opciones de configuración. Aparece cuando haces clic en el icono de usuario en la pantalla de Biblia.

---

## 🏗️ Estructura

```
┌─────────────────────────────────┐
│  HEADER                         │  ← Header fijo
│  <  (Botón atrás)               │
├─────────────────────────────────┤
│                                 │
│          [AVATAR]               │  ← ScrollView (contenido que scrollea)
│        Gabriel García           │
│     gabriel@ecclesia.com        │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 📖 Ajustes de Lectura       │ │
│ │    Tamaño de letra y temas  │ │  ← Menú Item 1
│ │                           > │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 👤 Mi Cuenta                │ │
│ │    Datos personales y perfil│ │  ← Menú Item 2
│ │                           > │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ ❓ Guía y Soporte           │ │
│ │    Centro de asistencia     │ │  ← Menú Item 3
│ │                           > │ │
│ └─────────────────────────────┘ │
│                                 │
│                                 │
│        Cerrar Sesión            │  ← Botón rojo
│                                 │
└─────────────────────────────────┘
```

---

## 📂 Archivos Involucrados

### 1. **Nuevo Archivo: `ProfileScreen.tsx`**
```
src/screens/ProfileScreen.tsx (286 líneas)
```

**Lo que hace:**
- Define la pantalla de perfil
- Obtiene datos del usuario del contexto
- Maneja la funcionalidad de cerrar sesión

**Componentes principales:**
```typescript
<View style={styles.header}>           // Header fijo
  <TouchableOpacity>                   // Botón atrás
    <MaterialIcons name="arrow-back-ios-new" />
  </TouchableOpacity>
</View>

<ScrollView>                           // Contenido scrolleable
  <View style={styles.profileSection}> // Foto y datos
  <View style={styles.menuContainer}>  // Las 3 opciones
  <TouchableOpacity>                   // Cerrar sesión
</ScrollView>
```

---

### 2. **Modificado: `AppNavigator.tsx`**

#### Cambio 1: Importar
```typescript
import ProfileScreen from "../screens/ProfileScreen";
```

#### Cambio 2: Agregar a tipos
```typescript
export type RootStackParamList = {
  // ...
  Profile: undefined;  // ← AÑADIDO
  // ...
};
```

#### Cambio 3: Registrar
```typescript
<RootStack.Screen
  name="Profile"
  component={ProfileScreen}
  options={{ animation: 'slide_from_right' }}
/>
```

---

### 3. **Modificado: `BibleSearchScreen.tsx`**

**Cambio:**
```typescript
// ANTES
const handleProfile = () => {
  Alert.alert('👤 Perfil', 'Funcionalidad mockeada...', [{text: 'Entendido'}]);
};

// AHORA
const handleProfile = () => {
  navigation.navigate('Profile');  // ✅ Navega a la pantalla real
};
```

---

## 🎨 Elementos Visuales

### Avatar
```typescript
width: 96px
height: 96px
borderRadius: 48px (circular)
borderWidth: 2px
borderColor: gold/20 (borde elegante)
```

### Menú Items
```typescript
flexDirection: row
padding: 16px
borderRadius: 12px
background: white
border: 1px (ivory)
shadow: light (elevation: 2)

Cada item tiene:
- Icono (48x48, gold, en círculo)
- Título (17px, bold)
- Descripción (13px, muted)
- Chevron derecha (>)
```

### Botón Cerrar Sesión
```typescript
fontSize: 15px
fontWeight: 600
color: burgundy (rojo)
```

---

## 🔄 Flujo de Uso

```
Usuario en Biblia
       ↓
Hace clic en icono 👤
       ↓
navigation.navigate('Profile')
       ↓
ProfileScreen carga
       ↓
Muestra datos del usuario
       ↓
Usuario puede:
├─ Hacer clic en opciones (Alerts)
├─ Hacer clic Cerrar Sesión
│  ├─ Muestra confirmación
│  ├─ Si confirma → logout()
│  └─ Navega a Auth
├─ Hacer clic < atrás
│  └─ Vuelve a Biblia
```

---

## 📊 Datos Dinámicos

Los datos vienen del contexto de autenticación:

```typescript
const {user, logout} = useAuth();

// user tiene:
// - user.fullName    (Gabriel García)
// - user.email       (gabriel.garcia@ecclesia.com)
```

**Se muestra así:**
```typescript
<Text>{user?.fullName || 'Usuario'}</Text>
<Text>{user?.email || 'email@example.com'}</Text>
```

---

## ✨ Características

| Feature | Status |
|---------|--------|
| Foto de perfil circular | ✅ |
| Nombre dinámico | ✅ |
| Email dinámico | ✅ |
| Header fijo | ✅ |
| Botón atrás funcional | ✅ |
| Menú 3 opciones | ✅ |
| Cerrar sesión | ✅ |
| Confirmación logout | ✅ |
| Animación suave | ✅ |
| Responsive | ✅ |
| "Guía y Soporte" | ✅ |

---

## 🎯 Resumen de Cambios

| Cambio | Archivo | Líneas |
|--------|---------|--------|
| Crear pantalla | ProfileScreen.tsx | 286 |
| Importar | AppNavigator.tsx | +1 |
| Agregar tipo | AppNavigator.tsx | +1 |
| Registrar | AppNavigator.tsx | +6 |
| Conectar botón | BibleSearchScreen.tsx | 1 |

**Total de cambios:** 4 archivos afectados

---

## 🚀 Cómo Probarlo

```
1. Inicia la app
2. Inicia sesión
3. Ve a la tab "Biblia"
4. Haz clic en icono 👤 (arriba derecha)
5. ¡Ves la pantalla de Perfil!
6. Haz clic en < para volver
```

---

## ✅ Estado

**COMPLETADO Y FUNCIONANDO ✅**

La pantalla está:
- Creada ✅
- Navegada correctamente ✅
- Con datos dinámicos ✅
- Con funcionalidades ✅
- Responsive ✅
- Integrada en la app ✅
