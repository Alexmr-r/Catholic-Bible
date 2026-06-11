# 🆘 Solución Rápida de Problemas

## ❌ Error: "Cannot connect to the Docker daemon"

### Síntoma:
```
❌ Docker no está corriendo
Cannot connect to the Docker daemon at unix:///Users/mrrobot/.docker/run/docker.sock
```

### Causa:
Docker Desktop no está iniciado en tu Mac.

### Solución:

#### 1. Abre Docker Desktop
```
1. Presiona Cmd + Espacio (Spotlight)
2. Escribe: "Docker"
3. Presiona Enter para abrir Docker Desktop
```

O desde el Finder:
```
Aplicaciones → Docker.app
```

#### 2. Espera a que inicie
Verás el **icono de Docker** en la barra superior de tu Mac (junto al reloj).

**Espera hasta que:**
- El icono deje de parpadear/animarse
- Se muestre como un icono estático de ballena

Esto puede tardar **30-60 segundos**.

#### 3. Verifica que funciona
```bash
docker ps
```

**Debe mostrar:**
```
CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES
```

Si ves esto (aunque esté vacío), Docker está funcionando ✅

#### 4. Ejecuta el script de nuevo
```bash
./dev-start.sh
```

---

## ⚠️ Advertencia del docker-compose.yml

### Síntoma:
```
WARN[0000] /Users/.../docker-compose.yml: the attribute `version` is obsolete
```

### Causa:
Docker Compose 2.x ya no necesita la línea `version: '3.9'`

### ¿Es grave?
❌ **NO - Es solo una advertencia**

La aplicación funciona perfectamente. Es solo informativo.

### Solución (opcional):
Si quieres eliminar la advertencia, edita `BibliaBackend/docker-compose.yml`:

```yaml
# Elimina esta línea:
version: '3.9'

# El archivo debe empezar directamente con:
services:
  postgres:
    ...
```

---

## 🐳 Comandos útiles de Docker

### Ver si Docker está corriendo:
```bash
docker ps
```

### Iniciar Docker Desktop desde terminal:
```bash
open -a Docker
```

### Ver logs de Docker Desktop:
```bash
# Si Docker falla al iniciar
~/Library/Containers/com.docker.docker/Data/log/host/
```

### Reiniciar Docker Desktop:
```bash
# 1. Cerrar
osascript -e 'quit app "Docker"'

# 2. Esperar 5 segundos

# 3. Abrir
open -a Docker
```

---

## 📝 Checklist antes de ejecutar scripts

Antes de ejecutar `./dev-start.sh` o `./prod-start.sh`, verifica:

- [ ] Docker Desktop está instalado
- [ ] Docker Desktop está abierto (icono visible en barra superior)
- [ ] El icono de Docker NO está animándose
- [ ] `docker ps` funciona sin errores
- [ ] Tienes al menos 4 GB de RAM libres
- [ ] Tienes al menos 10 GB de espacio en disco

---

## 🔧 Otros problemas comunes

### Error: "port 8080 already in use"
```bash
# Ver qué está usando el puerto
lsof -i :8080

# Matar el proceso
kill -9 <PID>
```

### Error: "port 5432 already in use"
```bash
# Si tienes PostgreSQL local instalado
brew services stop postgresql

# O verifica qué usa el puerto
lsof -i :5432
```

### Error: Java no encontrado
```bash
# Instalar Java 21
brew install openjdk@21

# Agregar a PATH
echo 'export PATH="/opt/homebrew/opt/openjdk@21/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### Error: Python3 no encontrado
```bash
# Instalar Python
brew install python3
```

### Error: Node no encontrado
```bash
# Instalar Node.js
brew install node
```

---

## 🚀 Flujo recomendado

### Primera vez en el día:

```bash
# 1. Abrir Docker Desktop
open -a Docker

# 2. Esperar 1 minuto (tomar café ☕)

# 3. Verificar
docker ps

# 4. Ejecutar script
./dev-start.sh
```

### Si Docker ya está corriendo:

```bash
# Ejecutar directamente
./dev-start.sh
```

---

## 💡 Tips

1. **Deja Docker Desktop corriendo** durante el día
   - Consume ~2 GB de RAM
   - Hace que los scripts inicien más rápido

2. **Configura Docker para iniciar automáticamente**
   - Docker Desktop → Preferencias → General
   - ✅ "Start Docker Desktop when you log in"

3. **Si Docker está lento:**
   - Docker Desktop → Preferencias → Resources
   - Aumenta CPUs a 4
   - Aumenta Memory a 4 GB

---

## 📞 Si nada funciona

1. **Reinicia Docker Desktop:**
   ```bash
   osascript -e 'quit app "Docker"'
   sleep 5
   open -a Docker
   ```

2. **Reinicia tu Mac:**
   - A veces Docker se queda en un estado extraño
   - Un reinicio limpio lo soluciona

3. **Reinstala Docker Desktop:**
   - Descarga de: https://www.docker.com/products/docker-desktop
   - Desinstala el actual
   - Instala de nuevo

---

**Última actualización:** 17 de enero, 2026

