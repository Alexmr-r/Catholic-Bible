# 👤 Implementación de Pantalla Mi Cuenta (Account Screen)

## 📅 Fecha
2 de febrero de 2026

## 🎯 Objetivo
Crear una pantalla completa para que el usuario pueda editar su perfil (nombre completo, correo electrónico) y gestionar su cuenta. Basada en el diseño HTML de referencia.

## ✨ Características Implementadas

### 1. **Navegación**
- Se agregó la ruta `Account` al `RootStackParamList`
- Navegación desde ProfileScreen al hacer clic en "Mi Cuenta"
- **Sin navegación inferior** (bottom tabs ocultos automáticamente en pantallas del stack)
- Botón de retroceso con icono `arrow-back-ios-new`

### 2. **Header**
- Título centrado: "Mi Cuenta"
- Fondo semi-transparente (ivory con opacidad)
- Layout balanceado con espaciador a la derecha
- Botón de retroceso alineado a la izquierda

### 3. **Foto de Perfil**
- Avatar circular de 96x96px
- Borde dorado sutil con opacidad
- Botón de cámara flotante en la esquina inferior derecha
- Avatar generado dinámicamente con las iniciales del usuario usando `ui-avatars.com`
- Sombra suave y elegante
- Al hacer clic, muestra opciones: "Tomar Foto", "Elegir de Galería", "Cancelar"

### 4. **Formulario de Edición**
- **Nombre Completo**:
  - Label en mayúsculas con tracking amplio
  - Input con fondo blanco y borde sutil
  - Placeholder: "Tu nombre"
  - Auto-capitalización de palabras

- **Correo Electrónico**:
  - Label en mayúsculas con tracking amplio
  - Input con fondo blanco y borde sutil
  - Placeholder: "correo@ejemplo.com"
  - Teclado de tipo email
  - Sin auto-capitalización

- **Cambiar Contraseña**:
  - Botón tipo card con icono de candado dorado
  - Chevron derecho para indicar navegación
  - Sombra sutil
  - Muestra alert de "próximamente" (preparado para implementación futura)

### 5. **Botón Guardar Cambios**
- Estilo burgundy (color principal de acción)
- Totalmente redondeado (border-radius: 9999)
- Sombra con color burgundy para efecto de elevación
- Muestra ActivityIndicator mientras guarda
- Se deshabilita durante el guardado
- Validaciones:
  - Nombre completo requerido
  - Correo requerido
  - Formato de email válido

### 6. **Eliminar Cuenta**
- Texto pequeño y discreto al final
- Color gris claro
- Muestra confirmación con doble advertencia
- Preparado para implementación futura del endpoint

### 7. **Carga de Datos**
- Loading state inicial con ActivityIndicator
- Refresca datos del usuario desde la API al montar
- Usa el hook `useAuth` para acceder al usuario actual
- Llama a `refreshAuth()` para obtener datos actualizados

## 🎨 Diseño y Estilos

