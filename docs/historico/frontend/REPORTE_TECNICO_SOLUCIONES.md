# Reporte de Soluciones Técnicas 🛠️

Este documento resume las soluciones aplicadas recientemente para corregir los fallos de descarga y los errores de configuración en la aplicación.

---

## 1. Solución al Error 403 (Descarga Fallida) 📥

### El Problema:
Al intentar descargar la Biblia en inglés, el servidor devolvía un `Error: Status 403 (Forbidden)`. Esto ocurría porque el servidor tiene reglas de seguridad que requieren que el usuario esté identificado para acceder a ciertos recursos.

### La Solución:
Hemos modificado el servicio de descarga (`english-bible-download.service.ts`) para incluir el **Token de Usuario** (nuestra "llave maestra") en la petición de descarga.

**Cambios realizados:**
1.  **Recuperación del Token**: Ahora la app busca el `accessToken` guardado en el dispositivo antes de iniciar la descarga.
2.  **Cabecera de Autorización**: Se añade el campo `Authorization: Bearer [TOKEN]` en la configuración de `FileSystem.createDownloadResumable`.
3.  **Resultado**: El servidor reconoce quién eres, valida que tienes permiso y te deja descargar el archivo de la Biblia sin errores.

---

## 2. Solución al Error 'RNGoogleSignin' could not be found 🔑

### El Problema:
Aparece el error: `[Invariant Violation: 'RNGoogleSignin' could not be found]`.

### ¿Qué significa este error?
Este es un error clásico de React Native/Expo. Significa que **has añadido una librería nueva que tiene código nativo (Java/Kotlin o Swift/Objective-C), pero tu aplicación "nativa" no ha sido recompilada.**

*   El código JavaScript está intentando llamar a una función llamada `RNGoogleSignin`.
*   Sin embargo, el archivo `.app` (el binario) que está corriendo en tu simulador actualmente no tiene ese código dentro porque fue compilado **antes** de que instaláramos la librería de Google.

### Cómo solucionarlo definitivamente:
Dado que estás usando Expo Dev Client (con `npx expo run:ios`), debes forzar al Mac a que vuelva a construir la aplicación desde cero para que incluya la librería de Google.

**Pasos a seguir:**
1.  **Cierra el Simulador** de iPhone que tienes abierto.
2.  **Detén el comando** que tienes corriendo en la terminal (pulsa `Ctrl + C` en la terminal donde veas el log).
3.  **Limpia y Recompila**: Ejecuta este comando en la carpeta `BibliaAppExpo`:
    ```bash
    npx expo run:ios
    ```
    *Esto tardará unos minutos la primera vez porque tiene que "enlazar" el código de Google dentro de la app.*

---

## 3. Notas sobre Configuración de Red 🌐

Hemos detectado que tu IP local ha cambiado de `192.168.1.42` a `192.168.1.40`. He actualizado el archivo `src/services/config.ts` para reflejar este cambio. 

**Importante**: Si vuelves a tener errores de "Connection Refused" o "Timeout", verifica siempre que la IP en `config.ts` coincida con la que te da tu Mac en la red Wi-Fi actual.

---
*(Documento actualizado el 10 de Marzo de 2026)*
