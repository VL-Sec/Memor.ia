'use client'

import { useState, useEffect } from 'react'
import { Heart, Plus, X, Copy, Trash2, Link as LinkIcon, FileText, Settings as SettingsIcon, Search, Tag as TagIcon, Edit2, Clock, Globe } from 'lucide-react'
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
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isReminderDialogOpen, setIsReminderDialogOpen] = useState(false)
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
  
  // Edit states
  const [editingItem, setEditingItem] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editTags, setEditTags] = useState('')
  
  // Reminder states
  const [reminderItem, setReminderItem] = useState(null)
  const [reminderDate, setReminderDate] = useState('')
  const [reminderTime, setReminderTime] = useState('')
  
  const t = translations[currentLanguage] || translations.en
  
  // Initialize language and reminders
  useEffect(() => {
    const lang = detectLanguage()
    setCurrentLanguage(lang)
    
    const storedSettings = getSettings()
    setSettingsState(storedSettings)
    
    initializeReminders()
    scheduleWeeklyRecap()
  }, [])
  
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
    fetchLinks()
  }, [])
  
  // Change language
  const changeLanguage = (lang) => {
    setCurrentLanguage(lang)
    setLanguage(lang)
  }
  
  // Add new link or text
  const handleAdd = async () => {
    try {
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
      
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: addType === 'link' ? newUrl : null,
          title: newTitle || null,
          content: addType === 'text' ? newContent : null,
          contentType: addType,
          tags: tags
        })
      })
      
      if (!response.ok) throw new Error('Failed to add item')
      
      const result = await response.json()
      setLinks([result.data, ...links])
      
      // Reset form
      setNewUrl('')
      setNewTitle('')
      setNewContent('')
      setNewTags('')
      setIsAddDialogOpen(false)
      
      toast({
        title: t.successTitle,
        description: addType === 'link' ? t.linkSaved : t.snippetSaved,
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
    setEditTags(item.tags?.join(', ') || '')
    setIsEditDialogOpen(true)
  }
  
  // Handle edit
  const handleEdit = async () => {
    try {
      const tags = editTags.split(',').map(t => t.trim()).filter(t => t)
      
      const response = await fetch('/api/links', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingItem.id,
          title: editTitle,
          tags: tags
        })
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
  
  // Open reminder dialog
  const openReminderDialog = (item) => {
    setReminderItem(item)
    const existingReminder = getReminder(item.id)
    
    if (existingReminder) {
      const date = new Date(existingReminder.reminderTime)
      setReminderDate(date.toISOString().split('T')[0])
      setReminderTime(date.toTimeString().slice(0, 5))
    } else {
      // Default to tomorrow at 9 AM
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
        // Delete all links
        for (const link of links) {
          await fetch(`/api/links?id=${link.id}`, { method: 'DELETE' })
        }
        setLinks([])
        
        // Clear local storage
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
  
  // Filter links based on active tab and search
  const filteredLinks = links.filter(link => {
    // Tab filter
    if (activeTab === 'favorites' && !link.isFavorite) return false
    if (activeTab === 'clipboard' && link.contentType !== 'text') return false
    if (activeTab === 'dashboard' && link.contentType === 'text') return false
    if (activeTab === 'settings') return false
    
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
    <div className="min-h-screen bg-black text-white">
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
              {/* Language selector */}
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
            </div>
          </div>
          
          {/* Search bar */}
          {activeTab !== 'settings' && (
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
              
              {/* Tags carousel */}
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
      
      {/* Main content */}
      <main className="container mx-auto px-4 py-6 pb-24">
        {activeTab === 'settings' ? (
          // Settings Screen
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold mb-6">{t.settings}</h2>
            
            {/* Language */}
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
            
            {/* Notifications */}
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
            
            {/* Account */}
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
            
            {/* Legal */}
            <div className="bg-[#1C1C1E] rounded-3xl p-6 border border-[#2C2C2E]">
              <div className="space-y-3">
                <button className="w-full text-left text-[#007AFF] hover:underline">
                  {t.termsOfService}
                </button>
                <button className="w-full text-left text-[#007AFF] hover:underline">
                  {t.privacyPolicy}
                </button>
              </div>
            </div>
            
            {/* Version */}
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
                  {/* Image for links */}
                  {item.contentType === 'link' && item.imageUrl && (
                    <div 
                      className="w-full h-48 bg-cover bg-center cursor-pointer"
                      style={{ backgroundImage: `url(${item.imageUrl})` }}
                      onClick={() => handleOpenLink(item.url)}
                    />
                  )}
                  
                  <div className="p-5">
                    {/* Title */}
                    <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                      {item.title}
                    </h3>
                    
                    {/* URL or Content preview */}
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
                    
                    {/* Tags */}
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
                    
                    {/* Reminder indicator */}
                    {hasReminder && (
                      <div className="mb-3 flex items-center gap-2 text-xs text-[#00D4FF]">
                        <Clock className="w-4 h-4" />
                        {t.reminderSet} {new Date(hasReminder.reminderTime).toLocaleString()}
                      </div>
                    )}
                    
                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Favorite button */}
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
                      
                      {/* Edit button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(item)}
                        className="rounded-full hover:bg-[#007AFF]/10 text-[#007AFF]"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      
                      {/* Reminder button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openReminderDialog(item)}
                        className="rounded-full hover:bg-[#007AFF]/10 text-[#00D4FF]"
                      >
                        <Clock className="w-4 h-4" />
                      </Button>
                      
                      {/* Copy button for text */}
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
                      
                      {/* Open button for links */}
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
                      
                      {/* Delete button */}
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
            
            <div>
              <label className="text-sm text-[#8E8E93] mb-2 block">{t.editTags}</label>
              <Input
                value={editTags}
                onChange={(e) => setEditTags(e.target.value)}
                className="bg-black border-[#2C2C2E] rounded-2xl focus:border-[#007AFF]"
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={() => setIsEditDialogOpen(false)}
                variant="outline"
                className="flex-1 rounded-2xl border-[#2C2C2E]"
              >
                {t.cancel}
              </Button>
              <Button 
                onClick={handleEdit}
                className="flex-1 rounded-2xl bg-[#007AFF] hover:bg-[#0051D5]"
              >
                {t.update}
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
              onClick={() => setActiveTab('favorites')}
              className={`flex flex-col items-center gap-1 py-2 px-4 rounded-2xl transition-all ${
                activeTab === 'favorites' ? 'text-[#007AFF]' : 'text-[#8E8E93]'
              }`}
            >
              <Heart className={`w-6 h-6 ${activeTab === 'favorites' ? 'fill-[#007AFF]' : ''}`} />
              <span className="text-xs font-medium">{t.tabFavorites}</span>
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
  )
}
