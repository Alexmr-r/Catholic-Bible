#!/bin/bash

# =====================================================
# Script de Recarga API - Solo cambios de código
# =====================================================
# Este script solo reinicia la API cuando cambias código
# NO toca la base de datos (datos persisten)
# =====================================================

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/BibliaBackend"
STATE_DIR="$SCRIPT_DIR/.dev-state"

echo ""
echo -e "${CYAN}╔═══════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   🔄 Recargando API (cambios de código)  ║${NC}"
echo -e "${CYAN}╚═══════════════════════════════════════════╝${NC}"
echo ""

# Verificar que estamos en modo desarrollo
if [ ! -d "$STATE_DIR" ]; then
    echo -e "${RED}❌ No hay servicios corriendo en modo desarrollo${NC}"
    echo -e "${YELLOW}   Ejecuta primero: ./dev-start.sh${NC}"
    exit 1
fi

# Detener API actual
if [ -f "$STATE_DIR/api.pid" ]; then
    API_PID=$(cat "$STATE_DIR/api.pid")
    if ps -p $API_PID > /dev/null 2>&1; then
        echo -e "${YELLOW}⏹️  Deteniendo API actual...${NC}"
        kill $API_PID 2>/dev/null || true
        sleep 2
        if ps -p $API_PID > /dev/null 2>&1; then
            kill -9 $API_PID 2>/dev/null || true
        fi
        echo -e "${GREEN}✓ API detenida${NC}"
    fi
fi

echo ""
echo -e "${BLUE}🔨 Compilando nuevos cambios...${NC}"

cd "$BACKEND_DIR"
./mvnw clean package -DskipTests -q

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error al compilar${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Compilación exitosa${NC}"
echo ""

# Reiniciar API
echo -e "${BLUE}🚀 Reiniciando API...${NC}"

./mvnw spring-boot:run -Dspring-boot.run.profiles=dev > "$STATE_DIR/api.log" 2>&1 &
API_PID=$!
echo $API_PID > "$STATE_DIR/api.pid"

# Esperar a que la API esté lista
echo -e "${YELLOW}⏳ Esperando a que la API esté lista...${NC}"
for i in {1..60}; do
    if curl -s http://localhost:8080/api/v1/actuator/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓ API lista${NC}"
        break
    fi
    sleep 1
    echo -n "."
done
echo ""

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║         ✅ API RECARGADA                  ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}📊 Estado:${NC}"
echo -e "   ${GREEN}•${NC} API:        http://localhost:8080/api/v1"
echo -e "   ${GREEN}•${NC} Swagger:    http://localhost:8080/api/v1/swagger-ui.html"
echo -e "   ${GREEN}•${NC} PostgreSQL: Intacto (datos no tocados)"
echo -e "   ${GREEN}•${NC} Frontend:   Sigue corriendo"
echo ""
echo -e "${CYAN}📝 Ver logs:${NC}"
echo -e "   tail -f $STATE_DIR/api.log"
echo ""
echo -e "${GREEN}💡 Nota: La base de datos y todos los datos (usuarios, favoritos) siguen intactos${NC}"
echo ""

