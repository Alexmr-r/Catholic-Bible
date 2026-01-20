# ❓ Respuestas Directas a tus Preguntas

## 1. ¿Cada cuánto compila mi API si Docker está corriendo?

### Respuesta corta:
**❌ NUNCA automáticamente.** Tienes que decirle que recompile.

### Explicación:
```
Docker NO es como hot-reload. Es como una foto congelada:

1. Primera vez:
   docker-compose up
   → Compila una vez y crea la imagen
   → Imagen queda congelada

2. Haces cambios en tu código:
   → Docker NO se entera
   → Sigue usando la imagen vieja

3. Para aplicar cambios:
   docker-compose up --build
   → Recompila y crea nueva imagen
   → Reemplaza la vieja
```

### Comparación:

| Comando | ¿Recompila? | ¿Cuándo usar? |
|---------|-------------|---------------|
| `docker-compose up` | ❌ NO | Primera vez o si no cambiaste código |
| `docker-compose up --build` | ✅ SÍ | Cada vez que cambies código |
| `docker-compose restart api` | ❌ NO | Solo reinicia, no recompila |

### 💡 Recomendación para desarrollo:
```bash
# NO uses Docker para desarrollar
# Usa esto en su lugar:

Terminal 1:
docker-compose up postgres    # Solo la base de datos

Terminal 2:
./mvnw spring-boot:run        # API local con hot-reload
```

**Ventaja:** Cambios se aplican en 5 segundos, no 2 minutos.

---

## 2. ¿Qué pasa con la base de datos cuando Docker está corriendo?

### Respuesta corta:
**✅ Los datos NO se borran** (a menos que uses `-v`)

### Explicación:
```
Los datos están en un VOLUMEN:

┌─────────────────────────────────┐
│  Tu Mac                         │
│                                 │
│  /var/lib/docker/volumes/       │
│    └── postgres_data/           │ ← Aquí viven los datos
│          └── (31,102 versículos)│
│                                 │
└─────────────────────────────────┘

Comportamiento:

docker-compose down
  ├─ Apaga contenedores ✅
  ├─ Borra contenedores ✅
  └─ MANTIENE volumen ✅ ← Datos siguen ahí

docker-compose up
  └─ Usa volumen existente ✅ ← Datos aparecen de nuevo

docker-compose down -v  ⚠️ PELIGRO
  └─ BORRA volumen ❌ ← Pierdes TODO
```

### Tabla de supervivencia de datos:

| Comando | ¿Datos sobreviven? |
|---------|-------------------|
| `docker-compose down` | ✅ SÍ |
| `docker-compose restart` | ✅ SÍ |
| `docker-compose stop` | ✅ SÍ |
| `docker-compose down -v` | ❌ NO |
| Reiniciar Mac | ✅ SÍ |
| Desinstalar Docker | ❌ NO |

---

## 3. ¿Qué mete el script de la Biblia exactamente?

### Respuesta corta:
**Ahora importa TODOS los capítulos, secciones y versículos de la Biblia.**

### Tabla comparativa:

| ¿Qué?            | V2__seed_books.sql | import_bible_data.py |
|------------------|-------------------|---------------------|
| Tabla `books`    | ✅ Inserta 73 libros | ❌ NO toca |
| Tabla `chapters` | ❌ NO               | ✅ Inserta 1,189 capítulos |
| Tabla `sections` | ❌ NO               | ✅ Inserta 1,189 secciones |
| Tabla `verses`   | ❌ NO               | ✅ Inserta 31,102 versículos |
| ¿Cuándo?         | Automático (Flyway) | Manual (tú lo ejecutas) |

### Visualización:

```
ANTES del script Python:
┌──────────────────────────┐
│ books     73 filas   ✅  │ ← V2__seed_books.sql
├──────────────────────────┤
│ chapters   2 filas   ⚠️  │ ← V3 (solo ejemplo)
│ sections   2 filas   ⚠️  │
│ verses    33 filas   ⚠️  │
└──────────────────────────┘
      Solo Mateo 1 + Génesis 1

DESPUÉS del script Python:
┌──────────────────────────┐
│ books     73 filas   ✅  │ ← Mismo, no cambia
├──────────────────────────┤
│ chapters   1,189 filas ✅│ ← TODOS
│ sections   1,189 filas ✅│ ← TODOS
│ verses    31,102 filas ✅│ ← TODOS
└──────────────────────────┘
      TODA LA BIBLIA
```

### ⚠️ IMPORTANTE:
```python
# El script BORRA antes de insertar:
DELETE FROM verses;
DELETE FROM sections;
DELETE FROM chapters;
# Pero NO borra:
# DELETE FROM books;  ← Esta línea NO existe
```

---

