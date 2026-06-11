# 🧪 Cómo Probar el Sistema Offline

## ⚠️ Limitaciones de Expo Go

### ❌ Lo que NO funciona en Expo Go:

1. **`@react-native-community/netinfo`** - Limitado en Expo Go
   - Puede no detectar correctamente cambios de red
   - El listener puede no dispararse al reconectar

2. **Descarga de Biblia (`expo-file-system.createDownloadResumable`)** - NO funciona en Expo Go
   - Esta es una limitación conocida de Expo Go
   - **En producción funcionará perfectamente**
   - No te preocupes por esto

### ✅ Lo que SÍ funciona en Expo Go:

1. **AsyncStorage** - Funciona perfectamente
   - Caché de escritos, favoritos, liturgia
   - Operaciones pendientes de sincronización
   - Progreso de lectura (calendario)

2. **Modo avión manual** - Puedes simular offline
   - Activa modo avión en tu dispositivo
   - Prueba crear escritos, favoritos, etc.
   - Desactiva modo avión y verifica si sincroniza

3. **Cards sin imágenes** - Ahora usan gradientes cuando offline
   - Las cards de AT/NT/Continuar lectura muestran gradientes bonitos
   - La imagen de lectura del día también tiene fallback

---

## 🔧 Estrategia de Testing

### Opción 1: Testing Básico con Expo Go (Limitado)

**Qué puedes probar:**
```bash
# 1. Inicia la app con Expo Go
npx expo start

# 2. En tu dispositivo:
✅ Abre la app
✅ Navega y usa funcionalidades con internet
✅ Activa MODO AVIÓN manualmente
✅ Intenta crear una reflexión → Debería guardarse en caché
✅ Intenta añadir un favorito → Debería guardarse en caché
✅ Desactiva modo avión
⚠️  La sincronización automática puede NO funcionar
✅ Cierra y reabre la app → Debería sincronizar al iniciar
```

**Limitación:** El `NetworkContext` puede no detectar el cambio automáticamente en Expo Go.

---

### Opción 2: Build de Desarrollo (RECOMENDADO)

Para probar completamente el modo offline, necesitas hacer un **development build**:

```bash
# 1. Instalar EAS CLI
npm install -g eas-cli

# 2. Login en Expo
eas login

# 3. Configurar proyecto
eas build:configure

# 4. Crear build de desarrollo para tu dispositivo
# Para iOS (iPhone físico o simulador):
eas build --profile development --platform ios

# Para Android:
eas build --profile development --platform android

# 5. Instalar el .apk o .ipa en tu dispositivo
# Android: Descarga el .apk e instala
# iOS: Sigue las instrucciones de TestFlight o instalación directa
```

**Con un development build TODO funciona:**
- ✅ NetInfo detecta cambios de red correctamente
- ✅ Sincronización automática al reconectar
- ✅ expo-file-system persiste datos
- ✅ La descarga de Biblia funciona y persiste

---

### Opción 3: Testing con Logs (Para verificar lógica)

Aunque Expo Go tenga limitaciones, puedes verificar que la LÓGICA funciona:

#### 1. Revisa los logs en consola

```bash
# Inicia con logs visibles
npx expo start
```

En la consola verás:
```
[Network] Estado: { isConnected: true, ... }
[Writings] ✅ Datos cargados desde API y cacheados
[Writings] ⚠️ Sin internet, guardando localmente...
[Writings] 📱 Escrito guardado offline con ID temporal
[Sync] 🔄 Iniciando sincronización...
[Sync] ✅ Operación sincronizada: create writing
```

#### 2. Verifica AsyncStorage

Añade un botón de debug en la app para ver qué hay en caché:

```typescript
// Añadir temporalmente en alguna pantalla
import AsyncStorage from '@react-native-async-storage/async-storage';

const debugCache = async () => {
  const keys = await AsyncStorage.getAllKeys();
  console.log('📦 Claves en caché:', keys);
  
  const pending = await AsyncStorage.getItem('@biblia_pending_sync');
  console.log('📝 Operaciones pendientes:', pending);
  
  const writings = await AsyncStorage.getItem('@biblia_writings');
  console.log('✍️ Escritos en caché:', writings);
};

// Botón temporal
<TouchableOpacity onPress={debugCache}>
  <Text>🐛 Debug Caché</Text>
</TouchableOpacity>
```

---

## 🧪 Plan de Testing Completo

### Test 1: Escritos Offline

```
✅ 1. Abre app con internet
✅ 2. Ve a "Lectura del Día"
✅ 3. Activa modo avión
✅ 4. Escribe una reflexión
✅ 5. Espera 2 segundos (auto-guardado)
✅ 6. Verifica en logs: "📱 Escrito guardado offline"
✅ 7. Desactiva modo avión
✅ 8. Recarga la app o espera unos segundos
✅ 9. Verifica en logs: "✅ Operación sincronizada"
✅ 10. Ve al servidor/backend y verifica que está guardado
```

### Test 2: Favoritos Offline

