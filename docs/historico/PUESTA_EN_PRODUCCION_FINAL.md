# 🚀 GUÍA FINAL: Lanzamiento a Producción Profesional

Este documento resume los pasos necesarios para llevar **CatholicVerse** de tu ordenador a las tiendas (App Store y Google Play) y a Internet.

---

## 1. 🍎 Cuentas de Desarrollador (Las Licencias)

Para poder publicar en las tiendas oficiales y usar compras in-app, Apple y Google exigen que te registres como desarrollador:

*   **Apple Developer Program:**
    *   **Registro:** [developer.apple.com](https://developer.apple.com)
    *   **Coste:** **$99 USD al año**.
    *   **Tiempo:** Apple puede tardar de 24h a 72h en verificar tu identidad/empresa.
    *   **Nota:** Es obligatorio si quieres que los usuarios de iPhone puedan descargar la app.

*   **Google Play Console:**
    *   **Registro:** [play.google.com/apps/publish](https://play.google.com/apps/publish)
    *   **Coste:** **$25 USD (pago único de por vida)**.
    *   **Tiempo:** Google suele ser más rápido en la verificación inicial.

---

## 2. 💰 Monetización y Compras (RevenueCat)

La app usa **RevenueCat** para gestionar las suscripciones de forma centralizada sin que tengas que programar la lógica compleja de validación de tickets de Apple/Google.

1.  **Crear cuenta:** Ve a [RevenueCat.com](https://www.revenuecat.com) (usa el plan gratuito).
2.  **Configurar Tiendas:**
    *   Una vez pagadas las licencias del punto 1, entrarás en **App Store Connect** y **Google Play Console** para crear tus productos:
        *   `catholicverse_premium_monthly` ($4.99/mes)
        *   `catholicverse_premium_yearly` ($39.99/año)
3.  **El Puente:** En RevenueCat, añadirás tus apps de Apple y Google y pegarás los secretos que te den las tiendas.
4.  **API Keys:** RevenueCat te dará dos "API Keys". Para que la app empiece a cobrar, solo tienes que pegarlas en el código:
    *   **Archivo:** `BibliaAppExpo/src/contexts/SubscriptionContext.tsx`
    *   **Líneas:**
      ```typescript
      const API_KEYS = {
        apple: 'appl_TU_CLAVE_DE_REVENUECAT',
        google: 'goog_TU_CLAVE_DE_REVENUECAT', 
      };
      ```

---

## 3. 🌐 Web, Base de Datos y API (Internet)

La infraestructura se divide en dos: la web estática (gratis) y el servidor con la base de datos (pago mensual bajo).

### A. La Web (`getcatholicverse.com`)
*   **Servicio:** **Cloudflare Pages** (Gratis).
*   **Proceso:** Conectas tu cuenta de GitHub a Cloudflare, seleccionas la carpeta `CatholicVerseWeb` y listo. Se escala solo y es extremadamente rápido.
*   **Guía detallada:** Mira el archivo `CLOUDFLARE_DEPLOY.md`.

### B. El Servidor (Backend + Base de Datos)
*   **Servicio:** **VPS** (Servidor Virtual Privado) en **DigitalOcean** o **Hetzner**.
*   **Coste:** Aproximadamente **$6 - $12 USD al mes**.
*   **Por qué:** Necesitamos un lugar donde la base de datos PostgreSQL viva 24/7 y donde la API de Java pueda recibir las peticiones de los móviles.
*   **Instalación:** Usaremos **Docker** en el servidor para que la configuración sea idéntica a la que tenemos en local, garantizando que todo funcione a la primera.

---

## 4. 📦 Cómo Subir la App (El Proceso Técnico)

Una vez Apple te valide (en el punto 1), usaremos una herramienta llamada **EAS (Expo Application Services)** para compilar y enviar la app:

1.  **Instalar EAS:** Ejecutas `npm install -g eas-cli`.
2.  **Login:** `eas login` con tu cuenta de Expo.
3.  **Configurar:** `eas build:configure`.
4.  **Compilar y Subir (Producción):**
    *   **iOS:** `eas build --platform ios`
    *   **Android:** `eas build --platform android`
5.  **Envío a las Tiendas:** Una vez terminado el build, usas `eas submit` para que el archivo aparezca mágicamente en App Store Connect y Google Play Console para revisión.

---

## 🚀 5. Preparación para Tráfico Masivo (Escalabilidad)

Para que la app sea profesional y cumpla con las políticas de **USA y Canadá** cuando entre mucha gente:

1.  **Seguridad (SSL/HTTPS):** Obligatorio. Configuraremos un certificado **Let's Encrypt** en el servidor para que toda la comunicación esté encriptada (el candado verde).
2.  **Monitoreo de Errores (Sentry):** Te recomiendo instalar **Sentry**. Si la app le falla a un usuario en Canadá, te llegará un aviso al móvil con el error exacto para que puedas arreglarlo antes de que te pongan una mala reseña.
3.  **Base de Datos en Producción:** Quitaremos el modo "validate" de Hibernate para evitar que la base de datos se altere sola, y haremos backups diarios automáticos (por si acaso).
4.  **Hardware del Servidor:** Para empezar con "mucha gente", un servidor con **2 vCPUs y 4GB de RAM** es el punto dulce para aguantar miles de usuarios concurrentes con Java Spring Boot.

---

## 🏁 6. El Último Empujón: La Revisión de las Stores

Al publicar por primera vez:
*   **Screenshots:** Necesitarás 3-5 fotos de la app funcionando. Puedes usar el simulador y ponerles marcos bonitos.
*   **Descripción:** Un texto que enamore al usuario (podemos pedirle a la IA que nos haga un borrador profesional).
*   **Revisión:** Apple y Google tardan de **2 a 5 días** en mirar tu app. Si te la rechazan por algo (muy normal la primera vez), no te asustes: nos dirán exactamente qué cambiar, lo arreglamos y volvemos a subir.

---

## ⚖️ 7. Cumplimiento de Políticas (EULA y Privacidad)

Para cumplir con las leyes de **EE.UU. y Canadá**:

1.  **Privacy Policy:** Debe estar visible en la web. La tienes en `CatholicVerseWeb/privacy.html`.
2.  **Terms of Service (EULA):** Obligatorio para Apple. Está en `CatholicVerseWeb/terms.html`.
3.  **Botón de Registro:** He configurado el botón de registro de la app para que obligue al usuario a aceptar estos términos antes de crear la cuenta, y los enlaces abren tu web oficial automáticamente.

---

## 🛠️ 8. Cómo ver la Web en Local (Antes de subirla)

Si quieres ver cómo ha quedado la web y probar los enlaces de términos y privacidad antes de publicar:

1.  **Desde la terminal**, asegúrate de estar en la raíz de la web:
    ```bash
    cd CatholicVerseWeb
    ```
2.  **Abrir el archivo directamente:** Puedes hacer doble clic en `index.html` en el Finder, o ejecutar:
    ```bash
    open index.html
    ```
3.  **Simular servidor real (Recomendado):** Para que los enlaces funcionen exactamente como en internet, usa este comando:
    ```bash
    npx serve .
    ```
    *(Esto te dará una dirección como `http://localhost:3000` para navegar por la web).*
