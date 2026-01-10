import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Alert, RefreshControl, ScrollView, FlatList, Modal, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import Toast from 'react-native-toast-message';
import { supabase, generateId } from '../lib/supabase';
import { translations } from '../lib/i18n';
import CustomHeader from '../components/CustomHeader';

// ✅ MANTER: Normalizar texto (remover acentos + minúsculas) para pesquisa
const normalize = (text = '') =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

export default function ClipboardScreen({ language, userId, refreshKey, triggerRefresh }) {
  const [notes, setNotes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [newContent, setNewContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
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

  // Paste from clipboard
  const handlePasteFromClipboard = async () => {
    Keyboard.dismiss();
    try {
      const content = await Clipboard.getStringAsync();
      if (content && content.trim()) {
        setNewContent(content.trim());
        Toast.show({ type: 'success', text1: t.pasted || 'Colado do clipboard' });
      } else {
        Toast.show({ type: 'info', text1: t.clipboardEmpty || 'Clipboard vazio' });
      }
    } catch (error) {
      console.error('Error pasting:', error);
    }
  };

  const handleAddNote = async () => {
    if (!newContent.trim()) return;
    Keyboard.dismiss();
    try {
      const defaultFolder = folders.find(f => f.isDefault);
      const trimmedContent = newContent.trim();
      const newNote = {
        id: generateId(),
        userId: userId,
        title: trimmedContent.slice(0, 50) + (trimmedContent.length > 50 ? '...' : ''),
        content: trimmedContent,
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
      Toast.show({ type: 'success', text1: t.saved });
      if (triggerRefresh) triggerRefresh();
    } catch (error) {
      console.error('Error adding note:', error);
      Toast.show({ type: 'error', text1: t.error });
    }
  };

  const handleCopyNote = async (content, e) => {
    if (e) e.stopPropagation();
    Keyboard.dismiss();
    const trimmedContent = content?.trim() || '';
    await Clipboard.setStringAsync(trimmedContent);
    Toast.show({ type: 'success', text1: t.copied });
  };

  const handleToggleFavorite = async (item, e) => {
    if (e) e.stopPropagation();
    Keyboard.dismiss();
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
    Keyboard.dismiss();
    try {
      const newValue = !item.isPinned;
      await supabase.from('links').update({ isPinned: newValue }).eq('id', item.id);
      setNotes(notes.map(n => n.id === item.id ? { ...n, isPinned: newValue } : n));
      Toast.show({ 
        type: 'success', 
        text1: newValue ? (t.pinned || 'Fixado') : (t.unpinned || 'Desafixado')
      });
    } catch (error) {
      console.error('Error toggling pin:', error);
    }
  };

  const handleDeleteNote = (id, e) => {
    if (e) e.stopPropagation();
    Keyboard.dismiss();
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
            console.error('Error deleting note:', error);
          }
        },
      },
    ]);
  };

  const openEditModal = (item) => {
    Keyboard.dismiss();
    setEditingItem(item);
    setEditContent(item.content || '');
    setEditFolderId(item.folderId || null);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    Keyboard.dismiss();
    setShowEditModal(false);
    setEditingItem(null);
    setEditContent('');
    setEditFolderId(null);
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    Keyboard.dismiss();
    try {
      const updateData = {
        content: editContent,
        title: editContent.slice(0, 50) + (editContent.length > 50 ? '...' : ''),
        folderId: editFolderId,
      };
      await supabase.from('links').update(updateData).eq('id', editingItem.id);
      setNotes(notes.map(n => n.id === editingItem.id ? { ...n, ...updateData } : n));
      closeEditModal();
      Toast.show({ type: 'success', text1: t.saved });
      if (triggerRefresh) triggerRefresh();
    } catch (error) {
      console.error('Error saving edit:', error);
      Toast.show({ type: 'error', text1: t.error });
    }
  };

  // Folder management
  const openFolderModal = (folder = null, fromPicker = false) => {
    Keyboard.dismiss();
    setEditingFolder(folder);
    setFolderName(folder ? folder.name : '');
    setCreatingFolderFromPicker(fromPicker);
    setShowFolderModal(true);
  };

  const closeFolderModal = () => {
    Keyboard.dismiss();
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
    Keyboard.dismiss();
    
    const shouldSelectFolder = creatingFolderFromPicker;
    
    try {
      if (editingFolder) {
        await supabase.from('folders').update({ name: folderName }).eq('id', editingFolder.id);
        setFolders(folders.map(f => f.id === editingFolder.id ? { ...f, name: folderName } : f));
        Toast.show({ type: 'success', text1: t.saved || 'Guardado' });
        closeFolderModal();
      } else {
        const newFolder = {
          id: generateId(),
          userId: userId,
          name: folderName,
          icon: '📋',
          isDefault: false,
          folderType: 'text',
          createdAt: new Date().toISOString(),
        };
        const { error } = await supabase.from('folders').insert([newFolder]);
        if (error) throw error;
        setFolders([...folders, newFolder]);
        
        closeFolderModal();
        
        if (shouldSelectFolder) {
          setEditFolderId(newFolder.id);
          Toast.show({ type: 'success', text1: t.folderCreatedAndSelected || 'Pasta criada e selecionada' });
        } else {
          Toast.show({ type: 'success', text1: t.folderCreated || 'Pasta criada' });
        }
      }
    } catch (error) {
      console.error('Error saving folder:', error);
      Toast.show({ type: 'error', text1: t.error || 'Erro' });
    }
  };

  const handleDeleteFolder = (folder) => {
    Keyboard.dismiss();
    Alert.alert(
      t.deleteFolder || 'Eliminar pasta',
      t.deleteFolderConfirmSimple || 'Tens a certeza?',
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

  // ✅ MANTER: Filtro com normalização de acentos
  const filteredNotes = notes.filter(note => {
    const matchesFolder = selectedFolder === 'all' || note.folderId === selectedFolder;
    if (!searchQuery) return matchesFolder;
    
    const q = normalize(searchQuery);
    const matchesSearch = normalize(note.content).includes(q) || normalize(note.title).includes(q);
    return matchesFolder && matchesSearch;
  });

  // Ordenação simples: pinned no topo, depois por data
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  // Render item
  const renderNoteItem = ({ item }) => {
    return (
      <View style={styles.noteCard}>
        <TouchableOpacity 
          style={styles.noteContent}
          onPress={() => openEditModal(item)}
          activeOpacity={0.7}
        >
          <Text style={styles.noteText} numberOfLines={4} ellipsizeMode="tail">
            {item.content || ''}
          </Text>
        </TouchableOpacity>
        
        <View style={styles.noteActions}>
          <TouchableOpacity 
            style={styles.actionBtn} 
            onPress={(e) => handleCopyNote(item.content, e)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="copy-outline" size={18} color="#8E8E93" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionBtn} 
            onPress={(e) => handleToggleFavorite(item, e)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name={item.isFavorite ? 'heart' : 'heart-outline'} size={18} color={item.isFavorite ? '#FF3B30' : '#8E8E93'} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionBtn} 
            onPress={(e) => handleTogglePin(item, e)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="pin" size={18} color={item.isPinned ? '#FFD60A' : '#8E8E93'} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionBtn} 
            onPress={(e) => handleDeleteNote(item.id, e)}
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
      <CustomHeader title={t.tabClipboard || 'Clipboard'} />
      <View style={[styles.container, { paddingBottom: insets.bottom + 16 }]}>

        {/* ✅ MANTER: Search com botão ❌ */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#8E8E93" />
          <TextInput 
            style={styles.searchInput} 
            placeholder={t.search || 'Pesquisar...'} 
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

        {/* Add new content */}
        <View style={styles.addContainer}>
          <TextInput 
            style={styles.addInput} 
            placeholder={t.pasteHere || 'Colar ou escrever texto...'} 
            placeholderTextColor="#8E8E93" 
            value={newContent} 
            onChangeText={setNewContent}
            multiline
            scrollEnabled
          />
          <TouchableOpacity style={styles.pasteButton} onPress={handlePasteFromClipboard}>
            <Ionicons name="clipboard-outline" size={20} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={handleAddNote}>
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Folders */}
        <View style={styles.folderSection}>
          <Text style={styles.folderSectionTitle}>{t.folders || 'Pastas'}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.folderList} contentContainerStyle={styles.folderListContent} keyboardShouldPersistTaps="handled">
            <TouchableOpacity 
              style={[styles.folderChip, selectedFolder === 'all' && styles.folderChipActive]} 
              onPress={() => { Keyboard.dismiss(); setSelectedFolder('all'); }}
            >
              <Text style={[styles.folderChipText, selectedFolder === 'all' && styles.folderChipTextActive]}>
                {t.allClipboards || 'Todos'}
              </Text>
            </TouchableOpacity>
            {folders.filter(f => !f.isDefault).map((folder) => (
              <TouchableOpacity 
                key={folder.id} 
                style={[styles.folderChip, selectedFolder === folder.id && styles.folderChipActive]} 
                onPress={() => { Keyboard.dismiss(); setSelectedFolder(folder.id); }}
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

        {/* Notes list */}
        {sortedNotes.length === 0 ? (
          <ScrollView 
            style={{ flex: 1 }} 
            keyboardShouldPersistTaps="handled"
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor="#007AFF" />}
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
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor="#007AFF" />}
          />
        )}

        {/* Edit Modal com KeyboardAvoidingView */}
        <Modal visible={showEditModal} animationType="slide" transparent={true} onRequestClose={closeEditModal}>
          <KeyboardAvoidingView 
            style={{ flex: 1 }} 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={insets.top + 24}
          >
            <TouchableWithoutFeedback onPress={closeEditModal}>
              <View style={styles.modalOverlay}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                  <View style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}>
                    <View style={styles.modalHeader}>
                      <Text style={styles.modalTitle}>{t.editItem || 'Editar'}</Text>
                      <TouchableOpacity onPress={closeEditModal}>
                        <Ionicons name="close" size={28} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                    <ScrollView 
                      style={styles.modalBody} 
                      keyboardShouldPersistTaps="handled"
                      contentContainerStyle={{ paddingBottom: 20 }}
                    >
                      <Text style={styles.inputLabel}>{t.content || 'Conteúdo'}</Text>
                      <TextInput 
                        style={[styles.textInput, { minHeight: 150 }]} 
                        value={editContent} 
                        onChangeText={setEditContent} 
                        placeholder={t.contentPlaceholder || 'Texto...'} 
                        placeholderTextColor="#8E8E93"
                        multiline
                        textAlignVertical="top"
                      />
                      
                      <Text style={styles.inputLabel}>{t.moveToFolder || 'Pasta'}</Text>
                      <TouchableOpacity style={styles.pickerButton} onPress={() => setShowFolderPicker(true)}>
                        <Ionicons name="folder-outline" size={20} color="#007AFF" />
                        <Text style={styles.pickerButtonText}>
                          {editFolderId 
                            ? (folders.find(f => f.id === editFolderId)?.name || t.allClipboards)
                            : (t.allClipboards || 'Todos')}
                        </Text>
                        <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
                      </TouchableOpacity>
                      
                      <TouchableOpacity style={styles.saveButton} onPress={handleSaveEdit}>
                        <Text style={styles.saveButtonText}>{t.save || 'Guardar'}</Text>
                      </TouchableOpacity>
                    </ScrollView>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </Modal>

        {/* Folder Picker Modal */}
        <Modal visible={showFolderPicker} animationType="slide" transparent={true} onRequestClose={() => { Keyboard.dismiss(); setShowFolderPicker(false); }}>
          <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); setShowFolderPicker(false); }}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={[styles.folderPickerContent, { paddingBottom: insets.bottom + 20 }]}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>{t.selectFolder || 'Selecionar Pasta'}</Text>
                    <TouchableOpacity onPress={() => { Keyboard.dismiss(); setShowFolderPicker(false); }}>
                      <Ionicons name="close" size={28} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                  <ScrollView keyboardShouldPersistTaps="handled">
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

        {/* Folder Management Modal com KeyboardAvoidingView */}
        <Modal visible={showFolderModal} animationType="slide" transparent={true} onRequestClose={closeFolderModal}>
          <KeyboardAvoidingView 
            style={{ flex: 1 }} 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={insets.top + 24}
          >
            <TouchableWithoutFeedback onPress={closeFolderModal}>
              <View style={styles.folderModalOverlay}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                  <View style={[styles.folderModalContent, { paddingBottom: insets.bottom + 20 }]}>
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
                        <TouchableOpacity style={styles.deleteFolderBtn} onPress={() => { closeFolderModal(); handleDeleteFolder(editingFolder); }}>
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
  
  // Search
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1C1C1E', marginHorizontal: 16, marginTop: 16, marginBottom: 8, paddingHorizontal: 12, borderRadius: 12, height: 44 },
  searchInput: { flex: 1, marginLeft: 8, color: '#FFFFFF', fontSize: 16 },
  
  // Add content
  addContainer: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 8, gap: 8, alignItems: 'flex-end' },
  addInput: { flex: 1, backgroundColor: '#1C1C1E', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, color: '#FFFFFF', fontSize: 16, minHeight: 44, maxHeight: 120 },
  pasteButton: { backgroundColor: '#1C1C1E', width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  addButton: { backgroundColor: '#007AFF', width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  
  // Folders
  folderSection: { marginHorizontal: 16, marginBottom: 12 },
  folderSectionTitle: { color: '#8E8E93', fontSize: 13, fontWeight: '600', textTransform: 'uppercase', marginBottom: 8 },
  folderList: { maxHeight: 50 },
  folderListContent: { paddingRight: 16, alignItems: 'center' },
  folderChip: { backgroundColor: '#2C2C2E', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginRight: 10, borderWidth: 1, borderColor: '#3A3A3C' },
  folderChipActive: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  folderChipText: { color: '#FFFFFF', fontSize: 14, fontWeight: '500' },
  folderChipTextActive: { color: '#FFFFFF' },
  addFolderChip: { backgroundColor: '#2C2C2E', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#3A3A3C' },
  
  // List
  listContent: { padding: 16, paddingTop: 8, paddingBottom: 20 },
  
  // Note cards
  noteCard: { backgroundColor: '#1C1C1E', borderRadius: 12, marginBottom: 10, flexDirection: 'row', overflow: 'hidden' },
  noteContent: { flex: 1, padding: 14 },
  noteText: { color: '#FFFFFF', fontSize: 13, lineHeight: 18 },
  noteActions: { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6, gap: 2, backgroundColor: '#1C1C1E', borderLeftWidth: 1, borderLeftColor: '#2C2C2E' },
  actionBtn: { padding: 6 },
  
  // Empty state
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 100 },
  emptyText: { color: '#8E8E93', fontSize: 16, marginTop: 16 },
  
  // Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1C1C1E', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#2C2C2E' },
  modalTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
  modalBody: { padding: 20 },
  inputLabel: { color: '#8E8E93', fontSize: 14, marginBottom: 8, textTransform: 'uppercase' },
  textInput: { backgroundColor: '#000000', borderRadius: 12, padding: 16, color: '#FFFFFF', fontSize: 16, marginBottom: 20 },
  pickerButton: { backgroundColor: '#000000', borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  pickerButtonText: { flex: 1, color: '#FFFFFF', fontSize: 16 },
  saveButton: { backgroundColor: '#007AFF', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  saveButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
  
  // Folder picker
  folderPickerContent: { backgroundColor: '#1C1C1E', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '60%' },
  createFolderOption: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: 'rgba(0, 122, 255, 0.1)' },
  createFolderIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0, 122, 255, 0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  createFolderText: { color: '#007AFF', fontSize: 16, fontWeight: '600' },
  folderDivider: { height: 1, backgroundColor: '#2C2C2E', marginVertical: 8 },
  folderOption: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#2C2C2E' },
  folderOptionActive: { backgroundColor: 'rgba(0, 122, 255, 0.1)' },
  folderOptionIcon: { fontSize: 24, marginRight: 12 },
  folderOptionName: { flex: 1, color: '#FFFFFF', fontSize: 16 },
  
  // Folder modal
  folderModalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.8)', justifyContent: 'flex-end', padding: 20 },
  folderModalContent: { backgroundColor: '#1C1C1E', borderRadius: 20, width: '100%', padding: 20, marginBottom: 20 },
  folderModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  folderModalTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
  folderNameInput: { backgroundColor: '#000000', borderRadius: 12, padding: 16, color: '#FFFFFF', fontSize: 16, marginBottom: 20 },
  folderModalActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  deleteFolderBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12 },
  deleteFolderText: { color: '#FF3B30', fontSize: 16, fontWeight: '600' },
  saveFolderBtn: { backgroundColor: '#007AFF', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, marginLeft: 'auto' },
  saveFolderText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
