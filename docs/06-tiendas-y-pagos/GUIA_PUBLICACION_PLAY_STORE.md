# 🤖 Guía de Publicación en Google Play & RevenueCat

## 1. Configuración de la App en Google Play Console
- **Package Name:** `com.catholicverse.app`
- **Versiones:** Cada vez que subas un archivo nuevo, el `versionCode` en `app.json` debe ser superior al anterior (EAS lo suele subir solo).
- **Política de Privacidad:** Obligatorio poner el link en *Contenido de la aplicación* -> `https://catholic-verse-web.pages.dev/privacy.html`.

## 2. Conexión con RevenueCat (El "Puente")
Para que RevenueCat pueda validar las compras, necesita una Cuenta de Servicio.

### Pasos realizados:
1. **Google Cloud:** Se creó una cuenta de servicio llamada `revenuecat-service`.
2. **Llave JSON:** Se descargó el archivo `catholicverse-6d0a6b240edb.json`. **¡ESTE ARCHIVO ES SECRETO Y VITAL!**
3. **Permisos en Play Store (CRUCIAL):** 
   - Se invitó al email de la cuenta de servicio (`revenuecat-service@...`) en la sección **Usuarios y permisos**.
   - **IMPORTANTE:** Los permisos deben estar activados en la pestaña de **"Permisos de la cuenta"** (no solo en la de la aplicación).
   - Marcar las casillas: **Ver datos financieros** y **Gestionar suscripciones**.
   - **OJO:** Si ves un botón azul arriba que dice "Finalizar actualización", dale para que los cambios de permisos se publiquen.

## 3. Configuración en el panel de RevenueCat
1. Entrar en **Project Settings** -> **Apps**.
2. Hacer clic en **"+ New App"** y seleccionar **"Google Play"**.
3. Rellenar el **App Name**, **Package Name** (`com.catholicverse.app`) y subir el archivo JSON de la cuenta de servicio.
4. Una vez guardado, ir a **Project Settings** -> **API Keys**.
5. Copiar la **"Public API Key"** generada para Android.
6. Configurar los **Entitlements** (`premium`) y **Offerings** vinculando los IDs de los productos de Google Play.

## 4. Pruebas de compra (Sandbox)
Para probar sin pagar dinero real:
1. En Google Play Console, ve a **Licencia para testing**.
2. Añade tu email de Google.
3. En la App, cuando intentes comprar, te saldrá un mensaje de "Google Play (Pruebas)".
