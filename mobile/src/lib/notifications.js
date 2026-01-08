import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const WEEKLY_SUMMARY_KEY = 'memoria-weekly-summary';

// Check if we're in Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

// Days of the week - indices match JavaScript's getDay() where 0 = Sunday
export const DAYS_OF_WEEK = [
  { value: 0, en: 'Sunday', pt: 'Domingo', es: 'Domingo', fr: 'Dimanche' },
  { value: 1, en: 'Monday', pt: 'Segunda-feira', es: 'Lunes', fr: 'Lundi' },
  { value: 2, en: 'Tuesday', pt: 'Terça-feira', es: 'Martes', fr: 'Mardi' },
  { value: 3, en: 'Wednesday', pt: 'Quarta-feira', es: 'Miércoles', fr: 'Mercredi' },
  { value: 4, en: 'Thursday', pt: 'Quinta-feira', es: 'Jueves', fr: 'Jeudi' },
  { value: 5, en: 'Friday', pt: 'Sexta-feira', es: 'Viernes', fr: 'Vendredi' },
  { value: 6, en: 'Saturday', pt: 'Sábado', es: 'Sábado', fr: 'Samedi' },
];

// Configure notification handler (only if not in Expo Go)
if (!isExpoGo) {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  } catch (e) {
    console.log('Notifications not available in this environment');
  }
}

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  return finalStatus === 'granted';
}

/**
 * Get saved weekly summary settings
 */
export async function getWeeklySummarySettings() {
  try {
    const data = await AsyncStorage.getItem(WEEKLY_SUMMARY_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return {
      enabled: false,
      dayOfWeek: 0, // Sunday
      hour: 19,
      minute: 0,
    };
  } catch (error) {
    console.error('Error getting weekly summary settings:', error);
    return {
      enabled: false,
      dayOfWeek: 0,
      hour: 19,
      minute: 0,
    };
  }
}

/**
 * Save weekly summary settings
 */
export async function saveWeeklySummarySettings(settings) {
  try {
    await AsyncStorage.setItem(WEEKLY_SUMMARY_KEY, JSON.stringify(settings));
    
    // Cancel any existing scheduled notifications
    await cancelWeeklySummary();
    
    // Schedule new notification if enabled
    if (settings.enabled) {
      await scheduleWeeklySummary(settings);
    }
    
    return true;
  } catch (error) {
    console.error('Error saving weekly summary settings:', error);
    return false;
  }
}

/**
 * Schedule a weekly summary notification
 */
export async function scheduleWeeklySummary(settings) {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) {
    return false;
  }
  
  try {
    // Cancel any existing weekly summary notifications first
    await cancelWeeklySummary();
    
    // Schedule the weekly notification
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Memor.ia - Resumo Semanal 📋',
        body: 'Hora de rever os teus links e notas guardados esta semana!',
        data: { type: 'weekly_summary' },
      },
      trigger: {
        weekday: settings.dayOfWeek + 1, // Expo uses 1-7 (Sunday = 1), we use 0-6 (Sunday = 0)
        hour: settings.hour,
        minute: settings.minute,
        repeats: true,
      },
    });
    
    console.log('Weekly summary scheduled with ID:', identifier);
    return true;
  } catch (error) {
    console.error('Error scheduling weekly summary:', error);
    return false;
  }
}

/**
 * Cancel the weekly summary notification
 */
export async function cancelWeeklySummary() {
  try {
    // Get all scheduled notifications
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    
    // Cancel only weekly summary notifications
    for (const notification of scheduledNotifications) {
      if (notification.content.data?.type === 'weekly_summary') {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error canceling weekly summary:', error);
    return false;
  }
}

/**
 * Format time according to device locale
 * Uses native formatting which respects system 12h/24h preference
 */
export function formatTimeForLocale(hour, minute) {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  
  // Use Intl.DateTimeFormat which respects the device's locale settings
  // This automatically uses 12h or 24h format based on the user's system preferences
  return date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get the day name in the specified language
 */
export function getDayName(dayValue, language) {
  const day = DAYS_OF_WEEK.find(d => d.value === dayValue);
  if (day) {
    return day[language] || day.en;
  }
  return '';
}
