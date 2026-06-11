# 🧩 Sistema de Componentes Reutilizables

**Objetivo:** Extraer código repetido en componentes modulares y mantenibles

---

## 📋 Componentes Identificados para Extracción

### Análisis de Código Repetido

Después de revisar todas las pantallas, se identificaron los siguientes patrones repetitivos:

```
🔴 Alta prioridad (código duplicado en 3+ archivos)
├── Header con botón back
├── Verse Row (fila de versículo)
├── Chapter Grid (grid de capítulos)
├── Book Card (tarjeta de libro)
└── Floating Toolbar

🟡 Media prioridad (código duplicado en 2 archivos)
├── Search Bar
├── Badge Component
├── Section Header
└── Navigation Buttons

🟢 Baja prioridad (mejoras de UX)
├── Loading Spinner
├── Error View
├── Empty State
└── Toast Notifications
```

---

## 🎨 Componentes Propuestos

### 1. **Header Component**

**Usado en:** ChapterReadingScreen, GenesisReadingScreen, GenesisChaptersScreen, MatthewChaptersScreen, OldTestamentScreen, NewTestamentScreen

```typescript
// components/common/Header.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  showBackButton?: boolean;
  rightActions?: React.ReactNode;
  expandable?: boolean;
  onExpand?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onBack,
  showBackButton = true,
  rightActions,
  expandable = false,
  onExpand,
}) => {
  return (
    <View style={styles.header}>
      {showBackButton && (
        <TouchableOpacity
          onPress={onBack}
          style={styles.backButton}
          activeOpacity={0.7}>
          <MaterialIcons name="arrow-back" size={24} color={colors.charcoal.dark} />
        </TouchableOpacity>
      )}
      
      <View style={styles.headerCenter}>
        <TouchableOpacity
          style={styles.titleRow}
          onPress={expandable ? onExpand : undefined}
          disabled={!expandable}
          activeOpacity={0.7}>
          <Text style={styles.headerTitle}>{title}</Text>
          {expandable && (
            <MaterialIcons
              name="expand-more"
              size={16}
              color={colors.secondary}
              style={styles.expandIcon}
            />
          )}
        </TouchableOpacity>
        
        {subtitle && (
          <Text style={styles.headerSubtitle}>{subtitle}</Text>
        )}
      </View>
      
      {rightActions && (
        <View style={styles.headerActions}>
          {rightActions}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingTop: 48,
    paddingBottom: 8,
    backgroundColor: `${colors.cream}F2`,
    borderBottomWidth: 1,
    borderBottomColor: `${colors.ivory.border}99`,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.charcoal.dark,
    lineHeight: 24,
  },
  expandIcon: {
    marginTop: 2,
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.charcoal.muted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
```

**Uso:**

```typescript
// ChapterReadingScreen.tsx
import { Header } from '../components/common/Header';

<Header
  title={`${data.book} ${data.chapter}`}
  subtitle={data.version}
  onBack={handleBack}
  expandable
  onExpand={handleSelectChapter}
  rightActions={
    <>
      <IconButton icon="text-fields" onPress={handleTextSettings} />
      <IconButton icon="more-vert" onPress={handleMoreOptions} />
    </>
  }
/>
```

---

### 2. **VerseRow Component**

**Usado en:** ChapterReadingScreen, GenesisReadingScreen

```typescript
// components/bible/VerseRow.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

interface VerseRowProps {
  verse: {
    number: number;
    text: string;
    hasNote?: boolean;
  };
  selected?: boolean;
  highlighted?: boolean;
  highlightColor?: string;
  onPress?: () => void;
  onLongPress?: () => void;
}

export const VerseRow: React.FC<VerseRowProps> = ({
  verse,
  selected = false,
  highlighted = false,
  highlightColor,
  onPress,
  onLongPress,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.verseRow,
        selected && styles.verseRowSelected,
        highlighted && { backgroundColor: `${highlightColor}20` },
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}>
      <Text style={styles.verseNumber}>{verse.number}</Text>
      
      <View style={styles.verseContent}>
        <Text
          style={[
            styles.verseText,
            selected && styles.verseTextSelected,
            highlighted && { backgroundColor: `${highlightColor}20` },
          ]}>
          {verse.text}
        </Text>
        
        {verse.hasNote && (
          <TouchableOpacity style={styles.noteButton}>
            <MaterialIcons
              name="sticky-note-2"
              size={14}
              color={colors.secondary}
            />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  verseRow: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  verseRowSelected: {
    backgroundColor: `${colors.primary.DEFAULT}20`,
  },
  verseNumber: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.charcoal.muted,
    marginRight: 6,
    marginTop: 6,
    minWidth: 20,
  },
  verseContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  verseText: {
    fontSize: 19,
    lineHeight: 34,
    color: colors.charcoal.DEFAULT,
    flex: 1,
  },
  verseTextSelected: {
    backgroundColor: `${colors.primary.DEFAULT}20`,
    borderRadius: 2,
  },
  noteButton: {
    marginLeft: 4,
    marginTop: 4,
    opacity: 0.5,
  },
});
```

