import React from 'react';
import {Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';
import {useTheme} from '../contexts/ThemeContext';

interface MessageParserProps {
  text: string;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function MessageParser({text}: MessageParserProps) {
  const {colors, isDarkMode} = useTheme();
  const navigation = useNavigation<NavigationProp>();

  // Expresión regular para detectar referencias bíblicas en el formato: [[Libro Capítulo:Versículo]]
  // Ejemplo: [[Génesis 1:1]] o [[Juan 3:16-18]]
  const bibleReferenceRegex = /\[\[([A-Za-zÁ-Úá-ú0-9\s]+)\s(\d+):(\d+)(-\d+)?\]\]/g;

  const navigateToChapter = (bookNameStr: string, chapterStr: string, verseStr: string) => {
    // Normalizar nombre del libro para buscar el ID (en una app real cruzaremos con SQLite, aquí hacemos un mapeo seguro o pasamos el nombre)
    const normalizedName = bookNameStr.trim();
    // Transformamos nombre a ID básico (Ej: "Génesis" -> "genesis")
    const bookIdFallback = normalizedName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s/g, "");
    
    navigation.navigate('ChapterReading', {
      bookId: bookIdFallback, 
      bookName: normalizedName,
      chapter: parseInt(chapterStr, 10),
      favoriteVerseNumber: parseInt(verseStr, 10),
    });
  };

  const renderText = () => {
    // Dividimos el texto usando el regex pero conservando los grupos para procesarlos
    const parts = text.split(/(\[\[.*?\]\])/g);

    return parts.map((part, index) => {
      // Si la parte es un tag bíblico
      if (part.startsWith('[[') && part.endsWith(']]')) {
        // Extraer los datos limpios
        const cleanRef = part.replace('[[', '').replace(']]', '');
        const match = /^([A-Za-zÁ-Úá-ú0-9\s]+)\s(\d+):(\d+)(-\d+)?$/.exec(cleanRef);
        
        if (match) {
          const [, book, chapter, verse] = match;
          return (
            <Text 
              key={`ref-${index}`} 
              onPress={() => navigateToChapter(book, chapter, verse)}
              style={[styles.tagText, { color: colors.primary.DEFAULT, backgroundColor: isDarkMode ? colors.surface.dark : colors.ivory.DEFAULT }]}
            >
               {cleanRef} 
            </Text>
          );
        }
      }

      // Si es texto normal
      return (
        <Text key={`text-${index}`} style={[styles.text, { color: colors.charcoal.DEFAULT }]}>
          {part}
        </Text>
      );
    });
  };

  return <Text style={styles.container}>{renderText()}</Text>;
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 2,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
  },
  tagText: {
    fontSize: 16,
    fontWeight: 'bold',
  }
});
