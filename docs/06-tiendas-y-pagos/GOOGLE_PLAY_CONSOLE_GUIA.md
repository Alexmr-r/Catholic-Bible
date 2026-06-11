# 🤖 Guía de Configuración: Google Play Console y RevenueCat

Este documento consolida los pasos críticos realizados para habilitar la facturación en Android para CatholicVerse, superando las restricciones de Google Cloud.

## FASE 1: Superando el Bloqueo de Google Cloud (Service Account)
El mayor reto fue la imposibilidad de generar llaves de cuenta de servicio debido a políticas de organización (`iam.disableServiceAccountKeyCreation`).

### Pasos ejecutados:
1.  **Instalación de Herramientas:** Configuración de `gcloud` SDK en el entorno local.
2.  **Gestión de Políticas:** Uso de comandos `gcloud` para identificar y mitigar la restricción de creación de llaves.
3.  **Generación del JSON:** Creación exitosa de la Service Account y descarga del archivo de credenciales JSON. **Este archivo es la llave maestra para RevenueCat.**

## FASE 2: Identidad y Cuenta de Desarrollador
Google Play requiere una verificación de identidad humana/corporativa rigurosa.

- **Estado actual:** Verificación en proceso (espera estimada: 5 min - 24 h).
- **Acción:** Una vez aprobada, se procederá a la creación de la aplicación.

## FASE 3: Configuración en Google Play Console (Pendiente)
Pasos a seguir una vez verificada la cuenta:

1.  **Crear Aplicación:**
    - Nombre: `CatholicVerse`.
    - Tipo: Aplicación / Gratis.
    - **Package Name:** 🔴 `com.catholicverse.app` (Debe coincidir con `app.json`).
2.  **Productos Integrados:**
    - Configurar suscripciones: `premium_monthly` y `premium_yearly`.
3.  **Enlace de API:**
    - Ir a **Acceso a la API**.
    - Vincular el proyecto de Google Cloud donde se creó la Service Account.
    - Otorgar permisos de "Ver y administrar compras y suscripciones" y "Ver informes financieros".

## FASE 4: Conexión con RevenueCat
1.  **Subir JSON:** Cargar el archivo de la cuenta de servicio en el panel de RevenueCat (Settings > Apps > Google Play).
2.  **Validación:** Asegurarse de que todos los checks (Service Account, Permissions, API) estén en verde.

## FASE 5: Pruebas y Lanzamiento
- Configurar **Testers internos** en Google Play Console.
- Generar build de producción (`.aab`) mediante EAS.
- Validar flujo de compra en dispositivos Android reales.
