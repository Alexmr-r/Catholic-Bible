# 🏦 Pasos Previos a RevenueCat (Apple & Google)

Para poder cobrar a los usuarios (y para siquiera poder programar o probar suscripciones en modo de prueba), **Apple y Google tienen que darte permiso explícito para vender**. RevenueCat no funciona hasta que estas dos plataformas te habiliten comercialmente.

Estos son los pasos administrativos y burocráticos que debes hacer tú mismo en tu navegador, ya que involucran tus documentos legales, cuenta bancaria e impuestos.

---

## 🍎 FASE 1: Apple (App Store Connect)

**Requisito previo:** Debes haber pagado los 99$/año del Apple Developer Program.

1. **Crear la ficha de la app:**
   * Entra a [App Store Connect](https://appstoreconnect.apple.com/).
   * Ve a **Mis apps** > "+" > **Nueva app**.
   * Llena los datos básicos. En **Bundle ID** tienes que elegir exactamente el de tu app: `com.catholicverse.app`. (Si no sale, tienes que crearlo primero en el portal de developer.apple.com).

2. **Rellenar los Acuerdos Fiscales y Bancarios (CRÍTICO):**
   * En la página principal de App Store Connect, ve al módulo **Acuerdos, impuestos y operaciones bancarias** (Agreements, Tax, and Banking).
   * Acepta el contrato de **Paid Apps** (Aplicaciones de pago).
   * Rellena el formulario de impuestos y añade el IBAN / Número de cuenta donde quieres que Apple te ingrese el dinero que ganes.
   * *⚠️ Nota: Hasta que Apple no apruebe esta información bancaria (suele tardar de unas horas a 1-2 días), el siguiente paso estará bloqueado.*

3. **Crear los Productos de Suscripción:**
   * Vuelve a tu app en **Mis apps**.
   * En el menú izquierdo, baja hasta la sección **Monetización** > **Suscripciones**.
   * Crea un **Grupo de Suscripción** (ej. "CatholicVerse Premium").
   * Añade las dos suscripciones con estos identificadores exactos para que el código las reconozca:
     * ID del Producto 1: `catholicverse_premium_monthly` (Añade el precio mensual).
     * ID del Producto 2: `catholicverse_premium_yearly` (Añade el precio anual).

---

## 🍏 FASE 1.5: Configurar Inicio de Sesión con Apple (Apple Developer Portal)

Ya que estás haciendo los trámites de Apple y tienes la cuenta de 99$ activa, hay que hacer un par de clics para configurar el permiso del botón "Continuar con Apple" (Apple lo exige si usas Google Sign-In). 

1. **Activar el Capability en tu App ID:**
   * Ve a [Certificates, Identifiers & Profiles](https://developer.apple.com/account/resources/identifiers/list) en el portal de Apple Developer.
   * Selecciona **Identifiers** y busca tu App ID (`com.catholicverse.app`).
   * En la lista de *Capabilities*, marca la casilla **Sign In with Apple**. 
   * Dale a **Edit**, selecciona **Enable as a primary App ID** y guarda los cambios.

2. **Generar la Clave Privada (.p8) para tu Backend:**
   * En el menú izquierdo ve a **Keys** y pulsa **(+)**.
   * Ponle de nombre algo como `Apple Sign In API Key`.
   * Marca la casilla **Sign In with Apple**, haz clic en **Configure** y asócialo a tu Primary App ID (`com.catholicverse.app`).
   * Presiona **Register** y luego **Download**. 
   * **⚠️ MUY IMPORTANTE:** Se descargará un archivo `.p8`. Guárdalo en un lugar seguro porque Apple solo te deja descargarlo **una vez**.
   * Anota tu **Key ID** (está en esa misma pantalla) y tu **Team ID** (aparece arriba a la derecha en tu cuenta). 
   * *Cuando tengas este archivo .p8 y los IDs, me los pasas y yo programo la validación en tu backend Spring Boot.*

---

## 🤖 FASE 2: Google (Google Play Console)

**Requisito previo:** Debes haber pagado los 25$ (un solo pago) de Google Play Developer.

1. **Crear la ficha de la app:**
   * Entra a [Google Play Console](https://play.google.com/console).
   * Pulsa en **Crear aplicación**. Ponle "CatholicVerse".
   * El `package name` que generará o que le vincules al subir el primer archivo de configuración debe ser `com.catholicverse.app`.

2. **Rellenar el Perfil de Pagos (CRÍTICO):**
   * En el menú lateral de la consola, baja hasta **Configurar** > **Perfil de pagos** (o "Merchant account" / Cuenta de comerciante).
   * Configura tus datos fiscales y añade la cuenta bancaria para que Google te pague a fin de mes.

3. **Crear los Productos de Suscripción:**
   * En el menú lateral, ve a **Monetizar** > **Productos** > **Suscripciones**.
   * Crea los mismos dos productos que en Apple:
     * ID del Producto 1: `catholicverse_premium_monthly` (Añade el precio base).
     * ID del Producto 2: `catholicverse_premium_yearly` (Añade el precio base).

---

### ✅ ¿Qué pasa cuando terminas todo esto?
¡Que ya tienes luz verde! Una vez que las suscripciones están creadas en Apple y Google, ya podemos:

1. Abrir la cuenta en **RevenueCat**.
2. Poner los identificadores.
3. Meter las claves API `appl_...` y `goog_...` en nuestro código.
4. **Probar pagos gratis (Sandbox)** desde tu móvil real para verificar que nuestro "Muro de pago" y el servidor cobran bien.

**➡️ Guárdate este documento. Cuando decidas ponerte con ello, ve tachando los pasos de uno en uno.**
