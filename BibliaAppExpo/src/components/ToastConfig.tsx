import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { BaseToastProps } from 'react-native-toast-message';
import { MaterialIcons } from '@expo/vector-icons';
import { lightColors, darkColors } from '../theme/colors';

// Esta configuración se puede importar en App.tsx
export const getToastConfig = (isDarkMode: boolean) => {
  const colors = isDarkMode ? darkColors : lightColors;

  return {
    success: (props: BaseToastProps) => (
      <View style={[styles.toastContainer, { 
        backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF', 
        borderColor: isDarkMode ? '#3A3A3C' : '#E5E5EA',
        borderLeftColor: colors.primary.DEFAULT,
        borderLeftWidth: 4
      }]}>
        <MaterialIcons name="check-circle" size={22} color={colors.primary.DEFAULT} style={styles.icon} />
        <View style={styles.textContainer}>
          <Text style={[styles.titleText, { color: isDarkMode ? '#FFFFFF' : '#1C1C1E' }]}>{props.text1}</Text>
          {props.text2 ? <Text style={[styles.bodyText, { color: isDarkMode ? '#AEAEB2' : '#636366' }]}>{props.text2}</Text> : null}
        </View>
      </View>
    ),
    error: (props: BaseToastProps) => (
      <View style={[styles.toastContainer, { 
        backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF', 
        borderColor: isDarkMode ? '#3A3A3C' : '#E5E5EA',
        borderLeftColor: colors.burgundy.DEFAULT,
        borderLeftWidth: 4
      }]}>
        <MaterialIcons name="error" size={22} color={colors.burgundy.DEFAULT} style={styles.icon} />
        <View style={styles.textContainer}>
          <Text style={[styles.titleText, { color: isDarkMode ? '#FFFFFF' : '#1C1C1E' }]}>{props.text1}</Text>
          {props.text2 ? <Text style={[styles.bodyText, { color: isDarkMode ? '#AEAEB2' : '#636366' }]}>{props.text2}</Text> : null}
        </View>
      </View>
    ),
    info: (props: BaseToastProps) => (
      <View style={[styles.toastContainer, { 
        backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF', 
        borderColor: isDarkMode ? '#3A3A3C' : '#E5E5EA',
        borderLeftColor: colors.charcoal.muted,
        borderLeftWidth: 4
      }]}>
        <MaterialIcons name="info" size={22} color={colors.charcoal.muted} style={styles.icon} />
        <View style={styles.textContainer}>
          <Text style={[styles.titleText, { color: isDarkMode ? '#FFFFFF' : '#1C1C1E' }]}>{props.text1}</Text>
          {props.text2 ? <Text style={[styles.bodyText, { color: isDarkMode ? '#AEAEB2' : '#636366' }]}>{props.text2}</Text> : null}
        </View>
      </View>
    ),
    offline: (props: BaseToastProps) => (
      <View style={[styles.toastContainer, { 
        backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF', 
        borderColor: isDarkMode ? '#3A3A3C' : '#E5E5EA',
        borderLeftColor: '#F59E0B',
        borderLeftWidth: 4
      }]}>
        <MaterialIcons name="wifi-off" size={22} color="#F59E0B" style={styles.icon} />
        <View style={styles.textContainer}>
          <Text style={[styles.titleText, { color: isDarkMode ? '#FFFFFF' : '#1C1C1E' }]}>{props.text1}</Text>
          {props.text2 ? <Text style={[styles.bodyText, { color: isDarkMode ? '#AEAEB2' : '#636366' }]}>{props.text2}</Text> : null}
        </View>
      </View>
    ),
  };
};

const styles = StyleSheet.create({
  toastContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '92%',
    maxWidth: 420,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
    marginTop: Platform.OS === 'ios' ? 0 : 10,
  },
  icon: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  titleText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  bodyText: {
    fontSize: 12,
    marginTop: 1,
    lineHeight: 16,
  },
});
