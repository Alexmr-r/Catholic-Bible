import React from 'react';
import { View } from 'react-native';
import Toast from 'react-native-toast-message';
import { useTheme } from '../contexts/ThemeContext';
import { getToastConfig } from './ToastConfig';

export const GlobalToast = () => {
  const { isDarkMode } = useTheme();
  
  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 9999, elevation: 10 }}>
      <Toast 
        config={getToastConfig(isDarkMode)} 
        position="top"
        topOffset={60}
        visibilityTime={4000}
      />
    </View>
  );
};