**Uso:**

```typescript
// ChapterReadingScreen.tsx
import { VerseRow } from '../components/bible/VerseRow';

{section.verses.map((verse) => (
  <VerseRow
    key={verse.number}
    verse={verse}
    selected={selectedVerse === verse.number}
    onPress={() => handleVersePress(verse.number)}
  />
))}
```

---

### 3. **ChapterGrid Component**

**Usado en:** GenesisChaptersScreen, MatthewChaptersScreen

```typescript
// components/bible/ChapterGrid.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

interface ChapterGridProps {
  totalChapters: number;
  currentChapter?: number;
  bookmarkedChapter?: number;
  enabledChapters?: number[];
  columns?: number;
  onChapterPress: (chapter: number) => void;
}

export const ChapterGrid: React.FC<ChapterGridProps> = ({
  totalChapters,
  currentChapter,
  bookmarkedChapter,
  enabledChapters = [],
  columns = 5,
  onChapterPress,
}) => {
  const renderChapterButton = (chapter: number, index: number) => {
    const isEnabled = enabledChapters.length === 0 || enabledChapters.includes(chapter);
    const isCurrent = chapter === currentChapter && isEnabled;
    const isBookmarked = chapter === bookmarkedChapter;
    
    return (
      <TouchableOpacity
        key={chapter}
        style={[
          styles.chapterButton,
          !isEnabled && styles.chapterButtonDisabled,
          isCurrent && styles.chapterButtonCurrent,
        ]}
        onPress={() => isEnabled && onChapterPress(chapter)}
        disabled={!isEnabled}
        activeOpacity={0.7}>
        <Text
          style={[
            styles.chapterNumber,
            !isEnabled && styles.chapterNumberDisabled,
            isCurrent && styles.chapterNumberCurrent,
          ]}>
          {chapter}
        </Text>
        
        {isBookmarked && (
          <View style={styles.bookmarkBadge}>
            <MaterialIcons name="bookmark" size={12} color={colors.gold.accent} />
          </View>
        )}
        
        {isCurrent && (
          <View style={styles.currentBadge}>
            <MaterialIcons name="play-arrow" size={14} color="#FFFFFF" />
          </View>
        )}
      </TouchableOpacity>
    );
  };
  
  const chapters = Array.from({ length: totalChapters }, (_, i) => i + 1);
  
  return (
    <View style={styles.grid}>
      {chapters.map((chapter, index) => renderChapterButton(chapter, index))}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  chapterButton: {
    width: '18%',
    aspectRatio: 1,
    margin: '1%',
    backgroundColor: colors.ivory.DEFAULT,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.ivory.border,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  chapterButtonDisabled: {
    backgroundColor: colors.ivory.light,
    opacity: 0.4,
  },
  chapterButtonCurrent: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.DEFAULT,
  },
  chapterNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.charcoal.dark,
  },
  chapterNumberDisabled: {
    color: colors.charcoal.light,
  },
  chapterNumberCurrent: {
    color: '#FFFFFF',
  },
  bookmarkBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  currentBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
  },
});
```

---

### 4. **FloatingToolbar Component**

**Usado en:** ChapterReadingScreen, GenesisReadingScreen

```typescript
// components/bible/FloatingToolbar.tsx
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

interface FloatingToolbarProps {
  visible: boolean;
  onHighlight?: (color: string) => void;
  onAddNote?: () => void;
  onAddFavorite?: () => void;
  onShare?: () => void;
  highlightColors?: string[];
}

export const FloatingToolbar: React.FC<FloatingToolbarProps> = ({
  visible,
  onHighlight,
  onAddNote,
  onAddFavorite,
  onShare,
  highlightColors = [colors.gold.accent, colors.primary.DEFAULT],
}) => {
  if (!visible) return null;
  
  return (
    <View style={styles.floatingToolbar}>
      {/* Color Highlights */}
      {highlightColors.map((color, index) => (
        <TouchableOpacity
          key={index}
          style={styles.toolbarButton}
          onPress={() => onHighlight?.(color)}
          activeOpacity={0.7}>
          <View style={[styles.colorDot, { backgroundColor: color }]} />
        </TouchableOpacity>
      ))}
      
      <View style={styles.toolbarDivider} />
      
      {/* Actions */}
      {onAddNote && (
        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={onAddNote}
          activeOpacity={0.7}>
          <MaterialIcons name="edit-note" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      )}
      
      {onAddFavorite && (
        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={onAddFavorite}
          activeOpacity={0.7}>
          <MaterialIcons name="favorite" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      )}
      
      {onShare && (
        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={onShare}
          activeOpacity={0.7}>
          <MaterialIcons name="share" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  floatingToolbar: {
    position: 'absolute',
    top: 80,
    left: '50%',
    transform: [{ translateX: -130 }],
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.charcoal.dark,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 100,
  },
  toolbarButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  toolbarDivider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
});
```

