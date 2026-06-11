#!/bin/bash
echo "📋 Filtrando logs del backend en el servidor..."
ssh root@137.184.139.1 "docker logs biblia-api 2>&1 | grep -E -i 'chat|rag|search|extracted|cloudflare|error'"
