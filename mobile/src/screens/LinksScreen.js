import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Image,
  Linking,
  Alert,
  RefreshControl,
  Modal,
  ScrollView,
  Switch,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import { supabase, generateId } from '../lib/supabase';
import { translations } from '../lib/i18n';

const DEMO_USER = 'demo_user';

export default function LinksScreen({ language }) {
  const [links, setLinks] = useState([]);
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editFolderId, setEditFolderId] = useState('');
  
  // Reminder State
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderDate, setReminderDate] = useState(null);
  const [reminderTime, setReminderTime] = useState(null);
  const [reminderLocation, setReminderLocation] = useState('');
  
  // Picker State
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showFolderPicker, setShowFolderPicker] = useState(false);

  const t = translations[language] || translations.en;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch folders
      const { data: foldersData } = await supabase
        .from('folders')
        .select('*')
        .eq('userId', DEMO_USER)
        .eq('folderType', 'link')
        .order('createdAt', { ascending: false });

      // Fetch links
      const { data: linksData } = await supabase
        .from('links')
        .select('*')
        .eq('userId', DEMO_USER)
        .eq('contentType', 'link')
        .order('createdAt', { ascending: false });

      setFolders(foldersData || []);
      setLinks(linksData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAddLink = async () => {
    if (!newUrl.trim()) return;

    let url = newUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    try {
      const defaultFolder = folders.find(f => f.isDefault);
      
      const newLink = {
        id: generateId(),
        userId: DEMO_USER,
        url,
        title: url,
        contentType: 'link',
        tags: [],
        isFavorite: false,
        folderId: selectedFolder !== 'all' ? selectedFolder : defaultFolder?.id,
        createdAt: new Date().toISOString(),
      };

      const { error } = await supabase.from('links').insert([newLink]);

      if (error) throw error;

      setLinks([newLink, ...links]);
      setNewUrl('');
      
      Toast.show({
        type: 'success',
        text1: t.saved,
      });
    } catch (error) {
      console.error('Error adding link:', error);
      Toast.show({
        type: 'error',
        text1: t.error,
      });
    }
  };

  const handleOpenLink = (url) => {
    Linking.openURL(url);
  };

  const handleDeleteLink = (id) => {
    Alert.alert(
      t.delete,
      '',
      [
        { text: t.cancel, style: 'cancel' },
        {
          text: t.delete,
          style: 'destructive',
          onPress: async () => {
            try {
              // Cancel any scheduled notification for this link
              await cancelLinkReminder(id);
              await supabase.from('links').delete().eq('id', id);
              setLinks(links.filter(l => l.id !== id));
              Toast.show({ type: 'success', text1: t.deleted });
            } catch (error) {
              console.error('Error deleting:', error);
            }
          },
        },
      ]
    );
  };

  const handleToggleFavorite = async (item) => {
    try {
      const newValue = !item.isFavorite;
      await supabase
        .from('links')
        .update({ isFavorite: newValue })
        .eq('id', item.id);
      
      setLinks(links.map(l => l.id === item.id ? { ...l, isFavorite: newValue } : l));
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  // Edit Modal Functions
  const openEditModal = (item) => {
    setEditingItem(item);
    setEditTitle(item.title || '');
    setEditFolderId(item.folderId || '');
    
    // Load reminder data if exists
    if (item.reminder) {
      setReminderEnabled(true);
      setReminderDate(item.reminder.date ? new Date(item.reminder.date) : null);
      setReminderTime(item.reminder.time ? new Date(item.reminder.time) : null);
      setReminderLocation(item.reminder.location || '');
    } else {
      setReminderEnabled(false);
      setReminderDate(null);
      setReminderTime(null);
      setReminderLocation('');
    }
    
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingItem(null);
    setEditTitle('');
    setEditFolderId('');
    setReminderEnabled(false);
    setReminderDate(null);
    setReminderTime(null);
    setReminderLocation('');
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;

    try {
      let reminderData = null;
      
      if (reminderEnabled && (reminderDate || reminderTime || reminderLocation)) {
        reminderData = {
          date: reminderDate ? reminderDate.toISOString() : null,
          time: reminderTime ? reminderTime.toISOString() : null,
          location: reminderLocation || null,
        };
        
        // Schedule notification if date and time are set
        if (reminderDate) {
          await scheduleReminderNotification(editingItem, reminderDate, reminderTime);
        }
      } else {
        // Cancel any existing reminder
        await cancelLinkReminder(editingItem.id);
      }

      const updateData = {
        title: editTitle,
        folderId: editFolderId || null,
        reminder: reminderData,
      };

      await supabase
        .from('links')
        .update(updateData)
        .eq('id', editingItem.id);

      setLinks(links.map(l => 
        l.id === editingItem.id ? { ...l, ...updateData } : l
      ));

      Toast.show({
        type: 'success',
        text1: reminderEnabled ? t.reminderEnabled : t.saved,
      });

      closeEditModal();
    } catch (error) {
      console.error('Error saving edit:', error);
      Toast.show({ type: 'error', text1: t.error });
    }
  };

  // Notification Functions
  const scheduleReminderNotification = async (item, date, time) => {
    try {
      // Cancel existing notification first
      await cancelLinkReminder(item.id);

      // Create the trigger date
      const triggerDate = new Date(date);
      if (time) {
        triggerDate.setHours(time.getHours(), time.getMinutes(), 0, 0);
      } else {
        triggerDate.setHours(9, 0, 0, 0); // Default to 9 AM
      }

      // Only schedule if date is in the future
      if (triggerDate > new Date()) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Memor.ia - ' + t.reminder,
            body: item.title || item.url,
            data: { linkId: item.id, type: 'link_reminder' },
          },
          trigger: triggerDate,
          identifier: `link_reminder_${item.id}`,
        });
      }
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  };

  const cancelLinkReminder = async (linkId) => {
    try {
      await Notifications.cancelScheduledNotificationAsync(`link_reminder_${linkId}`);
    } catch (error) {
      // Notification might not exist, ignore error
    }
  };

  const handleClearReminder = () => {
    setReminderEnabled(false);
    setReminderDate(null);
    setReminderTime(null);
    setReminderLocation('');
  };

  // Date/Time Picker Handlers
  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (event.type !== 'dismissed' && selectedDate) {
      setReminderDate(selectedDate);
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    if (event.type !== 'dismissed' && selectedTime) {
      setReminderTime(selectedTime);
    }
  };

  // Format functions
  const formatDate = (date) => {
    if (!date) return t.noDate;
    return date.toLocaleDateString(undefined, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (time) => {
    if (!time) return t.noTime;
    return time.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredLinks = links.filter(link => {
    const matchesFolder = selectedFolder === 'all' || link.folderId === selectedFolder;
    const matchesSearch = !searchQuery || 
      link.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.url?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  const renderLinkItem = ({ item }) => {
    const folder = folders.find(f => f.id === item.folderId);
    const hasReminder = item.reminder && (item.reminder.date || item.reminder.time || item.reminder.location);
    
    return (
      <TouchableOpacity
        style={styles.linkCard}
        onPress={() => handleOpenLink(item.url)}
        onLongPress={() => openEditModal(item)}
      >
        {item.imageUrl && (
          <Image source={{ uri: item.imageUrl }} style={styles.linkImage} />
        )}
        <View style={styles.linkContent}>
          <Text style={styles.linkTitle} numberOfLines={2}>
            {item.title || item.url}
          </Text>
          <Text style={styles.linkUrl} numberOfLines={1}>
            {item.url}
          </Text>
          <View style={styles.linkMeta}>
            <View style={styles.folderBadge}>
              <Text style={styles.folderBadgeText}>
                {folder?.isDefault ? t.generalFolder : folder?.name || t.generalFolder}
              </Text>
            </View>
            {hasReminder && (
              <View style={styles.reminderBadge}>
                <Ionicons name="alarm" size={12} color="#FFD60A" />
                <Text style={styles.reminderBadgeText}>{t.reminder}</Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.linkActions}>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => openEditModal(item)}
          >
            <Ionicons name="pencil" size={18} color="#8E8E93" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleToggleFavorite(item)}>
            <Ionicons
              name={item.isFavorite ? 'heart' : 'heart-outline'}
              size={24}
              color={item.isFavorite ? '#FF3B30' : '#8E8E93'}
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#8E8E93" />
        <TextInput
          style={styles.searchInput}
          placeholder={t.search}
          placeholderTextColor="#8E8E93"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Add Link */}
      <View style={styles.addContainer}>
        <TextInput
          style={styles.addInput}
          placeholder="https://..."
          placeholderTextColor="#8E8E93"
          value={newUrl}
          onChangeText={setNewUrl}
          autoCapitalize="none"
          keyboardType="url"
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddLink}>
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Folder Filter */}
      <FlatList
        horizontal
        data={[{ id: 'all', name: t.allLinks }, ...folders]}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        style={styles.folderList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.folderChip,
              selectedFolder === item.id && styles.folderChipActive,
            ]}
            onPress={() => setSelectedFolder(item.id)}
          >
            <Text
              style={[
                styles.folderChipText,
                selectedFolder === item.id && styles.folderChipTextActive,
              ]}
            >
              {item.icon || ''} {item.isDefault ? t.generalFolder : item.name}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Links List */}
      <FlatList
        data={filteredLinks}
        keyExtractor={(item) => item.id}
        renderItem={renderLinkItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchData();
            }}
            tintColor="#007AFF"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="link-outline" size={64} color="#8E8E93" />
            <Text style={styles.emptyText}>{t.noClipboardItems}</Text>
          </View>
        }
      />

      {/* Edit Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={closeEditModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t.editItem}</Text>
              <TouchableOpacity onPress={closeEditModal}>
                <Ionicons name="close" size={28} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Title */}
              <Text style={styles.inputLabel}>{t.edit}</Text>
              <TextInput
                style={styles.textInput}
                value={editTitle}
                onChangeText={setEditTitle}
                placeholder={editingItem?.url}
                placeholderTextColor="#8E8E93"
              />

              {/* Folder */}
              <Text style={styles.inputLabel}>{t.moveToFolder}</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowFolderPicker(true)}
              >
                <Ionicons name="folder-outline" size={20} color="#007AFF" />
                <Text style={styles.pickerButtonText}>
                  {folders.find(f => f.id === editFolderId)?.name || t.generalFolder}
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
              </TouchableOpacity>

              {/* Reminder Section */}
              <View style={styles.reminderSection}>
                <View style={styles.reminderHeader}>
                  <View style={styles.reminderHeaderLeft}>
                    <Ionicons name="alarm-outline" size={24} color="#FFD60A" />
                    <Text style={styles.reminderTitle}>{t.setReminder}</Text>
                  </View>
                  <Switch
                    value={reminderEnabled}
                    onValueChange={setReminderEnabled}
                    trackColor={{ false: '#3A3A3C', true: '#34C759' }}
                    thumbColor={'#FFFFFF'}
                  />
                </View>

                {reminderEnabled && (
                  <View style={styles.reminderOptions}>
                    {/* Date Picker */}
                    <TouchableOpacity
                      style={styles.reminderOption}
                      onPress={() => setShowDatePicker(true)}
                    >
                      <View style={styles.reminderOptionLeft}>
                        <Ionicons name="calendar-outline" size={20} color="#007AFF" />
                        <Text style={styles.reminderOptionLabel}>{t.reminderDate}</Text>
                      </View>
                      <View style={styles.reminderOptionRight}>
                        <Text style={[
                          styles.reminderOptionValue,
                          reminderDate && styles.reminderOptionValueActive
                        ]}>
                          {formatDate(reminderDate)}
                        </Text>
                        <Ionicons name="chevron-forward" size={16} color="#8E8E93" />
                      </View>
                    </TouchableOpacity>

                    {/* Time Picker */}
                    <TouchableOpacity
                      style={styles.reminderOption}
                      onPress={() => setShowTimePicker(true)}
                    >
                      <View style={styles.reminderOptionLeft}>
                        <Ionicons name="time-outline" size={20} color="#007AFF" />
                        <Text style={styles.reminderOptionLabel}>{t.reminderTime}</Text>
                      </View>
                      <View style={styles.reminderOptionRight}>
                        <Text style={[
                          styles.reminderOptionValue,
                          reminderTime && styles.reminderOptionValueActive
                        ]}>
                          {formatTime(reminderTime)}
                        </Text>
                        <Ionicons name="chevron-forward" size={16} color="#8E8E93" />
                      </View>
                    </TouchableOpacity>

                    {/* Location */}
                    <View style={styles.reminderOption}>
                      <View style={styles.reminderOptionLeft}>
                        <Ionicons name="location-outline" size={20} color="#007AFF" />
                        <Text style={styles.reminderOptionLabel}>{t.reminderLocation}</Text>
                      </View>
                    </View>
                    <TextInput
                      style={styles.locationInput}
                      value={reminderLocation}
                      onChangeText={setReminderLocation}
                      placeholder={t.reminderLocationPlaceholder}
                      placeholderTextColor="#8E8E93"
                    />

                    {/* Clear Reminder */}
                    {(reminderDate || reminderTime || reminderLocation) && (
                      <TouchableOpacity
                        style={styles.clearReminderButton}
                        onPress={handleClearReminder}
                      >
                        <Ionicons name="trash-outline" size={18} color="#FF3B30" />
                        <Text style={styles.clearReminderText}>{t.clearReminder}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            </ScrollView>

            {/* Save Button */}
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveEdit}>
              <Text style={styles.saveButtonText}>{t.save}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <Modal
          visible={showDatePicker}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={styles.pickerModalOverlay}>
            <View style={styles.pickerModalContent}>
              {Platform.OS === 'ios' && (
                <View style={styles.pickerHeader}>
                  <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                    <Text style={styles.pickerCancel}>{t.cancel}</Text>
                  </TouchableOpacity>
                  <Text style={styles.pickerTitle}>{t.reminderDate}</Text>
                  <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                    <Text style={styles.pickerDone}>OK</Text>
                  </TouchableOpacity>
                </View>
              )}
              <DateTimePicker
                value={reminderDate || new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                minimumDate={new Date()}
                textColor="#FFFFFF"
                themeVariant="dark"
                style={Platform.OS === 'ios' ? styles.iosPicker : undefined}
              />
            </View>
          </View>
        </Modal>
      )}

      {/* Time Picker Modal */}
      {showTimePicker && (
        <Modal
          visible={showTimePicker}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowTimePicker(false)}
        >
          <View style={styles.pickerModalOverlay}>
            <View style={styles.pickerModalContent}>
              {Platform.OS === 'ios' && (
                <View style={styles.pickerHeader}>
                  <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                    <Text style={styles.pickerCancel}>{t.cancel}</Text>
                  </TouchableOpacity>
                  <Text style={styles.pickerTitle}>{t.reminderTime}</Text>
                  <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                    <Text style={styles.pickerDone}>OK</Text>
                  </TouchableOpacity>
                </View>
              )}
              <DateTimePicker
                value={reminderTime || new Date()}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleTimeChange}
                textColor="#FFFFFF"
                themeVariant="dark"
                style={Platform.OS === 'ios' ? styles.iosPicker : undefined}
              />
            </View>
          </View>
        </Modal>
      )}

      {/* Folder Picker Modal */}
      <Modal
        visible={showFolderPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFolderPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.folderPickerContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t.selectFolder}</Text>
              <TouchableOpacity onPress={() => setShowFolderPicker(false)}>
                <Ionicons name="close" size={28} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {folders.map((folder) => (
                <TouchableOpacity
                  key={folder.id}
                  style={[
                    styles.folderOption,
                    editFolderId === folder.id && styles.folderOptionActive,
                  ]}
                  onPress={() => {
                    setEditFolderId(folder.id);
                    setShowFolderPicker(false);
                  }}
                >
                  <Text style={styles.folderOptionIcon}>{folder.icon || '📁'}</Text>
                  <Text style={styles.folderOptionName}>
                    {folder.isDefault ? t.generalFolder : folder.name}
                  </Text>
                  {editFolderId === folder.id && (
                    <Ionicons name="checkmark" size={24} color="#007AFF" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    margin: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: '#FFFFFF',
    fontSize: 16,
  },
  addContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 8,
    gap: 8,
  },
  addInput: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    paddingHorizontal: 16,
    borderRadius: 12,
    height: 44,
    color: '#FFFFFF',
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#007AFF',
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  folderList: {
    paddingHorizontal: 16,
    marginBottom: 8,
    maxHeight: 44,
  },
  folderChip: {
    backgroundColor: '#1C1C1E',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  folderChipActive: {
    backgroundColor: '#007AFF',
  },
  folderChipText: {
    color: '#8E8E93',
    fontSize: 14,
  },
  folderChipTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  linkCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  linkImage: {
    width: 80,
    height: 80,
  },
  linkContent: {
    flex: 1,
    padding: 12,
  },
  linkTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  linkUrl: {
    color: '#8E8E93',
    fontSize: 12,
    marginBottom: 8,
  },
  linkMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  folderBadge: {
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  folderBadgeText: {
    color: '#007AFF',
    fontSize: 12,
  },
  reminderBadge: {
    backgroundColor: 'rgba(255, 214, 10, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reminderBadgeText: {
    color: '#FFD60A',
    fontSize: 12,
  },
  linkActions: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingRight: 12,
    gap: 12,
  },
  editButton: {
    padding: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: '#8E8E93',
    fontSize: 16,
    marginTop: 16,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
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
  modalBody: {
    padding: 20,
    maxHeight: 500,
  },
  inputLabel: {
    color: '#8E8E93',
    fontSize: 14,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  textInput: {
    backgroundColor: '#000000',
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 20,
  },
  pickerButton: {
    backgroundColor: '#000000',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  pickerButtonText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
  },
  // Reminder Section
  reminderSection: {
    backgroundColor: '#000000',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reminderHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  reminderTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  reminderOptions: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
    paddingTop: 16,
  },
  reminderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  reminderOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  reminderOptionLabel: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  reminderOptionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reminderOptionValue: {
    color: '#8E8E93',
    fontSize: 14,
  },
  reminderOptionValueActive: {
    color: '#007AFF',
  },
  locationInput: {
    backgroundColor: '#1C1C1E',
    borderRadius: 10,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 4,
    marginBottom: 12,
  },
  clearReminderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    marginTop: 8,
  },
  clearReminderText: {
    color: '#FF3B30',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  // Date/Time Picker Modals
  pickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  pickerModalContent: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  pickerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  pickerCancel: {
    color: '#8E8E93',
    fontSize: 16,
  },
  pickerDone: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  iosPicker: {
    height: 200,
  },
  // Folder Picker
  folderPickerContent: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '60%',
    paddingBottom: 40,
  },
  folderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  folderOptionActive: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  folderOptionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  folderOptionName: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
  },
});
