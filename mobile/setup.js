const fs = require('fs');
const path = require('path');

console.log('========================================');
console.log('   MEMORIA APP - Setup Automatico');
console.log('========================================\n');

// Create directories
const dirs = ['src', 'src/screens', 'src/lib', 'src/components', 'assets'];
dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✓ Pasta criada: ${dir}`);
  }
});

// Files content
const files = {
  'app.json': `{
  "expo": {
    "name": "Memor.ia",
    "slug": "memoria",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "dark",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#000000"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.memoria.app"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#000000"
      },
      "package": "com.memoria.app",
      "permissions": ["INTERNET", "RECEIVE_BOOT_COMPLETED", "VIBRATE", "SCHEDULE_EXACT_ALARM"]
    },
    "plugins": ["expo-secure-store", "expo-localization", ["expo-notifications", {"icon": "./assets/icon.png", "color": "#007AFF"}]],
    "extra": {
      "eas": {"projectId": "your-project-id"},
      "supabaseUrl": "https://vczmygfrsmxzkyzzckfu.supabase.co",
      "supabaseAnonKey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjem15Z2Zyc214emt5enpja2Z1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2MTA5ODQsImV4cCI6MjA4MzE4Njk4NH0.qj0kSBcZpdLYxCLWY-fKchxLKJeBhUBoOAe13Sk4I2Q"
    }
  }
}`,

  'eas.json': `{
  "cli": {"version": ">= 5.0.0"},
  "build": {
    "development": {"developmentClient": true, "distribution": "internal"},
    "preview": {"distribution": "internal"},
    "production": {}
  },
  "submit": {
    "production": {}
  }
}`,

  'App.js': `import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import LinksScreen from './src/screens/LinksScreen';
import ClipboardScreen from './src/screens/ClipboardScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import SettingsScreen from './src/screens/SettingsScreen';

import { translations, getStoredLanguage } from './src/lib/i18n';
import { getPremiumStatus } from './src/lib/premium';

const Tab = createBottomTabNavigator();

const theme = {
  dark: true,
  colors: {
    primary: '#007AFF',
    background: '#000000',
    card: '#1C1C1E',
    text: '#FFFFFF',
    border: '#2C2C2E',
    notification: '#007AFF',
  },
};

export default function App() {
  const [language, setLanguage] = useState('en');
  const [premiumStatus, setPremiumStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const lang = await getStoredLanguage();
      setLanguage(lang);
      const status = await getPremiumStatus();
      setPremiumStatus(status);
      setLoading(false);
    };
    init();
  }, []);

  const t = translations[language] || translations.en;

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={theme}>
      <StatusBar style="light" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'Links') iconName = focused ? 'link' : 'link-outline';
            else if (route.name === 'Clipboard') iconName = focused ? 'clipboard' : 'clipboard-outline';
            else if (route.name === 'Favorites') iconName = focused ? 'heart' : 'heart-outline';
            else if (route.name === 'Settings') iconName = focused ? 'settings' : 'settings-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: '#8E8E93',
          tabBarStyle: { backgroundColor: '#1C1C1E', borderTopColor: '#2C2C2E', paddingTop: 5, height: 85 },
          headerStyle: { backgroundColor: '#000000', borderBottomColor: '#2C2C2E', borderBottomWidth: 1 },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: 'bold' },
        })}>
        <Tab.Screen name="Links" options={{ title: t.tabLinks, headerTitle: 'Memor.ia' }}>
          {(props) => <LinksScreen {...props} language={language} premiumStatus={premiumStatus} />}
        </Tab.Screen>
        <Tab.Screen name="Clipboard" options={{ title: t.tabClipboard, headerTitle: t.tabClipboard }}>
          {(props) => <ClipboardScreen {...props} language={language} premiumStatus={premiumStatus} />}
        </Tab.Screen>
        <Tab.Screen name="Favorites" options={{ title: t.tabFavorites, headerTitle: t.tabFavorites }}>
          {(props) => <FavoritesScreen {...props} language={language} />}
        </Tab.Screen>
        <Tab.Screen name="Settings" options={{ title: t.tabSettings, headerTitle: t.tabSettings }}>
          {(props) => <SettingsScreen {...props} language={language} setLanguage={setLanguage} premiumStatus={premiumStatus} setPremiumStatus={setPremiumStatus} />}
        </Tab.Screen>
      </Tab.Navigator>
      <Toast />
    </NavigationContainer>
  );
}`,

  'src/lib/supabase.js': `import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || 'https://vczmygfrsmxzkyzzckfu.supabase.co';
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjem15Z2Zyc214emt5enpja2Z1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2MTA5ODQsImV4cCI6MjA4MzE4Njk4NH0.qj0kSBcZpdLYxCLWY-fKchxLKJeBhUBoOAe13Sk4I2Q';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const generateId = () => {
  return \`\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`;
};`,

  'src/lib/premium.js': `import AsyncStorage from '@react-native-async-storage/async-storage';

const TRIAL_DAYS = 15;
const STORAGE_KEYS = {
  FIRST_INSTALL: 'memoria_first_install',
  PREMIUM_STATUS: 'memoria_premium',
  ACTIVATED_CODE: 'memoria_activated_code',
  USER_DATA: 'memoria_user_data',
};

export const getFirstInstallDate = async () => {
  try {
    let installDate = await AsyncStorage.getItem(STORAGE_KEYS.FIRST_INSTALL);
    if (!installDate) {
      installDate = new Date().toISOString();
      await AsyncStorage.setItem(STORAGE_KEYS.FIRST_INSTALL, installDate);
    }
    return new Date(installDate);
  } catch (error) {
    return new Date();
  }
};

export const getTrialDaysRemaining = async () => {
  const installDate = await getFirstInstallDate();
  const now = new Date();
  const diffTime = now.getTime() - installDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, TRIAL_DAYS - diffDays);
};

export const isTrialActive = async () => {
  const remaining = await getTrialDaysRemaining();
  return remaining > 0;
};

export const isPremiumActivated = async () => {
  try {
    const status = await AsyncStorage.getItem(STORAGE_KEYS.PREMIUM_STATUS);
    return status === 'true';
  } catch (error) {
    return false;
  }
};

export const getActivatedCode = async () => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.ACTIVATED_CODE);
  } catch (error) {
    return null;
  }
};

export const activatePremium = async (code) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.PREMIUM_STATUS, 'true');
    await AsyncStorage.setItem(STORAGE_KEYS.ACTIVATED_CODE, code);
  } catch (error) {
    console.error('Error activating premium:', error);
  }
};

