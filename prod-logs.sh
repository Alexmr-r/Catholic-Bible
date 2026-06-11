#!/bin/bash
echo "📋 Obteniendo logs del servidor de producción..."
ssh root@137.184.139.1 "docker logs --tail=100 biblia-api"
