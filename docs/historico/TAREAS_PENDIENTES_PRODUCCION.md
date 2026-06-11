# 📋 Tareas Pendientes para Producción — Biblia Católica App

> Documento creado: 30 de marzo de 2026  
> Última actualización: 30 de marzo de 2026

---

## 🔴 CRÍTICAS — Necesarias antes de publicar

### 1. "Olvidé mi Contraseña" (Recuperación por Email)
**Estado:** ✅ COMPLETADO E IMPLEMENTADO (Resend configurado).
**Importancia:** 🔴 IMPRESCINDIBLE  
**Motivo:** Si un usuario olvida su contraseña, no puede acceder a su cuenta NUNCA MÁS. Esto genera quejas, soporte innecesario y mala valoración en las stores.

#### ¿Cómo funciona? (Flujo completo)

```
USUARIO                         APP                         BACKEND                      EMAIL
  |                              |                              |                           |
  |-- Pulsa "Olvidé contraseña" -->                              |                           |
  |                              |-- Envía email del usuario --->|                           |
  |                              |                              |-- Genera código 6 dígitos  |
  |                              |                              |-- Guarda en BD (5 min TTL) |
  |                              |                              |-- Envía email ------------>|
  |<------ Recibe email con código (ej: 482917) -------------------------------------------|
  |                              |                              |                           |
  |-- Introduce código 482917 -->|                              |                           |
  |                              |-- Verifica código ---------->|                           |
  |                              |                              |-- Compara con BD ✅       |
  |                              |<--- OK, código válido -------|                           |
  |                              |                              |                           |
  |-- Escribe nueva contraseña ->|                              |                           |
  |                              |-- Envía nueva contraseña --->|                           |
  |                              |                              |-- Actualiza hash en BD    |
  |                              |<--- Contraseña cambiada ✅ --|                           |
  |<-- "Contraseña actualizada" -|                              |                           |
```

#### ¿Necesito un correo de empresa?

**NO necesitas un correo de empresa para empezar.** Hay servicios que envían emails por ti:

| Servicio | Gratis hasta | Ideal para | Dificultad |
|----------|-------------|------------|------------|
| **Resend** | 3.000 emails/mes | Apps nuevas, muy fácil | ⭐ Fácil |
| **Brevo (ex-Sendinblue)** | 300 emails/día | Apps medianas | ⭐⭐ Media |
| **AWS SES** | 62.000/mes (con EC2) | Apps grandes | ⭐⭐⭐ Avanzado |
| **SendGrid** | 100 emails/día | Muy popular | ⭐⭐ Media |
| **Gmail SMTP** | 500/día | Solo para testing | ⭐ Fácil (NO producción) |

**Recomendación para tu caso: Resend** 
- Es el más fácil de integrar con Spring Boot
- 3.000 emails gratis al mes (más que suficiente para empezar)
- Solo necesitas un **dominio propio** (ej: `tuapp.com`) para que los emails no vayan a spam
- Los emails se envían desde `noreply@tuapp.com` o `soporte@tuapp.com`

**Sobre el dominio:**
- Sí necesitas un dominio (ej: `bibliacatolica.app` o similar)
- Cuesta ~10-15€/año en Namecheap, Google Domains, etc.
- Lo configuras con registros DNS (SPF, DKIM) para que no vaya a spam
- El servicio (Resend, SendGrid, etc.) te guía paso a paso

#### Implementación actual (Simulacro completo Finalizado ✅)

**Backend (Spring Boot) - Completado:**
1. ✅ Endpoints `POST /auth/forgot-password`, `POST /auth/verify-reset-code`, `POST /auth/reset-password`
2. ✅ Almacenamiento local temporal del Token
3. ✅ Lógica de simulacro: Actualmente la API genera el código y **lo imprime en la terminal del backend** en vez de enviarlo por internet, esto ahorra tiempo para probar interfaces sin gastar cuota de envíos.

**Frontend (React Native) - Completado:**
1. ✅ Nueva pantalla `ForgotPasswordScreen` con flujo en 3 pasos: (Email → Código → Contraseña Nueva)
2. ✅ Integración total con backend
3. ✅ Conectada desde la pantalla de `LoginScreen`

#### ✅ 100% FUNCIONANDO
La API Key de Resend está integrada en el Backend como variable de entorno `RESEND_API_KEY`. Se envían los emails a inboxes reales perfectamente.

---

### 2. Validación de Email en Registro
**Estado:** ❌ No implementado  
**Importancia:** 🔴 ALTA  
**Motivo:** Cualquiera puede registrarse con un email falso. Esto causa problemas porque:
- No podrá recuperar su contraseña si usa email falso
- Podrían registrar emails de otras personas
- Las stores pueden penalizar si hay muchas cuentas basura

**Solución:** Enviar un código de verificación al email después del registro. El usuario no puede usar la app completamente hasta verificar.

---

### 3. Términos de Uso y Política de Privacidad
**Estado:** ❌ No implementado  
**Importancia:** 🔴 OBLIGATORIO para Apple App Store y Google Play  
**Motivo:** Apple y Google RECHAZAN apps que no tengan:
- Política de privacidad accesible
- Términos de uso
- Consentimiento en el registro

**Solución:** Crear una página web simple con los textos legales y enlazarla desde la app.

