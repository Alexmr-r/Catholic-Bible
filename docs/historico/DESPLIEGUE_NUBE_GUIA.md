# ☁️ Guía Maestra de Despliegue en la Nube (VPS, Web y Testing)

> *Generado automáticamente por la skill `documentacion_continua` para mantener un registro exacto de los pasos a seguir para llevar CatholicVerse a producción mundial.*

---

## FASE 1: La Elección del Servidor (DigitalOcean)
Tras evaluar opciones, la recomendación técnica oficial para CatholicVerse es **DigitalOcean**. 
- **¿Por qué?** Es la plataforma más amigable para desarrolladores. Permite crear un "Droplet" (Servidor VPS) que ya viene con **Docker y Docker Compose preinstalados** con 1 solo clic. 
- **¿Qué vamos a subir ahí?** Exactamente lo mismo que tienes en tu Docker local. Tu archivo `docker-compose.yml` local levanta tres cosas: La Base de Datos (PostgreSQL), la IA (Ollama) y el Backend de Java (`api`). 

## FASE 2: Transferencia y Despliegue del Backend
1. **Contratar Droplet:** Entrar en DigitalOcean, elegir "Droplet con Docker" (Ubuntu).
2. **Transferir el Código:** Mover la carpeta `BibliaBackend` desde tu Mac al servidor (usando GitHub de forma privada o enviando un `.zip` por consola).
3. **El Archivo Secreto:** Crear un archivo `.env` en el servidor con las credenciales maestras:
   ```env
   JWT_SECRET=escribe_aqui_una_contrasena_gigante_y_secreta_para_la_nube
   RESEND_API_KEY=re_tu_clave_de_resend
   ```
4. **El Gran Lanzamiento:** Ejecutar el comando para que Docker compile y levante todo:
   ```bash
   docker-compose --env-file .env up -d --build
   ```

## FASE 3: Enlace del Dominio (Cloudflare)
Una vez el Docker esté encendido, tendrá una IP pública (ej. `142.25.10.1`).
1. Vamos a tu cuenta de **Cloudflare** (donde compraste `getcatholicverse.com`).
2. Creamos un registro "A" llamado `api` apuntando a esa IP.
3. Resultado: Todo el tráfico de la App hacia `https://api.getcatholicverse.com` llegará seguro y encriptado a tu servidor.

## FASE 4: Despliegue de la Web Estática (Cloudflare Pages)
Tu Landing Page (la carpeta `CatholicVerseWeb`) no necesita un servidor de pago, la servimos gratis con Cloudflare Pages.

### Cómo actualizar la web (Scalable method):
Cada vez que hagas un cambio en el código de la web (`index.html`, estilos, etc.), sigue estos pasos en tu terminal:

1. **Entrar en la carpeta:**
   ```bash
   cd CatholicVerseWeb
   ```
2. **Desplegar cambios:**
   ```bash
   npm run deploy
   ```
   *(La primera vez te pedirá `npm install` para tener las herramientas listas).*

3. **URL de Previsualización:** Cloudflare te dará una URL terminada en `.pages.dev`. Úsala para revisar que todo esté bien antes de avisar a nadie.

4. **Dominio Oficial:** Cuando las Apps estén en las tiendas, entraremos al panel de Cloudflare -> Workers & Pages -> Custom Domains para apuntar `tu-dominio.com` a este proyecto.

## FASE 5: Testing Privado (TestFlight y Google Play Internal)
⚠️ **NUNCA SE LANZA AL PÚBLICO A LA PRIMERA.**
Antes de publicar para todo el mundo, haremos una fase de prueba cerrada donde **solo tú** (o amigos que invites) podrán descargar la App.
- **En Apple:** Se usa **TestFlight**. Apple te manda un enlace privado, instalas la app en tu iPhone y pruebas que el login, los pagos (usando tarjetas falsas de prueba o "Sandbox") y las lecturas funcionen perfecto.
- **En Google:** Se usa **Pruebas Internas**. Funciona igual, bajas la app de un link secreto y verificas.

Una vez que tú mismo uses la app en tu móvil durante un día y certifiques que todo fluye... **¡Le daremos al botón rojo de Publicar Mundialmente!**
