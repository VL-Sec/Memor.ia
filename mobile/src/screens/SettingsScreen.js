import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Modal, Switch, Platform, Linking, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations, languages, setLanguage as saveLanguage } from '../lib/i18n';
import { activatePremium, getPremiumStatus } from '../lib/premium';

const TERMS_URL = 'https://www.notion.so/Terms-of-Service-Memor-ia-2e3f9fe156fc80fc8c5bf9f9f9f008e1';
const PRIVACY_URL = 'https://www.notion.so/Privacy-Policy-Memor-ia-2e3f9fe156fc80edb1d2e6d0bd5f91e7';

// Store URLs - Update these with your actual store URLs when published
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.memoria.app';
const APP_STORE_URL = 'https://apps.apple.com/app/memoria/id000000000';

export default function SettingsScreen({ language, setLanguage, premiumStatus, setPremiumStatus, userId }) {
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showActivationModal, setShowActivationModal] = useState(false);
  const [activationCode, setActivationCode] = useState('');
  const [activating, setActivating] = useState(false);
  const [cloudBackupEnabled, setCloudBackupEnabled] = useState(false);

  const insets = useSafeAreaInsets();
  const t = translations[language] || translations.en;

  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Load cloud backup preference
        const backupEnabled = await AsyncStorage.getItem('memoria-cloud-backup-enabled');
        if (backupEnabled !== null) {
          setCloudBackupEnabled(backupEnabled === 'true');
        }
      } catch (e) {
        console.error('Error loading settings:', e);
      }
    };
    loadSettings();
  }, []);

  // Handle cloud backup toggle with confirmation
  const handleCloudBackupToggle = async (value) => {
    if (value) {
      Alert.alert(
        Platform.OS === 'ios' ? (t.iCloudBackup || 'iCloud Backup') : (t.googleBackup || 'Google Backup'),
        Platform.OS === 'ios' 
          ? (t.iCloudBackupConfirm || 'Aceitas que os teus dados sejam guardados no iCloud? Isto permite restaurar os dados ao reinstalar a app ou trocar de dispositivo.')
          : (t.googleBackupConfirm || 'Aceitas que os teus dados sejam guardados no Google Backup? Isto permite restaurar os dados ao reinstalar a app ou trocar de dispositivo.'),
        [
          { text: t.cancel || 'Cancelar', style: 'cancel' },
          {
            text: t.accept || 'Aceitar',
            onPress: async () => {
              setCloudBackupEnabled(true);
              await AsyncStorage.setItem('memoria-cloud-backup-enabled', 'true');
              Toast.show({ type: 'success', text1: t.cloudBackupActivated || 'Backup cloud ativado' });
            },
          },
        ]
      );
    } else {
      setCloudBackupEnabled(false);
      await AsyncStorage.setItem('memoria-cloud-backup-enabled', 'false');
      Toast.show({ type: 'info', text1: t.cloudBackupDeactivated || 'Backup cloud desativado' });
    }
  };

  const handleLanguageChange = async (langCode) => { 
    setLanguage(langCode); 
    await saveLanguage(langCode); 
    setShowLanguageModal(false); 
  };

  const handleActivateCode = async () => {
    if (!activationCode.trim()) return;
    setActivating(true);
    try {
      const code = activationCode.toUpperCase().trim();
      const codePattern = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
      
      if (codePattern.test(code)) {
        await activatePremium(code);
        const newStatus = await getPremiumStatus();
        setPremiumStatus(newStatus);
        setActivationCode('');
        setShowActivationModal(false);
        Toast.show({ type: 'success', text1: t.codeActivated || 'Code activated!' });
      } else {
        Toast.show({ type: 'error', text1: t.invalidCode || 'Invalid code format. Use XXXX-XXXX-XXXX format.' });
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: t.error || 'Error' });
    } finally { 
      setActivating(false); 
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

        {/* Cloud Backup Section - Simple Switch */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.backup || 'Cópia de Segurança'}</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name={Platform.OS === 'ios' ? 'logo-apple' : 'logo-google'} size={24} color="#007AFF" />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>
                  {Platform.OS === 'ios' ? (t.iCloudBackup || 'iCloud Backup') : (t.googleBackup || 'Google Backup')}
                </Text>
                <Text style={styles.settingDescription}>
                  {t.cloudBackupInfo || 'Guarda automaticamente os teus dados na cloud'}
                </Text>
              </View>
            </View>
            <Switch 
              value={cloudBackupEnabled} 
              onValueChange={handleCloudBackupToggle} 
              trackColor={{ false: '#3A3A3C', true: '#34C759' }} 
              thumbColor="#FFFFFF" 
            />
          </View>
          {cloudBackupEnabled && (
            <View style={styles.cloudBackupActiveInfo}>
              <Ionicons name="checkmark-circle" size={16} color="#34C759" />
              <Text style={styles.cloudBackupActiveText}>
                {Platform.OS === 'ios' 
                  ? (t.iCloudBackupActive || 'Os teus dados estão a ser guardados no iCloud')
                  : (t.googleBackupActive || 'Os teus dados estão a ser guardados no Google Backup')}
              </Text>
            </View>
          )}
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

        {/* Legal Links - Discrete */}
        <View style={styles.legalSection}>
          <TouchableOpacity onPress={() => Linking.openURL(TERMS_URL)}>
            <Text style={styles.legalLink}>{t.termsOfService || 'Terms of Service'}</Text>
          </TouchableOpacity>
          <Text style={styles.legalSeparator}>•</Text>
          <TouchableOpacity onPress={() => Linking.openURL(PRIVACY_URL)}>
            <Text style={styles.legalLink}>{t.privacyPolicy || 'Privacy Policy'}</Text>
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
  settingItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#2C2C2E' },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  settingTextContainer: { flex: 1 },
  settingDescription: { color: '#8E8E93', fontSize: 12, marginTop: 2 },
  settingRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  settingLabel: { color: '#FFFFFF', fontSize: 16 },
  settingValue: { color: '#8E8E93', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1C1C1E', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 40, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#2C2C2E' },
  modalTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
  languageOption: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#2C2C2E' },
  languageOptionActive: { backgroundColor: 'rgba(0, 122, 255, 0.1)' },
  languageFlag: { fontSize: 28, marginRight: 16 },
  languageName: { flex: 1, color: '#FFFFFF', fontSize: 18 },
  activationIconContainer: { alignItems: 'center', paddingVertical: 24 },
  activationInput: { backgroundColor: '#000000', marginHorizontal: 20, padding: 16, borderRadius: 12, color: '#FFFFFF', fontSize: 20, textAlign: 'center', letterSpacing: 2 },
  activationSubmitButton: { backgroundColor: '#007AFF', marginHorizontal: 20, marginTop: 16, padding: 16, borderRadius: 12, alignItems: 'center' },
  activationSubmitButtonDisabled: { opacity: 0.5 },
  activationSubmitText: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
  cloudBackupActiveInfo: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: 'rgba(52, 199, 89, 0.1)', marginHorizontal: 16, marginBottom: 8, borderRadius: 8 },
  cloudBackupActiveText: { color: '#34C759', fontSize: 13, flex: 1 },
  legalSection: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 16, gap: 8 },
  legalLink: { color: '#6E6E73', fontSize: 12 },
  legalSeparator: { color: '#6E6E73', fontSize: 12 },
});
