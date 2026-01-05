'use client'

import { useState, useEffect } from 'react'
import { Heart, Plus, X, Copy, Trash2, Link as LinkIcon, FileText, Settings, Search, Tag as TagIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'

export default function App() {
  const [links, setLinks] = useState([])
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [addType, setAddType] = useState('link') // 'link' or 'text'
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  
  // Form states
  const [newUrl, setNewUrl] = useState('')
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [newTags, setNewTags] = useState('')
  
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
        title: 'Error',
        description: 'Failed to load links',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    fetchLinks()
  }, [])
  
  // Add new link or text
  const handleAdd = async () => {
    try {
      if (addType === 'link' && !newUrl) {
        toast({
          title: 'Error',
          description: 'Please enter a URL',
          variant: 'destructive'
        })
        return
      }
      
      if (addType === 'text' && !newContent) {
        toast({
          title: 'Error',
          description: 'Please enter some text',
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
        title: 'Success',
        description: addType === 'link' ? 'Link saved!' : 'Snippet saved!',
      })
    } catch (error) {
      console.error('Error adding item:', error)
      toast({
        title: 'Error',
        description: 'Failed to save item',
        variant: 'destructive'
      })
    }
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
        title: !currentState ? 'Added to favorites' : 'Removed from favorites',
        description: ''
      })
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast({
        title: 'Error',
        description: 'Failed to update favorite',
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
      
      toast({
        title: 'Deleted',
        description: 'Item removed successfully'
      })
    } catch (error) {
      console.error('Error deleting:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete item',
        variant: 'destructive'
      })
    }
  }
  
  // Copy to clipboard
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
    toast({
      title: 'Copied!',
      description: 'Content copied to clipboard'
    })
  }
  
  // Open link
  const handleOpenLink = (url) => {
    window.open(url, '_blank')
  }
  
  // Filter links based on active tab and search
  const filteredLinks = links.filter(link => {
    // Tab filter
    if (activeTab === 'favorites' && !link.isFavorite) return false
    if (activeTab === 'clipboard' && link.contentType !== 'text') return false
    if (activeTab === 'dashboard' && link.contentType === 'text') return false
    
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
                Memor.ia
              </div>
            </div>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="rounded-full bg-[#007AFF] hover:bg-[#0051D5] transition-all duration-300 shadow-lg shadow-[#007AFF]/20"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#1C1C1E] border-[#2C2C2E] text-white rounded-3xl">
                <DialogHeader>
                  <DialogTitle className="text-xl">Add New Item</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4 mt-4">
                  {/* Type selector */}
                  <div className="flex gap-2">
                    <Button
                      variant={addType === 'link' ? 'default' : 'outline'}
                      onClick={() => setAddType('link')}
                      className={`flex-1 rounded-2xl ${addType === 'link' ? 'bg-[#007AFF]' : 'border-[#2C2C2E]'}`}
                    >
                      <LinkIcon className="w-4 h-4 mr-2" />
                      Link
                    </Button>
                    <Button
                      variant={addType === 'text' ? 'default' : 'outline'}
                      onClick={() => setAddType('text')}
                      className={`flex-1 rounded-2xl ${addType === 'text' ? 'bg-[#007AFF]' : 'border-[#2C2C2E]'}`}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Snippet
                    </Button>
                  </div>
                  
                  {addType === 'link' ? (
                    <>
                      <Input
                        placeholder="Paste URL here..."
                        value={newUrl}
                        onChange={(e) => setNewUrl(e.target.value)}
                        className="bg-black border-[#2C2C2E] rounded-2xl focus:border-[#007AFF]"
                      />
                      <Input
                        placeholder="Title (optional, auto-detected)"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="bg-black border-[#2C2C2E] rounded-2xl focus:border-[#007AFF]"
                      />
                    </>
                  ) : (
                    <>
                      <Input
                        placeholder="Title"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="bg-black border-[#2C2C2E] rounded-2xl focus:border-[#007AFF]"
                      />
                      <Textarea
                        placeholder="Paste your snippet, hashtags, or notes..."
                        value={newContent}
                        onChange={(e) => setNewContent(e.target.value)}
                        className="bg-black border-[#2C2C2E] rounded-2xl min-h-[120px] focus:border-[#007AFF]"
                      />
                    </>
                  )}
                  
                  <Input
                    placeholder="Tags (comma-separated, auto-detected if empty)"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    className="bg-black border-[#2C2C2E] rounded-2xl focus:border-[#007AFF]"
                  />
                  
                  <Button 
                    onClick={handleAdd}
                    className="w-full rounded-2xl bg-[#007AFF] hover:bg-[#0051D5] transition-all duration-300"
                  >
                    Save
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          {/* Search bar */}
          <div className="mt-4 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#8E8E93]" />
            <Input
              placeholder="Search links, tags, or snippets..."
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
        </div>
      </header>
      
      {/* Main content */}
      <main className="container mx-auto px-4 py-6 pb-24">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#007AFF]"></div>
          </div>
        ) : filteredLinks.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📱</div>
            <h3 className="text-xl font-semibold mb-2">No items yet</h3>
            <p className="text-[#8E8E93] mb-6">
              {activeTab === 'favorites' ? 'Mark items as favorites to see them here' : 
               activeTab === 'clipboard' ? 'Add text snippets to see them here' :
               'Start by adding your first link or snippet'}
            </p>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="rounded-full bg-[#007AFF] hover:bg-[#0051D5]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Item
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLinks.map((item) => (
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
                  {item.contentType === 'link' && item.url && (
                    <p className="text-sm text-[#8E8E93] mb-3 line-clamp-1">
                      {new URL(item.url).hostname}
                    </p>
                  )}
                  
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
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2">
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
                    
                    {/* Copy button for text */}
                    {item.contentType === 'text' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(item.content)}
                        className="flex-1 rounded-full hover:bg-[#007AFF]/10 text-[#007AFF]"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Quick Copy
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
                        Open
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
            ))}
          </div>
        )}
      </main>
      
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
              <span className="text-xs font-medium">Links</span>
            </button>
            
            <button
              onClick={() => setActiveTab('favorites')}
              className={`flex flex-col items-center gap-1 py-2 px-4 rounded-2xl transition-all ${
                activeTab === 'favorites' ? 'text-[#007AFF]' : 'text-[#8E8E93]'
              }`}
            >
              <Heart className={`w-6 h-6 ${activeTab === 'favorites' ? 'fill-[#007AFF]' : ''}`} />
              <span className="text-xs font-medium">Favorites</span>
            </button>
            
            <button
              onClick={() => setActiveTab('clipboard')}
              className={`flex flex-col items-center gap-1 py-2 px-4 rounded-2xl transition-all ${
                activeTab === 'clipboard' ? 'text-[#007AFF]' : 'text-[#8E8E93]'
              }`}
            >
              <FileText className="w-6 h-6" />
              <span className="text-xs font-medium">Clipboard</span>
            </button>
            
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex flex-col items-center gap-1 py-2 px-4 rounded-2xl transition-all ${
                activeTab === 'settings' ? 'text-[#007AFF]' : 'text-[#8E8E93]'
              }`}
            >
              <Settings className="w-6 h-6" />
              <span className="text-xs font-medium">Settings</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  )
}