## 4. ¿Dónde se llaman los archivos .sql para que se ejecuten?

### Respuesta corta:
**Flyway los ejecuta automáticamente al iniciar.**

### Ubicación de los archivos:
```
BibliaBackend/
└── src/
    └── main/
        └── resources/
            └── db/
                └── migration/     ← AQUÍ
                    ├── V1__initial_schema.sql
                    ├── V2__seed_books.sql
                    └── V3__seed_sample_data.sql
```

### Configuración (application.yml):
```yaml
spring:
  flyway:
    enabled: true                    ← Activa Flyway
    locations: classpath:db/migration ← Busca aquí
```

### ¿Cuándo se ejecutan?

```
1. docker-compose up
        ↓
2. PostgreSQL inicia (healthcheck OK)
        ↓
3. API Spring Boot inicia
        ↓
4. Flyway se activa AUTOMÁTICAMENTE
        ↓
5. Flyway conecta a postgres:5432
        ↓
6. Flyway busca archivos en db/migration/
        ↓
7. Flyway ejecuta EN ORDEN:
   ├─ V1__initial_schema.sql (crea tablas)
   ├─ V2__seed_books.sql (inserta libros)
   └─ V3__seed_sample_data.sql (datos ejemplo)
        ↓
8. Flyway guarda historial en:
   flyway_schema_history
        ↓
9. API lista para usar ✅
```

### Control de ejecución:

Flyway crea esta tabla:
```sql
flyway_schema_history

┌──────┬─────────┬──────────────┬─────────────┐
│ rank │ version │ description  │ executed    │
├──────┼─────────┼──────────────┼─────────────┤
│  1   │    1    │ initial...   │ 2026-01-17  │
│  2   │    2    │ seed books   │ 2026-01-17  │
│  3   │    3    │ seed sample  │ 2026-01-17  │
└──────┴─────────┴──────────────┴─────────────┘

Si vuelves a hacer docker-compose up:
  → Flyway ve que V1, V2, V3 ya están
  → NO los ejecuta de nuevo ✅
  → "Schema is up to date"
```

### ¿Cómo añadir más SQL?

```bash
# 1. Crea nuevo archivo
echo "CREATE INDEX idx_verses_text ON verses(text);" > \
  src/main/resources/db/migration/V4__add_verse_index.sql

# 2. Reinicia API
docker-compose restart api

# 3. Flyway detecta V4 automáticamente
#    y lo ejecuta
```

### Reglas importantes:

```
✅ PERMITIDO:
   - Añadir V4, V5, V6... (nuevos)
   - Parar y levantar Docker
   - Ejecutar varias veces

❌ NO PERMITIDO:
   - Modificar V1, V2, V3 (ya ejecutados)
   - Cambiar orden de versiones
   - Renombrar archivos ya ejecutados

Si necesitas cambiar V2:
  1. docker-compose down -v  (borra TODO)
  2. Modifica V2__seed_books.sql
  3. docker-compose up (ejecuta de nuevo)
```

---

## 📊 Diagrama resumen

```
┌─────────────────────────────────────────────────────────┐
│                    FLUJO COMPLETO                       │
└─────────────────────────────────────────────────────────┘

docker-compose up
        ↓
   ┌────────────┐
   │ PostgreSQL │  ← Volumen persistente
   └─────┬──────┘
         │
         ↓
   ┌────────────┐
   │ Spring Boot│  ← Compila solo si usas --build
   └─────┬──────┘
         │
         ↓
   ┌────────────┐
   │   Flyway   │  ← Ejecuta .sql automáticamente
   └─────┬──────┘
         │
         ├──→ V1__initial_schema.sql  (crea tablas)
         ├──→ V2__seed_books.sql      (73 libros)
         └──→ V3__seed_sample_data.sql (ejemplo)
         ↓
   ┌────────────┐
   │ API Lista  │  ← localhost:8080
   └────────────┘

   TÚ ejecutas (opcional):
   python3 import_bible_data.py
         ↓
   ┌────────────┐
   │ PostgreSQL │  ← Inserta 31,102 versículos
   └────────────┘
```

---

## 5. ¿Por qué no veo Swagger? ¿Cómo se genera?

### Respuesta corta:
**Swagger se genera automáticamente cuando la API está corriendo. No es un archivo físico, es una página web generada por Springdoc/OpenAPI.**

### Explicación:
- Cuando levantas la API (Spring Boot), la dependencia `springdoc-openapi` analiza todos tus controladores y modelos.
- Genera en tiempo real la documentación OpenAPI (Swagger) de todos los endpoints.
- No existe un archivo swagger.json en el proyecto: se crea dinámicamente al arrancar la API.
- La interfaz web de Swagger está disponible en:
  - http://localhost:8080/api/v1/swagger-ui.html
