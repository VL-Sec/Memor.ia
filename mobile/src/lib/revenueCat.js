import Constants from 'expo-constants';

const REVENUECAT_API_KEY = 'goog_grtYQITtVshRaRcrqCNRQMcmdgO';
const ENTITLEMENT_ID = 'Memor.ia Pro';

// Check if running in Expo Go (no native modules available)
const isExpoGo = Constants.appOwnership === 'expo';

let Purchases = null;
let isInitialized = false;

// Dynamically load RevenueCat only if not in Expo Go
const loadPurchases = async () => {
  if (!isExpoGo && !Purchases) {
    try {
      const module = await import('react-native-purchases');
      Purchases = module.default;
      return true;
    } catch (error) {
      console.log('RevenueCat not available:', error.message);
      return false;
    }
  }
  return !isExpoGo && Purchases !== null;
};

// Initialize RevenueCat SDK
export const initializeRevenueCat = async (userId) => {
  if (isExpoGo) {
    console.log('RevenueCat: Skipping initialization in Expo Go');
    return;
  }

  if (isInitialized) {
    console.log('RevenueCat already initialized');
    return;
  }

  const loaded = await loadPurchases();
  if (!loaded) {
    console.log('RevenueCat: Could not load module');
    return;
  }

  try {
    if (__DEV__) {
      Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
    }

    await Purchases.configure({
      apiKey: REVENUECAT_API_KEY,
      appUserID: userId,
    });

    isInitialized = true;
    console.log('RevenueCat initialized successfully for user:', userId);
  } catch (error) {
    console.error('RevenueCat initialization error:', error);
  }
};

// Check if user has active subscription via RevenueCat
export const checkSubscriptionStatus = async () => {
  if (isExpoGo || !Purchases) {
    return {
      isSubscribed: false,
      expirationDate: null,
      customerInfo: null,
    };
  }

  try {
    const customerInfo = await Purchases.getCustomerInfo();
    const isSubscribed = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
    
    let expirationDate = null;
    if (isSubscribed && customerInfo.entitlements.active[ENTITLEMENT_ID]?.expirationDate) {
      expirationDate = customerInfo.entitlements.active[ENTITLEMENT_ID].expirationDate;
    }

    return {
      isSubscribed,
      expirationDate,
      customerInfo,
    };
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return {
      isSubscribed: false,
      expirationDate: null,
      customerInfo: null,
    };
  }
};

// Get available offerings/packages
export const getOfferings = async () => {
  if (isExpoGo || !Purchases) {
    return null;
  }

  try {
    const offerings = await Purchases.getOfferings();
    return offerings;
  } catch (error) {
    console.error('Error getting offerings:', error);
    return null;
  }
};

// Purchase a package
export const purchasePackage = async (packageToPurchase) => {
  if (isExpoGo || !Purchases) {
    throw new Error('Purchases not available in Expo Go');
  }

  try {
    const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
    const isSubscribed = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
    return {
      success: isSubscribed,
      customerInfo,
    };
  } catch (error) {
    if (error.userCancelled) {
      return { success: false, cancelled: true };
    }
    console.error('Error purchasing package:', error);
    throw error;
  }
};

// Restore purchases
export const restorePurchases = async () => {
  if (isExpoGo || !Purchases) {
    throw new Error('Purchases not available in Expo Go');
  }

  try {
    const customerInfo = await Purchases.restorePurchases();
    const isSubscribed = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
    return {
      success: true,
      isSubscribed,
      customerInfo,
    };
  } catch (error) {
    console.error('Error restoring purchases:', error);
    throw error;
  }
};

// Check if RevenueCat is available
export const isRevenueCatAvailable = () => {
  return !isExpoGo && Purchases !== null;
};

export { ENTITLEMENT_ID, isExpoGo };
