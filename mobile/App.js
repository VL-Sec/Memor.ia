import React, { useState, useEffect, useCallback } from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import * as Notifications from 'expo-notifications';

import LinksScreen from './src/screens/LinksScreen';
import NotesScreen from './src/screens/NotesScreen';
import ClipboardScreen from './src/screens/ClipboardScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import SettingsScreen from './src/screens/SettingsScreen';

import { translations, getStoredLanguage } from './src/lib/i18n';
import { getPremiumStatus } from './src/lib/premium';
import { getUserId } from './src/lib/userManager';

// Configure notifications (only once)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Create navigators (only once)
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Get screen width for tab calculation
const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
// CUSTOM TAB BAR - Perfect 4-way distribution
// ============================================
function CustomTabBar({ state, descriptors, navigation, insets }) {
  // Calculate exact width for each tab (4 tabs = 25% each)
  const tabWidth = SCREEN_WIDTH / state.routes.length;
  
  return (
    <View style={[
      tabBarStyles.container, 
      { 
        paddingBottom: Math.max(insets.bottom, 10),
      }
    ]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.title || route.name;
        const isFocused = state.index === index;

        let iconName;
        switch (route.name) {
          case 'Links':
            iconName = isFocused ? 'link' : 'link-outline';
            break;
          case 'Clipboard':
            iconName = isFocused ? 'clipboard' : 'clipboard-outline';
            break;
          case 'Notes':
            iconName = isFocused ? 'document-text' : 'document-text-outline';
            break;
          case 'Favorites':
            iconName = isFocused ? 'heart' : 'heart-outline';
            break;
          default:
            iconName = 'help-outline';
        }

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={[tabBarStyles.tab, { width: tabWidth }]}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={iconName} 
              size={24} 
              color={isFocused ? '#007AFF' : '#8E8E93'} 
            />
            <Text 
              style={[
                tabBarStyles.label,
                { color: isFocused ? '#007AFF' : '#8E8E93' }
              ]}
              numberOfLines={1}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const tabBarStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#1C1C1E',
    borderTopWidth: 0.5,
    borderTopColor: '#2C2C2E',
    paddingTop: 8,
    width: SCREEN_WIDTH,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
});

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
        // MINIMAL STYLE - just colors, no layout changes
        tabBarStyle: { 
          backgroundColor: '#1C1C1E', 
          borderTopColor: '#2C2C2E',
        },
      })}
    >
      <Tab.Screen name="Links" options={{ title: 'Links' }}>
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
      <Tab.Screen name="Clipboard" options={{ title: 'Clipboard' }}>
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
      <Tab.Screen name="Notes" options={{ title: 'Notas' }}>
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
      <Tab.Screen name="Favorites" options={{ title: 'Favoritos' }}>
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
      <Toast config={toastConfig} visibilityTime={3000} autoHide={true} />
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

  useEffect(() => {
    const init = async () => {
      try {
        const uid = await getUserId();
        setUserId(uid);
        console.log('User ID initialized:', uid);
        
        const lang = await getStoredLanguage();
        setLanguage(lang);
        const status = await getPremiumStatus();
        setPremiumStatus(status);
        
        const { status: notifStatus } = await Notifications.requestPermissionsAsync();
        if (notifStatus !== 'granted') {
          console.log('Notification permissions not granted');
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
});
