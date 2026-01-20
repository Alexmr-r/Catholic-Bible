#!/bin/bash

# =====================================================
# Script de Detención - Producción
# =====================================================

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/BibliaBackend"

echo ""
echo -e "${CYAN}🛑 Deteniendo servicios de producción...${NC}"
echo ""

cd "$BACKEND_DIR"

echo -e "${YELLOW}¿Qué deseas hacer?${NC}"
echo "1) Detener contenedores (mantener datos)"
echo "2) Detener y eliminar contenedores (mantener datos)"
echo "3) Detener y eliminar TODO incluyendo datos ⚠️"
echo ""
read -p "Opción (1/2/3): " option

case $option in
    1)
        echo ""
        echo -e "${YELLOW}⏹️  Deteniendo contenedores...${NC}"
        docker-compose stop
        echo -e "${GREEN}✓ Contenedores detenidos${NC}"
        echo -e "${CYAN}💡 Para reiniciar: docker-compose start${NC}"
        ;;
    2)
        echo ""
        echo -e "${YELLOW}⏹️  Deteniendo y eliminando contenedores...${NC}"
        docker-compose down
        echo -e "${GREEN}✓ Contenedores eliminados${NC}"
        echo -e "${GREEN}✓ Datos persisten en el volumen${NC}"
        echo -e "${CYAN}💡 Para reiniciar: ./prod-start.sh${NC}"
        ;;
    3)
        echo ""
        echo -e "${RED}⚠️  ADVERTENCIA: Esto eliminará TODOS los datos${NC}"
        echo -e "${YELLOW}   (usuarios, favoritos, versículos, TODO)${NC}"
        echo ""
        read -p "¿Estás seguro? (escribe 'SI' para confirmar): " confirm

        if [ "$confirm" == "SI" ]; then
            echo ""
            echo -e "${YELLOW}⏹️  Eliminando todo...${NC}"
            docker-compose down -v

            # Eliminar estado
            rm -rf "$SCRIPT_DIR/.prod-state"

            echo -e "${GREEN}✓ Todo eliminado${NC}"
            echo -e "${CYAN}💡 Para reiniciar desde cero: ./prod-start.sh${NC}"
        else
            echo -e "${CYAN}Operación cancelada${NC}"
        fi
        ;;
    *)
        echo -e "${RED}Opción inválida${NC}"
        exit 1
        ;;
esac

echo ""

