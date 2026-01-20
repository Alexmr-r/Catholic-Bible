# 🚀 Scripts de Gestión - Biblia Católica

## 📋 Resumen

Este proyecto incluye scripts automatizados para facilitar el desarrollo y despliegue.

```
Scripts disponibles:
├── 🧪 Desarrollo (Local)
│   ├── dev-start.sh          ← Inicia todo (DB + API local + Frontend)
│   ├── dev-reload-api.sh     ← Solo recarga API (cambios de código)
│   └── dev-stop.sh           ← Detiene todo
│
└── 🚀 Producción (Docker)
    ├── prod-start.sh         ← Inicia todo en Docker
    ├── prod-reload-api.sh    ← Solo recarga API (cambios de código)
    └── prod-stop.sh          ← Detiene Docker
```

---

## 🧪 Modo Desarrollo

### Características:
- ✅ PostgreSQL en Docker (persistente)
- ✅ API en local con **hot-reload** (cambios instantáneos)
- ✅ Frontend Expo en local
- ✅ Migraciones automáticas (solo primera vez)
- ✅ Import Bible data automático (solo primera vez)

### 1️⃣ Iniciar desarrollo

```bash
./dev-start.sh
```

**¿Qué hace?**
```
1. Verifica dependencias (Docker, Java, Node, Python)
2. Levanta PostgreSQL en Docker
3. Primera vez:
   ├─ Ejecuta migraciones Flyway
   └─ Importa 31,102 versículos
4. Inicia API en local (hot-reload activado)
5. Inicia Frontend Expo
6. Abre Swagger en el navegador
```

**Tiempo estimado:**
- Primera vez: 3-4 minutos
- Siguientes veces: 30 segundos

**URLs disponibles:**
- API: http://localhost:8080/api/v1
- Swagger: http://localhost:8080/api/v1/swagger-ui.html
- Frontend: Expo Go en tu móvil

### 2️⃣ Recargar API (cuando cambies código)

```bash
./dev-reload-api.sh
```

**¿Cuándo usarlo?**
- Modificaste un Controller
- Modificaste un Service
- Modificaste application.yml
- Añadiste una dependencia en pom.xml

**¿Qué hace?**
```
1. Detiene API actual
2. Recompila el código
3. Reinicia API
4. NO toca PostgreSQL
5. NO toca Frontend
6. Datos intactos ✅
```

**Tiempo:** 30-40 segundos

**💡 Nota:** Con Spring DevTools activado, muchos cambios se recargan solos sin necesidad de este script.

### 3️⃣ Detener desarrollo

```bash
./dev-stop.sh
```

**¿Qué hace?**
- Detiene API
- Detiene Frontend
- Pregunta si quieres detener PostgreSQL

**💡 Tip:** Deja PostgreSQL corriendo para inicios más rápidos.

---

## 🚀 Modo Producción

### Características:
- ✅ Todo en Docker (API + PostgreSQL)
- ✅ Imágenes optimizadas
- ✅ Persistencia de datos
- ✅ Listo para deploy

### 1️⃣ Iniciar producción

```bash
./prod-start.sh
```

**¿Qué hace?**
```
1. Verifica Docker
2. Construye imagen de la API
3. Levanta PostgreSQL y API en Docker
4. Primera vez:
   ├─ Flyway ejecuta migraciones automáticamente
   └─ Importa 31,102 versículos
5. Abre Swagger en el navegador
```

**Tiempo estimado:**
- Primera vez: 5-6 minutos
- Siguientes veces: 2-3 minutos

**URLs disponibles:**
- API: http://localhost:8080/api/v1
- Swagger: http://localhost:8080/api/v1/swagger-ui.html
- pgAdmin (opcional): http://localhost:5050

### 2️⃣ Recargar API (cuando cambies código)

```bash
./prod-reload-api.sh
```

**¿Cuándo usarlo?**
- Modificaste código Java
- Modificaste application.yml
- Añadiste dependencias

**¿Qué hace?**
```
1. Reconstruye SOLO imagen de la API
2. Recrea contenedor de la API
3. NO toca PostgreSQL
4. Datos intactos ✅
```

**Tiempo:** 2-3 minutos

### 3️⃣ Detener producción

```bash
./prod-stop.sh
```

