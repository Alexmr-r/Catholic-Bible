# 📚 Índice de Documentación - Biblia Católica API

> ℹ️ Esta carpeta contiene la documentación **didáctica** del backend. La visión global y verificada de todo el sistema (endpoints completos, BD, seguridad, IA, despliegue) está en [`../01-sistema/DOCUMENTACION_MAESTRA_2026.md`](../01-sistema/DOCUMENTACION_MAESTRA_2026.md).

## 🎯 ¿Por dónde empezar?

| Si quieres... | Lee este documento |
|---------------|-------------------|
| Visión global verificada del sistema | [../01-sistema/DOCUMENTACION_MAESTRA_2026.md](../01-sistema/DOCUMENTACION_MAESTRA_2026.md) |
| Entender la arquitectura | [ARQUITECTURA_BACKEND.md](./ARQUITECTURA_BACKEND.md) |
| Ver qué hace cada clase | [CLASES_DETALLADAS.md](./CLASES_DETALLADAS.md) |
| Entender inyección de dependencias y por qué se usan interfaces | [INYECCION_DEPENDENCIAS_Y_CONFIG.md](./INYECCION_DEPENDENCIAS_Y_CONFIG.md) |
| Levantar el proyecto rápido | [GUIA_INICIO_RAPIDO.md](./GUIA_INICIO_RAPIDO.md) |
| Entender Docker | [EXPLICACION_DOCKERIZACION.md](./EXPLICACION_DOCKERIZACION.md) |
| Respuestas directas | [RESPUESTAS_DIRECTAS.md](./RESPUESTAS_DIRECTAS.md) |
| Comandos frecuentes | [CHEAT_SHEET.md](./CHEAT_SHEET.md) |

---

## 📖 Documentación Completa

### 🏗️ Arquitectura y Código

| Documento | Descripción |
|-----------|-------------|
| [ARQUITECTURA_BACKEND.md](./ARQUITECTURA_BACKEND.md) | Arquitectura Hexagonal explicada paso a paso |
| [CLASES_DETALLADAS.md](./CLASES_DETALLADAS.md) | Explicación de cada clase Java del proyecto |
| [INYECCION_DEPENDENCIAS_Y_CONFIG.md](./INYECCION_DEPENDENCIAS_Y_CONFIG.md) | Por qué se usan interfaces, cómo funciona la inyección y la configuración |

### 🐳 Docker y DevOps

| Documento | Descripción |
|-----------|-------------|
| [EXPLICACION_DOCKERIZACION.md](./EXPLICACION_DOCKERIZACION.md) | Docker explicado desde cero |
| [COMO_FUNCIONA_DOCKER_Y_MIGRACIONES.md](./COMO_FUNCIONA_DOCKER_Y_MIGRACIONES.md) | Detalles de Docker Compose y Flyway |
| [DIAGRAMA_MIGRACIONES.md](./DIAGRAMA_MIGRACIONES.md) | Flujo visual de las migraciones SQL |

### 🚀 Inicio y Configuración

| Documento | Descripción |
|-----------|-------------|
| [GUIA_INICIO_RAPIDO.md](./GUIA_INICIO_RAPIDO.md) | Cómo levantar todo en 5 minutos |
| [GUIA_MIGRACIONES_FLYWAY.md](./GUIA_MIGRACIONES_FLYWAY.md) | Cómo evitar problemas con migraciones |
| [README.md](./README.md) | Información general del backend |

### ❓ Preguntas y Respuestas

| Documento | Descripción |
|-----------|-------------|
| [RESPUESTAS_DIRECTAS.md](./RESPUESTAS_DIRECTAS.md) | Respuestas a preguntas frecuentes |
| [FAQ_SWAGGER_Y_DATOS.md](./FAQ_SWAGGER_Y_DATOS.md) | FAQ sobre Swagger y base de datos |
| [CHEAT_SHEET.md](./CHEAT_SHEET.md) | Hoja de referencia rápida con comandos |
| [INYECCION_DEPENDENCIAS_Y_CONFIG.md](./INYECCION_DEPENDENCIAS_Y_CONFIG.md) | Duda clásica: ¿por qué usar interfaces y cómo elige Spring la implementación? |

