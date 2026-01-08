import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Modal, Switch, Platform, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations, languages, setLanguage as saveLanguage } from '../lib/i18n';
import { activatePremium, getPremiumStatus } from '../lib/premium';

const API_URL = 'https://memor-clip.preview.emergentagent.com';
const TERMS_URL = 'https://memor-clip.preview.emergentagent.com/terms';
const PRIVACY_URL = 'https://memor-clip.preview.emergentagent.com/privacy';

const DAYS_OF_WEEK = [
  { value: 0, en: 'Sunday', pt: 'Domingo', es: 'Domingo', fr: 'Dimanche', de: 'Sonntag', it: 'Domenica' },
  { value: 1, en: 'Monday', pt: 'Segunda-feira', es: 'Lunes', fr: 'Lundi', de: 'Montag', it: 'Lunedì' },
  { value: 2, en: 'Tuesday', pt: 'Terça-feira', es: 'Martes', fr: 'Mardi', de: 'Dienstag', it: 'Martedì' },
  { value: 3, en: 'Wednesday', pt: 'Quarta-feira', es: 'Miércoles', fr: 'Mercredi', de: 'Mittwoch', it: 'Mercoledì' },
  { value: 4, en: 'Thursday', pt: 'Quinta-feira', es: 'Jueves', fr: 'Jeudi', de: 'Donnerstag', it: 'Giovedì' },
  { value: 5, en: 'Friday', pt: 'Sexta-feira', es: 'Viernes', fr: 'Vendredi', de: 'Freitag', it: 'Venerdì' },
  { value: 6, en: 'Saturday', pt: 'Sábado', es: 'Sábado', fr: 'Samedi', de: 'Samstag', it: 'Sabato' },
];

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
  const [activationCode, setActivationCode] = useState('');
  const [activating, setActivating] = useState(false);
  const [summaryEnabled, setSummaryEnabled] = useState(false);
  const [summaryDay, setSummaryDay] = useState(0);
  const [summaryHour, setSummaryHour] = useState(19);
  const [summaryMinute, setSummaryMinute] = useState(0);

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

  const getCurrentLanguage = () => { 
    const lang = languages.find(l => l.code === language); 
    return lang ? `${lang.flag} ${lang.nativeName || lang.name}` : 'English'; 
  };

  return (
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
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.iconPlaceholder} />
                <Text style={styles.settingLabel}>{t.time || 'Time'}</Text>
              </View>
              <View style={styles.settingRight}>
                <Text style={styles.settingValue}>{formatTimeForLocale(summaryHour, summaryMinute)}</Text>
              </View>
            </View>
          </>
        )}
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
  activationIconContainer: { alignItems: 'center', paddingVertical: 24 },
  activationInput: { backgroundColor: '#000000', marginHorizontal: 20, padding: 16, borderRadius: 12, color: '#FFFFFF', fontSize: 20, textAlign: 'center', letterSpacing: 2 },
  activationSubmitButton: { backgroundColor: '#007AFF', marginHorizontal: 20, marginTop: 16, padding: 16, borderRadius: 12, alignItems: 'center' },
  activationSubmitButtonDisabled: { opacity: 0.5 },
  activationSubmitText: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
});
