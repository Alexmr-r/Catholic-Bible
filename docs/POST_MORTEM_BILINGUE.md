# 📜 Informe de Post-Mortem: Soporte Multi-idioma (Español)

> **Fecha:** 30 de Abril de 2026  
> **Estado:** Pospuesto para V2.0  
> **Resultado:** Fallido debido a limitaciones técnicas de los activos de origen (EPUB) y seguridad web (Cloudflare).

## 🎯 Objetivo Inicial
Integrar la Biblia Católica "Torres Amat" en español como segunda lengua de la aplicación para el lanzamiento del 6 de junio.

## 🚧 Bloqueos Críticos (Análisis Técnico)

### 1. Corrupción del Activo EPUB
- **Problema:** El archivo obtenido de Archive.org (`lasagradabiblian1415torr.epub`) estaba incompleto (solo contenía el Nuevo Testamento, volúmenes 14 y 15).
- **OCR Deficiente:** El reconocimiento de texto (OCR) del escaneo original tiene una precisión estimada inferior al 30%, resultando en miles de palabras rotas (ej: "JesuChrislo", "Pheüppe").
- **Ruido Técnico:** El archivo contenía miles de líneas de código CSS embebido que dificultaban la extracción limpia mediante IA.

### 2. Restricciones de API de Terceros
- **Google Gemini API:** El uso de la File API para procesamiento de documentos pesados fue bloqueado repetidamente con errores `403 Access Denied` (posibles restricciones regionales o de cuota de tier gratuito para archivos externos).

### 3. Seguridad Perimetral Web (Scraping)
- **Cloudflare Shield:** Las fuentes alternativas en la web (como `bibliacatolica.com.br`) implementan protecciones anti-bot de última generación. Incluso utilizando técnicas avanzadas de bypass (`cloudscraper`), el bloqueo persistió.

### 4. Limitaciones de Inferencia Local
- **Ollama:** Aunque es una herramienta potente, la falta del modelo `llama3` pre-instalado y la bajísima calidad del texto extraído del EPUB hacían que la modernización de los versículos fuera inviable.

## 💡 Recomendaciones para el Futuro
- **Adquisición de Datos:** No intentar extraer texto de escaneos de libros antiguos. Se recomienda buscar una licencia oficial en JSON o SQL de una traducción moderna (ej: Biblia de Jerusalén o Nácar-Colunga) cuando el proyecto genere ingresos.
- **Enfoque V1:** Centrar el 100% de los recursos en pulir la experiencia en **Inglés (Versión Católica)** para garantizar un lanzamiento exitoso y profesional el 6 de junio.

---
*Este documento sirve como registro para evitar repetir ciclos de desarrollo fallidos con las mismas fuentes de datos.*
