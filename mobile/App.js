import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast, { BaseToast } from 'react-native-toast-message';

import LinksScreen from './src/screens/LinksScreen';
import NotesScreen from './src/screens/NotesScreen';
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

const toastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: '#34C759', backgroundColor: '#1C1C1E', borderRadius: 12, marginHorizontal: 16 }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{ fontSize: 15, fontWeight: '600', color: '#FFFFFF' }}
      text2Style={{ fontSize: 13, color: '#8E8E93' }}
      renderTrailingIcon={() => (
        <TouchableOpacity style={{ padding: 10, justifyContent: 'center' }} onPress={() => Toast.hide()}>
          <Ionicons name="close" size={20} color="#8E8E93" />
        </TouchableOpacity>
      )}
    />
  ),
  error: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: '#FF3B30', backgroundColor: '#1C1C1E', borderRadius: 12, marginHorizontal: 16 }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{ fontSize: 15, fontWeight: '600', color: '#FFFFFF' }}
      text2Style={{ fontSize: 13, color: '#8E8E93' }}
      renderTrailingIcon={() => (
        <TouchableOpacity style={{ padding: 10, justifyContent: 'center' }} onPress={() => Toast.hide()}>
          <Ionicons name="close" size={20} color="#8E8E93" />
        </TouchableOpacity>
      )}
    />
  ),
  info: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: '#007AFF', backgroundColor: '#1C1C1E', borderRadius: 12, marginHorizontal: 16 }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{ fontSize: 15, fontWeight: '600', color: '#FFFFFF' }}
      text2Style={{ fontSize: 13, color: '#8E8E93' }}
      renderTrailingIcon={() => (
        <TouchableOpacity style={{ padding: 10, justifyContent: 'center' }} onPress={() => Toast.hide()}>
          <Ionicons name="close" size={20} color="#8E8E93" />
        </TouchableOpacity>
      )}
    />
  ),
};

export default function App() {
  const [language, setLanguage] = useState('en');
  const [premiumStatus, setPremiumStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    <NavigationContainer theme={theme}>
      <StatusBar style="light" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'Links') iconName = focused ? 'link' : 'link-outline';
            else if (route.name === 'Notes') iconName = focused ? 'document-text' : 'document-text-outline';
            else if (route.name === 'Clipboard') iconName = focused ? 'clipboard' : 'clipboard-outline';
            else if (route.name === 'Favorites') iconName = focused ? 'heart' : 'heart-outline';
            else if (route.name === 'Settings') iconName = focused ? 'settings' : 'settings-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: '#8E8E93',
          tabBarStyle: { backgroundColor: '#1C1C1E', borderTopColor: '#2C2C2E', paddingTop: 5, height: 85 },
          headerStyle: { backgroundColor: '#000000' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: 'bold' },
        })}
      >
        <Tab.Screen name="Links" options={{ title: t.tabLinks || 'Links', headerTitle: 'Memor.ia' }}>
          {(props) => <LinksScreen {...props} language={language} premiumStatus={premiumStatus} />}
        </Tab.Screen>
        <Tab.Screen name="Notes" options={{ title: t.tabNotes || 'Notes', headerTitle: t.tabNotes || 'Notes' }}>
          {(props) => <NotesScreen {...props} language={language} />}
        </Tab.Screen>
        <Tab.Screen name="Clipboard" options={{ title: t.tabClipboard || 'Clipboard', headerTitle: t.tabClipboard || 'Clipboard' }}>
          {(props) => <ClipboardScreen {...props} language={language} premiumStatus={premiumStatus} />}
        </Tab.Screen>
        <Tab.Screen name="Favorites" options={{ title: t.tabFavorites || 'Favorites', headerTitle: t.tabFavorites || 'Favorites' }}>
          {(props) => <FavoritesScreen {...props} language={language} />}
        </Tab.Screen>
        <Tab.Screen name="Settings" options={{ title: t.tabSettings || 'Settings', headerTitle: t.tabSettings || 'Settings' }}>
          {(props) => <SettingsScreen {...props} language={language} setLanguage={setLanguage} premiumStatus={premiumStatus} setPremiumStatus={setPremiumStatus} />}
        </Tab.Screen>
      </Tab.Navigator>
      <Toast config={toastConfig} visibilityTime={3000} autoHide={true} />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold', marginTop: 20 },
  errorText: { color: '#FF3B30', fontSize: 16 },
});
