# 🌐 Desplegar Web en getcatholicverse.com (Cloudflare Pages)

La carpeta `CatholicVerseWeb/` dentro de este mismo repo contiene la web completa lista para publicar.

---

## ⚠️ Antes de empezar — Aviso sobre Google Workspace

Tienes el email `support@getcatholicverse.com` creado en Google Workspace.
Para que el email funcione, los registros MX del dominio en Cloudflare **deben apuntar a Google**.
Al configurar Cloudflare Pages con tu dominio, Cloudflare **NO toca los registros MX**, así que el correo seguirá funcionando sin problema. No hay conflicto.

---

## PASO 1 — Ir a Cloudflare Pages

1. Abre [https://dash.cloudflare.com](https://dash.cloudflare.com) e inicia sesión.
2. En el menú lateral izquierdo busca **"Workers & Pages"** y haz clic.
3. Haz clic en el botón azul **"Create"**.
4. Selecciona la pestaña **"Pages"**.
5. Haz clic en **"Connect to Git"**.

---

## PASO 2 — Conectar tu repositorio de GitHub

1. Autoriza a Cloudflare a acceder a tu GitHub si es la primera vez.
2. Busca y selecciona el repositorio: **`Catholic-Bible`** (el repo donde está todo el proyecto).
3. Haz clic en **"Begin setup"**.

---

## PASO 3 — Configurar el proyecto

Rellena estos campos **exactamente así**:

| Campo | Valor |
|-------|-------|
| **Project name** | `catholicverse` |
| **Production branch** | `main` |
| **Root directory** *(en "Advanced settings")* | `CatholicVerseWeb` |
| **Framework preset** | `None` |
| **Build command** | *(dejar completamente vacío)* |
| **Build output directory** | `/` |

> ⚠️ El campo "Root directory" es clave. Cloudflare solo publicará lo que hay dentro de la carpeta `CatholicVerseWeb/`, ignorando el backend y la app de Expo.

4. Haz clic en **"Save and Deploy"**.
5. Espera ~1 minuto. Cloudflare desplegará la web y te dará una URL temporal como `catholicverse.pages.dev`.

---

## PASO 4 — Conectar tu dominio getcatholicverse.com

1. En el proyecto de Cloudflare Pages, ve a la pestaña **"Custom domains"**.
2. Haz clic en **"Set up a custom domain"**.
3. Escribe: `getcatholicverse.com` → haz clic en **"Continue"**.
4. Cloudflare detectará que el dominio ya está en tu cuenta y añadirá los registros DNS automáticamente.
5. También añade `www.getcatholicverse.com` repitiendo el mismo proceso (así funciona con y sin `www`).

✅ En 5-10 minutos la web estará en:
- `https://getcatholicverse.com`
- `https://getcatholicverse.com/privacy.html`
- `https://getcatholicverse.com/terms.html`

---

## PASO 5 — Verificar que el email sigue funcionando

Después de conectar el dominio, ve a **Cloudflare DNS** (menú lateral → tu dominio → DNS → Records) y comprueba que los registros **MX de Google** siguen ahí:

Los registros MX de Google Workspace son del tipo:
```
MX  @  aspmx.l.google.com    (prioridad 1)
MX  @  alt1.aspmx.l.google.com  (prioridad 5)
...etc
```

Si están presentes, el email `support@getcatholicverse.com` funciona sin tocar nada.

---

## PASO 6 — Añadir los enlaces de las tiendas (cuando los tengas)

Una vez publicada la app, abre `CatholicVerseWeb/index.html` y busca las 4 ocurrencias de:

```
YOUR_APP_STORE_LINK    → reemplaza con tu enlace de App Store
YOUR_PLAY_STORE_LINK   → reemplaza con tu enlace de Google Play
```

Haz commit y push → Cloudflare redespliega automáticamente en segundos.

---

## PASO 7 — URLs para App Store Connect y Google Play

Una vez la web esté activa, usa estas URLs donde te las pidan:

| Dónde | URL |
|-------|-----|
| App Store Connect → Privacy Policy URL | `https://getcatholicverse.com/privacy.html` |
| App Store Connect → Terms of Use URL | `https://getcatholicverse.com/terms.html` |
| App Store Connect → Support URL | `https://getcatholicverse.com` |
| Google Play → Privacy Policy URL | `https://getcatholicverse.com/privacy.html` |
| RevenueCat → Support URL | `https://getcatholicverse.com` |

---

## ✅ Checklist final

- [ ] Cloudflare Pages creado y desplegado desde el repo `Catholic-Bible`
- [ ] Dominio `getcatholicverse.com` conectado en Custom Domains
- [ ] Verificar que registros MX de Google Workspace siguen activos
- [ ] Comprobar que `support@getcatholicverse.com` sigue recibiendo emails
- [ ] Sustituir `YOUR_APP_STORE_LINK` cuando tengas el enlace
- [ ] Sustituir `YOUR_PLAY_STORE_LINK` cuando tengas el enlace
- [ ] Añadir URL de Privacy Policy en App Store Connect
- [ ] Añadir URL de Terms en App Store Connect
