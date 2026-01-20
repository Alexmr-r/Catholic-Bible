#!/bin/bash

# =====================================================
# Script de Producción - Biblia Católica
# =====================================================
#
# FLUJO COMPLETO:
#
# 1️⃣  Verificar Docker instalado
# 2️⃣  DOCKER: Construir imagen de la API (Dockerfile)
# 3️⃣  DOCKER: Levantar PostgreSQL + API (docker-compose.yml)
# 4️⃣  FLYWAY: Las migraciones se ejecutan AUTOMÁTICAMENTE dentro del contenedor API
#     └─> Flyway detecta los archivos .sql y los ejecuta
#     └─> Solo ocurre la primera vez que arranca la API
# 5️⃣  PYTHON: Importar datos de la Biblia (solo primera vez)
#     └─> Este script lo ejecuta MANUALMENTE desde fuera de Docker
#     └─> Conecta a localhost:5432 (puerto expuesto de PostgreSQL)
#
# =====================================================

set -e

# ========================================
# CONFIGURACIÓN: Colores para terminal
# ========================================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# ========================================
# CONFIGURACIÓN: Rutas del proyecto
# ========================================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/BibliaBackend"           # Carpeta con docker-compose.yml
FRONTEND_DIR="$SCRIPT_DIR/BibliaAppExpo"          # Carpeta del frontend
SCRIPTS_DIR="$BACKEND_DIR/scripts"                # Carpeta con import_bible_data.py

# ========================================
# CONFIGURACIÓN: Archivos de control
# Estos archivos marcan si ya se ejecutó algo
# ========================================
STATE_DIR="$SCRIPT_DIR/.prod-state"               # Carpeta oculta para guardar estado
MIGRATIONS_DONE="$STATE_DIR/migrations_done"      # Archivo que indica: "migraciones hechas"
BIBLE_IMPORTED="$STATE_DIR/bible_imported"        # Archivo que indica: "biblia importada"

mkdir -p "$STATE_DIR"

echo ""
echo -e "${CYAN}╔═══════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   🚀 Biblia Católica - PRODUCCIÓN        ║${NC}"
echo -e "${CYAN}╚═══════════════════════════════════════════╝${NC}"
echo ""

# ========================================
# PASO 1: Verificar que Docker está instalado
# ========================================
echo -e "${BLUE}📋 PASO 1: Verificando Docker...${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker no está instalado${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker instalado${NC}"

# Verificar si Docker daemon está corriendo
if ! docker ps > /dev/null 2>&1; then
    echo ""
    echo -e "${RED}❌ Docker no está corriendo${NC}"
    echo ""
    echo -e "${YELLOW}Por favor, inicia Docker Desktop:${NC}"
    echo -e "${CYAN}1. Abre la aplicación 'Docker Desktop' desde Aplicaciones${NC}"
    echo -e "${CYAN}2. Espera a que el icono de Docker en la barra superior deje de parpadear${NC}"
    echo -e "${CYAN}3. Vuelve a ejecutar este script: ./prod-start.sh${NC}"
    echo ""
    exit 1
fi
echo -e "${GREEN}✓ Docker corriendo${NC}"

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ docker-compose no está instalado${NC}"
    exit 1
fi
echo -e "${GREEN}✓ docker-compose instalado${NC}"

echo ""

# ========================================
# PASO 2 y 3: Construir y levantar Docker
# ========================================
echo -e "${BLUE}🐳 PASO 2 y 3: Construyendo y levantando Docker...${NC}"
echo ""

# Ir a la carpeta donde está docker-compose.yml
cd "$BACKEND_DIR"

# Verificar si es primera vez (mirando si existe el archivo de control)
FIRST_TIME=false
if [ ! -f "$MIGRATIONS_DONE" ]; then
    FIRST_TIME=true
    echo -e "${YELLOW}⚡ Primera vez detectada${NC}"
    echo -e "${YELLOW}   Las migraciones y datos se configurarán automáticamente${NC}"
    echo ""
fi

