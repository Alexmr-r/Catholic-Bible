# 🚀 Guía Rápida de Despliegue (VPS DigitalOcean)

Este documento resume los comandos necesarios para poner en marcha el Backend de CatholicVerse en un servidor Ubuntu limpio.

## 1. Preparación y Subida del Código
Desde tu Mac, genera el paquete y súbelo al servidor:

```bash
# 1. Crear el ZIP (excluyendo basura)
zip -r Biblia_Prod.zip . -x "*/node_modules/*" "*/target/*" "*/.git/*" "*/.expo/*"

# 2. Subir al servidor (DigitalOcean)
scp Biblia_Prod.zip root@137.184.139.1:/root/
```

## 2. Configuración del Servidor (Solo la primera vez)
Conéctate por SSH e instala las herramientas necesarias:

```bash
# Entrar al servidor
ssh root@137.184.139.1

# Instalar Docker, Docker Compose y Unzip
apt update && apt install -y docker.io docker-compose unzip
```

## 3. Arranque de la Aplicación
```bash
# Descomprimir
unzip Biblia_Prod.zip
cd Biblia

# Dar permisos y arrancar
chmod +x prod-start.sh
./prod-start.sh
```

## 4. Mantenimiento y Logs
- **Ver lo que pasa:** `docker-compose logs -f api`
- **Parar todo:** `docker-compose down`
- **Reiniciar:** `./prod-start.sh` (recompila y levanta todo de nuevo)

## 🛠️ Estrategia: Servidores Low-Cost (1GB RAM)
Cuando el servidor tiene pocos recursos (como el plan de 6$), la compilación interna de Docker puede fallar o congelar el sistema. Por ello, aplicamos la **Estrategia de Pre-compilación Local**:

1. **Compilar en Local (Mac):** `./mvnw package -DskipTests`
2. **Subir solo el binario:** Se sube el `.jar` ya "cocinado".
3. **Dockerfile Ligero:** Se usa una versión de Dockerfile que solo arranca el archivo, sin compilar nada.

> [!TIP]
> **Futuro:** Cuando escales a un servidor de 4GB+ RAM, es recomendable volver a la compilación interna (CI/CD) para que el despliegue sea 100% automático desde el código fuente.
