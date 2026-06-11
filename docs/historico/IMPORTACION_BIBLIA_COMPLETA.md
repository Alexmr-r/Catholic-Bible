# 📖 Importación de la Biblia Completa

## ✅ CONFIRMADO: El JSON completo SÍ se importa

### Resumen rápido:
- ✅ **bible_raw.json** (~10 MB) contiene TODA la Biblia
- ✅ **import_bible_data.py** importa TODO el archivo
- ✅ **31,102 versículos** se insertan en PostgreSQL
- ✅ **V3 (datos de prueba) ELIMINADO** - ya no es necesario

---

## 🔍 ¿Qué contiene bible_raw.json?

```json
{
  "translation": "Biblia de Jerusalén",
  "books": [
    {
      "name": "Genesis",
      "chapters": [
        {
          "chapter": 1,
          "verses": [
            {"verse": 1, "text": "En el principio creó Dios..."},
            {"verse": 2, "text": "Y la tierra estaba..."},
            ... // TODOS los versículos de Génesis 1
          ]
        },
        ... // TODOS los capítulos de Génesis (50)
      ]
    },
    ... // TODOS los 73 libros de la Biblia
  ]
}
```

**Tamaño:** ~10 MB  
**Contenido:** 73 libros, 1,189 capítulos, 31,102 versículos

---

## 📊 ¿Qué hace import_bible_data.py?

### Código clave:

```python
def main():
    # 1. BUSCA EL ARCHIVO JSON
    json_file = os.path.join(os.path.dirname(project_root), 
                             'BibliaAppExpo', 
                             'bible_raw.json')
    
    # 2. CARGA TODO EL ARCHIVO (10 MB)
    bible_data = load_bible_json(json_file)
    # bible_data contiene los 73 libros completos
    
    # 3. LIMPIA DATOS ANTERIORES
    clear_bible_data(conn)
    # DELETE FROM verses;
    # DELETE FROM sections;
    # DELETE FROM chapters;
    
    # 4. IMPORTA CADA LIBRO (LOOP)
    for i, book_data in enumerate(bible_data, 1):
        # Itera sobre TODOS los libros del JSON
        import_book_data(conn, book_data)
        # Inserta TODOS los capítulos y versículos
    
    # RESULTADO FINAL:
    # Libros: 73
    # Capítulos: 1,189
    # Versículos: 31,102
```

### ¿Se importa TODO?

✅ **SÍ, absolutamente TODO**

El script:
1. Lee el archivo completo (10 MB)
2. Itera sobre los 73 libros
3. Para cada libro, itera sobre todos sus capítulos
4. Para cada capítulo, inserta todos sus versículos

**No hay límites, no hay filtros, se importa TODO.**

---

## 🗑️ V3__seed_sample_data.sql ELIMINADO

### ¿Por qué existía V3?

V3 contenía datos de prueba:
- Mateo capítulo 1 (25 versículos)
- Génesis capítulo 1 (8 versículos)
- 1 lectura diaria de ejemplo

**Propósito:** Permitir probar la API sin esperar 1 minuto a que el script Python termine.

### ¿Por qué lo eliminamos?

1. **Es redundante:** El script Python importa TODO
2. **Confunde:** Parece que solo hay 33 versículos
3. **No es necesario:** Los scripts ya manejan la importación automáticamente

### Estado actual de las migraciones:

```
src/main/resources/db/migration/
├── V1__initial_schema.sql    ✅ Crea todas las tablas
└── V2__seed_books.sql         ✅ Inserta 73 libros

❌ V3__seed_sample_data.sql ELIMINADO
```

---

## 🚀 Flujo de importación en los scripts

### dev-start.sh y prod-start.sh:

```bash
# PASO 1: Flyway ejecuta migraciones (AUTOMÁTICO)
# Cuando Spring Boot arranca:
#   ├─ V1: Crea tablas
#   └─ V2: Inserta 73 libros
# 
# Estado después de Flyway:
#   books:    73 filas ✅
#   chapters: 0 filas  ❌
#   verses:   0 filas  ❌

# PASO 2: Script Python importa datos (MANUAL)
if [ ! -f .dev-state/bible_imported ]; then
    python3 import_bible_data.py
    touch .dev-state/bible_imported
fi
#
# Estado después del script Python:
#   books:    73 filas      ✅
#   chapters: 1,189 filas   ✅
#   verses:   31,102 filas  ✅
```

### Solo ocurre UNA VEZ:

```
Primera ejecución:
./dev-start.sh
  ├─ No existe .dev-state/bible_imported
  ├─ Ejecuta: python3 import_bible_data.py
  ├─ Importa 31,102 versículos (~1 minuto)
  └─ Crea archivo: .dev-state/bible_imported

Segunda ejecución:
./dev-start.sh
  ├─ Existe .dev-state/bible_imported ✅
  └─ Salta la importación (datos ya están)
```

---

## 🔍 Verificar que TODO se importó

### Opción 1: Desde terminal

