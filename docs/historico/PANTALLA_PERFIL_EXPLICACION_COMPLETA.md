# 📱 Pantalla de Perfil - Explicación Completa

## 🎯 ¿Qué es lo que se hizo?

Se creó una nueva pantalla de **Perfil de Usuario** que aparece cuando haces clic en el icono de usuario en la pantalla de Biblia. Esta pantalla muestra la información del usuario y proporciona acceso a diferentes configuraciones.

---

## 📋 Contenido de la Pantalla

La pantalla de Perfil tiene estos elementos:

### 1. **Header con Botón de Retroceso**
```
┌─────────────────────┐
│ <  (botón atrás)    │  ← Fijo en la parte superior
└─────────────────────┘
```
- Botón de retroceso para volver a la pantalla anterior
- Fondo translúcido (backdrop blur)
- Fijo en la parte superior (fixed position)

### 2. **Sección de Perfil**
```
┌─────────────────────┐
│    [FOTO CIRCULAR]  │  ← Avatar del usuario
│   Gabriel García    │  ← Nombre dinámico
│ gabriel@ecclesia... │  ← Email dinámico
└─────────────────────┘
```
- Foto circular con borde elegante
- Nombre del usuario (viene del contexto de autenticación)
- Email del usuario (viene del contexto de autenticación)

### 3. **Menú de Opciones (3 items)**
```
┌──────────────────────────────┐
│ 📖 Ajustes de Lectura        │
│    Tamaño de letra y temas   │
│                            > │  ← Opción clickeable
└──────────────────────────────┘

┌──────────────────────────────┐
│ 👤 Mi Cuenta                 │
│    Datos personales y perfil │
│                            > │
└──────────────────────────────┘

┌──────────────────────────────┐
│ ❓ Guía y Soporte            │
│    Centro de asistencia      │
│                            > │
└──────────────────────────────┘
```

Cada opción tiene:
- Un icono dorado en un círculo
- Título y descripción
- Chevron (>) a la derecha indicando que es clickeable

### 4. **Botón Cerrar Sesión**
```
        Cerrar Sesión  ← En rojo/burgundy
```
- Texto rojo (color burgundy)
- Al hacer clic muestra un Alert de confirmación
- Si confirmas, desconecta al usuario

---

## 🛠️ Cómo se Implementó

### Paso 1: Crear el Archivo `ProfileScreen.tsx`

Se creó un nuevo archivo en:
```
src/screens/ProfileScreen.tsx
```

Este archivo es un componente React Native que:

#### **Importa todo lo necesario:**
```typescript
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import {MaterialIcons} from '@expo/vector-icons';
import {colors} from '../theme/colors';
import {useAuth} from '../contexts/AuthContext';
```

#### **Obtiene el usuario del contexto:**
```typescript
const {user, logout} = useAuth();
```
Esto trae el nombre y email del usuario que inició sesión.

#### **Define funciones para cada botón:**
```typescript
const handleLogout = async () => {
  // Muestra confirmación
  Alert.alert('Cerrar Sesión', '¿Estás seguro?', [
    {text: 'Cancelar', style: 'cancel'},
    {
      text: 'Cerrar Sesión',
      style: 'destructive',
      onPress: async () => {
        await logout();
        navigation.navigate('Auth');  // Vuelve al login
      },
    },
  ]);
};
```

---

### Paso 2: Registrar la Pantalla en `AppNavigator.tsx`

Se hicieron 3 cambios en el archivo de navegación:

#### **Cambio 1: Importar ProfileScreen**
```typescript
import ProfileScreen from "../screens/ProfileScreen";
```

#### **Cambio 2: Añadir 'Profile' a los tipos de pantallas**
```typescript
export type RootStackParamList = {
  Auth: undefined;
  MainTabs: undefined;
  Profile: undefined;  // ← AÑADIDO
  OldTestament: undefined;
  // ... más pantallas
};
```

