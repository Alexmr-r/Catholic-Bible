#!/bin/bash

# =====================================================
# Script de Recarga de Backend - Modo Producción/Docker
# =====================================================
# Usa este script cuando cambies:
# - Enums (como HighlightColor)
# - Modelos de base de datos
# - Configuración de Spring
# - DTOs o Controllers
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
STATE_DIR="$SCRIPT_DIR/.dev-state"

echo ""
echo -e "${CYAN}╔═══════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   🐳 Reconstruyendo Backend en Docker    ║${NC}"
echo -e "${CYAN}╚═══════════════════════════════════════════╝${NC}"
echo ""

# =====================================================
# 1. Detener todos los procesos que usen puerto 8080
# =====================================================
echo -e "${BLUE}🛑 Liberando puerto 8080...${NC}"

EXISTING_PID=$(lsof -ti:8080 2>/dev/null || true)
if [ ! -z "$EXISTING_PID" ]; then
    echo -e "${YELLOW}   Matando proceso(s): $EXISTING_PID${NC}"
    kill -9 $EXISTING_PID 2>/dev/null || true
    sleep 1
    echo -e "${GREEN}✓ Puerto 8080 liberado${NC}"
else
    echo -e "${GREEN}✓ Puerto 8080 ya está libre${NC}"
fi

echo ""

# =====================================================
# 2. Bajar contenedores actuales
# =====================================================
echo -e "${BLUE}📦 Bajando contenedores Docker...${NC}"

cd "$BACKEND_DIR"
docker-compose down

echo -e "${GREEN}✓ Contenedores detenidos${NC}"
echo ""

# =====================================================
# 3. Recompilar Backend (con Maven local)
# =====================================================
echo -e "${BLUE}🔨 Recompilando backend...${NC}"
echo -e "${YELLOW}   (Esto tomará ~5-10 segundos)${NC}"

./mvnw clean package -DskipTests

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backend recompilado exitosamente${NC}"
else
    echo -e "${RED}❌ Error al recompilar el backend${NC}"
    exit 1
fi

echo ""

# =====================================================
# 4. Reconstruir imagen Docker SIN CACHÉ
# =====================================================
echo -e "${BLUE}🐳 Reconstruyendo imagen Docker (sin caché)...${NC}"
echo -e "${YELLOW}   (Esto tomará ~40-50 segundos)${NC}"

docker-compose build --no-cache api

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Imagen Docker reconstruida${NC}"
else
    echo -e "${RED}❌ Error al reconstruir imagen Docker${NC}"
    exit 1
fi

echo ""

# =====================================================
# 5. Levantar contenedores
# =====================================================
echo -e "${BLUE}🚀 Levantando contenedores...${NC}"

docker-compose up -d

# Esperar a que PostgreSQL esté healthy
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

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║         ✅ BACKEND RECONSTRUIDO EN DOCKER                 ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}📊 Servicios corriendo (en Docker):${NC}"
echo -e "   ${GREEN}•${NC} PostgreSQL:  localhost:5432"
echo -e "   ${GREEN}•${NC} API Backend: http://localhost:8080/api/v1"
echo -e "   ${GREEN}•${NC} Swagger:     http://localhost:8080/api/v1/swagger-ui.html"
echo ""
echo -e "${CYAN}🔧 Comandos útiles:${NC}"
echo -e "   ${GREEN}•${NC} Ver logs API:       ${YELLOW}docker-compose -f BibliaBackend/docker-compose.yml logs -f api${NC}"
echo -e "   ${GREEN}•${NC} Ver logs Postgres:  ${YELLOW}docker-compose -f BibliaBackend/docker-compose.yml logs -f postgres${NC}"
echo -e "   ${GREEN}•${NC} Detener:            ${YELLOW}cd BibliaBackend && docker-compose down${NC}"
echo -e "   ${GREEN}•${NC} Recargar otra vez:  ${YELLOW}./prod-reload-backend.sh${NC}"
echo ""
echo -e "${GREEN}✨ Listo! Recarga tu app para ver los cambios${NC}"
echo ""

# Abrir Swagger si está disponible
if command -v open &> /dev/null; then
    echo -e "${CYAN}🌐 Abriendo Swagger en el navegador...${NC}"
    sleep 2
    open http://localhost:8080/api/v1/swagger-ui.html 2>/dev/null || true
    echo ""
fi

