import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Image, Linking, RefreshControl, ScrollView, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { supabase } from '../lib/supabase';
import { translations } from '../lib/i18n';

const DEMO_USER = 'demo_user';
const LOCAL_NOTES_KEY = 'memoria-notes';

export default function FavoritesScreen({ language }) {
  const [favorites, setFavorites] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  const t = translations[language] || translations.en;

  useEffect(() => { fetchFavorites(); }, []);

  const fetchFavorites = async () => {
    try {
      const { data: supabaseData } = await supabase.from('links').select('*').eq('userId', DEMO_USER).eq('isFavorite', true).order('createdAt', { ascending: false });
      const localNotesStr = await AsyncStorage.getItem(LOCAL_NOTES_KEY);
      const localNotes = localNotesStr ? JSON.parse(localNotesStr) : [];
      const favoriteNotes = localNotes.filter(n => n.isFavorite).map(n => ({ ...n, contentType: 'note', source: 'local' }));
      const allFavorites = [...(supabaseData || []).map(item => ({ ...item, source: 'supabase' })), ...favoriteNotes].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setFavorites(allFavorites);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleOpenLink = (url) => { Linking.openURL(url); };

  const handleCopyContent = async (content) => {
    await Clipboard.setStringAsync(content);
    Toast.show({ type: 'success', text1: t.copied });
  };

  const handleRemoveFavorite = async (item) => {
    try {
      if (item.source === 'local') {
        const localNotesStr = await AsyncStorage.getItem(LOCAL_NOTES_KEY);
        const localNotes = localNotesStr ? JSON.parse(localNotesStr) : [];
        const updatedNotes = localNotes.map(n => n.id === item.id ? { ...n, isFavorite: false } : n);
        await AsyncStorage.setItem(LOCAL_NOTES_KEY, JSON.stringify(updatedNotes));
      } else {
        await supabase.from('links').update({ isFavorite: false }).eq('id', item.id);
      }
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
      case 'note': return t.tabNotes || 'Note';
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
    const query = searchQuery.toLowerCase();
    return item.title?.toLowerCase().includes(query) || item.url?.toLowerCase().includes(query) || item.content?.toLowerCase().includes(query);
  });

  const renderItem = ({ item }) => {
    const itemType = getItemType(item);
    const isLink = itemType === 'link';
    return (
      <TouchableOpacity style={styles.card} onPress={() => isLink ? handleOpenLink(item.url) : handleCopyContent(item.content)}>
        {isLink && item.imageUrl && <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />}
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Ionicons name={getItemIcon(itemType)} size={16} color="#8E8E93" />
            <Text style={styles.cardType}>{getItemLabel(itemType)}</Text>
          </View>
          <Text style={styles.cardTitle} numberOfLines={2}>{item.title || item.content?.slice(0, 50)}</Text>
          {isLink && <Text style={styles.cardUrl} numberOfLines={1}>{item.url}</Text>}
          {!isLink && <Text style={styles.cardPreview} numberOfLines={2}>{item.content}</Text>}
        </View>
        <TouchableOpacity style={styles.favoriteButton} onPress={() => handleRemoveFavorite(item)}>
          <Ionicons name="heart" size={24} color="#FF3B30" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const FilterChip = ({ value, label }) => (
    <TouchableOpacity style={[styles.filterChip, filter === value && styles.filterChipActive]} onPress={() => setFilter(value)}>
      <Text style={[styles.filterChipText, filter === value && styles.filterChipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#8E8E93" />
        <TextInput style={styles.searchInput} placeholder={t.search} placeholderTextColor="#8E8E93" value={searchQuery} onChangeText={setSearchQuery} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        <FilterChip value="all" label={t.all || 'Todos'} />
        <FilterChip value="links" label="Links" />
        <FilterChip value="notes" label={t.tabNotes || 'Notas'} />
        <FilterChip value="clipboard" label="Clipboard" />
      </ScrollView>

      {filteredFavorites.length === 0 ? (
        <ScrollView style={{ flex: 1 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchFavorites(); }} tintColor="#007AFF" />}>
          <View style={styles.emptyState}>
            <Ionicons name="heart-outline" size={64} color="#8E8E93" />
            <Text style={styles.emptyText}>{t.noFavorites || 'Sem favoritos'}</Text>
            <Text style={styles.emptySubtext}>{t.addFavoritesHint || 'Toque no coração para adicionar favoritos'}</Text>
          </View>
        </ScrollView>
      ) : (
        <FlatList data={filteredFavorites} keyExtractor={(item) => item.id} renderItem={renderItem} contentContainerStyle={styles.listContent} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchFavorites(); }} tintColor="#007AFF" />} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1C1C1E', margin: 16, marginBottom: 8, paddingHorizontal: 12, borderRadius: 12, height: 44 },
  searchInput: { flex: 1, marginLeft: 8, color: '#FFFFFF', fontSize: 16 },
  filterContainer: { paddingHorizontal: 16, marginBottom: 8, maxHeight: 40 },
  filterChip: { backgroundColor: '#1C1C1E', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
  filterChipActive: { backgroundColor: '#007AFF' },
  filterChipText: { color: '#8E8E93', fontSize: 14 },
  filterChipTextActive: { color: '#FFFFFF' },
  listContent: { padding: 16, paddingTop: 0, paddingBottom: 100 },
  card: { backgroundColor: '#1C1C1E', borderRadius: 16, marginBottom: 12, flexDirection: 'row', overflow: 'hidden' },
  cardImage: { width: 80, height: 80 },
  cardContent: { flex: 1, padding: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, gap: 4 },
  cardType: { color: '#8E8E93', fontSize: 12 },
  cardTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginBottom: 4 },
  cardUrl: { color: '#8E8E93', fontSize: 12 },
  cardPreview: { color: '#8E8E93', fontSize: 13, lineHeight: 18 },
  favoriteButton: { justifyContent: 'center', paddingHorizontal: 12 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  emptyText: { color: '#8E8E93', fontSize: 18, fontWeight: '600', marginTop: 16 },
  emptySubtext: { color: '#8E8E93', fontSize: 14, marginTop: 8, textAlign: 'center', paddingHorizontal: 40 },
});
