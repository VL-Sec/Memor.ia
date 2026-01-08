import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, RefreshControl, Modal, ScrollView, Alert, FlatList, Switch, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import DateTimePicker from '@react-native-community/datetimepicker';
import { translations } from '../lib/i18n';
import CustomHeader from '../components/CustomHeader';

const NOTE_COLORS = [
  { id: 'default', color: '#1C1C1E', name: 'Default' },
  { id: 'red', color: '#FF3B30', name: 'Red' },
  { id: 'orange', color: '#FF9500', name: 'Orange' },
  { id: 'yellow', color: '#FFD60A', name: 'Yellow' },
  { id: 'green', color: '#34C759', name: 'Green' },
  { id: 'blue', color: '#007AFF', name: 'Blue' },
  { id: 'purple', color: '#AF52DE', name: 'Purple' },
  { id: 'pink', color: '#FF2D92', name: 'Pink' },
];

// Helper function to format date according to user's system locale (with year)
const formatDateLocale = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
};

// Helper function to format date for badges (shorter)
const formatDateShort = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: '2-digit' });
};

export default function NotesScreen({ language, userId, refreshKey, triggerRefresh }) {
  const [notes, setNotes] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteColor, setNoteColor] = useState('default');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Reminder state
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderDate, setReminderDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  const insets = useSafeAreaInsets();
  const t = translations[language] || translations.en;
  
  // Dynamic storage key based on userId
  const getStorageKey = () => `memoria-notes-${userId || 'default'}`;

  // Load notes when screen is focused (for sync with Favorites)
  useFocusEffect(
    useCallback(() => {
      loadNotes();
    }, [userId])
  );

  // Also reload when refreshKey changes
  useEffect(() => {
    if (refreshKey > 0) {
      loadNotes();
    }
  }, [refreshKey]);

  const loadNotes = async () => {
    try {
      const data = await AsyncStorage.getItem(getStorageKey());
      if (data) {
        const parsedNotes = JSON.parse(data);
        setNotes(parsedNotes);
      } else {
        setNotes([]);
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const saveNotes = async (newNotes) => {
    try {
      await AsyncStorage.setItem(getStorageKey(), JSON.stringify(newNotes));
      setNotes(newNotes);
      // Trigger refresh on other screens
      if (triggerRefresh) triggerRefresh();
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  };

  const openNewNote = () => {
    setEditingNote(null);
    setNoteTitle('');
    setNoteContent('');
    setNoteColor('default');
    setReminderEnabled(false);
    // Default reminder: tomorrow at 9:00
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    setReminderDate(tomorrow);
    setShowModal(true);
  };

  const openEditNote = (note) => {
    setEditingNote(note);
    setNoteTitle(note.title || '');
    setNoteContent(note.content || '');
    setNoteColor(note.color || 'default');
    if (note.reminder && note.reminder.date) {
      setReminderEnabled(true);
      setReminderDate(new Date(note.reminder.date));
    } else {
      setReminderEnabled(false);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);
      setReminderDate(tomorrow);
    }
    setShowModal(true);
  };

  // Schedule notification for reminder
  const scheduleNotification = async (title, body, date) => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Toast.show({ type: 'error', text1: t.notificationPermissionDenied || 'Permissão de notificações negada' });
        return null;
      }
      
      // Calculate seconds until the notification
      const now = new Date();
      const triggerDate = new Date(date);
      const seconds = Math.floor((triggerDate.getTime() - now.getTime()) / 1000);
      
      if (seconds <= 0) {
        Toast.show({ type: 'error', text1: t.reminderInPast || 'A data deve ser no futuro' });
        return null;
      }
      
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: title || t.reminder || 'Lembrete',
          body: body || t.noteReminderBody || 'Tens uma nota para rever!',
          sound: true,
        },
        trigger: {
          seconds: seconds,
        },
      });
      
      Toast.show({ type: 'success', text1: t.reminderSet || 'Lembrete definido' });
      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  };

  // Cancel scheduled notification
  const cancelNotification = async (notificationId) => {
    if (notificationId) {
      try {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
      } catch (error) {
        console.error('Error canceling notification:', error);
      }
    }
  };

  const handleSaveNote = async () => {
    if (!noteContent.trim()) {
      Toast.show({ type: 'error', text1: t.error });
      return;
    }

    const now = new Date().toISOString();
    let reminderData = null;
    
    if (editingNote) {
      // Cancel existing notification if any
      if (editingNote.reminder?.notificationId) {
        await cancelNotification(editingNote.reminder.notificationId);
      }
      
      // Schedule new notification if reminder is enabled
      if (reminderEnabled && reminderDate > new Date()) {
        const notificationId = await scheduleNotification(
          noteTitle || t.reminder,
          noteContent.substring(0, 100),
          reminderDate
        );
        reminderData = { date: reminderDate.toISOString(), notificationId };
      }
      
      const updatedNotes = notes.map(n => 
        n.id === editingNote.id 
          ? { ...n, title: noteTitle, content: noteContent, color: noteColor, reminder: reminderData, updatedAt: now }
          : n
      );
      await saveNotes(updatedNotes);
    } else {
      // Schedule notification for new note
      if (reminderEnabled && reminderDate > new Date()) {
        const notificationId = await scheduleNotification(
          noteTitle || t.reminder,
          noteContent.substring(0, 100),
          reminderDate
        );
        reminderData = { date: reminderDate.toISOString(), notificationId };
      }
      
      const newNote = {
        id: `note_${Date.now()}`,
        title: noteTitle,
        content: noteContent,
        color: noteColor,
        isPinned: false,
        isFavorite: false,
        reminder: reminderData,
        order: 0,
        createdAt: now,
        updatedAt: now,
      };
      await saveNotes([newNote, ...notes]);
    }

    setShowModal(false);
    Toast.show({ type: 'success', text1: t.saved });
  };

  const handleDeleteNote = (noteId) => {
    Alert.alert(
      t.delete,
      '',
      [
        { text: t.cancel, style: 'cancel' },
        {
          text: t.delete,
          style: 'destructive',
          onPress: async () => {
            const noteToDelete = notes.find(n => n.id === noteId);
            // Cancel notification if exists
            if (noteToDelete?.reminder?.notificationId) {
              await cancelNotification(noteToDelete.reminder.notificationId);
            }
            const filteredNotes = notes.filter(n => n.id !== noteId);
            await saveNotes(filteredNotes);
            Toast.show({ type: 'success', text1: t.deleted });
          },
        },
      ]
    );
  };

  // Action handlers - prevent event propagation
  const handleTogglePin = async (noteId, e) => {
    if (e) e.stopPropagation();
    const note = notes.find(n => n.id === noteId);
    const newPinState = !note.isPinned;
    const updatedNotes = notes.map(n =>
      n.id === noteId ? { ...n, isPinned: newPinState } : n
    );
    await saveNotes(updatedNotes);
    Toast.show({ 
      type: 'success', 
      text1: newPinState ? (t.pinned || 'Fixado no topo') : (t.unpinned || 'Desafixado')
    });
  };

  const handleToggleFavorite = async (noteId, e) => {
    if (e) e.stopPropagation();
    const note = notes.find(n => n.id === noteId);
    const newFavoriteState = !note.isFavorite;
    const updatedNotes = notes.map(n =>
      n.id === noteId ? { ...n, isFavorite: newFavoriteState } : n
    );
    await saveNotes(updatedNotes);
    Toast.show({ 
      type: 'success', 
      text1: newFavoriteState ? (t.addedToFavorites || 'Adicionado aos favoritos') : (t.removedFromFavorites || 'Removido dos favoritos')
    });
  };

  const handleCopyNote = async (content, e) => {
    if (e) e.stopPropagation();
    try {
      const Clipboard = require('expo-clipboard');
      await Clipboard.setStringAsync(content);
      Toast.show({ type: 'success', text1: t.copied });
    } catch (error) {
      console.error('Error copying:', error);
    }
  };

  const handleDeleteAction = (noteId, e) => {
    if (e) e.stopPropagation();
    handleDeleteNote(noteId);
  };

  const getColorById = (id) => {
    return NOTE_COLORS.find(c => c.id === id)?.color || '#1C1C1E';
  };

  const filteredNotes = notes.filter(note => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return note.title?.toLowerCase().includes(query) || 
           note.content?.toLowerCase().includes(query);
  });

  // Sort: pinned items first, then by date
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
  });

  const renderNoteItem = ({ item }) => {
    const hasReminder = item.reminder && item.reminder.date;
    const reminderDateObj = hasReminder ? new Date(item.reminder.date) : null;
    const isReminderPast = reminderDateObj && reminderDateObj < new Date();
    
    return (
      <View style={[styles.noteCard, { borderLeftColor: getColorById(item.color), borderLeftWidth: 4 }]}>
        {/* Main content area - opens edit modal */}
        <TouchableOpacity 
          style={styles.noteMainContent}
          onPress={() => openEditNote(item)}
          activeOpacity={0.7}
        >
          <View style={styles.noteHeader}>
            {item.title ? (
              <Text style={styles.noteTitle} numberOfLines={1}>{item.title}</Text>
            ) : null}
          </View>
          <Text style={styles.noteContent} numberOfLines={4}>{item.content || ''}</Text>
          <View style={styles.noteMetaRow}>
            <Text style={styles.noteDate}>{formatDateLocale(item.updatedAt || item.createdAt)}</Text>
            {hasReminder && !isReminderPast && (
              <View style={styles.reminderBadge}>
                <Ionicons name="notifications" size={12} color="#34C759" />
                <Text style={styles.reminderBadgeText}>
                  {formatDateShort(item.reminder.date)}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
        
        {/* Action buttons - separate touch zone */}
        <View style={styles.noteActionsColumn}>
          <TouchableOpacity 
            onPress={(e) => handleCopyNote(item.content || '', e)} 
            style={styles.actionButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="copy-outline" size={18} color="#8E8E93" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={(e) => handleToggleFavorite(item.id, e)} 
            style={styles.actionButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name={item.isFavorite ? "heart" : "heart-outline"} size={18} color={item.isFavorite ? "#FF3B30" : "#8E8E93"} />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={(e) => handleTogglePin(item.id, e)} 
            style={styles.actionButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="pin" size={18} color={item.isPinned ? "#FFD60A" : "#8E8E93"} />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={(e) => handleDeleteAction(item.id, e)} 
            style={styles.actionButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="trash-outline" size={18} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <CustomHeader title={t.tabNotes || 'Notas'} />
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

        {/* Notes List */}
        {sortedNotes.length === 0 ? (
          <ScrollView 
            style={styles.scrollView}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => { setRefreshing(true); loadNotes(); }}
                tintColor="#007AFF"
              />
            }
          >
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={64} color="#8E8E93" />
              <Text style={styles.emptyText}>{t.noNotes}</Text>
          </View>
        </ScrollView>
      ) : (
        <FlatList
          data={sortedNotes}
          keyExtractor={(item) => item.id}
          renderItem={renderNoteItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); loadNotes(); }}
              tintColor="#007AFF"
            />
          }
        />
      )}

      {/* FAB - New Note */}
      <TouchableOpacity style={styles.fab} onPress={openNewNote}>
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Note Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowModal(false)} style={styles.modalHeaderButton}>
              <Ionicons name="close" size={28} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingNote ? t.editNote : t.newNote}
            </Text>
            <TouchableOpacity onPress={handleSaveNote} style={styles.modalHeaderButton}>
              <Text style={styles.saveText}>{t.save}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <TextInput
              style={styles.titleInput}
              placeholder={t.noteTitlePlaceholder}
              placeholderTextColor="#8E8E93"
              value={noteTitle}
              onChangeText={setNoteTitle}
            />

            <TextInput
              style={styles.contentInput}
              placeholder={t.notesPlaceholder}
              placeholderTextColor="#8E8E93"
              value={noteContent}
              onChangeText={setNoteContent}
              multiline
              textAlignVertical="top"
            />

            <Text style={styles.colorLabel}>{t.noteColor}</Text>
            <View style={styles.colorPicker}>
              {NOTE_COLORS.map(c => (
                <TouchableOpacity
                  key={c.id}
                  style={[
                    styles.colorOption,
                    { backgroundColor: c.color },
                    noteColor === c.id && styles.colorOptionSelected,
                  ]}
                  onPress={() => setNoteColor(c.id)}
                >
                  {noteColor === c.id && (
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Reminder Section */}
            <View style={styles.reminderSection}>
              <View style={styles.reminderHeader}>
                <View style={styles.reminderHeaderLeft}>
                  <Ionicons name="notifications-outline" size={24} color="#34C759" />
                  <Text style={styles.reminderTitle}>{t.setReminder || 'Lembrete'}</Text>
                </View>
                <Switch 
                  value={reminderEnabled} 
                  onValueChange={setReminderEnabled} 
                  trackColor={{ false: '#3A3A3C', true: '#34C759' }} 
                  thumbColor="#FFFFFF" 
                />
              </View>
              {reminderEnabled && (
                <View style={styles.reminderOptions}>
                  <View style={styles.dateTimeRow}>
                    <TouchableOpacity style={styles.dateTimeButton} onPress={() => setShowDatePicker(true)}>
                      <Ionicons name="calendar-outline" size={20} color="#007AFF" />
                      <Text style={styles.dateTimeText}>
                        {reminderDate.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.dateTimeButton} onPress={() => setShowTimePicker(true)}>
                      <Ionicons name="time-outline" size={20} color="#007AFF" />
                      <Text style={styles.dateTimeText}>
                        {reminderDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.reminderHint}>
                    {t.reminderHint || 'Vais receber uma notificação nesta data e hora'}
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Date Picker */}
      {showDatePicker && (
        Platform.OS === 'ios' ? (
          <Modal visible={showDatePicker} animationType="slide" transparent={true}>
            <View style={styles.pickerModalOverlay}>
              <View style={styles.pickerModalContent}>
                <View style={styles.pickerModalHeader}>
                  <Text style={styles.pickerModalTitle}>{t.reminderDate || 'Data'}</Text>
                  <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                    <Text style={styles.pickerDoneText}>{t.done || 'Concluído'}</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={reminderDate}
                  mode="date"
                  display="spinner"
                  onChange={(event, selectedDate) => {
                    if (selectedDate) {
                      const newDate = new Date(reminderDate);
                      newDate.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
                      setReminderDate(newDate);
                    }
                  }}
                  minimumDate={new Date()}
                  textColor="#FFFFFF"
                  themeVariant="dark"
                />
              </View>
            </View>
          </Modal>
        ) : (
          <DateTimePicker
            value={reminderDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                const newDate = new Date(reminderDate);
                newDate.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
                setReminderDate(newDate);
              }
            }}
            minimumDate={new Date()}
          />
        )
      )}

      {/* Time Picker */}
      {showTimePicker && (
        Platform.OS === 'ios' ? (
          <Modal visible={showTimePicker} animationType="slide" transparent={true}>
            <View style={styles.pickerModalOverlay}>
              <View style={styles.pickerModalContent}>
                <View style={styles.pickerModalHeader}>
                  <Text style={styles.pickerModalTitle}>{t.reminderTime || 'Hora'}</Text>
                  <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                    <Text style={styles.pickerDoneText}>{t.done || 'Concluído'}</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={reminderDate}
                  mode="time"
                  display="spinner"
                  onChange={(event, selectedTime) => {
                    if (selectedTime) {
                      const newDate = new Date(reminderDate);
                      newDate.setHours(selectedTime.getHours(), selectedTime.getMinutes());
                      setReminderDate(newDate);
                    }
                  }}
                  textColor="#FFFFFF"
                  themeVariant="dark"
                />
              </View>
            </View>
          </Modal>
        ) : (
          <DateTimePicker
            value={reminderDate}
            mode="time"
            display="default"
            onChange={(event, selectedTime) => {
              setShowTimePicker(false);
              if (selectedTime) {
                const newDate = new Date(reminderDate);
                newDate.setHours(selectedTime.getHours(), selectedTime.getMinutes());
                setReminderDate(newDate);
              }
            }}
          />
        )
      )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#000000' },
  container: { flex: 1, backgroundColor: '#000000' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1C1C1E', margin: 16, marginBottom: 8, paddingHorizontal: 12, borderRadius: 12, height: 44 },
  searchInput: { flex: 1, marginLeft: 8, color: '#FFFFFF', fontSize: 16 },
  scrollView: { flex: 1, paddingHorizontal: 16 },
  listContent: { paddingHorizontal: 16, paddingBottom: 100 },
  // Note card with separate touch zones
  noteCard: { backgroundColor: '#1C1C1E', borderRadius: 12, marginBottom: 10, flexDirection: 'row', overflow: 'hidden' },
  noteMainContent: { flex: 1, padding: 16 },
  noteHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  noteTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '600', flex: 1 },
  noteContent: { color: '#CCCCCC', fontSize: 15, lineHeight: 22 },
  noteMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#2C2C2E' },
  noteDate: { color: '#8E8E93', fontSize: 12 },
  // Actions column - separate touch zone
  noteActionsColumn: { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 8, gap: 4, backgroundColor: '#1C1C1E', borderLeftWidth: 1, borderLeftColor: '#2C2C2E' },
  actionButton: { padding: 8 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 100 },
  emptyText: { color: '#8E8E93', fontSize: 16, marginTop: 16 },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#007AFF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  // Modal styles with proper safe area
  modalContainer: { flex: 1, backgroundColor: '#000000' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#2C2C2E', minHeight: 56 },
  modalHeaderButton: { padding: 4, minWidth: 60 },
  modalTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
  saveText: { color: '#007AFF', fontSize: 17, fontWeight: '600', textAlign: 'right' },
  modalBody: { flex: 1, padding: 16 },
  titleInput: { backgroundColor: '#1C1C1E', borderRadius: 12, padding: 16, color: '#FFFFFF', fontSize: 18, fontWeight: '600', marginBottom: 12 },
  contentInput: { backgroundColor: '#1C1C1E', borderRadius: 12, padding: 16, color: '#FFFFFF', fontSize: 16, minHeight: 200, marginBottom: 20 },
  colorLabel: { color: '#8E8E93', fontSize: 14, marginBottom: 12, textTransform: 'uppercase' },
  colorPicker: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  colorOption: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  colorOptionSelected: { borderWidth: 3, borderColor: '#FFFFFF' },
  // Reminder styles
  reminderSection: { backgroundColor: '#1C1C1E', borderRadius: 16, padding: 16, marginBottom: 16 },
  reminderHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  reminderHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  reminderTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
  reminderOptions: { marginTop: 16, borderTopWidth: 1, borderTopColor: '#2C2C2E', paddingTop: 16 },
  dateTimeRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  dateTimeButton: { flex: 1, backgroundColor: '#000000', borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  dateTimeText: { color: '#FFFFFF', fontSize: 16, fontWeight: '500' },
  reminderHint: { color: '#8E8E93', fontSize: 13, textAlign: 'center', fontStyle: 'italic' },
  reminderBadge: { backgroundColor: 'rgba(52, 199, 89, 0.2)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 4 },
  reminderBadgeText: { color: '#34C759', fontSize: 12 },
  // iOS Picker Modal styles
  pickerModalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)', justifyContent: 'flex-end' },
  pickerModalContent: { backgroundColor: '#1C1C1E', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 30 },
  pickerModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#2C2C2E' },
  pickerModalTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
  pickerDoneText: { color: '#007AFF', fontSize: 17, fontWeight: '600' },
});
