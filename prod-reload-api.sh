#!/bin/bash

# =====================================================
# Script de Recarga API - Producción
# =====================================================
# Este script recarga SOLO la API cuando cambias código
# NO toca PostgreSQL ni los datos
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

echo ""
echo -e "${CYAN}╔═══════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   🔄 Recargando API - Producción         ║${NC}"
echo -e "${CYAN}╚═══════════════════════════════════════════╝${NC}"
echo ""

cd "$BACKEND_DIR"

# Verificar que Docker está corriendo
if ! docker ps | grep -q biblia-postgres; then
    echo -e "${RED}❌ PostgreSQL no está corriendo${NC}"
    echo -e "${YELLOW}   Ejecuta primero: ./prod-start.sh${NC}"
    exit 1
fi

echo -e "${BLUE}🔨 Reconstruyendo imagen de la API...${NC}"
echo -e "${YELLOW}   (Esto puede tardar 1-2 minutos)${NC}"
echo ""

# Rebuild solo la API (no toca postgres)
docker-compose build api

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error al construir la imagen${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✓ Imagen construida${NC}"
echo ""

echo -e "${BLUE}🔄 Reiniciando contenedor de la API...${NC}"

# Detener y recrear solo el contenedor de la API
docker-compose up -d --no-deps --force-recreate api

echo ""
echo -e "${YELLOW}⏳ Esperando a que la API esté lista...${NC}"

# Esperar a que la API responda
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
echo -e "   ${GREEN}•${NC} PostgreSQL: Intacto (datos no tocados) ✅"
echo ""
echo -e "${CYAN}📝 Ver logs:${NC}"
echo -e "   docker-compose logs -f api"
echo ""
echo -e "${GREEN}💡 Nota: La base de datos y todos los datos siguen intactos${NC}"
echo ""

