#!/bin/bash

YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🧹 Iniciando limpieza profunda...${NC}"

# Detener contenedores y borrar volúmenes
docker-compose down -v

# Borrar la imagen huérfana creada por este proyecto
docker-compose down -v --rmi local

echo -e "${YELLOW}✨ Entorno limpio.${NC}"