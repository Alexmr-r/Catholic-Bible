# 🐳 Guía Completa de Dockerización - Biblia Católica API

> ⚠️ **Nota de contexto (junio 2026):** este documento didáctico se escribió en la fase inicial del proyecto (migraciones V1–V3, Biblia de Jerusalén en español). **Los conceptos siguen siendo válidos**, pero el estado actual es: migraciones **V1–V11**, contenido bíblico **CPDV en inglés** (V6), 10 controladores REST y nuevas tablas (trials, progreso, suscripciones). El estado real verificado está en `DOCUMENTACION_MAESTRA_2026.md`.

## 📚 Índice
1. [¿Qué es Docker? (Explicación para principiantes)](#qué-es-docker)
2. [¿Por qué usar Docker en este proyecto?](#por-qué-usar-docker)
3. [Tecnologías utilizadas](#tecnologías-utilizadas)
4. [El Dockerfile explicado](#el-dockerfile-explicado)
5. [El docker-compose.yml explicado](#el-docker-composeyml-explicado)
6. [Cómo funciona todo junto](#cómo-funciona-todo-junto)
7. [Migración de datos (bible_raw.json)](#migración-de-datos)

---

## 🎯 ¿Qué es Docker?

### Analogía simple
Imagina que Docker es como una **caja de mudanza mágica** que contiene:
- Tu aplicación (código)
- Todo lo que necesita para funcionar (Java, PostgreSQL, etc.)
- Las configuraciones exactas

**Ventajas:**
- ✅ Funciona igual en tu computadora, en la de tu compañero, y en producción
- ✅ No necesitas instalar Java, PostgreSQL, etc. en tu computadora
- ✅ Puedes destruir y recrear todo en segundos
- ✅ Todo está aislado (no ensucia tu sistema)

### Conceptos clave

#### 🖼️ **Imagen Docker**
Es como una **receta o plantilla** que describe:
- Qué sistema operativo usar (Alpine Linux)
- Qué programas instalar (Java 21)
- Cómo configurar todo

#### 📦 **Contenedor Docker**
Es una **instancia corriendo** de una imagen. Es como hornear un pastel siguiendo una receta:
- La receta = Imagen
- El pastel que comes = Contenedor

#### 🔧 **Docker Compose**
Es como un **director de orquesta** que coordina múltiples contenedores:
- Levanta la base de datos
- Espera a que esté lista
- Luego levanta tu API
- Los conecta entre sí

---

## 🤔 ¿Por qué usar Docker en este proyecto?

### Sin Docker (❌ Complicado)
```
1. Instalar Java 21 en tu computadora
2. Instalar PostgreSQL
3. Crear base de datos manualmente
4. Configurar usuarios y contraseñas
5. Instalar pgAdmin si quieres ver los datos
6. Configurar variables de entorno
7. Ejecutar la aplicación
8. Si cambias de computadora... repetir todo
```

### Con Docker (✅ Simple)
```bash
docker-compose up
```
**¡Listo!** En un solo comando tienes:
- PostgreSQL corriendo
- Tu API corriendo
- pgAdmin disponible
- Todo conectado y funcionando

---

## 🛠️ Tecnologías utilizadas

### 1. **Eclipse Temurin (Java 21)**
- **¿Qué es?** Distribución open-source de Java (antes se llamaba AdoptOpenJDK)
- **¿Por qué?** Es gratis, confiable y tiene soporte a largo plazo
- **Versión:** Java 21 (la más moderna con LTS)

### 2. **Alpine Linux**
- **¿Qué es?** Distribución de Linux súper pequeña (5 MB vs 1 GB de Ubuntu)
- **¿Por qué?** Hace que las imágenes Docker sean más rápidas de descargar
- **Ventaja:** Menos espacio = más velocidad

### 3. **PostgreSQL 16**
- **¿Qué es?** Base de datos relacional (almacena tus datos)
- **¿Por qué?** Es potente, gratis y perfecta para aplicaciones modernas
- **Versión:** 16 (la más reciente y estable)

### 4. **pgAdmin 4**
- **¿Qué es?** Interfaz gráfica para ver tu base de datos
- **¿Por qué?** Puedes ver tablas, datos, ejecutar queries sin usar terminal

---

## 📝 El Dockerfile explicado

### ¿Qué hace el Dockerfile?
Define cómo construir la **imagen de tu aplicación Spring Boot**.

### Contenido explicado línea por línea:

```dockerfile
# ========================================
# ETAPA 1: CONSTRUCCIÓN (Builder)
# ========================================
FROM eclipse-temurin:21-jdk-alpine AS builder
```
**Explicación:** 
- Usa Java 21 JDK (Development Kit - con herramientas de compilación)
- Alpine para que sea ligero
- `AS builder` = dale un nombre a esta etapa

```dockerfile
WORKDIR /app
```
**Explicación:** Crea y entra a la carpeta `/app` dentro del contenedor

```dockerfile
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
```
**Explicación:** 
- Copia Maven Wrapper (mvnw) para compilar sin tener Maven instalado
- Copia el pom.xml que lista todas las dependencias

```dockerfile
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B
```
**Explicación:**
- `chmod +x mvnw` = dar permisos de ejecución
- `dependency:go-offline` = descargar todas las librerías
- **¿Por qué?** Docker guarda esta capa en caché. Si no cambias dependencias, no las descarga de nuevo (¡más rápido!)

```dockerfile
COPY src src
```
**Explicación:** Ahora sí copia tu código fuente

```dockerfile
RUN ./mvnw package -DskipTests -B
```
**Explicación:**
- Compila tu aplicación
- `-DskipTests` = no ejecuta tests (más rápido)
- `-B` = modo batch (sin mensajes de progreso)
- **Resultado:** Genera un archivo `.jar` ejecutable

```dockerfile
# ========================================
# ETAPA 2: EJECUCIÓN (Runtime)
# ========================================
FROM eclipse-temurin:21-jre-alpine
```
**Explicación:**
- **¡Cambio importante!** Ahora usa JRE (Runtime) en vez de JDK
- JRE = solo ejecutar (más pequeño)
- JDK = compilar + ejecutar (más grande)
- **Resultado:** Imagen final más ligera

```dockerfile
WORKDIR /app

RUN addgroup -S spring && adduser -S spring -G spring
```
**Explicación:**
- Crea un usuario `spring` (no root)
- **Seguridad:** Nunca ejecutes aplicaciones como root en producción

```dockerfile
COPY --from=builder /app/target/*.jar app.jar
```
**Explicación:**
- `--from=builder` = copia desde la etapa anterior
- Solo copia el .jar compilado
- **Resultado:** No incluye código fuente ni Maven en la imagen final

```dockerfile
RUN chown -R spring:spring /app
USER spring
```
**Explicación:**
- Cambia el dueño de los archivos al usuario spring
- Cambia al usuario spring (ya no root)

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -q --spider http://localhost:8080/actuator/health || exit 1
```
**Explicación:**
- Docker revisa cada 30 segundos si tu app está viva
- Llama a `/actuator/health` (endpoint de Spring Boot)
- Si falla, marca el contenedor como unhealthy

```dockerfile
EXPOSE 8080
```
**Explicación:**
- Documenta que tu app usa el puerto 8080
- **Nota:** Es solo documentación, no abre el puerto automáticamente

```dockerfile
ENTRYPOINT ["java", "-jar", "-Djava.security.egd=file:/dev/./urandom", "app.jar"]
```
**Explicación:**
- Comando que se ejecuta al iniciar el contenedor
- `-Djava.security.egd=file:/dev/./urandom` = mejora aleatoriedad en contenedores
- Ejecuta tu aplicación Spring Boot

### 🎨 Patrón Multi-Stage Build

**¿Por qué 2 etapas?**

| Concepto | Etapa Builder | Etapa Runtime |
|----------|---------------|---------------|
| Tamaño | ~300 MB | ~150 MB |
| Contiene | JDK, Maven, código fuente | Solo JRE y .jar |
| Propósito | Compilar | Ejecutar |

**Resultado:** Imagen final 50% más pequeña y segura

---

## 🎼 El docker-compose.yml explicado

### ¿Qué hace docker-compose?
Orquesta 3 contenedores y los conecta entre sí.

### Estructura:

```yaml
version: '3.9'
```
**Explicación:** Versión del formato de docker-compose (3.9 es moderna)

---

### 📦 Servicio 1: PostgreSQL

```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: biblia-postgres
```
**Explicación:**
- Usa imagen oficial de PostgreSQL versión 16
- Nombre del contenedor: `biblia-postgres`

```yaml
    environment:
      POSTGRES_DB: biblia_db
      POSTGRES_USER: biblia_user
      POSTGRES_PASSWORD: biblia_secret_2024
```
**Explicación:**
- Variables de entorno que PostgreSQL lee al iniciar
- Crea automáticamente: base de datos, usuario y contraseña

```yaml
    ports:
      - "5432:5432"
```
**Explicación:**
- `5432:5432` = `PUERTO_TU_PC:PUERTO_CONTENEDOR`
- Ahora puedes conectarte desde tu PC usando `localhost:5432`

```yaml
    volumes:
      - postgres_data:/var/lib/postgresql/data
```
**Explicación:**
- **¡MUY IMPORTANTE!** Persistencia de datos
- Sin esto, si apagas el contenedor, pierdes todos los datos
- `postgres_data` = volumen (disco virtual) que sobrevive a reinicios

```yaml
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U biblia_user -d biblia_db"]
      interval: 10s
      timeout: 5s
      retries: 5
```
**Explicación:**
- Verifica cada 10 segundos si PostgreSQL está listo
- Comando: `pg_isready` (viene con PostgreSQL)
- Reintenta 5 veces antes de marcar como failed
- **¿Por qué?** La API no debe iniciar hasta que la DB esté lista

```yaml
    networks:
      - biblia-network
```
**Explicación:**
- Conecta este contenedor a una red privada
- Solo contenedores en esta red pueden comunicarse

---

### 🚀 Servicio 2: API (Spring Boot)

```yaml
  api:
    build:
      context: .
      dockerfile: Dockerfile
```
**Explicación:**
- **Diferencia con postgres:** No usa imagen pre-hecha, la construye
- `context: .` = usa el directorio actual
- `dockerfile: Dockerfile` = usa el Dockerfile que explicamos antes

```yaml
    environment:
      SPRING_PROFILES_ACTIVE: docker
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/biblia_db
      SPRING_DATASOURCE_USERNAME: biblia_user
      SPRING_DATASOURCE_PASSWORD: biblia_secret_2024
      JWT_SECRET: c3VwZXJTZWNyZXRLZXlGb3JCaWJsaWFBcHBKV1QyMDI0...
```
**Explicación:**
- Sobrescribe configuración del application.yml
- `postgres` en la URL = nombre del servicio (Docker lo resuelve automáticamente)
- **Magia de Docker:** Los contenedores se llaman por nombre, no por IP

```yaml
    depends_on:
      postgres:
        condition: service_healthy
```
**Explicación:**
- **CRÍTICO:** No iniciar la API hasta que PostgreSQL esté `healthy`
- Usa el healthcheck que definimos antes
- Evita errores de "connection refused"

```yaml
    restart: unless-stopped
```
**Explicación:**
- Si la API crashea, Docker la reinicia automáticamente
- `unless-stopped` = no reiniciar si tú la paraste manualmente

---

### 🖥️ Servicio 3: pgAdmin (Opcional)

```yaml
  pgadmin:
    image: dpage/pgadmin4:latest
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@biblia.com
      PGADMIN_DEFAULT_PASSWORD: admin123
    ports:
      - "5050:80"
```
**Explicación:**
- Interfaz web para ver tu base de datos
- Accedes en: `http://localhost:5050`
- Credenciales: admin@biblia.com / admin123

```yaml
    profiles:
      - dev
```
**Explicación:**
- **¡Inteligente!** Solo se levanta si usas: `docker-compose --profile dev up`
- No necesitas pgAdmin en producción
- Ahorra recursos

---

### 🔌 Configuración de red y volúmenes

```yaml
volumes:
  postgres_data:
    driver: local
```
**Explicación:**
- Define el volumen que usa PostgreSQL
- `local` = se guarda en tu disco
- Ubicación: `/var/lib/docker/volumes/` (lo maneja Docker)

```yaml
networks:
  biblia-network:
    driver: bridge
```
**Explicación:**
- Red privada para los 3 contenedores
- `bridge` = red virtual aislada
- Contenedores se ven entre sí, pero están aislados del exterior (seguridad)

---

## 🔄 Cómo funciona todo junto

### Diagrama de flujo:

```
1. Ejecutas: docker-compose up

2. Docker Compose lee docker-compose.yml

3. Crea red: biblia-network

4. Inicia contenedor PostgreSQL:
   ├─ Descarga imagen postgres:16-alpine
   ├─ Crea volumen postgres_data
   ├─ Configura usuario y base de datos
   └─ Ejecuta healthcheck cada 10s

5. Espera a que PostgreSQL esté healthy

6. Construye imagen de la API:
   ├─ Etapa Builder: compila tu aplicación
   └─ Etapa Runtime: crea imagen final ligera

7. Inicia contenedor API:
   ├─ Se conecta a postgres:5432
   ├─ Spring Boot ejecuta Flyway migrations
   └─ Carga esquema y datos iniciales

8. (Si usas --profile dev) Inicia pgAdmin

9. Todo está listo:
   ✅ API: http://localhost:8080/api/v1
   ✅ PostgreSQL: localhost:5432
   ✅ pgAdmin: http://localhost:5050
```

### Comunicación entre contenedores:

```
┌─────────────────────────────────────────┐
│         biblia-network (red)            │
│                                         │
│  ┌──────────────┐    ┌──────────────┐  │
│  │   postgres   │◄───┤     api      │  │
│  │  (puerto     │    │  (Spring     │  │
│  │   5432)      │    │   Boot)      │  │
│  └──────┬───────┘    └──────┬───────┘  │
│         │                    │          │
│         │                    │          │
│  ┌──────▼───────────────────▼───────┐  │
│  │     postgres_data (volumen)      │  │
│  └──────────────────────────────────┘  │
│                                         │
│  ┌──────────────┐                      │
│  │   pgadmin    │──────┐               │
│  │  (puerto 80) │      │               │
│  └──────────────┘      │               │
└────────────────────────┼───────────────┘
                         │
                         ▼
                 Tu navegador
              localhost:5050
```

---

## 📊 Migración de datos (bible_raw.json)

### ¿Se ha movido todo el bible_raw.json a la base de datos?

**Respuesta corta:** ✅ SÍ, ahora toda la Biblia (libros, capítulos y versículos) se importa automáticamente.

### Estrategia de migración:

#### 1️⃣ **Flyway Migrations (Automático)**

**Archivos:**
- `V1__initial_schema.sql` - Crea todas las tablas
- `V2__seed_books.sql` - Inserta los 73 libros de la Biblia

**¿Qué se migra automáticamente?**
```sql
✅ Tabla users (esquema)
✅ Tabla books (73 libros completos)
✅ Tabla chapters (esquema)
✅ Tabla verses (esquema)
```

#### 2️⃣ **Script Python (Automático)**

**Ubicación:** `/scripts/import_bible_data.py`

**¿Qué hace?**

```python
1. Lee bible_raw.json
2. Conecta a PostgreSQL
3. Para cada libro:
   ├─ Para cada capítulo:
   │  ├─ Inserta en tabla chapters
   │  ├─ Crea una sección
   │  └─ Inserta todos los versículos
4. Usa batch inserts (rápido)
```

**Cómo ejecutarlo:**

```bash
# Opción 1: Directo
cd /BibliaBackend/scripts
python3 import_bible_data.py

# Opción 2: Con script helper
./run_import.sh
```

**Estadísticas esperadas:**
```
Libros: 73
Capítulos: ~1,189
Versículos: ~31,102
```

### ¿Qué cambia respecto a versiones anteriores?

- Ya no es necesario cargar datos manualmente ni usar archivos .sql para los versículos.
- Ya no se usan datos de prueba ni migraciones parciales (V3 eliminada).
- El script importa toda la Biblia real, no solo una parte.
- Si ejecutas el script varias veces, asegúrate de que no se dupliquen datos (recomendado limpiar la base de datos antes de reimportar).

### Estructura de datos en PostgreSQL:

```
books (73 filas)
  ├─ id: 'genesis'
  ├─ name: 'Génesis'
  ├─ total_chapters: 50
  └─ ...

chapters (~1,189 filas)
  ├─ id: UUID
  ├─ book_id: 'genesis'
  ├─ chapter_number: 1
  └─ version: 'Biblia de Jerusalén'

sections (~1,189 filas)
  ├─ id: UUID
  ├─ chapter_id: UUID
  ├─ title: ''
  └─ order_index: 1

verses (~31,102 filas)
  ├─ id: UUID
  ├─ section_id: UUID
  ├─ verse_number: 1
  ├─ text: 'En el principio creó Dios...'
  └─ has_note: false
```

---

## 🎯 Conclusión

Esta dockerización te da:

✨ **Simplicidad:** Un comando para todo  
🚀 **Velocidad:** Caché inteligente  
🔒 **Seguridad:** Buenas prácticas  
📦 **Portabilidad:** Funciona en cualquier lado  
🎨 **Flexibilidad:** Fácil de modificar  
📖 **Datos completos:** Toda la Biblia está cargada automáticamente tras ejecutar el script Python

**¿Siguiente paso?**
- Ejecuta el script Python para importar toda la Biblia (solo la primera vez o tras limpiar la base de datos)
- Explora la API con Swagger
- Conecta tu app frontend

---

## 📞 Troubleshooting

### Puerto 5432 ya en uso
```bash
# Detén PostgreSQL local
brew services stop postgresql
# O cambia el puerto en docker-compose.yml
ports:
  - "5433:5432"
```

### La API no conecta a la DB
```bash
# Verifica que postgres esté healthy
docker-compose ps
# Ve logs
docker-compose logs postgres
```

### Cambios no se reflejan
```bash
# Reconstruye la imagen
docker-compose build api
docker-compose up
```

---

**¡Listo!** Ahora entiendes cómo funciona Docker en tu proyecto 🎉
