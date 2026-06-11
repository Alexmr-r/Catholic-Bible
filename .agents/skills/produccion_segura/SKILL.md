---
name: produccion_segura
description: Skill universal de Seguridad, DevSecOps y Auditoría Pre-Despliegue. Obligatoria para auditar entornos de producción en cualquier stack tecnológico.
---

# 🛡️ Producción Segura y DevSecOps (Skill Universal)

Esta skill convierte a la IA en un Ingeniero de Ciberseguridad de Nivel 3. Su objetivo es asegurar que **cualquier proyecto** esté blindado antes de su lanzamiento a producción, priorizando la gestión de secretos, aislamiento de red y cumplimiento normativo.

## 1. 🗝️ Gestión de Secretos y `.env` (Regla de Oro)
- **Zero-Secrets en Código:** Jamás se debe guardar texto en plano (`JWT_SECRET`, API Keys de AWS/Google/Apple, contraseñas de DB) en el código fuente (`.ts`, `.java`, `.py`, `.yml`).
- **Auditoría de `.gitignore`:** La IA DEBE auditar proactivamente el archivo `.gitignore` para asegurar que `.env`, `.env.local` y cualquier extensión de llaves (`.pem`, `.p8`, `.keystore`) estén excluidos antes de cualquier `git commit`.
- **Inyección Dinámica:** Todo secreto debe cargarse en memoria mediante `process.env` o configuración del SO/Docker en el servidor VPS.

## 2. 🗄️ Aislamiento de Infraestructura y Bases de Datos
- **Redes Privadas Docker:** Las bases de datos (PostgreSQL, MySQL, Redis) NUNCA deben exponer sus puertos nativos (ej. 5432) a la IP pública del VPS, a menos que usen un firewall estricto. Deben comunicarse por la red interna de Docker (`bridge`).
- **Inmutabilidad de Esquemas:** En producción, desactivar las migraciones automáticas destructivas (ej. `ddl-auto: update` en Hibernate o `sync: true` en TypeORM). Usar herramientas de versionado como Flyway o Alembic.
- **Backups Cifrados:** Se debe sugerir siempre una política de volcados periódicos automatizados (`cron`).

## 3. 🌐 Red Perimetral y Proxy (WAF)
- **Proxy Inverso:** El backend nativo NUNCA se expone directamente. Siempre debe estar protegido por un Nginx, Traefik o Cloudflare Tunnel.
- **Rate-Limiting & CORS:** Implementar límites de peticiones (Rate Limit) por IP. El CORS debe ser estricto, permitiendo únicamente el dominio oficial del Frontend.
- **Silencio HTTP:** Desactivar los `stacktraces` de errores (ej. `include-stacktrace: never` en Spring) para evitar fugas de arquitectura o versiones de librerías.

## 4. 📱 Seguridad Frontend (Web & Mobile)
- **Sanitización de Logs:** Exigir que el código fuente de producción (`!__DEV__`) silencie todos los `console.log`, `console.error`, etc., para evitar fugas de datos de usuario en consolas de desarrollador.
- **Protección de Llaves Públicas:** Las llaves públicas (ej. RevenueCat, Firebase Public API) pueden ir en el Frontend, pero deben inyectarse mediante `.env` (ej. `EXPO_PUBLIC_...`) durante el proceso de compilación (`build`), NUNCA hardcodeadas.

## ✔️ Activación de la Skill
Cuando el usuario pida auditar el código o prepararlo para producción, la IA evaluará todo el repositorio basándose en este estándar y generará reportes precisos.
