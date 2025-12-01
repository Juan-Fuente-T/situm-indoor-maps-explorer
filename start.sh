#!/bin/bash

echo "================================================"
echo "  Iniciando SITUM MAPS EXPLORER TEST"
echo "================================================"


# Colores para los logs
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Iniciando entorno Situm Test...${NC}"

# Verificar que Docker esté instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker no está instalado"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Error: Docker Compose no está instalado"
    exit 1
fi

# Verificar si Docker está corriendo
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker no se está ejecutando."
    exit 1
fi

# Construir y levantar
echo -e "${GREEN}📦 Construyendo contenedores...${NC}"
docker-compose up --build -d

echo -e "${GREEN}🚀 Levantando servicios...${NC}"
docker-compose up -d

echo -e "${GREEN}✅ ¡Listo! Aplicación disponible en:${NC}"
echo -e "   👉 http://localhost:8080"
echo -e "${GREEN}📋 Ver logs: docker-compose logs -f"
echo -e "${GREEN}🛑 Detener:  docker-compose down"