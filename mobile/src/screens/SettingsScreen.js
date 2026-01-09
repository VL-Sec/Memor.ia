import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Modal, Switch, Platform, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import DateTimePicker from '@react-native-community/datetimepicker';
import { translations, languages, setLanguage as saveLanguage } from '../lib/i18n';
import { activatePremium, getPremiumStatus } from '../lib/premium';
import { supabase } from '../lib/supabase';

const API_URL = 'https://memofix.preview.emergentagent.com';
const TERMS_URL = 'https://memofix.preview.emergentagent.com/terms';
const PRIVACY_URL = 'https://memofix.preview.emergentagent.com/privacy';

// Store URLs - Update these with your actual store URLs when published
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.memoria.app';
const APP_STORE_URL = 'https://apps.apple.com/app/memoria/id000000000';

// Check if we're in Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

const DAYS_OF_WEEK = [
  { value: 0, en: 'Sunday', pt: 'Domingo', es: 'Domingo', fr: 'Dimanche', de: 'Sonntag', it: 'Domenica' },
  { value: 1, en: 'Monday', pt: 'Segunda-feira', es: 'Lunes', fr: 'Lundi', de: 'Montag', it: 'Lunedì' },
  { value: 2, en: 'Tuesday', pt: 'Terça-feira', es: 'Martes', fr: 'Mardi', de: 'Dienstag', it: 'Martedì' },
  { value: 3, en: 'Wednesday', pt: 'Quarta-feira', es: 'Miércoles', fr: 'Mercredi', de: 'Mittwoch', it: 'Mercoledì' },
  { value: 4, en: 'Thursday', pt: 'Quinta-feira', es: 'Jueves', fr: 'Jeudi', de: 'Donnerstag', it: 'Giovedì' },
  { value: 5, en: 'Friday', pt: 'Sexta-feira', es: 'Viernes', fr: 'Vendredi', de: 'Freitag', it: 'Venerdì' },
  { value: 6, en: 'Saturday', pt: 'Sábado', es: 'Sábado', fr: 'Samedi', de: 'Samstag', it: 'Sabato' },
];

const HOURS = Array.from({ length: 24 }, (_, i) => i);

const getDayName = (dayValue, language) => {
  const day = DAYS_OF_WEEK.find(d => d.value === dayValue);
  return day ? (day[language] || day.en) : '';
};

const formatTimeForLocale = (hour, minute) => {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
};

// Get platform-specific backup info
const getBackupInfo = () => {
  if (Platform.OS === 'ios') {
    return {
      icon: 'logo-apple',
      name: 'iCloud',
      description: 'iCloud Backup',
    };
  }
  return {
    icon: 'logo-google',
    name: 'Google',
    description: 'Google Backup',
  };
};