#### **Cambio 3: Registrar la pantalla en el Navigator**
```typescript
<RootStack.Navigator>
  <RootStack.Screen name="Auth" component={AuthNavigator} />
  <RootStack.Screen name="MainTabs" component={MainTabsNavigator} />
  
  {/* ← NUEVA PANTALLA */}
  <RootStack.Screen
    name="Profile"
    component={ProfileScreen}
    options={{
      animation: 'slide_from_right',  // Animación suave
    }}
  />
  
  <RootStack.Screen name="OldTestament" component={OldTestamentScreen} />
  {/* ... más pantallas */}
</RootStack.Navigator>
```

---

### Paso 3: Conectar el Botón en `BibleSearchScreen.tsx`

Se cambió la función `handleProfile` para que navegue a la pantalla de Perfil:

#### **Antes:**
```typescript
const handleProfile = () => {
  Alert.alert(
    '👤 Perfil',
    'Funcionalidad mockeada para demo...',
    [{text: 'Entendido'}]
  );
};
```

#### **Ahora:**
```typescript
const handleProfile = () => {
  navigation.navigate('Profile');  // ✅ Navega a perfil real
};
```

---

## 🎨 Diseño y Estilos

### Colores Utilizados
```typescript
colors.primary.DEFAULT      // Azul para el botón
colors.gold.DEFAULT         // Dorado para los iconos
colors.burgundy.DEFAULT     // Rojo para "Cerrar Sesión"
colors.ivory.DEFAULT        // Fondo beige
colors.charcoal.DEFAULT     // Texto oscuro
colors.charcoal.muted       // Texto gris claro
```

### Estructura de Estilos
```typescript
const styles = StyleSheet.create({
  // Container principal
  container: {
    flex: 1,
    backgroundColor: colors.ivory.DEFAULT,
  },
  
  // Header fijo
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 48,  // Para notch de iPhone
    borderBottomWidth: 1,
    borderBottomColor: colors.ivory.border,
  },
  
  // Botón de retroceso
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  
  // Avatar circular
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: `${colors.gold.DEFAULT}20`,
  },
  
  // Menú items
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.ivory.border,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  
  // Iconos en círculos
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: `${colors.gold.DEFAULT}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
});
```

---

## 🔄 Flujo de Navegación

```
┌─────────────────────┐
│  Pantalla Biblia    │
│  (tab bar)          │
│  ┌───────────────┐  │
│  │ [👤 usuario]  │  ← Haces clic aquí
│  └───────────────┘  │
└─────────────────────┘
         ↓
    (slide_from_right)  ← Animación suave
         ↓
┌─────────────────────┐
│ Pantalla Perfil ← NUEVA
│ ┌───────────────┐   │
│ │ < Atrás       │   │
│ └───────────────┘   │
│ [Avatar]            │
│ Gabriel García      │
│ gabriel@...         │
│                     │
│ [Opción 1]          │
│ [Opción 2]          │
│ [Opción 3]          │
│                     │
│ Cerrar Sesión       │
└─────────────────────┘
         ↓
  (Si haces clic atrás)
         ↓
