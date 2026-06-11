# 📋 Guía Rápida: Solución de Errores de Pago en Android e iOS (RevenueCat)

Esta guía contiene los pasos detallados para resolver los problemas de pasarela de pago en ambos sistemas operativos:
* **Android:** Resolver el error `ITEM_UNAVAILABLE` (Google Play Billing).
* **iOS:** Resolver el error `Could not check` y ofertas vacías (App Store Connect / StoreKit).

---

## 🤖 PARTE 1: ANDROID (Error: `ITEM_UNAVAILABLE`)

Si los productos se muestran en el Paywall pero al pulsar "Comprar" se cierra con el error `ITEM_UNAVAILABLE`, la pasarela de pagos de Google Play te está bloqueando. Debes completar estas tres configuraciones en tu consola de Google Play:

### 1. Registrar tu cuenta de Gmail como "Probador de Licencias" (Obligatorio)
Google Play exige que la cuenta de Gmail del dispositivo de pruebas esté explítimamente autorizada para simular compras.
1. Abre la app de **Google Play Store** dentro de tu emulador o móvil físico y mira exactamente con qué cuenta de Gmail tienes iniciada la sesión.
2. Ve a [Google Play Console](https://play.google.com/console).
3. En el menú lateral izquierdo, baja hasta la sección **Configuración** -> **Pruebas de licencia** (License Testing).
4. Introduce el correo de Gmail del dispositivo en la lista de probadores y guarda los cambios.
5. En el campo **Respuesta de licencia** (License response), asegúrate de que está seleccionado **`RESPOND_NORMALLY`** (o `LICENSED` para pruebas de cobro exitosas gratuitas).

### 2. Subir un build `.aab` inicial a Google Play Console
La API de Google Play Billing no activa la facturación interna para un identificador de paquete (`com.catholicverse.app`) hasta que la consola de Google Play tiene constancia física de la existencia de la app.
1. Genera un archivo bundle (`.aab`) firmado de la aplicación.
2. En Google Play Console, ve a la sección **Pruebas de licencia / Pruebas internas** (Internal Testing).
3. Sube el archivo `.aab` a esa pista de pruebas. 
4. *Nota:* No hace falta que Google apruebe la app. Simplemente con que el build esté en estado "Subido" (Draft o Publicado en pista interna), la facturación se activará para todos los dispositivos que usen ese mismo package name.

### 3. Limpiar la caché de Google Play Store en el dispositivo de pruebas
A veces Google Play mantiene en caché los estados de licencia anteriores. Si tras hacer los pasos anteriores sigue fallando:
1. En tu emulador, ve a **Ajustes** -> **Aplicaciones** -> **Google Play Store**.
2. Pulsa en **Forzar detención**.
3. Ve a **Almacenamiento** y selecciona **Borrar caché** y **Borrar datos**.
4. Vuelve a abrir Google Play Store y, a continuación, inicia tu app para probar de nuevo.

### 4. Sincronización de Identificadores de Producto (IDs)
Es fundamental que los Product IDs en Google Play Console coincidan letra por letra con los configurados en el panel de RevenueCat:
* **Google Play Console:** `premium_monthly` y `premium_yearly` (usan guion bajo `_`).
* **RevenueCat:** Asegúrate de que los productos vinculados usan estos mismos IDs (y no `basic-monthly` o nombres antiguos del pasado).

---

## 🍎 PARTE 2: IOS (Error: `Could not check` / Ofertas Vacías)

En tu panel de RevenueCat, los productos de Apple muestran un estado de advertencia naranja **`Could not check`**. Esto significa que Apple está rechazando las consultas del SDK de RevenueCat. Sigue estos pasos para solucionarlo:

### 1. Firmar el Acuerdo de Aplicaciones de Pago (Fallo 90% de las veces)
Apple requiere que todos los contratos financieros estén al día para permitir transacciones de prueba (Sandbox).
1. Inicia sesión en [App Store Connect](https://appstoreconnect.apple.com).
2. Ve a la sección **Negocio** (en la pestaña superior, entre *Informes* y *Usuarios y acceso*).
3. En la pestaña **Acuerdos**, comprueba el estado de **Acuerdo para apps de pago** (Paid Applications). Debe quedar en estado **Activo**.
4. Si te salta el aviso del DSA (Digital Services Act) para la UE y de momento no vas a distribuir en Europa:
   - Haz clic en completar requisitos.
   - Elige **"No soy un comerciante sujeto al DSA o no tengo intención de distribuir en la UE"**.
   - Haz clic en **Siguiente** y guarda para desbloquear la cuenta.

### 2. Configurar la clave de autenticación en RevenueCat (StoreKit 2 o Shared Secret)
Para que RevenueCat pueda comunicarse con Apple, necesitas configurar al menos uno de estos dos métodos:

*   **Opción A: Clave de compras dentro de la app (.p8) para StoreKit 2 (Recomendado y más moderno):**
    1. En App Store Connect, ve a **Usuarios y acceso** -> pestaña **Integraciones** -> **In-App Purchase** (Compras dentro de la app).
    2. Genera una clave, descárgate el archivo `.p8` y copia el *Issuer ID*.
    3. En RevenueCat, ve a **Apps** -> **CatholicVerse (App Store)**.
    4. En la sección **In-app purchase key configuration**, sube el archivo `.p8` y guarda. (Si ya muestra **`Valid credentials`**, este paso está listo).
    
*   **Opción B: Clave compartida (Shared Secret) para StoreKit 1 (Legacy / Soporte a versiones antiguas):**
    1. En App Store Connect, ve a **Usuarios y acceso** -> pestaña **Integraciones** -> **Clave compartida de la app**.
    2. Copia la clave de 32 caracteres.
    3. En la misma pantalla de configuración de tu app en RevenueCat, haz scroll hacia abajo hasta encontrar el campo **App Store Shared Secret**, pégala y guarda.

### 3. Verificar el Estado de las Suscripciones en App Store Connect
Si un producto de suscripción no tiene metadatos completos, StoreKit lo ignorará en el simulador.
1. En App Store Connect, ve a tu App -> **Suscripciones**.
2. Comprueba tus dos productos: `catholicverse_premium_monthly` y `catholicverse_premium_yearly`.
3. Asegúrate de que no tengan la etiqueta amarilla **Missing Metadata** (Falta información). Si la tienen:
   - Añade una localización (nombre y descripción en español e inglés).
   - Asegúrate de haberle configurado un precio base.
   - Debe pasar a estado **Ready to Submit** (Listo para enviar) o **Approved** (Aprobado).

### 4. Limitaciones del Simulador de iOS (Spinner de Carga Infinito)
En los simuladores de iOS, al pulsar "Comprar", la app suele quedarse cargando (con un spinner infinito) debido a que el simulador no puede renderizar la pantalla oficial de compra y confirmación de Apple.
Para realizar una compra de pruebas real y verificar que todo funciona:
1. **Crear un Probador de Sandbox:**
   - Ve a **App Store Connect** -> **Usuarios y acceso**.
   - En el menú lateral izquierdo, haz clic en **Probadores de Sandbox** (Sandbox Testers).
   - Crea un usuario de pruebas con un correo electrónico cualquiera (inventado).
2. **Configurar el iPhone físico:**
   - Conecta tu iPhone de pruebas físico.
   - Ve a **Ajustes** -> **App Store**.
   - Haz scroll hasta el final y, en la sección **Cuenta de Sandbox**, inicia sesión con el probador recién creado.
3. **Probar la compra:**
   - Abre la aplicación en tu iPhone físico (vía Expo Go o build de desarrollo).
   - Pulsa en comprar. Se abrirá la pasarela de Apple en modo desarrollo (gratuita) y se completará el flujo.

---

## 📋 Lista de Comprobación Final

- [ ] Gmail del móvil de pruebas registrado en "Pruebas de licencia" de Google Console.
- [ ] Build inicial `.aab` subido a la pista de pruebas internas de Google.
- [ ] IDs de producto en Android configurados exactamente como `premium_monthly` y `premium_yearly`.
- [ ] Contrato de "Paid Applications" firmado y activo en App Store Connect.
- [ ] Clave de compras (.p8) para StoreKit 2 o "Shared Secret" configurada y validada en RevenueCat.
- [ ] Estado de productos en App Store Connect en "Ready to Submit" (sin Missing Metadata).
- [ ] Probador Sandbox de iOS creado y configurado en el dispositivo físico de pruebas.
