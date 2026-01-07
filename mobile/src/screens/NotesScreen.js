import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, RefreshControl, Modal, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations } from '../lib/i18n';

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

const STORAGE_KEY = 'memoria-notes';

export default function NotesScreen({ language }) {
  const [notes, setNotes] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteColor, setNoteColor] = useState('default');
  const [searchQuery, setSearchQuery] = useState('');

  const t = translations[language] || translations.en;

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        setNotes(JSON.parse(data));
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const saveNotes = async (newNotes) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newNotes));
      setNotes(newNotes);
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

  const handleSaveNote = () => {
    if (!noteContent.trim()) {
      Toast.show({ type: 'error', text1: t.error });
      return;
    }

    const now = new Date().toISOString();
    
    if (editingNote) {
      const updatedNotes = notes.map(n => 
        n.id === editingNote.id 
          ? { ...n, title: noteTitle, content: noteContent, color: noteColor, updatedAt: now }
          : n
      );
      saveNotes(updatedNotes);
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
      saveNotes([newNote, ...notes]);
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
          onPress: () => {
            const filteredNotes = notes.filter(n => n.id !== noteId);
            saveNotes(filteredNotes);
            Toast.show({ type: 'success', text1: t.deleted });
          },
        },
      ]
    );
  };

  const handleTogglePin = (noteId) => {
    const updatedNotes = notes.map(n =>
      n.id === noteId ? { ...n, isPinned: !n.isPinned } : n
    );
    saveNotes(updatedNotes);
  };

  const handleToggleFavorite = (noteId) => {
    const note = notes.find(n => n.id === noteId);
    const updatedNotes = notes.map(n =>
      n.id === noteId ? { ...n, isFavorite: !n.isFavorite } : n
    );
    saveNotes(updatedNotes);
    Toast.show({ 
      type: 'success', 
      text1: note?.isFavorite ? (t.removedFromFavorites || 'Removido dos favoritos') : (t.addedToFavorites || 'Adicionado aos favoritos')
    });
  };

  const handleCopyNote = async (content) => {
    try {
      const Clipboard = require('expo-clipboard');
      await Clipboard.setStringAsync(content);
      Toast.show({ type: 'success', text1: t.copied });
    } catch (error) {
      console.error('Error copying:', error);
    }
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

  const pinnedNotes = filteredNotes.filter(n => n.isPinned);
  const otherNotes = filteredNotes.filter(n => !n.isPinned);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
  };

  const onDragEnd = useCallback(({ data }) => {
    saveNotes(data);
  }, []);

  const renderNoteItem = useCallback(({ item, drag, isActive }) => (
    <ScaleDecorator>
      <TouchableOpacity 
        style={[
          styles.noteCard, 
          { borderLeftColor: getColorById(item.color), borderLeftWidth: 4 },
          isActive && styles.noteCardDragging
        ]}
        onPress={() => openEditNote(item)}
        onLongPress={drag}
        delayLongPress={200}
      >
        <View style={styles.noteHeader}>
          {item.title ? (
            <Text style={styles.noteTitle} numberOfLines={1}>{item.title}</Text>
          ) : null}
          <View style={styles.noteIcons}>
            {item.isPinned && (
              <Ionicons name="pin" size={16} color="#FFD60A" />
            )}
            {item.isFavorite && (
              <Ionicons name="heart" size={16} color="#FF3B30" style={{ marginLeft: 4 }} />
            )}
          </View>
        </View>
        <Text style={styles.noteContent} numberOfLines={4}>{item.content}</Text>
        <View style={styles.noteFooter}>
          <Text style={styles.noteDate}>{formatDate(item.updatedAt)}</Text>
          <View style={styles.noteActions}>
            <TouchableOpacity onPress={() => handleCopyNote(item.content)} style={styles.actionButton}>
              <Ionicons name="copy-outline" size={18} color="#8E8E93" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleToggleFavorite(item.id)} style={styles.actionButton}>
              <Ionicons name={item.isFavorite ? "heart" : "heart-outline"} size={18} color={item.isFavorite ? "#FF3B30" : "#8E8E93"} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleTogglePin(item.id)} style={styles.actionButton}>
              <Ionicons name={item.isPinned ? "pin" : "pin-outline"} size={18} color={item.isPinned ? "#FFD60A" : "#8E8E93"} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDeleteNote(item.id)} style={styles.actionButton}>
              <Ionicons name="trash-outline" size={18} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </ScaleDecorator>
  ), [notes, t]);

  const allNotes = [...pinnedNotes, ...otherNotes];

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

      {/* Drag hint */}
      <Text style={styles.dragHint}>{t.dragToReorder || 'Pressione longamente para reorganizar'}</Text>

      {/* Notes List */}
      {allNotes.length === 0 ? (
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
        <DraggableFlatList
          data={allNotes}
          onDragEnd={onDragEnd}
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
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={28} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>
                {editingNote ? t.editNote : t.newNote}
              </Text>
              <TouchableOpacity onPress={handleSaveNote}>
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
  dragHint: {
    color: '#8E8E93',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 8,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  noteCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  noteCardDragging: {
    opacity: 0.9,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  noteIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  noteTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  noteContent: {
    color: '#CCCCCC',
    fontSize: 15,
    lineHeight: 22,
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
  },
  noteDate: {
    color: '#8E8E93',
    fontSize: 12,
  },
  noteActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    color: '#8E8E93',
    fontSize: 16,
    marginTop: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#000000',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  saveText: {
    color: '#007AFF',
    fontSize: 17,
    fontWeight: '600',
  },
  modalBody: {
    flex: 1,
    padding: 16,
  },
  titleInput: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  contentInput: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    minHeight: 200,
    marginBottom: 20,
  },
  colorLabel: {
    color: '#8E8E93',
    fontSize: 14,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  colorPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
});