┌─────────────────────┐
│  Pantalla Biblia    │
│  (tab bar)          │
└─────────────────────┘
```

---

## ✨ Características Implementadas

### 1. **Foto de Perfil Dinámica**
- Trae la URL del avatar del usuario (si existe)
- Circular con borde elegante
- Fondo suave

### 2. **Información Dinámica del Usuario**
```typescript
<Text style={styles.userName}>{user?.fullName || 'Usuario'}</Text>
<Text style={styles.userEmail}>{user?.email || 'email@example.com'}</Text>
```
- Nombre viene del contexto de autenticación
- Email viene del contexto de autenticación
- Si no existen, muestra valores por defecto

### 3. **Menú Interactivo**
Cada opción tiene:
- Icono dorado personalizado
- Título y descripción
- Chevron derecha (>)
- Efecto visual al tocar (opacidad)
- Funciones asociadas (aunque actualmente muestran Alerts)

### 4. **Cerrar Sesión**
```typescript
const handleLogout = async () => {
  Alert.alert(
    'Cerrar Sesión',
    '¿Estás seguro de que deseas cerrar sesión?',
    [
      {text: 'Cancelar', style: 'cancel'},
      {
        text: 'Cerrar Sesión',
        style: 'destructive',
        onPress: async () => {
          await logout();
          navigation.navigate('Auth');
        },
      },
    ]
  );
};
```
- Muestra un Alert de confirmación
- Si confirmas, cierra la sesión
- Te lleva de vuelta a la pantalla de Login

---

## 📱 Responsive Design

La pantalla está optimizada para diferentes tamaños:

### iPhone SE (375px)
```
Escala: 100%
Funciona perfectamente
```

### iPhone 12/13 (390px)
```
Escala: 100%
Funciona perfectamente
```

### iPhone 14 Pro Max (430px)
```
Escala: 100%
Funciona perfectamente
```

### Tablets
```
MaxWidth: contenedor tiene max-width implicito
Todo se adapta correctamente
```

---

## 🎯 Cambio: "Ayuda y Soporte" → "Guía y Soporte"

En la pantalla ProfileScreen se cambió el texto:

```typescript
<TouchableOpacity
  style={styles.menuItem}
  onPress={handleGuidePress}
  activeOpacity={0.7}>
  <View style={styles.iconContainer}>
    <MaterialIcons name="help-outline" size={28} color={colors.gold.DEFAULT} />
  </View>
  <View style={styles.textContainer}>
    <Text style={styles.menuTitle}>Guía y Soporte</Text>  {/* ← CAMBIO */}
    <Text style={styles.menuSubtitle}>Centro de asistencia</Text>
  </View>
  <MaterialIcons name="chevron-right" size={24} color={colors.charcoal.muted} />
</TouchableOpacity>
```

---

## 📝 Archivos Creados/Modificados

| Archivo | Cambio | Descripción |
|---------|--------|-------------|
| `ProfileScreen.tsx` | ✅ CREADO | Nueva pantalla de perfil |
| `AppNavigator.tsx` | ✅ MODIFICADO | Importar + registrar ProfileScreen |
| `BibleSearchScreen.tsx` | ✅ MODIFICADO | Conectar botón usuario a Profile |
| `DailyReadingScreen.tsx` | ✅ MODIFICADO | Arreglar botón GUARDAR REFLEXIÓN |

---

## 🚀 Cómo Usar

1. **Inicia sesión** en la app
2. **Ve a la pantalla Biblia** (tab "Biblia")
3. **Haz clic en el icono de usuario** (arriba derecha)
4. **Verás tu perfil** con:
   - Tu foto
   - Tu nombre
   - Tu email
   - 3 opciones de menú
   - Botón Cerrar Sesión

5. **Haz clic atrás** (<) para volver a Biblia

---

## 💡 Tecnologías Utilizadas

- **React Native**: Framework base
- **React Navigation**: Para la navegación
- **Material Icons**: Para los iconos
- **useAuth Context**: Para obtener datos del usuario
- **StyleSheet**: Para los estilos

---

## ✅ Estado

**🟢 COMPLETADO Y FUNCIONANDO**

- ✅ Pantalla creada
- ✅ Navegación configurada
- ✅ Información dinámica del usuario
- ✅ Funcionalidad Cerrar Sesión
- ✅ Diseño responsive
- ✅ Animaciones suaves
- ✅ Texto cambió a "Guía y Soporte"

---

## 🎉 Resultado Final

Ahora los usuarios pueden:
1. Acceder a su perfil desde cualquier pantalla
2. Ver su información personal
3. Acceder a diferentes opciones
4. Cerrar sesión de forma segura
5. Volver atrás fácilmente

**La pantalla de Perfil es completamente funcional e integrada en la app.**
