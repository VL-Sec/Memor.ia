import React, { useState, useEffect, useCallback } from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, Alert, Modal, TextInput, Platform, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import * as Clipboard from 'expo-clipboard';

import LinksScreen from './src/screens/LinksScreen';
import NotesScreen from './src/screens/NotesScreen';
import ClipboardScreen from './src/screens/ClipboardScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import SettingsScreen from './src/screens/SettingsScreen';

import { translations, getStoredLanguage } from './src/lib/i18n';
import { getPremiumStatus, initializePremiumService, recordFirstOpenDate, hasFullAccess, activatePremium } from './src/lib/premium';
import { getUserId } from './src/lib/userManager';
import { isExpoGo } from './src/lib/revenueCat';

// Create navigators (only once)
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Extend DarkTheme
const theme = {
  ...DarkTheme,
  dark: true,
  colors: {
    ...DarkTheme.colors,
    primary: '#007AFF',
    background: '#000000',
    card: '#1C1C1E',
    text: '#FFFFFF',
    border: '#2C2C2E',
    notification: '#007AFF',
  },
};

 

// ============================================
// CUSTOM TOAST
// ============================================
const CustomToast = ({ text1, text2, type, hide }) => {
  const borderColor = type === 'success' ? '#34C759' : type === 'error' ? '#FF3B30' : '#007AFF';
  return (
    <View style={[toastStyles.container, { borderLeftColor: borderColor }]}>
      <View style={toastStyles.content}>
        {text1 && <Text style={toastStyles.text1}>{text1}</Text>}
        {text2 && <Text style={toastStyles.text2}>{text2}</Text>}
      </View>
      <TouchableOpacity style={toastStyles.closeBtn} onPress={hide}>
        <Ionicons name="close" size={20} color="#8E8E93" />
      </TouchableOpacity>
    </View>
  );
};

const toastConfig = {
  success: (props) => <CustomToast {...props} type="success" />,
  error: (props) => <CustomToast {...props} type="error" />,
  info: (props) => <CustomToast {...props} type="info" />,
};

const toastStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    borderLeftWidth: 4,
    marginHorizontal: 16,
    paddingVertical: 12,
    paddingHorizontal: 15,
    minHeight: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  content: {
    flex: 1,
  },
  text1: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  text2: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  closeBtn: {
    padding: 5,
    marginLeft: 10,
  },
});

