# 📧 CatholicVerse — Configuración de Resend (Emails Transaccionales)

## ¿Para qué sirve Resend en esta app?

Resend es el servicio que envía los **emails automáticos** que genera la app:

| Email | Cuándo se envía |
|-------|-----------------|
| ✉️ **Bienvenida** | Cuando un usuario se registra por primera vez |
| 🔑 **Recuperación de contraseña** | Cuando el usuario pulsa "Olvidé mi contraseña" en la app |

Actualmente estos dos emails están implementados y funcionando en el backend.

---

## Estado actual de la implementación

| Componente | Fichero | Estado |
|------------|---------|--------|
| Servicio de email | `BibliaBackend/.../email/ResendEmailService.java` | ✅ Implementado |
| Configuración YAML | `application.yml` → bloque `resend:` | ✅ Implementado |
| Variable de entorno | `BibliaBackend/.env` (local) + `docker-compose.yml` | ✅ Implementado |
| Email remitente | `catholicverse@getcatholicverse.com` | ✅ Configurado |
| Integrado en registro | `AuthenticationService.java` → `register()` | ✅ Activo |
| Integrado en reset | `AuthenticationService.java` → `forgotPassword()` | ✅ Activo |

---

## Cuenta Resend

- **Dashboard:** [https://resend.com](https://resend.com)
- **Email de la cuenta:** `catholicverse@getcatholicverse.com`
- **API Key tipo:** `Send Only` (guardada en `.env`, nunca en el repo)
- **Plan actual:** Free (100 emails/día, 3.000/mes) — suficiente para empezar

---

## DNS en Cloudflare — ¿Tengo que añadir algo más?

**Respuesta corta: SÍ, pero es diferente a lo de Google.**

Tienes dos configuraciones DNS distintas que **no se pisan**:

| Configuración | Para qué | Registros en Cloudflare |
|---------------|----------|------------------------|
| **Google Workspace MX** | Para RECIBIR emails en `@getcatholicverse.com` | Registros MX de Google |
| **Resend DKIM/SPF** | Para ENVIAR emails desde la app sin que vayan a spam | Registros TXT y CNAME de Resend |

Los registros de Resend son **adicionales**, no reemplazan a los de Google. Ambas configuraciones conviven sin problema.

### Cómo añadir los registros de Resend en Cloudflare

1. Ve a [https://resend.com/domains](https://resend.com/domains)
2. Si el dominio `getcatholicverse.com` no aparece → `+ Add Domain` → escribe `getcatholicverse.com`
3. Resend te dará **3 registros DNS** para copiar:
   - Un registro **SPF** (tipo TXT) — autoriza a Resend a enviar en tu nombre
   - Un registro **DKIM** (tipo CNAME) — firma criptográfica de los emails
   - Un registro **DMARC** (tipo TXT) — política de rechazo de emails falsos

4. Ve a [dash.cloudflare.com](https://dash.cloudflare.com) → tu dominio → **DNS → Records**
5. Añade cada registro que te dio Resend uno a uno
6. Vuelve a Resend → `Verify` → en 1-5 minutos aparece como ✅ Verified

> ⚠️ **Importante:** El registro SPF puede que ya tengas uno de Google. En ese caso NO crees uno nuevo, edita el existente añadiendo `include:amazonses.com` (o el que te dé Resend) al final, antes del `~all`.

### ¿Tengo que hacerlo para que funcione?

Técnicamente los emails se envían **aunque no lo hagas**, pero:
- Sin verificación → los emails pueden ir a **spam o ser bloqueados**
- Con verificación → van a la bandeja de entrada ✅

---

## Cómo reiniciar el backend con la API key

Cuando quieras lanzar el backend con los emails activos:

```bash
# Desde la carpeta BibliaBackend/
export $(cat .env | xargs)
docker-compose up --build
```

O si ya está corriendo y solo quieres recargar:
```bash
export $(cat .env | xargs)
docker-compose restart biblia-api
```

---

## Próximos emails a implementar (futuro)

Cuando estés listo hay dos emails más que merecería la pena añadir:

| Email | Cuándo |
|-------|--------|
| 🔔 Confirmación de suscripción | Cuando el usuario se suscribe (vía webhook de RevenueCat) |
| 😢 Cancelación de suscripción | Cuando se cancela la suscripción automáticamente |

Estos dependen del webhook de RevenueCat (que aún no está implementado).
