#!/bin/bash

# =====================================================
# Script de Detención - Modo Desarrollo
# =====================================================

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STATE_DIR="$SCRIPT_DIR/.dev-state"

echo ""
echo -e "${CYAN}🛑 Deteniendo servicios de desarrollo...${NC}"
echo ""

# Detener Expo (puede estar como proceso directo o background)
if [ -f "$STATE_DIR/expo.pid" ]; then
    EXPO_PID=$(cat "$STATE_DIR/expo.pid")
    if ps -p $EXPO_PID > /dev/null 2>&1; then
        echo -e "${YELLOW}⏹️  Deteniendo Expo...${NC}"
        kill $EXPO_PID 2>/dev/null || true
        sleep 1
        echo -e "${GREEN}✓ Expo detenido${NC}"
    fi
    rm "$STATE_DIR/expo.pid" 2>/dev/null || true
fi

# También buscar procesos de node/expo por si acaso
pkill -f "expo start" 2>/dev/null || true
pkill -f "react-native start" 2>/dev/null || true

# Detener API
if [ -f "$STATE_DIR/api.pid" ]; then
    API_PID=$(cat "$STATE_DIR/api.pid")
    if ps -p $API_PID > /dev/null 2>&1; then
        echo -e "${YELLOW}⏹️  Deteniendo API...${NC}"
        kill $API_PID 2>/dev/null || true
        sleep 2
        # Force kill si sigue vivo
        if ps -p $API_PID > /dev/null 2>&1; then
            kill -9 $API_PID 2>/dev/null || true
        fi
        echo -e "${GREEN}✓ API detenida${NC}"
    fi
    rm "$STATE_DIR/api.pid" 2>/dev/null || true
fi

# Detener PostgreSQL (opcional)
echo ""
echo -e "${YELLOW}¿Deseas detener PostgreSQL también? (s/n)${NC}"
read -r stop_postgres

if [[ "$stop_postgres" == "s" || "$stop_postgres" == "S" ]]; then
    cd "$SCRIPT_DIR/BibliaBackend"
    docker-compose stop postgres
    echo -e "${GREEN}✓ PostgreSQL detenido${NC}"
else
    echo -e "${CYAN}ℹ️  PostgreSQL sigue corriendo (útil para el próximo inicio)${NC}"
fi

echo ""
echo -e "${GREEN}✅ Servicios detenidos${NC}"
echo ""
echo -e "${CYAN}💡 Para volver a iniciar: ./dev-start.sh${NC}"
echo ""

