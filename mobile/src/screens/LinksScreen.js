import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Image, Linking, Alert, RefreshControl, Modal, ScrollView, Switch, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editFolderId, setEditFolderId] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderLocation, setReminderLocation] = useState('');
  const [showFolderPicker, setShowFolderPicker] = useState(false);
  const [isPinnedEdit, setIsPinnedEdit] = useState(false);

  const t = translations[language] || translations.en;

  useEffect(() => { fetchData(); }, []);

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
      <TouchableOpacity style={styles.linkCard} onPress={() => handleOpenLink(item.url)}>
        {item.imageUrl && <Image source={{ uri: item.imageUrl }} style={styles.linkImage} />}
        <View style={styles.linkContent}>
          <View style={styles.linkTitleRow}>
            <Text style={styles.linkTitle} numberOfLines={2}>{item.title || item.url}</Text>
            {item.isPinned && <Ionicons name="pin" size={14} color="#FFD60A" style={{ marginLeft: 4 }} />}
          </View>
          <Text style={styles.linkUrl} numberOfLines={1}>{item.url}</Text>
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
            {item.isFavorite && <Ionicons name="heart" size={14} color="#FF3B30" />}
          </View>
        </View>
        <View style={styles.linkActions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => handleTogglePin(item)}>
            <Ionicons name={item.isPinned ? "pin" : "pin-outline"} size={20} color={item.isPinned ? "#FFD60A" : "#8E8E93"} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => openEditModal(item)}>
            <Ionicons name="pencil" size={18} color="#8E8E93" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => handleToggleFavorite(item)}>
            <Ionicons name={item.isFavorite ? 'heart' : 'heart-outline'} size={20} color={item.isFavorite ? '#FF3B30' : '#8E8E93'} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
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

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.folderList}>
        <TouchableOpacity style={[styles.folderChip, selectedFolder === 'all' && styles.folderChipActive]} onPress={() => setSelectedFolder('all')}>
          <Text style={[styles.folderChipText, selectedFolder === 'all' && styles.folderChipTextActive]}>{t.allLinks}</Text>
        </TouchableOpacity>
        {folders.map(folder => (
          <TouchableOpacity key={folder.id} style={[styles.folderChip, selectedFolder === folder.id && styles.folderChipActive]} onPress={() => setSelectedFolder(folder.id)}>
            <Text style={[styles.folderChipText, selectedFolder === folder.id && styles.folderChipTextActive]}>{folder.isDefault ? t.generalFolder : folder.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {filteredLinks.length === 0 ? (
        <ScrollView style={{ flex: 1 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor="#007AFF" />}>
          <View style={styles.emptyState}>
            <Ionicons name="link-outline" size={64} color="#8E8E93" />
            <Text style={styles.emptyText}>{t.noClipboardItems}</Text>
          </View>
        </ScrollView>
      ) : (
        <FlatList data={filteredLinks} keyExtractor={(item) => item.id} renderItem={renderLinkItem} contentContainerStyle={styles.listContent} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor="#007AFF" />} />
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
            <ScrollView style={styles.modalBody}>
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
            </ScrollView>
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveEdit}>
              <Text style={styles.saveButtonText}>{t.save}</Text>
            </TouchableOpacity>
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
              {folders.map((folder) => (
                <TouchableOpacity key={folder.id} style={[styles.folderOption, editFolderId === folder.id && styles.folderOptionActive]} onPress={() => { setEditFolderId(folder.id); setShowFolderPicker(false); }}>
                  <Text style={styles.folderOptionIcon}>{folder.icon || '📁'}</Text>
                  <Text style={styles.folderOptionName}>{folder.isDefault ? t.generalFolder : folder.name}</Text>
                  {editFolderId === folder.id && <Ionicons name="checkmark" size={24} color="#007AFF" />}
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
  container: { flex: 1, backgroundColor: '#000000' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1C1C1E', margin: 16, marginBottom: 8, paddingHorizontal: 12, borderRadius: 12, height: 44 },
  searchInput: { flex: 1, marginLeft: 8, color: '#FFFFFF', fontSize: 16 },
  addContainer: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 8, gap: 8 },
  addInput: { flex: 1, backgroundColor: '#1C1C1E', paddingHorizontal: 16, borderRadius: 12, height: 44, color: '#FFFFFF', fontSize: 16 },
  addButton: { backgroundColor: '#007AFF', width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  folderList: { paddingHorizontal: 16, marginBottom: 8, maxHeight: 44 },
  folderChip: { backgroundColor: '#1C1C1E', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
  folderChipActive: { backgroundColor: '#007AFF' },
  folderChipText: { color: '#8E8E93', fontSize: 14 },
  folderChipTextActive: { color: '#FFFFFF' },
  listContent: { padding: 16, paddingTop: 8, paddingBottom: 100 },
  linkCard: { backgroundColor: '#1C1C1E', borderRadius: 16, marginBottom: 12, flexDirection: 'row', overflow: 'hidden' },
  linkImage: { width: 80, height: 80 },
  linkContent: { flex: 1, padding: 12 },
  linkTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginBottom: 4 },
  linkUrl: { color: '#8E8E93', fontSize: 12, marginBottom: 8 },
  linkMeta: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  folderBadge: { backgroundColor: 'rgba(0, 122, 255, 0.2)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  folderBadgeText: { color: '#007AFF', fontSize: 12 },
  reminderBadge: { backgroundColor: 'rgba(255, 214, 10, 0.2)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 4 },
  reminderBadgeText: { color: '#FFD60A', fontSize: 12 },
  linkActions: { justifyContent: 'center', alignItems: 'center', paddingRight: 12, gap: 12 },
  editButton: { padding: 4 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyText: { color: '#8E8E93', fontSize: 16, marginTop: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1C1C1E', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#2C2C2E' },
  modalTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' },
  modalBody: { padding: 20, maxHeight: 500 },
  inputLabel: { color: '#8E8E93', fontSize: 14, marginBottom: 8, textTransform: 'uppercase' },
  textInput: { backgroundColor: '#000000', borderRadius: 12, padding: 16, color: '#FFFFFF', fontSize: 16, marginBottom: 20 },
  pickerButton: { backgroundColor: '#000000', borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  pickerButtonText: { flex: 1, color: '#FFFFFF', fontSize: 16 },
  reminderSection: { backgroundColor: '#000000', borderRadius: 16, padding: 16, marginBottom: 20 },
  reminderHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  reminderHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  reminderTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
  reminderOptions: { marginTop: 16, borderTopWidth: 1, borderTopColor: '#2C2C2E', paddingTop: 16 },
  locationInput: { backgroundColor: '#1C1C1E', borderRadius: 10, padding: 12, color: '#FFFFFF', fontSize: 16 },
  saveButton: { backgroundColor: '#007AFF', margin: 20, padding: 16, borderRadius: 12, alignItems: 'center' },
  saveButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
  folderPickerContent: { backgroundColor: '#1C1C1E', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '60%', paddingBottom: 40 },
  folderOption: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#2C2C2E' },
  folderOptionActive: { backgroundColor: 'rgba(0, 122, 255, 0.1)' },
  folderOptionIcon: { fontSize: 24, marginRight: 12 },
  folderOptionName: { flex: 1, color: '#FFFFFF', fontSize: 16 },
});
