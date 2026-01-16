import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, RefreshControl, Modal, ScrollView, Alert, FlatList, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, generateId } from '../lib/supabase';
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
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteColor, setNoteColor] = useState('default');
  const [searchQuery, setSearchQuery] = useState('');
  
  const insets = useSafeAreaInsets();
  const t = translations[language] || translations.en;
  
  // Dynamic storage key for migration check
  const getStorageKey = () => `memoria-notes-${userId || 'default'}`;
  const getMigratedKey = () => `memoria-notes-migrated-${userId || 'default'}`;

  // Load notes when screen is focused
  useFocusEffect(
    useCallback(() => {
      if (userId) {
        loadNotes();
      }
    }, [userId])
  );

  // Also reload when refreshKey changes
  useEffect(() => {
    if (refreshKey > 0 && userId) {
      loadNotes();
    }
  }, [refreshKey]);

  // Migrate local notes to Supabase (one-time)
  const migrateLocalNotes = async () => {
    try {
      const migrated = await AsyncStorage.getItem(getMigratedKey());
      if (migrated === 'true') return; // Already migrated

      const localData = await AsyncStorage.getItem(getStorageKey());
      if (localData) {
        const localNotes = JSON.parse(localData);
        if (localNotes.length > 0) {
          console.log(`Migrating ${localNotes.length} local notes to Supabase...`);
          
          // Add userId to each note and insert to Supabase
          const notesToMigrate = localNotes.map(note => ({
            id: note.id,
            userId: userId,
            title: note.title || '',
            content: note.content || '',
            color: note.color || 'default',
            isPinned: note.isPinned || false,
            isFavorite: note.isFavorite || false,
            createdAt: note.createdAt || new Date().toISOString(),
            updatedAt: note.updatedAt || new Date().toISOString(),
          }));

          // Insert notes one by one to handle duplicates
          for (const note of notesToMigrate) {
            const { error } = await supabase
              .from('notes')
              .upsert([note], { onConflict: 'id' });
            
            if (error) {
              console.error('Error migrating note:', error);
            }
          }

          Toast.show({ type: 'success', text1: t.notesMigrated || 'Notas sincronizadas com a cloud' });
        }
      }

      // Mark as migrated
      await AsyncStorage.setItem(getMigratedKey(), 'true');
    } catch (error) {
      console.error('Error migrating notes:', error);
    }
  };

  const loadNotes = async () => {
    if (!userId) return;
    
    try {
      // First, try to migrate local notes
      await migrateLocalNotes();

      // Load from Supabase
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('userId', userId)
        .order('createdAt', { ascending: false });

      if (error) throw error;

      setNotes(data || []);
    } catch (error) {
      console.error('Error loading notes:', error);
      Toast.show({ type: 'error', text1: t.error || 'Erro ao carregar notas' });
    } finally {
      setLoading(false);
      setRefreshing(false);
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
    
    try {
      if (editingNote) {
        // Update existing note
        const updateData = {
          title: noteTitle.trim(),
          content: noteContent.trim(),
          color: noteColor,
          updatedAt: now,
        };

        const { error } = await supabase
          .from('notes')
          .update(updateData)
          .eq('id', editingNote.id);

        if (error) throw error;

        // Update local state
        setNotes(notes.map(n => 
          n.id === editingNote.id ? { ...n, ...updateData } : n
        ));
      } else {
        // Create new note
        const newNote = {
          id: generateId(),
          userId: userId,
          title: noteTitle.trim(),
          content: noteContent.trim(),
          color: noteColor,
          isPinned: false,
          isFavorite: false,
          createdAt: now,
          updatedAt: now,
        };

        const { error } = await supabase
          .from('notes')
          .insert([newNote]);

        if (error) throw error;

        // Update local state
        setNotes([newNote, ...notes]);
      }

      setShowModal(false);
      Toast.show({ type: 'success', text1: t.saved });
      if (triggerRefresh) triggerRefresh();
    } catch (error) {
      console.error('Error saving note:', error);
      Toast.show({ type: 'error', text1: t.error || 'Erro ao guardar nota' });
    }
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
            try {
              const { error } = await supabase
                .from('notes')
                .delete()
                .eq('id', noteId);

              if (error) throw error;

              setNotes(notes.filter(n => n.id !== noteId));
              Toast.show({ type: 'success', text1: t.deleted });
              if (triggerRefresh) triggerRefresh();
            } catch (error) {
              console.error('Error deleting note:', error);
              Toast.show({ type: 'error', text1: t.error });
            }
          },
        },
      ]
    );
  };

  const handleToggleFavorite = async (noteId, e) => {
    if (e) e.stopPropagation();
    const note = notes.find(n => n.id === noteId);
    if (!note) return;
    
    const newFavoriteState = !note.isFavorite;
    
    try {
      const { error } = await supabase
        .from('notes')
        .update({ isFavorite: newFavoriteState })
        .eq('id', noteId);

      if (error) throw error;

      // Update local state
      setNotes(notes.map(n =>
        n.id === noteId ? { ...n, isFavorite: newFavoriteState } : n
      ));
      
      Toast.show({ 
        type: 'success', 
        text1: newFavoriteState ? (t.addedToFavorites || 'Adicionado aos favoritos') : (t.removedFromFavorites || 'Removido dos favoritos')
      });
      
      if (triggerRefresh) triggerRefresh();
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Toast.show({ type: 'error', text1: t.error });
    }
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

  const handleTogglePin = async (noteId, e) => {
    if (e) e.stopPropagation();
    const note = notes.find(n => n.id === noteId);
    if (!note) return;
    
    const newPinnedState = !note.isPinned;
    
    try {
      const { error } = await supabase
        .from('notes')
        .update({ isPinned: newPinnedState })
        .eq('id', noteId);

      if (error) throw error;

      setNotes(notes.map(n =>
        n.id === noteId ? { ...n, isPinned: newPinnedState } : n
      ));
      
      Toast.show({ 
        type: 'success', 
        text1: newPinnedState ? (t.pinned || 'Fixado') : (t.unpinned || 'Desafixado')
      });
    } catch (error) {
      console.error('Error toggling pin:', error);
      Toast.show({ type: 'error', text1: t.error });
    }
  };

  const getColorById = (id) => {
    const color = NOTE_COLORS.find(c => c.id === id);
    return color ? color.color : '#1C1C1E';
  };

  // Filter and sort notes
  const filteredNotes = notes.filter(note => {
    if (!searchQuery) return true;
    const q = normalize(searchQuery);
    return normalize(note.title).includes(q) || normalize(note.content).includes(q);
  });

  const sortedNotes = [...filteredNotes].sort((a, b) => {
    // Pinned notes first
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    // Then by date
    return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
  });

  const renderNote = ({ item }) => {
    const noteColor = getColorById(item.color);
    const isDefaultColor = item.color === 'default' || !item.color;

    return (
      <TouchableOpacity
        style={[
          styles.noteCard,
          !isDefaultColor && { borderLeftWidth: 4, borderLeftColor: noteColor }
        ]}
        onPress={() => openEditNote(item)}
        activeOpacity={0.7}
      >
        <View style={styles.noteHeader}>
          {item.isPinned && (
            <Ionicons name="pin" size={14} color="#FFD60A" style={styles.pinnedIcon} />
          )}
          <Text style={styles.noteTitle} numberOfLines={1}>
            {item.title || t.untitled || 'Sem título'}
          </Text>
        </View>
        {item.content ? (
          <Text style={styles.noteContent} numberOfLines={3}>{item.content}</Text>
        ) : null}
        <View style={styles.noteFooter}>
          <Text style={styles.noteDate}>{formatDateLocale(item.createdAt)}</Text>
          <View style={styles.noteActions}>
            <TouchableOpacity onPress={(e) => handleCopyNote(item.content || item.title, e)} style={styles.actionBtn}>
              <Ionicons name="copy-outline" size={18} color="#8E8E93" />
            </TouchableOpacity>
            <TouchableOpacity onPress={(e) => handleToggleFavorite(item.id, e)} style={styles.actionBtn}>
              <Ionicons name={item.isFavorite ? "heart" : "heart-outline"} size={18} color={item.isFavorite ? "#FF3B30" : "#8E8E93"} />
            </TouchableOpacity>
            <TouchableOpacity onPress={(e) => handleTogglePin(item.id, e)} style={styles.actionBtn}>
              <Ionicons name="pin" size={18} color={item.isPinned ? "#FFD60A" : "#8E8E93"} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDeleteNote(item.id)} style={styles.actionBtn}>
              <Ionicons name="trash-outline" size={18} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
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
              <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadNotes(); }} tintColor="#007AFF" />
            }
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={64} color="#8E8E93" />
              <Text style={styles.emptyText}>{searchQuery ? (t.noResults || 'Sem resultados') : (t.noNotes || 'Sem notas')}</Text>
              {!searchQuery && (
                <Text style={styles.emptySubtext}>{t.createFirstNote || 'Cria a tua primeira nota'}</Text>
              )}
            </View>
          </ScrollView>
        ) : (
          <FlatList
            data={sortedNotes}
            keyExtractor={(item) => item.id}
            renderItem={renderNote}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadNotes(); }} tintColor="#007AFF" />
            }
          />
        )}

        {/* FAB */}
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
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1C1C1E', marginHorizontal: 16, marginTop: 16, marginBottom: 8, paddingHorizontal: 12, borderRadius: 12, height: 44 },
  searchInput: { flex: 1, marginLeft: 8, color: '#FFFFFF', fontSize: 16 },
  scrollView: { flex: 1 },
  listContent: { paddingHorizontal: 16, paddingBottom: 32 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 100 },
  emptyText: { color: '#8E8E93', fontSize: 16, marginTop: 16 },
  emptySubtext: { color: '#636366', fontSize: 14, marginTop: 8 },
  noteCard: { backgroundColor: '#1C1C1E', borderRadius: 12, padding: 16, marginBottom: 12 },
  noteHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  pinnedIcon: { marginRight: 6 },
  noteTitle: { flex: 1, color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  noteContent: { color: '#AEAEB2', fontSize: 14, lineHeight: 20, marginBottom: 12 },
  noteFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  noteDate: { color: '#8E8E93', fontSize: 12 },
  noteActions: { flexDirection: 'row', gap: 4 },
  actionBtn: { padding: 6 },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  modalContainer: { flex: 1, backgroundColor: '#000000' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#2C2C2E' },
  modalHeaderButton: { padding: 4 },
  modalTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
  saveText: { color: '#007AFF', fontSize: 17, fontWeight: '600' },
  modalBody: { flex: 1, padding: 16 },
  titleInput: { backgroundColor: '#1C1C1E', borderRadius: 12, padding: 16, color: '#FFFFFF', fontSize: 18, fontWeight: '600', marginBottom: 16 },
  contentInput: { backgroundColor: '#1C1C1E', borderRadius: 12, padding: 16, color: '#FFFFFF', fontSize: 16, minHeight: 200, marginBottom: 16 },
  colorLabel: { color: '#8E8E93', fontSize: 14, textTransform: 'uppercase', marginBottom: 12 },
  colorPicker: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  colorOption: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  colorOptionSelected: { borderColor: '#FFFFFF' },
});
