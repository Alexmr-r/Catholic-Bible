#!/bin/bash

echo "╔═══════════════════════════════════════════╗"
echo "║   🚀 Biblia Católica - DEPLOY RAPIDO     ║"
echo "╚═══════════════════════════════════════════╝"

# 1. Asegurar que el Dockerfile sea el de producción (usar JAR)
cat <<DOCKER > ./BibliaBackend/Dockerfile
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY biblia-api-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
DOCKER

# 2. Verificar si el JAR existe
if [ ! -f "./BibliaBackend/target/biblia-api-1.0.0.jar" ]; then
    echo "❌ ERROR: No se encuentra el archivo ./BibliaBackend/target/biblia-api-1.0.0.jar"
    echo "Ejecuta primero: cd BibliaBackend && ./mvnw clean install -DskipTests"
    exit 1
fi

# 3. Subir al servidor (opcional pero recomendado)
echo "📤 Subiendo el JAR al servidor..."
scp ./BibliaBackend/target/biblia-api-1.0.0.jar root@137.184.139.1:/root/BibliaBackend/

# 4. Ejecutar el arranque en el servidor
echo "🐳 Reiniciando servidor remoto..."
ssh root@137.184.139.1 "cat <<'DOCK' > /root/BibliaBackend/Dockerfile
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY biblia-api-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT [\"java\", \"-jar\", \"app.jar\"]
DOCK
cd /root/BibliaBackend && docker compose down && docker compose up -d --build api"

echo "✅ ¡Despliegue completado! Comprueba el iPhone en 30 segundos."
