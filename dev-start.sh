#!/bin/bash

# =====================================================
# Script de Desarrollo - Biblia Católica
# =====================================================
# Este script:
# 1. Levanta PostgreSQL en Docker
# 2. Ejecuta migraciones (solo primera vez)
# 3. Importa Bible data (solo primera vez)
# 4. Levanta API en local (con hot-reload)
# 5. Levanta Frontend Expo
# =====================================================

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Rutas
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/BibliaBackend"
FRONTEND_DIR="$SCRIPT_DIR/BibliaAppExpo"
SCRIPTS_DIR="$BACKEND_DIR/scripts"

# Archivos de estado
STATE_DIR="$SCRIPT_DIR/.dev-state"
MIGRATIONS_DONE="$STATE_DIR/migrations_done"
BIBLE_IMPORTED="$STATE_DIR/bible_imported"

mkdir -p "$STATE_DIR"

echo ""
echo -e "${CYAN}╔═══════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   🚀 Biblia Católica - Modo Desarrollo   ║${NC}"
echo -e "${CYAN}╚═══════════════════════════════════════════╝${NC}"
echo ""

# =====================================================
# 1. Verificar dependencias
# =====================================================
echo -e "${BLUE}📋 Verificando dependencias...${NC}"

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
    echo -e "${CYAN}3. Vuelve a ejecutar este script: ./dev-start.sh${NC}"
    echo ""
    exit 1
fi
echo -e "${GREEN}✓ Docker corriendo${NC}"

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ docker-compose no está instalado${NC}"
    exit 1
fi
echo -e "${GREEN}✓ docker-compose${NC}"

if ! command -v java &> /dev/null; then
    echo -e "${RED}❌ Java no está instalado. Necesitas Java 21+${NC}"
    exit 1
fi
JAVA_VERSION=$(java -version 2>&1 | awk -F '"' '/version/ {print $2}' | cut -d'.' -f1)
echo -e "${GREEN}✓ Java $JAVA_VERSION${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js no está instalado${NC}"
    exit 1
fi
NODE_VERSION=$(node -v)
echo -e "${GREEN}✓ Node.js $NODE_VERSION${NC}"

