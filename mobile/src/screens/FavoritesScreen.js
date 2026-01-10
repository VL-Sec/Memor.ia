import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Image, Linking, RefreshControl, ScrollView, FlatList, Keyboard, TouchableWithoutFeedback, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { supabase } from '../lib/supabase';
import { translations } from '../lib/i18n';
import CustomHeader from '../components/CustomHeader';

// Normalizar texto (remover acentos + minúsculas) para pesquisa
const normalize = (text = '') =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

// Helper function to format date according to user's system locale
const formatDateLocale = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
};

// FilterChip component defined outside the main component
const FilterChip = ({ value, currentFilter, label, onPress }) => (
  <TouchableOpacity 
    style={[styles.filterChip, currentFilter === value && styles.filterChipActive]} 
    onPress={() => onPress(value)}
  >
    <Text style={[styles.filterChipText, currentFilter === value && styles.filterChipTextActive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

export default function FavoritesScreen({ language, userId, refreshKey }) {
  const [favorites, setFavorites] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  const insets = useSafeAreaInsets();
  const t = translations[language] || translations.en;
  
  // Dynamic storage key based on userId
  const getNotesStorageKey = () => `memoria-notes-${userId || 'default'}`;

  // Reload when screen is focused
  useFocusEffect(
    useCallback(() => {
      if (userId) {
        fetchFavorites();
      }
    }, [userId])
  );

  // Also reload when refreshKey changes
  useEffect(() => {
    if (refreshKey > 0 && userId) {
      fetchFavorites();
    }
  }, [refreshKey, userId]);

  const fetchFavorites = async () => {
    if (!userId) return;
    
    try {
      // Fetch from Supabase (links and clipboard items)
      const { data: supabaseData } = await supabase
        .from('links')
        .select('*')
        .eq('userId', userId)
        .eq('isFavorite', true)
        .order('createdAt', { ascending: false });
      
      // Fetch local notes with userId-specific key
      const localNotesStr = await AsyncStorage.getItem(getNotesStorageKey());
      const localNotes = localNotesStr ? JSON.parse(localNotesStr) : [];
      const favoriteNotes = localNotes
        .filter(n => n.isFavorite === true)
        .map(n => ({ ...n, contentType: 'note', source: 'local' }));
      
      // Combine all favorites
      const allFavorites = [
        ...(supabaseData || []).map(item => ({ ...item, source: 'supabase' })),
        ...favoriteNotes
      ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      setFavorites(allFavorites);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleOpenLink = (url) => {
    Keyboard.dismiss();
    Linking.openURL(url); 
  };

  const handleCopyContent = async (content) => {
    Keyboard.dismiss();
    await Clipboard.setStringAsync(content);
    Toast.show({ type: 'success', text1: t.copied });
  };

  const handleRemoveFavorite = async (item) => {
    Keyboard.dismiss();
    try {
      if (item.source === 'local') {
        // Update local notes
        const localNotesStr = await AsyncStorage.getItem(getNotesStorageKey());
        const localNotes = localNotesStr ? JSON.parse(localNotesStr) : [];
        const updatedNotes = localNotes.map(n => 
          n.id === item.id ? { ...n, isFavorite: false } : n
        );
        await AsyncStorage.setItem(getNotesStorageKey(), JSON.stringify(updatedNotes));
      } else {
        // Update Supabase
        await supabase.from('links').update({ isFavorite: false }).eq('id', item.id);
      }
      
      // Remove from local state immediately
      setFavorites(favorites.filter(f => f.id !== item.id));
      Toast.show({ type: 'success', text1: t.removedFromFavorites || 'Removido dos favoritos' });
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const getItemType = (item) => {
    if (item.contentType === 'link') return 'link';
    if (item.contentType === 'note' || item.source === 'local') return 'note';
    return 'clipboard';
  };

  const getItemIcon = (type) => {
    switch (type) {
      case 'link': return 'link';
      case 'note': return 'document-text';
      case 'clipboard': return 'clipboard';
      default: return 'document';
    }
  };

  const getItemLabel = (type) => {
    switch (type) {
      case 'link': return 'Link';
      case 'note': return t.tabNotes || 'Nota';
      case 'clipboard': return 'Clipboard';
      default: return 'Item';
    }
  };

  const filteredFavorites = favorites.filter(item => {
    if (filter !== 'all') {
      const itemType = getItemType(item);
      if (filter === 'links' && itemType !== 'link') return false;
      if (filter === 'notes' && itemType !== 'note') return false;
      if (filter === 'clipboard' && itemType !== 'clipboard') return false;
    }
    if (!searchQuery) return true;
    const q = normalize(searchQuery);
    return normalize(item.title).includes(q) || 
           normalize(item.url).includes(q) || 
           normalize(item.content).includes(q);
  });

  const renderItem = ({ item }) => {
    const itemType = getItemType(item);
    const isLink = itemType === 'link';
    
    return (
      <TouchableOpacity 
        style={styles.card} 
        onPress={() => isLink ? handleOpenLink(item.url) : handleCopyContent(item.content || '')}
        activeOpacity={0.7}
      >
        {isLink && item.imageUrl && (
          <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
        )}
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Ionicons name={getItemIcon(itemType)} size={14} color="#8E8E93" />
            <Text style={styles.cardType}>{getItemLabel(itemType)}</Text>
            {/* Only show date for Notes */}
            {itemType === 'note' && item.createdAt && (
              <Text style={styles.cardDate}>{formatDateLocale(item.createdAt)}</Text>
            )}
          </View>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.title || item.content?.slice(0, 50) || ''}
          </Text>
          {isLink && <Text style={styles.cardUrl} numberOfLines={1}>{item.url || ''}</Text>}
          {!isLink && <Text style={styles.cardPreview} numberOfLines={2}>{item.content || ''}</Text>}
        </View>
        <TouchableOpacity 
          style={styles.favoriteButton} 
          onPress={() => handleRemoveFavorite(item)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="heart" size={24} color="#FF3B30" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <CustomHeader title={t.tabFavorites || 'Favoritos'} />
      <View style={[styles.container, { paddingBottom: insets.bottom + 16 }]}>
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

        <View style={styles.filterWrapper}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.filterContainer}
            keyboardShouldPersistTaps="handled"
          >
            <FilterChip value="all" currentFilter={filter} label={t.all || 'Todos'} onPress={(v) => { Keyboard.dismiss(); setFilter(v); }} />
            <FilterChip value="links" currentFilter={filter} label="Links" onPress={(v) => { Keyboard.dismiss(); setFilter(v); }} />
            <FilterChip value="notes" currentFilter={filter} label={t.tabNotes || 'Notas'} onPress={(v) => { Keyboard.dismiss(); setFilter(v); }} />
            <FilterChip value="clipboard" currentFilter={filter} label="Clipboard" onPress={(v) => { Keyboard.dismiss(); setFilter(v); }} />
          </ScrollView>
        </View>

        {filteredFavorites.length === 0 ? (
          <ScrollView 
            style={{ flex: 1 }} 
            keyboardShouldPersistTaps="handled"
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={() => { setRefreshing(true); fetchFavorites(); }} 
                tintColor="#007AFF" 
              />
            }
          >
            <View style={styles.emptyState}>
              <Ionicons name="heart-outline" size={64} color="#8E8E93" />
              <Text style={styles.emptyText}>{t.noFavorites || 'Sem favoritos'}</Text>
              <Text style={styles.emptySubtext}>
                {t.addFavoritesHint || 'Toque no coração para adicionar favoritos'}
              </Text>
            </View>
          </ScrollView>
        ) : (
          <FlatList 
            data={filteredFavorites} 
            keyExtractor={(item) => item.id} 
            renderItem={renderItem} 
            contentContainerStyle={[styles.listContent, { paddingBottom: 20 }]}
            keyboardShouldPersistTaps="handled"
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={() => { setRefreshing(true); fetchFavorites(); }} 
                tintColor="#007AFF" 
              />
            } 
          />
        )}
      </View>
    </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#000000' },
  container: { flex: 1, backgroundColor: '#000000' },
  searchContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#1C1C1E', 
    marginHorizontal: 16, 
    marginTop: 16,
    marginBottom: 12, 
    paddingHorizontal: 12, 
    borderRadius: 12, 
    height: 44 
  },
  searchInput: { flex: 1, marginLeft: 8, color: '#FFFFFF', fontSize: 16 },
  filterWrapper: { 
    marginBottom: 12,
  },
  filterContainer: { 
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  filterChip: { 
    backgroundColor: '#2C2C2E', 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    borderRadius: 20, 
    marginRight: 10, 
    borderWidth: 1, 
    borderColor: '#3A3A3C',
    minWidth: 60,
    alignItems: 'center',
  },
  filterChipActive: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  filterChipText: { color: '#FFFFFF', fontSize: 14, fontWeight: '500' },
  filterChipTextActive: { color: '#FFFFFF' },
  listContent: { paddingHorizontal: 16, paddingBottom: 20 },
  card: { 
    backgroundColor: '#1C1C1E', 
    borderRadius: 16, 
    marginBottom: 12, 
    flexDirection: 'row', 
    overflow: 'hidden' 
  },
  cardImage: { width: 80, height: 80 },
  cardContent: { flex: 1, padding: 12 },
  cardHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 6, 
    gap: 6 
  },
  cardType: { color: '#8E8E93', fontSize: 12, fontWeight: '500' },
  cardDate: { color: '#8E8E93', fontSize: 11, marginLeft: 'auto' },
  cardTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '600', marginBottom: 4 },
  cardUrl: { color: '#007AFF', fontSize: 12 },
  cardPreview: { color: '#8E8E93', fontSize: 13, lineHeight: 18 },
  favoriteButton: { 
    justifyContent: 'center', 
    paddingHorizontal: 16,
    borderLeftWidth: 1,
    borderLeftColor: '#2C2C2E',
  },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  emptyText: { color: '#8E8E93', fontSize: 18, fontWeight: '600', marginTop: 16 },
  emptySubtext: { color: '#8E8E93', fontSize: 14, marginTop: 8, textAlign: 'center', paddingHorizontal: 40 },
});