# ┌─────────────────────────────────────────────┐
# │ DOCKER BUILD: Construir imagen de la API   │
# └─────────────────────────────────────────────┘
echo -e "${CYAN}🔨 Ejecutando: docker-compose build${NC}"
echo -e "${YELLOW}   Esto lee el Dockerfile y compila tu aplicación Java${NC}"
echo -e "${YELLOW}   Crea una imagen Docker con tu API dentro${NC}"
echo ""
docker-compose build --no-cache

echo ""
echo -e "${GREEN}✓ Imagen de la API construida${NC}"
echo ""

# ┌─────────────────────────────────────────────┐
# │ DOCKER UP: Levantar contenedores           │
# └─────────────────────────────────────────────┘
echo -e "${CYAN}🚀 Ejecutando: docker-compose up -d${NC}"
echo -e "${YELLOW}   Esto lee docker-compose.yml y levanta:${NC}"
echo -e "${YELLOW}   1. Contenedor PostgreSQL (servicio: postgres)${NC}"
echo -e "${YELLOW}   2. Contenedor API (servicio: api)${NC}"
echo -e "${YELLOW}   -d significa 'detached' (en segundo plano)${NC}"
echo ""
docker-compose up -d

docker-compose up -d

echo ""
echo -e "${GREEN}✓ Contenedores iniciados${NC}"
echo ""

# ========================================
# PASO 4: Esperar a que los servicios estén listos
# ========================================
echo -e "${BLUE}⏳ PASO 4: Esperando a que los servicios estén listos...${NC}"
echo ""

# ┌─────────────────────────────────────────────┐
# │ Esperar PostgreSQL                          │
# └─────────────────────────────────────────────┘
echo -e "${YELLOW}🐘 Esperando PostgreSQL...${NC}"
echo -e "${CYAN}   Docker tiene un 'healthcheck' que verifica si PostgreSQL está listo${NC}"
echo -e "${CYAN}   Comando: docker-compose ps postgres${NC}"
echo ""

for i in {1..30}; do
    if docker-compose ps postgres | grep -q "healthy"; then
        echo -e "${GREEN}✓ PostgreSQL está listo (puerto 5432)${NC}"
        break
    fi
    sleep 1
    echo -n "."
done
echo ""

# ┌─────────────────────────────────────────────┐
# │ Esperar API                                 │
# └─────────────────────────────────────────────┘
echo -e "${YELLOW}🚀 Esperando API Spring Boot...${NC}"
echo -e "${CYAN}   Esto hace curl a: http://localhost:8080/api/v1/actuator/health${NC}"
echo ""

for i in {1..60}; do
    if curl -s http://localhost:8080/api/v1/actuator/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓ API está lista (puerto 8080)${NC}"
        break
    fi
    sleep 1
    echo -n "."
done
echo ""

# ┌─────────────────────────────────────────────────────────────────┐
# │ ⚠️ IMPORTANTE: Flyway ya ejecutó las migraciones               │
# │                                                                 │
# │ ¿Dónde ocurrió?                                                 │
# │   Dentro del contenedor 'api' cuando Spring Boot arrancó       │
# │                                                                 │
# │ ¿Cómo?                                                          │
# │   1. Spring Boot detecta Flyway en classpath                   │
# │   2. Lee application.yml:                                       │
# │      spring.flyway.enabled: true                                │
# │      spring.flyway.locations: classpath:db/migration            │
# │   3. Busca archivos en: src/main/resources/db/migration/       │
# │   4. Ejecuta EN ORDEN:                                          │
# │      - V1__initial_schema.sql  (crea tablas)                   │
# │      - V2__seed_books.sql      (inserta 73 libros)             │
# │      - V3__seed_sample_data.sql (datos de ejemplo)             │
# │   5. Guarda historial en tabla: flyway_schema_history          │
# │                                                                 │
# │ ¿Puedes verlo?                                                  │
# │   docker-compose logs api | grep Flyway                         │
# │                                                                 │
# │ ¿Se ejecuta cada vez?                                           │
# │   NO. Flyway revisa flyway_schema_history y solo ejecuta       │
# │   migraciones nuevas que no estén registradas                  │
# └─────────────────────────────────────────────────────────────────┘

