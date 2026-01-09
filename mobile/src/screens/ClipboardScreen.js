import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Alert, RefreshControl, ScrollView, FlatList, AppState, Modal, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import Toast from 'react-native-toast-message';
import { supabase, generateId } from '../lib/supabase';
import { translations } from '../lib/i18n';
import CustomHeader from '../components/CustomHeader';

// Helper function to format date according to user's system locale (with year)
const formatDateLocale = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
};

export default function ClipboardScreen({ language, userId, refreshKey, triggerRefresh }) {
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
  const savedClipboardContents = useRef(new Set()); // Track all saved contents
  const appState = useRef(AppState.currentState);
  const clipboardCheckInterval = useRef(null);
  const smartClipboardActiveRef = useRef(false);
  const foldersRef = useRef([]);
  
  // Keep refs in sync with state
  useEffect(() => {
    smartClipboardActiveRef.current = smartClipboardActive;
  }, [smartClipboardActive]);
  
  useEffect(() => {
    foldersRef.current = folders;
  }, [folders]);
  
  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [editFolderId, setEditFolderId] = useState(null);
  const [showFolderPicker, setShowFolderPicker] = useState(false);
  
  // Folder management modal state
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [editingFolder, setEditingFolder] = useState(null);
  const [folderName, setFolderName] = useState('');
  const [creatingFolderFromPicker, setCreatingFolderFromPicker] = useState(false);
  
  // Smart Clipboard modal state
  const [showSmartModal, setShowSmartModal] = useState(false);

  const insets = useSafeAreaInsets();
  const t = translations[language] || translations.en;

  // Reload when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [userId])
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
      startClipboardMonitoring();
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
      if (smartClipboardActive) {
        await checkAndSaveClipboard();
      }
    }
    appState.current = nextAppState;
  };

  const startClipboardMonitoring = () => {
    stopClipboardMonitoring();
    clipboardCheckInterval.current = setInterval(async () => {
      await checkAndSaveClipboard();
    }, 1000);
  };

  const stopClipboardMonitoring = () => {
    if (clipboardCheckInterval.current) {
      clearInterval(clipboardCheckInterval.current);
      clipboardCheckInterval.current = null;
    }
  };

  const checkAndSaveClipboard = async () => {
    if (!smartClipboardActiveRef.current) return;
    
    try {
      const content = await Clipboard.getStringAsync();
      const trimmedContent = content?.trim();
      
      // Check if content exists, is different from last check, and hasn't been saved before
      if (trimmedContent && 
          trimmedContent.length > 0 && 
          trimmedContent !== lastClipboardContent.current?.trim() &&
          !savedClipboardContents.current.has(trimmedContent)) {
        
        console.log('Smart Clipboard: New content detected!', trimmedContent.substring(0, 50));
        lastClipboardContent.current = trimmedContent;
        savedClipboardContents.current.add(trimmedContent); // Mark as saved
        await autoSaveClipboard(trimmedContent);
      }
    } catch (error) {
      console.error('Error checking clipboard:', error);
    }
  };

  const autoSaveClipboard = async (content) => {
    try {
      const currentFolders = foldersRef.current;
      const defaultFolder = currentFolders.find(f => f.isDefault);
      const newNote = {
        id: generateId(),
        userId: userId,
        title: content.slice(0, 50) + (content.length > 50 ? '...' : ''),
        content: content,
        contentType: 'text',
        tags: ['auto-saved', 'smart-clipboard'],
        isFavorite: false,
        isPinned: false,
        folderId: defaultFolder?.id || null,
        createdAt: new Date().toISOString(),
      };
      
      const { error } = await supabase.from('links').insert([newNote]);
      
      if (!error) {
        setNotes(prev => [newNote, ...prev]);
        Toast.show({ 
          type: 'success', 
          text1: t.autoSaved || 'Guardado automaticamente',
          text2: content.slice(0, 40) + (content.length > 40 ? '...' : ''),
        });
      } else {
        console.error('Supabase insert error:', error);
      }
    } catch (error) {
      console.error('Error auto-saving:', error);
    }
  };

  const fetchData = async () => {
    if (!userId) return;
    try {
      const { data: foldersData } = await supabase
        .from('folders')
        .select('*')
        .eq('userId', userId)
        .eq('folderType', 'text')
        .order('createdAt', { ascending: false });
      
      const { data: notesData } = await supabase
        .from('links')
        .select('*')
        .eq('userId', userId)
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
        userId: userId,
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
      lastClipboardContent.current = newContent;
      Toast.show({ type: 'success', text1: t.saved });
      if (triggerRefresh) triggerRefresh();
    } catch (error) {
      console.error('Error adding note:', error);
      Toast.show({ type: 'error', text1: t.error });
    }
  };

  const handleCopyNote = async (content, e) => {
    if (e) e.stopPropagation();
    await Clipboard.setStringAsync(content);
    lastClipboardContent.current = content;
    Toast.show({ type: 'success', text1: t.copied });
  };

  const handleDeleteNote = (id, e) => {
    if (e) e.stopPropagation();
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

  const handleToggleFavorite = async (item, e) => {
    if (e) e.stopPropagation();
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

  const handleTogglePin = async (item, e) => {
    if (e) e.stopPropagation();
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
    setEditFolderId(item.folderId || null);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingItem(null);
    setEditContent('');
    setEditFolderId(null);
  };

  const handleSaveEdit = async () => {
    if (!editingItem || !editContent.trim()) return;
    try {
      const updateData = { 
        content: editContent,
        title: editContent.slice(0, 50) + (editContent.length > 50 ? '...' : ''),
        folderId: editFolderId,
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
  const openFolderModal = (folder = null, fromPicker = false) => {
    setEditingFolder(folder);
    setFolderName(folder ? folder.name : '');
    setCreatingFolderFromPicker(fromPicker);
    setShowFolderModal(true);
  };

  const closeFolderModal = () => {
    setShowFolderModal(false);
    setEditingFolder(null);
    setFolderName('');
    setCreatingFolderFromPicker(false);
  };

  const handleSaveFolder = async () => {
    if (!folderName.trim()) {
      Toast.show({ type: 'error', text1: t.error || 'Nome obrigatório' });
      return;
    }
    try {
      if (editingFolder) {
        await supabase.from('folders').update({ name: folderName }).eq('id', editingFolder.id);
        setFolders(folders.map(f => f.id === editingFolder.id ? { ...f, name: folderName } : f));
        Toast.show({ type: 'success', text1: t.saved || 'Guardado' });
      } else {
        const newFolder = {
          id: generateId(),
          userId: userId,
          name: folderName,
          icon: '📁',
          isDefault: false,
          folderType: 'text',
          createdAt: new Date().toISOString(),
        };
        const { error } = await supabase.from('folders').insert([newFolder]);
        if (error) throw error;
        setFolders([...folders, newFolder]);
        
        // Se estamos a criar pasta a partir do picker, seleciona automaticamente
        if (creatingFolderFromPicker) {
          setEditFolderId(newFolder.id);
          Toast.show({ type: 'success', text1: t.folderCreatedAndSelected || 'Pasta criada e selecionada' });
        } else {
          Toast.show({ type: 'success', text1: t.folderCreated || 'Pasta criada' });
        }
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
              await supabase.from('links').update({ folderId: null }).eq('folderId', folder.id);
              await supabase.from('folders').delete().eq('id', folder.id);
              setFolders(folders.filter(f => f.id !== folder.id));
              if (selectedFolder === folder.id) setSelectedFolder('all');
              Toast.show({ type: 'success', text1: t.deleted || 'Eliminado' });
              fetchData();
            } catch (error) {
              console.error('Error deleting folder:', error);
            }
          },
        },
      ]
    );
  };

  const activateSmartClipboard = async () => {
    try {
      const currentContent = await Clipboard.getStringAsync();
      lastClipboardContent.current = currentContent || '';
      // Initialize saved contents with current clipboard (don't save what's already there)
      savedClipboardContents.current = new Set();
      if (currentContent?.trim()) {
        savedClipboardContents.current.add(currentContent.trim());
      }
    } catch (e) {
      lastClipboardContent.current = '';
      savedClipboardContents.current = new Set();
    }
    
    setSmartClipboardActive(true);
    setTimeLeft(120);
    Toast.show({ 
      type: 'success', 
      text1: t.smartClipboardActivated || 'Captura Inteligente Ativada',
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
    return (
      <View style={styles.noteCard}>
        {/* Main content area - opens edit modal */}
        <TouchableOpacity 
          style={styles.noteMainContent} 
          onPress={() => openEditModal(item)}
          activeOpacity={0.7}
        >
          <Text style={styles.noteText} numberOfLines={2}>{item.content || ''}</Text>
        </TouchableOpacity>
        
        {/* Action buttons - Order: Copy, Heart, Pin, Trash */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.actionBtn} 
            onPress={(e) => handleCopyNote(item.content || '', e)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="copy-outline" size={20} color="#8E8E93" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionBtn} 
            onPress={(e) => handleToggleFavorite(item, e)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons 
              name={item.isFavorite ? "heart" : "heart-outline"} 
              size={20} 
              color={item.isFavorite ? "#FF3B30" : "#8E8E93"} 
            />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionBtn} 
            onPress={(e) => handleTogglePin(item, e)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons 
              name="pin" 
              size={20} 
              color={item.isPinned ? "#FFD60A" : "#8E8E93"} 
            />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionBtn} 
            onPress={(e) => handleDeleteNote(item.id, e)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
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
            keyboardShouldPersistTaps="handled"
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
            <ScrollView style={styles.modalBody} contentContainerStyle={styles.modalBodyContent}>
              <TextInput
                style={styles.editInput}
                value={editContent}
                onChangeText={setEditContent}
                multiline
                textAlignVertical="top"
                placeholder={t.clipboardPlaceholder || 'Escreve aqui...'}
                placeholderTextColor="#8E8E93"
              />
              <Text style={styles.inputLabel}>{t.moveToFolder || 'Mover para:'}</Text>
              <TouchableOpacity style={styles.pickerButton} onPress={() => setShowFolderPicker(true)}>
                <Ionicons name="folder-outline" size={20} color="#007AFF" />
                <Text style={styles.pickerButtonText}>
                  {editFolderId 
                    ? (folders.find(f => f.id === editFolderId)?.name || t.allClipboards || 'Todos')
                    : (t.allClipboards || 'Todos')}
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
              </TouchableOpacity>
            </ScrollView>
          </View>
        </Modal>

        {/* Folder Picker Modal */}
        <Modal
          visible={showFolderPicker}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowFolderPicker(false)}
        >
          <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); setShowFolderPicker(false); }}>
            <View style={styles.folderPickerOverlay}>
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.folderPickerContent}>
                  <View style={styles.folderPickerHeader}>
                    <Text style={styles.folderPickerTitle}>{t.selectFolder || 'Escolher pasta'}</Text>
                    <TouchableOpacity onPress={() => setShowFolderPicker(false)}>
                      <Ionicons name="close" size={28} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                  <ScrollView keyboardShouldPersistTaps="handled">
                    {/* Create New Folder Option */}
                    <TouchableOpacity 
                      style={styles.createFolderOption} 
                      onPress={() => { setShowFolderPicker(false); openFolderModal(null, true); }}
                    >
                      <View style={styles.createFolderIcon}>
                        <Ionicons name="add" size={24} color="#007AFF" />
                      </View>
                      <Text style={styles.createFolderText}>{t.createNewFolder || 'Criar nova pasta'}</Text>
                    </TouchableOpacity>
                    
                    <View style={styles.folderDivider} />
                    
                    <TouchableOpacity 
                      style={[styles.folderOption, !editFolderId && styles.folderOptionActive]} 
                      onPress={() => { setEditFolderId(null); setShowFolderPicker(false); }}
                    >
                      <Text style={styles.folderOptionIcon}>📋</Text>
                      <Text style={styles.folderOptionName}>{t.allClipboards || 'Todos'}</Text>
                      {!editFolderId && <Ionicons name="checkmark" size={24} color="#007AFF" />}
                    </TouchableOpacity>
                    {folders.filter(f => !f.isDefault).map((folder) => (
                      <TouchableOpacity 
                        key={folder.id} 
                        style={[styles.folderOption, editFolderId === folder.id && styles.folderOptionActive]} 
                        onPress={() => { setEditFolderId(folder.id); setShowFolderPicker(false); }}
                      >
                        <Text style={styles.folderOptionIcon}>{folder.icon || '📁'}</Text>
                        <Text style={styles.folderOptionName}>{folder.name}</Text>
                        {editFolderId === folder.id && <Ionicons name="checkmark" size={24} color="#007AFF" />}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Folder Management Modal */}
        <Modal
          visible={showFolderModal}
          animationType="slide"
          transparent={true}
          onRequestClose={closeFolderModal}
        >
          <TouchableWithoutFeedback onPress={closeFolderModal}>
            <View style={styles.folderModalOverlay}>
              <TouchableWithoutFeedback onPress={() => {}}>
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
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Smart Clipboard Modal */}
        <Modal
          visible={showSmartModal}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setShowSmartModal(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowSmartModal(false)}>
            <View style={styles.smartModalOverlay}>
              <TouchableWithoutFeedback onPress={() => {}}>
                <View style={styles.smartModalContent}>
                  <View style={styles.smartModalHeader}>
                    <View style={styles.smartModalTitleRow}>
                      <Ionicons name="flash" size={24} color="#007AFF" />
                      <Text style={styles.smartModalTitle}>{t.smartClipboard || 'Área Inteligente'}</Text>
                    </View>
                    <TouchableOpacity onPress={() => setShowSmartModal(false)}>
                      <Ionicons name="close" size={28} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                  
                  <Text style={styles.smartModalInfo}>
                    {t.smartClipboardInfo || 'Guarda automaticamente tudo o que copiares enquanto estiver ativo.'}
                  </Text>
                  
                  {smartClipboardActive && (
                    <View style={styles.smartModalTimer}>
                      <Ionicons name="time-outline" size={20} color="#34C759" />
                      <Text style={styles.smartModalTimerText}>
                        {formatTime(timeLeft)} {t.timeRemaining || 'restantes'}
                      </Text>
                    </View>
                  )}
                  
                  <TouchableOpacity 
                    style={[styles.smartModalButton, smartClipboardActive && styles.smartModalButtonStop]} 
                    onPress={() => {
                      if (smartClipboardActive) {
                        deactivateSmartClipboard();
                      } else {
                        activateSmartClipboard();
                      }
                      setShowSmartModal(false);
                    }}
                  >
                    <Ionicons 
                      name={smartClipboardActive ? "stop-circle" : "play-circle"} 
                      size={24} 
                      color="#FFFFFF" 
                    />
                    <Text style={styles.smartModalButtonText}>
                      {smartClipboardActive ? (t.deactivate || 'Desativar') : (t.activate || 'Ativar')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>
    </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#000000' },
  container: { flex: 1, backgroundColor: '#000000' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1C1C1E', marginHorizontal: 16, marginTop: 16, marginBottom: 12, paddingHorizontal: 12, borderRadius: 12, height: 44 },
  searchInput: { flex: 1, marginLeft: 8, color: '#FFFFFF', fontSize: 16 },
  addContainer: { backgroundColor: '#1C1C1E', marginHorizontal: 16, marginBottom: 12, borderRadius: 16, padding: 12 },
  addInput: { color: '#FFFFFF', fontSize: 16, minHeight: 60, textAlignVertical: 'top' },
  addActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  saveButton: { backgroundColor: '#007AFF', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, gap: 4 },
  saveButtonDisabled: { opacity: 0.5 },
  saveButtonText: { color: '#FFFFFF', fontWeight: '600' },
  folderSection: { marginHorizontal: 16, marginBottom: 12 },
  folderSectionTitle: { color: '#8E8E93', fontSize: 13, fontWeight: '600', textTransform: 'uppercase', marginBottom: 8 },
  folderList: { maxHeight: 50 },
  folderListContent: { paddingRight: 16, alignItems: 'center' },
  folderChip: { backgroundColor: '#2C2C2E', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginRight: 10, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#3A3A3C' },
  folderChipActive: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  folderChipText: { color: '#FFFFFF', fontSize: 14, fontWeight: '500' },
  folderChipTextActive: { color: '#FFFFFF' },
  addFolderChip: { backgroundColor: '#2C2C2E', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#3A3A3C' },
  listContent: { padding: 16, paddingTop: 8, paddingBottom: 100 },
  // Note card with separate touch zones - compact
  noteCard: { backgroundColor: '#1C1C1E', borderRadius: 12, marginBottom: 8, flexDirection: 'row', overflow: 'hidden' },
  noteMainContent: { flex: 1, padding: 10 },
  noteText: { color: '#FFFFFF', fontSize: 14, lineHeight: 20 },
  noteMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' },
  dateText: { color: '#8E8E93', fontSize: 11 },
  // Actions column - separate touch zone
  actionButtons: { justifyContent: 'center', alignItems: 'center', gap: 4, paddingHorizontal: 6, backgroundColor: '#1C1C1E', borderLeftWidth: 1, borderLeftColor: '#2C2C2E' },
  actionBtn: { padding: 4 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyText: { color: '#8E8E93', fontSize: 16, marginTop: 16 },
  // Modal styles
  modalContainer: { flex: 1, backgroundColor: '#000000' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#2C2C2E', minHeight: 56 },
  modalHeaderButton: { padding: 4, minWidth: 60 },
  modalTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
  saveText: { color: '#007AFF', fontSize: 17, fontWeight: '600', textAlign: 'right' },
  modalBody: { flex: 1 },
  modalBodyContent: { padding: 16, paddingBottom: 40 },
  editInput: { backgroundColor: '#1C1C1E', borderRadius: 12, padding: 16, color: '#FFFFFF', fontSize: 16, minHeight: 150, textAlignVertical: 'top', marginBottom: 20 },
  inputLabel: { color: '#8E8E93', fontSize: 14, marginBottom: 8, textTransform: 'uppercase' },
  pickerButton: { backgroundColor: '#1C1C1E', borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  pickerButtonText: { flex: 1, color: '#FFFFFF', fontSize: 16 },
  // Folder Picker Modal
  folderPickerOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.8)', justifyContent: 'flex-end' },
  folderPickerContent: { backgroundColor: '#1C1C1E', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '60%', paddingBottom: 40 },
  folderPickerHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#2C2C2E' },
  folderPickerTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
  createFolderOption: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: 'rgba(0, 122, 255, 0.1)' },
  createFolderIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0, 122, 255, 0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  createFolderText: { color: '#007AFF', fontSize: 16, fontWeight: '600' },
  folderDivider: { height: 1, backgroundColor: '#2C2C2E', marginVertical: 8 },
  folderOption: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#2C2C2E' },
  folderOptionActive: { backgroundColor: 'rgba(0, 122, 255, 0.1)' },
  folderOptionIcon: { fontSize: 24, marginRight: 12 },
  folderOptionName: { flex: 1, color: '#FFFFFF', fontSize: 16 },
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
  // Smart Clipboard Modal
  smartModalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.8)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  smartModalContent: { backgroundColor: '#1C1C1E', borderRadius: 20, width: '100%', maxWidth: 400, padding: 24 },
  smartModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  smartModalTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  smartModalTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
  smartModalInfo: { color: '#8E8E93', fontSize: 14, lineHeight: 20, marginBottom: 20 },
  smartModalTimer: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(52, 199, 89, 0.15)', padding: 12, borderRadius: 12, marginBottom: 20 },
  smartModalTimerText: { color: '#34C759', fontSize: 16, fontWeight: '600' },
  smartModalButton: { backgroundColor: '#007AFF', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 16, borderRadius: 12 },
  smartModalButtonStop: { backgroundColor: '#FF3B30' },
  smartModalButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
});
