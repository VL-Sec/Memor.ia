import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Modal, Switch, Platform, Linking, Alert, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { translations, languages, setLanguage as saveLanguage } from '../lib/i18n';
import { activatePremium, getPremiumStatus } from '../lib/premium';
import { supabase } from '../lib/supabase';
import CustomHeader from '../components/CustomHeader';

const API_URL = 'https://linknote-hub.preview.emergentagent.com';
const TERMS_URL = 'https://linknote-hub.preview.emergentagent.com/terms';
const PRIVACY_URL = 'https://linknote-hub.preview.emergentagent.com/privacy';

// Check if we're in Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

const DEMO_USER = 'demo_user';
const LOCAL_NOTES_KEY = 'memoria-notes';

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

export default function SettingsScreen({ language, setLanguage, premiumStatus, setPremiumStatus }) {
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

  const t = translations[language] || translations.en;

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
      } catch (error) {
        console.log('Notification permission error:', error);
        Alert.alert(
          t.notifications || 'Notifications',
          t.notificationError || 'Could not enable notifications. Please try again later.',
          [{ text: 'OK', style: 'default' }]
        );
        return;
      }
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
      } catch (e) {
        console.error('Error saving settings:', e);
      }
    }
  };

  const handleTimeChange = async (hour) => {
    setSummaryHour(hour);
    setSummaryMinute(0);
    setShowTimeModal(false);
    if (summaryEnabled) {
      try {
        await AsyncStorage.setItem('memoria-weekly-summary', JSON.stringify({ 
          enabled: summaryEnabled, 
          dayOfWeek: summaryDay, 
          hour: hour, 
          minute: 0 
        }));
        Toast.show({ type: 'success', text1: t.timeSaved || 'Hora guardada' });
      } catch (e) {
        console.error('Error saving settings:', e);
      }
    }
  };

  // Export backup to JSON file
  const handleExportBackup = async () => {
    setIsExporting(true);
    try {
      // Collect all data
      const localNotes = await AsyncStorage.getItem(LOCAL_NOTES_KEY);
      const settings = await AsyncStorage.getItem('memoria-weekly-summary');
      const premiumData = await AsyncStorage.getItem('memoria-premium');
      
      // Fetch Supabase data
      const { data: linksData } = await supabase.from('links').select('*').eq('userId', DEMO_USER);
      const { data: foldersData } = await supabase.from('folders').select('*').eq('userId', DEMO_USER);
      
      const backupData = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        data: {
          localNotes: localNotes ? JSON.parse(localNotes) : [],
          links: linksData || [],
          folders: foldersData || [],
          settings: settings ? JSON.parse(settings) : {},
          premium: premiumData ? JSON.parse(premiumData) : {}
        }
      };
      
      const fileName = `memoria-backup-${new Date().toISOString().split('T')[0]}.json`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(filePath, JSON.stringify(backupData, null, 2));
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath, {
          mimeType: 'application/json',
          dialogTitle: t.exportBackup || 'Export Backup'
        });
        Toast.show({ type: 'success', text1: t.backupExported || 'Backup exportado com sucesso!' });
      } else {
        Toast.show({ type: 'error', text1: t.sharingNotAvailable || 'Partilha não disponível' });
      }
    } catch (error) {
      console.error('Export error:', error);
      Toast.show({ type: 'error', text1: t.exportError || 'Erro ao exportar backup' });
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
                type: 'application/json',
                copyToCacheDirectory: true
              });
              
              if (result.canceled) {
                setIsImporting(false);
                return;
              }
              
              const fileUri = result.assets[0].uri;
              const fileContent = await FileSystem.readAsStringAsync(fileUri);
              const backupData = JSON.parse(fileContent);
              
              if (!backupData.version || !backupData.data) {
                Toast.show({ type: 'error', text1: t.invalidBackupFile || 'Ficheiro de backup inválido' });
                setIsImporting(false);
                return;
              }
              
              // Restore local notes
              if (backupData.data.localNotes) {
                await AsyncStorage.setItem(LOCAL_NOTES_KEY, JSON.stringify(backupData.data.localNotes));
              }
              
              // Restore settings
              if (backupData.data.settings) {
                await AsyncStorage.setItem('memoria-weekly-summary', JSON.stringify(backupData.data.settings));
                setSummaryEnabled(backupData.data.settings.enabled || false);
                setSummaryDay(backupData.data.settings.dayOfWeek || 0);
                setSummaryHour(backupData.data.settings.hour || 19);
              }
              
              Toast.show({ type: 'success', text1: t.backupImported || 'Backup importado com sucesso!' });
              
            } catch (error) {
              console.error('Import error:', error);
              Toast.show({ type: 'error', text1: t.importError || 'Erro ao importar backup' });
            } finally {
              setIsImporting(false);
            }
          }
        }
      ]
    );
  };

  const getCurrentLanguage = () => { 
    const lang = languages.find(l => l.code === language); 
    return lang ? `${lang.flag} ${lang.nativeName || lang.name}` : 'English'; 
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <CustomHeader title={t.tabSettings || 'Settings'} />
      <ScrollView style={styles.container}>
        <View style={[styles.premiumCard, premiumStatus?.isPremiumActivated && styles.premiumCardActive, premiumStatus?.isTrialActive && !premiumStatus?.isPremiumActivated && styles.premiumCardTrial, !premiumStatus?.hasPremium && styles.premiumCardExpired]}>
          <View style={styles.premiumIcon}>
            <Ionicons name={premiumStatus?.isPremiumActivated ? 'trophy' : 'sparkles'} size={32} color={premiumStatus?.isPremiumActivated ? '#FFD700' : '#007AFF'} />
          </View>
          <View style={styles.premiumContent}>
            <Text style={styles.premiumTitle}>{premiumStatus?.isPremiumActivated ? (t.premiumActive || 'Premium Active') : premiumStatus?.isTrialActive ? (t.trialActive || 'Trial Active') : (t.trialExpired || 'Trial Expired')}</Text>
            <Text style={styles.premiumSubtitle}>{premiumStatus?.isPremiumActivated ? `✅ ${premiumStatus.activatedCode}` : premiumStatus?.isTrialActive ? `${premiumStatus.trialDaysRemaining} ${t.trialDaysLeft || 'days left'}` : ''}</Text>
          </View>
        </View>

      {!premiumStatus?.isPremiumActivated && (
        <TouchableOpacity style={styles.activateButton} onPress={() => setShowActivationModal(true)}>
          <Ionicons name="ticket" size={24} color="#FFFFFF" />
          <Text style={styles.activateButtonText}>{t.enterActivationCode || 'Enter activation code'}</Text>
        </TouchableOpacity>
      )}

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

      {/* Local Backup Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t.backup || 'Backup'}</Text>
        <TouchableOpacity 
          style={styles.settingItem} 
          onPress={handleExportBackup}
          disabled={isExporting}
        >
          <View style={styles.settingLeft}>
            <Ionicons name="download-outline" size={24} color="#34C759" />
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>{t.exportBackup || 'Exportar Backup'}</Text>
              <Text style={styles.settingDescription}>{t.exportBackupInfo || 'Guardar todos os dados num ficheiro JSON'}</Text>
            </View>
          </View>
          {isExporting ? (
            <Text style={styles.settingValue}>...</Text>
          ) : (
            <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
          )}
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.settingItem} 
          onPress={handleImportBackup}
          disabled={isImporting}
        >
          <View style={styles.settingLeft}>
            <Ionicons name="cloud-upload-outline" size={24} color="#007AFF" />
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>{t.importBackup || 'Importar Backup'}</Text>
              <Text style={styles.settingDescription}>{t.importBackupInfo || 'Restaurar dados de um ficheiro de backup'}</Text>
            </View>
          </View>
          {isImporting ? (
            <Text style={styles.settingValue}>...</Text>
          ) : (
            <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.cloudBackupCard}>
        <View style={styles.cloudBackupHeader}>
          <View style={styles.cloudBackupIconContainer}>
            <Ionicons name="cloud-done" size={28} color="#FFFFFF" />
          </View>
          <View style={styles.cloudBackupTitleContainer}>
            <Text style={styles.cloudBackupTitle}>{t.cloudBackupTitle || 'Automatic Backup'}</Text>
            <Text style={styles.cloudBackupSubtitle}>{t.cloudBackupSubtitle || 'Your data is safe'}</Text>
          </View>
          <View style={styles.cloudBackupBadge}>
            <Ionicons name="checkmark-circle" size={16} color="#34C759" />
            <Text style={styles.cloudBackupBadgeText}>{t.cloudBackupEnabled || 'Enabled'}</Text>
          </View>
        </View>
        <Text style={styles.cloudBackupDescription}>{t.cloudBackupDescription || 'All your links, notes and settings are automatically synced.'}</Text>
        <View style={styles.cloudBackupProviders}>
          <View style={styles.cloudProvider}>
            <Ionicons name={Platform.OS === 'ios' ? 'logo-apple' : 'logo-google'} size={20} color="#8E8E93" />
            <Text style={styles.cloudProviderText}>{Platform.OS === 'ios' ? (t.cloudBackupIOS || 'iCloud Backup') : (t.cloudBackupAndroid || 'Google Backup')}</Text>
          </View>
        </View>
        <View style={styles.cloudBackupTipContainer}>
          <Ionicons name="information-circle" size={16} color="#FFD60A" />
          <Text style={styles.cloudBackupTip}>{t.cloudBackupTip || 'Make sure cloud backup is enabled in your device settings.'}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t.settings || 'Settings'}</Text>
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
      </View>

      <View style={styles.section}>
        <View style={styles.settingItem}>
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
        <TouchableOpacity style={styles.settingItem} onPress={() => Linking.openURL(PRIVACY_URL)}>
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
            {languages.map((lang) => (
              <TouchableOpacity key={lang.code} style={[styles.languageOption, language === lang.code && styles.languageOptionActive]} onPress={() => handleLanguageChange(lang.code)}>
                <Text style={styles.languageFlag}>{lang.flag}</Text>
                <Text style={styles.languageName}>{lang.nativeName || lang.name}</Text>
                {language === lang.code && <Ionicons name="checkmark" size={24} color="#007AFF" />}
              </TouchableOpacity>
            ))}
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

      {/* Time Modal */}
      <Modal visible={showTimeModal} animationType="slide" transparent={true} onRequestClose={() => setShowTimeModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t.selectTime || 'Selecionar hora'}</Text>
              <TouchableOpacity onPress={() => setShowTimeModal(false)}>
                <Ionicons name="close" size={28} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.dayList}>
              {HOURS.map((hour) => (
                <TouchableOpacity key={hour} style={[styles.dayOption, summaryHour === hour && styles.dayOptionActive]} onPress={() => handleTimeChange(hour)}>
                  <Text style={styles.dayName}>{formatTimeForLocale(hour, 0)}</Text>
                  {summaryHour === hour && <Ionicons name="checkmark" size={24} color="#007AFF" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

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
  premiumCard: { flexDirection: 'row', alignItems: 'center', margin: 16, padding: 20, borderRadius: 20, borderWidth: 1 },
  premiumCardActive: { backgroundColor: 'rgba(255, 215, 0, 0.1)', borderColor: '#FFD700' },
  premiumCardTrial: { backgroundColor: 'rgba(0, 122, 255, 0.1)', borderColor: '#007AFF' },
  premiumCardExpired: { backgroundColor: 'rgba(255, 59, 48, 0.1)', borderColor: '#FF3B30' },
  premiumIcon: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255, 255, 255, 0.1)', justifyContent: 'center', alignItems: 'center' },
  premiumContent: { flex: 1, marginLeft: 16 },
  premiumTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
  premiumSubtitle: { color: '#8E8E93', fontSize: 14, marginTop: 4 },
  activateButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#007AFF', marginHorizontal: 16, marginBottom: 16, padding: 16, borderRadius: 16, gap: 8 },
  activateButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  section: { backgroundColor: '#1C1C1E', marginHorizontal: 16, marginBottom: 16, borderRadius: 16, overflow: 'hidden' },
  sectionTitle: { color: '#8E8E93', fontSize: 13, fontWeight: '600', textTransform: 'uppercase', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  cloudBackupCard: { backgroundColor: '#1C1C1E', marginHorizontal: 16, marginBottom: 16, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#34C759' },
  cloudBackupHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cloudBackupIconContainer: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#34C759', justifyContent: 'center', alignItems: 'center' },
  cloudBackupTitleContainer: { flex: 1, marginLeft: 12 },
  cloudBackupTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
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
});
