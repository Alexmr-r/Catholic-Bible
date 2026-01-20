#!/bin/bash
# Script para ejecutar la importación de datos de la Biblia

cd "$(dirname "$0")"

echo "Activando entorno virtual..."
source venv/bin/activate

echo "Ejecutando script de importación..."
python import_bible_data.py

deactivate

