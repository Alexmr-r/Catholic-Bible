# 🏛️ CatholicVerse - Resumen del Arreglo de Autenticación (Mayo 2026)

## 1. El Problema Original
El backend rechazaba los tokens de iOS/Android con el error `Token de Google inválido`. Esto ocurría porque el servidor estaba configurado con Client IDs antiguos y no aceptaba los nuevos de Firebase.

## 2. Los Bloqueos (Por qué tardamos 2 días)
- **Compilación Fantasma:** El servidor estaba compilando su propio código fuente viejo en lugar de usar el JAR que subíamos desde Mac.
- **Error del "32332":** Un error de "Buscar y Reemplazar" rompió el archivo SQL de migraciones (`V11`), convirtiendo los símbolos `$$` de PostgreSQL en el número `32332`. Esto hacía que la base de datos crasheara al arrancar.
- **Integridad Referencial:** Los IDs de los libros en las lecturas diarias no coincidían con los IDs de la tabla maestra (ej. `ii thessalonians` vs `2thessalonians`).

## 3. La Solución Definitiva
1.  **Sincronización Total:** Se actualizaron los Client IDs en `AuthenticationService.java` para aceptar tanto los de Firebase como los de Google Console.
2.  **Optimización del Despliegue:** Se creó un nuevo `prod-start.sh` en el Mac que automatiza todo (Compila -> Sube JAR -> Reinicia Docker).
3.  **Dockerfile de Producción:** Se cambió el Dockerfile para que **NO** compile en el servidor, sino que use directamente el JAR del Mac. Esto garantiza que lo que probamos en local sea exactamente lo que corre en la nube.
4.  **Corrección de Datos:** Se arregló el script SQL `V11` eliminando el error `32332` y mapeando correctamente los IDs de los libros.

## 4. Estado Actual
- **iOS:** ✅ FUNCIONANDO
- **Android:** ⚠️ Pendiente de SHA-1 (`DEVELOPER_ERROR`)
- **Traducciones:** ⚠️ Pendiente corregir aviso de descarga.

---
*Documento generado para referencia futura. ¡No volveremos a caer en el agujero del 32332!* 🚀
