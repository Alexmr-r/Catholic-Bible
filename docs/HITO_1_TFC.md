# Hito 1: Propuesta de Proyecto de Fin de Ciclo (TFC)
## Proyecto: CatholicVerse

**ABSTRACT:**
CatholicVerse es una plataforma móvil premium e integral diseñada para la comunidad católica, que fusiona la lectura espiritual con herramientas avanzadas de productividad y estudio, incluyendo apoyo de IA para enriquecer la experiencia de aprendizaje. La aplicación ofrece una experiencia inmersiva de la Sagrada Biblia (CPDV en inglés como base actual), complementada con un calendario litúrgico dinámico, toma de notas enriquecidas con soporte multimedia, gestión de favoritos y un sistema de sincronización en tiempo real. Mediante una arquitectura robusta (Spring Boot + React Native) y un diseño orientado al usuario con estética premium, CatholicVerse permite a los fieles profundizar en su fe tanto de manera individual como comunitaria, garantizando el acceso a la Palabra de Dios en cualquier momento y lugar a través de su avanzado modo offline y arquitectura de datos local.

**MI MOTIVACIÓN:**
La motivación principal del proyecto reside en la carencia de soluciones digitales que equilibren el rigor teológico con una experiencia de usuario moderna y fluida. Tras analizar el mercado actual, se detectó una falta de aplicaciones que ofrezcan avisos efectivos de lecturas diarias, sincronización instantánea entre dispositivos y una experiencia integral para tomar apuntes de estudio bíblico de manera eficiente. Mi objetivo es crear una herramienta que no solo sirva para leer, sino que se convierta en el compañero espiritual definitivo, eliminando las fricciones técnicas y ofreciendo un entorno premium que invite a la reflexión y el estudio diario, con el potencial de escalar como un modelo de negocio SaaS exitoso.

**REQUISITOS DEL PROYECTO:**
Facilitar el estudio y la vivencia de la fe católica mediante una herramienta integral que combine la lectura bíblica, la planificación espiritual y la gestión de apuntes personales, promoviendo la consistencia y el crecimiento espiritual en un solo lugar.

**Funcionales:**
*   **Gestión Bíblica:** Acceso completo a los 73 libros de la Biblia Católica con navegación rápida y búsqueda avanzada.
*   **Favoritos:** Guardado y consulta de versículos y lecturas marcadas por el usuario.
*   **Calendario Litúrgico:** Visualización de lecturas y salmos correspondientes al día actual.
*   **Toma de Notas:** Creación de apuntes enriquecidos (texto, imágenes, listas) vinculados directamente a versículos.
*   **Personalización de Lectura:** Ajustes de tamaño de fuente y temas de color para mejorar legibilidad.
*   **Búsqueda por Voz:** Soporte de micrófono para iniciar búsquedas bíblicas desde la UI.
*   **IA de Apoyo al Estudio:** Funcionalidades asistidas por IA para enriquecer la experiencia del usuario.
*   **Correos Transaccionales:** Envío de emails de recuperación mediante Resend.
*   **Suscripciones:** Gestión del acceso premium mediante RevenueCat y paywall.
*   **Sincronización:** Persistencia de datos en tiempo real entre dispositivos mediante Firebase y Backend propietario.
*   **Premium Access:** Prueba gratuita de 7 días y, al vencer, acceso mediante suscripción gestionada por RevenueCat con paywall.
*   **Modo Offline:** Arquitectura de persistencia local que permite el uso total de la app sin conexión.

**No Funcionales:**
*   **Interfaz Premium:** Diseño moderno, minimalista y responsivo basado en principios de "Rich Aesthetics".
*   **Alta Disponibilidad:** Infraestructura escalable desplegada en DigitalOcean con contenedores Docker.
*   **Seguridad:** Cifrado de datos sensibles y autenticación robusta mediante JWT y Social Logins (Google/Apple).
*   **Rendimiento:** Optimización de tiempos de respuesta mediante Arquitectura Hexagonal y caching de datos.
*   **Compatibilidad:** Aplicación multiplataforma nativa para iOS y Android.
*   **Cuentas y Consolas:** Alta de cuentas y configuración en Google Cloud, Google Play Console y App Store Connect.
*   **Publicación en Stores:** Cumplimiento de requisitos y conexión con Google Play Console y App Store Connect.

**PLAN DE PROYECTO:**

| Fase | Descripción | Fecha de Inicio | Fecha de Fin | Esfuerzo (Horas) |
| :--- | :--- | :--- | :--- | :--- |
| **Análisis de Requisitos** | Recolección de funcionalidades, benchmarking y definición de stack tecnológico. | 01/09/2025 | 30/09/2025 | 60 |
| **Diseño y UX** | Creación de maquetas de alta fidelidad y definición de la identidad visual premium. | 01/10/2025 | 31/10/2025 | 100 |
| **Arquitectura de Sistema** | Modelado de la base de datos PostgreSQL y definición de la API REST Hexagonal. | 01/11/2025 | 15/11/2025 | 80 |
| **Desarrollo Backend** | Implementación de microservicios con Spring Boot, seguridad y lógica de negocio. | 16/11/2025 | 15/01/2026 | 350 |
| **Desarrollo Frontend** | Construcción de la App en React Native, integración de Biblia y navegación. | 16/01/2026 | 31/03/2026 | 450 |
| **Integración y Sync** | Implementación de Firebase, RevenueCat y modo offline inteligente. | 01/04/2026 | 30/04/2026 | 120 |
| **Pruebas y QA** | Validación cruzada en dispositivos, corrección de bugs y optimización de carga. | 01/05/2026 | 15/05/2026 | 100 |
| **Implementación Final** | Retoques de seguridad, alta de cuentas y conexión con Google Cloud/Play Store/App Store Connect, despliegue en producción (Docker), publicación en Play Store/App Store, documentación del TFC y lanzamiento. | 16/05/2026 | 31/05/2026 | 40 |

**Total estimado de esfuerzo:** 1400 horas.
