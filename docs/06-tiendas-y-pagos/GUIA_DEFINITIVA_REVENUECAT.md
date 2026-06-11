# 💰 Guía Maestra de RevenueCat: Android e iOS

Esta guía contiene los pasos exactos para sincronizar las tiendas y solucionar errores de "Producto no disponible".

---

## 🏗️ Conceptos Clave
| Concepto | Qué es | Valor en nuestro proyecto |
|----------|--------|---------------------------|
| **Entitlement** | La "llave" que da acceso premium. | `CatholicVerse Premium` |
| **Offering** | El catálogo que se muestra al usuario. | `default` |
| **Package** | El identificador genérico del plan. | `$rc_monthly` y `$rc_annual` |
| **Product** | El ID real en Google Play o App Store. | *Ej: catholicverse_premium_monthly* |

> [!IMPORTANT]
> **REGLA DE ORO:** El **Store Product ID** en RevenueCat tiene que ser IDÉNTICO al **ID de producto** en Google Play/App Store. Una diferencia entre un guion medio `-` y un guion bajo `_` hará que la compra falle con `ITEM_UNAVAILABLE`.

---

## 🤖 SOLUCIÓN ANDROID (Error: `ITEM_UNAVAILABLE`)

Si ves los precios pero no puedes comprar, Google te está bloqueando. Sigue estos pasos:

### 1. Configurar Cuenta de Tester (Obligatorio)
1. Ve a [Google Play Console](https://play.google.com/console).
2. En el menú lateral busca: **Configuración → Pruebas de licencia**.
3. Añade el correo de Gmail que usas en tu móvil/emulador Android.
4. En **Respuesta de licencia**, elige `RESPOND_NORMALLY`.

### 2. Subir la App a una Pista de Pruebas
Google no activa los pagos hasta que no hay un archivo `.aab` subido.
1. Genera el build: `npx expo export:embed` (o usa EAS Build).
2. Sube el archivo a **Pruebas internas** (Internal Testing) en la consola de Google.
3. No hace falta que esté aprobada por Google, con que esté "Subida" es suficiente.

### 3. El ID del producto no coincide exactamente (CASO REAL DETECTADO)
Revisa que el ID que pusiste en **Google Play Console** sea **exactamente igual** (letra por letra) al que pusiste en **RevenueCat**.

**Tu caso detectado:**
- **Google Play:** `premium_monthly` y `premium_yearly` (usan guion bajo `_`).
- **RevenueCat:** Tenías `basic-monthly` y `premium-yearly`.
- **Solución:** Tienes que borrar esos productos en RevenueCat y añadirlos de nuevo con el ID exacto de Google Play.

---