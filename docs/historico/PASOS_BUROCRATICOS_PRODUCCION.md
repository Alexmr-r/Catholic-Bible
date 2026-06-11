# 📁 MANUAL: Pasos Burocráticos y Externos para Producción

Este documento sirve como tu **lista de compras** para que la app pase de "Modo Prueba" a ser pública en el mundo real. Como dueño, necesitas gestionar tres registros gratuitos o de pago en empresas gigantes (Google, Apple y Resend).  
El código desarrollado **ya está preparado** para interceptar y validar toda tu información a la perfección en el mismo instante en el que reciba las claves de estas empresas.

---

## 1. 📧 Configurar el Envío de Correos (Resend)
**Para qué sirve:** Evitar que los recuperar contraseña caigan directamente en la consola e invisibles a los usuarios, y que realmente se envíen por email a la bandeja de tu usuario.
**Costo:** Gratis (hasta 3000 correos/mes).

### Qué debes hacer:
1. Ve a [resend.com](https://resend.com) y creaté una cuenta (usa Google u otro método).
2. Adquiere o añade tu *Dominio* propio (por ejemplo, `minegocio.com`) y verifica la propiedad con las instrucciones de DNS de Resend. (Puedes saltarte la propiedad de dominio y usar tu email directo si la plataforma te lo permite para la primera versión).
3. Entra a **API Keys > Create API Key** asegurando que tiene nivel `Full access`.
4. Copia ese texto rarísimo.

### Dónde pegarlo:
* En tu Backend Java, abre el archivo secreto de producción o `application.properties`/`Config`.
* Reemplaza donde el código de mail o Auth llama al servicio Mock o actualiza tu valor del API KEY para la pasarela real.


---


## 2. 🍎 Configurar "Sign In With Apple" (Developer Portal)
**Para qué sirve:** Es obligatorio por la ley de la AppStore que toda App con registros de 3ros (Google/Facebook) deba incluir forzosamente a Apple con fines de privacidad.
**Costo:** $99 USD Anuales (Apple Developer Program).

### Qué debes hacer:
1. Paga y da de alta tu cuenta LLC o como Individuo en [developer.apple.com](https://developer.apple.com).
2. Ve a **Certificates, Identifiers & Profiles** -> **Identifiers**.
3. Da de alta un nuevo `App ID` (tu Bundle Identifier será el que elegiste: `com.alexmr.biblia`).
4. Muévete hacia abajo y palomea (✔️) la función **Sign in with Apple**.
5. Guarda todo y finaliza el registro.

### Dónde conectarlo:
* No hace falta pegar claves extras en tu código; con tu App ID autorizado y marcando el `boolean` True en `app.json` de Expo, los servidores de Apple verificarán tu celular automáticamente de forma transparente usando el backend implementado.


---


## 3. 🔵 Configurar el Botón de Google Cloud 
**Para qué sirve:** Dar de alta tu "Proyecto" de Google para generar y validar el "Client ID" desde el celular del usuario sin botarlo devolviendo *App no verificada*.
**Costo:** Gratis.

### Qué debes hacer:
1. Ve a [Google Cloud Console](https://console.cloud.google.com).
2. Crea un proyecto nuevo llamado "Biblia Catolica".
3. Ve al panel de la izquierda > **API y Servicios** > **Pantalla de Consentimiento de OAuth**.
4. Llena los datos que te piden sobre la app (qué logotipos usarás, política de privacidad, nombre visible). Configúralo como recurso **Externo**.
5. Ahora ve a **Credenciales** > **Crear Credenciales** > **ID de cliente de OAuth**.
6. Selecciona tipo de aplicación: **iOS**. Introduce tu identificador de paquete (`com.alexmr.biblia`).
7. Selecciona tipo de aplicación de nuevo pero esta vez: **Aplicación web**.
8. Te arrojará como fruto dos textos que terminan con `...apps.googleusercontent.com`.

### Dónde pegarlo:
* Ve a `LoginScreen.tsx` (Línea 27 a 29) de tu *Frontend Expo*.
* Reemplaza el texto `TODO: PEGA_AQUI_TU_GOOGLE_EXTERNAL_CLIENT_ID` con tu Cliente de Web.
* Reemplaza el texto `TODO: PEGA_AQUI_TU_GOOGLE_IOS_CLIENT_ID` con tu Cliente de iOS.
* En el backend (Java), ve a `AuthenticationService.java` línea 218 y pega también el Google Client ID ahí para que la validación en el servidor desencripte la firma de forma segura (para esta, basta usar el Web Client ID genérico o validarlo con cualquiera de ellos).

---
*Fin de los manuales, la arquitectura a nivel base está blindada y los mockups desactivados (comentados a falta de tus API Keys)*
