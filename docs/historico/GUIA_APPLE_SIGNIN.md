# Guía Completa de Configuración: Apple Sign-In

Para que el inicio de sesión con Apple funcione correctamente tanto en la aplicación nativa (obligatorio para la App Store si usas Google) como en la verificación del backend, debes realizar varios pasos burocráticos en el portal de Apple.

## 1. Configurar el App ID (Apple Developer Portal)
1. Ve a [Certificates, Identifiers & Profiles](https://developer.apple.com/account/resources/identifiers/list) en tu cuenta de Apple Developer.
2. Selecciona **Identifiers** y busca el App ID de tu aplicación (el "Bundle ID", por ejemplo: `com.tuempresa.biblia`).
3. En la lista de *Capabilities*, marca la casilla **Sign In with Apple**.
4. Dale a **Edit**, selecciona **Enable as a primary App ID** y guarda los cambios.

## 2. Crear un Service ID (Solo si usas Web/Backend puro adicionalmente)
*Nota: Si solo lo haces desde la app nativa conectada a tu backend con Firebase, esto a veces se omite. Pero es la mejor práctica.*
1. En **Identifiers**, haz clic en **(+)** y elige **Services IDs**.
2. Ponle un nombre (ej. `Biblia Web Client`) y un identificador (ej. `com.tuempresa.biblia.web`).
3. Activa **Sign In with Apple** y en **Configure** asócialo a tu Primary App ID.

## 3. Generar la Clave Privada (.p8)
El backend necesita esta clave para validar que el login vino de Apple.
1. En el menú izquierdo ve a **Keys** y pulsa **(+)**.
2. Nómbralo (ej. `Apple Sign In API Key`).
3. Marca la casilla **Sign In with Apple**, haz clic en **Configure** y asócialo a tu Primary App ID.
4. Presiona **Register** y luego **Download**. 
5. **MUY IMPORTANTE:** Se descargará un archivo `.p8`. Guárdalo en un lugar seguro porque Apple solo te deja descargarlo **una vez**.
6. Anota tu **Key ID** (aparece en esa misma pantalla).
7. Anota tu **Team ID** (aparece arriba a la derecha en la cuenta de developer).

## 4. Configurar el Backend (Variables de Entorno)
Con los datos recopilados, tu backend necesitará estas variables para la validación:
* `APPLE_TEAM_ID` (Tu Team ID de 10 caracteres)
* `APPLE_CLIENT_ID` (Tu Bundle ID normal para iOS)
* `APPLE_KEY_ID` (El ID de la key del paso 3)
* `APPLE_PRIVATE_KEY` (El contenido de tu archivo `.p8`)

## 5. Configurar Expo (Frontend)
Asegúrate de que tienes instalada la librería en `BibliaAppExpo`:
```bash
npx expo install expo-apple-authentication
```
En tu `app.json`, asegúrate de tener el plugin habilitado para que EAS cree el entitlement automáticamente al compilar:
```json
{
  "expo": {
    "plugins": [
      "expo-apple-authentication"
    ]
  }
}
```

¡Con esto configurado, el flujo de Apple en el dispositivo validará las peticiones perfectamente con tu servidor!