// ============================================
// TAB NAVIGATOR - Only 4 tabs (DEFAULT STYLE - NO CUSTOM)
// ============================================
function TabNavigator({ language, userId, premiumStatus, refreshKey, triggerRefresh, t, insets }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          switch (route.name) {
            case 'Links':
              iconName = focused ? 'link' : 'link-outline';
              break;
            case 'Clipboard':
              iconName = focused ? 'clipboard' : 'clipboard-outline';
              break;
            case 'Notes':
              iconName = focused ? 'document-text' : 'document-text-outline';
              break;
            case 'Favorites':
              iconName = focused ? 'heart' : 'heart-outline';
              break;
            default:
              iconName = 'help-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        // STYLE: Distribute tabs evenly
        tabBarStyle: { 
          backgroundColor: '#1C1C1E', 
          borderTopColor: '#2C2C2E',
        },
        tabBarItemStyle: {
          flex: 1,
        },
      })}
    >
      <Tab.Screen name="Links" options={{ title: t.tabLinks || 'Links' }}>
        {(props) => (
          <LinksScreen 
            {...props} 
            language={language} 
            userId={userId} 
            premiumStatus={premiumStatus} 
            refreshKey={refreshKey} 
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Clipboard" options={{ title: t.tabClipboard || 'Clipboard' }}>
        {(props) => (
          <ClipboardScreen 
            {...props} 
            language={language} 
            userId={userId} 
            premiumStatus={premiumStatus} 
            refreshKey={refreshKey} 
            triggerRefresh={triggerRefresh} 
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Notes" options={{ title: t.tabNotes || 'Notes' }}>
        {(props) => (
          <NotesScreen 
            {...props} 
            language={language} 
            userId={userId} 
            refreshKey={refreshKey} 
            triggerRefresh={triggerRefresh} 
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Favorites" options={{ title: t.tabFavorites || 'Favorites' }}>
        {(props) => (
          <FavoritesScreen 
            {...props} 
            language={language} 
            userId={userId} 
            refreshKey={refreshKey} 
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

// ============================================
// MAIN APP CONTENT
// ============================================
function AppContent({ language, setLanguage, premiumStatus, setPremiumStatus, refreshKey, triggerRefresh, userId, t }) {
  const insets = useSafeAreaInsets();
  
  return (
    <NavigationContainer theme={theme}>
      <StatusBar style="light" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs">
          {(props) => (
            <TabNavigator 
              {...props} 
              language={language} 
              userId={userId} 
              premiumStatus={premiumStatus} 
              refreshKey={refreshKey} 
              triggerRefresh={triggerRefresh}
              t={t}
              insets={insets}
            />
          )}
        </Stack.Screen>
        <Stack.Screen 
          name="Settings" 
          options={{ 
            presentation: 'card',
            animation: 'slide_from_right',
          }}
        >
          {(props) => (
            <SettingsScreen 
              {...props} 
              language={language} 
              userId={userId} 
              setLanguage={setLanguage} 
              premiumStatus={premiumStatus} 
              setPremiumStatus={setPremiumStatus} 
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
      <Toast config={toastConfig} visibilityTime={1500} autoHide={true} />
    </NavigationContainer>
  );
}

// ============================================
// MAIN APP COMPONENT
// ============================================
export default function App() {
  const [language, setLanguage] = useState('en');
  const [premiumStatus, setPremiumStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [userId, setUserId] = useState(null);
  const [accessBlocked, setAccessBlocked] = useState(false);
  const [showActivationModal, setShowActivationModal] = useState(false);
  const [activationCode, setActivationCode] = useState('');
  const [activating, setActivating] = useState(false);

  // Format code input with dashes
  const formatCodeInput = (text) => {
    const cleaned = text.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
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

  // Handle activation code submission
  const handleActivateCode = async () => {
    if (!activationCode.trim()) return;
    setActivating(true);
    try {
      const code = activationCode.toUpperCase().trim();
      const codePattern = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
      
      if (!codePattern.test(code)) {
        Alert.alert(
          'Formato inválido',
          'Usa o formato XXXX-XXXX-XXXX'
        );
        return;
      }

      // Validate and activate code via Supabase
      const result = await activatePremium(code, userId);
      
      if (result.valid) {
        const newStatus = await getPremiumStatus();
        setPremiumStatus(newStatus);
        setActivationCode('');
        setShowActivationModal(false);
        setAccessBlocked(false);
        Alert.alert(
          'Código ativado!',
          result.influencer ? `Obrigado ${result.influencer}!` : 'Bem-vindo ao Memor.ia Pro!'
        );
      } else {
        Alert.alert(
          'Falha na ativação',
          result.error || 'Código inválido ou já foi usado'
        );
      }
    } catch (error) {
      console.error('Activation error:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao ativar o código');
    } finally { 
      setActivating(false); 
    }
  };

  // Show paywall when trial expires
  const showPaywall = async () => {
    if (isExpoGo) {
      Alert.alert(
        'Trial Expirado',
        'O teu período de teste de 3 dias terminou. Subscreve para continuar a usar a app.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    try {
      const RevenueCatUI = await import('react-native-purchases-ui');
      await RevenueCatUI.default.presentPaywall();
      
      // Check status after paywall closes
      const status = await getPremiumStatus();
      setPremiumStatus(status);
      
      if (status.hasPremium) {
        setAccessBlocked(false);
      }
    } catch (error) {
      console.error('Paywall error:', error);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const uid = await getUserId();
        setUserId(uid);
        console.log('User ID initialized:', uid);
        
        // Record first open date for trial
        await recordFirstOpenDate();
        
        // Initialize RevenueCat with user ID
        await initializePremiumService(uid);
        
        const lang = await getStoredLanguage();
        setLanguage(lang);
        const status = await getPremiumStatus();
        setPremiumStatus(status);
        
        // Check if access should be blocked
        const access = await hasFullAccess();
        if (!access.hasAccess) {
          setAccessBlocked(true);
        }
      } catch (e) {
        console.error('Init error:', e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // Check access periodically and when premium status changes
  useEffect(() => {
    const checkAccess = async () => {
      const access = await hasFullAccess();
      if (!access.hasAccess && !accessBlocked) {
        setAccessBlocked(true);
        showPaywall();
      } else if (access.hasAccess && accessBlocked) {
        setAccessBlocked(false);
      }
    };
    
    if (premiumStatus) {
      checkAccess();
    }
  }, [premiumStatus]);

  const triggerRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  const t = translations[language] || translations.en;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Memor.ia</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  // Trial expired screen
  if (accessBlocked) {
    const t = translations[language] || translations.en;
    return (
      <SafeAreaProvider>
        <View style={styles.blockedContainer}>
          <Ionicons name="time-outline" size={80} color="#007AFF" />
          <Text style={styles.blockedTitle}>{t.trialExpired || 'Trial Expirado'}</Text>
          <Text style={styles.blockedSubtitle}>
            {t.trialExpiredMessage || 'O teu período de teste de 3 dias terminou. Subscreve para continuar a usar todas as funcionalidades.'}
          </Text>
          <TouchableOpacity style={styles.blockedButton} onPress={showPaywall}>
            <Ionicons name="star" size={20} color="#FFFFFF" />
            <Text style={styles.blockedButtonText}>{t.subscribeToPro || 'Assinar Memor.ia Pro'}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.blockedSecondaryButton} 
            onPress={() => {
              // Show activation code modal instead of unlocking
              setShowActivationModal(true);
            }}
          >
            <Text style={styles.blockedSecondaryText}>{t.haveActivationCode || 'Tenho código de ativação'}</Text>
          </TouchableOpacity>
        </View>

        {/* Activation Code Modal */}
        <Modal 
          visible={showActivationModal} 
          animationType="slide" 
          transparent={true} 
          onRequestClose={() => setShowActivationModal(false)}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView 
              style={styles.modalOverlay} 
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
              <View style={styles.modalContent}>
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
        <Toast config={toastConfig} visibilityTime={1500} autoHide={true} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <AppContent 
        language={language} 
        setLanguage={setLanguage}
        premiumStatus={premiumStatus}
        setPremiumStatus={setPremiumStatus}
        refreshKey={refreshKey}
        triggerRefresh={triggerRefresh}
        userId={userId}
        t={t}
      />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { 
    flex: 1, 
    backgroundColor: '#000', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  loadingText: { 
    color: '#FFFFFF', 
    fontSize: 24, 
    fontWeight: '700', 
    marginTop: 20 
  },
  errorText: { 
    color: '#FF3B30', 
    fontSize: 16 
  },
  blockedContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  blockedTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    marginTop: 24,
    textAlign: 'center',
  },
  blockedSubtitle: {
    color: '#8E8E93',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 32,
    lineHeight: 24,
  },
  blockedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#34C759',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    gap: 8,
    width: '100%',
    maxWidth: 300,
  },
  blockedButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  blockedSecondaryButton: {
    marginTop: 16,
    padding: 12,
  },
  blockedSecondaryText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
  },
  activationIconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  activationDescription: {
    color: '#8E8E93',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  activationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  activationInput: {
    flex: 1,
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    fontSize: 20,
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 2,
  },
  pasteButton: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activationSubmitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  activationSubmitButtonDisabled: {
    opacity: 0.5,
  },
  activationSubmitText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});
