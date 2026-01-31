#!/bin/bash

# =====================================================
# Script de Recarga de Backend - Modo Desarrollo
# =====================================================
# Usa este script cuando cambies código Java en desarrollo
# y quieras recompilar sin afectar la base de datos
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
echo -e "${CYAN}║   🔄 Recargando Backend - Modo Dev       ║${NC}"
echo -e "${CYAN}╚═══════════════════════════════════════════╝${NC}"
echo ""

# =====================================================
# 1. Detener API actual
# =====================================================
echo -e "${BLUE}🛑 Deteniendo API en ejecución...${NC}"

# Buscar procesos en puerto 8080
EXISTING_PID=$(lsof -ti:8080 2>/dev/null || true)
if [ ! -z "$EXISTING_PID" ]; then
    echo -e "${YELLOW}   Matando proceso(s): $EXISTING_PID${NC}"
    kill -9 $EXISTING_PID 2>/dev/null || true
    sleep 1
    echo -e "${GREEN}✓ API detenida${NC}"
else
    echo -e "${GREEN}✓ No hay API corriendo${NC}"
fi

# También intentar desde el archivo PID guardado
if [ -f "$STATE_DIR/api.pid" ]; then
    OLD_PID=$(cat "$STATE_DIR/api.pid")
    kill -9 $OLD_PID 2>/dev/null || true
    rm -f "$STATE_DIR/api.pid"
fi

echo ""

# =====================================================
# 2. Recompilar Backend
# =====================================================
echo -e "${BLUE}🔨 Recompilando backend...${NC}"
echo -e "${YELLOW}   (Esto tomará ~5-10 segundos)${NC}"

cd "$BACKEND_DIR"
./mvnw clean compile -DskipTests -q

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backend recompilado exitosamente${NC}"
else
    echo -e "${RED}❌ Error al recompilar el backend${NC}"
    exit 1
fi

echo ""

# =====================================================
# 3. Reiniciar API
# =====================================================
echo -e "${BLUE}🚀 Reiniciando API...${NC}"

# Crear directorio de estado si no existe
mkdir -p "$STATE_DIR"

# Iniciar API en background
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

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              ✅ BACKEND RECARGADO                         ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}📊 Servicios corriendo:${NC}"
echo -e "   ${GREEN}•${NC} API Backend: http://localhost:8080/api/v1"
echo -e "   ${GREEN}•${NC} Swagger:     http://localhost:8080/api/v1/swagger-ui.html"
echo -e "   ${GREEN}•${NC} PID:         $API_PID"
echo ""
echo -e "${CYAN}🔧 Comandos útiles:${NC}"
echo -e "   ${GREEN}•${NC} Ver logs:     ${YELLOW}tail -f $STATE_DIR/api.log${NC}"
echo -e "   ${GREEN}•${NC} Detener:      ${YELLOW}./dev-stop.sh${NC}"
echo -e "   ${GREEN}•${NC} Recargar otra vez: ${YELLOW}./dev-reload-backend.sh${NC}"
echo ""
echo -e "${GREEN}✨ Listo! Recarga tu app para ver los cambios${NC}"
echo ""