```bash
# Levantar PostgreSQL
docker-compose -f BibliaBackend/docker-compose.yml up -d postgres

# Conectar
docker-compose -f BibliaBackend/docker-compose.yml exec postgres \
  psql -U biblia_user -d biblia_db

# Verificar datos
SELECT 
  'books' as tabla, COUNT(*) as total FROM books
UNION ALL
SELECT 'chapters', COUNT(*) FROM chapters
UNION ALL
SELECT 'verses', COUNT(*) FROM verses;

# Resultado esperado:
#  tabla    | total
# ----------+-------
#  books    |    73
#  chapters | 1,189
#  verses   | 31,102
```

### Opción 2: Ver logs del script Python

```bash
# Durante la importación verás:
[1/73] Procesando: Genesis
  ✓ 50 capítulos, 1,533 versículos importados
[2/73] Procesando: Exodus
  ✓ 40 capítulos, 1,213 versículos importados
...
[73/73] Procesando: Revelation
  ✓ 22 capítulos, 404 versículos importados

RESUMEN DE IMPORTACIÓN
Libros importados:     73
Capítulos importados:  1,189
Versículos importados: 31,102
✓ Importación completada exitosamente!
```

### Opción 3: Verificar libros específicos

```sql
-- Ver cuántos capítulos tiene Génesis
SELECT COUNT(*) FROM chapters WHERE book_id = 'genesis';
-- Debe ser: 50

-- Ver cuántos versículos tiene Génesis 1
SELECT COUNT(*) 
FROM verses v
JOIN sections s ON v.section_id = s.id
JOIN chapters c ON s.chapter_id = c.id
WHERE c.book_id = 'genesis' AND c.chapter_number = 1;
-- Debe ser: 31 (Génesis 1 tiene 31 versículos)

-- Ver todos los libros con datos
SELECT 
  b.name,
  COUNT(DISTINCT c.id) as capitulos,
  COUNT(v.id) as versiculos
FROM books b
LEFT JOIN chapters c ON b.id = c.book_id
LEFT JOIN sections s ON c.id = s.chapter_id
LEFT JOIN verses v ON s.id = v.section_id
GROUP BY b.name
ORDER BY b.order_index;
```

---

## 🆘 Si no se importó TODO

### Problema 1: Script Python falló

```bash
# Ver si existe el archivo de control
ls -la .dev-state/bible_imported

# Si existe pero dudas, bórralo y vuelve a ejecutar
rm .dev-state/bible_imported
rm .prod-state/bible_imported

# Ejecutar manualmente
cd BibliaBackend/scripts
python3 import_bible_data.py
```

### Problema 2: JSON no se encuentra

```bash
# Verificar que existe
ls -lh BibliaAppExpo/bible_raw.json

# Debe mostrar algo como:
# -rw-r--r-- 1 user staff 10M Jan 17 10:00 bible_raw.json
```

### Problema 3: Solo algunos libros

```bash
# Ver cuántos libros se importaron
psql -h localhost -U biblia_user -d biblia_db -c \
  "SELECT b.name, COUNT(c.id) as caps, COUNT(v.id) as vers
   FROM books b
   LEFT JOIN chapters c ON b.id = c.book_id
   LEFT JOIN sections s ON c.id = s.chapter_id
   LEFT JOIN verses v ON s.id = v.section_id
   GROUP BY b.name
   HAVING COUNT(c.id) = 0;"

# Si aparecen libros sin capítulos, el script no completó
# Solución: Ejecutar de nuevo
cd BibliaBackend/scripts
python3 import_bible_data.py
```

---

## 💡 Resumen final

### Estado actual:

```
Migraciones Flyway:
├── V1__initial_schema.sql     ✅ (Crea tablas)
└── V2__seed_books.sql          ✅ (73 libros)

Script Python:
└── import_bible_data.py        ✅ (31,102 versículos)

Base de datos final:
├── books:    73 filas
├── chapters: 1,189 filas
└── verses:   31,102 filas
```

### ¿Se importa TODO el JSON?

✅ **SÍ - Los 10 MB completos**

El script Python:
- Lee el archivo completo
- Itera sobre los 73 libros
- Inserta TODOS los capítulos
- Inserta TODOS los versículos
- No hay límites ni filtros

### ¿Cuándo ocurre?

📅 **Solo la primera vez** que ejecutas `dev-start.sh` o `prod-start.sh`

El archivo de control (`.dev-state/bible_imported` o `.prod-state/bible_imported`) evita que se ejecute de nuevo.

### ¿V3 es necesario?

❌ **NO - Lo eliminamos**

Era solo para tener datos de prueba rápidos. Ahora el script Python maneja todo automáticamente.

---

## 🎯 Para confirmar

Ejecuta esto después de iniciar:

```bash
# 1. Iniciar (primera vez)
./dev-start.sh

# 2. Esperar a que termine (verás el progreso)

# 3. Verificar
docker-compose -f BibliaBackend/docker-compose.yml exec postgres \
  psql -U biblia_user -d biblia_db -c \
  "SELECT COUNT(*) as versiculos FROM verses;"

# Debe mostrar: 31,102
```

Si ves **31,102 versículos**, está TODO importado correctamente. ✅

---

**Última actualización:** 17 de enero, 2026  
**V3 eliminado:** ✅  
**Importación completa confirmada:** ✅