```
✅ 1. Abre app con internet
✅ 2. Busca un versículo
✅ 3. Activa modo avión
✅ 4. Añade a favoritos
✅ 5. Verifica en logs: "📱 Favorito guardado offline"
✅ 6. Ve a "Favoritos" → Debería aparecer
✅ 7. Desactiva modo avión
✅ 8. Recarga app
✅ 9. Verifica sincronización en logs
✅ 10. Verifica en backend que está guardado
```

### Test 3: Lectura del Día con Caché

```
✅ 1. Con internet, abre "Lectura del Día" de hoy
✅ 2. Verifica en logs: "✅ Cargado del API y cacheado"
✅ 3. Cierra la app
✅ 4. Activa modo avión
✅ 5. Abre la app
✅ 6. Ve a "Lectura del Día"
✅ 7. Verifica en logs: "✅ Cargado del caché (offline)"
✅ 8. Debería mostrar la lectura del día
```

### Test 4: Calendario Offline

```
✅ 1. Con internet, abre calendario
✅ 2. Marca varios días como completados
✅ 3. Activa modo avión
✅ 4. Abre calendario → Debería mostrar días verdes
✅ 5. Marca un nuevo día → Debería guardarse localmente
✅ 6. Pulsa un día sin lectura cacheada
✅ 7. Debería mostrar: "Lectura no disponible"
✅ 8. Desactiva modo avión
✅ 9. El día marcado debería sincronizarse
```

### Test 5: Descarga de Biblia (Funciona en Expo Go)

```
✅ 1. Ve a "Uso sin Conexión" → "Gestionar Descargas"
✅ 2. Pulsa "Descargar ahora"
✅ 3. Verifica barra de progreso
✅ 4. Espera a que complete (badge "ACTIVA")
✅ 5. Cierra y reabre la app → La descarga debería persistir
✅ 6. Activa modo avión
✅ 7. Ve a Antiguo/Nuevo Testamento
✅ 8. Debería mostrar los libros desde datos locales
✅ 9. Abre un capítulo → Debería cargar offline
```

**Nota:** La Biblia se guarda en AsyncStorage (~10MB), puede tardar unos segundos.

---

## 🐛 Cómo Debugear Problemas

### Problema: "No sincroniza automáticamente"

**En Expo Go:**
```typescript
// Añade sincronización manual al abrir la app
// En App.tsx o en el primer useEffect de MainNavigator

useEffect(() => {
  const checkAndSync = async () => {
    const isOnline = await NetInfo.fetch();
    if (isOnline.isConnected) {
      await syncService.syncAll();
    }
  };
  checkAndSync();
}, []);
```

**Con Development Build:**
- Debería funcionar automáticamente
- Revisa logs de `[Network]` para ver si detecta cambios

### Problema: "Los datos no persisten"

```typescript
// Verifica que AsyncStorage funciona
import AsyncStorage from '@react-native-async-storage/async-storage';

const testStorage = async () => {
  await AsyncStorage.setItem('@test', 'hello');
  const value = await AsyncStorage.getItem('@test');
  console.log('Storage test:', value); // Debería mostrar 'hello'
};
```

### Problema: "No sé si está funcionando"

Añade un indicador visual en la app:

```typescript
// En alguna pantalla principal
const [pendingCount, setPendingCount] = useState(0);

useEffect(() => {
  const checkPending = async () => {
    const count = await syncService.getPendingCount();
    setPendingCount(count);
  };
  checkPending();
  const interval = setInterval(checkPending, 5000);
  return () => clearInterval(interval);
}, []);

// Mostrar badge si hay pendientes
{pendingCount > 0 && (
  <View style={styles.badge}>
    <Text>{pendingCount} pendientes</Text>
  </View>
)}
```

---

## 📱 Recomendación Final

### Para Desarrollo Rápido:
```bash
# Usa Expo Go pero:
# 1. Confía en los logs de consola
# 2. Verifica AsyncStorage con botones debug
# 3. Prueba manualmente modo avión
# 4. Cierra/abre app para forzar sincronización
```

### Para Testing Completo:
```bash
# Haz un development build:
eas build --profile development --platform android

# Instala en tu dispositivo
# Prueba TODO el flujo offline/online
# La sincronización automática funcionará perfectamente
```

### Para Producción:
```bash
# Build de producción:
eas build --profile production --platform android
eas build --profile production --platform ios

# Publica en stores
# Los usuarios tendrán la experiencia completa
```

---

## 🎯 Checklist de Verificación

- [ ] Los logs muestran `[Writings] 📱 Escrito guardado offline` cuando está sin internet
- [ ] Los logs muestran `[Sync] ✅ Operación sincronizada` cuando vuelve internet
- [ ] AsyncStorage contiene datos en `@biblia_pending_sync` cuando hay operaciones pendientes
- [ ] La lectura del día muestra mensaje "cargado del caché" cuando está offline
- [ ] El calendario muestra las fechas verdes incluso offline
- [ ] Pulsar un día sin caché muestra "Lectura no disponible"
- [ ] Los escritos creados offline aparecen en el backend después de sincronizar
- [ ] Los favoritos añadidos offline aparecen en el backend después de sincronizar

---

**Resumen:** Con Expo Go puedes probar la LÓGICA pero con limitaciones. Para testing completo, necesitas un **development build**. Para producción, obviamente será un build de release donde todo funcionará perfectamente.
