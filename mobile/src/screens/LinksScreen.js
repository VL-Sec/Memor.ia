import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Image, Linking, Alert, RefreshControl, Modal, ScrollView, Switch, FlatList, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import * as Clipboard from 'expo-clipboard';
import * as Notifications from 'expo-notifications';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase, generateId } from '../lib/supabase';
import { translations } from '../lib/i18n';
import CustomHeader from '../components/CustomHeader';

// Helper function to format date according to user's system locale (with year)
const formatDateLocale = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export default function LinksScreen({ language, userId, refreshKey }) {
  const [links, setLinks] = useState([]);
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editUrl, setEditUrl] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editFolderId, setEditFolderId] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderDate, setReminderDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
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
      const { data: foldersData } = await supabase.from('folders').select('*').eq('userId', userId).eq('folderType', 'link').order('createdAt', { ascending: false });
      const { data: linksData } = await supabase.from('links').select('*').eq('userId', userId).eq('contentType', 'link').order('createdAt', { ascending: false });
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
    
    // Open modal for complete configuration
    setIsAddingNew(true);
    setEditingItem(null);
    setEditUrl(url);
    setEditTitle(url);
    setEditFolderId(selectedFolder !== 'all' ? selectedFolder : '');
    setIsPinnedEdit(false);
    setReminderEnabled(false);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    setReminderDate(tomorrow);
    setNewUrl('');
    setShowEditModal(true);
  };

  const handleOpenLink = (url) => { Linking.openURL(url); };

  const handleDeleteLink = (id, e) => {
    if (e) e.stopPropagation();
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

  const handleToggleFavorite = async (item, e) => {
    if (e) e.stopPropagation();
    try {
      const newValue = !item.isFavorite;
      await supabase.from('links').update({ isFavorite: newValue }).eq('id', item.id);
      setLinks(links.map(l => l.id === item.id ? { ...l, isFavorite: newValue } : l));
      Toast.show({ type: 'success', text1: newValue ? (t.addedToFavorites || 'Adicionado aos favoritos') : (t.removedFromFavorites || 'Removido dos favoritos') });
    } catch (error) {}
  };

  const openEditModal = (item, e) => {
    if (e) e.stopPropagation();
    setIsAddingNew(false);
    setEditingItem(item);
    setEditUrl(item.url || '');
    setEditTitle(item.title || '');
    setEditFolderId(item.folderId || '');
    setIsPinnedEdit(item.isPinned || false);
    if (item.reminder && item.reminder.date) {
      setReminderEnabled(true);
      setReminderDate(new Date(item.reminder.date));
    } else {
      setReminderEnabled(false);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);
      setReminderDate(tomorrow);
    }
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingItem(null);
    setIsAddingNew(false);
  };

  const scheduleNotification = async (title, date) => {
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
          title: t.reminder || 'Lembrete',
          body: title || t.reminderBody || 'Tens um link para ver!',
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
      Toast.show({ type: 'error', text1: t.errorSchedulingReminder || 'Erro ao criar lembrete' });
      return null;
    }
  };

  const cancelNotification = async (notificationId) => {
    if (notificationId) {
      try {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
      } catch (error) {
        console.error('Error canceling notification:', error);
      }
    }
  };

  const handleSaveEdit = async () => {
    try {
      let reminderData = null;
      
      // Schedule notification if reminder is enabled
      if (reminderEnabled && reminderDate > new Date()) {
        const notificationId = await scheduleNotification(editTitle || editUrl, reminderDate);
        if (notificationId) {
          reminderData = { 
            date: reminderDate.toISOString(), 
            notificationId 
          };
        }
      }
      
      if (isAddingNew) {
        // Creating new link
        if (!editUrl.trim()) {
          Toast.show({ type: 'error', text1: t.urlRequired || 'URL é obrigatório' });
          return;
        }
        
        const newLink = { 
          id: generateId(), 
          userId: userId, 
          url: editUrl, 
          title: editTitle || editUrl, 
          contentType: 'link', 
          tags: [], 
          isFavorite: false, 
          isPinned: isPinnedEdit,
          folderId: editFolderId || null,
          reminder: reminderData,
          createdAt: new Date().toISOString() 
        };
        
        const { error } = await supabase.from('links').insert([newLink]);
        if (error) throw error;
        
        setLinks([newLink, ...links]);
        Toast.show({ type: 'success', text1: t.saved });
      } else {
        // Editing existing link
        if (!editingItem) return;
        
        // Cancel existing notification if any
        if (editingItem.reminder?.notificationId) {
          await cancelNotification(editingItem.reminder.notificationId);
        }
        
        const updateData = { 
          title: editTitle, 
          folderId: editFolderId || null, 
          reminder: reminderData, 
          isPinned: isPinnedEdit 
        };
        
        await supabase.from('links').update(updateData).eq('id', editingItem.id);
        setLinks(links.map(l => l.id === editingItem.id ? { ...l, ...updateData } : l));
        Toast.show({ type: 'success', text1: t.saved });
      }
      
      closeEditModal();
    } catch (error) {
      console.error('Error saving:', error);
      Toast.show({ type: 'error', text1: t.error });
    }
  };

  const handleTogglePin = async (item, e) => {
    if (e) e.stopPropagation();
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
          userId: userId,
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

  const sortedLinks = [...filteredLinks].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const renderLinkItem = ({ item }) => {
    const folder = folders.find(f => f.id === item.folderId);
    const hasReminder = item.reminder && item.reminder.date;
    const reminderDateObj = hasReminder ? new Date(item.reminder.date) : null;
    const isReminderPast = reminderDateObj && reminderDateObj < new Date();
    
    return (
      <View style={styles.linkCard}>
        {/* Main content area - opens link */}
        <TouchableOpacity 
          style={styles.linkTouchable} 
          onPress={() => handleOpenLink(item.url || '')}
          activeOpacity={0.7}
        >
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
              {hasReminder && !isReminderPast && (
                <View style={styles.reminderBadge}>
                  <Ionicons name="notifications" size={12} color="#34C759" />
                  <Text style={styles.reminderBadgeText}>
                    {formatDateLocale(item.reminder.date)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
        
        {/* Action buttons - separate touch zone */}
        <View style={styles.linkActions}>
          <TouchableOpacity 
            style={styles.actionBtn} 
            onPress={(e) => handleTogglePin(item, e)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="pin" size={20} color={item.isPinned ? "#FFD60A" : "#8E8E93"} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionBtn} 
            onPress={(e) => handleToggleFavorite(item, e)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name={item.isFavorite ? 'heart' : 'heart-outline'} size={20} color={item.isFavorite ? '#FF3B30' : '#8E8E93'} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionBtn} 
            onPress={(e) => openEditModal(item, e)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="pencil-outline" size={18} color="#8E8E93" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionBtn} 
            onPress={(e) => handleDeleteLink(item.id, e)}
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
              <Text style={styles.inputLabel}>URL</Text>
              <View style={styles.urlContainer}>
                <Text style={styles.urlText} numberOfLines={2}>{editingItem?.url}</Text>
                <TouchableOpacity 
                  style={styles.copyUrlButton} 
                  onPress={() => {
                    Clipboard.setStringAsync(editingItem?.url || '');
                    Toast.show({ type: 'success', text1: t.copied || 'Copiado!' });
                  }}
                >
                  <Ionicons name="copy-outline" size={20} color="#007AFF" />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.inputLabel}>{t.linkTitle || t.title || 'Título'}</Text>
              <TextInput style={styles.textInput} value={editTitle} onChangeText={setEditTitle} placeholder={t.linkTitlePlaceholder || 'Nome do link'} placeholderTextColor="#8E8E93" />
              
              <Text style={styles.inputLabel}>{t.moveToFolder || 'Mover para:'}</Text>
              <TouchableOpacity style={styles.pickerButton} onPress={() => setShowFolderPicker(true)}>
                <Ionicons name="folder-outline" size={20} color="#007AFF" />
                <Text style={styles.pickerButtonText}>
                  {editFolderId 
                    ? (folders.find(f => f.id === editFolderId)?.name || t.allLinks || 'Todos')
                    : (t.allLinks || 'Todos')}
                </Text>
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
                    <Ionicons name="notifications-outline" size={24} color="#34C759" />
                    <Text style={styles.reminderTitle}>{t.setReminder || 'Lembrete'}</Text>
                  </View>
                  <Switch value={reminderEnabled} onValueChange={setReminderEnabled} trackColor={{ false: '#3A3A3C', true: '#34C759' }} thumbColor="#FFFFFF" />
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
              
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveEdit}>
                <Text style={styles.saveButtonText}>{t.save}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {showDatePicker && (
        <DateTimePicker
          value={reminderDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setShowDatePicker(Platform.OS === 'ios');
            if (selectedDate) {
              const newDate = new Date(reminderDate);
              newDate.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
              setReminderDate(newDate);
            }
          }}
          minimumDate={new Date()}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={reminderDate}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedTime) => {
            setShowTimePicker(Platform.OS === 'ios');
            if (selectedTime) {
              const newDate = new Date(reminderDate);
              newDate.setHours(selectedTime.getHours(), selectedTime.getMinutes());
              setReminderDate(newDate);
            }
          }}
        />
      )}

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
              {/* Create New Folder Option */}
              <TouchableOpacity 
                style={styles.createFolderOption} 
                onPress={() => { setShowFolderPicker(false); openFolderModal(); }}
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
                <Text style={styles.folderOptionName}>{t.allLinks || 'Todos'}</Text>
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
        </View>
      </Modal>

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
  // Link card with separate touch zones
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
  reminderBadge: { backgroundColor: 'rgba(52, 199, 89, 0.2)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 4 },
  reminderBadgeText: { color: '#34C759', fontSize: 12 },
  // Actions column - separate touch zone
  linkActions: { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 8, gap: 4, backgroundColor: '#1C1C1E', borderLeftWidth: 1, borderLeftColor: '#2C2C2E' },
  actionBtn: { padding: 6 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyText: { color: '#8E8E93', fontSize: 16, marginTop: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1C1C1E', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#2C2C2E' },
  modalTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
  modalBody: { flexGrow: 1 },
  modalBodyContent: { padding: 20, paddingBottom: 40 },
  inputLabel: { color: '#8E8E93', fontSize: 14, marginBottom: 8, textTransform: 'uppercase' },
  urlContainer: { backgroundColor: '#000000', borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  urlText: { flex: 1, color: '#007AFF', fontSize: 14 },
  copyUrlButton: { padding: 8, marginLeft: 8 },
  textInput: { backgroundColor: '#000000', borderRadius: 12, padding: 16, color: '#FFFFFF', fontSize: 16, marginBottom: 20 },
  pickerButton: { backgroundColor: '#000000', borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  pickerButtonText: { flex: 1, color: '#FFFFFF', fontSize: 16 },
  reminderSection: { backgroundColor: '#000000', borderRadius: 16, padding: 16, marginBottom: 16 },
  reminderHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  reminderHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  reminderTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
  reminderOptions: { marginTop: 16, borderTopWidth: 1, borderTopColor: '#2C2C2E', paddingTop: 16 },
  dateTimeRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  dateTimeButton: { flex: 1, backgroundColor: '#1C1C1E', borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  dateTimeText: { color: '#FFFFFF', fontSize: 16, fontWeight: '500' },
  reminderHint: { color: '#8E8E93', fontSize: 13, textAlign: 'center', fontStyle: 'italic' },
  saveButton: { backgroundColor: '#007AFF', marginHorizontal: 20, marginTop: 20, marginBottom: 30, padding: 16, borderRadius: 12, alignItems: 'center' },
  saveButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
  folderPickerContent: { backgroundColor: '#1C1C1E', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '60%', paddingBottom: 40 },
  createFolderOption: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: 'rgba(0, 122, 255, 0.1)' },
  createFolderIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0, 122, 255, 0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  createFolderText: { color: '#007AFF', fontSize: 16, fontWeight: '600' },
  folderDivider: { height: 1, backgroundColor: '#2C2C2E', marginVertical: 8 },
  folderOption: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#2C2C2E' },
  folderOptionActive: { backgroundColor: 'rgba(0, 122, 255, 0.1)' },
  folderOptionIcon: { fontSize: 24, marginRight: 12 },
  folderOptionName: { flex: 1, color: '#FFFFFF', fontSize: 16 },
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
