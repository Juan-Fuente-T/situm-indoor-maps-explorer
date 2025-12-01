### Proceso de instalación en local con Docker

## Prerrequisitos

- **Docker**
- **Docker Compose**

## Despliegue y Ejecución (Recomendado)

### Paso 1: Descomprimir el archivo

```bash
unzip situm-indoor-maps-explorer.zip
cd situm-indoor-maps-explorer
```

### Paso 2: Dar permisos a los scripts

```bash
chmod +x start.sh stop.sh clean.sh
```

### Paso 3: Ejecutar el script de inicio desde la raíz del proyecto

```bash
./start.sh
```

Este script:

✅ Verifica que Docker y Docker Compose estén instalados
✅ Instala dependencias (npm install en el contenedor)
✅ Construye la imágen del frontend
✅ Levanta el servidor NGINX
✅ Muestra la URL

### Paso 4: Acceder a la aplicación

    * **`http://localhost:8080`**

## Comandos Útiles

### Iniciar la app

docker-compose up

### Detener servicios

./stop.sh

### Detener servicios manualmente:

docker-compose down

### Ver logs en tiempo real

docker-compose logs -f

docker-compose logs -f situm-map-explorer

### Reiniciar servicios

docker-compose restart

### Limpiar todo (contenedores, imágenes y volúmenes de este proyecto)

./clean.sh

### Reconstruir desde cero

1. docker-compose down -v
2. docker-compose build --no-cache
3. docker-compose up -d

### Ver estado de los contenedores

docker-compose ps

## Solución de Problemas

### Error: "Puerto 8080 ya en uso"

##### Identificar proceso

lsof -ti:8080

##### Matar proceso

kill -9 $(lsof -ti:8080)
