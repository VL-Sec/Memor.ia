import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Modal,
  Switch,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import DateTimePicker from '@react-native-community/datetimepicker';
import { translations, languages, setLanguage as saveLanguage } from '../lib/i18n';
import { activatePremium, getPremiumStatus } from '../lib/premium';
import {
  getWeeklySummarySettings,
  saveWeeklySummarySettings,
  requestNotificationPermissions,
  DAYS_OF_WEEK,
  getDayName,
  formatTimeForLocale,
} from '../lib/notifications';

const API_URL = 'https://memor-clip.preview.emergentagent.com';

export default function SettingsScreen({ 
  language, 
  setLanguage, 
  premiumStatus, 
  setPremiumStatus 
}) {
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showActivationModal, setShowActivationModal] = useState(false);
  const [showDayModal, setShowDayModal] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [activationCode, setActivationCode] = useState('');
  const [activating, setActivating] = useState(false);
  
  // Weekly Summary State
  const [summaryEnabled, setSummaryEnabled] = useState(false);
  const [summaryDay, setSummaryDay] = useState(0);
  const [summaryHour, setSummaryHour] = useState(19);
  const [summaryMinute, setSummaryMinute] = useState(0);

  const t = translations[language] || translations.en;

  // Load weekly summary settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      const settings = await getWeeklySummarySettings();
      setSummaryEnabled(settings.enabled);
      setSummaryDay(settings.dayOfWeek);
      setSummaryHour(settings.hour);
      setSummaryMinute(settings.minute);
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
        body: JSON.stringify({ code: activationCode.toUpperCase().trim() }),
      });

      const result = await response.json();

      if (result.success) {
        await activatePremium(result.code);
        const newStatus = await getPremiumStatus();
        setPremiumStatus(newStatus);
        setActivationCode('');
        setShowActivationModal(false);
        Toast.show({ type: 'success', text1: t.codeActivated });
      } else {
        Toast.show({
          type: 'error',
          text1: result.error === 'used' ? t.codeAlreadyUsed : t.invalidCode,
        });
      }
    } catch (error) {
      console.error('Activation error:', error);
      Toast.show({ type: 'error', text1: t.error });
    } finally {
      setActivating(false);
    }
  };

  const handleSummaryToggle = async (value) => {
    if (value) {
      // Check for notification permissions first
      const hasPermission = await requestNotificationPermissions();
      if (!hasPermission) {
        Toast.show({
          type: 'error',
          text1: t.permissionRequired,
          text2: t.permissionMessage,
        });
        return;
      }
    }
    
    setSummaryEnabled(value);
    const success = await saveWeeklySummarySettings({
      enabled: value,
      dayOfWeek: summaryDay,
      hour: summaryHour,
      minute: summaryMinute,
    });
    
    if (success) {
      Toast.show({
        type: 'success',
        text1: value ? t.weeklySummaryEnabled : t.weeklySummaryDisabled,
      });
    }
  };

  const handleDayChange = async (dayValue) => {
    setSummaryDay(dayValue);
    setShowDayModal(false);
    
    if (summaryEnabled) {
      await saveWeeklySummarySettings({
        enabled: summaryEnabled,
        dayOfWeek: dayValue,
        hour: summaryHour,
        minute: summaryMinute,
      });
    }
  };

  const handleTimeChange = async (event, selectedDate) => {
    // On Android, the picker closes automatically after selection
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    
    if (event.type === 'dismissed') {
      setShowTimePicker(false);
      return;
    }
    
    if (selectedDate) {
      const newHour = selectedDate.getHours();
      const newMinute = selectedDate.getMinutes();
      
      setSummaryHour(newHour);
      setSummaryMinute(newMinute);
      
      // On iOS, we need a "Done" button to close
      if (Platform.OS === 'ios') {
        // Don't close yet, let user press Done
      }
      
      if (summaryEnabled) {
        await saveWeeklySummarySettings({
          enabled: summaryEnabled,
          dayOfWeek: summaryDay,
          hour: newHour,
          minute: newMinute,
        });
      }
    }
  };

  const getCurrentLanguage = () => {
    const lang = languages.find(l => l.code === language);
    return lang ? `${lang.flag} ${lang.name}` : 'English';
  };

  const getTimePickerDate = () => {
    const date = new Date();
    date.setHours(summaryHour, summaryMinute, 0, 0);
    return date;
  };

  return (
    <ScrollView style={styles.container}>
      {/* Premium Status */}
      <View style={[
        styles.premiumCard,
        premiumStatus?.isPremiumActivated && styles.premiumCardActive,
        premiumStatus?.isTrialActive && !premiumStatus?.isPremiumActivated && styles.premiumCardTrial,
        !premiumStatus?.hasPremium && styles.premiumCardExpired,
      ]}>
        <View style={styles.premiumIcon}>
          <Ionicons
            name={premiumStatus?.isPremiumActivated ? 'crown' : 'sparkles'}
            size={32}
            color={premiumStatus?.isPremiumActivated ? '#FFD700' : '#007AFF'}
          />
        </View>
        <View style={styles.premiumContent}>
          <Text style={styles.premiumTitle}>
            {premiumStatus?.isPremiumActivated
              ? t.premiumActive
              : premiumStatus?.isTrialActive
                ? t.trialActive
                : t.trialExpired}
          </Text>
          <Text style={styles.premiumSubtitle}>
            {premiumStatus?.isPremiumActivated
              ? `✅ ${premiumStatus.activatedCode}`
              : premiumStatus?.isTrialActive
                ? `${premiumStatus.trialDaysRemaining} ${t.trialDaysLeft}`
                : ''}
          </Text>
        </View>
      </View>

      {/* Activation Code Button */}
      {!premiumStatus?.isPremiumActivated && (
        <TouchableOpacity
          style={styles.activateButton}
          onPress={() => setShowActivationModal(true)}
        >
          <Ionicons name="ticket" size={24} color="#FFFFFF" />
          <Text style={styles.activateButtonText}>{t.enterActivationCode}</Text>
        </TouchableOpacity>
      )}

      {/* Notifications Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t.notifications}</Text>

        {/* Weekly Summary Toggle */}
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name="calendar-outline" size={24} color="#007AFF" />
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>{t.weeklySummary}</Text>
              <Text style={styles.settingDescription}>{t.weeklySummaryInfo}</Text>
            </View>
          </View>
          <Switch
            value={summaryEnabled}
            onValueChange={handleSummaryToggle}
            trackColor={{ false: '#3A3A3C', true: '#34C759' }}
            thumbColor={'#FFFFFF'}
            ios_backgroundColor="#3A3A3C"
          />
        </View>

        {/* Day and Time selectors - only show when enabled */}
        {summaryEnabled && (
          <>
            {/* Day Selector */}
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => setShowDayModal(true)}
            >
              <View style={styles.settingLeft}>
                <View style={styles.iconPlaceholder} />
                <Text style={styles.settingLabel}>{t.dayOfWeek}</Text>
              </View>
              <View style={styles.settingRight}>
                <Text style={styles.settingValue}>
                  {getDayName(summaryDay, language)}
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
              </View>
            </TouchableOpacity>

            {/* Time Selector */}
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => setShowTimePicker(true)}
            >
              <View style={styles.settingLeft}>
                <View style={styles.iconPlaceholder} />
                <Text style={styles.settingLabel}>{t.time}</Text>
              </View>
              <View style={styles.settingRight}>
                <Text style={styles.settingValue}>
                  {formatTimeForLocale(summaryHour, summaryMinute)}
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
              </View>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t.settings}</Text>

        {/* Language */}
        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => setShowLanguageModal(true)}
        >
          <View style={styles.settingLeft}>
            <Ionicons name="globe-outline" size={24} color="#007AFF" />
            <Text style={styles.settingLabel}>{t.language}</Text>
          </View>
          <View style={styles.settingRight}>
            <Text style={styles.settingValue}>{getCurrentLanguage()}</Text>
            <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
          </View>
        </TouchableOpacity>

        {/* Backup Info */}
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name="cloud-outline" size={24} color="#34C759" />
            <Text style={styles.settingLabel}>{t.backup}</Text>
          </View>
          <View style={styles.settingRight}>
            <Ionicons name="checkmark-circle" size={20} color="#34C759" />
          </View>
        </View>
        <Text style={styles.settingHint}>{t.backupInfo}</Text>
      </View>

      {/* App Info */}
      <View style={styles.section}>
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name="information-circle-outline" size={24} color="#8E8E93" />
            <Text style={styles.settingLabel}>{t.version}</Text>
          </View>
          <Text style={styles.settingValue}>1.0.0</Text>
        </View>
      </View>

      {/* Language Modal */}
      <Modal
        visible={showLanguageModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t.language}</Text>
              <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                <Ionicons name="close" size={28} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.languageOption,
                  language === lang.code && styles.languageOptionActive,
                ]}
                onPress={() => handleLanguageChange(lang.code)}
              >
                <Text style={styles.languageFlag}>{lang.flag}</Text>
                <Text style={styles.languageName}>{lang.name}</Text>
                {language === lang.code && (
                  <Ionicons name="checkmark" size={24} color="#007AFF" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Day Selection Modal */}
      <Modal
        visible={showDayModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDayModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t.selectDay}</Text>
              <TouchableOpacity onPress={() => setShowDayModal(false)}>
                <Ionicons name="close" size={28} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.dayList}>
              {DAYS_OF_WEEK.map((day) => (
                <TouchableOpacity
                  key={day.value}
                  style={[
                    styles.dayOption,
                    summaryDay === day.value && styles.dayOptionActive,
                  ]}
                  onPress={() => handleDayChange(day.value)}
                >
                  <Text style={styles.dayName}>{day[language] || day.en}</Text>
                  {summaryDay === day.value && (
                    <Ionicons name="checkmark" size={24} color="#007AFF" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Time Picker - Native behavior respects system locale */}
      {showTimePicker && (
        <Modal
          visible={showTimePicker}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowTimePicker(false)}
        >
          <View style={styles.timePickerOverlay}>
            <View style={styles.timePickerContainer}>
              {Platform.OS === 'ios' && (
                <View style={styles.timePickerHeader}>
                  <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                    <Text style={styles.timePickerCancel}>{t.cancel}</Text>
                  </TouchableOpacity>
                  <Text style={styles.timePickerTitle}>{t.selectTime}</Text>
                  <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                    <Text style={styles.timePickerDone}>OK</Text>
                  </TouchableOpacity>
                </View>
              )}
              <DateTimePicker
                value={getTimePickerDate()}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleTimeChange}
                textColor="#FFFFFF"
                themeVariant="dark"
                style={Platform.OS === 'ios' ? styles.iosTimePicker : undefined}
              />
            </View>
          </View>
        </Modal>
      )}

      {/* Activation Code Modal */}
      <Modal
        visible={showActivationModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowActivationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t.activationCode}</Text>
              <TouchableOpacity onPress={() => setShowActivationModal(false)}>
                <Ionicons name="close" size={28} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <View style={styles.activationIconContainer}>
              <Ionicons name="ticket" size={48} color="#007AFF" />
            </View>
            <TextInput
              style={styles.activationInput}
              placeholder="XXXX-XXXX-XXXX"
              placeholderTextColor="#8E8E93"
              value={activationCode}
              onChangeText={(text) => setActivationCode(text.toUpperCase())}
              autoCapitalize="characters"
              maxLength={14}
            />
            <TouchableOpacity
              style={[
                styles.activationSubmitButton,
                (!activationCode.trim() || activating) && styles.activationSubmitButtonDisabled,
              ]}
              onPress={handleActivateCode}
              disabled={!activationCode.trim() || activating}
            >
              <Text style={styles.activationSubmitText}>
                {activating ? '...' : t.activate}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  premiumCard: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
  },
  premiumCardActive: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderColor: '#FFD700',
  },
  premiumCardTrial: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderColor: '#007AFF',
  },
  premiumCardExpired: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderColor: '#FF3B30',
  },
  premiumIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumContent: {
    flex: 1,
    marginLeft: 16,
  },
  premiumTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  premiumSubtitle: {
    color: '#8E8E93',
    fontSize: 14,
    marginTop: 4,
  },
  activateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    gap: 8,
  },
  activateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#1C1C1E',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  sectionTitle: {
    color: '#8E8E93',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingDescription: {
    color: '#8E8E93',
    fontSize: 12,
    marginTop: 2,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingLabel: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  settingValue: {
    color: '#8E8E93',
    fontSize: 16,
  },
  settingHint: {
    color: '#8E8E93',
    fontSize: 12,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  iconPlaceholder: {
    width: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  languageOptionActive: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  languageFlag: {
    fontSize: 28,
    marginRight: 16,
  },
  languageName: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 18,
  },
  dayList: {
    maxHeight: 400,
  },
  dayOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  dayOptionActive: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  dayName: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  timePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  timePickerContainer: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
  },
  timePickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  timePickerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  timePickerCancel: {
    color: '#8E8E93',
    fontSize: 16,
  },
  timePickerDone: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  iosTimePicker: {
    height: 200,
  },
  activationIconContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  activationInput: {
    backgroundColor: '#000000',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    textAlign: 'center',
    letterSpacing: 2,
  },
  activationSubmitButton: {
    backgroundColor: '#007AFF',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  activationSubmitButtonDisabled: {
    opacity: 0.5,
  },
  activationSubmitText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
