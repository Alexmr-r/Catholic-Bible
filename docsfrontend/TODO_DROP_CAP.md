# 📝 TODO: Drop Cap Pendiente

## ⚠️ Problema Actual

La primera letra del texto de lectura está destacada en **color dorado y un poco más grande**, pero **NO fluye como un drop cap tradicional** de HTML/CSS.

### ✅ Implementación Actual (Temporal)

```tsx
<Text style={styles.readingParagraph}>
  <Text style={styles.firstLetter}>E</Text>n aquel tiempo, el ángel Gabriel...
</Text>

// Estilos
firstLetter: {
  fontSize: 24,
  color: colors.gold.accent,
  fontWeight: '700',
}
```

**Resultado:**
- La "E" está en color dorado
- Un poco más grande que el resto del texto
- **Pero NO es un drop cap real** (el texto no fluye alrededor)

---

## 🔮 Solución Futura

### Opción 1: Backend envía HTML
El backend envía el texto con HTML y se usa `react-native-render-html`:

```json
{
  "text": "<p><span style='float: left; font-size: 64px; font-weight: 700; color: #C4A962; line-height: 48px; margin-right: 8px;'>E</span>n aquel tiempo...</p>"
}
```

### Opción 2: Librería especializada
Investigar librerías específicas para drop caps en React Native.

### Opción 3: WebView
Como último recurso, renderizar el texto en un WebView con CSS tradicional.

---

## 📌 Por Ahora

**Aceptamos la limitación:** React Native NO tiene `float`, y la solución actual es **suficiente para MVP**.

La primera letra destaca visualmente, que es el objetivo principal. El drop cap perfecto se implementará cuando:
1. Se defina el formato de la API
2. Se tenga más tiempo para integrar librerías externas
3. Se valide con usuarios reales si es necesario

---

## 🎯 Prioridad

**BAJA** - La funcionalidad actual cumple con el objetivo de destacar la primera letra. El drop cap perfecto es un "nice to have", no un bloqueante para el MVP.