export const hasPremiumAccess = async () => {
  const isPremium = await isPremiumActivated();
  if (isPremium) return true;
  return await isTrialActive();
};

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
};`,

  'src/lib/i18n.js': `import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const translations = {
  en: {
    tabLinks: 'Links', tabFavorites: 'Favorites', tabClipboard: 'Clipboard', tabSettings: 'Settings',
    appName: 'Memor.ia', save: 'Save', cancel: 'Cancel', delete: 'Delete', edit: 'Edit', copy: 'Copy', open: 'Open', search: 'Search...',
    allLinks: 'All Links', allClipboards: 'All Notes', folders: 'Folders', newFolder: 'New Folder', generalFolder: 'General', folderName: 'Folder Name', selectFolder: 'Select folder',
    clipboardPlaceholder: 'Paste text or emojis here...', noClipboardItems: 'No notes yet', chars: 'chars',
    smartClipboard: 'Smart Clipboard', smartClipboardInfo: 'While active, saves everything you copy.', activate: 'Activate', deactivate: 'Stop', timeRemaining: 'remaining',
    premium: 'Premium', premiumActive: 'Premium Active', trialActive: 'Trial Active', trialDaysLeft: 'days left', trialExpired: 'Trial Expired',
    activationCode: 'Activation Code', enterActivationCode: 'Enter activation code', codeActivated: 'Code activated!', invalidCode: 'Invalid code', codeAlreadyUsed: 'Code already used',
    settings: 'Settings', language: 'Language', backup: 'Cloud Backup', backupInfo: 'Your data is automatically backed up', version: 'Version',
    cloudBackupTitle: 'Automatic Backup', cloudBackupSubtitle: 'Your data is safe', cloudBackupDescription: 'All your links, notes and settings are automatically synced.',
    cloudBackupIOS: 'iCloud Backup', cloudBackupAndroid: 'Google Backup', cloudBackupEnabled: 'Enabled', cloudBackupTip: 'Make sure cloud backup is enabled in your device settings.',
    notifications: 'Notifications', weeklySummary: 'Weekly Summary', weeklySummaryInfo: 'Receive a reminder to review your saved content',
    dayOfWeek: 'Day', time: 'Time', selectDay: 'Select day', selectTime: 'Select time',
    weeklySummaryEnabled: 'Weekly summary enabled', weeklySummaryDisabled: 'Weekly summary disabled',
    copied: 'Copied!', saved: 'Saved!', deleted: 'Deleted!', error: 'Error',
    reminder: 'Reminder', setReminder: 'Set Reminder', reminderDate: 'Date', reminderTime: 'Time', reminderLocation: 'Location',
    reminderLocationPlaceholder: 'Add location (optional)', reminderEnabled: 'Reminder enabled', noDate: 'No date', noTime: 'No time', clearReminder: 'Clear Reminder',
    editItem: 'Edit', moveToFolder: 'Move to folder',
  },
  pt: {
    tabLinks: 'Links', tabFavorites: 'Favoritos', tabClipboard: 'Clipboard', tabSettings: 'Definições',
    appName: 'Memor.ia', save: 'Guardar', cancel: 'Cancelar', delete: 'Apagar', edit: 'Editar', copy: 'Copiar', open: 'Abrir', search: 'Pesquisar...',
    allLinks: 'Todos os Links', allClipboards: 'Todas as Notas', folders: 'Pastas', newFolder: 'Nova Pasta', generalFolder: 'Geral', folderName: 'Nome da Pasta', selectFolder: 'Selecionar pasta',
    clipboardPlaceholder: 'Cola texto ou emojis aqui...', noClipboardItems: 'Ainda não tens notas', chars: 'caracteres',
    smartClipboard: 'Smart Clipboard', smartClipboardInfo: 'Enquanto ativo, guarda tudo o que copiares.', activate: 'Ativar', deactivate: 'Parar', timeRemaining: 'restantes',
    premium: 'Premium', premiumActive: 'Premium Ativo', trialActive: 'Período de Teste', trialDaysLeft: 'dias restantes', trialExpired: 'Período de Teste Expirado',
    activationCode: 'Código de Ativação', enterActivationCode: 'Inserir código de ativação', codeActivated: 'Código ativado!', invalidCode: 'Código inválido', codeAlreadyUsed: 'Código já utilizado',
    settings: 'Definições', language: 'Idioma', backup: 'Backup na Cloud', backupInfo: 'Os teus dados são guardados automaticamente', version: 'Versão',
    cloudBackupTitle: 'Backup Automático', cloudBackupSubtitle: 'Os teus dados estão seguros', cloudBackupDescription: 'Todos os teus links, notas e definições são sincronizados automaticamente.',
    cloudBackupIOS: 'iCloud Backup', cloudBackupAndroid: 'Google Backup', cloudBackupEnabled: 'Ativado', cloudBackupTip: 'Certifica-te que o backup na cloud está ativado nas definições do dispositivo.',
    notifications: 'Notificações', weeklySummary: 'Resumo Semanal', weeklySummaryInfo: 'Recebe um lembrete para rever o conteúdo guardado',
    dayOfWeek: 'Dia', time: 'Hora', selectDay: 'Selecionar dia', selectTime: 'Selecionar hora',
    weeklySummaryEnabled: 'Resumo semanal ativado', weeklySummaryDisabled: 'Resumo semanal desativado',
    copied: 'Copiado!', saved: 'Guardado!', deleted: 'Apagado!', error: 'Erro',
    reminder: 'Lembrete', setReminder: 'Definir Lembrete', reminderDate: 'Data', reminderTime: 'Hora', reminderLocation: 'Local',
    reminderLocationPlaceholder: 'Adicionar local (opcional)', reminderEnabled: 'Lembrete ativado', noDate: 'Sem data', noTime: 'Sem hora', clearReminder: 'Limpar Lembrete',
    editItem: 'Editar', moveToFolder: 'Mover para pasta',
  },
  es: {
    tabLinks: 'Enlaces', tabFavorites: 'Favoritos', tabClipboard: 'Clipboard', tabSettings: 'Ajustes',
    appName: 'Memor.ia', save: 'Guardar', cancel: 'Cancelar', delete: 'Eliminar', edit: 'Editar', copy: 'Copiar', open: 'Abrir', search: 'Buscar...',
    allLinks: 'Todos los Enlaces', allClipboards: 'Todas las Notas', folders: 'Carpetas', newFolder: 'Nueva Carpeta', generalFolder: 'General', folderName: 'Nombre', selectFolder: 'Seleccionar carpeta',
    clipboardPlaceholder: 'Pega texto o emojis aquí...', noClipboardItems: 'Aún no hay notas', chars: 'caracteres',
    smartClipboard: 'Smart Clipboard', smartClipboardInfo: 'Mientras está activo, guarda todo lo que copies.', activate: 'Activar', deactivate: 'Parar', timeRemaining: 'restantes',
    premium: 'Premium', premiumActive: 'Premium Activo', trialActive: 'Período de Prueba', trialDaysLeft: 'días restantes', trialExpired: 'Período de Prueba Expirado',
    activationCode: 'Código de Activación', enterActivationCode: 'Introducir código', codeActivated: '¡Código activado!', invalidCode: 'Código inválido', codeAlreadyUsed: 'Código ya utilizado',
    settings: 'Ajustes', language: 'Idioma', backup: 'Copia en la Nube', backupInfo: 'Tus datos se guardan automáticamente', version: 'Versión',
    cloudBackupTitle: 'Copia de Seguridad', cloudBackupSubtitle: 'Tus datos están seguros', cloudBackupDescription: 'Todos tus enlaces, notas y ajustes se sincronizan automáticamente.',
    cloudBackupIOS: 'iCloud Backup', cloudBackupAndroid: 'Google Backup', cloudBackupEnabled: 'Activado', cloudBackupTip: 'Asegúrate de que la copia de seguridad esté activada.',
    notifications: 'Notificaciones', weeklySummary: 'Resumen Semanal', weeklySummaryInfo: 'Recibe un recordatorio para revisar tu contenido',
    dayOfWeek: 'Día', time: 'Hora', selectDay: 'Seleccionar día', selectTime: 'Seleccionar hora',
    weeklySummaryEnabled: 'Resumen semanal activado', weeklySummaryDisabled: 'Resumen semanal desactivado',
    copied: '¡Copiado!', saved: '¡Guardado!', deleted: '¡Eliminado!', error: 'Error',
    reminder: 'Recordatorio', setReminder: 'Definir Recordatorio', reminderDate: 'Fecha', reminderTime: 'Hora', reminderLocation: 'Ubicación',
    reminderLocationPlaceholder: 'Añadir ubicación (opcional)', reminderEnabled: 'Recordatorio activado', noDate: 'Sin fecha', noTime: 'Sin hora', clearReminder: 'Borrar Recordatorio',
    editItem: 'Editar', moveToFolder: 'Mover a carpeta',
  },
  fr: {
    tabLinks: 'Liens', tabFavorites: 'Favoris', tabClipboard: 'Clipboard', tabSettings: 'Paramètres',
    appName: 'Memor.ia', save: 'Enregistrer', cancel: 'Annuler', delete: 'Supprimer', edit: 'Modifier', copy: 'Copier', open: 'Ouvrir', search: 'Rechercher...',
    allLinks: 'Tous les Liens', allClipboards: 'Toutes les Notes', folders: 'Dossiers', newFolder: 'Nouveau Dossier', generalFolder: 'Général', folderName: 'Nom', selectFolder: 'Sélectionner dossier',
    clipboardPlaceholder: 'Collez du texte ou des emojis ici...', noClipboardItems: 'Pas encore de notes', chars: 'caractères',
    smartClipboard: 'Smart Clipboard', smartClipboardInfo: "Pendant qu'il est actif, enregistre tout ce que vous copiez.", activate: 'Activer', deactivate: 'Arrêter', timeRemaining: 'restantes',
    premium: 'Premium', premiumActive: 'Premium Actif', trialActive: "Période d'Essai", trialDaysLeft: 'jours restants', trialExpired: "Période d'Essai Expirée",
    activationCode: "Code d'Activation", enterActivationCode: 'Entrer le code', codeActivated: 'Code activé!', invalidCode: 'Code invalide', codeAlreadyUsed: 'Code déjà utilisé',
    settings: 'Paramètres', language: 'Langue', backup: 'Sauvegarde Cloud', backupInfo: 'Vos données sont sauvegardées automatiquement', version: 'Version',
    cloudBackupTitle: 'Sauvegarde Automatique', cloudBackupSubtitle: 'Vos données sont en sécurité', cloudBackupDescription: 'Tous vos liens, notes et paramètres sont synchronisés automatiquement.',
    cloudBackupIOS: 'iCloud Backup', cloudBackupAndroid: 'Google Backup', cloudBackupEnabled: 'Activé', cloudBackupTip: 'Assurez-vous que la sauvegarde cloud est activée.',
    notifications: 'Notifications', weeklySummary: 'Résumé Hebdomadaire', weeklySummaryInfo: 'Recevez un rappel pour revoir votre contenu',
    dayOfWeek: 'Jour', time: 'Heure', selectDay: 'Sélectionner le jour', selectTime: "Sélectionner l'heure",
    weeklySummaryEnabled: 'Résumé hebdomadaire activé', weeklySummaryDisabled: 'Résumé hebdomadaire désactivé',
    copied: 'Copié!', saved: 'Enregistré!', deleted: 'Supprimé!', error: 'Erreur',
    reminder: 'Rappel', setReminder: 'Définir un Rappel', reminderDate: 'Date', reminderTime: 'Heure', reminderLocation: 'Lieu',
    reminderLocationPlaceholder: 'Ajouter un lieu (optionnel)', reminderEnabled: 'Rappel activé', noDate: 'Pas de date', noTime: "Pas d'heure", clearReminder: 'Effacer le Rappel',
    editItem: 'Modifier', moveToFolder: 'Déplacer vers dossier',
  },
};

