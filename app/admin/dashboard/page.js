'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { generateActivationCode } from '@/lib/premium'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { Plus, Copy, LogOut, Ticket, CheckCircle, Trash2, Users, RefreshCw, Edit2, Save } from 'lucide-react'

export default function AdminDashboard() {
  const [codes, setCodes] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newInfluencerName, setNewInfluencerName] = useState('')
  const [newNote, setNewNote] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingCodeId, setEditingCodeId] = useState(null)
  const [editNote, setEditNote] = useState('')
  const router = useRouter()
  const { toast } = useToast()

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/admin')
        return
      }
      fetchCodes()
    }
    checkAuth()
  }, [router])

  // Fetch all codes
  const fetchCodes = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('activation_codes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setCodes(data || [])
    } catch (error) {
      console.error('Error fetching codes:', error)
      toast({
        title: 'Erro',
        description: 'Falha ao carregar códigos',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  // Create new code
  const handleCreateCode = async () => {
    setCreating(true)
    try {
      const code = generateActivationCode()
      const id = `code_${Date.now()}`

      const { error } = await supabase
        .from('activation_codes')
        .insert([{
          id,
          code,
          influencer_name: newInfluencerName || null,
          notes: newNote || null,
          is_used: false
        }])

      if (error) throw error

      toast({
        title: 'Sucesso',
        description: `Código criado: ${code}`
      })

      setNewInfluencerName('')
      setNewNote('')
      setIsCreateDialogOpen(false)
      fetchCodes()
    } catch (error) {
      console.error('Error creating code:', error)
      toast({
        title: 'Erro',
        description: 'Falha ao criar código',
        variant: 'destructive'
      })
    } finally {
      setCreating(false)
    }
  }

  // Delete code
  const handleDeleteCode = async (codeId, codeName) => {
    if (!window.confirm(`Apagar o código ${codeName}?`)) return
    
    try {
      const { error } = await supabase
        .from('activation_codes')
        .delete()
        .eq('id', codeId)

      if (error) throw error

      toast({
        title: 'Sucesso',
        description: 'Código apagado'
      })
      
      fetchCodes()
    } catch (error) {
      console.error('Error deleting code:', error)
      toast({
        title: 'Erro',
        description: 'Falha ao apagar código',
        variant: 'destructive'
      })
    }
  }

  // Save note
  const handleSaveNote = async (codeId) => {
    try {
      const { error } = await supabase
        .from('activation_codes')
        .update({ notes: editNote })
        .eq('id', codeId)

      if (error) throw error

      toast({
        title: 'Sucesso',
        description: 'Nota guardada'
      })
      
      setEditingCodeId(null)
      setEditNote('')
      fetchCodes()
    } catch (error) {
      console.error('Error saving note:', error)
      toast({
        title: 'Erro',
        description: 'Falha ao guardar nota',
        variant: 'destructive'
      })
    }
  }

  // Start editing note
  const startEditNote = (code) => {
    setEditingCodeId(code.id)
    setEditNote(code.notes || '')
  }

  // Copy code to clipboard
  const copyCode = (code) => {
    navigator.clipboard.writeText(code)
    toast({
      title: 'Copiado!',
      description: 'Código copiado para a área de transferência'
    })
  }

  // Logout
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin')
  }

  // Calculate metrics
  const totalCodes = codes.length
  const usedCodes = codes.filter(c => c.is_used).length
  const activeCodes = codes.filter(c => !c.is_used).length

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-[#2C2C2E] bg-black/95 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-[#007AFF] to-[#00D4FF] bg-clip-text text-transparent">
              Memor.ia Admin
            </h1>
            <p className="text-sm text-[#8E8E93]">Gestão de Códigos de Ativação</p>
          </div>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="rounded-full hover:bg-red-500/10 text-red-500"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-[#1C1C1E] rounded-2xl p-6 border border-[#2C2C2E]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#007AFF]/20 flex items-center justify-center">
                <Ticket className="w-6 h-6 text-[#007AFF]" />
              </div>
              <div>
                <p className="text-[#8E8E93] text-sm">Total de Códigos</p>
                <p className="text-3xl font-bold">{totalCodes}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#1C1C1E] rounded-2xl p-6 border border-[#2C2C2E]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-[#8E8E93] text-sm">Códigos Usados</p>
                <p className="text-3xl font-bold text-green-500">{usedCodes}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#1C1C1E] rounded-2xl p-6 border border-[#2C2C2E]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#00D4FF]/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-[#00D4FF]" />
              </div>
              <div>
                <p className="text-[#8E8E93] text-sm">Códigos Disponíveis</p>
                <p className="text-3xl font-bold text-[#00D4FF]">{activeCodes}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Códigos de Ativação</h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={fetchCodes}
              className="rounded-full border-[#2C2C2E]"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-full bg-[#007AFF] hover:bg-[#0051D5]">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Código
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#1C1C1E] border-[#2C2C2E] text-white rounded-3xl">
                <DialogHeader>
                  <DialogTitle>Criar Novo Código</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <label className="block text-sm text-[#8E8E93] mb-2">
                      Nome do Influencer (opcional)
                    </label>
                    <Input
                      value={newInfluencerName}
                      onChange={(e) => setNewInfluencerName(e.target.value)}
                      placeholder="Ex: João Silva"
                      className="bg-black border-[#2C2C2E] rounded-xl"
                    />
                  </div>
                  <Button
                    onClick={handleCreateCode}
                    disabled={creating}
                    className="w-full rounded-xl bg-[#007AFF] hover:bg-[#0051D5]"
                  >
                    {creating ? 'A criar...' : 'Gerar Código'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Codes List */}
        <div className="bg-[#1C1C1E] rounded-2xl border border-[#2C2C2E] overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007AFF] mx-auto"></div>
            </div>
          ) : codes.length === 0 ? (
            <div className="p-8 text-center text-[#8E8E93]">
              <Ticket className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum código criado ainda</p>
            </div>
          ) : (
            <div className="divide-y divide-[#2C2C2E]">
              {codes.map((code) => (
                <div key={code.id} className="p-4 flex items-center justify-between hover:bg-[#2C2C2E]/50">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      code.is_used ? 'bg-green-500/20' : 'bg-[#007AFF]/20'
                    }`}>
                      {code.is_used ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <Ticket className="w-5 h-5 text-[#007AFF]" />
                      )}
                    </div>
                    <div>
                      <p className="font-mono text-lg font-semibold">{code.code}</p>
                      <div className="flex items-center gap-2 text-sm text-[#8E8E93]">
                        {code.influencer_name && (
                          <span>{code.influencer_name}</span>
                        )}
                        <span>•</span>
                        <span>{new Date(code.created_at).toLocaleDateString('pt-PT')}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Badge className={code.is_used 
                      ? 'bg-green-500/20 text-green-500' 
                      : 'bg-[#007AFF]/20 text-[#007AFF]'
                    }>
                      {code.is_used ? 'Usado' : 'Disponível'}
                    </Badge>
                    
                    {!code.is_used && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyCode(code.code)}
                        className="rounded-full hover:bg-[#007AFF]/10"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
