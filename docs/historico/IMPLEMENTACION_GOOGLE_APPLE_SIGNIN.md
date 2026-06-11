# 🚀 Implementación Final: OAuth Google y Apple 

Este documento certifica que la aplicación **CatholicVerse** ha activado oficialmente los Inicios de Sesión productivos a través de proveedores terceros (Google y Apple), deshabilitando los simulacros temporales de desarrollo.

---

## 🔵 Google Sign-In: Verificado y Activo
Se han generado y vinculado a nuestro código las claves reales, asociadas de manera segura a nuestro identificador principal `com.catholicverse.app`. 

### Pasos seguidos en Google Cloud Console para generar las Claves:
Para llegar a tener estas claves y dejarlas conectadas, la cuenta de empresa administradora de `getcatholicverse.com` tuvo que dar los siguientes pasos en la consola:

1.  **Crear el Proyecto OAuth:** Se accedió a [Google Cloud Console](https://console.cloud.google.com/) y se creó un proyecto nuevo llamado "CatholicVerse", seleccionando el recurso superior organizativo de la empresa.
2.  **Pantalla de Consentimiento:** En "API y Servicios > Pantalla de consentimiento de OAuth", se definió como aplicación **Externa** para admitir usuarios globales.
    *   Nombre de la aplicación: `CatholicVerse`
    *   Correo de soporte y contacto: `support@getcatholicverse.com`
    *   Dominios y Web autorizados: `getcatholicverse.com`
3.  **Generación Cliente iOS (App Store):**
    *   Ir a "Credenciales > Crear Credenciales > ID de cliente de OAuth".
    *   Tipo: **iOS**.
    *   Nombre: `CatholicVerse iOS`.
    *   ID del Paquete (Bundle ID): `com.catholicverse.app`.
    *   Resultado: Se generó la clave `7090...bjbf` y se inyectó en el código fuente de Expo React Native.
4.  **Generación Cliente Web / Android:**
    *   Credenciales > ID de cliente de OAuth.
    *   Tipo: **Aplicación Web** (Vital para que el protocolo OIDC de Expo funcione correctamente cruzado con Android).
    *   Nombre: `CatholicVerse Web`.
    *   Resultado: Se generó la clave `7090...qq53` y se inyectó tanto en el código fuente frontend como en el Backend Java (`AuthenticationService`).

### Claves inyectadas en Producción:
*   **Web / Android Client ($EXPO):** `709014169638-qdhs9p1smr7nbgk0kmb2ca4hhts6qq53.apps.googleusercontent.com`
*   **iOS Client:** `709014169638-vndu7immjcujct3bied58opabjn5bjbf.apps.googleusercontent.com`

**¿Qué hace nuestro código ahora?**
1. `LoginScreen.tsx` intercepta el click de "Continue with Google".
2. Automáticamente usa el `iosClientId` si el usuario está en un iPhone, y usa el `webClientId` de fondo si está en Android para abrir la pasarela.
3. El ID (Token JWT) generado por el móvil es enviado al servidor Java en `/api/v1/auth/google`.
4. `AuthenticationService.java` recibe el token y se contacta directamente bajo el capó con una validación criptográfica (`GoogleIdTokenVerifier`) obligando a autenticar el token usando nuestro código central de Google Web, rechazando a cualquier atacante si las firmas no coinciden.
5. Extrae tu nombre y tu email de confianza, creando tu cuenta en CatholicVerse al instante ¡o logueándote si ya existes!

<br>

---

## 🍎 Apple Sign-In: Verificado y Activo
Apple tiene el funcionamiento más seguro pero más estricto del mercado. No requirió de "Claves públicas de texto" para el frontend ya que se apalanca en el certificado nativo de desarrollador pagado.

**¿Qué hace nuestro código ahora?**
1. La configuración `app.json` ya tiene la directiva `"usesAppleSignIn": true` requerida por Apple.
2. Expo usa el sistema de huella y cara (FaceID/TouchID) nativo del teléfono para otorgarte acceso y darte un token de la plataforma Apple.
3. El JWT cifrado se envía a `/api/v1/auth/apple`.
4. El servidor destapa la encriptación asimétrica del payload y obtiene directamente de los metadatos de Apple verificados el correo primario del usuario de iOS.
5. Inicia el mismo flujo, pero **sin contraseñas requeridas**.

---
*Ambos sistemas son capaces de regenerar claves de sesión dinámicas, blindando la arquitectura y abriendo el registro a clientes globales con 1 toque.*

