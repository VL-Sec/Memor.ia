import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Image,
  Linking,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import Toast from 'react-native-toast-message';
import { supabase } from '../lib/supabase';
import { translations } from '../lib/i18n';

const DEMO_USER = 'demo_user';

export default function FavoritesScreen({ language }) {
  const [favorites, setFavorites] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const t = translations[language] || translations.en;

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const { data } = await supabase
        .from('links')
        .select('*')
        .eq('userId', DEMO_USER)
        .eq('isFavorite', true)
        .order('createdAt', { ascending: false });

      setFavorites(data || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleOpenLink = (url) => {
    Linking.openURL(url);
  };

  const handleCopyContent = async (content) => {
    await Clipboard.setStringAsync(content);
    Toast.show({ type: 'success', text1: t.copied });
  };

  const handleRemoveFavorite = async (id) => {
    try {
      await supabase
        .from('links')
        .update({ isFavorite: false })
        .eq('id', id);
      
      setFavorites(favorites.filter(f => f.id !== id));
      Toast.show({ type: 'success', text1: t.deleted });
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const filteredFavorites = favorites.filter(item => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.title?.toLowerCase().includes(query) ||
      item.url?.toLowerCase().includes(query) ||
      item.content?.toLowerCase().includes(query)
    );
  });

  const renderItem = ({ item }) => {
    const isLink = item.contentType === 'link';
    
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => isLink ? handleOpenLink(item.url) : handleCopyContent(item.content)}
      >
        {isLink && item.imageUrl && (
          <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
        )}
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Ionicons
              name={isLink ? 'link' : 'clipboard'}
              size={16}
              color="#8E8E93"
            />
            <Text style={styles.cardType}>
              {isLink ? 'Link' : 'Note'}
            </Text>
          </View>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.title || item.content?.slice(0, 50)}
          </Text>
          {isLink && (
            <Text style={styles.cardUrl} numberOfLines={1}>
              {item.url}
            </Text>
          )}
          {!isLink && (
            <Text style={styles.cardPreview} numberOfLines={2}>
              {item.content}
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => handleRemoveFavorite(item.id)}
        >
          <Ionicons name="heart" size={24} color="#FF3B30" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

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

      {/* Favorites List */}
      <FlatList
        data={filteredFavorites}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchFavorites();
            }}
            tintColor="#007AFF"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="heart-outline" size={64} color="#8E8E93" />
            <Text style={styles.emptyText}>{t.noClipboardItems}</Text>
          </View>
        }
      />
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
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  card: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  cardImage: {
    width: 80,
    height: 80,
  },
  cardContent: {
    flex: 1,
    padding: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
  },
  cardType: {
    color: '#8E8E93',
    fontSize: 12,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardUrl: {
    color: '#8E8E93',
    fontSize: 12,
  },
  cardPreview: {
    color: '#8E8E93',
    fontSize: 13,
    lineHeight: 18,
  },
  favoriteButton: {
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    color: '#8E8E93',
    fontSize: 16,
    marginTop: 16,
  },
});
