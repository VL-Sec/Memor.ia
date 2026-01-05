import React, { useState, useEffect } from 'react';
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
            if (route.name === 'Links') {
              iconName = focused ? 'link' : 'link-outline';
            } else if (route.name === 'Clipboard') {
              iconName = focused ? 'clipboard' : 'clipboard-outline';
            } else if (route.name === 'Favorites') {
              iconName = focused ? 'heart' : 'heart-outline';
            } else if (route.name === 'Settings') {
              iconName = focused ? 'settings' : 'settings-outline';
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: '#8E8E93',
          tabBarStyle: {
            backgroundColor: '#1C1C1E',
            borderTopColor: '#2C2C2E',
            paddingTop: 5,
            height: 85,
          },
          headerStyle: {
            backgroundColor: '#000000',
            borderBottomColor: '#2C2C2E',
            borderBottomWidth: 1,
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        })}
      >
        <Tab.Screen 
          name="Links" 
          options={{ 
            title: t.tabLinks,
            headerTitle: 'Memor.ia'
          }}
        >
          {(props) => <LinksScreen {...props} language={language} premiumStatus={premiumStatus} />}
        </Tab.Screen>
        
        <Tab.Screen 
          name="Clipboard" 
          options={{ 
            title: t.tabClipboard,
            headerTitle: t.tabClipboard
          }}
        >
          {(props) => <ClipboardScreen {...props} language={language} premiumStatus={premiumStatus} />}
        </Tab.Screen>
        
        <Tab.Screen 
          name="Favorites" 
          options={{ 
            title: t.tabFavorites,
            headerTitle: t.tabFavorites
          }}
        >
          {(props) => <FavoritesScreen {...props} language={language} />}
        </Tab.Screen>
        
        <Tab.Screen 
          name="Settings" 
          options={{ 
            title: t.tabSettings,
            headerTitle: t.tabSettings
          }}
        >
          {(props) => (
            <SettingsScreen 
              {...props} 
              language={language} 
              setLanguage={setLanguage}
              premiumStatus={premiumStatus}
              setPremiumStatus={setPremiumStatus}
            />
          )}
        </Tab.Screen>
      </Tab.Navigator>
      <Toast />
    </NavigationContainer>
  );
}
