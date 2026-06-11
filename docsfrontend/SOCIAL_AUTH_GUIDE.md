# Guía de Autenticación Social (Google y Apple) en Expo 📱

Esta guía explica cómo funciona la autenticación con **Apple** y **Google** en una aplicación móvil desarrollada con Expo y React Native, y cuáles son los pasos necesarios tanto en el código como en las consolas de desarrollador.

---

## 1. Concepto General: ¿Cómo funciona el "Login Social"?

Cuando un usuario pulsa "Continuar con Google", el flujo es el siguiente:

1.  **Frontend (App)**: Solicita permiso al sistema operativo (iOS/Android).
2.  **Sistema**: Abre un modal nativo o una ventana del navegador de confianza para que el usuario elija su cuenta.
3.  **App**: Recibe un **Token** (normalmente un `idToken` o `userToken`) generado y firmado por Google/Apple.
4.  **Backend (Servidor)**: Tu aplicación envía ese Token a tu servidor.
5.  **Verificación**: Tu servidor envía el Token a los servidores de Google/Apple para verificar que es legítimo.
6.  **Sesión**: Si es válido, tu servidor crea un usuario en la base de datos (si no existía) y devuelve los tokens de sesión de **tu aplicación** (`accessToken`).

---

## 2. Implementación de Apple (iOS) 🍎

Para Apple, usamos la librería `expo-apple-authentication`.

### Requisitos:
*   Necesitas una cuenta de **Apple Developer** (de pago: $99/año).
*   En el [Apple Developer Portal](https://developer.apple.com/), debes habilitar la capacidad "Sign In with Apple" para tu **Bundle Identifier**.
*   En `app.json`, debes añadir el permiso de Apple:
    ```json
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.alexmr.biblia",
      "usesAppleSignIn": true
    }
    ```

### Código (Resumen):
```tsx
import * as AppleAuthentication from 'expo-apple-authentication';

const result = await AppleAuthentication.signInAsync({
  requestedScopes: [
    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
    AppleAuthentication.AppleAuthenticationScope.EMAIL,
  ],
});
// 'result.identityToken' es lo que enviaremos al backend.
```

---

## 3. Implementación de Google 🔍

Para Google, usamos `@react-native-google-signin/google-signin`, que es la opción más robusta para apps nativas.

### Requisitos:
1.  **Google Cloud Console**: Crear un proyecto.
2.  **Credenciales**: Crear un ID de cliente de **iOS** y uno de **Android**.
3.  **Configuración**:
    *   En iOS: Necesitas el archivo `GoogleService-Info.plist`.
    *   En Android: Necesitas el archivo `google-services.json`.

---

## 4. Estructura de Archivos en la App

A partir de ahora, verás cambios en:
*   `src/services/auth.service.ts`: Nuevos métodos `loginWithGoogle` y `loginWithApple`.
*   `src/screens/LoginScreen.tsx`: Lógica para capturar los clics y procesar los tokens.

### ¿Por qué mi servidor necesita el Token?
Nunca confíes solo en "el usuario dijo que es Alex". Tu servidor DEBE verificar el token con Google/Apple directamente para asegurarse de que nadie está suplantando identidades enviando datos falsos al API.

---

## 5. Limitaciones en Desarrollo
*   **iOS Simulator**: El login de Apple funciona, pero el de Google a veces requiere un dispositivo real o una configuración cuidadosa de las URL de retorno.
*   **Android Emulator**: Requiere tener instalados los "Google Play Services".

---

## 📅 Próximos Pasos (Pendiente de Implementar)
Para que los botones de Apple y Google funcionen completamente, quedan pendientes estas tareas:

1.  **Backend (BibliaBackend)**:
    *   Implementar el endpoint `POST /auth/google`. Debe validar el `idToken` usando la librería oficial de Google para Java.
    *   Implementar el endpoint `POST /auth/apple`. Debe validar el `identityToken` (un JWT) con la clave pública de Apple.
    *   Lógica para "mapear" el email recibido de la red social con un usuario en nuestra base de datos.
2.  **Consolas de Desarrollador**:
    *   **Google Cloud Console**: Crear proyecto, configurar pantalla de consentimiento OAuth y generar los IDs de cliente para iOS/Android.
    *   **Apple Developer**: Dar de alta el App ID con el bundle `com.alexmr.biblia` y activar el "Sign in with Apple".

---

*(Guía generada para Biblia Católica App - v1.0)*
