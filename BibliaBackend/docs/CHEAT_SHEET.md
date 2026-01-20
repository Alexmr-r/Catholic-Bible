# 📋 Cheat Sheet - Biblia API

## 🚀 Quick Start

```bash
# Levantar todo
docker-compose up

# Esperar mensaje:
"Started BibliaApplication in X seconds"

# Abrir navegador:
http://localhost:8080/api/v1/swagger-ui.html
```

---

## ✅ URLs Importantes

| URL | ¿Para qué? |
|-----|-----------|
| http://localhost:8080/api/v1/swagger-ui.html | 📖 Swagger (Documentación) |
| http://localhost:8080/api/v1/actuator/health | ✅ Health Check |
| http://localhost:8080/api/v1/books | 📚 Obtener libros |
| http://localhost:5050 | 🖥️ pgAdmin (profile dev) |

---

## 🔄 ¿Cuándo necesito rebuild?

### ✅ SÍ necesitas rebuild:
```bash
# Modificaste:
- ❌ Archivos .java (Controllers, Services, etc.)
- ❌ application.yml
- ❌ pom.xml (dependencias)

# Comando:
docker-compose up --build
```

### ❌ NO necesitas rebuild:
```bash
# Ocurrió:
- ✅ Usuario se registró
- ✅ Usuario añadió favorito
- ✅ Usuario hizo login
- ✅ Cualquier INSERT/UPDATE en DB

# Comando:
NADA - los datos ya están guardados
```

---

## 💾 Persistencia de datos

```bash
# ✅ Datos persisten:
docker-compose down
docker-compose restart
docker-compose up --build
Reiniciar tu Mac

# ❌ Datos se borran:
docker-compose down -v  ← ⚠️ CUIDADO
```

---

## 📊 Comandos útiles

### Ver estado
```bash
docker-compose ps
docker-compose logs -f api
docker-compose logs -f postgres
```

### Detener
```bash
docker-compose down          # Mantiene datos
docker-compose down -v       # ⚠️ Borra datos
```

### Reconstruir
```bash
docker-compose up --build    # Cambios de código
docker-compose restart api   # Nueva migración SQL
```

### Base de datos
```bash
# Conectar
docker-compose exec postgres psql -U biblia_user -d biblia_db

# Ver datos
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM favorites;
SELECT COUNT(*) FROM verses;

# Salir
\q
```

### Importar Biblia
```bash
cd BibliaBackend/scripts
python3 import_bible_data.py
```

---

## 🧪 Probar la API

### Health Check
```bash
curl http://localhost:8080/api/v1/actuator/health
```

### Registrar usuario
```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!",
    "fullName": "Test User"
  }'
```

### Login
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!"
  }'
```

### Obtener libros
```bash
curl http://localhost:8080/api/v1/books
```

### Obtener capítulo
```bash
curl http://localhost:8080/api/v1/books/genesis/chapters/1
```

---

## 🔍 Troubleshooting

### Swagger no carga
```bash
# 1. Verificar que API está corriendo
docker-compose ps

# 2. Ver logs
docker-compose logs api | grep "Started"

# 3. Health check
curl http://localhost:8080/api/v1/actuator/health
```

### Puerto en uso
```bash
# Ver qué usa el puerto
lsof -i :8080

# Matar proceso
kill -9 <PID>
```

### Cambios no se aplican
```bash
# Reconstruir imagen
docker-compose up --build
```

### Base de datos corrupta
```bash
# Resetear todo
docker-compose down -v
docker-compose up
cd scripts && python3 import_bible_data.py
```

---

## 📂 Archivos importantes

```
BibliaBackend/
├── docker-compose.yml       ← Configuración Docker
├── Dockerfile               ← Cómo construir API
├── src/main/resources/
│   ├── application.yml      ← Config Spring Boot
│   └── db/migration/        ← Migraciones Flyway
│       ├── V1__initial_schema.sql
│       ├── V2__seed_books.sql
│       └── V3__seed_sample_data.sql
└── scripts/
    └── import_bible_data.py ← Importar 31,102 versículos
```

---

## 🎯 Reglas de oro

1. **Swagger solo funciona con API corriendo**
2. **Rebuild solo para cambios de CÓDIGO**
3. **Los DATOS persisten automáticamente**
4. **`down -v` borra TODO (úsalo con cuidado)**
5. **Flyway ejecuta migraciones automáticamente**

---

## 🚦 Estados de la aplicación

### ✅ Todo OK
```bash
$ docker-compose ps
NAME            STATUS
biblia-postgres healthy
biblia-api      Up (healthy)

$ curl localhost:8080/api/v1/actuator/health
{"status":"UP"}
```

### ❌ Algo falla
```bash
$ docker-compose ps
NAME            STATUS
biblia-postgres unhealthy
biblia-api      Restarting

# Solución:
docker-compose logs api
docker-compose restart
```

---

## 📖 Documentación completa

- `INDICE_DOCUMENTACION.md` - Índice de todo
- `RESPUESTAS_DIRECTAS.md` - Respuestas cortas
- `FAQ_SWAGGER_Y_DATOS.md` - Swagger y persistencia
- `EXPLICACION_DOCKERIZACION.md` - Docker desde cero
- `GUIA_INICIO_RAPIDO.md` - Paso a paso

---

## 💡 Workflow recomendado

### Desarrollo:
```bash
# Terminal 1: Solo PostgreSQL
docker-compose up postgres

# Terminal 2: API local (hot-reload)
./mvnw spring-boot:run
```

### Testing:
```bash
# Todo en Docker
docker-compose up
```

### Producción:
```bash
# Construir y levantar
docker-compose up -d --build
```

---

**Última actualización:** 17 de enero, 2026