---

## 📊 Estructura del Proyecto

```
BibliaBackend/
├── docs/                           ← 📚 DOCUMENTACIÓN
│   ├── INDICE_DOCUMENTACION.md     ← Este archivo
│   ├── ARQUITECTURA_BACKEND.md     ← Arquitectura Hexagonal
│   ├── CLASES_DETALLADAS.md        ← Explicación de cada clase
│   ├── EXPLICACION_DOCKERIZACION.md
│   ├── GUIA_INICIO_RAPIDO.md
│   ├── RESPUESTAS_DIRECTAS.md
│   ├── CHEAT_SHEET.md
│   └── INYECCION_DEPENDENCIAS_Y_CONFIG.md
│
├── src/main/java/                  ← 💻 CÓDIGO
│   └── com/bibliacatolica/api/
│       ├── domain/                 ← Reglas de negocio
│       ├── application/            ← Servicios
│       └── infrastructure/         ← Controllers, JPA, Security
│
├── src/main/resources/
│   ├── application.yml             ← Configuración
│   └── db/migration/               ← Migraciones SQL (Flyway)
│
├── scripts/                        ← Scripts de utilidad
│   └── import_bible_data.py        ← Importa toda la Biblia
│
├── docker-compose.yml              ← Orquestación Docker
├── Dockerfile                      ← Imagen de la API
└── pom.xml                         ← Dependencias Maven
```

---

## 🔗 Enlaces Útiles

### Cuando la API está corriendo:

| Recurso | URL |
|---------|-----|
| Swagger UI | http://localhost:8080/api/v1/swagger-ui.html |
| Health Check | http://localhost:8080/api/v1/actuator/health |
| OpenAPI JSON | http://localhost:8080/api/v1/v3/api-docs |
| pgAdmin (dev) | http://localhost:5050 |

### Documentación externa:

| Tecnología | Documentación |
|------------|---------------|
| Spring Boot | https://spring.io/projects/spring-boot |
| Spring Security | https://spring.io/projects/spring-security |
| Spring Data JPA | https://spring.io/projects/spring-data-jpa |
| Flyway | https://flywaydb.org/documentation |
| Docker Compose | https://docs.docker.com/compose |
| Lombok | https://projectlombok.org |

---

## 🎓 Orden de Lectura Recomendado

### Para entender el código:

1. **[ARQUITECTURA_BACKEND.md](./ARQUITECTURA_BACKEND.md)**
   - Qué es Arquitectura Hexagonal
   - Por qué la usamos
   - Estructura de carpetas

2. **[CLASES_DETALLADAS.md](./CLASES_DETALLADAS.md)**
   - Cada clase explicada
   - Anotaciones de Spring
   - Patrones de diseño

3. **[INYECCION_DEPENDENCIAS_Y_CONFIG.md](./INYECCION_DEPENDENCIAS_Y_CONFIG.md)**
   - Entender inyección de dependencias
   - Por qué se usan interfaces

4. **[RESPUESTAS_DIRECTAS.md](./RESPUESTAS_DIRECTAS.md)**
   - Dudas frecuentes
   - Tips de desarrollo

### Para levantar el proyecto:

1. **[GUIA_INICIO_RAPIDO.md](./GUIA_INICIO_RAPIDO.md)**
   - Dependencias necesarias
   - Comandos para iniciar

2. **[EXPLICACION_DOCKERIZACION.md](./EXPLICACION_DOCKERIZACION.md)**
   - Cómo funciona Docker
   - docker-compose explicado

3. **[CHEAT_SHEET.md](./CHEAT_SHEET.md)**
   - Comandos de referencia rápida

---

## 📝 Notas

- Toda la documentación está en español
- Los ejemplos de código están comentados
- Si algo no está claro, revisa RESPUESTAS_DIRECTAS.md
- Los diagramas ASCII funcionan mejor con fuente monoespaciada

---

**Última actualización:** 11 de junio, 2026
