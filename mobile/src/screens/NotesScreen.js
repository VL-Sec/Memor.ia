import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, RefreshControl, Modal, ScrollView, Alert, FlatList, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations } from '../lib/i18n';
import CustomHeader from '../components/CustomHeader';

// Normalizar texto (remover acentos + minúsculas) para pesquisa
const normalize = (text = '') =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

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

export default function NotesScreen({ language, userId, refreshKey, triggerRefresh }) {
  const [notes, setNotes] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteColor, setNoteColor] = useState('default');
  const [searchQuery, setSearchQuery] = useState('');
  
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
    setShowModal(true);
  };

  const openEditNote = (note) => {
    setEditingNote(note);
    setNoteTitle(note.title || '');
    setNoteContent(note.content || '');
    setNoteColor(note.color || 'default');
    setShowModal(true);
  };

  const handleSaveNote = async () => {
    // Allow saving with just title OR just content
    if (!noteContent.trim() && !noteTitle.trim()) {
      Toast.show({ type: 'error', text1: t.titleOrContentRequired || 'Título ou conteúdo é obrigatório' });
      return;
    }

    const now = new Date().toISOString();
    
    if (editingNote) {
      const updatedNotes = notes.map(n => 
        n.id === editingNote.id 
          ? { ...n, title: noteTitle, content: noteContent, color: noteColor, updatedAt: now }
          : n
      );
      await saveNotes(updatedNotes);
    } else {
      const newNote = {
        id: `note_${Date.now()}`,
        title: noteTitle,
        content: noteContent,
        color: noteColor,
        isPinned: false,
        isFavorite: false,
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
    const q = normalize(searchQuery);
    return normalize(note.title).includes(q) || normalize(note.content).includes(q);
  });

  // Sort: pinned items first, then by date
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
  });

  const renderNoteItem = ({ item }) => {
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
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
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
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => { Keyboard.dismiss(); setSearchQuery(''); }}>
              <Ionicons name="close-circle" size={18} color="#8E8E93" />
            </TouchableOpacity>
          )}
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
          keyboardShouldPersistTaps="handled"
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
        <KeyboardAvoidingView 
          style={{ flex: 1, backgroundColor: '#000000' }} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
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

          <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled">
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
          </ScrollView>
        </View>
        </KeyboardAvoidingView>
      </Modal>
      </View>
    </SafeAreaView>
    </TouchableWithoutFeedback>
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
});