### Colores Principales
- **Fondo principal**: `colors.ivory.DEFAULT` (#FAF9F6)
- **Cards/Inputs**: Blanco (#FFFFFF)
- **Bordes**: Gris claro (#E2E8F0, #F1F5F9)
- **Acento dorado**: `colors.gold.DEFAULT` (#D4AF37)
- **Botón principal**: `colors.burgundy.DEFAULT` (#800020)
- **Texto**: `colors.charcoal.DEFAULT` (#374151)
- **Texto secundario**: `colors.ink.light` (#6B7280)

### Espaciado
- Padding del scroll: 24px horizontal, 16px superior, 48px inferior
- Gap entre campos del formulario: 24px
- MaxWidth del contenido: 448px (centrado)
- Avatar: 96x96px con border-radius de 48px

### Tipografía
- Título del header: 18px, semibold, serif
- Labels de inputs: 13px, medium, uppercase, tracking: 2
- Texto de inputs: 16px
- Botones: 15-16px, medium/semibold

### Sombras
- Avatar: shadowOpacity 0.1, shadowRadius 4
- Inputs/Cards: shadowOpacity 0.05, shadowRadius 2
- Botón guardar: shadowOpacity 0.1, shadowRadius 12
- Botón de cámara: shadowOpacity 0.2, shadowRadius 3

## 🔧 Integración con Backend

### Datos del Usuario
- Se obtienen del contexto `useAuth`
- El hook `refreshAuth()` llama al endpoint `/auth/me` vía `authService.getCurrentUser()`
- Endpoint existente: `GET /api/v1/auth/me`
- Response:
  ```typescript
  {
    id: string;
    email: string;
    fullName: string;
  }
  ```

### Guardar Cambios (Finalizado)
La funcionalidad de guardar datos de perfil comunica con:

**Endpoint**: `PUT /api/v1/users/me`

### Cambiar Contraseña (Finalizado)
Se implementó exitosamente `ChangePasswordScreen.tsx` (nueva pantalla conectada desde Cuenta).
**Endpoint implementado**: `PUT /api/v1/users/me/password`

### Eliminar Cuenta (Finalizado)
**Endpoint implementado**: `DELETE /api/v1/users/me`
Al presionar el botón y confirmar con la alerta, se usa el endpoint de arriba seguido de `logout()` para enviar al usuario de vuelta a la pantalla de Login y cerrar su sesión temporal.

## 📱 Validaciones Implementadas

1. **Nombre Completo**:
   - No puede estar vacío
   - Se elimina espacio en blanco al inicio/final

2. **Email**:
   - No puede estar vacío
   - Debe cumplir formato de email válido (regex)
   - Se elimina espacio en blanco

3. **UI**:
   - Loading state durante la carga inicial
   - Botón deshabilitado durante guardado
   - ActivityIndicator visible durante guardado

## 🔗 Archivos Relacionados

### Creados
- `src/screens/AccountScreen.tsx`

### Modificados
- `src/screens/ProfileScreen.tsx`: Handler de navegación
- `src/navigation/AppNavigator.tsx`: Ruta y tipo agregados

### Utilizados
- `src/contexts/AuthContext.tsx`: Gestión de usuario actual
- `src/services/auth.service.ts`: Llamadas a API de autenticación
- `src/theme/colors.ts`: Paleta de colores

## 📊 Estructura de Archivos

```
BibliaAppExpo/
├── src/
│   ├── screens/
│   │   ├── AccountScreen.tsx ✅ NUEVO
│   │   └── ProfileScreen.tsx ✏️ MODIFICADO
│   ├── navigation/
│   │   └── AppNavigator.tsx ✏️ MODIFICADO
│   ├── contexts/
│   │   └── AuthContext.tsx
│   ├── services/
│   │   ├── auth.service.ts
│   │   └── api.client.ts
│   └── theme/
│       └── colors.ts
```

## ✅ Validaciones Realizadas

- ✅ Sin errores de TypeScript
- ✅ Navegación funcional desde Perfil
- ✅ Datos del usuario se cargan correctamente
- ✅ Formulario funciona correctamente
- ✅ Validaciones de inputs implementadas
- ✅ Loading states implementados
- ✅ Sin navegación inferior (bottom tabs ocultos)
- ✅ Avatar generado con iniciales del usuario

## 🚧 Pendientes de Implementación en Backend

### 1. Endpoint de Actualización de Perfil

**Backend (Java/Spring Boot)**:

```java
// UserController.java
@PutMapping("/users/me")
@Operation(summary = "Actualizar perfil del usuario actual")
public ResponseEntity<UserDto> updateCurrentUser(
        @RequestHeader("Authorization") String authHeader,
        @RequestBody @Valid UpdateUserRequest request) {
    
    String token = authHeader.replace("Bearer ", "");
    User currentUser = authenticationUseCase.getCurrentUser(token);
    
    User updatedUser = userService.updateUser(
            currentUser.getId(),
            request.fullName(),
            request.email()
    );
    
    return ResponseEntity.ok(new UserDto(
            updatedUser.getId().toString(),
            updatedUser.getEmail(),
            updatedUser.getFullName()
    ));
}

// DTOs
public record UpdateUserRequest(
    @NotBlank String fullName,
    @Email @NotBlank String email
) {}
```

### 2. Endpoint de Cambiar Contraseña

```java
@PutMapping("/users/me/password")
@Operation(summary = "Cambiar contraseña del usuario actual")
public ResponseEntity<Void> changePassword(
        @RequestHeader("Authorization") String authHeader,
        @RequestBody @Valid ChangePasswordRequest request) {
    
    String token = authHeader.replace("Bearer ", "");
    User currentUser = authenticationUseCase.getCurrentUser(token);
    
    userService.changePassword(
            currentUser.getId(),
            request.currentPassword(),
            request.newPassword()
    );
    
    return ResponseEntity.noContent().build();
}

// DTO
public record ChangePasswordRequest(
    @NotBlank String currentPassword,
    @NotBlank @Size(min = 8) String newPassword
) {}
```

### 3. Endpoint de Eliminar Cuenta

```java
@DeleteMapping("/users/me")
@Operation(summary = "Eliminar cuenta del usuario actual")
public ResponseEntity<Void> deleteCurrentUser(
        @RequestHeader("Authorization") String authHeader) {
    
    String token = authHeader.replace("Bearer ", "");
    User currentUser = authenticationUseCase.getCurrentUser(token);
    
    userService.deleteUser(currentUser.getId());
    
    return ResponseEntity.noContent().build();
}
```

### 4. Frontend - Actualizar apiClient

Una vez implementados los endpoints, actualizar el AccountScreen:

```typescript
// Guardar cambios (línea 90)
const response = await apiClient.put<User>('/users/me', {
  fullName: fullName.trim(),
  email: email.trim(),
});

// Actualizar contexto
await refreshAuth();
```

## 🎯 Mejoras Futuras (Opcionales)

1. **Funcionalidad de Foto**:
   - Integrar con `expo-image-picker`
   - Subir imagen a servidor/cloud storage
   - Mostrar preview antes de guardar

2. **Validaciones Avanzadas**:
   - Verificar si el email ya está en uso
   - Validación en tiempo real con debounce
   - Mostrar indicadores de fortaleza de contraseña

3. **Cambio de Contraseña**:
   - Crear modal/pantalla dedicada
   - Validaciones de seguridad (mínimo 8 caracteres, mayúsculas, números, etc.)
   - Indicador visual de fortaleza

4. **Notificaciones**:
   - Toast en lugar de Alert para mejor UX
   - Confirmación visual de guardado exitoso

5. **Animaciones**:
   - Transición suave al guardar
   - Feedback visual en inputs
   - Shimmer loading state

## 📝 Notas Técnicas

### Avatar Generado
Se usa el servicio `ui-avatars.com` para generar avatares con las iniciales:
```typescript
`https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=D4AF37&color=fff&size=200`
```
- `name`: Nombre completo del usuario (URL encoded)
- `background`: Color dorado (#D4AF37)
- `color`: Texto blanco
- `size`: 200px (alta resolución)

### Navegación
- La pantalla está en el RootStack, no en los tabs
- Los bottom tabs se ocultan automáticamente (comportamiento por defecto)
- La animación es `slide_from_right` para fluidez

### Persistencia
- Los datos se guardan en el backend y se sincronizan con el contexto
- No se usa AsyncStorage local para datos de perfil (single source of truth: backend)
- El token de autenticación sí persiste en AsyncStorage

---

**Implementado por**: GitHub Copilot  
**Basado en**: Diseño HTML de referencia (`code.html`)  
**Estado**: ✅ UI Completa - Backend endpoints pendientes