export default function SettingsScreen({ language, setLanguage, premiumStatus, setPremiumStatus, userId }) {
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showActivationModal, setShowActivationModal] = useState(false);
  const [showDayModal, setShowDayModal] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [activationCode, setActivationCode] = useState('');
  const [activating, setActivating] = useState(false);
  const [summaryEnabled, setSummaryEnabled] = useState(false);
  const [summaryDay, setSummaryDay] = useState(0);
  const [summaryHour, setSummaryHour] = useState(19);
  const [summaryMinute, setSummaryMinute] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  
  // Dynamic storage key based on userId
  const getNotesStorageKey = () => `memoria-notes-${userId || 'default'}`;

  const t = translations[language] || translations.en;
  const backupInfo = getBackupInfo();

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await AsyncStorage.getItem('memoria-weekly-summary');
        if (data) {
          const settings = JSON.parse(data);
          setSummaryEnabled(settings.enabled || false);
          setSummaryDay(settings.dayOfWeek || 0);
          setSummaryHour(settings.hour || 19);
          setSummaryMinute(settings.minute || 0);
        }
      } catch (e) {
        console.error('Error loading settings:', e);
      }
    };
    loadSettings();
  }, []);

  const handleLanguageChange = async (langCode) => { 
    setLanguage(langCode); 
    await saveLanguage(langCode); 
    setShowLanguageModal(false); 
  };

  const handleActivateCode = async () => {
    if (!activationCode.trim()) return;
    setActivating(true);
    try {
      const response = await fetch(`${API_URL}/api/activate-code`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ code: activationCode.toUpperCase().trim() }) 
      });
      const result = await response.json();
      if (result.success) {
        await activatePremium(result.code);
        const newStatus = await getPremiumStatus();
        setPremiumStatus(newStatus);
        setActivationCode('');
        setShowActivationModal(false);
        Toast.show({ type: 'success', text1: t.codeActivated || 'Code activated!' });
      } else {
        Toast.show({ type: 'error', text1: result.error === 'used' ? (t.codeAlreadyUsed || 'Code already used') : (t.invalidCode || 'Invalid code') });
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: t.error || 'Error' });
    } finally { 
      setActivating(false); 
    }
  };

  const handleSummaryToggle = async (value) => {
    if (value) {
      // Check if we're in Expo Go (notifications don't work there)
      if (isExpoGo) {
        Alert.alert(
          t.notifications || 'Notifications',
          t.expoGoNotSupported || 'Notifications are not supported in Expo Go. Please use a development build or the published app to enable this feature.',
          [{ text: 'OK', style: 'default' }]
        );
        return;
      }
      
      // Request notification permission when enabling
      try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        
        if (finalStatus !== 'granted') {
          Alert.alert(
            t.notifications || 'Notifications',
            t.notificationPermissionRequired || 'Please enable notifications in your device settings to receive weekly summaries.',
            [
              { text: t.cancel || 'Cancel', style: 'cancel' },
              { text: t.settings || 'Settings', onPress: () => Linking.openSettings() }
            ]
          );
          return;
        }
        
        // Schedule the weekly notification
        await scheduleWeeklyNotification(summaryDay, summaryHour, summaryMinute);
        
      } catch (error) {
        console.log('Notification permission error:', error);
        Alert.alert(
          t.notifications || 'Notifications',
          t.notificationError || 'Could not enable notifications. Please try again later.',
          [{ text: 'OK', style: 'default' }]
        );
        return;
      }
    } else {
      // Cancel existing weekly notification when disabling
      await cancelWeeklyNotification();
    }
    
    setSummaryEnabled(value);
    try {
      await AsyncStorage.setItem('memoria-weekly-summary', JSON.stringify({ 
        enabled: value, 
        dayOfWeek: summaryDay, 
        hour: summaryHour, 
        minute: summaryMinute 
      }));
      Toast.show({ type: 'success', text1: value ? (t.weeklySummaryEnabled || 'Weekly summary enabled') : (t.weeklySummaryDisabled || 'Weekly summary disabled') });
    } catch (e) {
      console.error('Error saving settings:', e);
    }
  };
  
  // Schedule weekly notification
  const scheduleWeeklyNotification = async (dayOfWeek, hour, minute) => {
    try {
      // Cancel any existing weekly notifications first
      await cancelWeeklyNotification();
      
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: t.weeklySummaryTitle || 'Memor.ia - Resumo Semanal',
          body: t.weeklySummaryBody || 'Tens links e notas guardados para rever!',
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday: dayOfWeek + 1, // Notifications uses 1-7 (Sunday = 1), we use 0-6
          hour: hour,
          minute: minute,
          repeats: true,
        },
      });
      
      // Save the notification ID so we can cancel it later
      await AsyncStorage.setItem('memoria-weekly-notification-id', notificationId);
      console.log('Weekly notification scheduled:', notificationId);
      
    } catch (error) {
      console.error('Error scheduling weekly notification:', error);
      throw error;
    }
  };
  
  // Cancel weekly notification
  const cancelWeeklyNotification = async () => {
    try {
      const notificationId = await AsyncStorage.getItem('memoria-weekly-notification-id');
      if (notificationId) {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
        await AsyncStorage.removeItem('memoria-weekly-notification-id');
        console.log('Weekly notification cancelled');
      }
    } catch (error) {
      console.error('Error cancelling weekly notification:', error);
    }
  };

  const handleDayChange = async (dayValue) => {
    setSummaryDay(dayValue);
    setShowDayModal(false);
    if (summaryEnabled) {
      try {
        await AsyncStorage.setItem('memoria-weekly-summary', JSON.stringify({ 
          enabled: summaryEnabled, 
          dayOfWeek: dayValue, 
          hour: summaryHour, 
          minute: summaryMinute 
        }));
        // Reschedule notification with new day
        await scheduleWeeklyNotification(dayValue, summaryHour, summaryMinute);
        Toast.show({ type: 'success', text1: t.daySaved || 'Dia guardado' });
      } catch (e) {
        console.error('Error saving settings:', e);
      }
    }
  };

  const handleTimeChange = async (event, selectedTime) => {
    if (Platform.OS !== 'ios') {
      setShowTimeModal(false);
    }
    
    if (selectedTime) {
      const hour = selectedTime.getHours();
      const minute = selectedTime.getMinutes();
      setSummaryHour(hour);
      setSummaryMinute(minute);
      
      if (summaryEnabled) {
        try {
          await AsyncStorage.setItem('memoria-weekly-summary', JSON.stringify({ 
            enabled: summaryEnabled, 
            dayOfWeek: summaryDay, 
            hour: hour, 
            minute: minute 
          }));
          // Reschedule notification with new time
          await scheduleWeeklyNotification(summaryDay, hour, minute);
          Toast.show({ type: 'success', text1: t.timeSaved || 'Hora guardada' });
        } catch (e) {
          console.error('Error saving settings:', e);
        }
      }
    }
  };
  
  // Get time as Date object for DateTimePicker
  const getTimeAsDate = () => {
    const date = new Date();
    date.setHours(summaryHour, summaryMinute, 0, 0);
    return date;
  };

  // Export backup to JSON file
  const handleExportBackup = async () => {
    setIsExporting(true);
    try {
      // Show loading message
      Toast.show({ type: 'info', text1: t.exportingBackup || 'A exportar backup...' });
      
      // Collect all local data from AsyncStorage
      const localNotes = await AsyncStorage.getItem(getNotesStorageKey());
      const settings = await AsyncStorage.getItem('memoria-weekly-summary');
      const premiumData = await AsyncStorage.getItem('memoria-premium');
      const languageData = await AsyncStorage.getItem('memoria-language');
      
      // Fetch all Supabase data (links and clipboard items)
      const { data: linksData, error: linksError } = await supabase
        .from('links')
        .select('*')
        .eq('userId', userId);
      
      const { data: foldersData, error: foldersError } = await supabase
        .from('folders')
        .select('*')
        .eq('userId', userId);
      
      if (linksError) console.error('Links fetch error:', linksError);
      if (foldersError) console.error('Folders fetch error:', foldersError);
      
      // Separate links and clipboard items
      const links = (linksData || []).filter(item => item.contentType === 'link');
      const clipboardItems = (linksData || []).filter(item => item.contentType === 'text');
      
      const backupData = {
        appName: 'Memor.ia',
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        deviceInfo: {
          platform: Platform.OS,
        },
        data: {
          notes: localNotes ? JSON.parse(localNotes) : [],
          links: links,
          clipboardItems: clipboardItems,
          folders: foldersData || [],
          settings: {
            weeklySummary: settings ? JSON.parse(settings) : {},
            language: languageData || 'en',
          },
          premium: premiumData ? JSON.parse(premiumData) : {}
        },
        stats: {
          totalNotes: localNotes ? JSON.parse(localNotes).length : 0,
          totalLinks: links.length,
          totalClipboardItems: clipboardItems.length,
          totalFolders: (foldersData || []).length,
        }
      };
      
      const fileName = `memoria-backup-${new Date().toISOString().split('T')[0]}.json`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;
      
      // Write file
      await FileSystem.writeAsStringAsync(filePath, JSON.stringify(backupData, null, 2));
      
      // Verify file was created
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      if (!fileInfo.exists) {
        throw new Error('Failed to create backup file');
      }
      
      // Share the file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath, {
          mimeType: 'application/json',
          dialogTitle: t.exportBackup || 'Exportar Backup',
          UTI: 'public.json',
        });
        Toast.show({ 
          type: 'success', 
          text1: t.backupExported || 'Backup exportado!',
          text2: `${backupData.stats.totalNotes} notas, ${backupData.stats.totalLinks} links, ${backupData.stats.totalClipboardItems} itens`
        });
      } else {
        Toast.show({ type: 'error', text1: t.sharingNotAvailable || 'Partilha não disponível neste dispositivo' });
      }
    } catch (error) {
      console.error('Export error:', error);
      Toast.show({ type: 'error', text1: t.exportError || 'Erro ao exportar', text2: error.message });
    } finally {
      setIsExporting(false);
    }
  };

  // Import backup from JSON file
  const handleImportBackup = async () => {
    Alert.alert(
      t.importBackup || 'Importar Backup',
      t.importWarning || 'Isto irá substituir todos os seus dados atuais. Deseja continuar?',
      [
        { text: t.cancel || 'Cancelar', style: 'cancel' },
        { 
          text: t.continue || 'Continuar', 
          style: 'destructive',
          onPress: async () => {
            setIsImporting(true);
            try {
              const result = await DocumentPicker.getDocumentAsync({
                type: ['application/json', '*/*'],
                copyToCacheDirectory: true
              });
              
              if (result.canceled) {
                setIsImporting(false);
                return;
              }
              
              Toast.show({ type: 'info', text1: t.importingBackup || 'A importar backup...' });
              
              const fileUri = result.assets[0].uri;
              const fileContent = await FileSystem.readAsStringAsync(fileUri);
              const backupData = JSON.parse(fileContent);
              
              // Support both old and new backup formats
              if (!backupData.data && !backupData.version) {
                Toast.show({ type: 'error', text1: t.invalidBackupFile || 'Ficheiro de backup inválido' });
                setIsImporting(false);
                return;
              }
              
              let importedCount = 0;
              
              // Restore local notes (support both old 'localNotes' and new 'notes' keys)
              const notesToRestore = backupData.data?.notes || backupData.data?.localNotes;
              if (notesToRestore && Array.isArray(notesToRestore)) {
                await AsyncStorage.setItem(getNotesStorageKey(), JSON.stringify(notesToRestore));
                importedCount += notesToRestore.length;
              }
              
              // Restore settings
              const settingsToRestore = backupData.data?.settings;
              if (settingsToRestore) {
                if (settingsToRestore.weeklySummary) {
                  await AsyncStorage.setItem('memoria-weekly-summary', JSON.stringify(settingsToRestore.weeklySummary));
                  setSummaryEnabled(settingsToRestore.weeklySummary.enabled || false);
                  setSummaryDay(settingsToRestore.weeklySummary.dayOfWeek || 0);
                  setSummaryHour(settingsToRestore.weeklySummary.hour || 19);
                } else {
                  // Old format
                  await AsyncStorage.setItem('memoria-weekly-summary', JSON.stringify(settingsToRestore));
                  setSummaryEnabled(settingsToRestore.enabled || false);
                  setSummaryDay(settingsToRestore.dayOfWeek || 0);
                  setSummaryHour(settingsToRestore.hour || 19);
                }
                if (settingsToRestore.language) {
                  await AsyncStorage.setItem('memoria-language', settingsToRestore.language);
                }
              }
              
              // Restore premium
              if (backupData.data?.premium) {
                await AsyncStorage.setItem('memoria-premium', JSON.stringify(backupData.data.premium));
              }
              
              Toast.show({ 
                type: 'success', 
                text1: t.backupImported || 'Backup importado!',
                text2: `${importedCount} itens restaurados`
              });
              
            } catch (error) {
              console.error('Import error:', error);
              Toast.show({ type: 'error', text1: t.importError || 'Erro ao importar', text2: error.message });
            } finally {
              setIsImporting(false);
            }
          }
        }
      ]
    );
  };

  // Open device backup settings
  const handleOpenBackupSettings = () => {
    if (Platform.OS === 'ios') {
      // iOS - open Settings app (will open general settings, user navigates to iCloud)
      Linking.openURL('app-settings:');
    } else {
      // Android - open backup settings
      Linking.openSettings();
    }
  };

  const getCurrentLanguage = () => { 
    const lang = languages.find(l => l.code === language); 
    return lang ? `${lang.flag} ${lang.nativeName || lang.name}` : 'English'; 
  };

  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.tabSettings || 'Definições'}</Text>
        <View style={styles.headerSpacer} />
      </View>
      <ScrollView style={styles.container}>
        {/* Premium Card */}
        <View style={[styles.premiumCard, premiumStatus?.isPremiumActivated && styles.premiumCardActive, premiumStatus?.isTrialActive && !premiumStatus?.isPremiumActivated && styles.premiumCardTrial, !premiumStatus?.hasPremium && styles.premiumCardExpired]}>
          <View style={styles.premiumIcon}>
            <Ionicons name={premiumStatus?.isPremiumActivated ? 'trophy' : premiumStatus?.isTrialActive ? 'sparkles' : 'lock-closed'} size={32} color={premiumStatus?.isPremiumActivated ? '#FFD700' : premiumStatus?.isTrialActive ? '#007AFF' : '#FF3B30'} />
          </View>
          <View style={styles.premiumContent}>
            <Text style={styles.premiumTitle}>{premiumStatus?.isPremiumActivated ? (t.premiumActive || 'Premium Ativo') : premiumStatus?.isTrialActive ? (t.trialActive || 'Período de Teste') : (t.trialExpired || 'Período Expirado')}</Text>
            <Text style={styles.premiumSubtitle}>{premiumStatus?.isPremiumActivated ? `✅ ${premiumStatus.activatedCode}` : premiumStatus?.isTrialActive ? `${premiumStatus.trialDaysRemaining} ${t.trialDaysLeft || 'dias restantes'}` : (t.subscribeToUnlock || 'Subscreva para desbloquear')}</Text>
          </View>
        </View>

        {/* Subscribe Button - Show when trial expired */}
        {!premiumStatus?.hasPremium && (
          <TouchableOpacity 
            style={styles.subscribeButton} 
            onPress={() => {
              const storeUrl = Platform.OS === 'ios' ? APP_STORE_URL : PLAY_STORE_URL;
              Linking.openURL(storeUrl);
            }}
          >
            <Ionicons name="card-outline" size={24} color="#FFFFFF" />
            <Text style={styles.subscribeButtonText}>{t.subscribePremium || 'Subscrever Premium'}</Text>
          </TouchableOpacity>
        )}

        {!premiumStatus?.isPremiumActivated && (
          <TouchableOpacity style={styles.activateButton} onPress={() => setShowActivationModal(true)}>
            <Ionicons name="ticket" size={24} color="#FFFFFF" />
            <Text style={styles.activateButtonText}>{t.enterActivationCode || 'Inserir código de ativação'}</Text>
          </TouchableOpacity>
        )}

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.notifications || 'Notifications'}</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="calendar-outline" size={24} color="#007AFF" />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>{t.weeklySummary || 'Weekly Summary'}</Text>
                <Text style={styles.settingDescription}>{t.weeklySummaryInfo || 'Receive a reminder to review your saved content'}</Text>
              </View>
            </View>
            <Switch value={summaryEnabled} onValueChange={handleSummaryToggle} trackColor={{ false: '#3A3A3C', true: '#34C759' }} thumbColor="#FFFFFF" />
          </View>
          {summaryEnabled && (
            <>
              <TouchableOpacity style={styles.settingItem} onPress={() => setShowDayModal(true)}>
                <View style={styles.settingLeft}>
                  <View style={styles.iconPlaceholder} />
                  <Text style={styles.settingLabel}>{t.dayOfWeek || 'Day'}</Text>
                </View>
                <View style={styles.settingRight}>
                  <Text style={styles.settingValue}>{getDayName(summaryDay, language)}</Text>
                  <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.settingItem} onPress={() => setShowTimeModal(true)}>
                <View style={styles.settingLeft}>
                  <View style={styles.iconPlaceholder} />
                  <Text style={styles.settingLabel}>{t.time || 'Time'}</Text>
                </View>
                <View style={styles.settingRight}>
                  <Text style={styles.settingValue}>{formatTimeForLocale(summaryHour, summaryMinute)}</Text>
                  <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
                </View>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Native System Backup Card - Platform specific */}
        <View style={styles.cloudBackupCard}>
          <View style={styles.cloudBackupHeader}>
            <View style={styles.cloudBackupIconContainer}>
              <Ionicons name={backupInfo.icon} size={28} color="#FFFFFF" />
            </View>
            <View style={styles.cloudBackupTitleContainer}>
              <Text style={styles.cloudBackupTitle}>
                {Platform.OS === 'ios' 
                  ? (t.iCloudBackup || 'iCloud Backup') 
                  : (t.googleBackup || 'Google Backup')}
              </Text>
              <Text style={styles.cloudBackupSubtitle}>{t.systemBackupSubtitle || 'Backup automático do sistema'}</Text>
            </View>
          </View>
          <Text style={styles.cloudBackupDescription}>
            {Platform.OS === 'ios'
              ? (t.iCloudBackupDescription || 'Os dados da app são automaticamente incluídos no backup do iCloud. Ao reinstalar a app ou trocar de iPhone, os seus dados serão restaurados.')
              : (t.googleBackupDescription || 'Os dados da app são automaticamente incluídos no backup do Google. Ao reinstalar a app ou trocar de telemóvel, os seus dados serão restaurados.')}
          </Text>
          <View style={styles.cloudBackupTipContainer}>
            <Ionicons name="information-circle" size={16} color="#FFD60A" />
            <Text style={styles.cloudBackupTip}>
              {Platform.OS === 'ios'
                ? (t.iCloudBackupTip || 'Certifique-se que o backup do iCloud está ativado em Definições > [Seu Nome] > iCloud > Backup')
                : (t.googleBackupTip || 'Certifique-se que o backup está ativado em Definições > Google > Backup')}
            </Text>
          </View>
          <TouchableOpacity style={styles.openSettingsButton} onPress={handleOpenBackupSettings}>
            <Text style={styles.openSettingsButtonText}>{t.openSettings || 'Abrir Definições'}</Text>
            <Ionicons name="open-outline" size={18} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {/* Manual Backup Section (Additional) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.manualBackup || 'Backup Manual'}</Text>
          <TouchableOpacity 
            style={styles.settingItem} 
            onPress={handleExportBackup}
            disabled={isExporting}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="download-outline" size={24} color="#34C759" />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>{t.exportBackup || 'Exportar Backup'}</Text>
                <Text style={styles.settingDescription}>{t.exportBackupInfo || 'Guardar dados num ficheiro JSON'}</Text>
              </View>
            </View>
            {isExporting ? (
              <Text style={styles.settingValue}>...</Text>
            ) : (
              <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomWidth: 0 }]} 
            onPress={handleImportBackup}
            disabled={isImporting}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="push-outline" size={24} color="#007AFF" />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>{t.importBackup || 'Importar Backup'}</Text>
                <Text style={styles.settingDescription}>{t.importBackupInfo || 'Restaurar de um ficheiro'}</Text>
              </View>
            </View>
            {isImporting ? (
              <Text style={styles.settingValue}>...</Text>
            ) : (
              <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
            )}
          </TouchableOpacity>
        </View>

        {/* General Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.general || 'Geral'}</Text>
          <TouchableOpacity style={styles.settingItem} onPress={() => setShowLanguageModal(true)}>
            <View style={styles.settingLeft}>
              <Ionicons name="globe-outline" size={24} color="#007AFF" />
              <Text style={styles.settingLabel}>{t.language || 'Language'}</Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={styles.settingValue}>{getCurrentLanguage()}</Text>
              <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
            </View>
          </TouchableOpacity>
          <View style={[styles.settingItem, { borderBottomWidth: 0 }]}>
            <View style={styles.settingLeft}>
              <Ionicons name="information-circle-outline" size={24} color="#8E8E93" />
              <Text style={styles.settingLabel}>{t.version || 'Version'}</Text>
            </View>
            <Text style={styles.settingValue}>1.0.0</Text>
          </View>
        </View>

        {/* Legal Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <TouchableOpacity style={styles.settingItem} onPress={() => Linking.openURL(TERMS_URL)}>
            <View style={styles.settingLeft}>
              <Ionicons name="document-text-outline" size={24} color="#8E8E93" />
              <Text style={styles.settingLabel}>{t.termsOfService || 'Terms of Service'}</Text>
            </View>
            <Ionicons name="open-outline" size={20} color="#8E8E93" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.settingItem, { borderBottomWidth: 0 }]} onPress={() => Linking.openURL(PRIVACY_URL)}>
            <View style={styles.settingLeft}>
              <Ionicons name="shield-checkmark-outline" size={24} color="#8E8E93" />
              <Text style={styles.settingLabel}>{t.privacyPolicy || 'Privacy Policy'}</Text>
            </View>
            <Ionicons name="open-outline" size={20} color="#8E8E93" />
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />

        {/* Language Modal */}
        <Modal visible={showLanguageModal} animationType="slide" transparent={true} onRequestClose={() => setShowLanguageModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t.language || 'Language'}</Text>
                <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                  <Ionicons name="close" size={28} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              <ScrollView>
                {languages.map((lang) => (
                  <TouchableOpacity key={lang.code} style={[styles.languageOption, language === lang.code && styles.languageOptionActive]} onPress={() => handleLanguageChange(lang.code)}>
                    <Text style={styles.languageFlag}>{lang.flag}</Text>
                    <Text style={styles.languageName}>{lang.nativeName || lang.name}</Text>
                    {language === lang.code && <Ionicons name="checkmark" size={24} color="#007AFF" />}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Day Modal */}
        <Modal visible={showDayModal} animationType="slide" transparent={true} onRequestClose={() => setShowDayModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t.selectDay || 'Select day'}</Text>
                <TouchableOpacity onPress={() => setShowDayModal(false)}>
                  <Ionicons name="close" size={28} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.dayList}>
                {DAYS_OF_WEEK.map((day) => (
                  <TouchableOpacity key={day.value} style={[styles.dayOption, summaryDay === day.value && styles.dayOptionActive]} onPress={() => handleDayChange(day.value)}>
                    <Text style={styles.dayName}>{day[language] || day.en}</Text>
                    {summaryDay === day.value && <Ionicons name="checkmark" size={24} color="#007AFF" />}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Time Picker - Native DateTimePicker */}
        {showTimeModal && (
          <Modal visible={showTimeModal} animationType="slide" transparent={true} onRequestClose={() => setShowTimeModal(false)}>
            <View style={styles.modalOverlay}>
              <View style={styles.timePickerModalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{t.selectTime || 'Selecionar hora'}</Text>
                  <TouchableOpacity onPress={() => setShowTimeModal(false)}>
                    <Ionicons name="close" size={28} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
                <View style={styles.timePickerContainer}>
                  <DateTimePicker
                    value={getTimeAsDate()}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleTimeChange}
                    textColor="#FFFFFF"
                    themeVariant="dark"
                  />
                </View>
                {Platform.OS === 'ios' && (
                  <TouchableOpacity style={styles.timePickerDoneButton} onPress={() => setShowTimeModal(false)}>
                    <Text style={styles.timePickerDoneText}>{t.done || 'Concluído'}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </Modal>
        )}

        {/* Activation Modal */}
        <Modal visible={showActivationModal} animationType="slide" transparent={true} onRequestClose={() => setShowActivationModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t.activationCode || 'Activation Code'}</Text>
                <TouchableOpacity onPress={() => setShowActivationModal(false)}>
                  <Ionicons name="close" size={28} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              <View style={styles.activationIconContainer}>
                <Ionicons name="ticket" size={48} color="#007AFF" />
              </View>
              <TextInput style={styles.activationInput} placeholder="XXXX-XXXX-XXXX" placeholderTextColor="#8E8E93" value={activationCode} onChangeText={(text) => setActivationCode(text.toUpperCase())} autoCapitalize="characters" maxLength={14} />
              <TouchableOpacity style={[styles.activationSubmitButton, (!activationCode.trim() || activating) && styles.activationSubmitButtonDisabled]} onPress={handleActivateCode} disabled={!activationCode.trim() || activating}>
                <Text style={styles.activationSubmitText}>{activating ? '...' : (t.activate || 'Activate')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#000000' },
  container: { flex: 1, backgroundColor: '#000000' },
  headerContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    height: 60, 
    backgroundColor: '#000', 
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#2C2C2E',
  },
  backButton: { padding: 8 },
  headerTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
  headerSpacer: { width: 40 },
  premiumCard: { flexDirection: 'row', alignItems: 'center', margin: 16, padding: 20, borderRadius: 20, borderWidth: 1 },
  premiumCardActive: { backgroundColor: 'rgba(255, 215, 0, 0.1)', borderColor: '#FFD700' },
  premiumCardTrial: { backgroundColor: 'rgba(0, 122, 255, 0.1)', borderColor: '#007AFF' },
  premiumCardExpired: { backgroundColor: 'rgba(255, 59, 48, 0.1)', borderColor: '#FF3B30' },
  premiumIcon: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255, 255, 255, 0.1)', justifyContent: 'center', alignItems: 'center' },
  premiumContent: { flex: 1, marginLeft: 16 },
  premiumTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
  premiumSubtitle: { color: '#8E8E93', fontSize: 14, marginTop: 4 },
  activateButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#2C2C2E', marginHorizontal: 16, marginBottom: 16, padding: 16, borderRadius: 16, gap: 8 },
  activateButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  subscribeButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#34C759', marginHorizontal: 16, marginBottom: 12, padding: 16, borderRadius: 16, gap: 8 },
  subscribeButtonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  section: { backgroundColor: '#1C1C1E', marginHorizontal: 16, marginBottom: 16, borderRadius: 16, overflow: 'hidden' },
  sectionTitle: { color: '#8E8E93', fontSize: 13, fontWeight: '600', textTransform: 'uppercase', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  cloudBackupCard: { backgroundColor: '#1C1C1E', marginHorizontal: 16, marginBottom: 16, borderRadius: 20, padding: 16 },
  cloudBackupHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cloudBackupIconContainer: { width: 48, height: 48, borderRadius: 24, backgroundColor: Platform.OS === 'ios' ? '#007AFF' : '#34A853', justifyContent: 'center', alignItems: 'center' },
  cloudBackupTitleContainer: { flex: 1, marginLeft: 12 },
  cloudBackupTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  cloudBackupSubtitle: { color: '#8E8E93', fontSize: 14, marginTop: 2 },
  cloudBackupDescription: { color: '#CCCCCC', fontSize: 14, lineHeight: 20, marginBottom: 12 },
  cloudBackupTipContainer: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: 'rgba(255, 214, 10, 0.1)', padding: 12, borderRadius: 10, gap: 8, marginBottom: 12 },
  cloudBackupTip: { color: '#FFD60A', fontSize: 12, flex: 1, lineHeight: 16 },
  openSettingsButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 122, 255, 0.15)', paddingVertical: 12, borderRadius: 12, gap: 8 },
  openSettingsButtonText: { color: '#007AFF', fontSize: 16, fontWeight: '600' },
  settingItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#2C2C2E' },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  settingTextContainer: { flex: 1 },
  settingDescription: { color: '#8E8E93', fontSize: 12, marginTop: 2 },
  settingRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  settingLabel: { color: '#FFFFFF', fontSize: 16 },
  settingValue: { color: '#8E8E93', fontSize: 16 },
  iconPlaceholder: { width: 24 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1C1C1E', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 40, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#2C2C2E' },
  modalTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
  languageOption: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#2C2C2E' },
  languageOptionActive: { backgroundColor: 'rgba(0, 122, 255, 0.1)' },
  languageFlag: { fontSize: 28, marginRight: 16 },
  languageName: { flex: 1, color: '#FFFFFF', fontSize: 18 },
  dayList: { maxHeight: 400 },
  dayOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#2C2C2E' },
  dayOptionActive: { backgroundColor: 'rgba(0, 122, 255, 0.1)' },
  dayName: { color: '#FFFFFF', fontSize: 18 },
  activationIconContainer: { alignItems: 'center', paddingVertical: 24 },
  activationInput: { backgroundColor: '#000000', marginHorizontal: 20, padding: 16, borderRadius: 12, color: '#FFFFFF', fontSize: 20, textAlign: 'center', letterSpacing: 2 },
  activationSubmitButton: { backgroundColor: '#007AFF', marginHorizontal: 20, marginTop: 16, padding: 16, borderRadius: 12, alignItems: 'center' },
  activationSubmitButtonDisabled: { opacity: 0.5 },
  activationSubmitText: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
  // Time picker modal styles
  timePickerModalContent: { backgroundColor: '#1C1C1E', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 40 },
  timePickerContainer: { alignItems: 'center', paddingVertical: 20 },
  timePickerDoneButton: { backgroundColor: '#007AFF', marginHorizontal: 20, padding: 16, borderRadius: 12, alignItems: 'center' },
  timePickerDoneText: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
});
