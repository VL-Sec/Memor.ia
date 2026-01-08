import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Alert, RefreshControl, ScrollView, FlatList, AppState, Modal } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import Toast from 'react-native-toast-message';
import { supabase, generateId } from '../lib/supabase';
import { translations } from '../lib/i18n';
import CustomHeader from '../components/CustomHeader';

const DEMO_USER = 'demo_user';

export default function ClipboardScreen({ language, refreshKey, triggerRefresh }) {
  const [notes, setNotes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [newContent, setNewContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [smartClipboardActive, setSmartClipboardActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const lastClipboardContent = useRef('');
  const appState = useRef(AppState.currentState);
  const clipboardCheckInterval = useRef(null);
  
  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editContent, setEditContent] = useState('');
  
  // Folder management modal state
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [editingFolder, setEditingFolder] = useState(null);
  const [folderName, setFolderName] = useState('');
  
  // Smart Clipboard modal state
  const [showSmartModal, setShowSmartModal] = useState(false);

  const insets = useSafeAreaInsets();
  const t = translations[language] || translations.en;

  // Reload when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  // Also reload when refreshKey changes
  useEffect(() => {
    if (refreshKey > 0) {
      fetchData();
    }
  }, [refreshKey]);

  // Smart Clipboard Timer
  useEffect(() => {
    let timer;
    if (smartClipboardActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            deactivateSmartClipboard();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [smartClipboardActive, timeLeft]);

  // Smart Clipboard - Monitor clipboard when active
  useEffect(() => {
    if (smartClipboardActive) {
      // Start monitoring clipboard
      startClipboardMonitoring();
      
      // Monitor app state changes
      const subscription = AppState.addEventListener('change', handleAppStateChange);
      
      return () => {
        stopClipboardMonitoring();
        subscription?.remove();
      };
    } else {
      stopClipboardMonitoring();
    }
  }, [smartClipboardActive]);

  const handleAppStateChange = async (nextAppState) => {
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      // App came to foreground - check clipboard immediately
      if (smartClipboardActive) {
        await checkAndSaveClipboard();
      }
    }
    appState.current = nextAppState;
  };

  const startClipboardMonitoring = () => {
    // Clear any existing interval
    stopClipboardMonitoring();
    
    // Check clipboard every 1.5 seconds
    clipboardCheckInterval.current = setInterval(async () => {
      await checkAndSaveClipboard();
    }, 1500);
  };

  const stopClipboardMonitoring = () => {
    if (clipboardCheckInterval.current) {
      clearInterval(clipboardCheckInterval.current);
      clipboardCheckInterval.current = null;
    }
  };

  const checkAndSaveClipboard = async () => {
    if (!smartClipboardActive) return;
    
    try {
      const content = await Clipboard.getStringAsync();
      
      // Only save if content is different and not empty
      if (content && 
          content.trim().length > 0 && 
          content !== lastClipboardContent.current) {
        
        // Update last content immediately to prevent duplicates
        lastClipboardContent.current = content;
        
        // Save to database
        await autoSaveClipboard(content);
      }
    } catch (error) {
      console.error('Error checking clipboard:', error);
    }
  };

  const autoSaveClipboard = async (content) => {
    try {
      const defaultFolder = folders.find(f => f.isDefault);
      const newNote = {
        id: generateId(),
        userId: DEMO_USER,
        title: content.slice(0, 50) + (content.length > 50 ? '...' : ''),
        content: content,
        contentType: 'text',
        tags: ['auto-saved'],
        isFavorite: false,
        isPinned: false,
        folderId: defaultFolder?.id,
        createdAt: new Date().toISOString(),
      };
      
      const { error } = await supabase.from('links').insert([newNote]);
      
      if (!error) {
        // Add to local state immediately
        setNotes(prev => [newNote, ...prev]);
        Toast.show({ 
          type: 'success', 
          text1: t.autoSaved || 'Guardado automaticamente',
        });
      }
    } catch (error) {
      console.error('Error auto-saving:', error);
    }
  };

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
        isPinned: false,
        folderId: selectedFolder !== 'all' ? selectedFolder : defaultFolder?.id,
        createdAt: new Date().toISOString(),
      };
      const { error } = await supabase.from('links').insert([newNote]);
      if (error) throw error;
      setNotes([newNote, ...notes]);
      setNewContent('');
      // Update last clipboard content to prevent auto-save of what we just added
      lastClipboardContent.current = newContent;
      Toast.show({ type: 'success', text1: t.saved });
      if (triggerRefresh) triggerRefresh();
    } catch (error) {
      console.error('Error adding note:', error);
      Toast.show({ type: 'error', text1: t.error });
    }
  };

  const handleCopyNote = async (content) => {
    await Clipboard.setStringAsync(content);
    // Update last content to prevent re-saving what we just copied
    lastClipboardContent.current = content;
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
            if (triggerRefresh) triggerRefresh();
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
      if (triggerRefresh) triggerRefresh();
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleTogglePin = async (item) => {
    try {
      const newValue = !item.isPinned;
      await supabase.from('links').update({ isPinned: newValue }).eq('id', item.id);
      setNotes(notes.map(n => n.id === item.id ? { ...n, isPinned: newValue } : n));
      Toast.show({ 
        type: 'success', 
        text1: newValue ? (t.pinned || 'Fixado no topo') : (t.unpinned || 'Desafixado') 
      });
    } catch (error) {
      console.error('Error toggling pin:', error);
    }
  };

  // Edit functions
  const openEditModal = (item) => {
    setEditingItem(item);
    setEditContent(item.content || '');
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingItem(null);
    setEditContent('');
  };

  const handleSaveEdit = async () => {
    if (!editingItem || !editContent.trim()) return;
    try {
      const updateData = { 
        content: editContent,
        title: editContent.slice(0, 50) + (editContent.length > 50 ? '...' : ''),
      };
      await supabase.from('links').update(updateData).eq('id', editingItem.id);
      setNotes(notes.map(n => n.id === editingItem.id ? { ...n, ...updateData } : n));
      Toast.show({ type: 'success', text1: t.saved });
      closeEditModal();
      if (triggerRefresh) triggerRefresh();
    } catch (error) {
      console.error('Error saving edit:', error);
      Toast.show({ type: 'error', text1: t.error });
    }
  };

  // Folder management functions
  const openFolderModal = (folder = null) => {
    setEditingFolder(folder);
    setFolderName(folder ? folder.name : '');
    setShowFolderModal(true);
  };

  const closeFolderModal = () => {
    setShowFolderModal(false);
    setEditingFolder(null);
    setFolderName('');
  };

  const handleSaveFolder = async () => {
    if (!folderName.trim()) {
      Toast.show({ type: 'error', text1: t.error || 'Nome obrigatório' });
      return;
    }
    try {
      if (editingFolder) {
        // Update existing folder
        await supabase.from('folders').update({ name: folderName }).eq('id', editingFolder.id);
        setFolders(folders.map(f => f.id === editingFolder.id ? { ...f, name: folderName } : f));
        Toast.show({ type: 'success', text1: t.saved || 'Guardado' });
      } else {
        // Create new folder
        const newFolder = {
          id: generateId(),
          userId: DEMO_USER,
          name: folderName,
          icon: '📁',
          isDefault: false,
          folderType: 'text',
          createdAt: new Date().toISOString(),
        };
        const { error } = await supabase.from('folders').insert([newFolder]);
        if (error) throw error;
        setFolders([...folders, newFolder]);
        Toast.show({ type: 'success', text1: t.folderCreated || 'Pasta criada' });
      }
      closeFolderModal();
    } catch (error) {
      console.error('Error saving folder:', error);
      Toast.show({ type: 'error', text1: t.error || 'Erro' });
    }
  };

  const handleDeleteFolder = (folder) => {
    Alert.alert(
      t.deleteFolder || 'Eliminar pasta',
      t.deleteFolderConfirmSimple || 'Tens a certeza que queres eliminar esta pasta?',
      [
        { text: t.cancel || 'Cancelar', style: 'cancel' },
        {
          text: t.delete || 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              // Set folderId to null for items in this folder
              await supabase.from('links').update({ folderId: null }).eq('folderId', folder.id);
              // Delete folder
              await supabase.from('folders').delete().eq('id', folder.id);
              setFolders(folders.filter(f => f.id !== folder.id));
              if (selectedFolder === folder.id) setSelectedFolder('all');
              Toast.show({ type: 'success', text1: t.deleted || 'Eliminado' });
              fetchData(); // Refresh to get updated items
            } catch (error) {
              console.error('Error deleting folder:', error);
            }
          },
        },
      ]
    );
  };

  const activateSmartClipboard = async () => {
    // Get current clipboard content so we don't save it immediately
    try {
      const currentContent = await Clipboard.getStringAsync();
      lastClipboardContent.current = currentContent || '';
    } catch (e) {
      lastClipboardContent.current = '';
    }
    
    setSmartClipboardActive(true);
    setTimeLeft(120); // 2 minutes
    Toast.show({ 
      type: 'success', 
      text1: t.smartClipboardActivated || 'Área Inteligente Ativada',
      text2: t.smartClipboardInfo2 || 'A capturar tudo o que copias durante 2 minutos'
    });
  };

  const deactivateSmartClipboard = () => {
    setSmartClipboardActive(false);
    setTimeLeft(0);
    stopClipboardMonitoring();
    Toast.show({ 
      type: 'info', 
      text1: t.smartClipboardDeactivated || 'Área Inteligente Desativada'
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredNotes = notes.filter(note => {
    const matchesFolder = selectedFolder === 'all' || note.folderId === selectedFolder;
    const matchesSearch = !searchQuery || note.content?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const renderNoteItem = ({ item }) => {
    const folder = folders.find(f => f.id === item.folderId);
    return (
      <TouchableOpacity style={styles.noteCard} onPress={() => openEditModal(item)}>
        <View style={styles.noteContent}>
          <Text style={styles.noteText} numberOfLines={3}>{item.content || ''}</Text>
          <View style={styles.noteMeta}>
            <View style={styles.folderBadge}>
              <Text style={styles.folderBadgeText}>
                {folder?.isDefault ? t.generalFolder : folder?.name || t.generalFolder}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => handleTogglePin(item)}>
            <Ionicons 
              name="pin" 
              size={20} 
              color={item.isPinned ? "#FFD60A" : "#8E8E93"} 
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => handleToggleFavorite(item)}>
            <Ionicons 
              name={item.isFavorite ? "heart" : "heart-outline"} 
              size={20} 
              color={item.isFavorite ? "#FF3B30" : "#8E8E93"} 
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => handleCopyNote(item.content || '')}>
            <Ionicons name="copy-outline" size={20} color="#8E8E93" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => handleDeleteNote(item.id)}>
            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <CustomHeader 
        title={t.tabClipboard || 'Área de Transferência'} 
        rightIcon={smartClipboardActive ? "flash" : "flash-outline"}
        rightIconColor={smartClipboardActive ? "#34C759" : "#8E8E93"}
        onRightIconPress={() => setShowSmartModal(true)}
      />
      <View style={styles.container}>
        {/* 1. Search - First */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#8E8E93" />
          <TextInput 
            style={styles.searchInput} 
            placeholder={t.search || 'Pesquisar...'} 
            placeholderTextColor="#8E8E93" 
            value={searchQuery} 
            onChangeText={setSearchQuery} 
          />
        </View>

        {/* 2. Add new content */}
        <View style={styles.addContainer}>
          <TextInput 
            style={styles.addInput} 
            placeholder={t.clipboardPlaceholder || 'Cola o texto aqui...'} 
            placeholderTextColor="#8E8E93" 
            value={newContent} 
            onChangeText={setNewContent} 
            multiline 
          />
          <View style={styles.addActions}>
            <View />
            <TouchableOpacity 
              style={[styles.saveButton, !newContent.trim() && styles.saveButtonDisabled]} 
              onPress={handleAddNote} 
              disabled={!newContent.trim()}
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>{t.save || 'Guardar'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. Folder section with title */}
        <View style={styles.folderSection}>
          <Text style={styles.folderSectionTitle}>{t.folders || 'Pastas'}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.folderList} contentContainerStyle={styles.folderListContent}>
            <TouchableOpacity 
              style={[styles.folderChip, selectedFolder === 'all' && styles.folderChipActive]} 
              onPress={() => setSelectedFolder('all')}
            >
              <Text style={[styles.folderChipText, selectedFolder === 'all' && styles.folderChipTextActive]}>
                {t.allClipboards || 'Todos'}
              </Text>
            </TouchableOpacity>
            {folders.filter(folder => !folder.isDefault).map(folder => (
              <TouchableOpacity 
                key={folder.id} 
                style={[styles.folderChip, selectedFolder === folder.id && styles.folderChipActive]} 
                onPress={() => setSelectedFolder(folder.id)}
                onLongPress={() => openFolderModal(folder)}
              >
                <Text style={[styles.folderChipText, selectedFolder === folder.id && styles.folderChipTextActive]}>
                  {folder.name}
                </Text>
                {selectedFolder === folder.id && (
                  <TouchableOpacity 
                    style={styles.folderDeleteBtn} 
                    onPress={() => handleDeleteFolder(folder)}
                  >
                    <Ionicons name="close-circle" size={16} color="#FF3B30" />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.addFolderChip} onPress={() => openFolderModal()}>
              <Ionicons name="add" size={20} color="#007AFF" />
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* 5. Notes list */}
        {sortedNotes.length === 0 ? (
          <ScrollView 
            style={{ flex: 1 }} 
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={() => { setRefreshing(true); fetchData(); }} 
                tintColor="#007AFF" 
              />
            }
          >
            <View style={styles.emptyState}>
              <Ionicons name="clipboard-outline" size={64} color="#8E8E93" />
              <Text style={styles.emptyText}>{t.noClipboardItems || 'Sem itens'}</Text>
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
                onRefresh={() => { setRefreshing(true); fetchData(); }} 
                tintColor="#007AFF" 
              />
            } 
          />
        )}

        {/* Edit Modal */}
        <Modal
          visible={showEditModal}
          animationType="slide"
          transparent={false}
          onRequestClose={closeEditModal}
        >
          <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={closeEditModal} style={styles.modalHeaderButton}>
                <Ionicons name="close" size={28} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{t.edit || 'Editar'}</Text>
              <TouchableOpacity onPress={handleSaveEdit} style={styles.modalHeaderButton}>
                <Text style={styles.saveText}>{t.save || 'Guardar'}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <TextInput
                style={styles.editInput}
                value={editContent}
                onChangeText={setEditContent}
                multiline
                textAlignVertical="top"
                autoFocus
              />
            </View>
          </View>
        </Modal>

        {/* Folder Management Modal */}
        <Modal
          visible={showFolderModal}
          animationType="slide"
          transparent={true}
          onRequestClose={closeFolderModal}
        >
          <View style={styles.folderModalOverlay}>
            <View style={styles.folderModalContent}>
              <View style={styles.folderModalHeader}>
                <Text style={styles.folderModalTitle}>
                  {editingFolder ? (t.editFolder || 'Editar Pasta') : (t.newFolder || 'Nova Pasta')}
                </Text>
                <TouchableOpacity onPress={closeFolderModal}>
                  <Ionicons name="close" size={28} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.folderNameInput}
                placeholder={t.folderNamePlaceholder || 'Nome da pasta'}
                placeholderTextColor="#8E8E93"
                value={folderName}
                onChangeText={setFolderName}
                autoFocus
              />
              <View style={styles.folderModalActions}>
                {editingFolder && !editingFolder.isDefault && (
                  <TouchableOpacity 
                    style={styles.deleteFolderBtn} 
                    onPress={() => { closeFolderModal(); handleDeleteFolder(editingFolder); }}
                  >
                    <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                    <Text style={styles.deleteFolderText}>{t.delete || 'Eliminar'}</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.saveFolderBtn} onPress={handleSaveFolder}>
                  <Text style={styles.saveFolderText}>{t.save || 'Guardar'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#000000' },
  container: { flex: 1, backgroundColor: '#000000' },
  // Search - First
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1C1C1E', marginHorizontal: 16, marginTop: 16, marginBottom: 12, paddingHorizontal: 12, borderRadius: 12, height: 44 },
  searchInput: { flex: 1, marginLeft: 8, color: '#FFFFFF', fontSize: 16 },
  // Smart Clipboard - Second
  smartClipboard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1C1C1E', marginHorizontal: 16, marginBottom: 12, borderRadius: 16, padding: 12, borderWidth: 1, borderColor: '#2C2C2E' },
  smartClipboardActive: { backgroundColor: 'rgba(0, 122, 255, 0.15)', borderColor: '#007AFF' },
  smartClipboardIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0, 122, 255, 0.2)', justifyContent: 'center', alignItems: 'center' },
  smartClipboardIconActive: { backgroundColor: '#007AFF' },
  smartClipboardContent: { flex: 1, marginLeft: 12 },
  smartClipboardTitle: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
  smartClipboardInfo: { color: '#8E8E93', fontSize: 12, marginTop: 2 },
  smartClipboardButton: { backgroundColor: '#007AFF', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14 },
  smartClipboardButtonStop: { backgroundColor: '#FF3B30' },
  smartClipboardButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  // Add container - Third
  addContainer: { backgroundColor: '#1C1C1E', marginHorizontal: 16, marginBottom: 12, borderRadius: 16, padding: 12 },
  addInput: { color: '#FFFFFF', fontSize: 16, minHeight: 60, textAlignVertical: 'top' },
  addActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  saveButton: { backgroundColor: '#007AFF', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, gap: 4 },
  saveButtonDisabled: { opacity: 0.5 },
  saveButtonText: { color: '#FFFFFF', fontWeight: '600' },
  // Folder section with title
  folderSection: { marginHorizontal: 16, marginBottom: 12 },
  folderSectionTitle: { color: '#8E8E93', fontSize: 13, fontWeight: '600', textTransform: 'uppercase', marginBottom: 8 },
  folderList: { maxHeight: 50 },
  folderListContent: { paddingRight: 16, alignItems: 'center' },
  folderChip: { backgroundColor: '#2C2C2E', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginRight: 10, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#3A3A3C' },
  folderChipActive: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  folderChipText: { color: '#FFFFFF', fontSize: 14, fontWeight: '500' },
  folderChipTextActive: { color: '#FFFFFF' },
  addFolderChip: { backgroundColor: '#2C2C2E', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#3A3A3C' },
  // List
  listContent: { padding: 16, paddingTop: 8, paddingBottom: 100 },
  noteCard: { backgroundColor: '#1C1C1E', borderRadius: 16, marginBottom: 12, padding: 12, flexDirection: 'row' },
  noteContent: { flex: 1 },
  noteText: { color: '#FFFFFF', fontSize: 15, lineHeight: 22, marginBottom: 8 },
  noteMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  folderBadge: { backgroundColor: 'rgba(0, 122, 255, 0.2)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  folderBadgeText: { color: '#007AFF', fontSize: 11 },
  actionButtons: { justifyContent: 'center', alignItems: 'center', gap: 8, marginLeft: 8 },
  actionBtn: { padding: 6 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyText: { color: '#8E8E93', fontSize: 16, marginTop: 16 },
  // Modal styles with proper safe area
  modalContainer: { flex: 1, backgroundColor: '#000000' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#2C2C2E', minHeight: 56 },
  modalHeaderButton: { padding: 4, minWidth: 60 },
  modalTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
  saveText: { color: '#007AFF', fontSize: 17, fontWeight: '600', textAlign: 'right' },
  modalBody: { flex: 1, padding: 16 },
  editInput: { backgroundColor: '#1C1C1E', borderRadius: 12, padding: 16, color: '#FFFFFF', fontSize: 16, flex: 1, textAlignVertical: 'top' },
  // Folder Modal
  folderModalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.8)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  folderModalContent: { backgroundColor: '#1C1C1E', borderRadius: 20, width: '100%', maxWidth: 400, padding: 20 },
  folderModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  folderModalTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
  folderNameInput: { backgroundColor: '#000000', borderRadius: 12, padding: 16, color: '#FFFFFF', fontSize: 16, marginBottom: 20 },
  folderModalActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  deleteFolderBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12 },
  deleteFolderText: { color: '#FF3B30', fontSize: 16, fontWeight: '600' },
  saveFolderBtn: { backgroundColor: '#007AFF', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, marginLeft: 'auto' },
  saveFolderText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
