# 📖 Biblia Católica - Full Stack Application

## 🚀 Inicio Rápido

### Modo Desarrollo (Recomendado para programar):
```bash
./dev-start.sh
```
**Resultado:** PostgreSQL en Docker + API local con hot-reload + Frontend Expo

### Modo Producción (Para testing/deploy):
```bash
./prod-start.sh
```
**Resultado:** Todo en Docker (PostgreSQL + API)

---

## 📚 Documentación Completa

### 🎯 Empezar aquí:
1. **[SCRIPTS_README.md](./SCRIPTS_README.md)** - Guía de todos los scripts disponibles
2. **[DIAGRAMA_SCRIPTS.md](./DIAGRAMA_SCRIPTS.md)** - Diagramas visuales de qué hace cada script
3. **[IMPORTACION_BIBLIA_COMPLETA.md](./IMPORTACION_BIBLIA_COMPLETA.md)** - Cómo se importan los 31,102 versículos

### 📖 Backend:
- **[BibliaBackend/docs/INDICE_DOCUMENTACION.md](./BibliaBackend/docs/INDICE_DOCUMENTACION.md)** - Índice completo de documentación
- **[BibliaBackend/docs/ARQUITECTURA_BACKEND.md](./BibliaBackend/docs/ARQUITECTURA_BACKEND.md)** - Arquitectura Hexagonal explicada
- **[BibliaBackend/docs/CLASES_DETALLADAS.md](./BibliaBackend/docs/CLASES_DETALLADAS.md)** - Explicación de cada clase Java
- **[BibliaBackend/docs/EXPLICACION_DOCKERIZACION.md](./BibliaBackend/docs/EXPLICACION_DOCKERIZACION.md)** - Docker explicado desde cero
- **[BibliaBackend/docs/FAQ_SWAGGER_Y_DATOS.md](./BibliaBackend/docs/FAQ_SWAGGER_Y_DATOS.md)** - Preguntas frecuentes
- **[BibliaBackend/docs/CHEAT_SHEET.md](./BibliaBackend/docs/CHEAT_SHEET.md)** - Hoja de referencia rápida

---

## 🎯 Scripts Disponibles

| Script | ¿Para qué? | Tiempo |
|--------|-----------|--------|
| `./dev-start.sh` | Desarrollo: DB Docker + API local + Frontend | 30 seg |
| `./dev-reload-api.sh` | Recargar API (cambios de código) | 30 seg |
| `./dev-stop.sh` | Detener desarrollo | Instantáneo |
| `./prod-start.sh` | Producción: Todo en Docker | 2-3 min |
| `./prod-reload-api.sh` | Recargar API en Docker | 2-3 min |
| `./prod-stop.sh` | Detener producción | Instantáneo |

---

## 📊 Estructura del Proyecto

```
Biblia/
├── 📜 Scripts de gestión
│   ├── dev-start.sh          ← Iniciar desarrollo
│   ├── dev-reload-api.sh     ← Recargar API (desarrollo)
│   ├── dev-stop.sh           ← Detener desarrollo
│   ├── prod-start.sh         ← Iniciar producción
│   ├── prod-reload-api.sh    ← Recargar API (producción)
│   └── prod-stop.sh          ← Detener producción
│
├── 📖 Documentación
│   ├── SCRIPTS_README.md     ← Guía de scripts
│   ├── DIAGRAMA_SCRIPTS.md   ← Diagramas visuales
│   └── IMPORTACION_BIBLIA_COMPLETA.md
│
├── 🔧 BibliaBackend/         ← API Spring Boot
│   ├── docker-compose.yml    ← Configuración Docker
│   ├── Dockerfile            ← Imagen de la API
│   ├── pom.xml               ← Dependencias Maven
│   ├── src/
│   │   └── main/
│   │       ├── java/         ← Código Java
│   │       └── resources/
│   │           ├── application.yml
│   │           └── db/migration/
│   │               ├── V1__initial_schema.sql
│   │               └── V2__seed_books.sql
│   └── scripts/
│       └── import_bible_data.py  ← Importa 31,102 versículos
│
└── 📱 BibliaAppExpo/         ← Frontend React Native
    ├── package.json
    ├── App.tsx
    ├── bible_raw.json        ← 73 libros, 31,102 versículos
    └── src/
        ├── components/
        ├── screens/
        ├── navigation/
        └── services/

📁 .dev-state/                ← Estado de desarrollo (ignorado por git)
📁 .prod-state/               ← Estado de producción (ignorado por git)
```

---

## 🔍 ¿Qué hace cada parte?

### Backend (Spring Boot):
- **API REST** en puerto 8080
- **PostgreSQL** en Docker (puerto 5432)
- **Flyway** para migraciones automáticas
- **JWT** para autenticación
- **Swagger** para documentación

### Frontend (React Native + Expo):
- **Expo Go** para desarrollo móvil
- **React Navigation** para navegación
- **Conexión a API** en localhost:8080

### Base de Datos:
- **73 libros** de la Biblia Católica
- **1,189 capítulos**
- **31,102 versículos**
- **Persistencia** en volumen Docker

---

## 📖 Datos de la Biblia

### ¿De dónde vienen?

**Archivo:** `BibliaAppExpo/bible_raw.json` (10 MB)

**Contenido:**
- Traducción: Biblia de Jerusalén
- 73 libros completos
- Todos los capítulos y versículos

### ¿Cómo se importan?

**Automáticamente** la primera vez que ejecutas `dev-start.sh` o `prod-start.sh`

