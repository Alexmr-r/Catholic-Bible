# 📖 Guía Explicativa de la Suite de Tests Unitarios

Esta guía explica de forma muy sencilla y práctica qué hace cada uno de los tests que hemos implementado para CatholicVerse.

---

## 🛠️ Backend (Java & Spring Boot)

Los tests del backend aseguran que las reglas de negocio, la seguridad y el procesamiento de la Biblia funcionen siempre a la perfección.

### 1. Modelos de Dominio (Domain Models)
Los modelos son las piezas de datos más básicas de la app. Los probamos sin bases de datos ni internet, solo asegurando su comportamiento lógico.

*   **`UserTest.java` (Usuario):**
    *   *¿Qué hace?* Comprueba si el usuario tiene acceso premium o si su periodo de prueba de 7 días está activo o ha caducado.
    *   *Ejemplo:* Si creamos un usuario que empezó su prueba hace 3 días, el test verifica que `isTrialActive()` sea `true`. Si empezó hace 8 días, verifica que sea `false`. También prueba si el usuario puede iniciar sesión (`canLogin()`), lo cual requiere que esté activo y con email verificado.
*   **`VerseTest.java` (Versículos):**
    *   *¿Qué hace?* Verifica cómo se procesa el texto de los versículos.
    *   *Ejemplo:* Asegura que al buscar una palabra como "dios", la encuentre aunque en el versículo esté escrita como "Dios" (búsqueda insensible a mayúsculas/minúsculas).
*   **`DailyReadingTest.java` (Lectura Diaria):**
    *   *¿Qué hace?* Controla el formato de las lecturas litúrgicas del día.
    *   *Ejemplo:* Si la lectura incluye los versículos 16, 17 y 18 del capítulo 3 de Juan, el test asegura que se formatee correctamente como `"San Juan 3:16-18"`.
*   **`FavoriteTest.java` (Favoritos):**
    *   *¿Qué hace?* Comprueba la gestión de etiquetas (tags) y notas en los versículos favoritos del usuario.
    *   *Ejemplo:* Asegura que la referencia de un favorito siempre se muestre simplificada como `"Génesis 1"` (sin el versículo individual) según el diseño visual acordado.

---

### 2. Servicios de Dominio (Domain Services)
Aquí se prueban las reglas de negocio que interactúan con la base de datos (usando simuladores llamados *Mocks*).

*   **`UserServiceTest.java` (Servicio de Usuario):**
    *   *¿Qué hace?* Prueba acciones críticas de la cuenta.
    *   *Ejemplo:* Al cambiar la contraseña, el test comprueba que si pones la misma contraseña actual, el sistema lance un error diciendo *"La nueva contraseña debe ser diferente a la actual"*. También verifica que si pones mal tu contraseña actual, no te permita cambiarla.
*   **`ReadingProgressServiceTest.java` (Servicio de Progreso y Racha):**
    *   *¿Qué hace?* Calcula la racha de días consecutivos que el usuario lleva leyendo la Biblia.
    *   *Ejemplo:* Si el usuario registra una lectura hoy, ayer y anteayer, el test verifica que la racha sea `3`. Si la última lectura fue hace 3 días, la racha se calcula en `0` (racha rota).

---

### 3. Seguridad y Tokenización
*   **`JwtTokenProviderTest.java` (Seguridad JWT):**
    *   *¿Qué hace?* Es el corazón de la seguridad. Valida la llave de seguridad (token JWT) que permite a la app móvil saber quién es el usuario.
    *   *Ejemplo:* Asegura que tras hacer "Cerrar sesión" (logout), el token utilizado pase a una lista de invalidados y ya no sirva para hacer consultas, protegiendo la cuenta.

---

## 📱 Frontend (React Native & TypeScript)

Los tests en la app móvil garantizan que la interfaz responda correctamente, valide bien la información y soporte el **modo sin conexión (offline)**.

*   **`validation.test.ts` (Validaciones):**
    *   *¿Qué hace?* Valida lo que el usuario escribe en las cajas de texto antes de mandarlo al servidor.
    *   *Ejemplo:* Comprueba que un email como `correo@dominio.com` sea considerado válido y que `correo.com` (sin `@`) sea rechazado. También exige contraseñas de al menos 8 caracteres.
*   **`cache.service.test.ts` (Modo Offline - Almacenamiento Local):**
    *   *¿Qué hace?* Es vital para que la app funcione sin internet. Prueba que las reflexiones (writings) y favoritos se guarden en la memoria física del teléfono móvil.
    *   *Ejemplo:* Prueba que si creas una reflexión sin conexión, el sistema le asigne un identificador temporal (`temp_xxxx`) y la guarde en una cola de "sincronización pendiente" para que se envíe al servidor automáticamente al recuperar señal.
*   **`api.client.test.ts` (Cliente de Red):**
    *   *¿Qué hace?* Controla la comunicación HTTP con el backend.
    *   *Ejemplo:* Verifica que si el servidor devuelve un error de autenticación (código 401), la app sepa capturarlo y lanzar un error de "No autorizado" para redirigir al Login.
*   **`auth.service.test.ts` (Servicio de Autenticación):**
    *   *¿Qué hace?* Asegura que los tokens recibidos por el servidor se guarden correctamente de forma segura en el almacenamiento local de tu teléfono.
