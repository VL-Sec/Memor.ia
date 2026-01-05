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

  const t = translations[language] || translations.en;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch folders
      const { data: foldersData } = await supabase
        .from('folders')
        .select('*')
        .eq('userId', DEMO_USER)
        .eq('folderType', 'link')
        .order('createdAt', { ascending: false });

      // Fetch links
      const { data: linksData } = await supabase
        .from('links')
        .select('*')
        .eq('userId', DEMO_USER)
        .eq('contentType', 'link')
        .order('createdAt', { ascending: false });

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
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    try {
      const defaultFolder = folders.find(f => f.isDefault);
      
      const newLink = {
        id: generateId(),
        userId: DEMO_USER,
        url,
        title: url,
        contentType: 'link',
        tags: [],
        isFavorite: false,
        folderId: selectedFolder !== 'all' ? selectedFolder : defaultFolder?.id,
        createdAt: new Date().toISOString(),
      };

      const { error } = await supabase.from('links').insert([newLink]);

      if (error) throw error;

      setLinks([newLink, ...links]);
      setNewUrl('');
      
      Toast.show({
        type: 'success',
        text1: t.saved,
      });
    } catch (error) {
      console.error('Error adding link:', error);
      Toast.show({
        type: 'error',
        text1: t.error,
      });
    }
  };

  const handleOpenLink = (url) => {
    Linking.openURL(url);
  };

  const handleDeleteLink = (id) => {
    Alert.alert(
      t.delete,
      '',
      [
        { text: t.cancel, style: 'cancel' },
        {
          text: t.delete,
          style: 'destructive',
          onPress: async () => {
            try {
              await supabase.from('links').delete().eq('id', id);
              setLinks(links.filter(l => l.id !== id));
              Toast.show({ type: 'success', text1: t.deleted });
            } catch (error) {
              console.error('Error deleting:', error);
            }
          },
        },
      ]
    );
  };

  const handleToggleFavorite = async (item) => {
    try {
      const newValue = !item.isFavorite;
      await supabase
        .from('links')
        .update({ isFavorite: newValue })
        .eq('id', item.id);
      
      setLinks(links.map(l => l.id === item.id ? { ...l, isFavorite: newValue } : l));
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const filteredLinks = links.filter(link => {
    const matchesFolder = selectedFolder === 'all' || link.folderId === selectedFolder;
    const matchesSearch = !searchQuery || 
      link.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.url?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  const renderLinkItem = ({ item }) => {
    const folder = folders.find(f => f.id === item.folderId);
    
    return (
      <TouchableOpacity
        style={styles.linkCard}
        onPress={() => handleOpenLink(item.url)}
        onLongPress={() => handleDeleteLink(item.id)}
      >
        {item.imageUrl && (
          <Image source={{ uri: item.imageUrl }} style={styles.linkImage} />
        )}
        <View style={styles.linkContent}>
          <Text style={styles.linkTitle} numberOfLines={2}>
            {item.title || item.url}
          </Text>
          <Text style={styles.linkUrl} numberOfLines={1}>
            {item.url}
          </Text>
          <View style={styles.linkMeta}>
            <View style={styles.folderBadge}>
              <Text style={styles.folderBadgeText}>
                {folder?.isDefault ? t.generalFolder : folder?.name || t.generalFolder}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.linkActions}>
          <TouchableOpacity onPress={() => handleToggleFavorite(item)}>
            <Ionicons
              name={item.isFavorite ? 'heart' : 'heart-outline'}
              size={24}
              color={item.isFavorite ? '#FF3B30' : '#8E8E93'}
            />
          </TouchableOpacity>
        </View>
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

      {/* Add Link */}
      <View style={styles.addContainer}>
        <TextInput
          style={styles.addInput}
          placeholder="https://..."
          placeholderTextColor="#8E8E93"
          value={newUrl}
          onChangeText={setNewUrl}
          autoCapitalize="none"
          keyboardType="url"
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddLink}>
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Folder Filter */}
      <FlatList
        horizontal
        data={[{ id: 'all', name: t.allLinks }, ...folders]}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        style={styles.folderList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.folderChip,
              selectedFolder === item.id && styles.folderChipActive,
            ]}
            onPress={() => setSelectedFolder(item.id)}
          >
            <Text
              style={[
                styles.folderChipText,
                selectedFolder === item.id && styles.folderChipTextActive,
              ]}
            >
              {item.icon || ''} {item.isDefault ? t.generalFolder : item.name}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Links List */}
      <FlatList
        data={filteredLinks}
        keyExtractor={(item) => item.id}
        renderItem={renderLinkItem}
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
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="link-outline" size={64} color="#8E8E93" />
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
    marginBottom: 8,
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
  addContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 8,
    gap: 8,
  },
  addInput: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    paddingHorizontal: 16,
    borderRadius: 12,
    height: 44,
    color: '#FFFFFF',
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#007AFF',
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  folderList: {
    paddingHorizontal: 16,
    marginBottom: 8,
    maxHeight: 44,
  },
  folderChip: {
    backgroundColor: '#1C1C1E',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  folderChipActive: {
    backgroundColor: '#007AFF',
  },
  folderChipText: {
    color: '#8E8E93',
    fontSize: 14,
  },
  folderChipTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  linkCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  linkImage: {
    width: 80,
    height: 80,
  },
  linkContent: {
    flex: 1,
    padding: 12,
  },
  linkTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  linkUrl: {
    color: '#8E8E93',
    fontSize: 12,
    marginBottom: 8,
  },
  linkMeta: {
    flexDirection: 'row',
  },
  folderBadge: {
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  folderBadgeText: {
    color: '#007AFF',
    fontSize: 12,
  },
  linkActions: {
    justifyContent: 'center',
    paddingRight: 12,
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
