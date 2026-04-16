import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useAuth } from '../contexts/AuthContext';

const PaywallScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { colors, isDarkMode } = useTheme();
  const { packages, purchasePackage, restorePurchases, isPremium, hasAccess } = useSubscription();
  const { logout } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectedPlan, setSelectedPlan] = React.useState<'ANNUAL' | 'MONTHLY'>('ANNUAL');

  // Seleccionar automáticamente el plan anual si está disponible (RevenueCat usa $rc_annual)
  const annualPackage = packages.find(p => p.packageType === 'ANNUAL');
  const monthlyPackage = packages.find(p => p.packageType === 'MONTHLY');

  const handlePurchase = async (pack: any) => {
    try {
      setIsLoading(true);
      const success = await purchasePackage(pack);
      if (success) {
        Alert.alert('Welcome!', 'You are now a Premium member.');
        if (navigation.canGoBack()) navigation.goBack();
      }
    } catch (e) {
      Alert.alert('Error', 'Purchase could not be completed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async () => {
    try {
      setIsLoading(true);
      const success = await restorePurchases();
      if (success) {
        Alert.alert('Success', 'Subscription restored.');
        if (navigation.canGoBack()) navigation.goBack();
      } else {
        Alert.alert('Notice', 'No previous subscription found.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isPremium) {
    return (
      <View style={[styles.container, { backgroundColor: isDarkMode ? '#111' : '#fff' }]}>
        <View style={styles.header}>
          {navigation.canGoBack() && (
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
              <MaterialIcons name="close" size={28} color={isDarkMode ? '#fff' : '#000'} />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.emptyContainer}>
          <MaterialIcons name="workspace-premium" size={80} color="#d4af37" />
          <Text style={[styles.title, { color: isDarkMode ? '#fff' : '#000', marginTop: 24 }]}>You are already Premium!</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#050402' : '#fafafa' }]}>
      <LinearGradient
        colors={isDarkMode ? ['#211a0b', '#050402'] : ['#f7eedb', '#fafafa']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + 20, paddingBottom: insets.bottom + 40, paddingHorizontal: 24 }}
      >
        <View style={styles.header}>
          {navigation.canGoBack() && (
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
              <MaterialIcons name="close" size={28} color={isDarkMode ? '#fff' : '#333'} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.heroSection}>
          <MaterialIcons name="workspace-premium" size={80} color="#d4af37" />
          <Text style={[styles.title, { color: isDarkMode ? '#fff' : '#111' }]}>
            Premium Subscription
          </Text>
          <Text style={[styles.subtitle, { color: isDarkMode ? '#aaa' : '#666' }]}>
            Choose a plan to continue.
          </Text>
        </View>

        <View style={{ marginBottom: 40 }} />

        <View style={styles.pricingContainer}>
          {annualPackage ? (
            <TouchableOpacity 
              style={[styles.packageCard, selectedPlan === 'ANNUAL' ? { borderColor: '#d4af37', backgroundColor: isDarkMode ? '#1f1807' : '#fffdf5' } : { borderColor: isDarkMode ? '#333' : '#e0e0e0', backgroundColor: isDarkMode ? '#0a0a0a' : '#fff' }]}
              onPress={() => setSelectedPlan('ANNUAL')}
              disabled={isLoading}
            >
              <View style={styles.bestValueBadge}>
                 <Text style={styles.bestValueText}>BEST VALUE</Text>
              </View>
              <View style={styles.packageHeader}>
                <Text style={[styles.packageName, { color: isDarkMode ? '#fff' : '#000' }]}>Yearly Premium</Text>
                <Text style={[styles.packagePrice, { color: isDarkMode ? '#fff' : '#000' }]}>{annualPackage.product.priceString} / year</Text>
              </View>
              <Text style={styles.packageCalculatedPrice}>Only ${(annualPackage.product.price / 12).toFixed(2)}/month</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[styles.packageCard, selectedPlan === 'ANNUAL' ? { borderColor: '#d4af37', backgroundColor: isDarkMode ? '#1f1807' : '#fffdf5' } : { borderColor: isDarkMode ? '#333' : '#e0e0e0', backgroundColor: isDarkMode ? '#0a0a0a' : '#fff' }]}
              onPress={() => setSelectedPlan('ANNUAL')}
            >
              <View style={styles.bestValueBadge}>
                 <Text style={styles.bestValueText}>BEST VALUE</Text>
              </View>
              <View style={styles.packageHeader}>
                 <Text style={[styles.packageName, { color: selectedPlan === 'ANNUAL' ? (isDarkMode ? '#fff' : '#000') : (isDarkMode ? '#666' : '#444') }]}>Yearly Premium</Text>
                 <Text style={[styles.packagePrice, { color: selectedPlan === 'ANNUAL' ? (isDarkMode ? '#fff' : '#000') : (isDarkMode ? '#666' : '#444') }]}>$39.99 / year</Text>
              </View>
              <Text style={styles.packageCalculatedPrice}>Only $3.33/month</Text>
            </TouchableOpacity>
          )}

          {monthlyPackage ? (
            <TouchableOpacity 
              style={[styles.packageCard, selectedPlan === 'MONTHLY' ? { borderColor: '#d4af37', backgroundColor: isDarkMode ? '#1f1807' : '#fffdf5' } : { borderColor: isDarkMode ? '#333' : '#e0e0e0', backgroundColor: isDarkMode ? '#0a0a0a' : '#fff' }]}
              onPress={() => setSelectedPlan('MONTHLY')}
              disabled={isLoading}
            >
              <View style={styles.packageHeader}>
                <Text style={[styles.packageName, { color: selectedPlan === 'MONTHLY' ? (isDarkMode ? '#fff' : '#000') : (isDarkMode ? '#666' : '#444') }]}>Monthly Premium</Text>
                <Text style={[styles.packagePrice, { color: selectedPlan === 'MONTHLY' ? (isDarkMode ? '#fff' : '#000') : (isDarkMode ? '#666' : '#444') }]}>{monthlyPackage.product.priceString} / month</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[styles.packageCard, selectedPlan === 'MONTHLY' ? { borderColor: '#d4af37', backgroundColor: isDarkMode ? '#1f1807' : '#fffdf5' } : { borderColor: isDarkMode ? '#333' : '#e0e0e0', backgroundColor: isDarkMode ? '#0a0a0a' : '#fff' }]}
              onPress={() => setSelectedPlan('MONTHLY')}
            >
               <View style={styles.packageHeader}>
                <Text style={[styles.packageName, { color: selectedPlan === 'MONTHLY' ? (isDarkMode ? '#fff' : '#000') : (isDarkMode ? '#666' : '#444') }]}>Monthly Premium</Text>
                <Text style={[styles.packagePrice, { color: selectedPlan === 'MONTHLY' ? (isDarkMode ? '#fff' : '#000') : (isDarkMode ? '#666' : '#444') }]}>$4.99 / month</Text>
              </View>
            </TouchableOpacity>
          )}

        </View>

        {isLoading ? (
           <ActivityIndicator size="large" color="#d4af37" style={{ marginVertical: 20 }} />
        ) : (
          <TouchableOpacity 
             style={[styles.mainButton, { backgroundColor: '#d4af37' }]}
             onPress={() => handlePurchase(selectedPlan === 'ANNUAL' ? annualPackage : monthlyPackage)}
          >
             <Text style={styles.mainButtonText}>Continue with Premium</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={handleRestore} style={styles.restoreButton}>
          <Text style={[styles.restoreText, {opacity: 0.5}]}>Restore subscription</Text>
        </TouchableOpacity>

        {!hasAccess && (
          <TouchableOpacity onPress={logout} style={[styles.restoreButton, { marginTop: 20 }]}>
            <Text style={[styles.restoreText, {opacity: 0.4, textDecorationLine: 'none'}]}>Log out</Text>
          </TouchableOpacity>
        )}

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { alignItems: 'flex-start', marginBottom: 20 },
  closeButton: { padding: 8, marginLeft: -8 },
  heroSection: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 24, fontFamily: 'EB Garamond', fontWeight: '700', textAlign: 'center', marginTop: 16, marginBottom: 8 },
  subtitle: { fontSize: 14, fontFamily: 'Inter', textAlign: 'center' },
  pricingContainer: { marginBottom: 30 },
  packageCard: { borderWidth: 2, borderRadius: 16, padding: 20, marginBottom: 16 },
  packageCardSelected: { /* controlled by inline styles */ },
  packageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  packageName: { fontSize: 18, fontFamily: 'Inter', fontWeight: 'bold' },
  packagePrice: { fontSize: 18, fontFamily: 'Inter', fontWeight: 'bold' },
  packageCalculatedPrice: { fontSize: 14, fontFamily: 'Inter', color: '#d4af37', fontWeight: '600' },
  bestValueBadge: { position: 'absolute', top: -12, right: 20, backgroundColor: '#d4af37', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  bestValueText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  mainButton: { borderRadius: 100, paddingVertical: 18, alignItems: 'center', marginBottom: 16, shadowColor: '#d4af37', shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: {height: 4, width: 0} },
  mainButtonText: { color: '#fff', fontSize: 18, fontFamily: 'Inter', fontWeight: 'bold' },
  restoreButton: { alignItems: 'center', paddingVertical: 10, marginTop: 10 },
  restoreText: { color: '#888', fontSize: 12, fontFamily: 'Inter' }
});

export default PaywallScreen;
