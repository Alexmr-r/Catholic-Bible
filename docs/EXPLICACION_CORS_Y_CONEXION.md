# 🌐 Arquitectura de Conexión, HTTPS y Seguridad CORS en CatholicVerse

Este documento detalla la diferencia de propósitos entre las webs pública y privada del proyecto CatholicVerse y explica la configuración de red y CORS que solucionó los problemas de conectividad con la API.

---

## 1. Separación de Canales (Público vs. Privado)

En CatholicVerse operamos con dos webs completamente distintas:

### 📱 1. Web de Soporte y Descarga (Pública)
*   **Dominio principal**: `https://getcatholicverse.com` (y `https://www.getcatholicverse.com`).
*   **Propósito**: Es el escaparate de cara al mundo. Es donde los usuarios descargan la aplicación (links a App Store / Google Play), ven las condiciones de servicio, la política de privacidad y la marca oficial.
*   **Acceso**: Público para todo Internet.

### 🔐 2. Panel de Administración / Backoffice (Privada)
*   **Dominio temporal/gratuito**: `https://catholic-verse-admin.pages.dev` (alojada en Cloudflare Pages).
*   **Propósito**: Panel administrativo interno. Sirve para ver estadísticas en caliente de la base de datos de PostgreSQL, supervisar los logs del servidor, modificar planes de suscripción de los usuarios y editar erratas de los versículos.
*   **Acceso**: Privado y restringido. Requiere credenciales de administración (`admin` / `catholicadmin`) para iniciar sesión y no está indexado en Google.

---

## 2. ¿Por qué cambiamos `application.yml` en la API?

El archivo `BibliaBackend/src/main/resources/application.yml` contiene la configuración de seguridad y comportamiento de nuestro servidor Spring Boot en producción.

### El problema con CORS (Cross-Origin Resource Sharing)
Por motivos de seguridad, los navegadores web implementan la política del **Mismo Origen** (Same-Origin Policy). Si una web alojada en el Dominio A (`catholic-verse-admin.pages.dev`) hace una petición para consultar datos en el Dominio B (`api.getcatholicverse.com`), el navegador bloquea la petición inmediatamente a menos que el servidor del Dominio B declare explícitamente que confía en el Dominio A.

Si el servidor no responde indicando que permite llamadas del Dominio A, el navegador rechaza la llamada con un error **403 Forbidden**.

### El cambio realizado en `application.yml`
Para solucionar esto, agregamos la URL del Backoffice a la lista blanca de orígenes permitidos en el perfil de producción (`prod` profile) de la API:

```yaml
# BibliaBackend/src/main/resources/application.yml (Línea 205)

cors:
  allowed-origins: "https://getcatholicverse.com,https://www.getcatholicverse.com,https://catholic-verse-admin.pages.dev,http://localhost:5173,http://localhost:3000"
```

Con esta línea, cuando el navegador de un administrador entra en `catholic-verse-admin.pages.dev` e intenta consultar datos de telemetría a `api.getcatholicverse.com`, el servidor Spring Boot responde: *"Sí, la web de administración es un origen de confianza"*. El navegador acepta la respuesta y la web se conecta sin problemas.