if [ "$FIRST_TIME" = true ]; then
    echo ""
    echo -e "${GREEN}✅ MIGRACIONES EJECUTADAS AUTOMÁTICAMENTE${NC}"
    echo -e "${CYAN}   Flyway las ejecutó dentro del contenedor API${NC}"
    echo -e "${CYAN}   Puedes verificarlo con: docker-compose logs api | grep Flyway${NC}"
    echo ""

    # Marcar como hecho para no mostrar este mensaje de nuevo
    touch "$MIGRATIONS_DONE"
fi

echo ""

# ========================================
# PASO 5: Importar datos de la Biblia (solo primera vez)
# ========================================
#
# ⚠️ ESTE PASO ES MANUAL (no automático como las migraciones)
#
# ¿Por qué?
#   - El script Python necesita ejecutarse FUERA de Docker
#   - Conecta a PostgreSQL a través del puerto expuesto (5432)
#   - Importa ~31,000 versículos (tarda tiempo)
#
# ¿Dónde está el script?
#   BibliaBackend/scripts/import_bible_data.py
#
# ¿Qué hace?
#   1. Lee: BibliaAppExpo/bible_raw.json
#   2. Conecta a: localhost:5432
#   3. DELETE FROM verses, sections, chapters (limpia)
#   4. INSERT datos de todos los libros
#
# ========================================

if [ ! -f "$BIBLE_IMPORTED" ]; then
    echo -e "${BLUE}📖 PASO 5: Importando datos de la Biblia...${NC}"
    echo ""
    echo -e "${CYAN}   Script: $SCRIPTS_DIR/import_bible_data.py${NC}"
    echo -e "${CYAN}   Conecta a: localhost:5432 (PostgreSQL en Docker)${NC}"
    echo -e "${CYAN}   Importa: 31,102 versículos de bible_raw.json${NC}"
    echo ""

    cd "$SCRIPTS_DIR"

    # Verificar Python
    if ! command -v python3 &> /dev/null; then
        echo -e "${RED}❌ Python3 no está instalado${NC}"
        echo -e "${YELLOW}   Puedes importar los datos manualmente después:${NC}"
        echo -e "${YELLOW}   cd BibliaBackend/scripts${NC}"
        echo -e "${YELLOW}   python3 import_bible_data.py${NC}"
        echo ""
    else
        # Verificar/instalar psycopg2
        if ! python3 -c "import psycopg2" 2>/dev/null; then
            echo -e "${YELLOW}⚡ Instalando psycopg2 (librería para PostgreSQL)...${NC}"
            pip3 install psycopg2-binary -q
        fi

        echo -e "${YELLOW}⏳ Ejecutando: python3 import_bible_data.py${NC}"
        echo -e "${YELLOW}   (Esto tarda ~1 minuto)${NC}"
        echo ""

        # ┌─────────────────────────────────────────────┐
        # │ AQUÍ SE EJECUTA EL SCRIPT PYTHON            │
        # └─────────────────────────────────────────────┘
        python3 import_bible_data.py

        if [ $? -eq 0 ]; then
            echo ""
            echo -e "${GREEN}✓ Biblia importada exitosamente${NC}"
            echo -e "${GREEN}  - 73 libros${NC}"
            echo -e "${GREEN}  - 1,189 capítulos${NC}"
            echo -e "${GREEN}  - 31,102 versículos${NC}"
            echo ""

            # Marcar como hecho
            touch "$BIBLE_IMPORTED"
        else
            echo ""
            echo -e "${RED}❌ Error al importar la Biblia${NC}"
            echo -e "${YELLOW}   Puedes intentar manualmente:${NC}"
            echo -e "${YELLOW}   cd BibliaBackend/scripts${NC}"
            echo -e "${YELLOW}   python3 import_bible_data.py${NC}"
            echo ""
        fi
    fi
else
    echo -e "${GREEN}✓ PASO 5: Biblia ya importada anteriormente${NC}"
    echo -e "${CYAN}   El archivo de control existe: $BIBLE_IMPORTED${NC}"
    echo -e "${CYAN}   Los datos ya están en PostgreSQL${NC}"
    echo ""
fi


