# 🔐 Guía Definitiva: Inicios de Sesión con Apple y Google

Para que los botones de "Continuar con Google" y "Continuar con Apple" funcionen en dispositivos reales, los servidores de estas empresas necesitan saber exactamente quién está pidiendo permiso. 

Aquí te explico exactamente qué es el identificador de tu app y cómo sacar las claves.

---

## 1. 🏷️ ¿Qué es eso de `com.catholicverse.app`?

En el mundo del desarrollo móvil, todas las aplicaciones del mundo deben tener un **Identificador Único Global** (conocido como *Bundle Identifier* en iOS y *Package Name* en Android). 

La convención estándar es usar un dominio web al revés más el nombre de la app. En nuestro caso, hemos definido en tu proyecto que la identidad oficial de la app es:
👉 `com.catholicverse.app`

**¿Para qué sirve?**
Cuando subamos la app a la App Store y a la Google Play Store, las tiendas usarán este código para saber que esta app es tuya y no la pueden suplantar. Apple y Google usan este mismo código para garantizar que nadie más use de manera fraudulenta tu inicio de sesión.

---

## 2. 🔵 Pasos para Google Sign-In (Gratis - 5 minutos)

Necesitamos generar **dos códigos** en Google. Uno para cuando abran la app desde un Android, y otro para cuando la abran desde un iPhone.

1. Ve a [Google Cloud Console](https://console.cloud.google.com/) y entra con tu cuenta habitual.
2. Arriba a la izquierda, dale a crear un **Nuevo Proyecto** y ponle de nombre `CatholicVerse`.
3. En el menú de la izquierda, ve a **API y Servicios** > **Pantalla de Consentimiento de OAuth**.
   - Selecciona **Externo** y dale a Crear.
   - Rellena lo básico que te pida: Nombre de la app (`CatholicVerse`), y el correo de soporte al usuario (`support@getcatholicverse.com`).
   - Sáltate lo de los "Scopes/Permisos" avanzados, no los necesitamos.
4. Ahora, en el menú izquierdo, ve a **Credenciales**.
5. Dale arriba a **+ CREAR CREDENCIALES** > **ID de cliente de OAuth**.
   
   👉 **Primer código (El de iOS):**
   - Tipo de aplicación: **iOS**
   - Nombre: `CatholicVerse iOS`
   - Identificador de paquete (Bundle ID): `com.catholicverse.app`
   - *Haz clic en crear. Nos dará un código largo que termina en `.apps.googleusercontent.com`.*

6. Dale de nuevo a **+ CREAR CREDENCIALES** > **ID de cliente de OAuth**.

   👉 **Segundo código (El de Web / Android):**
   - Tipo de aplicación: **Aplicación Web**
   - Nombre: `CatholicVerse Web`
   - (No hace falta poner URLs por ahora)
   - *Haz clic en crear. Nos dará otro código que también termina en `.apps.googleusercontent.com`.*

**✅ Meta alcanzada:** Pásame por aquí esos dos códigos y yo modificaré tus archivos para que la aplicación deje de simular respuestas y se conecte a Google de verdad.

---

## 3. 🍎 Pasos para Apple Sign-In (Requiere cuenta Dev)

Para Apple el proceso es diferente. No nos van a dar unas claves que tengamos que pegar en el código de tu aplicación frontal. Nos vale únicamente con registrar el nombre `com.catholicverse.app` en sus sistemas.

1. Tienes que pagar la cuenta de desarrollador en [Apple Developer](https://developer.apple.com/) ($99 USD al año).
2. Una vez tengas la cuenta activa, entra al portal y ve a la sección **Certificates, Identifiers & Profiles**.
3. En el menú izquierdo selecciona **Identifiers** y dale al botón de **+** azul.
4. Selecciona **App IDs** > **App**.
5. En Descripción pon `CatholicVerse` y en **Bundle ID** pon exactamente: `com.catholicverse.app`.
6. En la lista de capacidades (Capabilities) que aparece debajo, haz scroll hasta encontrar **Sign In with Apple**. 
7. Márcalo con el *tick* (✔️).
8. Dale a continuar y **Registrar**.

**✅ Meta alcanzada:** Al hacer esto, el código que ya he programado en tu aplicación se comunicará directamente con los servidores de Apple, ellos comprobarán internamente que `com.catholicverse.app` está registrado a tu nombre, y la pantalla de FaceID/TouchID aparecerá mágicamente.