---

### 4. Eliminar Datos de Desarrollo
**Estado:** ✅ ASEGURADO PARA PRODUCCIÓN  
**Importancia:** 🔴 CRÍTICA  
**Cosas aseguradas para producción:**
- ✅ Cambiado `JWT_SECRET` forzando entorno estricto sin fall-back.
- ✅ Desactivado Swagger UI en configuración `prod`.
- ✅ Quitados logs de la consola en producción (`include-stacktrace: never` e `if(!__DEV__)`).
- ✅ CORS implementado.
- ✅ IP local cambiada por URL nativa `https://api.getcatholicverse.com`.

---

## 🟡 IMPORTANTES — Hacerlas pronto tras el lanzamiento

### 5. Notificación por Email al Cambiar Contraseña
**Estado:** ❌ No implementado  
**Importancia:** 🟡 RECOMENDADO  
**Motivo:** Buena práctica de seguridad. Si alguien cambia la contraseña de forma no autorizada, el usuario se entera.

**Solución:** Después de un cambio de contraseña exitoso, enviar un email:
> "Tu contraseña fue cambiada. Si no fuiste tú, contacta soporte inmediatamente."

---

### 6. Rate Limiting (Protección contra ataques)
**Estado:** ❌ No implementado  
**Importancia:** 🟡 IMPORTANTE para seguridad  
**Motivo:** Sin rate limiting, alguien puede hacer miles de intentos de login por segundo para adivinar contraseñas (fuerza bruta).

**Solución:** Limitar a 5 intentos de login por IP cada 15 minutos. Bloquear temporalmente si se excede.

---

### 7. Refresh Token Automático
**Estado:** ⚠️ Parcial  
**Importancia:** 🟡 IMPORTANTE para UX  
**Motivo:** Si el token JWT expira (24h), el usuario tiene que volver a iniciar sesión. Molesto.

**Solución:** Antes de que expire, usar el refresh token automáticamente para obtener uno nuevo sin que el usuario lo note.

---

### 8. Google Sign-In
**Estado:** ❌ Comentado/deshabilitado  
**Importancia:** 🟡 IMPORTANTE para conversión  
**Motivo:** Muchos usuarios prefieren registrarse con un tap en vez de escribir email + contraseña.

**Solución:** Configurar Google Cloud Console con Client ID y habilitar el botón de Google.

---

## 🟢 MEJORAS — Para versiones futuras

### 9. Push Notifications
**Estado:** ❌ No implementado  
**Importancia:** 🟢 DESEABLE  
**Motivo:** Recordar al usuario la lectura del día, enviar motivación, etc.

---

### 10. Analytics (Firebase/PostHog)
**Estado:** ❌ No implementado  
**Importancia:** 🟢 DESEABLE  
**Motivo:** Saber qué pantallas usan más, cuántos usuarios activos hay, etc.

---

### 11. Crash Reporting (Sentry/Crashlytics)
**Estado:** ❌ No implementado  
**Importancia:** 🟢 MUY RECOMENDADO  
**Motivo:** Cuando la app crashea en el teléfono de un usuario, tú no te enteras a menos que tengas un servicio de crash reporting.

---

### 12. App Store Optimization (ASO)
**Estado:** ❌ Pendiente  
**Importancia:** 🟢 DESEABLE  
- Screenshots profesionales
- Descripción optimizada con keywords
- Icono final

---

## 📊 Resumen de Prioridades

| # | Tarea | Importancia | Esfuerzo | ¿Antes de publicar? |
|---|-------|-------------|----------|---------------------|
| 1 | Olvidé mi contraseña (email) | 🔴 Crítica | ~2-3 días | ✅ SÍ |
| 2 | Validación email en registro | 🔴 Alta | ~1 día | ✅ SÍ |
| 3 | Términos y Política de Privacidad | 🔴 Obligatorio | ~1 día | ✅ SÍ |
| 4 | Limpiar datos dev / seguridad | 🔴 Crítica | ~0.5 día | ✅ SÍ |
| 5 | Email al cambiar contraseña | 🟡 Recomendado | ~2h | Puede ser después |
| 6 | Rate Limiting | 🟡 Importante | ~0.5 día | Puede ser después |
| 7 | Refresh Token automático | 🟡 Importante | ~0.5 día | Puede ser después |
| 8 | Google Sign-In | 🟡 Importante | ~1 día | Puede ser después |
| 9 | Push Notifications | 🟢 Deseable | ~1-2 días | Versión futura |
| 10 | Analytics | 🟢 Deseable | ~0.5 día | Versión futura |
| 11 | Crash Reporting | 🟢 Recomendado | ~0.5 día | Versión futura |
| 12 | ASO | 🟢 Deseable | ~1 día | Versión futura |

---

## 🚀 Orden Recomendado de Implementación

1. **Primero:** Configurar servicio de email (Resend) + dominio
2. **Segundo:** Implementar "Olvidé mi contraseña" (backend + frontend)
3. **Tercero:** Validación de email en registro
4. **Cuarto:** Términos y Política de Privacidad
5. **Quinto:** Limpieza de seguridad (secrets, HTTPS, etc.)
6. **Sexto:** ¡PUBLICAR! 🎉
7. **Después:** Rate limiting, Google Sign-In, notificaciones, analytics...
