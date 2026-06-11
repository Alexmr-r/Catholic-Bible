# 🔧 Scripts de Recarga de Backend

## 📋 Descripción

Estos scripts automatizan la recarga del backend cuando haces cambios en el código Java.

---

## 🚀 Scripts Disponibles

### 1. `dev-reload-backend.sh` - Modo Desarrollo

**Cuándo usar:**
- Cambios pequeños en código Java
- Modificaciones en servicios o controladores
- Fixes de bugs

**Qué hace:**
1. ✅ Detiene la API en ejecución
2. ✅ Recompila el código Java
3. ✅ Reinicia la API en local (puerto 8080)
4. ✅ NO afecta la base de datos

**Uso:**
```bash
./dev-reload-backend.sh
```

**Tiempo:** ~10-15 segundos

---

### 2. `prod-reload-backend.sh` - Modo Docker/Producción

**Cuándo usar:**
- Cambios en **Enums** (como `HighlightColor`)
- Cambios en **Modelos de base de datos**
- Cambios en **Configuración de Spring**
- Cambios en **DTOs** o estructura

**Qué hace:**
1. ✅ Libera el puerto 8080
2. ✅ Baja los contenedores Docker
3. ✅ Recompila el código Java
4. ✅ Reconstruye la imagen Docker **sin caché**
5. ✅ Levanta todo de nuevo
6. ✅ Abre Swagger automáticamente

**Uso:**
```bash
./prod-reload-backend.sh
```

**Tiempo:** ~50-60 segundos

---

## 🎯 ¿Cuál usar?

| Tipo de Cambio | Script a Usar |
|----------------|---------------|
| Fix de bug en service | `dev-reload-backend.sh` |
| Nuevo endpoint en controller | `dev-reload-backend.sh` |
| Cambio en lógica de negocio | `dev-reload-backend.sh` |
| **Cambio en enum** | `prod-reload-backend.sh` |
| **Cambio en modelo/entidad** | `prod-reload-backend.sh` |
| **Cambio en DTO** | `prod-reload-backend.sh` |
| **Cambio en configuración** | `prod-reload-backend.sh` |

---

## 📊 Flujo de Trabajo Recomendado

### Desarrollo Rápido
```bash
# 1. Hacer cambios en código Java
# 2. Recargar backend
./dev-reload-backend.sh

# 3. Recarga la app en el móvil
# (Ctrl+C en Expo y volver a npm start si es necesario)
```

### Cambios Estructurales
```bash
# 1. Hacer cambios en enums/modelos/DTOs
# 2. Reconstruir en Docker
./prod-reload-backend.sh

# 3. Recarga la app en el móvil
```

---

## 🔍 Ver Logs

### Logs en Modo Desarrollo
```bash
tail -f .dev-state/api.log
```

### Logs en Docker
```bash
# API
docker-compose -f BibliaBackend/docker-compose.yml logs -f api

# PostgreSQL
docker-compose -f BibliaBackend/docker-compose.yml logs -f postgres
```

---

## 🛑 Detener Todo

### Detener Modo Desarrollo
```bash
./dev-stop.sh
```

### Detener Docker
```bash
cd BibliaBackend
docker-compose down
```

---

## ⚠️ Notas Importantes

1. **Puerto 8080:** Los scripts matan automáticamente procesos que usen este puerto.

2. **Base de datos:** Estos scripts NO afectan los datos en PostgreSQL.

3. **Caché de Docker:** `prod-reload-backend.sh` usa `--no-cache` para forzar rebuild.

4. **Primera vez:** Si es la primera vez, usa `dev-start.sh` que ejecuta migraciones.

---

## 🆘 Solución de Problemas

### Error: "port 8080 already in use"
```bash
# Matar manualmente el proceso
lsof -i :8080
kill -9 <PID>

# Luego ejecuta el script de nuevo
```

### Error: "Docker daemon not running"
```bash
# Abre Docker Desktop
# Espera a que el icono deje de parpadear
# Ejecuta el script de nuevo
```

### Error: "BUILD FAILURE"
```bash
# Verifica errores en el código Java
# Revisa que Java 21 esté instalado
java -version
```

---

## 📚 Scripts Relacionados

| Script | Descripción |
|--------|-------------|
| `dev-start.sh` | Inicia todo desde cero (primera vez) |
| `dev-stop.sh` | Detiene todos los servicios |
| `dev-reload-backend.sh` | ⭐ Recarga backend en desarrollo |
| `prod-reload-backend.sh` | ⭐ Reconstruye backend en Docker |
| `prod-start.sh` | Inicia en modo producción |

---

## ✨ Ejemplo de Uso Real

### Escenario: Cambiaste los colores de HighlightColor

```bash
# 1. Editaste HighlightColor.java
# 2. Ejecuta:
./prod-reload-backend.sh

# Espera ~50 segundos
# ✅ Swagger se abre automáticamente
# ✅ Recarga tu app móvil
# ✅ Los nuevos colores ya están disponibles
```

---

**¡Listo para automatizar tu desarrollo!** 🚀