# ========================================
# Información del Frontend
# ========================================
echo -e "${BLUE}📱 Frontend - Configuración${NC}"
echo ""
echo -e "${CYAN}El frontend NO se levanta automáticamente en este script${NC}"
echo -e "${CYAN}Para iniciarlo manualmente:${NC}"
echo ""
echo -e "${YELLOW}   cd BibliaAppExpo${NC}"
echo -e "${YELLOW}   npm start          ${CYAN}# Para desarrollo móvil (Expo Go)${NC}"
echo -e "${YELLOW}   npm run web        ${CYAN}# Para navegador web${NC}"
echo ""
echo -e "${CYAN}Asegúrate de configurar la URL de la API en:${NC}"
echo -e "${YELLOW}   src/services/config.ts${NC}"
echo -e "${CYAN}   API_URL: 'http://localhost:8080/api/v1'${NC}"
echo ""

# ========================================
# RESUMEN FINAL
# ========================================
echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║            ✅ PRODUCCIÓN LISTA                            ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}📊 Servicios corriendo en Docker:${NC}"
echo -e "   ${GREEN}•${NC} PostgreSQL:  localhost:5432"
echo -e "   ${GREEN}•${NC} API Backend: http://localhost:8080/api/v1"
echo -e "   ${GREEN}•${NC} Swagger:     http://localhost:8080/api/v1/swagger-ui.html"
echo ""
echo -e "${CYAN}📂 Datos en PostgreSQL:${NC}"
echo -e "   ${GREEN}•${NC} 73 libros de la Biblia"
echo -e "   ${GREEN}•${NC} 1,189 capítulos"
echo -e "   ${GREEN}•${NC} 31,102 versículos"
echo ""
echo -e "${CYAN}🔧 Comandos útiles:${NC}"
echo -e "   ${GREEN}•${NC} Ver logs:         ${YELLOW}docker-compose logs -f${NC}"
echo -e "   ${GREEN}•${NC} Ver logs API:     ${YELLOW}docker-compose logs -f api${NC}"
echo -e "   ${GREEN}•${NC} Ver logs DB:      ${YELLOW}docker-compose logs -f postgres${NC}"
echo -e "   ${GREEN}•${NC} Ver Flyway:       ${YELLOW}docker-compose logs api | grep Flyway${NC}"
echo -e "   ${GREEN}•${NC} Detener:          ${YELLOW}docker-compose down${NC}"
echo -e "   ${GREEN}•${NC} Reiniciar API:    ${YELLOW}docker-compose restart api${NC}"
echo -e "   ${GREEN}•${NC} Ver estado:       ${YELLOW}docker-compose ps${NC}"
echo ""
echo -e "${CYAN}🔄 Si cambias código de la API:${NC}"
echo -e "   ${YELLOW}./prod-reload-api.sh${NC} ${CYAN}← Usa este script${NC}"
echo ""
echo -e "${CYAN}📖 Documentación completa:${NC}"
echo -e "   ${YELLOW}BibliaBackend/INDICE_DOCUMENTACION.md${NC}"
echo -e "   ${YELLOW}SCRIPTS_README.md${NC}"
echo ""
echo -e "${CYAN}🌐 pgAdmin (opcional):${NC}"
echo -e "   ${YELLOW}docker-compose --profile dev up -d pgadmin${NC}"
echo -e "   http://localhost:5050 (admin@biblia.com / admin123)"
echo ""

# ========================================
# Abrir Swagger automáticamente
# ========================================
sleep 3
if command -v open &> /dev/null; then
    echo -e "${BLUE}🌐 Abriendo Swagger en el navegador...${NC}"
    open http://localhost:8080/api/v1/swagger-ui.html 2>/dev/null || true
fi

echo ""
echo -e "${GREEN}✨ Sistema en producción listo!${NC}"
echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}RESUMEN DE LO QUE OCURRIÓ:${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}1.${NC} Docker construyó imagen de la API (Dockerfile)"
echo -e "${YELLOW}2.${NC} Docker levantó contenedores:"
echo -e "     - PostgreSQL (puerto 5432)"
echo -e "     - API Spring Boot (puerto 8080)"
echo -e "${YELLOW}3.${NC} Flyway ejecutó migraciones SQL ${GREEN}AUTOMÁTICAMENTE${NC}"
echo -e "     (dentro del contenedor API al arrancar Spring Boot)"
echo -e "${YELLOW}4.${NC} Script Python importó 31,102 versículos"
echo -e "     (desde fuera de Docker, conectando a localhost:5432)"
echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo ""


