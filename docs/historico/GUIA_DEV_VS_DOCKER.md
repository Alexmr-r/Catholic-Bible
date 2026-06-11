# 🔧 Guía: ¿Cuándo usar dev-start.sh vs Docker manual?

## 🎯 El Problema

Has experimentado un **conflicto** porque:
- `dev-start.sh` levanta la API **en modo local** (puerto 8080)
- `docker-compose up` levanta la API **en Docker** (puerto 8080)
- **Ambos compiten por el mismo puerto** → ERROR

---

## ✅ Solución: Usa SOLO UNO a la vez

### Opción 1: Modo Desarrollo (RECOMENDADO para ti)

**Cuándo usar:**
- Desarrollo diario
- Cambios frecuentes en código
- Quieres hot-reload automático

**Comando:**
```bash
./dev-start.sh
```

**Qué hace:**
1. ✅ Levanta PostgreSQL en Docker
2. ✅ Levanta API en **modo local** (puerto 8080)
3. ✅ Levanta Expo
4. ✅ **AHORA:** Detecta y apaga automáticamente contenedores Docker de la API

**Ventajas:**
- Hot-reload automático
- Logs en pantalla
- Fácil de depurar

---

### Opción 2: Modo Docker (Solo para cambios estructurales)

**Cuándo usar:**
- Cambiaste **enums** (como HighlightColor)
- Cambiaste **modelos de base de datos**
- Quieres probar en ambiente "producción-like"

**Comando:**
```bash
./prod-reload-backend.sh
```

**Qué hace:**
1. ✅ Baja contenedores actuales
2. ✅ Recompila backend
3. ✅ Reconstruye imagen Docker **sin caché**
4. ✅ Levanta PostgreSQL + API en Docker

---

## 🚫 NO HAGAS ESTO (Lo que causó el problema)

```bash
# ❌ NO mezcles ambos modos:
./dev-start.sh              # Levanta API en local
# Y luego...
cd BibliaBackend
docker-compose up -d        # Intenta levantar API en Docker
# → CONFLICTO en puerto 8080
```

---

## ✅ Flujo de Trabajo Correcto

### Para Desarrollo Diario:

```bash
# 1. Abre Docker Desktop (para PostgreSQL)
# 2. Ejecuta:
./dev-start.sh

# 3. Haz tus cambios en código Java/TypeScript
# 4. El hot-reload se encarga del resto

# 5. Para detener:
./dev-stop.sh
```

---

### Para Cambios Estructurales (Enums, Modelos):

```bash
# 1. Haz tus cambios en Java
# 2. Ejecuta:
./prod-reload-backend.sh

# 3. Espera ~50 segundos
# 4. Recarga tu app móvil

# 5. Si quieres volver a desarrollo:
cd BibliaBackend
docker-compose down
./dev-start.sh
```

---

## 🔍 ¿Cómo saber qué está corriendo?

### Ver si la API está en Docker:
```bash
docker ps | grep biblia-api
```
- Si aparece → API en Docker
- Si no aparece → API en local (o no está corriendo)

### Ver si la API está en local:
```bash
lsof -i :8080
```
- Si aparece `java` → API en local
- Si aparece `com.docker` → API en Docker

---

## 🛠️ Arreglo Aplicado al Script

He modificado `dev-start.sh` para que:

```bash
# Antes de levantar la API en local:
1. ✅ Detecta si hay un contenedor Docker de la API
2. ✅ Lo detiene y elimina automáticamente
3. ✅ Libera el puerto 8080
4. ✅ Levanta la API en modo local
```

**Resultado:** Ahora `dev-start.sh` es más robusto y **no falla** aunque hayas ejecutado Docker manualmente antes.

---

## 📋 Resumen de Scripts

| Script | Modo | API | PostgreSQL | Cuándo Usar |
|--------|------|-----|------------|-------------|
| `dev-start.sh` | Desarrollo | Local (hot-reload) | Docker | **Desarrollo diario** |
| `dev-reload-backend.sh` | Desarrollo | Local (recarga) | Docker | Cambios pequeños en Java |
| `prod-reload-backend.sh` | Docker | Docker | Docker | **Cambios estructurales** |
| `prod-start.sh` | Producción | Docker | Docker | Producción |

---

## 💡 Consejo Final

Para tu día a día:

1. **Abre Docker Desktop** (para PostgreSQL)
2. **Ejecuta `./dev-start.sh`** (una sola vez al día)
3. **Haz tus cambios**
4. **Hot-reload automático** se encarga

Solo usa `prod-reload-backend.sh` cuando cambies enums o modelos de BD.

---

## 🆘 Si Algo Falla

```bash
# Resetear todo:
./dev-stop.sh
cd BibliaBackend
docker-compose down
cd ..
./dev-start.sh
```

---

**El script ahora es más inteligente y evita estos conflictos automáticamente** ✨