**Opciones:**
1. **Detener contenedores** (mantener datos)
   - Rápido reinicio
   - Datos intactos

2. **Detener y eliminar contenedores** (mantener datos)
   - Limpia contenedores
   - Datos en volumen intactos

3. **Eliminar TODO** ⚠️ (incluyendo datos)
   - Reinicio desde cero
   - Pierdes usuarios, favoritos, etc.

---

## 📊 Comparación: Desarrollo vs Producción

| Aspecto | Desarrollo | Producción |
|---------|-----------|-----------|
| **API** | Local (hot-reload) | Docker |
| **PostgreSQL** | Docker | Docker |
| **Frontend** | Expo local | Manual |
| **Tiempo inicio** | 30 seg | 2-3 min |
| **Reload API** | 30 seg | 2-3 min |
| **Cambios código** | Instantáneos | Rebuild necesario |
| **Ideal para** | Desarrollo diario | Testing/Deploy |

---

## 🎯 Casos de uso

### Caso 1: Desarrollo diario

```bash
# Día 1: Setup inicial
./dev-start.sh

# Desarrollar:
# - Editar código en IntelliJ
# - Guardar (Cmd+S)
# - Spring Boot recarga automáticamente ✅
# - Probar en Swagger

# Fin del día
./dev-stop.sh

# Día 2: Continuar
./dev-start.sh  # ← Solo 30 segundos
```

### Caso 2: Cambios grandes en la API

```bash
# Estás desarrollando
# Haces cambios en múltiples archivos
# Spring DevTools no recarga correctamente

./dev-reload-api.sh  # ← Recompila todo
```

### Caso 3: Testing antes de deploy

```bash
# Quieres probar exactamente como en producción
./prod-start.sh

# Probar todo
# Si encuentras un bug, modificas código

./prod-reload-api.sh  # ← Aplica cambios
```

### Caso 4: Deploy a servidor

```bash
# En tu servidor:
git pull
./prod-start.sh

# Actualizar después de un commit:
git pull
./prod-reload-api.sh
```

---

## 🧠 Entendiendo el flujo

### Primera vez (desarrollo):

```
./dev-start.sh
      ↓
┌─────────────────────────────┐
│ PostgreSQL (Docker)         │
│   ↓                         │
│ Flyway ejecuta:             │
│   V1: Crea tablas           │
│   V2: Inserta 73 libros     │
│   V3: Datos de ejemplo      │
│   ↓                         │
│ Script Python:              │
│   Importa 31,102 versículos │
│   ↓                         │
│ Marca: .dev-state/          │
│   migrations_done ✅        │
│   bible_imported ✅         │
└─────────────────────────────┘
      ↓
┌─────────────────────────────┐
│ API en local                │
│   Hot-reload activado       │
└─────────────────────────────┘
      ↓
┌─────────────────────────────┐
│ Frontend Expo               │
│   Conecta a localhost:8080  │
└─────────────────────────────┘
```

### Segunda vez (desarrollo):

```
./dev-start.sh
      ↓
┌─────────────────────────────┐
│ PostgreSQL (Docker)         │
│   Ya tiene datos ✅         │
│   NO ejecuta migraciones    │
│   NO importa Bible          │
└─────────────────────────────┘
      ↓
┌─────────────────────────────┐
│ API en local                │
│   Inicia directo            │
└─────────────────────────────┘
      ↓
TODO LISTO EN 30 SEGUNDOS
```

### Cambios de código:

```
Modificas Controller.java
      ↓
./dev-reload-api.sh
      ↓
┌─────────────────────────────┐
│ Detiene API                 │
│ Recompila                   │
│ Reinicia API                │
└─────────────────────────────┘
      ↓
PostgreSQL: Intacto ✅
Frontend: Intacto ✅
Datos: Intactos ✅
```

---

## 📁 Archivos de estado

Los scripts guardan estado en carpetas ocultas:

```
.dev-state/              ← Modo desarrollo
├── migrations_done      ← Migraciones ejecutadas
├── bible_imported       ← Bible data importado
├── api.pid             ← PID de la API
├── expo.pid            ← PID de Expo
├── api.log             ← Logs de la API
└── expo.log            ← Logs de Expo

.prod-state/             ← Modo producción
├── migrations_done
└── bible_imported
```

