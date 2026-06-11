# 🌐 Guía de IA, Subidas y Configuración de Cloudflare

Esta guía detalla la arquitectura de Inteligencia Artificial (IA) recomendada para **CatholicVerse**, cómo optimizar y "aumentar" la configuración de **Cloudflare** para prevenir bloqueos en subidas grandes o timeouts de IA, y cómo funciona el flujo de subida de **todos los componentes del ecosistema**.

---

## 🧠 1. Integración de la IA en la Aplicación

Actualmente, el contenedor de **Ollama** (`biblia-ollama`) en el archivo `docker-compose.yml` está **desactivado para ahorrar RAM**.

* Para una explicación detallada sobre por qué el comportamiento de nuestra IA es transparente entre proveedores de LLM y cómo proteger el servidor VPS de caídas por RAM, lee el documento de decisión de arquitectura:
  👉 [IA_DECISION_ARQUITECTURA.md](file:///Users/mrrobot/IdeaProjects/Biblia/docs/queda_por_hacer_y_subidas/importante/IA_DECISION_ARQUITECTURA.md)

---

## ☁️ 2. "Aumentar" y Optimizar Cloudflare

Cuando la App o el Backoffice se comunican con tu backend a través del dominio proxied `api.getcatholicverse.com` (nube naranja), Cloudflare impone ciertas restricciones que debemos gestionar:

### A. Límite de Tamaño de Subida (Max Upload Size: 100 MB)
El plan gratuito de Cloudflare tiene un límite máximo de subida de **100 MB** por petición HTTP. Si subes audios bíblicos pesados o backups de bases de datos de más de 100 MB, Cloudflare responderá con un error **413 Request Entity Too Large**.

#### 💡 Solución técnica (Saltarse el proxy para subidas de administración):
1. Ve a tu panel de **Cloudflare** -> **DNS**.
2. Crea un nuevo subdominio como `direct-api.getcatholicverse.com`.
3. Apúntalo a la misma IP de tu servidor, pero marca la nube en **Gris** (DNS Only / Sin Proxy).
4. **Resultado:** Al no pasar por el "escudo" de Cloudflare, este subdominio no tiene la restricción de los 100 MB.
5. Configura tu panel de administración (Backoffice) o scripts de carga para enviar los archivos grandes a `direct-api.getcatholicverse.com`.
6. En tu servidor Nginx / Docker, asegúrate de configurar el tamaño máximo de cuerpo en la configuración de proxy:
   ```nginx
   client_max_body_size 500M;
   ```

### B. Tiempo de Espera Límite (Timeout de 100 segundos)
Si una llamada de IA tarda más de **100 segundos** en responder, Cloudflare cortará la conexión y devolverá un error **524 A Timeout Occurred**.

#### 💡 Solución técnica (Streaming / Server-Sent Events):
* No hagas que la API de Spring Boot espere a generar todo el texto de la IA para enviarlo.
* Implementa **Streaming (SSE)** en tu controlador de Java:
  ```java
  @GetMapping(value = "/explain", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
  public Flux<String> explainVerse(@RequestParam String verseId) {
      return iaService.streamExplanation(verseId);
  }
  ```
* **Por qué funciona:** Al enviar pequeños trozos de texto segundo a segundo (en lugar de esperar al final), Cloudflare detecta actividad constante y **nunca** cortará la conexión por timeout.

---

## 📤 3. Mapa de Subidas del Ecosistema CatholicVerse

No todo pasa por Cloudflare. Aquí tienes cómo y dónde se sube cada parte de tu proyecto:

### 1. Backend (`BibliaBackend` -> `.jar`)
* **Qué se sube:** El archivo compiled de Spring Boot (`biblia-api-1.0.0.jar`).
* **Cómo se sube:** Con el script local `./prod-start.sh`. Utiliza **SCP** para mandar el archivo directamente a la IP física del servidor (`137.184.139.1`) y **SSH** para reiniciar el contenedor Docker en remoto.
* **Afección de Cloudflare:** **Ninguna**. Al conectarse a la IP del VPS directa, se salta el proxy de Cloudflare. No tiene límites de tamaño ni timeouts.

### 2. Base de Datos (`PostgreSQL` / SQLite Migrations)
* **Qué se sube:** Scripts de estructura SQL y carga de datos iniciales.
* **Cómo se sube:** 
  - La estructura y los cambios se aplican automáticamente al iniciar el backend mediante **Flyway** (leyendo de `src/main/resources/db/migration`).
  - Las bases de datos locales SQLite se leen en la app móvil. Los backups o volcados pesados se pueden subir al servidor por SSH/SFTP (bypasseando Cloudflare).
* **Afección de Cloudflare:** **Ninguna** (si se sube por SFTP a la IP) o limitada a **100MB** (si se intenta subir a través de endpoints de la API expuestos por HTTPS con proxy).

### 3. Landing Page Web (`CatholicVerseWeb`)
* **Qué se sube:** Archivos HTML estáticos, CSS e imágenes de la página promocional.
* **Cómo se sube:** Conectando el repositorio GitHub a **Cloudflare Pages**. Cada vez que haces `git push` a la rama `main`, Cloudflare compila y despliega la web de forma automática en `getcatholicverse.com`.
* **Afección de Cloudflare:** Integración nativa. Rendimiento mundial instantáneo y caché automática en el Edge.

### 4. Panel de Administración (`CatholicVerseBackoffice`)
* **Qué se sube:** Aplicación estática React compilada (`npm run build` genera la carpeta `dist`).
* **Cómo se sube:** 
  - Al igual que la Landing, se configura un proyecto en **Cloudflare Pages** conectado a la carpeta `CatholicVerseBackoffice` de GitHub.
  - Al hacer push, se despliega en un subdominio como `admin.getcatholicverse.com`.
* **Afección de Cloudflare:** Integración nativa sin restricciones de subida de código.

### 5. Aplicación Móvil (`BibliaAppExpo` -> `.ipa` / `.aab`)
* **Qué se sube:** Los binarios nativos empaquetados para móviles.
  - Para iOS: Archivo `.ipa` de distribución.
  - Para Android: Archivo `.aab` (Android App Bundle).
* **Cómo se sube:** 
  - Mediante **EAS Build** (`eas build --platform all`) o subiendo manualmente a través de Transporter (iOS) y la consola de desarrolladores de Google Play (Android).
* **Afección de Cloudflare:** **Ninguna**. Se sube directo a los servidores de infraestructura de Apple (App Store Connect) y Google (Google Play Console).
