import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Image, Linking, Alert, RefreshControl, Modal, ScrollView, Switch, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { supabase, generateId } from '../lib/supabase';
import { translations } from '../lib/i18n';
import CustomHeader from '../components/CustomHeader';

const DEMO_USER = 'demo_user';

export default function LinksScreen({ language, refreshKey }) {
  const [links, setLinks] = useState([]);
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editFolderId, setEditFolderId] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderLocation, setReminderLocation] = useState('');
  const [showFolderPicker, setShowFolderPicker] = useState(false);
  const [isPinnedEdit, setIsPinnedEdit] = useState(false);
  
  // Folder management
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [editingFolder, setEditingFolder] = useState(null);
  const [folderName, setFolderName] = useState('');

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

  const fetchData = async () => {
    try {
      const { data: foldersData } = await supabase.from('folders').select('*').eq('userId', DEMO_USER).eq('folderType', 'link').order('createdAt', { ascending: false });
      const { data: linksData } = await supabase.from('links').select('*').eq('userId', DEMO_USER).eq('contentType', 'link').order('createdAt', { ascending: false });
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
    if (!url.startsWith('http://') && !url.startsWith('https://')) url = 'https://' + url;
    try {
      const defaultFolder = folders.find(f => f.isDefault);
      const newLink = { id: generateId(), userId: DEMO_USER, url, title: url, contentType: 'link', tags: [], isFavorite: false, folderId: selectedFolder !== 'all' ? selectedFolder : defaultFolder?.id, createdAt: new Date().toISOString() };
      const { error } = await supabase.from('links').insert([newLink]);
      if (error) throw error;
      setLinks([newLink, ...links]);
      setNewUrl('');
      Toast.show({ type: 'success', text1: t.saved });
    } catch (error) {
      Toast.show({ type: 'error', text1: t.error });
    }
  };

  const handleOpenLink = (url) => { Linking.openURL(url); };

  const handleDeleteLink = (id) => {
    Alert.alert(t.delete, '', [
      { text: t.cancel, style: 'cancel' },
      { text: t.delete, style: 'destructive', onPress: async () => {
        try {
          await supabase.from('links').delete().eq('id', id);
          setLinks(links.filter(l => l.id !== id));
          Toast.show({ type: 'success', text1: t.deleted });
        } catch (error) {}
      }},
    ]);
  };

  const handleToggleFavorite = async (item) => {
    try {
      const newValue = !item.isFavorite;
      await supabase.from('links').update({ isFavorite: newValue }).eq('id', item.id);
      setLinks(links.map(l => l.id === item.id ? { ...l, isFavorite: newValue } : l));
      Toast.show({ type: 'success', text1: newValue ? (t.addedToFavorites || 'Adicionado aos favoritos') : (t.removedFromFavorites || 'Removido dos favoritos') });
    } catch (error) {}
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setEditTitle(item.title || '');
    setEditFolderId(item.folderId || '');
    setIsPinnedEdit(item.isPinned || false);
    if (item.reminder) {
      setReminderEnabled(true);
      setReminderLocation(item.reminder.location || '');
    } else {
      setReminderEnabled(false);
      setReminderLocation('');
    }
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingItem(null);
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    try {
      let reminderData = null;
      if (reminderEnabled && reminderLocation) {
        reminderData = { location: reminderLocation };
      }
      const updateData = { title: editTitle, folderId: editFolderId || null, reminder: reminderData, isPinned: isPinnedEdit };
      await supabase.from('links').update(updateData).eq('id', editingItem.id);
      setLinks(links.map(l => l.id === editingItem.id ? { ...l, ...updateData } : l));
      Toast.show({ type: 'success', text1: t.saved });
      closeEditModal();
    } catch (error) {
      Toast.show({ type: 'error', text1: t.error });
    }
  };

  const handleTogglePin = async (item) => {
    try {
      const newValue = !item.isPinned;
      await supabase.from('links').update({ isPinned: newValue }).eq('id', item.id);
      setLinks(links.map(l => l.id === item.id ? { ...l, isPinned: newValue } : l));
      Toast.show({ type: 'success', text1: newValue ? (t.pinned || 'Fixado') : (t.unpinned || 'Desafixado') });
    } catch (error) {
      console.error('Error toggling pin:', error);
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
        await supabase.from('folders').update({ name: folderName }).eq('id', editingFolder.id);
        setFolders(folders.map(f => f.id === editingFolder.id ? { ...f, name: folderName } : f));
        Toast.show({ type: 'success', text1: t.saved || 'Guardado' });
      } else {
        const newFolder = {
          id: generateId(),
          userId: DEMO_USER,
          name: folderName,
          icon: '📁',
          isDefault: false,
          folderType: 'link',
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

  const filteredLinks = links.filter(link => {
    const matchesFolder = selectedFolder === 'all' || link.folderId === selectedFolder;
    const matchesSearch = !searchQuery || link.title?.toLowerCase().includes(searchQuery.toLowerCase()) || link.url?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  // Sort: pinned items first, then by date
  const sortedLinks = [...filteredLinks].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const renderLinkItem = ({ item }) => {
    const folder = folders.find(f => f.id === item.folderId);
    const hasReminder = item.reminder && item.reminder.location;
    return (
      <View style={styles.linkCard}>
        <TouchableOpacity style={styles.linkTouchable} onPress={() => handleOpenLink(item.url || '')}>
          {item.imageUrl && <Image source={{ uri: item.imageUrl }} style={styles.linkImage} />}
          <View style={styles.linkContent}>
            <View style={styles.linkTitleRow}>
              <Text style={styles.linkTitle} numberOfLines={2}>{item.title || item.url || ''}</Text>
            </View>
            <Text style={styles.linkUrl} numberOfLines={1}>{item.url || ''}</Text>
            <View style={styles.linkMeta}>
              <View style={styles.folderBadge}>
                <Text style={styles.folderBadgeText}>{folder?.isDefault ? t.generalFolder : folder?.name || t.generalFolder}</Text>
              </View>
              {hasReminder && (
                <View style={styles.reminderBadge}>
                  <Ionicons name="location" size={12} color="#FFD60A" />
                  <Text style={styles.reminderBadgeText}>{t.reminder}</Text>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
        <View style={styles.linkActions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => handleTogglePin(item)}>
            <Ionicons name="pin" size={20} color={item.isPinned ? "#FFD60A" : "#8E8E93"} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => handleToggleFavorite(item)}>
            <Ionicons name={item.isFavorite ? 'heart' : 'heart-outline'} size={20} color={item.isFavorite ? '#FF3B30' : '#8E8E93'} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => openEditModal(item)}>
            <Ionicons name="pencil-outline" size={18} color="#8E8E93" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => handleDeleteLink(item.id)}>
            <Ionicons name="trash-outline" size={18} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <CustomHeader title="Memor.ia" />
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#8E8E93" />
          <TextInput style={styles.searchInput} placeholder={t.search} placeholderTextColor="#8E8E93" value={searchQuery} onChangeText={setSearchQuery} />
        </View>
        
        <View style={styles.addContainer}>
          <TextInput style={styles.addInput} placeholder="https://..." placeholderTextColor="#8E8E93" value={newUrl} onChangeText={setNewUrl} autoCapitalize="none" keyboardType="url" />
          <TouchableOpacity style={styles.addButton} onPress={handleAddLink}>
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Folder section with title */}
        <View style={styles.folderSection}>
          <Text style={styles.folderSectionTitle}>{t.folders || 'Pastas'}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.folderList} contentContainerStyle={styles.folderListContent}>
            <TouchableOpacity style={[styles.folderChip, selectedFolder === 'all' && styles.folderChipActive]} onPress={() => setSelectedFolder('all')}>
              <Text style={[styles.folderChipText, selectedFolder === 'all' && styles.folderChipTextActive]}>{t.allLinks || 'Todos'}</Text>
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

      {filteredLinks.length === 0 ? (
        <ScrollView style={{ flex: 1 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor="#007AFF" />}>
          <View style={styles.emptyState}>
            <Ionicons name="link-outline" size={64} color="#8E8E93" />
            <Text style={styles.emptyText}>{t.noClipboardItems}</Text>
          </View>
        </ScrollView>
      ) : (
        <FlatList data={sortedLinks} keyExtractor={(item) => item.id} renderItem={renderLinkItem} contentContainerStyle={styles.listContent} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor="#007AFF" />} />
      )}
      
      <Modal visible={showEditModal} animationType="slide" transparent={true} onRequestClose={closeEditModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t.editItem}</Text>
              <TouchableOpacity onPress={closeEditModal}>
                <Ionicons name="close" size={28} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody} contentContainerStyle={styles.modalBodyContent}>
              <Text style={styles.inputLabel}>{t.edit}</Text>
              <TextInput style={styles.textInput} value={editTitle} onChangeText={setEditTitle} placeholder={editingItem?.url} placeholderTextColor="#8E8E93" />
              <Text style={styles.inputLabel}>{t.moveToFolder}</Text>
              <TouchableOpacity style={styles.pickerButton} onPress={() => setShowFolderPicker(true)}>
                <Ionicons name="folder-outline" size={20} color="#007AFF" />
                <Text style={styles.pickerButtonText}>{folders.find(f => f.id === editFolderId)?.name || t.generalFolder}</Text>
                <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
              </TouchableOpacity>
              <View style={styles.reminderSection}>
                <View style={styles.reminderHeader}>
                  <View style={styles.reminderHeaderLeft}>
                    <Ionicons name="pin-outline" size={24} color="#FFD60A" />
                    <Text style={styles.reminderTitle}>{t.pinToTop || 'Fixar no topo'}</Text>
                  </View>
                  <Switch value={isPinnedEdit} onValueChange={setIsPinnedEdit} trackColor={{ false: '#3A3A3C', true: '#FFD60A' }} thumbColor="#FFFFFF" />
                </View>
              </View>
              <View style={styles.reminderSection}>
                <View style={styles.reminderHeader}>
                  <View style={styles.reminderHeaderLeft}>
                    <Ionicons name="location-outline" size={24} color="#FFD60A" />
                    <Text style={styles.reminderTitle}>{t.setReminder}</Text>
                  </View>
                  <Switch value={reminderEnabled} onValueChange={setReminderEnabled} trackColor={{ false: '#3A3A3C', true: '#34C759' }} thumbColor="#FFFFFF" />
                </View>
                {reminderEnabled && (
                  <View style={styles.reminderOptions}>
                    <TextInput style={styles.locationInput} value={reminderLocation} onChangeText={setReminderLocation} placeholder={t.reminderLocationPlaceholder} placeholderTextColor="#8E8E93" />
                  </View>
                )}
              </View>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveEdit}>
                <Text style={styles.saveButtonText}>{t.save}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={showFolderPicker} animationType="slide" transparent={true} onRequestClose={() => setShowFolderPicker(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.folderPickerContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t.selectFolder}</Text>
              <TouchableOpacity onPress={() => setShowFolderPicker(false)}>
                <Ionicons name="close" size={28} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {/* "Todos" option - means no specific folder */}
              <TouchableOpacity 
                style={[styles.folderOption, !editFolderId && styles.folderOptionActive]} 
                onPress={() => { setEditFolderId(null); setShowFolderPicker(false); }}
              >
                <Text style={styles.folderOptionIcon}>📋</Text>
                <Text style={styles.folderOptionName}>{t.allLinks || 'Todos'}</Text>
                {!editFolderId && <Ionicons name="checkmark" size={24} color="#007AFF" />}
              </TouchableOpacity>
              {/* Only user-created folders (not default) */}
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
        </View>
      </Modal>

      {/* Folder Management Modal */}
      <Modal visible={showFolderModal} animationType="slide" transparent={true} onRequestClose={closeFolderModal}>
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
        </View>
      </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#000000' },
  container: { flex: 1, backgroundColor: '#000000' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1C1C1E', margin: 16, marginBottom: 8, paddingHorizontal: 12, borderRadius: 12, height: 44 },
  searchInput: { flex: 1, marginLeft: 8, color: '#FFFFFF', fontSize: 16 },
  addContainer: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 8, gap: 8 },
  addInput: { flex: 1, backgroundColor: '#1C1C1E', paddingHorizontal: 16, borderRadius: 12, height: 44, color: '#FFFFFF', fontSize: 16 },
  addButton: { backgroundColor: '#007AFF', width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  // Folder section with title
  folderSection: { marginHorizontal: 16, marginBottom: 12 },
  folderSectionTitle: { color: '#8E8E93', fontSize: 13, fontWeight: '600', textTransform: 'uppercase', marginBottom: 8 },
  folderList: { maxHeight: 50 },
  folderListContent: { paddingRight: 16, alignItems: 'center' },
  folderChip: { backgroundColor: '#2C2C2E', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginRight: 10, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#3A3A3C' },
  folderChipActive: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  folderChipText: { color: '#FFFFFF', fontSize: 14, fontWeight: '500' },
  folderChipTextActive: { color: '#FFFFFF' },
  folderDeleteBtn: { marginLeft: 6 },
  addFolderChip: { backgroundColor: '#2C2C2E', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#3A3A3C' },
  listContent: { padding: 16, paddingTop: 8, paddingBottom: 100 },
  linkCard: { backgroundColor: '#1C1C1E', borderRadius: 16, marginBottom: 12, flexDirection: 'row', overflow: 'hidden' },
  linkTouchable: { flex: 1, flexDirection: 'row' },
  linkImage: { width: 80, height: 80 },
  linkContent: { flex: 1, padding: 12 },
  linkTitleRow: { flexDirection: 'row', alignItems: 'center' },
  linkTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginBottom: 4, flex: 1 },
  linkUrl: { color: '#8E8E93', fontSize: 12, marginBottom: 8 },
  linkMeta: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  folderBadge: { backgroundColor: 'rgba(0, 122, 255, 0.2)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  folderBadgeText: { color: '#007AFF', fontSize: 12 },
  reminderBadge: { backgroundColor: 'rgba(255, 214, 10, 0.2)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 4 },
  reminderBadgeText: { color: '#FFD60A', fontSize: 12 },
  linkActions: { justifyContent: 'center', alignItems: 'center', paddingRight: 8, gap: 4 },
  actionBtn: { padding: 4 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyText: { color: '#8E8E93', fontSize: 16, marginTop: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1C1C1E', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#2C2C2E' },
  modalTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
  modalBody: { flexGrow: 1 },
  modalBodyContent: { padding: 20, paddingBottom: 40 },
  inputLabel: { color: '#8E8E93', fontSize: 14, marginBottom: 8, textTransform: 'uppercase' },
  textInput: { backgroundColor: '#000000', borderRadius: 12, padding: 16, color: '#FFFFFF', fontSize: 16, marginBottom: 20 },
  pickerButton: { backgroundColor: '#000000', borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  pickerButtonText: { flex: 1, color: '#FFFFFF', fontSize: 16 },
  reminderSection: { backgroundColor: '#000000', borderRadius: 16, padding: 16, marginBottom: 16 },
  reminderHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  reminderHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  reminderTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
  reminderOptions: { marginTop: 16, borderTopWidth: 1, borderTopColor: '#2C2C2E', paddingTop: 16 },
  locationInput: { backgroundColor: '#1C1C1E', borderRadius: 10, padding: 12, color: '#FFFFFF', fontSize: 16 },
  saveButton: { backgroundColor: '#007AFF', marginHorizontal: 20, marginTop: 20, marginBottom: 30, padding: 16, borderRadius: 12, alignItems: 'center' },
  saveButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
  folderPickerContent: { backgroundColor: '#1C1C1E', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '60%', paddingBottom: 40 },
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
});