---

### 5. **BookCard Component**

**Usado en:** OldTestamentScreen, NewTestamentScreen

```typescript
// components/bible/BookCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

interface BookCardProps {
  book: {
    id: string;
    name: string;
    chapters: number;
    category: string;
  };
  enabled?: boolean;
  onPress: () => void;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  enabled = true,
  onPress,
}) => {
  const getCategoryColor = (category: string) => {
    const colorMap: Record<string, string> = {
      pentateuco: colors.burgundy.accent,
      historicos: colors.primary.DEFAULT,
      sapienciales: colors.gold.accent,
      profeticos: colors.secondary,
      evangelios: colors.burgundy.accent,
      epistolas: colors.primary.DEFAULT,
    };
    return colorMap[category.toLowerCase()] || colors.charcoal.muted;
  };
  
  return (
    <TouchableOpacity
      style={[
        styles.bookCard,
        !enabled && styles.bookCardDisabled,
      ]}
      onPress={enabled ? onPress : undefined}
      disabled={!enabled}
      activeOpacity={0.8}>
      <View style={styles.bookInfo}>
        <Text
          style={[
            styles.bookName,
            !enabled && styles.bookNameDisabled,
          ]}
          numberOfLines={2}>
          {book.name}
        </Text>
        
        <View
          style={[
            styles.chapterBadge,
            { backgroundColor: `${getCategoryColor(book.category)}20` },
          ]}>
          <Text
            style={[
              styles.chapterCount,
              { color: getCategoryColor(book.category) },
            ]}>
            {book.chapters} cap.
          </Text>
        </View>
      </View>
      
      {enabled && (
        <MaterialIcons
          name="chevron-right"
          size={20}
          color={colors.charcoal.muted}
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  bookCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.ivory.DEFAULT,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.ivory.border,
    marginBottom: 12,
  },
  bookCardDisabled: {
    opacity: 0.5,
  },
  bookInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginRight: 8,
  },
  bookName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.charcoal.dark,
    flex: 1,
  },
  bookNameDisabled: {
    color: colors.charcoal.light,
  },
  chapterBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  chapterCount: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
```

---

### 6. **Utilidades Adicionales**

```typescript
// components/common/LoadingSpinner.tsx
export const LoadingSpinner: React.FC<{ message?: string }> = ({ message }) => (
  <View style={styles.container}>
    <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
    {message && <Text style={styles.message}>{message}</Text>}
  </View>
);

// components/common/ErrorView.tsx
export const ErrorView: React.FC<{
  message: string;
  onRetry?: () => void;
}> = ({ message, onRetry }) => (
  <View style={styles.container}>
    <MaterialIcons name="error-outline" size={48} color={colors.charcoal.muted} />
    <Text style={styles.message}>{message}</Text>
    {onRetry && (
      <TouchableOpacity onPress={onRetry} style={styles.retryButton}>
        <Text style={styles.retryText}>Reintentar</Text>
      </TouchableOpacity>
    )}
  </View>
);

// components/common/EmptyState.tsx
export const EmptyState: React.FC<{
  icon: string;
  title: string;
  message: string;
  action?: { label: string; onPress: () => void };
}> = ({ icon, title, message, action }) => (
  <View style={styles.container}>
    <MaterialIcons name={icon} size={64} color={colors.charcoal.light} />
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.message}>{message}</Text>
    {action && (
      <TouchableOpacity onPress={action.onPress} style={styles.actionButton}>
        <Text style={styles.actionText}>{action.label}</Text>
      </TouchableOpacity>
    )}
  </View>
);
```

---

## 📦 Estructura Propuesta

```
src/components/
├── common/
│   ├── Header.tsx
│   ├── IconButton.tsx
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Badge.tsx
│   ├── LoadingSpinner.tsx
│   ├── ErrorView.tsx
│   └── EmptyState.tsx
├── bible/
│   ├── VerseRow.tsx
│   ├── ChapterGrid.tsx
│   ├── FloatingToolbar.tsx
│   ├── BookCard.tsx
│   ├── SectionHeader.tsx
│   └── NavigationButtons.tsx
└── index.ts (barrel export)
```

---

## ✅ Beneficios de la Refactorización

1. **Reducción de código:** ~40% menos líneas de código
2. **Mantenibilidad:** Cambios en un solo lugar
3. **Consistencia:** UI uniforme en toda la app
4. **Testing:** Más fácil testear componentes aislados
5. **Reusabilidad:** Componentes listos para nuevas features
6. **Performance:** Optimización con React.memo

---

## 🚀 Plan de Migración

1. Crear carpeta `src/components/`
2. Implementar componentes base (Header, Button, etc.)
3. Refactorizar pantallas una por una
4. Testear cada pantalla después de refactorizar
5. Documentar props de cada componente (con TypeScript)

---

**Siguiente paso:** Ver `ARQUITECTURA_Y_MEJORAS.md` para contexto completo

