import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';
import * as Clipboard from 'expo-clipboard';
import Toast from 'react-native-toast-message';
import { supabase, generateId } from '../lib/supabase';
import { translations } from '../lib/i18n';

const DEMO_USER = 'demo_user';

export default function ClipboardScreen({ language }) {
  const [notes, setNotes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [newContent, setNewContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [smartClipboardActive, setSmartClipboardActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const t = translations[language] || translations.en;

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let timer;
    if (smartClipboardActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setSmartClipboardActive(false);
            Toast.show({ type: 'info', text1: t.smartClipboard, text2: 'Deactivated' });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [smartClipboardActive, timeLeft]);

  const fetchData = async () => {
    try {
      const { data: foldersData } = await supabase
        .from('folders')
        .select('*')
        .eq('userId', DEMO_USER)
        .eq('folderType', 'text')
        .order('createdAt', { ascending: false });

      const { data: notesData } = await supabase
        .from('links')
        .select('*')
        .eq('userId', DEMO_USER)
        .eq('contentType', 'text')
        .order('createdAt', { ascending: false });

      setFolders(foldersData || []);
      setNotes(notesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAddNote = async () => {
    if (!newContent.trim()) return;

    try {
      const defaultFolder = folders.find(f => f.isDefault);
      
      const newNote = {
        id: generateId(),
        userId: DEMO_USER,
        title: newContent.slice(0, 50) + (newContent.length > 50 ? '...' : ''),
        content: newContent,
        contentType: 'text',
        tags: [],
        isFavorite: false,
        folderId: selectedFolder !== 'all' ? selectedFolder : defaultFolder?.id,
        createdAt: new Date().toISOString(),
      };

      const { error } = await supabase.from('links').insert([newNote]);

      if (error) throw error;

      setNotes([newNote, ...notes]);
      setNewContent('');
      
      Toast.show({ type: 'success', text1: t.saved });
    } catch (error) {
      console.error('Error adding note:', error);
      Toast.show({ type: 'error', text1: t.error });
    }
  };

  const handleCopyNote = async (content) => {
    await Clipboard.setStringAsync(content);
    Toast.show({ type: 'success', text1: t.copied });
  };

  const handleDeleteNote = (id) => {
    Alert.alert(t.delete, '', [
      { text: t.cancel, style: 'cancel' },
      {
        text: t.delete,
        style: 'destructive',
        onPress: async () => {
          try {
            await supabase.from('links').delete().eq('id', id);
            setNotes(notes.filter(n => n.id !== id));
            Toast.show({ type: 'success', text1: t.deleted });
          } catch (error) {
            console.error('Error deleting:', error);
          }
        },
      },
    ]);
  };

  const handleToggleFavorite = async (item) => {
    try {
      const newValue = !item.isFavorite;
      await supabase.from('links').update({ isFavorite: newValue }).eq('id', item.id);
      setNotes(notes.map(n => n.id === item.id ? { ...n, isFavorite: newValue } : n));
      Toast.show({ 
        type: 'success', 
        text1: newValue ? (t.addedToFavorites || 'Adicionado aos favoritos') : (t.removedFromFavorites || 'Removido dos favoritos')
      });
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const activateSmartClipboard = () => {
    setSmartClipboardActive(true);
    setTimeLeft(120);
    Toast.show({ type: 'success', text1: t.smartClipboard, text2: t.smartClipboardActivated });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredNotes = notes.filter(note => {
    const matchesFolder = selectedFolder === 'all' || note.folderId === selectedFolder;
    const matchesSearch = !searchQuery || 
      note.content?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  const onDragEnd = useCallback(({ data }) => {
    setNotes(data);
  }, []);

  const renderNoteItem = useCallback(({ item, drag, isActive }) => {
    const folder = folders.find(f => f.id === item.folderId);
    
    return (
      <ScaleDecorator>
        <TouchableOpacity
          style={[styles.noteCard, isActive && styles.noteCardDragging]}
          onLongPress={drag}
          delayLongPress={200}
        >
          <View style={styles.noteContent}>
            <Text style={styles.noteText} numberOfLines={3}>
              {item.content}
            </Text>
            <View style={styles.noteMeta}>
              <Text style={styles.noteChars}>
                {item.content?.length || 0} {t.chars}
              </Text>
              <View style={styles.folderBadge}>
                <Text style={styles.folderBadgeText}>
                  {folder?.isDefault ? t.generalFolder : folder?.name || t.generalFolder}
                </Text>
              </View>
              {item.isFavorite && (
                <Ionicons name="heart" size={14} color="#FF3B30" style={{ marginLeft: 4 }} />
              )}
            </View>
          </View>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.favoriteButton}
              onPress={() => handleToggleFavorite(item)}
            >
              <Ionicons name={item.isFavorite ? "heart" : "heart-outline"} size={20} color={item.isFavorite ? "#FF3B30" : "#8E8E93"} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={() => handleCopyNote(item.content)}
            >
              <Ionicons name="copy" size={18} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteNote(item.id)}
            >
              <Ionicons name="trash-outline" size={18} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </ScaleDecorator>
    );
  }, [folders, notes, t]);

  return (
    <View style={styles.container}>
      {/* Add Note */}
      <View style={styles.addContainer}>
        <TextInput
          style={styles.addInput}
          placeholder={t.clipboardPlaceholder}
          placeholderTextColor="#8E8E93"
          value={newContent}
          onChangeText={setNewContent}
          multiline
        />
        <View style={styles.addActions}>
          <Text style={styles.charCount}>{newContent.length} {t.chars}</Text>
          <TouchableOpacity
            style={[styles.saveButton, !newContent.trim() && styles.saveButtonDisabled]}
            onPress={handleAddNote}
            disabled={!newContent.trim()}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>{t.save}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Smart Clipboard */}
      <TouchableOpacity
        style={[
          styles.smartClipboard,
          smartClipboardActive && styles.smartClipboardActive,
        ]}
        onPress={smartClipboardActive ? () => setSmartClipboardActive(false) : activateSmartClipboard}
      >
        <View style={styles.smartClipboardIcon}>
          <Ionicons
            name="clipboard"
            size={24}
            color={smartClipboardActive ? '#FFFFFF' : '#007AFF'}
          />
        </View>
        <View style={styles.smartClipboardContent}>
          <Text style={styles.smartClipboardTitle}>{t.smartClipboard}</Text>
          <Text style={styles.smartClipboardInfo}>
            {smartClipboardActive
              ? `${formatTime(timeLeft)} ${t.timeRemaining}`
              : t.smartClipboardInfo}
          </Text>
        </View>
        <View style={[styles.smartClipboardButton, smartClipboardActive && styles.smartClipboardButtonStop]}>
          <Text style={styles.smartClipboardButtonText}>
            {smartClipboardActive ? t.deactivate : t.activate}
          </Text>
        </View>
      </TouchableOpacity>

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
      {filteredNotes.length === 0 ? (
        <ScrollView
          style={{ flex: 1 }}
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
        >
          <View style={styles.emptyState}>
            <Ionicons name="clipboard-outline" size={64} color="#8E8E93" />
            <Text style={styles.emptyText}>{t.noClipboardItems}</Text>
          </View>
        </ScrollView>
      ) : (
        <DraggableFlatList
          data={filteredNotes}
          onDragEnd={onDragEnd}
          keyExtractor={(item) => item.id}
          renderItem={renderNoteItem}
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
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  addContainer: {
    backgroundColor: '#1C1C1E',
    margin: 16,
    borderRadius: 16,
    padding: 12,
  },
  addInput: {
    color: '#FFFFFF',
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  addActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  charCount: {
    color: '#8E8E93',
    fontSize: 12,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  smartClipboard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  smartClipboardActive: {
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
    borderColor: '#007AFF',
  },
  smartClipboardIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  smartClipboardContent: {
    flex: 1,
    marginLeft: 12,
  },
  smartClipboardTitle: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  smartClipboardInfo: {
    color: '#8E8E93',
    fontSize: 12,
  },
  smartClipboardButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  smartClipboardButtonStop: {
    backgroundColor: '#FF3B30',
  },
  smartClipboardButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    height: 40,
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
  listContent: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 100,
  },
  noteCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    marginBottom: 12,
    padding: 12,
    flexDirection: 'row',
  },
  noteCardDragging: {
    opacity: 0.9,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  noteContent: {
    flex: 1,
  },
  noteText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 8,
  },
  noteMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  noteChars: {
    color: '#8E8E93',
    fontSize: 12,
  },
  folderBadge: {
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  folderBadgeText: {
    color: '#007AFF',
    fontSize: 11,
  },
  actionButtons: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginLeft: 8,
  },
  favoriteButton: {
    padding: 6,
  },
  copyButton: {
    backgroundColor: '#007AFF',
    padding: 8,
    borderRadius: 8,
  },
  deleteButton: {
    padding: 6,
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
});
