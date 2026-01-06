@echo off
chcp 65001 >nul
echo ========================================
echo    MEMORIA APP - Setup Automatico
echo ========================================
echo.

REM Criar estrutura de pastas
echo [1/4] Criando estrutura de pastas...
mkdir src 2>nul
mkdir src\screens 2>nul
mkdir src\lib 2>nul
mkdir src\components 2>nul
mkdir assets 2>nul

REM Criar App.js
echo [2/4] Criando ficheiros principais...

(
echo import React, { useState, useEffect } from 'react';
echo import { NavigationContainer } from '@react-navigation/native';
echo import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
echo import { StatusBar } from 'expo-status-bar';
echo import { View, ActivityIndicator } from 'react-native';
echo import { Ionicons } from '@expo/vector-icons';
echo import Toast from 'react-native-toast-message';
echo.
echo import LinksScreen from './src/screens/LinksScreen';
echo import ClipboardScreen from './src/screens/ClipboardScreen';
echo import FavoritesScreen from './src/screens/FavoritesScreen';
echo import SettingsScreen from './src/screens/SettingsScreen';
echo.
echo import { translations, getStoredLanguage } from './src/lib/i18n';
echo import { getPremiumStatus } from './src/lib/premium';
echo.
echo const Tab = createBottomTabNavigator^(^);
echo.
echo const theme = {
echo   dark: true,
echo   colors: {
echo     primary: '#007AFF',
echo     background: '#000000',
echo     card: '#1C1C1E',
echo     text: '#FFFFFF',
echo     border: '#2C2C2E',
echo     notification: '#007AFF',
echo   },
echo };
echo.
echo export default function App^(^) {
echo   const [language, setLanguage] = useState^('en'^);
echo   const [premiumStatus, setPremiumStatus] = useState^(null^);
echo   const [loading, setLoading] = useState^(true^);
echo.
echo   useEffect^(^(^) =^> {
echo     const init = async ^(^) =^> {
echo       const lang = await getStoredLanguage^(^);
echo       setLanguage^(lang^);
echo       const status = await getPremiumStatus^(^);
echo       setPremiumStatus^(status^);
echo       setLoading^(false^);
echo     };
echo     init^(^);
echo   }, []^);
echo.
echo   const t = translations[language] ^|^| translations.en;
echo.
echo   if ^(loading^) {
echo     return ^(
echo       ^<View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}^>
echo         ^<ActivityIndicator size="large" color="#007AFF" /^>
echo       ^</View^>
echo     ^);
echo   }
echo.
echo   return ^(
echo     ^<NavigationContainer theme={theme}^>
echo       ^<StatusBar style="light" /^>
echo       ^<Tab.Navigator
echo         screenOptions={^({ route }^) =^> ^({
echo           tabBarIcon: ^({ focused, color, size }^) =^> {
echo             let iconName;
echo             if ^(route.name === 'Links'^) iconName = focused ? 'link' : 'link-outline';
echo             else if ^(route.name === 'Clipboard'^) iconName = focused ? 'clipboard' : 'clipboard-outline';
echo             else if ^(route.name === 'Favorites'^) iconName = focused ? 'heart' : 'heart-outline';
echo             else if ^(route.name === 'Settings'^) iconName = focused ? 'settings' : 'settings-outline';
echo             return ^<Ionicons name={iconName} size={size} color={color} /^>;
echo           },
echo           tabBarActiveTintColor: '#007AFF',
echo           tabBarInactiveTintColor: '#8E8E93',
echo           tabBarStyle: { backgroundColor: '#1C1C1E', borderTopColor: '#2C2C2E', paddingTop: 5, height: 85 },
echo           headerStyle: { backgroundColor: '#000000', borderBottomColor: '#2C2C2E', borderBottomWidth: 1 },
echo           headerTintColor: '#FFFFFF',
echo           headerTitleStyle: { fontWeight: 'bold' },
echo         }^)}^>
echo         ^<Tab.Screen name="Links" options={{ title: t.tabLinks, headerTitle: 'Memor.ia' }}^>
echo           {^(props^) =^> ^<LinksScreen {...props} language={language} premiumStatus={premiumStatus} /^>}
echo         ^</Tab.Screen^>
echo         ^<Tab.Screen name="Clipboard" options={{ title: t.tabClipboard, headerTitle: t.tabClipboard }}^>
echo           {^(props^) =^> ^<ClipboardScreen {...props} language={language} premiumStatus={premiumStatus} /^>}
echo         ^</Tab.Screen^>
echo         ^<Tab.Screen name="Favorites" options={{ title: t.tabFavorites, headerTitle: t.tabFavorites }}^>
echo           {^(props^) =^> ^<FavoritesScreen {...props} language={language} /^>}
echo         ^</Tab.Screen^>
echo         ^<Tab.Screen name="Settings" options={{ title: t.tabSettings, headerTitle: t.tabSettings }}^>
echo           {^(props^) =^> ^<SettingsScreen {...props} language={language} setLanguage={setLanguage} premiumStatus={premiumStatus} setPremiumStatus={setPremiumStatus} /^>}
echo         ^</Tab.Screen^>
echo       ^</Tab.Navigator^>
echo       ^<Toast /^>
echo     ^</NavigationContainer^>
echo   ^);
echo }
) > App.js

echo App.js criado!
echo.
echo ========================================
echo    PROXIMO PASSO
echo ========================================
echo.
echo Os ficheiros principais foram criados.
echo Agora executa: node setup-files.js
echo.
pause
