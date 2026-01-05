import AsyncStorage from '@react-native-async-storage/async-storage';

const TRIAL_DAYS = 15;

const STORAGE_KEYS = {
  FIRST_INSTALL: 'memoria_first_install',
  PREMIUM_STATUS: 'memoria_premium',
  ACTIVATED_CODE: 'memoria_activated_code',
  USER_DATA: 'memoria_user_data',
};

// Get first install date
export const getFirstInstallDate = async () => {
  try {
    let installDate = await AsyncStorage.getItem(STORAGE_KEYS.FIRST_INSTALL);
    if (!installDate) {
      installDate = new Date().toISOString();
      await AsyncStorage.setItem(STORAGE_KEYS.FIRST_INSTALL, installDate);
    }
    return new Date(installDate);
  } catch (error) {
    console.error('Error getting install date:', error);
    return new Date();
  }
};

// Calculate days remaining in trial
export const getTrialDaysRemaining = async () => {
  const installDate = await getFirstInstallDate();
  const now = new Date();
  const diffTime = now.getTime() - installDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const remaining = TRIAL_DAYS - diffDays;
  return Math.max(0, remaining);
};

// Check if trial is active
export const isTrialActive = async () => {
  const remaining = await getTrialDaysRemaining();
  return remaining > 0;
};

// Check if premium is activated
export const isPremiumActivated = async () => {
  try {
    const status = await AsyncStorage.getItem(STORAGE_KEYS.PREMIUM_STATUS);
    return status === 'true';
  } catch (error) {
    return false;
  }
};

// Get activated code
export const getActivatedCode = async () => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.ACTIVATED_CODE);
  } catch (error) {
    return null;
  }
};

// Activate premium
export const activatePremium = async (code) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.PREMIUM_STATUS, 'true');
    await AsyncStorage.setItem(STORAGE_KEYS.ACTIVATED_CODE, code);
  } catch (error) {
    console.error('Error activating premium:', error);
  }
};

// Check premium access
export const hasPremiumAccess = async () => {
  const isPremium = await isPremiumActivated();
  if (isPremium) return true;
  return await isTrialActive();
};

// Get premium status
export const getPremiumStatus = async () => {
  const isPremium = await isPremiumActivated();
  const trialDays = await getTrialDaysRemaining();
  const trialActive = trialDays > 0;
  const activatedCode = await getActivatedCode();

  return {
    hasPremium: isPremium || trialActive,
    isPremiumActivated: isPremium,
    isTrialActive: trialActive && !isPremium,
    trialDaysRemaining: trialDays,
    activatedCode,
  };
};

// Backup data (will be synced via iCloud/Google automatically)
export const backupUserData = async (data) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data));
  } catch (error) {
    console.error('Error backing up data:', error);
  }
};

// Restore user data
export const restoreUserData = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error restoring data:', error);
    return null;
  }
};
