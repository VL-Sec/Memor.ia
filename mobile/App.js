import React, { useState, useEffect, useCallback } from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import LinksScreen from './src/screens/LinksScreen';
import NotesScreen from './src/screens/NotesScreen';
import ClipboardScreen from './src/screens/ClipboardScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import SettingsScreen from './src/screens/SettingsScreen';

import { translations, getStoredLanguage } from './src/lib/i18n';
import { getPremiumStatus } from './src/lib/premium';

const Tab = createBottomTabNavigator();

// Extend DarkTheme to ensure all required properties exist
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

// Custom Toast component
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

export default function App() {
  const [language, setLanguage] = useState('en');
  const [premiumStatus, setPremiumStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const init = async () => {
      try {
        const lang = await getStoredLanguage();
        setLanguage(lang);
        const status = await getPremiumStatus();
        setPremiumStatus(status);
      } catch (e) {
        console.error('Init error:', e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // Function to trigger refresh across all screens
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

  return (
    <SafeAreaProvider>
      <AppContent 
        language={language} 
        setLanguage={setLanguage}
        premiumStatus={premiumStatus}
        setPremiumStatus={setPremiumStatus}
        refreshKey={refreshKey}
        triggerRefresh={triggerRefresh}
        t={t}
      />
    </SafeAreaProvider>
  );
}

// Separate component to use safe area insets
function AppContent({ language, setLanguage, premiumStatus, setPremiumStatus, refreshKey, triggerRefresh, t }) {
  const insets = useSafeAreaInsets();
  
  return (
    <NavigationContainer theme={theme}>
      <StatusBar style="light" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused, color }) => {
            let iconName;
            if (route.name === 'Links') iconName = focused ? 'link' : 'link-outline';
            else if (route.name === 'Clipboard') iconName = focused ? 'clipboard' : 'clipboard-outline';
            else if (route.name === 'Notes') iconName = focused ? 'document-text' : 'document-text-outline';
            else if (route.name === 'Favorites') iconName = focused ? 'heart' : 'heart-outline';
            else if (route.name === 'Settings') iconName = focused ? 'settings' : 'settings-outline';
            return <Ionicons name={iconName} size={22} color={color} />;
          },
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: '#8E8E93',
          tabBarStyle: { 
            backgroundColor: '#1C1C1E', 
            borderTopColor: '#2C2C2E',
            borderTopWidth: 0.5,
            height: 55 + Math.max(insets.bottom, 10),
            paddingBottom: Math.max(insets.bottom, 10),
            paddingTop: 6,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '500',
          },
        })}
      >
        {/* Order: Links → Clipboard → Notes → Favorites */}
        <Tab.Screen name="Links" options={{ title: t.tabLinks || 'Links' }}>
          {(props) => <LinksScreen {...props} language={language} premiumStatus={premiumStatus} refreshKey={refreshKey} />}
        </Tab.Screen>
        <Tab.Screen name="Clipboard" options={{ title: t.tabClipboard || 'Área' }}>
          {(props) => <ClipboardScreen {...props} language={language} premiumStatus={premiumStatus} refreshKey={refreshKey} triggerRefresh={triggerRefresh} />}
        </Tab.Screen>
        <Tab.Screen name="Notes" options={{ title: t.tabNotes || 'Notas' }}>
          {(props) => <NotesScreen {...props} language={language} refreshKey={refreshKey} triggerRefresh={triggerRefresh} />}
        </Tab.Screen>
        <Tab.Screen name="Favorites" options={{ title: t.tabFavorites || 'Favoritos' }}>
          {(props) => <FavoritesScreen {...props} language={language} refreshKey={refreshKey} />}
        </Tab.Screen>
        {/* Settings - Hidden from tab bar, accessed via header icon */}
        <Tab.Screen 
          name="Settings" 
          options={{ 
            tabBarButton: () => null,
            tabBarStyle: { display: 'none' },
          }}
        >
          {(props) => <SettingsScreen {...props} language={language} setLanguage={setLanguage} premiumStatus={premiumStatus} setPremiumStatus={setPremiumStatus} />}
        </Tab.Screen>
      </Tab.Navigator>
      <Toast config={toastConfig} visibilityTime={3000} autoHide={true} />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#FFFFFF', fontSize: 24, fontWeight: '700', marginTop: 20 },
  errorText: { color: '#FF3B30', fontSize: 16 },
});
