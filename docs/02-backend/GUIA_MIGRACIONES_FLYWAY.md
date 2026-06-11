# 📚 Guía: Cómo Evitar Problemas con Migraciones de Flyway

## 🎯 Problema Resuelto

### El Error:
```
FlywayValidateException: Validate failed: Migrations have failed validation
Migration checksum mismatch for migration version X
-> Applied to database : XXXXXXX
-> Resolved locally    : YYYYYYY
```

### ¿Qué significa?
Flyway calcula un **checksum** (hash) de cada archivo de migración SQL. Si modificas el archivo después de ejecutarlo, el checksum cambia y Flyway detecta la inconsistencia.

---

## 🔧 Solución Rápida (cuando ya sucedió)

### Opción 1: Actualizar el checksum en la BD

```bash
# 1. Conectar a PostgreSQL
docker-compose -f BibliaBackend/docker-compose.yml exec postgres psql -U biblia_user -d biblia_db

# 2. Obtener el checksum correcto del error
# Ejemplo del error: "Resolved locally: 327448897"

# 3. Actualizar el checksum
UPDATE flyway_schema_history SET checksum = 327448897 WHERE version = '4';

# 4. Salir
\q
```

### Opción 2: Limpiar y reiniciar (desarrollo)

```bash
# Solo en desarrollo - elimina el estado y reconfigura
rm -rf .dev-state
./dev-start.sh
```

---

## ✅ Mejores Prácticas para NO tener este problema

### 1. **NUNCA modificar migraciones ya ejecutadas**

❌ **MAL:**
```
V1__create_users.sql  (ya ejecutado)
↓
Modificas el archivo
↓
ERROR de checksum
```

✅ **BIEN:**
```
V1__create_users.sql  (ya ejecutado - NO TOCAR)
V2__add_email_to_users.sql  (nueva migración para el cambio)
```

### 2. **Nombrado correcto de migraciones**

**Formato:** `VX__descripcion_clara.sql`

- `V` = Versionada
- `X` = Número secuencial (1, 2, 3, 4...)
- `__` = Dos guiones bajos
- `descripcion_clara` = Snake case, descriptivo

**Ejemplos:**
```
✅ V1__initial_schema.sql
✅ V2__seed_books.sql
✅ V3__add_favorites_table.sql
✅ V4__remove_favorite_unique_constraint.sql

❌ V1_initial.sql              (un solo guion bajo)
❌ v1__initial.sql             (v minúscula)
❌ V1__Initial-Schema.sql      (mayúsculas y guiones)
```

### 3. **Verificar migraciones antes de crear nuevas**

```bash
# Ver qué migraciones existen
ls -la BibliaBackend/src/main/resources/db/migration/

# Ver qué migraciones están en la BD
docker-compose -f BibliaBackend/docker-compose.yml exec postgres \
  psql -U biblia_user -d biblia_db -c \
  "SELECT version, description, installed_on FROM flyway_schema_history ORDER BY installed_rank;"
```

**Output esperado:**
```
 version |          description           |        installed_on        
---------+--------------------------------+---------------------------
 1       | initial schema                 | 2026-01-15 01:52:06
 2       | seed books                     | 2026-01-15 01:52:06
 4       | remove favorite unique constraint | 2026-01-19 23:23:00
```

### 4. **Workflow correcto para nuevos cambios**

```bash
# 1. Verificar última migración
ls BibliaBackend/src/main/resources/db/migration/ | sort

# Output: V1, V2, V4 existen
# Siguiente debe ser V5 (NO V3)

# 2. Crear nueva migración
touch BibliaBackend/src/main/resources/db/migration/V5__add_notes_to_favorites.sql

# 3. Escribir el SQL
# 4. Levantar backend - Flyway ejecutará V5 automáticamente
./dev-start.sh
```

---

## 🚨 Si Flyway se queja de un gap (V1, V2, V4 - falta V3)

**Flyway permite gaps** pero si quieres limpieza:

### Opción A: Ignorar el gap (recomendado)
```yaml
# En application.yml
spring:
  flyway:
    ignore-missing-migrations: true
```

### Opción B: Crear V3 vacío (solo para OCD)
```sql
-- V3__placeholder.sql
-- Esta migración se saltó en desarrollo
-- No hace nada
SELECT 1;
```

---

## 📋 Checklist antes de crear migración

- [ ] ¿Verifiqué qué migraciones ya existen?
- [ ] ¿Usé el número correcto (siguiente secuencial)?
- [ ] ¿El nombre sigue el formato `VX__descripcion.sql`?
- [ ] ¿El SQL es idempotente? (se puede ejecutar múltiples veces sin error)
- [ ] ¿Probé la migración en desarrollo antes de commit?

---

## 🔍 Comandos Útiles

### Ver estado de Flyway
```bash
docker-compose -f BibliaBackend/docker-compose.yml exec postgres \
  psql -U biblia_user -d biblia_db -c \
  "SELECT version, description, checksum, success FROM flyway_schema_history ORDER BY installed_rank;"
```

### Ver constraints de una tabla
```bash
docker-compose -f BibliaBackend/docker-compose.yml exec postgres \
  psql -U biblia_user -d biblia_db -c \
  "SELECT conname FROM pg_constraint WHERE conrelid = 'favorites'::regclass;"
```

### Limpiar Flyway history (PELIGRO - solo desarrollo)
```sql
-- ESTO BORRA TODO EL HISTORIAL
-- Solo en caso extremo en desarrollo
DELETE FROM flyway_schema_history;
```

---

## 🎓 Lecciones Aprendidas

### 1. **El checksum es tu amigo**
Flyway protege tu BD de cambios accidentales en migraciones ya aplicadas.

### 2. **Las migraciones son inmutables**
Una vez ejecutada = NO TOCAR. Crear nueva migración para cambios.

### 3. **Los números pueden tener gaps**
V1, V2, V4, V7 está bien. No necesitas V3, V5, V6.

### 4. **Idempotencia es clave**
```sql
-- ✅ BIEN - se puede ejecutar varias veces
ALTER TABLE users DROP COLUMN IF EXISTS old_field;

-- ❌ MAL - falla si ya se ejecutó
ALTER TABLE users DROP COLUMN old_field;
```

### 5. **Comentarios son importantes**
```sql
-- V5__add_user_preferences.sql
-- Añade tabla para preferencias de usuario
-- Relacionada con ticket #123

CREATE TABLE user_preferences (
    ...
);
```

---

## 🔗 Recursos

- [Documentación oficial de Flyway](https://flywaydb.org/documentation/)
- [Flyway Best Practices](https://flywaydb.org/documentation/concepts/migrations)
- [SQL Naming Conventions](https://www.sqlstyle.guide/)

---

## ⚠️ Errores Comunes y Soluciones

### Error: "Migration checksum mismatch"
**Causa:** Modificaste un archivo de migración ya ejecutado  
**Solución:** Actualizar checksum en BD o crear nueva migración

### Error: "Found non-empty schema without metadata table"
**Causa:** Flyway no sabe qué migraciones se ejecutaron  
**Solución:** `baseline-on-migrate: true` en `application.yml`

### Error: "Migration version X is missing"
**Causa:** Hay un gap en versiones y `ignore-missing-migrations` es false  
**Solución:** Activar `ignore-missing-migrations: true`

---

**Fecha:** 19 de Enero, 2026  
**Versión:** 1.0  
**Autor:** Equipo Biblia Católica

