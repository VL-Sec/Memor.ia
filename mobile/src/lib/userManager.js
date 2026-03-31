import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_ID_KEY = '@memoria_user_id';
const USER_CREATED_KEY = '@memoria_user_created';

let cachedUserId = null;

/**
 * Generates a UUID v4 using pure JavaScript (no native modules needed)
 */
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * Generates a unique user ID using UUID v4
 * This ID is:
 * - Unique per device
 * - Does not identify the person
 * - Does not require login
 * - Accepted by Play Store (privacy-friendly)
 */
export const generateUserId = () => {
  const uuid = generateUUID();
  return `user_${uuid.replace(/-/g, '').substring(0, 16)}`;
};

/**
 * Gets or creates the user ID for this device
 * On first launch, generates a new unique ID
 * On subsequent launches, returns the cached ID
 */
export const getUserId = async () => {
  // Return cached if available
  if (cachedUserId) {
    return cachedUserId;
  }

  try {
    // Try to get existing user ID
    const existingId = await AsyncStorage.getItem(USER_ID_KEY);
    
    if (existingId) {
      cachedUserId = existingId;
      return existingId;
    }

    // First launch - generate new user ID
    const newUserId = generateUserId();
    const createdAt = new Date().toISOString();
    
    await AsyncStorage.setItem(USER_ID_KEY, newUserId);
    await AsyncStorage.setItem(USER_CREATED_KEY, createdAt);
    
    cachedUserId = newUserId;
    console.log('New user ID created:', newUserId);
    
    return newUserId;
  } catch (error) {
    console.error('Error getting/creating user ID:', error);
    // Fallback to a temporary ID if something goes wrong
    const fallbackId = `user_temp_${Date.now()}`;
    cachedUserId = fallbackId;
    return fallbackId;
  }
};

/**
 * Gets the user creation date
 */
export const getUserCreatedDate = async () => {
  try {
    return await AsyncStorage.getItem(USER_CREATED_KEY);
  } catch (error) {
    return null;
  }
};

/**
 * Clears the cached user ID (useful for testing)
 */
export const clearUserIdCache = () => {
  cachedUserId = null;
};

/**
 * Resets user ID completely (for account reset feature)
 * WARNING: This will make all existing data inaccessible
 */
export const resetUserId = async () => {
  try {
    await AsyncStorage.removeItem(USER_ID_KEY);
    await AsyncStorage.removeItem(USER_CREATED_KEY);
    cachedUserId = null;
    return true;
  } catch (error) {
    console.error('Error resetting user ID:', error);
    return false;
  }
};
