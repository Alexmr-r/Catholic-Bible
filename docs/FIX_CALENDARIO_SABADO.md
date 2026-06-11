# 📐 Fix: Calendario — Sábado se salía de la fila

> Fecha: 30 de marzo de 2026  
> Archivo: `src/screens/ReadingCalendarScreen.tsx`

---

## 🐛 El Problema

El nombre del día "SÁB" (Sábado) aparecía en una segunda fila, debajo de "DOM-VIE", en vez de estar alineado en la misma fila de 7 columnas.

## 🔍 Causa Raíz

El cálculo de `CELL_SIZE` producía un número decimal con decimales infinitos:

```typescript
// ANTES (bug)
const CELL_SIZE = (SCREEN_WIDTH - (CALENDAR_PADDING * 2) - (GAP * 6)) / 7;
// Ejemplo: (393 - 48 - 48) / 7 = 42.4285714...
```

Cuando React Native renderizaba 7 celdas de 42.43px + 6 gaps de 8px:
```
7 × 42.4285... + 6 × 8 = 296.999... + 48 = 345.0000...01 px
```

El contenedor disponible era exactamente **345px** (`393 - 24*2 = 345`).

La diferencia de **0.0000001px** por redondeo de punto flotante hacía que la 7ª celda (SÁB) no cupiera en la fila, causando un `flexWrap` que la movía a la siguiente línea.

## ✅ La Solución

```typescript
// DESPUÉS (fix)
const CELL_SIZE = Math.floor((SCREEN_WIDTH - (CALENDAR_PADDING * 2) - (GAP * 6)) / 7);
// Ejemplo: Math.floor(42.4285...) = 42
```

Con `Math.floor`:
```
7 × 42 + 6 × 8 = 294 + 48 = 342 px  (< 345 px disponibles ✅)
```

Los 3px sobrantes (345 - 342 = 3px) quedan como margen natural al final de la fila. Esto es inapreciable visualmente (~0.4px por celda).

## 📝 Lección

Cuando se calcula el tamaño de celdas en un grid con `flexWrap: 'wrap'`:
- **Siempre** usar `Math.floor()` para el tamaño de celda
- **Nunca** confiar en que la aritmética de punto flotante será exacta
- Los sub-píxeles acumulados en N celdas pueden superar el contenedor y causar wraps inesperados
- Este bug solo se manifiesta en ciertos anchos de pantalla (depende del dispositivo)

## 📊 Fórmula Final

```
CELL_SIZE = Math.floor((SCREEN_WIDTH - paddingTotal - gapTotal) / numColumns)

Donde:
  paddingTotal = CALENDAR_PADDING × 2
  gapTotal = GAP × (numColumns - 1)
  numColumns = 7
```