if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python3 no está instalado${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Python3${NC}"

echo ""

# =====================================================
# 2. Levantar PostgreSQL en Docker
# =====================================================
echo -e "${BLUE}🐘 Iniciando PostgreSQL...${NC}"

cd "$BACKEND_DIR"

# Verificar si PostgreSQL ya está corriendo
if docker ps | grep -q biblia-postgres; then
    echo -e "${GREEN}✓ PostgreSQL ya está corriendo${NC}"
else
    echo -e "${YELLOW}⚡ Levantando PostgreSQL...${NC}"
    docker-compose up -d postgres

    # Esperar a que esté healthy
    echo -e "${YELLOW}⏳ Esperando a que PostgreSQL esté listo...${NC}"
    for i in {1..30}; do
        if docker-compose ps postgres | grep -q "healthy"; then
            echo -e "${GREEN}✓ PostgreSQL está listo${NC}"
            break
        fi
        sleep 1
        echo -n "."
    done
    echo ""
fi

echo ""

# =====================================================
# 3. Ejecutar migraciones (solo primera vez)
# =====================================================
if [ ! -f "$MIGRATIONS_DONE" ]; then
    echo -e "${BLUE}📊 Primera vez detectada: Ejecutando migraciones...${NC}"
    echo -e "${YELLOW}⏳ Compilando API...${NC}"

    cd "$BACKEND_DIR"
    ./mvnw clean package -DskipTests -q

    echo -e "${YELLOW}⚡ Iniciando API temporalmente para migraciones...${NC}"
    ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev > /tmp/biblia-api-init.log 2>&1 &
    API_PID=$!

    # Esperar a que la API inicie y Flyway ejecute
    echo -e "${YELLOW}⏳ Esperando migraciones de Flyway...${NC}"
    for i in {1..60}; do
        if grep -q "Started BibliaApplication" /tmp/biblia-api-init.log 2>/dev/null; then
            echo -e "${GREEN}✓ Migraciones ejecutadas${NC}"
            break
        fi
        sleep 1
        echo -n "."
    done
    echo ""

    # Detener API temporal
    kill $API_PID 2>/dev/null || true
    sleep 2

    # Marcar como hecho
    touch "$MIGRATIONS_DONE"
    echo ""
else
    echo -e "${GREEN}✓ Migraciones ya ejecutadas anteriormente${NC}"
    echo ""
fi

# =====================================================
# 4. Importar Bible data (solo primera vez)
# =====================================================
if [ ! -f "$BIBLE_IMPORTED" ]; then
    echo -e "${BLUE}📖 Primera vez detectada: Importando datos de la Biblia...${NC}"

    cd "$SCRIPTS_DIR"

    # Verificar si psycopg2 está instalado
    if ! python3 -c "import psycopg2" 2>/dev/null; then
        echo -e "${YELLOW}⚡ Instalando psycopg2...${NC}"
        pip3 install psycopg2-binary -q
    fi

    echo -e "${YELLOW}⏳ Importando 31,102 versículos (esto tarda ~1 minuto)...${NC}"
    python3 import_bible_data.py

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Biblia importada exitosamente${NC}"
        touch "$BIBLE_IMPORTED"
    else
        echo -e "${RED}❌ Error al importar la Biblia${NC}"
        exit 1
    fi
    echo ""
else
    echo -e "${GREEN}✓ Biblia ya importada anteriormente${NC}"
    echo ""
fi

# =====================================================
# 5. Levantar API en local (con hot-reload)
# =====================================================
echo -e "${BLUE}🚀 Iniciando API en modo desarrollo...${NC}"
echo -e "${YELLOW}   (Hot-reload activado - los cambios se aplicarán automáticamente)${NC}"
echo ""

cd "$BACKEND_DIR"

# Iniciar API en background con logs
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev > "$STATE_DIR/api.log" 2>&1 &
API_PID=$!
echo $API_PID > "$STATE_DIR/api.pid"

# Esperar a que la API esté lista
echo -e "${YELLOW}⏳ Esperando a que la API esté lista...${NC}"
for i in {1..60}; do
    if curl -s http://localhost:8080/api/v1/actuator/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓ API lista en http://localhost:8080${NC}"
        break
    fi
    sleep 1
    echo -n "."
done
echo ""

# =====================================================
# 6. Levantar Frontend Expo
# =====================================================
echo -e "${BLUE}📱 Iniciando Frontend Expo...${NC}"
echo ""

cd "$FRONTEND_DIR"

# Verificar si node_modules existe
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚡ Instalando dependencias de Node.js...${NC}"
    npm install
    echo ""
fi

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              ✅ BACKEND LISTO                             ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}📊 Servicios corriendo:${NC}"
echo -e "   ${GREEN}•${NC} PostgreSQL:  localhost:5432"
echo -e "   ${GREEN}•${NC} API Backend: http://localhost:8080/api/v1"
echo -e "   ${GREEN}•${NC} Swagger:     http://localhost:8080/api/v1/swagger-ui.html"
echo ""
echo -e "${CYAN}🔧 Comandos útiles:${NC}"
echo -e "   ${GREEN}•${NC} Detener:      ${YELLOW}./dev-stop.sh${NC}"
echo -e "   ${GREEN}•${NC} Recargar API: ${YELLOW}./dev-reload-api.sh${NC}"
echo -e "   ${GREEN}•${NC} Ver logs API: ${YELLOW}tail -f $STATE_DIR/api.log${NC}"
echo ""
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}        📱 INICIANDO EXPO - EL QR APARECERÁ ABAJO         ${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${CYAN}📱 Instrucciones:${NC}"
echo -e "   ${GREEN}1.${NC} Espera 10-15 segundos a que aparezca el QR"
echo -e "   ${GREEN}2.${NC} Abre ${YELLOW}Expo Go${NC} en tu móvil"
echo -e "   ${GREEN}3.${NC} Escanea el QR que aparecerá abajo"
echo ""
echo -e "${CYAN}💡 Si el QR no aparece o da error:${NC}"
echo -e "   ${GREEN}•${NC} Presiona ${YELLOW}Ctrl+C${NC} para detener"
echo -e "   ${GREEN}•${NC} En otra terminal: ${YELLOW}cd BibliaAppExpo && npm start${NC}"
echo ""
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Guardar PID en archivo para poder detenerlo después
echo "$$" > "$STATE_DIR/expo-parent.pid"

# Abrir Swagger antes de iniciar Expo
if command -v open &> /dev/null; then
    echo -e "${CYAN}🌐 Abriendo Swagger en el navegador...${NC}"
    open http://localhost:8080/api/v1/swagger-ui.html 2>/dev/null || true
    sleep 2
    echo ""
fi

# Iniciar Expo SIN redirigir a archivo - que se vea en pantalla
echo -e "${CYAN}Iniciando Expo...${NC}"
echo ""

# Ejecutar npm start directamente (sin &) para que se vea el output
# Esto bloqueará el script pero mostrará el QR
# Cuando presiones Ctrl+C, detendrá Expo pero la API y PostgreSQL seguirán corriendo
npm start

# Nota: El código después de npm start NO se ejecutará
# porque npm start bloquea hasta que presiones Ctrl+C

