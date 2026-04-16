import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { useSubscription } from '../contexts/SubscriptionContext';

const VIPHeaderStar = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const { isPremium } = useSubscription();

  // Si ya son premium al 100%, ocultamos la estrella para mantener un diseño limpio
  if (isPremium) {
    return null;
  }

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => navigation.navigate('Paywall')}
      style={styles.container}
    >
      <View style={[styles.starContainer, { backgroundColor: colors.gold?.light || '#fdf1d6' }]}>
        <MaterialIcons name="workspace-premium" size={24} color={colors.gold?.DEFAULT || '#d4af37'} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginLeft: 8,
    marginRight: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  starContainer: {
    padding: 2,
    borderRadius: 20,
    shadowColor: '#d4af37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  }
});

export default VIPHeaderStar;