export const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
];

export const detectLanguage = () => {
  const locale = Localization.locale.split('-')[0];
  return ['en', 'pt', 'es', 'fr'].includes(locale) ? locale : 'en';
};

export const getStoredLanguage = async () => {
  try {
    const lang = await AsyncStorage.getItem('memoria-language');
    return lang || detectLanguage();
  } catch (error) {
    return detectLanguage();
  }
};

export const setLanguage = async (lang) => {
  try {
    await AsyncStorage.setItem('memoria-language', lang);
  } catch (error) {
    console.error('Error setting language:', error);
  }
};`,

  'src/lib/notifications.js': `import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

const WEEKLY_SUMMARY_KEY = 'memoria-weekly-summary';

export const DAYS_OF_WEEK = [
  { value: 0, en: 'Sunday', pt: 'Domingo', es: 'Domingo', fr: 'Dimanche' },
  { value: 1, en: 'Monday', pt: 'Segunda-feira', es: 'Lunes', fr: 'Lundi' },
  { value: 2, en: 'Tuesday', pt: 'Terça-feira', es: 'Martes', fr: 'Mardi' },
  { value: 3, en: 'Wednesday', pt: 'Quarta-feira', es: 'Miércoles', fr: 'Mercredi' },
  { value: 4, en: 'Thursday', pt: 'Quinta-feira', es: 'Jueves', fr: 'Jeudi' },
  { value: 5, en: 'Friday', pt: 'Sexta-feira', es: 'Viernes', fr: 'Vendredi' },
  { value: 6, en: 'Saturday', pt: 'Sábado', es: 'Sábado', fr: 'Samedi' },
];

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowAlert: true, shouldPlaySound: true, shouldSetBadge: false }),
});

export async function requestNotificationPermissions() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  return finalStatus === 'granted';
}

export async function getWeeklySummarySettings() {
  try {
    const data = await AsyncStorage.getItem(WEEKLY_SUMMARY_KEY);
    if (data) return JSON.parse(data);
    return { enabled: false, dayOfWeek: 0, hour: 19, minute: 0 };
  } catch (error) {
    return { enabled: false, dayOfWeek: 0, hour: 19, minute: 0 };
  }
}

export async function saveWeeklySummarySettings(settings) {
  try {
    await AsyncStorage.setItem(WEEKLY_SUMMARY_KEY, JSON.stringify(settings));
    await cancelWeeklySummary();
    if (settings.enabled) await scheduleWeeklySummary(settings);
    return true;
  } catch (error) {
    return false;
  }
}

export async function scheduleWeeklySummary(settings) {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return false;
  try {
    await cancelWeeklySummary();
    await Notifications.scheduleNotificationAsync({
      content: { title: 'Memor.ia - Resumo Semanal', body: 'Hora de rever os teus links e notas!', data: { type: 'weekly_summary' } },
      trigger: { weekday: settings.dayOfWeek + 1, hour: settings.hour, minute: settings.minute, repeats: true },
    });
    return true;
  } catch (error) {
    return false;
  }
}

export async function cancelWeeklySummary() {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const n of scheduled) {
      if (n.content.data?.type === 'weekly_summary') {
        await Notifications.cancelScheduledNotificationAsync(n.identifier);
      }
    }
    return true;
  } catch (error) {
    return false;
  }
}

