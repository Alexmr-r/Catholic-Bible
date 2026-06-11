# 🏗️ Backend, Scripts y Despliegue de Producción
> *Documento maestro que consolida todas las notas históricas relativas a la capa de servicios, base de datos y scripts de compilación de CatholicVerse.*

## 1. Ecosistema de Scripts Locales vs Producción
La aplicación opera bajo un ciclo de vida gestionado por scripts Bash (documentados en el antiguo `DIAGRAMA_SCRIPTS.md`), lo que asegura que el entorno de desarrollo sea idéntico al de AWS/DigitalOcean gracias a Docker.

- **`dev-start.sh`**: Levanta PostgreSQL de manera aislada y verifica la conexión antes de que Spring Boot intente conectarse. Inyecta `.env` local.
- **`prod-start.sh`**: Igual que dev, pero compila el `.jar` con Maven en modo Release, aplica `-Dspring.profiles.active=prod` y lanza la API segura. Utiliza el puerto 8080 en la red de Docker.
- **`dev-reload-backend.sh`**: Herramienta de live-reloading para modificar clases Java y compilar en caliente sin tirar los contenedores.

## 2. Autenticación y Ciberseguridad (Fusión Auth)
Como se estableció originalmente en `GUIA_APPLE_SIGNIN.md` e `IMPLEMENTACION_GOOGLE_APPLE_SIGNIN.md`:
1. El App valida el token de Apple Sign In en el FrontEnd.
2. Spring Boot usa `JwtAuthenticationFilter` para validar la sesión y generar su propio token Bearer seguro.
3. Se integraron servicios externos en el Backend para correos transaccionales (Resend) con variables inyectables `RESEND_API_KEY` para manejar recuperación de contraseñas.
4. **Restricción de Recursos:** Se configuró CORS a `getcatholicverse.com` y se blindó el `JWT_SECRET` para que crashee si no existe en perfil Producción. (Histórico `PUESTA_EN_PRODUCCION_FINAL.md`).

## 3. Resolución de Problemas Comunes (Troubleshooting)
- **Error Puerto 5432 Ocupado:** Ocurre si instancias un postgre local mientras Docker corre. Usar `docker-compose down`.
- **Colores en Docker:** Los scripts usan `tput` para códigos de color, documentados en `SOLUCION_COLORES_DOCKER.md`.
- **Compilación de Expo Native Modules:** Cuando fallan librerías que tocan la RAM o el micrófono nativo, fallaba el Expo Go normal. (Solución: `npx expo prebuild -p ios` en `SOLUCION_COMPILACION_EXPO.md`).

## 4. Despliegues Externos
- **Web App:** Todo el estático está purgado de lógicas de servidor directo y se publica ciegamente vía Cloudflare Pages (histórico `CLOUDFLARE_DEPLOY.md`).
- **Base de Datos:** Migración programática automatizada usando Flyway (`classpath:db/migration`), donde en modo `validate` no destruye tuplas de la versión de base de datos anterior.

## 🚀 Pasos Críticos en DigitalOcean (Post-Despliegue)
Una vez ejecutado `./prod-start.sh` en el servidor, recuerda realizar estos dos pasos:

1.  **Cargar el "cerebro" de la IA:**
    Ejecuta este comando para que Ollama descargue el modelo (la primera vez):
    ```bash
    docker exec -it biblia-ollama ollama pull llama3.2:1b
    ```

2.  **Configurar el Dominio en Cloudflare:**
    - Crea un registro tipo **A** para `api.getcatholicverse.com`.
    - Apúntalo a la **IP Pública** que te asigne DigitalOcean.
    - Asegúrate de que el "Proxy" (nube naranja) esté activado para tener SSL (HTTPS).

> [!NOTE]
> La App móvil ya está configurada en `src/services/config.ts` para apuntar a `https://api.getcatholicverse.com`, por lo que el cambio será instantáneo sin necesidad de recompilar la App.