**Proceso:**
1. Flyway crea las tablas (V1)
2. Flyway inserta los 73 libros (V2)
3. Script Python importa los 31,102 versículos
4. Se marca como completado (no se repite)

**Ver más:** [IMPORTACION_BIBLIA_COMPLETA.md](./IMPORTACION_BIBLIA_COMPLETA.md)

---

## 🧪 Primeros pasos

### 1. Verificar dependencias

```bash
# Necesitas tener instalado:
docker --version          # Docker 20+
docker-compose --version  # Docker Compose 2+
java -version             # Java 21
node --version            # Node.js 18+
python3 --version         # Python 3.8+
```

### 2. Iniciar en modo desarrollo

```bash
# Dar permisos (solo primera vez)
chmod +x *.sh

# Iniciar todo
./dev-start.sh
```

**Espera 3-4 minutos la primera vez** (compilación + importación de datos)

### 3. Verificar que funciona

**URLs disponibles:**
- API: http://localhost:8080/api/v1
- Swagger: http://localhost:8080/api/v1/swagger-ui.html
- Health: http://localhost:8080/api/v1/actuator/health

**Probar:**
```bash
# Health check
curl http://localhost:8080/api/v1/actuator/health

# Obtener libros
curl http://localhost:8080/api/v1/books

# Registrar usuario
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!",
    "fullName": "Test User"
  }'
```

### 4. Abrir frontend

```bash
# El frontend ya está corriendo (Expo)
# Abre la app "Expo Go" en tu móvil
# Escanea el QR que aparece en la terminal
```

---

## 🔄 Workflow de desarrollo

### Día a día:

```bash
# Inicio del día
./dev-start.sh

# Desarrollar:
# - Editas código en IntelliJ
# - Guardas (Cmd+S)
# - Spring Boot recarga automáticamente ✅

# Fin del día
./dev-stop.sh
```

### Si cambias mucho código:

```bash
# Si hot-reload no funciona bien
./dev-reload-api.sh
```

### Para probar como en producción:

```bash
./prod-start.sh
```

---

## 🆘 Solución de problemas

### Puerto 8080 ya en uso
```bash
lsof -i :8080
kill -9 <PID>
```

### No veo Swagger
```bash
# 1. Verificar que la API está corriendo
curl http://localhost:8080/api/v1/actuator/health

# 2. Abrir navegador
open http://localhost:8080/api/v1/swagger-ui.html
```

### Los datos no persisten
```bash
# Verificar volumen de PostgreSQL
docker volume ls | grep postgres

# Si eliminaste el volumen por error:
./prod-start.sh  # Reimporta todo
```

### Script Python falla
```bash
# Instalar dependencia
pip3 install psycopg2-binary

# Ejecutar manualmente
cd BibliaBackend/scripts
python3 import_bible_data.py
```

### Resetear todo desde cero
```bash
# Detener servicios
./dev-stop.sh
./prod-stop.sh

# Eliminar estado
rm -rf .dev-state .prod-state

# Eliminar volumen Docker
cd BibliaBackend
docker-compose down -v

# Iniciar de nuevo
cd ..
./dev-start.sh
```

---

## 📚 Documentación adicional

### General:
- [SCRIPTS_README.md](./SCRIPTS_README.md) - Guía completa de scripts
- [DIAGRAMA_SCRIPTS.md](./DIAGRAMA_SCRIPTS.md) - Diagramas visuales
- [IMPORTACION_BIBLIA_COMPLETA.md](./IMPORTACION_BIBLIA_COMPLETA.md) - Importación de datos

### Backend:
- [BibliaBackend/docs/INDICE_DOCUMENTACION.md](./BibliaBackend/docs/INDICE_DOCUMENTACION.md) - Índice completo
- [BibliaBackend/docs/ARQUITECTURA_BACKEND.md](./BibliaBackend/docs/ARQUITECTURA_BACKEND.md) - Arquitectura Hexagonal
- [BibliaBackend/docs/CLASES_DETALLADAS.md](./BibliaBackend/docs/CLASES_DETALLADAS.md) - Cada clase explicada
- [BibliaBackend/docs/EXPLICACION_DOCKERIZACION.md](./BibliaBackend/docs/EXPLICACION_DOCKERIZACION.md) - Docker desde cero
- [BibliaBackend/docs/FAQ_SWAGGER_Y_DATOS.md](./BibliaBackend/docs/FAQ_SWAGGER_Y_DATOS.md) - FAQ
- [BibliaBackend/docs/CHEAT_SHEET.md](./BibliaBackend/docs/CHEAT_SHEET.md) - Referencia rápida

---

## 🎯 Resumen

```
✅ Script Python importa TODO el JSON (31,102 versículos)
✅ V3 (datos de prueba) eliminado
✅ Migraciones automáticas (Flyway)
✅ Hot-reload en desarrollo
✅ Persistencia de datos
✅ Documentación completa
```

---

## 💡 Tips

1. **Usa modo desarrollo** para programar (más rápido)
2. **Deja PostgreSQL corriendo** entre sesiones
3. **Swagger** solo funciona con API corriendo
4. **Datos persisten** automáticamente
5. **Rebuild** solo cuando cambias código, no datos

---

## 📞 Enlaces útiles

- **Swagger:** http://localhost:8080/api/v1/swagger-ui.html
- **Health Check:** http://localhost:8080/api/v1/actuator/health
- **pgAdmin (dev):** http://localhost:5050

---

¡Listo para desarrollar! 🚀

**Última actualización:** 17 de enero, 2026

