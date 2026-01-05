'use client'

import { useState, useEffect } from 'react'
import { Heart, Plus, X, Copy, Trash2, Link as LinkIcon, FileText, Settings as SettingsIcon, Search, Edit2, Clock, Globe, FolderPlus, Folder, MoreVertical, Menu, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { translations, languages, detectLanguage, setLanguage } from '@/lib/i18n'
import { requestNotificationPermission, scheduleReminder, removeReminder, getReminder, initializeReminders, scheduleWeeklyRecap, getSettings, saveSettings } from '@/lib/reminders'

export default function App() {
  const [links, setLinks] = useState([])
  const [folders, setFolders] = useState([])
  const [clipboardFolders, setClipboardFolders] = useState([])
  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedFolder, setSelectedFolder] = useState('all') // 'all' or folder id
  const [selectedClipboardFolder, setSelectedClipboardFolder] = useState('all') // 'all' or folder id
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isReminderDialogOpen, setIsReminderDialogOpen] = useState(false)
  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false)
  const [addType, setAddType] = useState('link')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [currentLanguage, setCurrentLanguage] = useState('en')
  const [settings, setSettingsState] = useState({ enableReminders: true, enableWeeklyRecap: true })
  const { toast } = useToast()
  
  // Form states
  const [newUrl, setNewUrl] = useState('')
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [newTags, setNewTags] = useState('')
  const [newFolderId, setNewFolderId] = useState('')
  
  // Edit states
  const [editingItem, setEditingItem] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editUrl, setEditUrl] = useState('')
  const [editTags, setEditTags] = useState('')
  const [editFolderId, setEditFolderId] = useState('')
  
  // Folder states
  const [editingFolder, setEditingFolder] = useState(null)
  const [folderName, setFolderName] = useState('')
  const [folderIcon, setFolderIcon] = useState('📁')
  
  // Reminder states
  const [reminderItem, setReminderItem] = useState(null)
  const [reminderDate, setReminderDate] = useState('')
  const [reminderTime, setReminderTime] = useState('')
  
  const t = translations[currentLanguage] || translations.en
  
  // Helper function to detect if text contains a valid URL
  const isValidURL = (text) => {
    if (!text || typeof text !== 'string') return false
    
    // Remove whitespace
    const trimmed = text.trim()
    
    // Check for URL patterns
    const urlPattern = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/
    const hasProtocol = /^https?:\/\//i.test(trimmed)
    const hasDomain = /([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}/.test(trimmed)
    
    return urlPattern.test(trimmed) || hasProtocol || hasDomain
  }
  
  // Initialize language and reminders
  useEffect(() => {
    const lang = detectLanguage()
    setCurrentLanguage(lang)
    
    const storedSettings = getSettings()
    setSettingsState(storedSettings)
    
    initializeReminders()
    scheduleWeeklyRecap()
  }, [])
  
  // Fetch folders
  const fetchFolders = async () => {
    try {
      // Fetch ONLY link folders (folderType='link')
      const linkResponse = await fetch('/api/folders?folderType=link')
      if (linkResponse.ok) {
        const linkData = await linkResponse.json()
        setFolders(linkData)
      } else {
        setFolders([])
      }
      
      // Fetch ONLY clipboard folders (folderType='text')
      const clipboardResponse = await fetch('/api/folders?folderType=text')
      if (clipboardResponse.ok) {
        const clipboardData = await clipboardResponse.json()
        setClipboardFolders(clipboardData)
      } else {
        setClipboardFolders([])
      }
      
      // Default to "all" - no folder selected
      // Users can click on folders to filter
    } catch (error) {
      console.error('Error fetching folders:', error)
      setFolders([])
      setClipboardFolders([])
    }
  }
  
  // Fetch links
  const fetchLinks = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/links')
      if (!response.ok) throw new Error('Failed to fetch links')
      const data = await response.json()
      setLinks(data)
    } catch (error) {
      console.error('Error fetching links:', error)
      toast({
        title: t.errorTitle,
        description: t.failedToLoad,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    fetchFolders()
    fetchLinks()
  }, [])
  
  // Change language
  const changeLanguage = (lang) => {
    setCurrentLanguage(lang)
    setLanguage(lang)
  }
  
  // Quick save clipboard item
  const handleQuickSaveClipboard = async () => {
    try {
      if (!newContent.trim()) {
        toast({
          title: t.errorTitle,
          description: t.enterText,
          variant: 'destructive'
        })
        return
      }
      
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newContent.slice(0, 50) + (newContent.length > 50 ? '...' : ''),
          content: newContent,
          contentType: 'text',
          tags: [],
          folderId: selectedClipboardFolder || clipboardFolders.find(f => f.isDefault)?.id
        })
      })
      
      if (!response.ok) throw new Error('Failed to add item')
      
      const result = await response.json()
      setLinks([result.data, ...links])
      
      // Clear input
      setNewContent('')
      
      toast({
        title: t.successTitle,
        description: t.snippetSaved,
      })
    } catch (error) {
      console.error('Error adding clipboard item:', error)
      toast({
        title: t.errorTitle,
        description: t.failedToSave,
        variant: 'destructive'
      })
    }
  }
  
  // Add new link or text
  const handleAdd = async () => {
    try {
      // Determine content type based on whether it's a valid URL
      const hasURL = addType === 'link' && newUrl && isValidURL(newUrl)
      const finalContentType = hasURL ? 'link' : 'text'
      
      // Validation
      if (addType === 'link' && !newUrl) {
        toast({
          title: t.errorTitle,
          description: t.enterUrl,
          variant: 'destructive'
        })
        return
      }
      
      if (addType === 'text' && !newContent) {
        toast({
          title: t.errorTitle,
          description: t.enterText,
          variant: 'destructive'
        })
        return
      }
      
      const tags = newTags.split(',').map(t => t.trim()).filter(t => t)
      
      // If user entered text-only in link field, save as note
      const requestBody = {
        contentType: finalContentType,
        tags: tags
      }
      
      if (finalContentType === 'link') {
        // Save as link
        requestBody.url = newUrl
        requestBody.title = newTitle || null
        requestBody.folderId = newFolderId || selectedFolder || folders.find(f => f.isDefault)?.id
      } else {
        // Save as note (text only)
        requestBody.content = addType === 'text' ? newContent : newUrl
        requestBody.title = newTitle || (addType === 'text' ? newContent : newUrl).slice(0, 50) + '...'
        requestBody.folderId = clipboardFolders.find(f => f.isDefault)?.id
      }
      
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })
      
      if (!response.ok) throw new Error('Failed to add item')
      
      const result = await response.json()
      setLinks([result.data, ...links])
      
      // Reset form
      setNewUrl('')
      setNewTitle('')
      setNewContent('')
      setNewTags('')
      setNewFolderId('')
      setIsAddDialogOpen(false)
      
      toast({
        title: t.successTitle,
        description: finalContentType === 'link' ? t.linkSaved : t.snippetSaved,
      })
    } catch (error) {
      console.error('Error adding item:', error)
      toast({
        title: t.errorTitle,
        description: t.failedToSave,
        variant: 'destructive'
      })
    }
  }
  
  // Open edit dialog
  const openEditDialog = (item) => {
    setEditingItem(item)
    setEditTitle(item.title)
    setEditUrl(item.url || '')
    setEditTags(item.tags?.join(', ') || '')
    setEditFolderId(item.folderId || '')
    setIsEditDialogOpen(true)
  }
  
  // Handle edit
  const handleEdit = async () => {
    try {
      const tags = editTags.split(',').map(t => t.trim()).filter(t => t)
      
      const updateBody = {
        id: editingItem.id,
        title: editTitle,
        tags: tags,
        folderId: editFolderId
      }
      
      // Only include URL for link type items
      if (editingItem.contentType === 'link' && editUrl) {
        updateBody.url = editUrl
      }
      
      const response = await fetch('/api/links', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateBody)
      })
      
      if (!response.ok) throw new Error('Failed to update item')
      
      const result = await response.json()
      setLinks(links.map(link => link.id === editingItem.id ? result.data : link))
      
      setIsEditDialogOpen(false)
      setEditingItem(null)
      
      toast({
        title: t.successTitle,
        description: t.itemUpdated
      })
    } catch (error) {
      console.error('Error updating item:', error)
      toast({
        title: t.errorTitle,
        description: t.failedToUpdate,
        variant: 'destructive'
      })
    }
  }
  
  // Create or edit folder
  const handleSaveFolder = async () => {
    try {
      if (!folderName) {
        toast({
          title: t.errorTitle,
          description: t.enterFolderName,
          variant: 'destructive'
        })
        return
      }
      
      // Determine folderType based on active tab
      const folderType = activeTab === 'clipboard' ? 'text' : 'link'
      
      if (editingFolder) {
        // Update existing folder
        const response = await fetch('/api/folders', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingFolder.id,
            name: folderName,
            icon: folderIcon
          })
        })
        
        if (!response.ok) throw new Error('Failed to update folder')
        
        const result = await response.json()
        
        if (folderType === 'text') {
          setClipboardFolders(clipboardFolders.map(f => f.id === editingFolder.id ? result.data : f))
        } else {
          setFolders(folders.map(f => f.id === editingFolder.id ? result.data : f))
        }
        
        toast({
          title: t.successTitle,
          description: t.folderUpdated
        })
      } else {
        // Create new folder
        const response = await fetch('/api/folders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: folderName,
            icon: folderIcon,
            folderType: folderType
          })
        })
        
        if (!response.ok) throw new Error('Failed to create folder')
        
        const result = await response.json()
        
        if (folderType === 'text') {
          setClipboardFolders([...clipboardFolders, result.data])
          // Track clipboard folder in localStorage
          const clipboardFolderIds = JSON.parse(localStorage.getItem('clipboardFolderIds') || '[]')
          clipboardFolderIds.push(result.data.id)
          localStorage.setItem('clipboardFolderIds', JSON.stringify(clipboardFolderIds))
        } else {
          setFolders([...folders, result.data])
        }
        
        toast({
          title: t.successTitle,
          description: t.folderCreated
        })
      }
      
      setFolderName('')
      setFolderIcon('📁')
      setEditingFolder(null)
      setIsFolderDialogOpen(false)
    } catch (error) {
      console.error('Error saving folder:', error)
      toast({
        title: t.errorTitle,
        description: 'Failed to save folder',
        variant: 'destructive'
      })
    }
  }
  
  // Delete folder
  const handleDeleteFolder = async (folderId) => {
    try {
      const folder = folders.find(f => f.id === folderId)
      if (folder?.isDefault) {
        toast({
          title: t.errorTitle,
          description: 'Cannot delete default folder',
          variant: 'destructive'
        })
        return
      }
      
      if (!window.confirm(t.deleteFolderConfirm)) return
      
      const response = await fetch(`/api/folders?id=${folderId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('Failed to delete folder')
      
      setFolders(folders.filter(f => f.id !== folderId))
      if (selectedFolder === folderId) {
        setSelectedFolder(folders.find(f => f.isDefault)?.id || null)
      }
      
      toast({
        title: t.successTitle,
        description: t.folderDeleted
      })
    } catch (error) {
      console.error('Error deleting folder:', error)
      toast({
        title: t.errorTitle,
        description: 'Failed to delete folder',
        variant: 'destructive'
      })
    }
  }
  
  // Open reminder dialog
  const openReminderDialog = (item) => {
    setReminderItem(item)
    const existingReminder = getReminder(item.id)
    
    if (existingReminder) {
      const date = new Date(existingReminder.reminderTime)
      setReminderDate(date.toISOString().split('T')[0])
      setReminderTime(date.toTimeString().slice(0, 5))
    } else {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(9, 0, 0, 0)
      setReminderDate(tomorrow.toISOString().split('T')[0])
      setReminderTime('09:00')
    }
    
    setIsReminderDialogOpen(true)
  }
  
  // Schedule reminder
  const handleScheduleReminder = async () => {
    try {
      if (!settings.enableReminders) {
        toast({
          title: t.errorTitle,
          description: 'Please enable reminders in settings first',
          variant: 'destructive'
        })
        return
      }
      
      const permitted = await requestNotificationPermission()
      if (!permitted) {
        toast({
          title: t.errorTitle,
          description: t.notificationPermissionDenied,
          variant: 'destructive'
        })
        return
      }
      
      const reminderDateTime = new Date(`${reminderDate}T${reminderTime}`)
      scheduleReminder(reminderItem.id, reminderItem.title, reminderDateTime)
      
      setIsReminderDialogOpen(false)
      
      toast({
        title: t.successTitle,
        description: `${t.reminderScheduled} ${reminderDateTime.toLocaleString()}`,
      })
    } catch (error) {
      console.error('Error scheduling reminder:', error)
      toast({
        title: t.errorTitle,
        description: 'Failed to schedule reminder',
        variant: 'destructive'
      })
    }
  }
  
  // Remove reminder
  const handleRemoveReminder = () => {
    removeReminder(reminderItem.id)
    setIsReminderDialogOpen(false)
    toast({
      title: t.successTitle,
      description: t.reminderRemoved
    })
  }
  
  // Toggle favorite
  const toggleFavorite = async (id, currentState) => {
    try {
      const response = await fetch('/api/links', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: id,
          isFavorite: !currentState
        })
      })
      
      if (!response.ok) throw new Error('Failed to update favorite')
      
      setLinks(links.map(link => 
        link.id === id ? { ...link, isFavorite: !currentState } : link
      ))
      
      toast({
        title: !currentState ? t.addedToFavorites : t.removedFromFavorites,
        description: ''
      })
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast({
        title: t.errorTitle,
        description: t.failedToUpdate,
        variant: 'destructive'
      })
    }
  }
  
  // Delete link
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/links?id=${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('Failed to delete')
      
      setLinks(links.filter(link => link.id !== id))
      removeReminder(id)
      
      toast({
        title: t.deleted,
        description: t.itemRemoved
      })
    } catch (error) {
      console.error('Error deleting:', error)
      toast({
        title: t.errorTitle,
        description: t.failedToDelete,
        variant: 'destructive'
      })
    }
  }
  
  // Copy to clipboard
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
    toast({
      title: t.copied,
      description: t.copiedToClipboard
    })
  }
  
  // Open link
  const handleOpenLink = (url) => {
    window.open(url, '_blank')
  }
  
  // Delete all data
  const handleDeleteAllData = async () => {
    if (window.confirm(t.deleteConfirm)) {
      try {
        for (const link of links) {
          await fetch(`/api/links?id=${link.id}`, { method: 'DELETE' })
        }
        setLinks([])
        localStorage.clear()
        
        toast({
          title: t.successTitle,
          description: 'All data deleted'
        })
      } catch (error) {
        console.error('Error deleting all data:', error)
        toast({
          title: t.errorTitle,
          description: 'Failed to delete all data',
          variant: 'destructive'
        })
      }
    }
  }
  
  // Update settings
  const updateSettings = (key, value) => {
    const newSettings = { ...settings, [key]: value }
    setSettingsState(newSettings)
    saveSettings(newSettings)
    
    if (key === 'enableWeeklyRecap' && value) {
      scheduleWeeklyRecap()
    }
  }
  
  // Filter links based on active tab, folder and search
  const filteredLinks = links.filter(link => {
    // STRICT CONTENT TYPE SEPARATION
    
    // Dashboard: ONLY links (contentType='link')
    if (activeTab === 'dashboard' && link.contentType !== 'link') return false
    
    // Clipboard: ONLY text (contentType='text')
    if (activeTab === 'clipboard' && link.contentType !== 'text') return false
    
    // Favorites: Both types, but must be favorited
    if (activeTab === 'favorites' && !link.isFavorite) return false
    
    // Settings: No items shown
    if (activeTab === 'settings') return false
    
    // Folder filter (skip if "all" is selected)
    if (activeTab === 'dashboard' && selectedFolder && selectedFolder !== 'all') {
      if (link.folderId !== selectedFolder) return false
    }
    if (activeTab === 'clipboard' && selectedClipboardFolder && selectedClipboardFolder !== 'all') {
      if (link.folderId !== selectedClipboardFolder) return false
    }
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        link.title?.toLowerCase().includes(query) ||
        link.url?.toLowerCase().includes(query) ||
        link.content?.toLowerCase().includes(query) ||
        link.tags?.some(tag => tag.toLowerCase().includes(query))
      )
    }
    
    return true
  })
  
  // Get unique tags
  const allTags = [...new Set(links.flatMap(link => link.tags || []))]
  
  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar - Only on desktop and dashboard/clipboard tabs */}
      {(activeTab === 'dashboard' || activeTab === 'clipboard') && (
        <div className="relative flex">
          <aside 
            className={`
              flex flex-col bg-black border-r border-[#2C2C2E]
              transition-all duration-300 ease-in-out
              ${sidebarOpen ? 'w-64' : 'w-0'}
              overflow-hidden
            `}
          >
            {/* Sidebar Content */}
            <div className="w-64 flex flex-col h-full">
              <div className="p-4 border-b border-[#2C2C2E]">
                <h2 className="text-lg font-semibold mb-4">{t.folders}</h2>
                <Button
                  onClick={() => {
                    setEditingFolder(null)
                    setFolderName('')
                    setFolderIcon('📁')
                    setIsFolderDialogOpen(true)
                  }}
                  className="w-full rounded-2xl bg-[#007AFF] hover:bg-[#0051D5] text-sm"
                  size="sm"
                >
                  <FolderPlus className="w-4 h-4 mr-2" />
                  {t.newFolder}
                </Button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-2">
              {/* "All" option at the top */}
              <div
                className={`group flex items-center justify-between p-3 rounded-2xl mb-3 cursor-pointer transition-all ${
                  (activeTab === 'dashboard' ? selectedFolder : selectedClipboardFolder) === 'all'
                    ? 'bg-[#007AFF] text-white'
                    : 'hover:bg-[#1C1C1E] text-[#8E8E93] hover:text-white'
                }`}
                onClick={() => activeTab === 'dashboard' ? setSelectedFolder('all') : setSelectedClipboardFolder('all')}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-2xl flex-shrink-0">📂</span>
                  <span className="truncate font-bold text-base">
                    {activeTab === 'dashboard' ? 'All Links' : 'All Clipboards'}
                  </span>
                </div>
              </div>
              
              {/* Separator */}
              <div className="border-t border-[#2C2C2E] mb-2"></div>
              
              {/* Folders list */}
              {(activeTab === 'dashboard' ? folders : clipboardFolders).map((folder) => (
                <div
                  key={folder.id}
                  className={`group flex items-center justify-between p-3 rounded-2xl mb-1 cursor-pointer transition-all ${
                    (activeTab === 'dashboard' ? selectedFolder : selectedClipboardFolder) === folder.id
                      ? 'bg-[#007AFF] text-white'
                      : 'hover:bg-[#1C1C1E] text-[#8E8E93] hover:text-white'
                  }`}
                  onClick={() => activeTab === 'dashboard' ? setSelectedFolder(folder.id) : setSelectedClipboardFolder(folder.id)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-2xl flex-shrink-0">{folder.icon}</span>
                    <span className="truncate font-semibold text-base">
                      {folder.isDefault ? t.generalFolder : folder.name}
                    </span>
                  </div>
                  
                  {!folder.isDefault && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-white/10"
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingFolder(folder)
                          setFolderName(folder.name)
                          setFolderIcon(folder.icon)
                          setIsFolderDialogOpen(true)
                        }}
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-red-500/10 text-red-500"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteFolder(folder.id)
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            </div>
          </aside>
          
          {/* Integrated Chevron Button - Always visible, OUTSIDE sidebar */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`
              absolute top-1/2 -translate-y-1/2 
              w-6 h-12 
              bg-[#1C1C1E] hover:bg-[#2C2C2E]
              border border-[#2C2C2E]
              rounded-r-lg
              flex items-center justify-center
              transition-all duration-300 ease-in-out
              ${sidebarOpen ? 'left-64' : 'left-0'}
              z-50
              cursor-pointer
              group/toggle
            `}
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <div className="transition-transform duration-300 ease-in-out group-hover/toggle:scale-110">
              {sidebarOpen ? (
                <ChevronLeft className="w-4 h-4 text-[#8E8E93] group-hover/toggle:text-white" />
              ) : (
                <ChevronRight className="w-4 h-4 text-[#8E8E93] group-hover/toggle:text-white" />
              )}
            </div>
          </button>
        </div>
      )}
      
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-[#2C2C2E] bg-black/95 backdrop-blur-xl">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-2xl font-bold bg-gradient-to-r from-[#007AFF] to-[#00D4FF] bg-clip-text text-transparent">
                  {t.appName}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {(activeTab === 'dashboard' || activeTab === 'clipboard') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="hidden md:flex rounded-full hover:bg-[#1C1C1E]"
                  >
                    <Menu className="w-5 h-5" />
                  </Button>
                )}
                <Select value={currentLanguage} onValueChange={changeLanguage}>
                  <SelectTrigger className="w-[140px] bg-[#1C1C1E] border-[#2C2C2E] rounded-2xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1C1C1E] border-[#2C2C2E]">
                    {languages.map(lang => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.flag} {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {/* Only show Add button on dashboard and favorites tabs */}
                {activeTab !== 'clipboard' && activeTab !== 'settings' && (
                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                      className="rounded-full bg-[#007AFF] hover:bg-[#0051D5] transition-all duration-300 shadow-lg shadow-[#007AFF]/20"
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {t.addNew}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-[#1C1C1E] border-[#2C2C2E] text-white rounded-3xl">
                    <DialogHeader>
                      <DialogTitle className="text-xl">{t.addNewItem}</DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4 mt-4">
                      <div className="flex gap-2">
                        <Button
                          variant={addType === 'link' ? 'default' : 'outline'}
                          onClick={() => setAddType('link')}
                          className={`flex-1 rounded-2xl ${addType === 'link' ? 'bg-[#007AFF] text-white hover:bg-[#0051D5]' : 'border-[#2C2C2E] bg-transparent text-white hover:bg-[#2C2C2E]'}`}
                        >
                          <LinkIcon className="w-4 h-4 mr-2" />
                          {t.link}
                        </Button>
                        <Button
                          variant={addType === 'text' ? 'default' : 'outline'}
                          onClick={() => setAddType('text')}
                          className={`flex-1 rounded-2xl ${addType === 'text' ? 'bg-[#007AFF] text-white hover:bg-[#0051D5]' : 'border-[#2C2C2E] bg-transparent text-white hover:bg-[#2C2C2E]'}`}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          {t.snippet}
                        </Button>
                      </div>
                      
                      {addType === 'link' ? (
                        <>
                          <Input
                            placeholder={t.pasteUrl}
                            value={newUrl}
                            onChange={(e) => setNewUrl(e.target.value)}
                            className="bg-black border-[#2C2C2E] rounded-2xl focus:border-[#007AFF]"
                          />
                          <Input
                            placeholder={t.titleOptional}
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            className="bg-black border-[#2C2C2E] rounded-2xl focus:border-[#007AFF]"
                          />
                          <Select value={newFolderId} onValueChange={setNewFolderId}>
                            <SelectTrigger className="bg-black border-[#2C2C2E] rounded-2xl">
                              <SelectValue placeholder={t.selectFolder} />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1C1C1E] border-[#2C2C2E]">
                              {folders.map(folder => (
                                <SelectItem key={folder.id} value={folder.id}>
                                  {folder.icon} {folder.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </>
                      ) : (
                        <>
                          <Input
                            placeholder={t.titleRequired}
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            className="bg-black border-[#2C2C2E] rounded-2xl focus:border-[#007AFF]"
                          />
                          <Textarea
                            placeholder={t.pasteSnippet}
                            value={newContent}
                            onChange={(e) => setNewContent(e.target.value)}
                            className="bg-black border-[#2C2C2E] rounded-2xl min-h-[120px] focus:border-[#007AFF]"
                          />
                          <Select value={newFolderId} onValueChange={setNewFolderId}>
                            <SelectTrigger className="bg-black border-[#2C2C2E] rounded-2xl">
                              <SelectValue placeholder={t.selectFolder} />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1C1C1E] border-[#2C2C2E]">
                              {clipboardFolders.map(folder => (
                                <SelectItem key={folder.id} value={folder.id}>
                                  {folder.icon} {folder.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </>
                      )}
                      
                      <Input
                        placeholder={t.tagsPlaceholder}
                        value={newTags}
                        onChange={(e) => setNewTags(e.target.value)}
                        className="bg-black border-[#2C2C2E] rounded-2xl focus:border-[#007AFF]"
                      />
                      
                      <Button 
                        onClick={handleAdd}
                        className="w-full rounded-2xl bg-[#007AFF] hover:bg-[#0051D5] transition-all duration-300"
                      >
                        {t.save}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                )}
              </div>
            </div>
            
            {/* Search and tags - only on dashboard and favorites */}
            {activeTab !== 'settings' && activeTab !== 'clipboard' && (
              <>
                <div className="mt-4 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#8E8E93]" />
                  <Input
                    placeholder={t.searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 bg-[#1C1C1E] border-[#2C2C2E] rounded-2xl focus:border-[#007AFF] transition-all"
                  />
                </div>
                
                {allTags.length > 0 && (
                  <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {allTags.map((tag, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="bg-[#1C1C1E] text-[#007AFF] border border-[#007AFF]/20 rounded-full px-4 py-1 text-sm whitespace-nowrap cursor-pointer hover:bg-[#007AFF] hover:text-white transition-all"
                        onClick={() => setSearchQuery(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </header>
        
        {/* Main content area */}
        <main className="flex-1 container mx-auto px-4 py-6 pb-24 overflow-y-auto">
          {activeTab === 'clipboard' ? (
            // Pure Clipboard Manager - Text + Emojis Only
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Quick Add Input */}
              <div className="bg-[#1C1C1E] rounded-3xl p-6 border border-[#2C2C2E]">
                <Textarea
                  placeholder="Paste text or emojis here... 📋✨"
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="bg-black border-[#2C2C2E] rounded-2xl min-h-[120px] focus:border-[#007AFF] mb-4 text-base resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      handleQuickSaveClipboard()
                    }
                  }}
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#8E8E93]">
                    {newContent.length} characters • Cmd/Ctrl + Enter to save
                  </span>
                  <Button
                    onClick={handleQuickSaveClipboard}
                    disabled={!newContent.trim()}
                    className="rounded-2xl bg-[#007AFF] hover:bg-[#0051D5] disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                </div>
              </div>
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#8E8E93]" />
                <Input
                  placeholder="Search clipboard..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 bg-[#1C1C1E] border-[#2C2C2E] rounded-2xl focus:border-[#007AFF]"
                />
              </div>
              
              {/* Clipboard Items */}
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#007AFF]"></div>
                </div>
              ) : filteredLinks.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📋</div>
                  <h3 className="text-xl font-semibold mb-2">No clipboard items</h3>
                  <p className="text-[#8E8E93]">
                    Paste text or emojis above to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredLinks.map((item) => (
                    <div
                      key={item.id}
                      className="group bg-[#1C1C1E] rounded-2xl p-4 border border-[#2C2C2E] hover:border-[#007AFF]/50 transition-all"
                    >
                      <div className="flex items-start gap-3">
                        {/* Content Preview */}
                        <div className="flex-1 min-w-0">
                          <p className="text-base break-words whitespace-pre-wrap line-clamp-3">
                            {item.content}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs text-[#8E8E93]">
                              {item.content?.length || 0} chars
                            </span>
                            {item.tags && item.tags.length > 0 && (
                              <div className="flex gap-1">
                                {item.tags.slice(0, 2).map((tag, idx) => (
                                  <Badge
                                    key={idx}
                                    className="bg-[#007AFF]/10 text-[#007AFF] text-xs rounded-full px-2 py-0"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {/* Copy Button - Primary Action */}
                          <Button
                            onClick={() => handleCopy(item.content)}
                            className="rounded-full bg-[#007AFF] hover:bg-[#0051D5] h-10 px-4"
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Copy
                          </Button>
                          
                          {/* Delete Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(item.id)}
                            className="rounded-full hover:bg-red-500/10 text-red-500 h-10 w-10 p-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : activeTab === 'settings' ? (
            <div className="max-w-2xl mx-auto space-y-6">
              <h2 className="text-2xl font-bold mb-6">{t.settings}</h2>
              
              <div className="bg-[#1C1C1E] rounded-3xl p-6 border border-[#2C2C2E]">
                <div className="flex items-center gap-3 mb-4">
                  <Globe className="w-5 h-5 text-[#007AFF]" />
                  <h3 className="text-lg font-semibold">{t.language}</h3>
                </div>
                <Select value={currentLanguage} onValueChange={changeLanguage}>
                  <SelectTrigger className="w-full bg-black border-[#2C2C2E] rounded-2xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1C1C1E] border-[#2C2C2E]">
                    {languages.map(lang => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.flag} {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="bg-[#1C1C1E] rounded-3xl p-6 border border-[#2C2C2E]">
                <h3 className="text-lg font-semibold mb-4">{t.notifications}</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{t.enableReminders}</p>
                    </div>
                    <Switch
                      checked={settings.enableReminders}
                      onCheckedChange={(checked) => updateSettings('enableReminders', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{t.enableWeeklyRecap}</p>
                      <p className="text-sm text-[#8E8E93]">{t.weeklyRecapDesc}</p>
                    </div>
                    <Switch
                      checked={settings.enableWeeklyRecap}
                      onCheckedChange={(checked) => updateSettings('enableWeeklyRecap', checked)}
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-[#1C1C1E] rounded-3xl p-6 border border-[#2C2C2E]">
                <h3 className="text-lg font-semibold mb-4">{t.account}</h3>
                <Button
                  onClick={handleDeleteAllData}
                  variant="destructive"
                  className="w-full rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white"
                >
                  {t.deleteAllData}
                </Button>
              </div>
              
              <div className="bg-[#1C1C1E] rounded-3xl p-6 border border-[#2C2C2E]">
                <div className="space-y-3">
                  <a 
                    href="/terms"
                    className="block w-full text-left text-[#007AFF] hover:underline py-2"
                  >
                    {t.termsOfService}
                  </a>
                  <a 
                    href="/privacy"
                    className="block w-full text-left text-[#007AFF] hover:underline py-2"
                  >
                    {t.privacyPolicy}
                  </a>
                </div>
              </div>
              
              <div className="text-center text-[#8E8E93] text-sm">
                {t.version} 1.0.0 MVP
              </div>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#007AFF]"></div>
            </div>
          ) : filteredLinks.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📱</div>
              <h3 className="text-xl font-semibold mb-2">{t.noItemsYet}</h3>
              <p className="text-[#8E8E93] mb-6">
                {activeTab === 'favorites' ? t.noFavorites : 
                 activeTab === 'clipboard' ? t.noClipboard :
                 t.noLinks}
              </p>
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                className="rounded-full bg-[#007AFF] hover:bg-[#0051D5]"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t.addFirstItem}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLinks.map((item) => {
                const hasReminder = getReminder(item.id)
                
                return (
                  <div
                    key={item.id}
                    className="group bg-[#1C1C1E] rounded-3xl overflow-hidden border border-[#2C2C2E] hover:border-[#007AFF]/50 transition-all duration-300 hover:shadow-xl hover:shadow-[#007AFF]/10"
                  >
                    {item.contentType === 'link' && item.imageUrl && (
                      <div 
                        className="w-full h-48 bg-cover bg-center cursor-pointer"
                        style={{ backgroundImage: `url(${item.imageUrl})` }}
                        onClick={() => handleOpenLink(item.url)}
                      />
                    )}
                    
                    <div className="p-5">
                      <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                        {item.title}
                      </h3>
                      
                      {item.contentType === 'link' && item.url && (() => {
                        try {
                          let fullUrl = item.url
                          if (!item.url.startsWith('http://') && !item.url.startsWith('https://')) {
                            fullUrl = 'https://' + item.url
                          }
                          return (
                            <p className="text-sm text-[#8E8E93] mb-3 line-clamp-1">
                              {new URL(fullUrl).hostname}
                            </p>
                          )
                        } catch {
                          return (
                            <p className="text-sm text-[#8E8E93] mb-3 line-clamp-1">
                              {item.url}
                            </p>
                          )
                        }
                      })()}
                      
                      {item.contentType === 'text' && item.content && (
                        <p className="text-sm text-[#8E8E93] mb-3 line-clamp-3">
                          {item.content}
                        </p>
                      )}
                      
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {item.tags.map((tag, idx) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="bg-[#007AFF]/10 text-[#007AFF] text-xs rounded-full"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      {hasReminder && (
                        <div className="mb-3 flex items-center gap-2 text-xs text-[#00D4FF]">
                          <Clock className="w-4 h-4" />
                          {t.reminderSet} {new Date(hasReminder.reminderTime).toLocaleString()}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 flex-wrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleFavorite(item.id, item.isFavorite)}
                          className="rounded-full hover:bg-[#007AFF]/10"
                        >
                          <Heart 
                            className={`w-5 h-5 ${item.isFavorite ? 'fill-red-500 text-red-500' : 'text-[#8E8E93]'}`}
                          />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(item)}
                          className="rounded-full hover:bg-[#007AFF]/10 text-[#007AFF]"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        
                        {item.contentType === 'link' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openReminderDialog(item)}
                            className="rounded-full hover:bg-[#007AFF]/10 text-[#00D4FF]"
                          >
                            <Clock className="w-4 h-4" />
                          </Button>
                        )}
                        
                        {item.contentType === 'text' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(item.content)}
                            className="flex-1 rounded-full hover:bg-[#007AFF]/10 text-[#007AFF]"
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            {t.quickCopy}
                          </Button>
                        )}
                        
                        {item.contentType === 'link' && item.url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenLink(item.url)}
                            className="flex-1 rounded-full hover:bg-[#007AFF]/10 text-[#007AFF]"
                          >
                            <LinkIcon className="w-4 h-4 mr-2" />
                            {t.open}
                          </Button>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                          className="rounded-full hover:bg-red-500/10 text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </main>
        
        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-[#1C1C1E] border-[#2C2C2E] text-white rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-xl">{t.editItem}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm text-[#8E8E93] mb-2 block">{t.editTitle}</label>
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="bg-black border-[#2C2C2E] rounded-2xl focus:border-[#007AFF]"
                />
              </div>
              
              {editingItem?.contentType === 'link' && (
                <div>
                  <label className="text-sm text-[#8E8E93] mb-2 block">Edit URL</label>
                  <Input
                    value={editUrl}
                    onChange={(e) => setEditUrl(e.target.value)}
                    className="bg-black border-[#2C2C2E] rounded-2xl focus:border-[#007AFF]"
                    placeholder="https://example.com"
                  />
                </div>
              )}
              
              <div>
                <label className="text-sm text-[#8E8E93] mb-2 block">{t.editTags}</label>
                <Input
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                  className="bg-black border-[#2C2C2E] rounded-2xl focus:border-[#007AFF]"
                />
              </div>
              
              {editingItem?.contentType === 'link' && (
                <div>
                  <label className="text-sm text-[#8E8E93] mb-2 block">{t.moveToFolder}</label>
                  <Select value={editFolderId} onValueChange={setEditFolderId}>
                    <SelectTrigger className="bg-black border-[#2C2C2E] rounded-2xl">
                      <SelectValue placeholder={t.selectFolder} />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1C1C1E] border-[#2C2C2E]">
                      {folders.map(folder => (
                        <SelectItem key={folder.id} value={folder.id}>
                          {folder.icon} {folder.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {editingItem?.contentType === 'text' && (
                <div>
                  <label className="text-sm text-[#8E8E93] mb-2 block">{t.moveToFolder}</label>
                  <Select value={editFolderId} onValueChange={setEditFolderId}>
                    <SelectTrigger className="bg-black border-[#2C2C2E] rounded-2xl">
                      <SelectValue placeholder={t.selectFolder} />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1C1C1E] border-[#2C2C2E]">
                      {clipboardFolders.map(folder => (
                        <SelectItem key={folder.id} value={folder.id}>
                          {folder.icon} {folder.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => setIsEditDialogOpen(false)}
                  variant="outline"
                  className="flex-1 rounded-2xl border-[#2C2C2E] text-white bg-transparent hover:bg-[#2C2C2E]"
                >
                  {t.cancel}
                </Button>
                <Button 
                  onClick={handleEdit}
                  className="flex-1 rounded-2xl bg-[#007AFF] hover:bg-[#0051D5] text-white"
                >
                  {t.update}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Folder Dialog */}
        <Dialog open={isFolderDialogOpen} onOpenChange={setIsFolderDialogOpen}>
          <DialogContent className="bg-[#1C1C1E] border-[#2C2C2E] text-white rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-xl">
                {editingFolder ? t.editFolder : t.createFolder}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm text-[#8E8E93] mb-2 block">{t.folderName}</label>
                <Input
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  placeholder="My Folder"
                  className="bg-black border-[#2C2C2E] rounded-2xl focus:border-[#007AFF]"
                />
              </div>
              
              <div>
                <label className="text-sm text-[#8E8E93] mb-2 block">{t.folderIcon}</label>
                <div className="space-y-3">
                  <Input
                    value={folderIcon}
                    onChange={(e) => setFolderIcon(e.target.value)}
                    placeholder="📁"
                    className="bg-black border-[#2C2C2E] rounded-2xl focus:border-[#007AFF] text-center text-2xl"
                    maxLength={2}
                  />
                  
                  <div className="bg-black border border-[#2C2C2E] rounded-2xl p-3 max-h-48 overflow-y-auto">
                    <div className="space-y-3">
                      {/* Work & Professional */}
                      <div>
                        <p className="text-xs text-[#8E8E93] mb-2">💼 Work & Professional</p>
                        <div className="flex flex-wrap gap-2">
                          {['💼', '📊', '📈', '💻', '⚙️', '🔧', '📝', '📅', '📌', '🎯'].map(emoji => (
                            <button
                              key={emoji}
                              onClick={() => setFolderIcon(emoji)}
                              className="text-2xl hover:scale-125 transition-transform p-1"
                              type="button"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Creative & Design */}
                      <div>
                        <p className="text-xs text-[#8E8E93] mb-2">🎨 Creative & Design</p>
                        <div className="flex flex-wrap gap-2">
                          {['🎨', '✏️', '🖌️', '🖍️', '📐', '📏', '🎭', '🎬', '📸', '🎥'].map(emoji => (
                            <button
                              key={emoji}
                              onClick={() => setFolderIcon(emoji)}
                              className="text-2xl hover:scale-125 transition-transform p-1"
                              type="button"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Learning & Education */}
                      <div>
                        <p className="text-xs text-[#8E8E93] mb-2">📚 Learning & Education</p>
                        <div className="flex flex-wrap gap-2">
                          {['📚', '📖', '✍️', '🎓', '🧠', '💡', '🔬', '🧪', '📊', '📉'].map(emoji => (
                            <button
                              key={emoji}
                              onClick={() => setFolderIcon(emoji)}
                              className="text-2xl hover:scale-125 transition-transform p-1"
                              type="button"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Personal & Lifestyle */}
                      <div>
                        <p className="text-xs text-[#8E8E93] mb-2">🏠 Personal & Lifestyle</p>
                        <div className="flex flex-wrap gap-2">
                          {['🏠', '👨‍👩‍👧', '❤️', '🎁', '🎉', '🎂', '☕', '🍕', '🛒', '💪'].map(emoji => (
                            <button
                              key={emoji}
                              onClick={() => setFolderIcon(emoji)}
                              className="text-2xl hover:scale-125 transition-transform p-1"
                              type="button"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Travel & Adventure */}
                      <div>
                        <p className="text-xs text-[#8E8E93] mb-2">✈️ Travel & Adventure</p>
                        <div className="flex flex-wrap gap-2">
                          {['✈️', '🌍', '🗺️', '🏖️', '🏔️', '🏕️', '🚗', '🚂', '🎒', '📍'].map(emoji => (
                            <button
                              key={emoji}
                              onClick={() => setFolderIcon(emoji)}
                              className="text-2xl hover:scale-125 transition-transform p-1"
                              type="button"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Health & Fitness */}
                      <div>
                        <p className="text-xs text-[#8E8E93] mb-2">💪 Health & Fitness</p>
                        <div className="flex flex-wrap gap-2">
                          {['💪', '🏃', '🧘', '🏋️', '🚴', '⚽', '🏊', '🥗', '🍎', '💊'].map(emoji => (
                            <button
                              key={emoji}
                              onClick={() => setFolderIcon(emoji)}
                              className="text-2xl hover:scale-125 transition-transform p-1"
                              type="button"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Finance & Money */}
                      <div>
                        <p className="text-xs text-[#8E8E93] mb-2">💰 Finance & Money</p>
                        <div className="flex flex-wrap gap-2">
                          {['💰', '💵', '💳', '🏦', '📊', '💹', '🪙', '💸', '🤑', '💎'].map(emoji => (
                            <button
                              key={emoji}
                              onClick={() => setFolderIcon(emoji)}
                              className="text-2xl hover:scale-125 transition-transform p-1"
                              type="button"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Tech & Dev */}
                      <div>
                        <p className="text-xs text-[#8E8E93] mb-2">⚡ Tech & Development</p>
                        <div className="flex flex-wrap gap-2">
                          {['⚡', '🔌', '🖥️', '⌨️', '🖱️', '📱', '💾', '🔒', '🌐', '🤖'].map(emoji => (
                            <button
                              key={emoji}
                              onClick={() => setFolderIcon(emoji)}
                              className="text-2xl hover:scale-125 transition-transform p-1"
                              type="button"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Social & Communication */}
                      <div>
                        <p className="text-xs text-[#8E8E93] mb-2">💬 Social & Communication</p>
                        <div className="flex flex-wrap gap-2">
                          {['💬', '📧', '📞', '📱', '👥', '🗣️', '💭', '📢', '🎤', '📣'].map(emoji => (
                            <button
                              key={emoji}
                              onClick={() => setFolderIcon(emoji)}
                              className="text-2xl hover:scale-125 transition-transform p-1"
                              type="button"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Projects & Tasks */}
                      <div>
                        <p className="text-xs text-[#8E8E93] mb-2">✅ Projects & Tasks</p>
                        <div className="flex flex-wrap gap-2">
                          {['✅', '📋', '📌', '🎯', '🏆', '⭐', '🔥', '⚡', '🚀', '🎪'].map(emoji => (
                            <button
                              key={emoji}
                              onClick={() => setFolderIcon(emoji)}
                              className="text-2xl hover:scale-125 transition-transform p-1"
                              type="button"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => {
                    setIsFolderDialogOpen(false)
                    setEditingFolder(null)
                  }}
                  variant="outline"
                  className="flex-1 rounded-2xl border-[#2C2C2E] text-white bg-transparent hover:bg-[#2C2C2E]"
                >
                  {t.cancel}
                </Button>
                <Button 
                  onClick={handleSaveFolder}
                  className="flex-1 rounded-2xl bg-[#007AFF] hover:bg-[#0051D5] text-white"
                >
                  {editingFolder ? t.update : t.save}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Reminder Dialog */}
        <Dialog open={isReminderDialogOpen} onOpenChange={setIsReminderDialogOpen}>
          <DialogContent className="bg-[#1C1C1E] border-[#2C2C2E] text-white rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-xl">{t.setReminder}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm text-[#8E8E93] mb-2 block">{t.reminderDate}</label>
                <Input
                  type="date"
                  value={reminderDate}
                  onChange={(e) => setReminderDate(e.target.value)}
                  className="bg-black border-[#2C2C2E] rounded-2xl focus:border-[#007AFF]"
                />
              </div>
              
              <div>
                <label className="text-sm text-[#8E8E93] mb-2 block">{t.reminderTime}</label>
                <Input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="bg-black border-[#2C2C2E] rounded-2xl focus:border-[#007AFF]"
                />
              </div>
              
              <div className="flex gap-2">
                {getReminder(reminderItem?.id) && (
                  <Button 
                    onClick={handleRemoveReminder}
                    variant="outline"
                    className="flex-1 rounded-2xl border-red-500 text-red-500 hover:bg-red-500/10"
                  >
                    {t.removeReminder}
                  </Button>
                )}
                <Button 
                  onClick={handleScheduleReminder}
                  className="flex-1 rounded-2xl bg-[#007AFF] hover:bg-[#0051D5]"
                >
                  {t.scheduleReminder}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Bottom navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-[#1C1C1E]/95 backdrop-blur-xl border-t border-[#2C2C2E] z-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-around py-3">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex flex-col items-center gap-1 py-2 px-4 rounded-2xl transition-all ${
                  activeTab === 'dashboard' ? 'text-[#007AFF]' : 'text-[#8E8E93]'
                }`}
              >
                <LinkIcon className="w-6 h-6" />
                <span className="text-xs font-medium">{t.tabLinks}</span>
              </button>
              
              <button
                onClick={() => setActiveTab('clipboard')}
                className={`flex flex-col items-center gap-1 py-2 px-4 rounded-2xl transition-all ${
                  activeTab === 'clipboard' ? 'text-[#007AFF]' : 'text-[#8E8E93]'
                }`}
              >
                <FileText className="w-6 h-6" />
                <span className="text-xs font-medium">{t.tabClipboard}</span>
              </button>
              
              <button
                onClick={() => setActiveTab('favorites')}
                className={`flex flex-col items-center gap-1 py-2 px-4 rounded-2xl transition-all ${
                  activeTab === 'favorites' ? 'text-[#007AFF]' : 'text-[#8E8E93]'
                }`}
              >
                <Heart className={`w-6 h-6 ${activeTab === 'favorites' ? 'fill-[#007AFF]' : ''}`} />
                <span className="text-xs font-medium">{t.tabFavorites}</span>
              </button>
              
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex flex-col items-center gap-1 py-2 px-4 rounded-2xl transition-all ${
                  activeTab === 'settings' ? 'text-[#007AFF]' : 'text-[#8E8E93]'
                }`}
              >
                <SettingsIcon className="w-6 h-6" />
                <span className="text-xs font-medium">{t.tabSettings}</span>
              </button>
            </div>
          </div>
        </nav>
      </div>
    </div>
  )
}