**Borrar estado:**
```bash
# Desarrollo
rm -rf .dev-state

# Producción
rm -rf .prod-state

# Siguiente inicio será como "primera vez"
```

---

## 🔧 Personalización

### Cambiar puerto de la API

Edita `BibliaBackend/src/main/resources/application.yml`:
```yaml
server:
  port: 3000  # ← Cambiar aquí
```

### Cambiar configuración de PostgreSQL

Edita `BibliaBackend/docker-compose.yml`:
```yaml
postgres:
  environment:
    POSTGRES_PASSWORD: nueva_password  # ← Cambiar aquí
  ports:
    - "5433:5432"  # ← Cambiar puerto externo
```

### Añadir más servicios Docker

Edita `BibliaBackend/docker-compose.yml`:
```yaml
services:
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
```

---

## 🆘 Troubleshooting

### Problema: Puerto 8080 en uso

```bash
# Opción 1: Matar proceso
lsof -i :8080
kill -9 <PID>

# Opción 2: Cambiar puerto
# Edita application.yml: server.port
```

### Problema: Script no tiene permisos

```bash
chmod +x dev-start.sh
chmod +x dev-reload-api.sh
chmod +x dev-stop.sh
chmod +x prod-start.sh
chmod +x prod-reload-api.sh
chmod +x prod-stop.sh
```

### Problema: Migraciones fallaron

```bash
# Desarrollo
rm -rf .dev-state
docker-compose -f BibliaBackend/docker-compose.yml down -v
./dev-start.sh

# Producción
rm -rf .prod-state
cd BibliaBackend && docker-compose down -v
./prod-start.sh
```

### Problema: API no recarga cambios

```bash
# Desarrollo
./dev-reload-api.sh

# Producción
./prod-reload-api.sh
```

### Problema: Frontend no conecta a API

Verifica `BibliaAppExpo/src/services/config.ts`:
```typescript
export const API_URL = 'http://localhost:8080/api/v1';
```

Para dispositivo móvil, usa tu IP local:
```typescript
export const API_URL = 'http://192.168.1.X:8080/api/v1';
```

---

## 💡 Tips y mejores prácticas

### 1. Desarrollo diario
```bash
# Usa modo desarrollo (más rápido)
./dev-start.sh

# Deja PostgreSQL corriendo entre sesiones
# (no lo detengas con dev-stop.sh)
```

### 2. Testing de features
```bash
# Usa producción para probar como en deploy
./prod-start.sh
```

### 3. Hot-reload no funciona
```bash
# Recarga manual
./dev-reload-api.sh
```

### 4. Backup antes de cambios grandes
```bash
# Exportar datos
docker-compose -f BibliaBackend/docker-compose.yml exec postgres \
  pg_dump -U biblia_user biblia_db > backup.sql

# Restaurar después
docker-compose -f BibliaBackend/docker-compose.yml exec -T postgres \
  psql -U biblia_user biblia_db < backup.sql
```

### 5. Ver logs en tiempo real
```bash
# Desarrollo
tail -f .dev-state/api.log

# Producción
docker-compose -f BibliaBackend/docker-compose.yml logs -f api
```

---

## 📚 Documentación adicional

- **Dockerización:** `BibliaBackend/EXPLICACION_DOCKERIZACION.md`
- **Migraciones:** `BibliaBackend/COMO_FUNCIONA_DOCKER_Y_MIGRACIONES.md`
- **FAQ:** `BibliaBackend/FAQ_SWAGGER_Y_DATOS.md`
- **Índice completo:** `BibliaBackend/INDICE_DOCUMENTACION.md`

---

## 🎉 Resumen

| Comando | ¿Para qué? |
|---------|-----------|
| `./dev-start.sh` | Desarrollo: DB Docker + API local + Frontend |
| `./dev-reload-api.sh` | Desarrollo: Recargar solo API |
| `./dev-stop.sh` | Desarrollo: Detener todo |
| `./prod-start.sh` | Producción: Todo en Docker |
| `./prod-reload-api.sh` | Producción: Recargar solo API |
| `./prod-stop.sh` | Producción: Detener Docker |

**Regla de oro:**
- 🔨 Cambios en CÓDIGO → Usar script `reload-api`
- 💾 Cambios en DATOS → No hacer nada (persisten automáticamente)

---

¡Listo para desarrollar! 🚀