export function formatTimeForLocale(hour, minute) {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

export function getDayName(dayValue, language) {
  const day = DAYS_OF_WEEK.find(d => d.value === dayValue);
  return day ? (day[language] || day.en) : '';
}`,

  'src/screens/LinksScreen.js': `import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, Image, Linking, Alert, RefreshControl, Modal, ScrollView, Switch, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import { supabase, generateId } from '../lib/supabase';
import { translations } from '../lib/i18n';

const DEMO_USER = 'demo_user';

export default function LinksScreen({ language }) {
  const [links, setLinks] = useState([]);
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editFolderId, setEditFolderId] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderDate, setReminderDate] = useState(null);
  const [reminderTime, setReminderTime] = useState(null);
  const [reminderLocation, setReminderLocation] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showFolderPicker, setShowFolderPicker] = useState(false);

  const t = translations[language] || translations.en;

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const { data: foldersData } = await supabase.from('folders').select('*').eq('userId', DEMO_USER).eq('folderType', 'link').order('createdAt', { ascending: false });
      const { data: linksData } = await supabase.from('links').select('*').eq('userId', DEMO_USER).eq('contentType', 'link').order('createdAt', { ascending: false });
      setFolders(foldersData || []);
      setLinks(linksData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAddLink = async () => {
    if (!newUrl.trim()) return;
    let url = newUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) url = 'https://' + url;
    try {
      const defaultFolder = folders.find(f => f.isDefault);
      const newLink = { id: generateId(), userId: DEMO_USER, url, title: url, contentType: 'link', tags: [], isFavorite: false, folderId: selectedFolder !== 'all' ? selectedFolder : defaultFolder?.id, createdAt: new Date().toISOString() };
      const { error } = await supabase.from('links').insert([newLink]);
      if (error) throw error;
      setLinks([newLink, ...links]);
      setNewUrl('');
      Toast.show({ type: 'success', text1: t.saved });
    } catch (error) {
      Toast.show({ type: 'error', text1: t.error });
    }
  };

  const handleOpenLink = (url) => { Linking.openURL(url); };

  const handleDeleteLink = (id) => {
    Alert.alert(t.delete, '', [
      { text: t.cancel, style: 'cancel' },
      { text: t.delete, style: 'destructive', onPress: async () => {
        try {
          await supabase.from('links').delete().eq('id', id);
          setLinks(links.filter(l => l.id !== id));
          Toast.show({ type: 'success', text1: t.deleted });
        } catch (error) {}
      }},
    ]);
  };

  const handleToggleFavorite = async (item) => {
    try {
      const newValue = !item.isFavorite;
      await supabase.from('links').update({ isFavorite: newValue }).eq('id', item.id);
      setLinks(links.map(l => l.id === item.id ? { ...l, isFavorite: newValue } : l));
    } catch (error) {}
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setEditTitle(item.title || '');
    setEditFolderId(item.folderId || '');
    if (item.reminder) {
      setReminderEnabled(true);
      setReminderDate(item.reminder.date ? new Date(item.reminder.date) : null);
      setReminderTime(item.reminder.time ? new Date(item.reminder.time) : null);
      setReminderLocation(item.reminder.location || '');
    } else {
      setReminderEnabled(false);
      setReminderDate(null);
      setReminderTime(null);
      setReminderLocation('');
    }
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingItem(null);
    setEditTitle('');
    setEditFolderId('');
    setReminderEnabled(false);
    setReminderDate(null);
    setReminderTime(null);
    setReminderLocation('');
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    try {
      let reminderData = null;
      if (reminderEnabled && (reminderDate || reminderTime || reminderLocation)) {
        reminderData = { date: reminderDate?.toISOString(), time: reminderTime?.toISOString(), location: reminderLocation || null };
        if (reminderDate) {
          const triggerDate = new Date(reminderDate);
          if (reminderTime) triggerDate.setHours(reminderTime.getHours(), reminderTime.getMinutes(), 0, 0);
          else triggerDate.setHours(9, 0, 0, 0);
          if (triggerDate > new Date()) {
            await Notifications.scheduleNotificationAsync({
              content: { title: 'Memor.ia - ' + t.reminder, body: editingItem.title || editingItem.url, data: { linkId: editingItem.id } },
              trigger: triggerDate,
            });
          }
        }
      }
      const updateData = { title: editTitle, folderId: editFolderId || null, reminder: reminderData };
      await supabase.from('links').update(updateData).eq('id', editingItem.id);
      setLinks(links.map(l => l.id === editingItem.id ? { ...l, ...updateData } : l));
      Toast.show({ type: 'success', text1: reminderEnabled ? t.reminderEnabled : t.saved });
      closeEditModal();
    } catch (error) {
      Toast.show({ type: 'error', text1: t.error });
    }
  };

  const formatDate = (date) => date ? date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' }) : t.noDate;
  const formatTime = (time) => time ? time.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : t.noTime;

  const filteredLinks = links.filter(link => {
    const matchesFolder = selectedFolder === 'all' || link.folderId === selectedFolder;
    const matchesSearch = !searchQuery || link.title?.toLowerCase().includes(searchQuery.toLowerCase()) || link.url?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  const renderLinkItem = ({ item }) => {
    const folder = folders.find(f => f.id === item.folderId);
    const hasReminder = item.reminder && (item.reminder.date || item.reminder.time || item.reminder.location);
    return (
      <TouchableOpacity style={styles.linkCard} onPress={() => handleOpenLink(item.url)} onLongPress={() => openEditModal(item)}>
        {item.imageUrl && <Image source={{ uri: item.imageUrl }} style={styles.linkImage} />}
        <View style={styles.linkContent}>
          <Text style={styles.linkTitle} numberOfLines={2}>{item.title || item.url}</Text>
          <Text style={styles.linkUrl} numberOfLines={1}>{item.url}</Text>
          <View style={styles.linkMeta}>
            <View style={styles.folderBadge}><Text style={styles.folderBadgeText}>{folder?.isDefault ? t.generalFolder : folder?.name || t.generalFolder}</Text></View>
            {hasReminder && <View style={styles.reminderBadge}><Ionicons name="alarm" size={12} color="#FFD60A" /><Text style={styles.reminderBadgeText}>{t.reminder}</Text></View>}
          </View>
        </View>
        <View style={styles.linkActions}>
          <TouchableOpacity style={styles.editButton} onPress={() => openEditModal(item)}><Ionicons name="pencil" size={18} color="#8E8E93" /></TouchableOpacity>
          <TouchableOpacity onPress={() => handleToggleFavorite(item)}><Ionicons name={item.isFavorite ? 'heart' : 'heart-outline'} size={24} color={item.isFavorite ? '#FF3B30' : '#8E8E93'} /></TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}><Ionicons name="search" size={20} color="#8E8E93" /><TextInput style={styles.searchInput} placeholder={t.search} placeholderTextColor="#8E8E93" value={searchQuery} onChangeText={setSearchQuery} /></View>
      <View style={styles.addContainer}><TextInput style={styles.addInput} placeholder="https://..." placeholderTextColor="#8E8E93" value={newUrl} onChangeText={setNewUrl} autoCapitalize="none" keyboardType="url" /><TouchableOpacity style={styles.addButton} onPress={handleAddLink}><Ionicons name="add" size={24} color="#FFFFFF" /></TouchableOpacity></View>
      <FlatList horizontal data={[{ id: 'all', name: t.allLinks }, ...folders]} keyExtractor={(item) => item.id} showsHorizontalScrollIndicator={false} style={styles.folderList} renderItem={({ item }) => (<TouchableOpacity style={[styles.folderChip, selectedFolder === item.id && styles.folderChipActive]} onPress={() => setSelectedFolder(item.id)}><Text style={[styles.folderChipText, selectedFolder === item.id && styles.folderChipTextActive]}>{item.icon || ''} {item.isDefault ? t.generalFolder : item.name}</Text></TouchableOpacity>)} />
      <FlatList data={filteredLinks} keyExtractor={(item) => item.id} renderItem={renderLinkItem} contentContainerStyle={styles.listContent} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor="#007AFF" />} ListEmptyComponent={<View style={styles.emptyState}><Ionicons name="link-outline" size={64} color="#8E8E93" /><Text style={styles.emptyText}>{t.noClipboardItems}</Text></View>} />
      
      <Modal visible={showEditModal} animationType="slide" transparent={true} onRequestClose={closeEditModal}>
        <View style={styles.modalOverlay}><View style={styles.modalContent}>
          <View style={styles.modalHeader}><Text style={styles.modalTitle}>{t.editItem}</Text><TouchableOpacity onPress={closeEditModal}><Ionicons name="close" size={28} color="#FFFFFF" /></TouchableOpacity></View>
          <ScrollView style={styles.modalBody}>
            <Text style={styles.inputLabel}>{t.edit}</Text>
            <TextInput style={styles.textInput} value={editTitle} onChangeText={setEditTitle} placeholder={editingItem?.url} placeholderTextColor="#8E8E93" />
            <Text style={styles.inputLabel}>{t.moveToFolder}</Text>
            <TouchableOpacity style={styles.pickerButton} onPress={() => setShowFolderPicker(true)}><Ionicons name="folder-outline" size={20} color="#007AFF" /><Text style={styles.pickerButtonText}>{folders.find(f => f.id === editFolderId)?.name || t.generalFolder}</Text><Ionicons name="chevron-forward" size={20} color="#8E8E93" /></TouchableOpacity>
            <View style={styles.reminderSection}>
              <View style={styles.reminderHeader}><View style={styles.reminderHeaderLeft}><Ionicons name="alarm-outline" size={24} color="#FFD60A" /><Text style={styles.reminderTitle}>{t.setReminder}</Text></View><Switch value={reminderEnabled} onValueChange={setReminderEnabled} trackColor={{ false: '#3A3A3C', true: '#34C759' }} thumbColor="#FFFFFF" /></View>
              {reminderEnabled && (
                <View style={styles.reminderOptions}>
                  <TouchableOpacity style={styles.reminderOption} onPress={() => setShowDatePicker(true)}><View style={styles.reminderOptionLeft}><Ionicons name="calendar-outline" size={20} color="#007AFF" /><Text style={styles.reminderOptionLabel}>{t.reminderDate}</Text></View><View style={styles.reminderOptionRight}><Text style={[styles.reminderOptionValue, reminderDate && styles.reminderOptionValueActive]}>{formatDate(reminderDate)}</Text><Ionicons name="chevron-forward" size={16} color="#8E8E93" /></View></TouchableOpacity>
                  <TouchableOpacity style={styles.reminderOption} onPress={() => setShowTimePicker(true)}><View style={styles.reminderOptionLeft}><Ionicons name="time-outline" size={20} color="#007AFF" /><Text style={styles.reminderOptionLabel}>{t.reminderTime}</Text></View><View style={styles.reminderOptionRight}><Text style={[styles.reminderOptionValue, reminderTime && styles.reminderOptionValueActive]}>{formatTime(reminderTime)}</Text><Ionicons name="chevron-forward" size={16} color="#8E8E93" /></View></TouchableOpacity>
                  <View style={styles.reminderOption}><View style={styles.reminderOptionLeft}><Ionicons name="location-outline" size={20} color="#007AFF" /><Text style={styles.reminderOptionLabel}>{t.reminderLocation}</Text></View></View>
                  <TextInput style={styles.locationInput} value={reminderLocation} onChangeText={setReminderLocation} placeholder={t.reminderLocationPlaceholder} placeholderTextColor="#8E8E93" />
                  {(reminderDate || reminderTime || reminderLocation) && <TouchableOpacity style={styles.clearReminderButton} onPress={() => { setReminderDate(null); setReminderTime(null); setReminderLocation(''); }}><Ionicons name="trash-outline" size={18} color="#FF3B30" /><Text style={styles.clearReminderText}>{t.clearReminder}</Text></TouchableOpacity>}
                </View>
              )}
            </View>
          </ScrollView>
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveEdit}><Text style={styles.saveButtonText}>{t.save}</Text></TouchableOpacity>
        </View></View>
      </Modal>

      {showDatePicker && <Modal visible={showDatePicker} animationType="slide" transparent={true} onRequestClose={() => setShowDatePicker(false)}><View style={styles.pickerModalOverlay}><View style={styles.pickerModalContent}>{Platform.OS === 'ios' && <View style={styles.pickerHeader}><TouchableOpacity onPress={() => setShowDatePicker(false)}><Text style={styles.pickerCancel}>{t.cancel}</Text></TouchableOpacity><Text style={styles.pickerTitle}>{t.reminderDate}</Text><TouchableOpacity onPress={() => setShowDatePicker(false)}><Text style={styles.pickerDone}>OK</Text></TouchableOpacity></View>}<DateTimePicker value={reminderDate || new Date()} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={(e, d) => { if (Platform.OS === 'android') setShowDatePicker(false); if (e.type !== 'dismissed' && d) setReminderDate(d); }} minimumDate={new Date()} textColor="#FFFFFF" themeVariant="dark" style={Platform.OS === 'ios' ? styles.iosPicker : undefined} /></View></View></Modal>}
      {showTimePicker && <Modal visible={showTimePicker} animationType="slide" transparent={true} onRequestClose={() => setShowTimePicker(false)}><View style={styles.pickerModalOverlay}><View style={styles.pickerModalContent}>{Platform.OS === 'ios' && <View style={styles.pickerHeader}><TouchableOpacity onPress={() => setShowTimePicker(false)}><Text style={styles.pickerCancel}>{t.cancel}</Text></TouchableOpacity><Text style={styles.pickerTitle}>{t.reminderTime}</Text><TouchableOpacity onPress={() => setShowTimePicker(false)}><Text style={styles.pickerDone}>OK</Text></TouchableOpacity></View>}<DateTimePicker value={reminderTime || new Date()} mode="time" display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={(e, d) => { if (Platform.OS === 'android') setShowTimePicker(false); if (e.type !== 'dismissed' && d) setReminderTime(d); }} textColor="#FFFFFF" themeVariant="dark" style={Platform.OS === 'ios' ? styles.iosPicker : undefined} /></View></View></Modal>}
      <Modal visible={showFolderPicker} animationType="slide" transparent={true} onRequestClose={() => setShowFolderPicker(false)}><View style={styles.modalOverlay}><View style={styles.folderPickerContent}><View style={styles.modalHeader}><Text style={styles.modalTitle}>{t.selectFolder}</Text><TouchableOpacity onPress={() => setShowFolderPicker(false)}><Ionicons name="close" size={28} color="#FFFFFF" /></TouchableOpacity></View><ScrollView>{folders.map((folder) => (<TouchableOpacity key={folder.id} style={[styles.folderOption, editFolderId === folder.id && styles.folderOptionActive]} onPress={() => { setEditFolderId(folder.id); setShowFolderPicker(false); }}><Text style={styles.folderOptionIcon}>{folder.icon || '📁'}</Text><Text style={styles.folderOptionName}>{folder.isDefault ? t.generalFolder : folder.name}</Text>{editFolderId === folder.id && <Ionicons name="checkmark" size={24} color="#007AFF" />}</TouchableOpacity>))}</ScrollView></View></View></Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1C1C1E', margin: 16, marginBottom: 8, paddingHorizontal: 12, borderRadius: 12, height: 44 },
  searchInput: { flex: 1, marginLeft: 8, color: '#FFFFFF', fontSize: 16 },
  addContainer: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 8, gap: 8 },
  addInput: { flex: 1, backgroundColor: '#1C1C1E', paddingHorizontal: 16, borderRadius: 12, height: 44, color: '#FFFFFF', fontSize: 16 },
  addButton: { backgroundColor: '#007AFF', width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  folderList: { paddingHorizontal: 16, marginBottom: 8, maxHeight: 44 },
  folderChip: { backgroundColor: '#1C1C1E', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
  folderChipActive: { backgroundColor: '#007AFF' },
  folderChipText: { color: '#8E8E93', fontSize: 14 },
  folderChipTextActive: { color: '#FFFFFF' },
  listContent: { padding: 16, paddingTop: 8 },
  linkCard: { backgroundColor: '#1C1C1E', borderRadius: 16, marginBottom: 12, flexDirection: 'row', overflow: 'hidden' },
  linkImage: { width: 80, height: 80 },
  linkContent: { flex: 1, padding: 12 },
  linkTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginBottom: 4 },
  linkUrl: { color: '#8E8E93', fontSize: 12, marginBottom: 8 },
  linkMeta: { flexDirection: 'row', gap: 8 },
  folderBadge: { backgroundColor: 'rgba(0, 122, 255, 0.2)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  folderBadgeText: { color: '#007AFF', fontSize: 12 },
  reminderBadge: { backgroundColor: 'rgba(255, 214, 10, 0.2)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 4 },
  reminderBadgeText: { color: '#FFD60A', fontSize: 12 },
  linkActions: { justifyContent: 'center', alignItems: 'center', paddingRight: 12, gap: 12 },
  editButton: { padding: 4 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyText: { color: '#8E8E93', fontSize: 16, marginTop: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1C1C1E', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#2C2C2E' },
  modalTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' },
  modalBody: { padding: 20, maxHeight: 500 },
  inputLabel: { color: '#8E8E93', fontSize: 14, marginBottom: 8, textTransform: 'uppercase' },
  textInput: { backgroundColor: '#000000', borderRadius: 12, padding: 16, color: '#FFFFFF', fontSize: 16, marginBottom: 20 },
  pickerButton: { backgroundColor: '#000000', borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  pickerButtonText: { flex: 1, color: '#FFFFFF', fontSize: 16 },
  reminderSection: { backgroundColor: '#000000', borderRadius: 16, padding: 16, marginBottom: 20 },
  reminderHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  reminderHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  reminderTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
  reminderOptions: { marginTop: 16, borderTopWidth: 1, borderTopColor: '#2C2C2E', paddingTop: 16 },
  reminderOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  reminderOptionLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  reminderOptionLabel: { color: '#FFFFFF', fontSize: 16 },
  reminderOptionRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  reminderOptionValue: { color: '#8E8E93', fontSize: 14 },
  reminderOptionValueActive: { color: '#007AFF' },
  locationInput: { backgroundColor: '#1C1C1E', borderRadius: 10, padding: 12, color: '#FFFFFF', fontSize: 16, marginTop: 4, marginBottom: 12 },
  clearReminderButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, marginTop: 8 },
  clearReminderText: { color: '#FF3B30', fontSize: 16 },
  saveButton: { backgroundColor: '#007AFF', margin: 20, padding: 16, borderRadius: 12, alignItems: 'center' },
  saveButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
  pickerModalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.8)', justifyContent: 'flex-end' },
  pickerModalContent: { backgroundColor: '#1C1C1E', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 40 },
  pickerHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#2C2C2E' },
  pickerTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
  pickerCancel: { color: '#8E8E93', fontSize: 16 },
  pickerDone: { color: '#007AFF', fontSize: 16, fontWeight: '600' },
  iosPicker: { height: 200 },
  folderPickerContent: { backgroundColor: '#1C1C1E', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '60%', paddingBottom: 40 },
  folderOption: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#2C2C2E' },
  folderOptionActive: { backgroundColor: 'rgba(0, 122, 255, 0.1)' },
  folderOptionIcon: { fontSize: 24, marginRight: 12 },
  folderOptionName: { flex: 1, color: '#FFFFFF', fontSize: 16 },
});`,

  'src/screens/ClipboardScreen.js': `import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { supabase, generateId } from '../lib/supabase';
import { translations } from '../lib/i18n';

const DEMO_USER = 'demo_user';

export default function ClipboardScreen({ language }) {
  const [notes, setNotes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [newNote, setNewNote] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const t = translations[language] || translations.en;

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const { data: foldersData } = await supabase.from('folders').select('*').eq('userId', DEMO_USER).eq('folderType', 'text').order('createdAt', { ascending: false });
      const { data: notesData } = await supabase.from('links').select('*').eq('userId', DEMO_USER).eq('contentType', 'text').order('createdAt', { ascending: false });
      setFolders(foldersData || []);
      setNotes(notesData || []);
    } catch (error) {
      console.error('Error:', error);
    } finally { setRefreshing(false); }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    try {
      const defaultFolder = folders.find(f => f.isDefault);
      const note = { id: generateId(), userId: DEMO_USER, content: newNote, contentType: 'text', title: newNote.substring(0, 50), tags: [], isFavorite: false, folderId: selectedFolder !== 'all' ? selectedFolder : defaultFolder?.id, createdAt: new Date().toISOString() };
      await supabase.from('links').insert([note]);
      setNotes([note, ...notes]);
      setNewNote('');
      Toast.show({ type: 'success', text1: t.saved });
    } catch (error) {
      Toast.show({ type: 'error', text1: t.error });
    }
  };

  const handleCopyNote = async (content) => {
    try {
      const Clipboard = require('expo-clipboard');
      await Clipboard.setStringAsync(content);
      Toast.show({ type: 'success', text1: t.copied });
    } catch (error) {}
  };

  const handleDeleteNote = async (id) => {
    try {
      await supabase.from('links').delete().eq('id', id);
      setNotes(notes.filter(n => n.id !== id));
      Toast.show({ type: 'success', text1: t.deleted });
    } catch (error) {}
  };

  const filteredNotes = notes.filter(note => selectedFolder === 'all' || note.folderId === selectedFolder);

  return (
    <View style={styles.container}>
      <View style={styles.addContainer}>
        <TextInput style={styles.addInput} placeholder={t.clipboardPlaceholder} placeholderTextColor="#8E8E93" value={newNote} onChangeText={setNewNote} multiline />
        <TouchableOpacity style={styles.addButton} onPress={handleAddNote}><Ionicons name="add" size={24} color="#FFFFFF" /></TouchableOpacity>
      </View>
      <FlatList horizontal data={[{ id: 'all', name: t.allClipboards }, ...folders]} keyExtractor={(item) => item.id} showsHorizontalScrollIndicator={false} style={styles.folderList} renderItem={({ item }) => (<TouchableOpacity style={[styles.folderChip, selectedFolder === item.id && styles.folderChipActive]} onPress={() => setSelectedFolder(item.id)}><Text style={[styles.folderChipText, selectedFolder === item.id && styles.folderChipTextActive]}>{item.icon || ''} {item.isDefault ? t.generalFolder : item.name}</Text></TouchableOpacity>)} />
      <FlatList data={filteredNotes} keyExtractor={(item) => item.id} contentContainerStyle={styles.listContent} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor="#007AFF" />} ListEmptyComponent={<View style={styles.emptyState}><Ionicons name="clipboard-outline" size={64} color="#8E8E93" /><Text style={styles.emptyText}>{t.noClipboardItems}</Text></View>} renderItem={({ item }) => (
        <View style={styles.noteCard}>
          <Text style={styles.noteContent} numberOfLines={4}>{item.content}</Text>
          <View style={styles.noteFooter}>
            <Text style={styles.noteChars}>{item.content?.length || 0} {t.chars}</Text>
            <View style={styles.noteActions}>
              <TouchableOpacity onPress={() => handleCopyNote(item.content)}><Ionicons name="copy-outline" size={20} color="#007AFF" /></TouchableOpacity>
              <TouchableOpacity onPress={() => handleDeleteNote(item.id)}><Ionicons name="trash-outline" size={20} color="#FF3B30" /></TouchableOpacity>
            </View>
          </View>
        </View>
      )} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  addContainer: { flexDirection: 'row', margin: 16, marginBottom: 8, gap: 8 },
  addInput: { flex: 1, backgroundColor: '#1C1C1E', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, color: '#FFFFFF', fontSize: 16, minHeight: 44, maxHeight: 100 },
  addButton: { backgroundColor: '#007AFF', width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  folderList: { paddingHorizontal: 16, marginBottom: 8, maxHeight: 44 },
  folderChip: { backgroundColor: '#1C1C1E', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
  folderChipActive: { backgroundColor: '#007AFF' },
  folderChipText: { color: '#8E8E93', fontSize: 14 },
  folderChipTextActive: { color: '#FFFFFF' },
  listContent: { padding: 16, paddingTop: 8 },
  noteCard: { backgroundColor: '#1C1C1E', borderRadius: 16, padding: 16, marginBottom: 12 },
  noteContent: { color: '#FFFFFF', fontSize: 16, lineHeight: 22 },
  noteFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#2C2C2E' },
  noteChars: { color: '#8E8E93', fontSize: 12 },
  noteActions: { flexDirection: 'row', gap: 16 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyText: { color: '#8E8E93', fontSize: 16, marginTop: 16 },
});`,

  'src/screens/FavoritesScreen.js': `import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Linking, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { translations } from '../lib/i18n';

const DEMO_USER = 'demo_user';

export default function FavoritesScreen({ language }) {
  const [favorites, setFavorites] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const t = translations[language] || translations.en;

  useEffect(() => { fetchFavorites(); }, []);

  const fetchFavorites = async () => {
    try {
      const { data } = await supabase.from('links').select('*').eq('userId', DEMO_USER).eq('isFavorite', true).order('createdAt', { ascending: false });
      setFavorites(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally { setRefreshing(false); }
  };

  const handleRemoveFavorite = async (id) => {
    try {
      await supabase.from('links').update({ isFavorite: false }).eq('id', id);
      setFavorites(favorites.filter(f => f.id !== id));
    } catch (error) {}
  };

  return (
    <View style={styles.container}>
      <FlatList data={favorites} keyExtractor={(item) => item.id} contentContainerStyle={styles.listContent} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchFavorites(); }} tintColor="#007AFF" />} ListEmptyComponent={<View style={styles.emptyState}><Ionicons name="heart-outline" size={64} color="#8E8E93" /><Text style={styles.emptyText}>{t.noClipboardItems}</Text></View>} renderItem={({ item }) => (
        <TouchableOpacity style={styles.card} onPress={() => item.contentType === 'link' && Linking.openURL(item.url)}>
          <View style={styles.cardContent}>
            <Ionicons name={item.contentType === 'link' ? 'link' : 'document-text'} size={24} color="#007AFF" />
            <View style={styles.cardText}>
              <Text style={styles.cardTitle} numberOfLines={2}>{item.title || item.content?.substring(0, 50)}</Text>
              {item.url && <Text style={styles.cardUrl} numberOfLines={1}>{item.url}</Text>}
            </View>
          </View>
          <TouchableOpacity onPress={() => handleRemoveFavorite(item.id)}><Ionicons name="heart" size={24} color="#FF3B30" /></TouchableOpacity>
        </TouchableOpacity>
      )} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  listContent: { padding: 16 },
  card: { backgroundColor: '#1C1C1E', borderRadius: 16, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardContent: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardText: { flex: 1 },
  cardTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  cardUrl: { color: '#8E8E93', fontSize: 12, marginTop: 4 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyText: { color: '#8E8E93', fontSize: 16, marginTop: 16 },
});`,

  'src/screens/SettingsScreen.js': `import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Modal, Switch, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import DateTimePicker from '@react-native-community/datetimepicker';
import { translations, languages, setLanguage as saveLanguage } from '../lib/i18n';
import { activatePremium, getPremiumStatus } from '../lib/premium';
import { getWeeklySummarySettings, saveWeeklySummarySettings, requestNotificationPermissions, DAYS_OF_WEEK, getDayName, formatTimeForLocale } from '../lib/notifications';

const API_URL = 'https://memor-clip.preview.emergentagent.com';

export default function SettingsScreen({ language, setLanguage, premiumStatus, setPremiumStatus }) {
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showActivationModal, setShowActivationModal] = useState(false);
  const [showDayModal, setShowDayModal] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [activationCode, setActivationCode] = useState('');
  const [activating, setActivating] = useState(false);
  const [summaryEnabled, setSummaryEnabled] = useState(false);
  const [summaryDay, setSummaryDay] = useState(0);
  const [summaryHour, setSummaryHour] = useState(19);
  const [summaryMinute, setSummaryMinute] = useState(0);

  const t = translations[language] || translations.en;

  useEffect(() => {
    const loadSettings = async () => {
      const settings = await getWeeklySummarySettings();
      setSummaryEnabled(settings.enabled);
      setSummaryDay(settings.dayOfWeek);
      setSummaryHour(settings.hour);
      setSummaryMinute(settings.minute);
    };
    loadSettings();
  }, []);

  const handleLanguageChange = async (langCode) => { setLanguage(langCode); await saveLanguage(langCode); setShowLanguageModal(false); };

  const handleActivateCode = async () => {
    if (!activationCode.trim()) return;
    setActivating(true);
    try {
      const response = await fetch(\`\${API_URL}/api/activate-code\`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: activationCode.toUpperCase().trim() }) });
      const result = await response.json();
      if (result.success) {
        await activatePremium(result.code);
        const newStatus = await getPremiumStatus();
        setPremiumStatus(newStatus);
        setActivationCode('');
        setShowActivationModal(false);
        Toast.show({ type: 'success', text1: t.codeActivated });
      } else {
        Toast.show({ type: 'error', text1: result.error === 'used' ? t.codeAlreadyUsed : t.invalidCode });
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: t.error });
    } finally { setActivating(false); }
  };

  const handleSummaryToggle = async (value) => {
    if (value) {
      const hasPermission = await requestNotificationPermissions();
      if (!hasPermission) { Toast.show({ type: 'error', text1: 'Permission required' }); return; }
    }
    setSummaryEnabled(value);
    await saveWeeklySummarySettings({ enabled: value, dayOfWeek: summaryDay, hour: summaryHour, minute: summaryMinute });
    Toast.show({ type: 'success', text1: value ? t.weeklySummaryEnabled : t.weeklySummaryDisabled });
  };

  const handleDayChange = async (dayValue) => {
    setSummaryDay(dayValue);
    setShowDayModal(false);
    if (summaryEnabled) await saveWeeklySummarySettings({ enabled: summaryEnabled, dayOfWeek: dayValue, hour: summaryHour, minute: summaryMinute });
  };

  const handleTimeChange = async (event, selectedDate) => {
    if (Platform.OS === 'android') setShowTimePicker(false);
    if (event.type === 'dismissed') { setShowTimePicker(false); return; }
    if (selectedDate) {
      const newHour = selectedDate.getHours();
      const newMinute = selectedDate.getMinutes();
      setSummaryHour(newHour);
      setSummaryMinute(newMinute);
      if (summaryEnabled) await saveWeeklySummarySettings({ enabled: summaryEnabled, dayOfWeek: summaryDay, hour: newHour, minute: newMinute });
    }
  };

  const getCurrentLanguage = () => { const lang = languages.find(l => l.code === language); return lang ? \`\${lang.flag} \${lang.name}\` : 'English'; };
  const getTimePickerDate = () => { const date = new Date(); date.setHours(summaryHour, summaryMinute, 0, 0); return date; };

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.premiumCard, premiumStatus?.isPremiumActivated && styles.premiumCardActive, premiumStatus?.isTrialActive && !premiumStatus?.isPremiumActivated && styles.premiumCardTrial, !premiumStatus?.hasPremium && styles.premiumCardExpired]}>
        <View style={styles.premiumIcon}><Ionicons name={premiumStatus?.isPremiumActivated ? 'crown' : 'sparkles'} size={32} color={premiumStatus?.isPremiumActivated ? '#FFD700' : '#007AFF'} /></View>
        <View style={styles.premiumContent}>
          <Text style={styles.premiumTitle}>{premiumStatus?.isPremiumActivated ? t.premiumActive : premiumStatus?.isTrialActive ? t.trialActive : t.trialExpired}</Text>
          <Text style={styles.premiumSubtitle}>{premiumStatus?.isPremiumActivated ? \`✅ \${premiumStatus.activatedCode}\` : premiumStatus?.isTrialActive ? \`\${premiumStatus.trialDaysRemaining} \${t.trialDaysLeft}\` : ''}</Text>
        </View>
      </View>

      {!premiumStatus?.isPremiumActivated && <TouchableOpacity style={styles.activateButton} onPress={() => setShowActivationModal(true)}><Ionicons name="ticket" size={24} color="#FFFFFF" /><Text style={styles.activateButtonText}>{t.enterActivationCode}</Text></TouchableOpacity>}

      <View style={styles.section}><Text style={styles.sectionTitle}>{t.notifications}</Text>
        <View style={styles.settingItem}><View style={styles.settingLeft}><Ionicons name="calendar-outline" size={24} color="#007AFF" /><View style={styles.settingTextContainer}><Text style={styles.settingLabel}>{t.weeklySummary}</Text><Text style={styles.settingDescription}>{t.weeklySummaryInfo}</Text></View></View><Switch value={summaryEnabled} onValueChange={handleSummaryToggle} trackColor={{ false: '#3A3A3C', true: '#34C759' }} thumbColor="#FFFFFF" /></View>
        {summaryEnabled && (<><TouchableOpacity style={styles.settingItem} onPress={() => setShowDayModal(true)}><View style={styles.settingLeft}><View style={styles.iconPlaceholder} /><Text style={styles.settingLabel}>{t.dayOfWeek}</Text></View><View style={styles.settingRight}><Text style={styles.settingValue}>{getDayName(summaryDay, language)}</Text><Ionicons name="chevron-forward" size={20} color="#8E8E93" /></View></TouchableOpacity><TouchableOpacity style={styles.settingItem} onPress={() => setShowTimePicker(true)}><View style={styles.settingLeft}><View style={styles.iconPlaceholder} /><Text style={styles.settingLabel}>{t.time}</Text></View><View style={styles.settingRight}><Text style={styles.settingValue}>{formatTimeForLocale(summaryHour, summaryMinute)}</Text><Ionicons name="chevron-forward" size={20} color="#8E8E93" /></View></TouchableOpacity></>)}
      </View>

      <View style={styles.cloudBackupCard}><View style={styles.cloudBackupHeader}><View style={styles.cloudBackupIconContainer}><Ionicons name="cloud-done" size={28} color="#FFFFFF" /></View><View style={styles.cloudBackupTitleContainer}><Text style={styles.cloudBackupTitle}>{t.cloudBackupTitle}</Text><Text style={styles.cloudBackupSubtitle}>{t.cloudBackupSubtitle}</Text></View><View style={styles.cloudBackupBadge}><Ionicons name="checkmark-circle" size={16} color="#34C759" /><Text style={styles.cloudBackupBadgeText}>{t.cloudBackupEnabled}</Text></View></View><Text style={styles.cloudBackupDescription}>{t.cloudBackupDescription}</Text><View style={styles.cloudBackupProviders}><View style={styles.cloudProvider}><Ionicons name={Platform.OS === 'ios' ? 'logo-apple' : 'logo-google'} size={20} color="#8E8E93" /><Text style={styles.cloudProviderText}>{Platform.OS === 'ios' ? t.cloudBackupIOS : t.cloudBackupAndroid}</Text></View></View><View style={styles.cloudBackupTipContainer}><Ionicons name="information-circle" size={16} color="#FFD60A" /><Text style={styles.cloudBackupTip}>{t.cloudBackupTip}</Text></View></View>

      <View style={styles.section}><Text style={styles.sectionTitle}>{t.settings}</Text><TouchableOpacity style={styles.settingItem} onPress={() => setShowLanguageModal(true)}><View style={styles.settingLeft}><Ionicons name="globe-outline" size={24} color="#007AFF" /><Text style={styles.settingLabel}>{t.language}</Text></View><View style={styles.settingRight}><Text style={styles.settingValue}>{getCurrentLanguage()}</Text><Ionicons name="chevron-forward" size={20} color="#8E8E93" /></View></TouchableOpacity></View>

      <View style={styles.section}><View style={styles.settingItem}><View style={styles.settingLeft}><Ionicons name="information-circle-outline" size={24} color="#8E8E93" /><Text style={styles.settingLabel}>{t.version}</Text></View><Text style={styles.settingValue}>1.0.0</Text></View></View>

      <Modal visible={showLanguageModal} animationType="slide" transparent={true} onRequestClose={() => setShowLanguageModal(false)}><View style={styles.modalOverlay}><View style={styles.modalContent}><View style={styles.modalHeader}><Text style={styles.modalTitle}>{t.language}</Text><TouchableOpacity onPress={() => setShowLanguageModal(false)}><Ionicons name="close" size={28} color="#FFFFFF" /></TouchableOpacity></View>{languages.map((lang) => (<TouchableOpacity key={lang.code} style={[styles.languageOption, language === lang.code && styles.languageOptionActive]} onPress={() => handleLanguageChange(lang.code)}><Text style={styles.languageFlag}>{lang.flag}</Text><Text style={styles.languageName}>{lang.name}</Text>{language === lang.code && <Ionicons name="checkmark" size={24} color="#007AFF" />}</TouchableOpacity>))}</View></View></Modal>

      <Modal visible={showDayModal} animationType="slide" transparent={true} onRequestClose={() => setShowDayModal(false)}><View style={styles.modalOverlay}><View style={styles.modalContent}><View style={styles.modalHeader}><Text style={styles.modalTitle}>{t.selectDay}</Text><TouchableOpacity onPress={() => setShowDayModal(false)}><Ionicons name="close" size={28} color="#FFFFFF" /></TouchableOpacity></View><ScrollView style={styles.dayList}>{DAYS_OF_WEEK.map((day) => (<TouchableOpacity key={day.value} style={[styles.dayOption, summaryDay === day.value && styles.dayOptionActive]} onPress={() => handleDayChange(day.value)}><Text style={styles.dayName}>{day[language] || day.en}</Text>{summaryDay === day.value && <Ionicons name="checkmark" size={24} color="#007AFF" />}</TouchableOpacity>))}</ScrollView></View></View></Modal>

      {showTimePicker && <Modal visible={showTimePicker} animationType="slide" transparent={true} onRequestClose={() => setShowTimePicker(false)}><View style={styles.timePickerOverlay}><View style={styles.timePickerContainer}>{Platform.OS === 'ios' && <View style={styles.timePickerHeader}><TouchableOpacity onPress={() => setShowTimePicker(false)}><Text style={styles.timePickerCancel}>{t.cancel}</Text></TouchableOpacity><Text style={styles.timePickerTitle}>{t.selectTime}</Text><TouchableOpacity onPress={() => setShowTimePicker(false)}><Text style={styles.timePickerDone}>OK</Text></TouchableOpacity></View>}<DateTimePicker value={getTimePickerDate()} mode="time" display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={handleTimeChange} textColor="#FFFFFF" themeVariant="dark" style={Platform.OS === 'ios' ? styles.iosTimePicker : undefined} /></View></View></Modal>}

      <Modal visible={showActivationModal} animationType="slide" transparent={true} onRequestClose={() => setShowActivationModal(false)}><View style={styles.modalOverlay}><View style={styles.modalContent}><View style={styles.modalHeader}><Text style={styles.modalTitle}>{t.activationCode}</Text><TouchableOpacity onPress={() => setShowActivationModal(false)}><Ionicons name="close" size={28} color="#FFFFFF" /></TouchableOpacity></View><View style={styles.activationIconContainer}><Ionicons name="ticket" size={48} color="#007AFF" /></View><TextInput style={styles.activationInput} placeholder="XXXX-XXXX-XXXX" placeholderTextColor="#8E8E93" value={activationCode} onChangeText={(text) => setActivationCode(text.toUpperCase())} autoCapitalize="characters" maxLength={14} /><TouchableOpacity style={[styles.activationSubmitButton, (!activationCode.trim() || activating) && styles.activationSubmitButtonDisabled]} onPress={handleActivateCode} disabled={!activationCode.trim() || activating}><Text style={styles.activationSubmitText}>{activating ? '...' : t.activate}</Text></TouchableOpacity></View></View></Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  premiumCard: { flexDirection: 'row', alignItems: 'center', margin: 16, padding: 20, borderRadius: 20, borderWidth: 1 },
  premiumCardActive: { backgroundColor: 'rgba(255, 215, 0, 0.1)', borderColor: '#FFD700' },
  premiumCardTrial: { backgroundColor: 'rgba(0, 122, 255, 0.1)', borderColor: '#007AFF' },
  premiumCardExpired: { backgroundColor: 'rgba(255, 59, 48, 0.1)', borderColor: '#FF3B30' },
  premiumIcon: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255, 255, 255, 0.1)', justifyContent: 'center', alignItems: 'center' },
  premiumContent: { flex: 1, marginLeft: 16 },
  premiumTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' },
  premiumSubtitle: { color: '#8E8E93', fontSize: 14, marginTop: 4 },
  activateButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#007AFF', marginHorizontal: 16, marginBottom: 16, padding: 16, borderRadius: 16, gap: 8 },
  activateButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  section: { backgroundColor: '#1C1C1E', marginHorizontal: 16, marginBottom: 16, borderRadius: 16, overflow: 'hidden' },
  sectionTitle: { color: '#8E8E93', fontSize: 13, fontWeight: '600', textTransform: 'uppercase', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  cloudBackupCard: { backgroundColor: '#1C1C1E', marginHorizontal: 16, marginBottom: 16, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#34C759' },
  cloudBackupHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cloudBackupIconContainer: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#34C759', justifyContent: 'center', alignItems: 'center' },
  cloudBackupTitleContainer: { flex: 1, marginLeft: 12 },
  cloudBackupTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  cloudBackupSubtitle: { color: '#34C759', fontSize: 14, marginTop: 2 },
  cloudBackupBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(52, 199, 89, 0.15)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, gap: 4 },
  cloudBackupBadgeText: { color: '#34C759', fontSize: 12, fontWeight: '600' },
  cloudBackupDescription: { color: '#8E8E93', fontSize: 14, lineHeight: 20, marginBottom: 12 },
  cloudBackupProviders: { flexDirection: 'row', marginBottom: 12 },
  cloudProvider: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2C2C2E', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, gap: 8 },
  cloudProviderText: { color: '#FFFFFF', fontSize: 14 },
  cloudBackupTipContainer: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: 'rgba(255, 214, 10, 0.1)', padding: 12, borderRadius: 10, gap: 8 },
  cloudBackupTip: { color: '#FFD60A', fontSize: 12, flex: 1, lineHeight: 16 },
  settingItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#2C2C2E' },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  settingTextContainer: { flex: 1 },
  settingDescription: { color: '#8E8E93', fontSize: 12, marginTop: 2 },
  settingRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  settingLabel: { color: '#FFFFFF', fontSize: 16 },
  settingValue: { color: '#8E8E93', fontSize: 16 },
  iconPlaceholder: { width: 24 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1C1C1E', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#2C2C2E' },
  modalTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' },
  languageOption: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#2C2C2E' },
  languageOptionActive: { backgroundColor: 'rgba(0, 122, 255, 0.1)' },
  languageFlag: { fontSize: 28, marginRight: 16 },
  languageName: { flex: 1, color: '#FFFFFF', fontSize: 18 },
  dayList: { maxHeight: 400 },
  dayOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#2C2C2E' },
  dayOptionActive: { backgroundColor: 'rgba(0, 122, 255, 0.1)' },
  dayName: { color: '#FFFFFF', fontSize: 18 },
  timePickerOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.8)', justifyContent: 'flex-end' },
  timePickerContainer: { backgroundColor: '#1C1C1E', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 40 },
  timePickerHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#2C2C2E' },
  timePickerTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
  timePickerCancel: { color: '#8E8E93', fontSize: 16 },
  timePickerDone: { color: '#007AFF', fontSize: 16, fontWeight: '600' },
  iosTimePicker: { height: 200 },
  activationIconContainer: { alignItems: 'center', paddingVertical: 24 },
  activationInput: { backgroundColor: '#000000', marginHorizontal: 20, padding: 16, borderRadius: 12, color: '#FFFFFF', fontSize: 20, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', textAlign: 'center', letterSpacing: 2 },
  activationSubmitButton: { backgroundColor: '#007AFF', marginHorizontal: 20, marginTop: 16, padding: 16, borderRadius: 12, alignItems: 'center' },
  activationSubmitButtonDisabled: { opacity: 0.5 },
  activationSubmitText: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
});`,
};

// Write all files
console.log('\n[3/4] Criando ficheiros...\n');

Object.entries(files).forEach(([filePath, content]) => {
  const dir = path.dirname(filePath);
  if (dir !== '.' && !fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, content);
  console.log(`✓ ${filePath}`);
});

console.log('\n========================================');
console.log('   SETUP COMPLETO!');
console.log('========================================');
console.log('\nProximos passos:');
console.log('1. npx expo start');
console.log('2. Scan QR code com Expo Go app');
console.log('\nOu para build:');
console.log('eas build --platform android --profile preview');
console.log('========================================\n');