- Puedes probar todos los endpoints desde esa página.

### ¿Dónde se configura Swagger?
- En el backend, Swagger se habilita automáticamente al incluir la dependencia `springdoc-openapi-ui` en el `pom.xml`.
- No necesitas código extra, pero puedes personalizarlo creando una clase de configuración en Java (opcional):

```java
// Ejemplo de configuración opcional
@Configuration
public class OpenApiConfig {
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
            .info(new Info().title("Biblia API").version("1.0.0"));
    }
}
```
- Por defecto, la URL es `/swagger-ui.html` bajo el context-path de la API.

### URLs importantes:

| URL | ¿Qué es? |
|-----|----------|
| http://localhost:8080/api/v1/swagger-ui.html | 📖 Documentación interactiva |
| http://localhost:8080/api/v1/v3/api-docs | 📄 JSON OpenAPI generado |
| http://localhost:8080/api/v1/actuator/health | ✅ Health check |
| http://localhost:8080/api/v1/books | 📚 Endpoint de ejemplo |

### Verificar que está lista:
```bash
# Opción 1
curl http://localhost:8080/api/v1/actuator/health
# Debe responder: {"status":"UP"}

# Opción 2
Abre en el navegador:
http://localhost:8080/api/v1/swagger-ui.html
```

---

## 6. ¿Necesito rebuild cuando usuarios se registran o añaden favoritos?

### Respuesta corta:
**❌ NO necesitas rebuild.** Los datos se guardan automáticamente en el volumen de PostgreSQL.

### Regla de oro:
```
🔨 ¿Cambios en CÓDIGO?  → docker-compose up --build
💾 ¿Cambios en DATOS?   → NO hacer nada
```

### Tabla de decisión:

| ¿Qué hiciste? | ¿Rebuild? |
|---------------|-----------|
| Modificaste un Controller | ✅ SÍ → `docker-compose up --build` |
| Modificaste application.yml | ✅ SÍ → `docker-compose up --build` |
| Añadiste dependencia en pom.xml | ✅ SÍ → `docker-compose up --build` |
| Usuario se registró | ❌ NO |
| Usuario añadió favorito | ❌ NO |
| Usuario hizo login | ❌ NO |
| Usuario añadió highlight | ❌ NO |
| Hiciste INSERT/UPDATE en DB | ❌ NO |

### ¿Por qué?

```
CÓDIGO = Imagen Docker (congelada)
  └─> Necesita rebuild para actualizarse

DATOS = Volumen PostgreSQL (persistente)
  └─> Se guarda automáticamente
```

### Ejemplo visual:

```
Usuario se registra:
POST /api/v1/auth/register
        ↓
AuthController (código)
        ↓
INSERT INTO users ...
        ↓
PostgreSQL guarda en volumen
        ↓
✅ Usuario guardado PERMANENTEMENTE

Aunque hagas:
- docker-compose down  → Usuario sigue ahí ✅
- docker-compose up --build → Usuario sigue ahí ✅
- Reiniciar Mac → Usuario sigue ahí ✅

Solo se borra con:
- docker-compose down -v → Usuario se borra ❌
```

---

## 🎯 Resumen en 3 líneas

5. **Swagger:** Solo funciona cuando la API está corriendo: http://localhost:8080/api/v1/swagger-ui.html

6. **Rebuild:** Solo cuando cambias CÓDIGO (Java, yml, pom.xml). Los DATOS (usuarios, favoritos) persisten automáticamente.

---

1. **Recompilación:** Docker NO recompila automáticamente. Usa `docker-compose up --build`

2. **Base de datos:** Los datos persisten en un volumen. Solo se borran con `down -v`

3. **SQL files:** Flyway los ejecuta automáticamente desde `db/migration/` al iniciar

---

## 💡 Tips finales

### Para desarrollo diario:
```bash
# Opción A (Recomendada):
docker-compose up postgres       # Solo DB
./mvnw spring-boot:run           # API local

# Opción B:
docker-compose up --build        # Todo en Docker (lento)
```

### Para ver qué pasó:
```bash
# Ver logs de Flyway
docker-compose logs api | grep Flyway

# Ver migraciones aplicadas
docker-compose exec postgres psql -U biblia_user -d biblia_db \
  -c "SELECT * FROM flyway_schema_history;"

# Ver datos
docker-compose exec postgres psql -U biblia_user -d biblia_db \
  -c "SELECT COUNT(*) FROM verses;"
```

### Si algo falla:
```bash
# Resetear TODO
docker-compose down -v
docker-compose up
cd scripts && python3 import_bible_data.py
```

---

¿Algo más que quieras saber? 🤓
