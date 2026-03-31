import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import { checkSubscriptionStatus, initializeRevenueCat } from './revenueCat';

const STORAGE_KEYS = {
  PREMIUM_STATUS: 'memoria_premium',
  ACTIVATED_CODE: 'memoria_activated_code',
  USER_DATA: 'memoria_user_data',
  FIRST_OPEN_DATE: 'memoria_first_open_date',
};

const TRIAL_DAYS = 3;

// Initialize RevenueCat (call this at app startup)
export const initializePremiumService = async (userId) => {
  try {
    await initializeRevenueCat(userId);
  } catch (error) {
    console.error('Error initializing premium service:', error);
  }
};

// Record first app open date (call once at startup)
export const recordFirstOpenDate = async () => {
  try {
    const existingDate = await AsyncStorage.getItem(STORAGE_KEYS.FIRST_OPEN_DATE);
    if (!existingDate) {
      const now = new Date().toISOString();
      await AsyncStorage.setItem(STORAGE_KEYS.FIRST_OPEN_DATE, now);
      console.log('First open date recorded:', now);
      return now;
    }
    return existingDate;
  } catch (error) {
    console.error('Error recording first open date:', error);
    return null;
  }
};

// Get first open date
export const getFirstOpenDate = async () => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.FIRST_OPEN_DATE);
  } catch (error) {
    return null;
  }
};

// Check if trial period is active (first 3 days)
export const isTrialActive = async () => {
  try {
    const firstOpenDate = await AsyncStorage.getItem(STORAGE_KEYS.FIRST_OPEN_DATE);
    if (!firstOpenDate) {
      // First open, trial starts now
      await recordFirstOpenDate();
      return true;
    }
    
    const firstOpen = new Date(firstOpenDate);
    const now = new Date();
    const diffTime = now.getTime() - firstOpen.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    
    return diffDays < TRIAL_DAYS;
  } catch (error) {
    console.error('Error checking trial:', error);
    return true; // Default to trial active on error
  }
};

// Get trial days remaining
export const getTrialDaysRemaining = async () => {
  try {
    const firstOpenDate = await AsyncStorage.getItem(STORAGE_KEYS.FIRST_OPEN_DATE);
    if (!firstOpenDate) return TRIAL_DAYS;
    
    const firstOpen = new Date(firstOpenDate);
    const now = new Date();
    const diffTime = now.getTime() - firstOpen.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    
    const remaining = Math.max(0, Math.ceil(TRIAL_DAYS - diffDays));
    return remaining;
  } catch (error) {
    return TRIAL_DAYS;
  }
};

// Check if premium is activated via manual code (stored locally)
export const isPremiumActivatedByCode = async () => {
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

// Validate activation code against Supabase
export const validateActivationCode = async (code, userId) => {
  try {
    // Check if code exists and is not used
    const { data, error } = await supabase
      .from('activation_codes')
      .select('*')
      .eq('code', code.toUpperCase().trim())
      .single();

    if (error || !data) {
      return { valid: false, error: 'Código inválido ou não encontrado' };
    }

    if (data.is_used) {
      return { valid: false, error: 'Este código já foi utilizado' };
    }

    // Mark code as used
    const updateData = {
      is_used: true,
      used_at: new Date().toISOString(),
    };
    
    // Try to add used_by if the column exists
    const { error: updateError } = await supabase
      .from('activation_codes')
      .update(updateData)
      .eq('code', code.toUpperCase().trim());

    if (updateError) {
      console.error('Error updating code:', updateError);
      return { valid: false, error: 'Erro ao ativar código' };
    }

    // Update app_metrics - increment premium_via_code and premium_active
    try {
      const { data: metricsData } = await supabase
        .from('app_metrics')
        .select('premium_via_code, premium_active')
        .eq('id', 'global')
        .single();

      if (metricsData) {
        await supabase
          .from('app_metrics')
          .update({
            premium_via_code: (metricsData.premium_via_code || 0) + 1,
            premium_active: (metricsData.premium_active || 0) + 1,
          })
          .eq('id', 'global');
      }
    } catch (metricsError) {
      console.log('Could not update metrics:', metricsError);
      // Don't fail the activation if metrics update fails
    }

    return { 
      valid: true, 
      influencer: data.influencer_name,
      code: data.code 
    };
  } catch (error) {
    console.error('Error validating code:', error);
    return { valid: false, error: 'Erro de conexão' };
  }
};

// Activate premium with code (after validation)
export const activatePremiumWithCode = async (code) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.PREMIUM_STATUS, 'true');
    await AsyncStorage.setItem(STORAGE_KEYS.ACTIVATED_CODE, code);
    return true;
  } catch (error) {
    console.error('Error activating premium:', error);
    return false;
  }
};

// Full activation flow: validate + activate
export const activatePremium = async (code, userId) => {
  const validation = await validateActivationCode(code, userId);
  
  if (!validation.valid) {
    return validation;
  }

  const activated = await activatePremiumWithCode(code);
  
  if (!activated) {
    return { valid: false, error: 'Erro ao guardar ativação' };
  }

  return { 
    valid: true, 
    influencer: validation.influencer,
    code: validation.code 
  };
};

// Check premium access (subscription OR manual code)
export const hasPremiumAccess = async () => {
  // First check manual code activation
  const hasCodeActivation = await isPremiumActivatedByCode();
  if (hasCodeActivation) return true;

  // Then check RevenueCat subscription
  try {
    const { isSubscribed } = await checkSubscriptionStatus();
    return isSubscribed;
  } catch (error) {
    console.error('Error checking subscription:', error);
    return false;
  }
};

// Check if user has full access (premium OR trial active)
export const hasFullAccess = async () => {
  // First check if premium (code or subscription)
  const hasPremium = await hasPremiumAccess();
  if (hasPremium) return { hasAccess: true, reason: 'premium' };
  
  // Then check trial
  const trialActive = await isTrialActive();
  if (trialActive) {
    const daysRemaining = await getTrialDaysRemaining();
    return { hasAccess: true, reason: 'trial', daysRemaining };
  }
  
  // No access - trial expired and not premium
  return { hasAccess: false, reason: 'trial_expired' };
};

// Get comprehensive premium status
export const getPremiumStatus = async () => {
  const isPremiumByCode = await isPremiumActivatedByCode();
  const activatedCode = await getActivatedCode();
  const trialActive = await isTrialActive();
  const trialDaysRemaining = await getTrialDaysRemaining();
  
  let subscriptionStatus = { isSubscribed: false, expirationDate: null };
  
  try {
    subscriptionStatus = await checkSubscriptionStatus();
  } catch (error) {
    console.error('Error getting subscription status:', error);
  }

  const hasPremium = isPremiumByCode || subscriptionStatus.isSubscribed;

  return {
    hasPremium,
    isPremiumByCode,
    isPremiumBySubscription: subscriptionStatus.isSubscribed,
    subscriptionExpirationDate: subscriptionStatus.expirationDate,
    activatedCode,
    trialActive,
    trialDaysRemaining,
    hasFullAccess: hasPremium || trialActive,
  };
};

// Backup data
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
