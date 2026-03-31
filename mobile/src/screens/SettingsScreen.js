import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Modal, Switch, Platform, Linking, Alert, Image, useWindowDimensions, ActivityIndicator, KeyboardAvoidingView, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import { translations, languages, setLanguage as saveLanguage } from '../lib/i18n';
import { activatePremium, getPremiumStatus } from '../lib/premium';
import { restorePurchases, isExpoGo } from '../lib/revenueCat';

const TERMS_URL = 'https://candy-snowshoe-1a9.notion.site/Terms-of-Service-Memor-ia-2ed8acbb1c8c805a8615da477c589dc4';
const PRIVACY_URL = 'https://candy-snowshoe-1a9.notion.site/Privacy-Policy-Memor-ia-2ed8acbb1c8c807ca2d5caa43af9c4dc';

// Store URLs - Update these with your actual store URLs when published
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.getmemoria.app';
const APP_STORE_URL = 'https://apps.apple.com/app/memoria/id000000000';

export default function SettingsScreen({ language, setLanguage, premiumStatus, setPremiumStatus, userId }) {
  const { width, height } = useWindowDimensions();
  const isTablet = width >= 768;
  const isLandscape = width > height;
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showActivationModal, setShowActivationModal] = useState(false);
  const [activationCode, setActivationCode] = useState('');
  const [activating, setActivating] = useState(false);
  const [cloudBackupEnabled, setCloudBackupEnabled] = useState(false);
  const [processingSubscription, setProcessingSubscription] = useState(false);
  const [restoringPurchases, setRestoringPurchases] = useState(false);
  const [versionTapCount, setVersionTapCount] = useState(0);
  const [showDebugMode, setShowDebugMode] = useState(false);

  const insets = useSafeAreaInsets();
  const t = translations[language] || translations.en;

  // Check if user has premium (by subscription or code)
  const isPremium = premiumStatus?.hasPremium || false;

  // Handle version tap for debug mode
  const handleVersionTap = () => {
    const newCount = versionTapCount + 1;
    setVersionTapCount(newCount);
    
    if (newCount >= 5) {
      setShowDebugMode(true);
      setVersionTapCount(0);
      Toast.show({
        type: 'info',
        text1: 'Modo Debug ativado',
        text2: 'Opções de desenvolvimento disponíveis'
      });
    }
  };

  // Simulate trial expired (debug only)
  const handleSimulateTrialExpired = async () => {
    Alert.alert(
      'Simular Trial Expirado',
      'Isto vai simular que o trial de 3 dias expirou. A app vai bloquear no próximo arranque.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Simular',
          style: 'destructive',
          onPress: async () => {
            try {
              // Set first open date to 5 days ago
              const fiveDaysAgo = new Date();
              fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
              await AsyncStorage.setItem('memoria_first_open_date', fiveDaysAgo.toISOString());
              // Also clear premium status
              await AsyncStorage.removeItem('memoria_premium');
              await AsyncStorage.removeItem('memoria_activated_code');
              setShowDebugMode(false);
              Toast.show({
                type: 'success',
                text1: 'Trial expirado simulado',
                text2: 'Fecha e abre a app para ver o bloqueio'
              });
            } catch (error) {
              console.error('Simulate error:', error);
              Toast.show({
                type: 'error',
                text1: 'Erro ao simular'
              });
            }
          }
        }
      ]
    );
  };

  // Reset trial (debug only) - starts fresh
  const handleResetTrial = async () => {
    Alert.alert(
      'Reset Trial',
      'Isto vai resetar o trial para começar de novo (3 dias).',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Reset',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('memoria_first_open_date');
              await AsyncStorage.removeItem('memoria_premium');
              await AsyncStorage.removeItem('memoria_activated_code');
              const newStatus = await getPremiumStatus();
              setPremiumStatus(newStatus);
              setShowDebugMode(false);
              Toast.show({
                type: 'success',
                text1: 'Trial resetado',
                text2: 'Fecha e abre a app para começar novo trial'
              });
            } catch (error) {
              console.error('Reset error:', error);
            }
          }
        }
      ]
    );
  };

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

  // Handle subscription purchase (opens native paywall)
  const handleSubscribe = async () => {
    // Check if running in Expo Go
    if (isExpoGo) {
      Alert.alert(
        'Expo Go',
        'As subscrições não funcionam no Expo Go. Para testar pagamentos, precisas de um Development Build.',
        [{ text: 'OK' }]
      );
      return;
    }

    setProcessingSubscription(true);
    try {
      // Dynamically import RevenueCatUI only when needed
      const RevenueCatUI = await import('react-native-purchases-ui');
      const paywallResult = await RevenueCatUI.default.presentPaywall();
      
      // Refresh premium status after paywall closes
      const newStatus = await getPremiumStatus();
      setPremiumStatus(newStatus);
      
      if (newStatus.hasPremium) {
        Toast.show({ 
          type: 'success', 
          text1: t.subscriptionSuccess || 'Subscrição ativada!',
          text2: t.welcomeToPro || 'Bem-vindo ao Memor.ia Pro!'
        });
      }
    } catch (error) {
      if (!error.userCancelled) {
        console.error('Paywall error:', error);
        Toast.show({ 
          type: 'error', 
          text1: t.subscriptionError || 'Erro na subscrição',
          text2: t.tryAgainLater || 'Tenta novamente mais tarde'
        });
      }
    } finally {
      setProcessingSubscription(false);
    }
  };

  // Handle restore purchases
  const handleRestorePurchases = async () => {
    // Check if running in Expo Go
    if (isExpoGo) {
      Alert.alert(
        'Expo Go',
        'O restauro de compras não funciona no Expo Go. Para testar, precisas de um Development Build.',
        [{ text: 'OK' }]
      );
      return;
    }

    setRestoringPurchases(true);
    try {
      const result = await restorePurchases();
      
      // Refresh premium status
      const newStatus = await getPremiumStatus();
      setPremiumStatus(newStatus);
      
      if (result.isSubscribed || newStatus.hasPremium) {
        Toast.show({ 
          type: 'success', 
          text1: t.purchasesRestored || 'Compras restauradas!',
          text2: t.subscriptionActive || 'A tua subscrição está ativa'
        });
      } else {
        Toast.show({ 
          type: 'info', 
          text1: t.noSubscriptionFound || 'Sem subscrição encontrada',
          text2: t.noPreviousPurchases || 'Não encontrámos compras anteriores'
        });
      }
    } catch (error) {
      console.error('Restore error:', error);
      Toast.show({ 
        type: 'error', 
        text1: t.restoreError || 'Erro ao restaurar',
        text2: t.tryAgainLater || 'Tenta novamente mais tarde'
      });
    } finally {
      setRestoringPurchases(false);
    }
  };

  // Handle activation code submission
  const handleActivateCode = async () => {
    if (!activationCode.trim()) return;
    setActivating(true);
    try {
      const code = activationCode.toUpperCase().trim();
      const codePattern = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
      
      if (!codePattern.test(code)) {
        Toast.show({ 
          type: 'error', 
          text1: t.invalidCodeFormat || 'Formato inválido',
          text2: t.useCodeFormat || 'Usa o formato XXXX-XXXX-XXXX'
        });
        return;
      }

      // Validate and activate code via Supabase
      const result = await activatePremium(code, userId);
      
      if (result.valid) {
        const newStatus = await getPremiumStatus();
        setPremiumStatus(newStatus);
        setActivationCode('');
        setShowActivationModal(false);
        Toast.show({ 
          type: 'success', 
          text1: t.codeActivated || 'Código ativado!',
          text2: result.influencer ? `Obrigado ${result.influencer}!` : t.welcomeToPro || 'Bem-vindo ao Memor.ia Pro!'
        });
      } else {
        Toast.show({ 
          type: 'error', 
          text1: t.activationFailed || 'Falha na ativação',
          text2: result.error || t.invalidCode || 'Código inválido'
        });
      }
    } catch (error) {
      console.error('Activation error:', error);
      Toast.show({ type: 'error', text1: t.error || 'Erro' });
    } finally { 
      setActivating(false); 
    }
  };

  const getCurrentLanguage = () => { 
    const lang = languages.find(l => l.code === language); 
    return lang ? `${lang.flag} ${lang.nativeName || lang.name}` : 'English'; 
  };

  const navigation = useNavigation();

  // Format code input with dashes
  const formatCodeInput = (text) => {
    // Remove all non-alphanumeric characters
    const cleaned = text.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    // Add dashes every 4 characters
    const parts = cleaned.match(/.{1,4}/g) || [];
    return parts.slice(0, 3).join('-');
  };

  // Paste code from clipboard
  const handlePasteCode = async () => {
    try {
      const clipboardText = await Clipboard.getStringAsync();
      if (clipboardText) {
        const formattedCode = formatCodeInput(clipboardText);
        setActivationCode(formattedCode);
      }
    } catch (error) {
      console.error('Paste error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.tabSettings || 'Definições'}</Text>
        <View style={styles.headerSpacer} />
      </View>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
        {/* Logo Card */}
        <View style={styles.logoCard}>
          <Image source={require('../../assets/logo-banner.png')} style={styles.logoImage} resizeMode="contain" />
        </View>

        {/* Premium Status Card - Shows when user is Premium */}
        {isPremium && (
          <View style={[styles.premiumCard, styles.premiumCardActive]}>
            <View style={styles.premiumIcon}>
              <Ionicons name="star" size={32} color="#FFD700" />
            </View>
            <View style={styles.premiumContent}>
              <Text style={styles.premiumTitle}>Memor.ia Pro</Text>
              <Text style={styles.premiumSubtitle}>
                {premiumStatus?.isPremiumByCode 
                  ? (t.activatedByCode || 'Ativado por código')
                  : (t.subscriptionActive || 'Subscrição ativa')}
              </Text>
            </View>
          </View>
        )}

        {/* Subscribe Button - Only shows when NOT Premium */}
        {!isPremium && (
          <TouchableOpacity 
            style={styles.subscribeButton} 
            onPress={handleSubscribe}
            disabled={processingSubscription}
          >
            {processingSubscription ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="star" size={20} color="#FFFFFF" />
                <Text style={styles.subscribeButtonText}>
                  {t.subscribeToPro || 'Assinar Memor.ia Pro'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* Activation Code Button - ALWAYS visible */}
        <TouchableOpacity 
          style={styles.activateButton} 
          onPress={() => setShowActivationModal(true)}
        >
          <Ionicons name="ticket-outline" size={20} color="#FFFFFF" />
          <Text style={styles.activateButtonText}>
            {t.haveActivationCode || 'Tenho código de ativação'}
          </Text>
        </TouchableOpacity>

        {/* Restore Purchases Button - Only shows when NOT Premium */}
        {!isPremium && (
          <TouchableOpacity 
            style={styles.restoreButton} 
            onPress={handleRestorePurchases}
            disabled={restoringPurchases}
          >
            {restoringPurchases ? (
              <ActivityIndicator size="small" color="#007AFF" />
            ) : (
              <Text style={styles.restoreButtonText}>
                {t.restorePurchases || 'Restaurar compras'}
              </Text>
            )}
          </TouchableOpacity>
        )}

        {/* Cloud Backup Section - Info only */}
        <View style={styles.section}>
          <View style={[styles.settingItem, { borderBottomWidth: 0 }]}>
            <View style={styles.settingLeft}>
              <Ionicons name={Platform.OS === 'ios' ? 'cloud-done' : 'cloud-done'} size={24} color="#34C759" />
              <Text style={styles.settingLabel}>
                {t.autoCloudBackup || 'Backup automático na cloud ativo'}
              </Text>
            </View>
            <Ionicons name="checkmark-circle" size={24} color="#34C759" />
          </View>
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
          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomWidth: 0 }]} 
            onPress={handleVersionTap}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="information-circle-outline" size={24} color="#8E8E93" />
              <Text style={styles.settingLabel}>{t.version || 'Version'}</Text>
            </View>
            <Text style={styles.settingValue}>1.0.7</Text>
          </TouchableOpacity>
        </View>

        {/* Debug Section - Only visible after 5 taps on version */}
        {showDebugMode && (
          <View style={[styles.section, { borderColor: '#FF3B30', borderWidth: 1 }]}>
            <Text style={[styles.sectionTitle, { color: '#FF3B30' }]}>🛠 Debug Mode</Text>
            <TouchableOpacity 
              style={styles.settingItem} 
              onPress={handleSimulateTrialExpired}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="time-outline" size={24} color="#FF3B30" />
                <Text style={[styles.settingLabel, { color: '#FF3B30' }]}>Simular Trial Expirado</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#FF3B30" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.settingItem} 
              onPress={handleResetTrial}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="refresh-circle-outline" size={24} color="#34C759" />
                <Text style={[styles.settingLabel, { color: '#34C759' }]}>Reset Trial (Novo 3 dias)</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#34C759" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.settingItem, { borderBottomWidth: 0 }]} 
              onPress={() => setShowDebugMode(false)}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="close-circle-outline" size={24} color="#8E8E93" />
                <Text style={styles.settingLabel}>Fechar Debug Mode</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}


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
            <View style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}>
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

        {/* Activation Code Modal */}
        <Modal visible={showActivationModal} animationType="slide" transparent={true} onRequestClose={() => setShowActivationModal(false)}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView 
              style={styles.modalOverlay} 
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
              <View style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{t.activationCode || 'Código de Ativação'}</Text>
                  <TouchableOpacity onPress={() => { Keyboard.dismiss(); setShowActivationModal(false); }}>
                    <Ionicons name="close" size={28} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
                <View style={styles.activationIconContainer}>
                  <Ionicons name="ticket" size={48} color="#007AFF" />
                </View>
                <Text style={styles.activationDescription}>
                  {t.enterActivationCode || 'Introduz o código de ativação fornecido pelo influenciador ou parceiro.'}
                </Text>
                <View style={styles.activationInputContainer}>
                  <TextInput 
                    style={styles.activationInput} 
                    placeholder="XXXX-XXXX-XXXX" 
                    placeholderTextColor="#8E8E93" 
                    value={activationCode} 
                    onChangeText={(text) => setActivationCode(formatCodeInput(text))} 
                    autoCapitalize="characters" 
                    maxLength={14}
                    autoCorrect={false}
                  />
                  <TouchableOpacity style={styles.pasteButton} onPress={handlePasteCode}>
                    <Ionicons name="clipboard-outline" size={22} color="#007AFF" />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity 
                  style={[styles.activationSubmitButton, (!activationCode.trim() || activating) && styles.activationSubmitButtonDisabled]} 
                  onPress={handleActivateCode} 
                  disabled={!activationCode.trim() || activating}
                >
                  {activating ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.activationSubmitText}>{t.activate || 'Ativar'}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#000000' },
  container: { flex: 1, backgroundColor: '#000000' },
  tabletContainer: { maxWidth: 600, alignSelf: 'center', width: '100%' },
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
  premiumCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    margin: 16, 
    padding: 20, 
    borderRadius: 20, 
    borderWidth: 1 
  },
  premiumCardActive: { 
    backgroundColor: 'rgba(255, 215, 0, 0.1)', 
    borderColor: '#FFD700' 
  },
  premiumIcon: { 
    width: 60, 
    height: 60, 
    borderRadius: 30, 
    backgroundColor: 'rgba(255, 215, 0, 0.2)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  premiumContent: { flex: 1, marginLeft: 16 },
  premiumTitle: { color: '#FFD700', fontSize: 20, fontWeight: '700' },
  premiumSubtitle: { color: '#8E8E93', fontSize: 14, marginTop: 4 },
  logoCard: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    margin: 16, 
    padding: 16, 
    borderRadius: 20, 
    backgroundColor: '#000000', 
    borderWidth: 1, 
    borderColor: '#007AFF' 
  },
  logoImage: { width: '100%', height: 120, maxWidth: 400 },
  subscribeButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: '#34C759', 
    marginHorizontal: 16, 
    marginBottom: 12, 
    padding: 16, 
    borderRadius: 16, 
    gap: 8 
  },
  subscribeButtonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  activateButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: '#2C2C2E', 
    marginHorizontal: 16, 
    marginBottom: 12, 
    padding: 16, 
    borderRadius: 16, 
    gap: 8,
    borderWidth: 1,
    borderColor: '#007AFF'
  },
  activateButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  restoreButton: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginHorizontal: 16, 
    marginBottom: 16, 
    padding: 12 
  },
  restoreButtonText: { color: '#007AFF', fontSize: 15, fontWeight: '500' },
  section: { 
    backgroundColor: '#1C1C1E', 
    marginHorizontal: 16, 
    marginBottom: 16, 
    borderRadius: 16, 
    overflow: 'hidden' 
  },
  sectionTitle: { 
    color: '#8E8E93', 
    fontSize: 13, 
    fontWeight: '600', 
    textTransform: 'uppercase', 
    paddingHorizontal: 16, 
    paddingTop: 16, 
    paddingBottom: 8 
  },
  settingItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 16, 
    paddingVertical: 14, 
    borderBottomWidth: 1, 
    borderBottomColor: '#2C2C2E' 
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  settingTextContainer: { flex: 1 },
  settingDescription: { color: '#8E8E93', fontSize: 12, marginTop: 2 },
  settingRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  settingLabel: { color: '#FFFFFF', fontSize: 16 },
  settingValue: { color: '#8E8E93', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.8)', justifyContent: 'flex-end' },
  modalContent: { 
    backgroundColor: '#1C1C1E', 
    borderTopLeftRadius: 24, 
    borderTopRightRadius: 24, 
    paddingBottom: 40, 
    maxHeight: '80%' 
  },
  modalHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 20, 
    borderBottomWidth: 1, 
    borderBottomColor: '#2C2C2E' 
  },
  modalTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
  languageOption: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: '#2C2C2E' 
  },
  languageOptionActive: { backgroundColor: 'rgba(0, 122, 255, 0.1)' },
  languageFlag: { fontSize: 28, marginRight: 16 },
  languageName: { flex: 1, color: '#FFFFFF', fontSize: 18 },
  activationIconContainer: { alignItems: 'center', paddingVertical: 24 },
  activationDescription: { 
    color: '#8E8E93', 
    fontSize: 14, 
    textAlign: 'center', 
    paddingHorizontal: 20, 
    marginBottom: 16 
  },
  activationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    gap: 8,
  },
  activationInput: { 
    flex: 1,
    backgroundColor: '#000000', 
    padding: 16, 
    borderRadius: 12, 
    color: '#FFFFFF', 
    fontSize: 20, 
    textAlign: 'center', 
    letterSpacing: 2 
  },
  pasteButton: {
    backgroundColor: '#000000',
    borderRadius: 12,
    padding: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activationSubmitButton: { 
    backgroundColor: '#007AFF', 
    marginHorizontal: 20, 
    marginTop: 16, 
    padding: 16, 
    borderRadius: 12, 
    alignItems: 'center' 
  },
  activationSubmitButtonDisabled: { opacity: 0.5 },
  activationSubmitText: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
  cloudBackupActiveInfo: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8, 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    backgroundColor: 'rgba(52, 199, 89, 0.1)', 
    marginHorizontal: 16, 
    marginBottom: 8, 
    borderRadius: 8 
  },
  cloudBackupActiveText: { color: '#34C759', fontSize: 13, flex: 1 },
  legalSection: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingVertical: 16, 
    gap: 8 
  },
  legalLink: { color: '#6E6E73', fontSize: 12 },
  legalSeparator: { color: '#6E6E73', fontSize: 12 },
});
