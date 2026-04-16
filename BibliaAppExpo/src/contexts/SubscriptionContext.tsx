import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Platform } from 'react-native';
import Purchases, { CustomerInfo, PurchasesPackage } from 'react-native-purchases';
import { useAuth } from './AuthContext';

// API Keys para RevenueCat (Reemplaza con los tuyos más adelante)
const API_KEYS = {
  apple: 'appl_YOUR_APPLE_API_KEY_HERE',
  google: 'goog_YOUR_GOOGLE_API_KEY_HERE',
};

interface SubscriptionContextType {
  isPremium: boolean;
  isTrialActive: boolean;
  trialStartDate: string | undefined;
  packages: PurchasesPackage[];
  purchasePackage: (pack: PurchasesPackage) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  hasAccess: boolean; // Computed: Premium OR Trial Active
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  // States
  const [rcPremium, setRcPremium] = useState(false);
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);

  // Derived state directly from our backend source of truth (User object)
  const backendPremium = user?.isPremium || false;
  const backendTrialActive = user?.isTrialActive || false;
  
  // Active if our Backend says we're premium OR RevenueCat says we're premium
  const isPremium = backendPremium || rcPremium;
  const isTrialActive = backendTrialActive;
  const trialStartDate = user?.trialStartDate;
  
  const hasAccess = isPremium || isTrialActive;

  useEffect(() => {
    // Inicializar RevenueCat setup
    const setup = async () => {
      try {
        if (Platform.OS === 'ios') {
          Purchases.configure({ apiKey: API_KEYS.apple });
        } else if (Platform.OS === 'android') {
          Purchases.configure({ apiKey: API_KEYS.google });
        }
        
        // Log in el usuario a RevenueCat
        if (user) {
          const { customerInfo } = await Purchases.logIn(user.id);
          checkAccess(customerInfo);
        }

        // Obtener productos
        const offerings = await Purchases.getOfferings();
        if (offerings.current && offerings.current.availablePackages.length !== 0) {
          setPackages(offerings.current.availablePackages);
        }
      } catch (e) {
        console.warn('Error inicializando RevenueCat', e);
      }
    };
    setup();

    // Listener para compras fuera de la app
    const customerInfoUpdateListener = (info: CustomerInfo) => {
      checkAccess(info);
    };
    Purchases.addCustomerInfoUpdateListener(customerInfoUpdateListener);
    
    return () => {
      Purchases.removeCustomerInfoUpdateListener(customerInfoUpdateListener);
    };
  }, [user]);

  const checkAccess = (info: CustomerInfo) => {
    // Reemplaza "premium_access" con el identifier que configures en RevenueCat Entitlements
    if (typeof info.entitlements.active['premium_access'] !== 'undefined') {
      setRcPremium(true);
    } else {
      setRcPremium(false);
    }
  };

  const purchasePackage = async (pack: PurchasesPackage): Promise<boolean> => {
    try {
      const { customerInfo } = await Purchases.purchasePackage(pack);
      if (typeof customerInfo.entitlements.active['premium_access'] !== 'undefined') {
        setRcPremium(true);
        return true;
      }
    } catch (e: any) {
      if (!e.userCancelled) {
        console.error('Error efectuando compra', e);
      }
    }
    return false;
  };

  const restorePurchases = async (): Promise<boolean> => {
    try {
      const customerInfo = await Purchases.restorePurchases();
      if (typeof customerInfo.entitlements.active['premium_access'] !== 'undefined') {
        setRcPremium(true);
        return true;
      }
    } catch (e: any) {
      console.error('Error restaurando compras', e);
    }
    return false;
  };

  return (
    <SubscriptionContext.Provider
      value={{
        isPremium,
        isTrialActive,
        trialStartDate,
        packages,
        purchasePackage,
        restorePurchases,
        hasAccess
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
