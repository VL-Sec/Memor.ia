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
import { 
  Plus, Copy, LogOut, Ticket, CheckCircle, Trash2, Users, RefreshCw, 
  Edit2, Save, TrendingUp, Crown, Clock, XCircle, Activity, Shield,
  BarChart3, Percent
} from 'lucide-react'

export default function AdminDashboard() {
  const [codes, setCodes] = useState([])
  const [metrics, setMetrics] = useState(null)
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
      fetchData()
    }
    checkAuth()
  }, [router])

  // Fetch all data
  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch codes
      const { data: codesData, error: codesError } = await supabase
        .from('activation_codes')
        .select('id, code, influencer_name, notes, is_used, used_at, created_at')
        .order('created_at', { ascending: false })

      if (codesError) throw codesError
      setCodes(codesData || [])

      // Fetch metrics
      const { data: metricsData, error: metricsError } = await supabase
        .from('app_metrics')
        .select('*')
        .eq('id', 'global')
        .single()

      if (!metricsError && metricsData) {
        setMetrics(metricsData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast({
        title: 'Erro',
        description: 'Falha ao carregar dados',
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
      fetchData()
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
      // First check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast({
          title: 'Erro',
          description: 'Sessão expirada. Faça login novamente.',
          variant: 'destructive'
        })
        router.push('/admin')
        return
      }

      const { error } = await supabase
        .from('activation_codes')
        .delete()
        .eq('id', codeId)

      if (error) {
        console.error('Delete error details:', error)
        throw error
      }

      // Update local state immediately for better UX
      setCodes(prevCodes => prevCodes.filter(c => c.id !== codeId))
      
      toast({
        title: 'Sucesso',
        description: 'Código apagado'
      })
    } catch (error) {
      console.error('Error deleting code:', error)
      toast({
        title: 'Erro',
        description: error.message || 'Falha ao apagar código. Verifique as permissões RLS.',
        variant: 'destructive'
      })
      // Refresh data to ensure UI is in sync
      fetchData()
    }
  }

  // Deactivate code (mark as used without actual use)
  const handleDeactivateCode = async (codeId) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast({
          title: 'Erro',
          description: 'Sessão expirada. Faça login novamente.',
          variant: 'destructive'
        })
        router.push('/admin')
        return
      }

      const { error } = await supabase
        .from('activation_codes')
        .update({ is_used: true, used_at: new Date().toISOString() })
        .eq('id', codeId)

      if (error) {
        console.error('Deactivate error details:', error)
        throw error
      }

      // Update local state immediately
      setCodes(prevCodes => prevCodes.map(c => 
        c.id === codeId ? { ...c, is_used: true, used_at: new Date().toISOString() } : c
      ))

      toast({
        title: 'Sucesso',
        description: 'Código desativado'
      })
    } catch (error) {
      console.error('Error deactivating code:', error)
      toast({
        title: 'Erro',
        description: error.message || 'Falha ao desativar código',
        variant: 'destructive'
      })
      fetchData()
    }
  }

  // Save note
  const handleSaveNote = async (codeId) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast({
          title: 'Erro',
          description: 'Sessão expirada. Faça login novamente.',
          variant: 'destructive'
        })
        router.push('/admin')
        return
      }

      const { error } = await supabase
        .from('activation_codes')
        .update({ notes: editNote })
        .eq('id', codeId)

      if (error) {
        console.error('Save note error details:', error)
        throw error
      }

      // Update local state immediately
      setCodes(prevCodes => prevCodes.map(c => 
        c.id === codeId ? { ...c, notes: editNote } : c
      ))

      toast({
        title: 'Sucesso',
        description: 'Nota guardada'
      })
      
      setEditingCodeId(null)
      setEditNote('')
    } catch (error) {
      console.error('Error saving note:', error)
      toast({
        title: 'Erro',
        description: error.message || 'Falha ao guardar nota',
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
      description: 'Código copiado'
    })
  }

  // Logout
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin')
  }

  // Calculate code metrics
  const totalCodes = codes.length
  const usedCodes = codes.filter(c => c.is_used).length
  const activeCodes = codes.filter(c => !c.is_used).length

  // Calculate conversion rate
  const conversionRate = metrics?.trials_started > 0 
    ? ((metrics?.conversions_to_premium / metrics?.trials_started) * 100).toFixed(1)
    : 0

  const abandonRate = metrics?.trials_started > 0 
    ? ((metrics?.trial_expired / metrics?.trials_started) * 100).toFixed(1)
    : 0

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-[#2C2C2E] bg-black/95 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#007AFF] to-[#00D4FF] flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Memor.ia Admin</h1>
              <p className="text-xs text-[#8E8E93]">Dashboard Seguro • Dados Anónimos</p>
            </div>
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
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007AFF]"></div>
          </div>
        ) : (
          <>
            {/* Section: Visão Geral */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-[#007AFF]" />
                <h2 className="text-lg font-semibold">Visão Geral</h2>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-[#1C1C1E] rounded-2xl p-4 border border-[#2C2C2E]">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-[#007AFF]" />
                    <span className="text-xs text-[#8E8E93]">Instalações</span>
                  </div>
                  <p className="text-2xl font-bold">{metrics?.total_installations || 0}</p>
                </div>

                <div className="bg-[#1C1C1E] rounded-2xl p-4 border border-[#2C2C2E]">
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="w-4 h-4 text-[#FFD700]" />
                    <span className="text-xs text-[#8E8E93]">Premium Ativos</span>
                  </div>
                  <p className="text-2xl font-bold text-[#FFD700]">{metrics?.premium_active || 0}</p>
                </div>

                <div className="bg-[#1C1C1E] rounded-2xl p-4 border border-[#2C2C2E]">
                  <div className="flex items-center gap-2 mb-2">
                    <Ticket className="w-4 h-4 text-[#00D4FF]" />
                    <span className="text-xs text-[#8E8E93]">Via Código</span>
                  </div>
                  <p className="text-2xl font-bold text-[#00D4FF]">{usedCodes}</p>
                </div>

                <div className="bg-[#1C1C1E] rounded-2xl p-4 border border-[#2C2C2E]">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-[#8E8E93]">Compras</span>
                  </div>
                  <p className="text-2xl font-bold text-green-500">{metrics?.premium_via_purchase || 0}</p>
                </div>

                <div className="bg-[#1C1C1E] rounded-2xl p-4 border border-[#2C2C2E]">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-orange-500" />
                    <span className="text-xs text-[#8E8E93]">Em Trial</span>
                  </div>
                  <p className="text-2xl font-bold text-orange-500">{metrics?.trial_active || 0}</p>
                </div>

                <div className="bg-[#1C1C1E] rounded-2xl p-4 border border-[#2C2C2E]">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span className="text-xs text-[#8E8E93]">Trial Expirado</span>
                  </div>
                  <p className="text-2xl font-bold text-red-500">{metrics?.trial_expired || 0}</p>
                </div>
              </div>
            </div>

            {/* Section: Métricas de Conversão */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Percent className="w-5 h-5 text-[#007AFF]" />
                <h2 className="text-lg font-semibold">Métricas de Conversão</h2>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#1C1C1E] rounded-2xl p-4 border border-[#2C2C2E]">
                  <p className="text-xs text-[#8E8E93] mb-1">Trials Iniciados</p>
                  <p className="text-xl font-bold">{metrics?.trials_started || 0}</p>
                </div>

                <div className="bg-[#1C1C1E] rounded-2xl p-4 border border-[#2C2C2E]">
                  <p className="text-xs text-[#8E8E93] mb-1">Trials Expirados</p>
                  <p className="text-xl font-bold">{metrics?.trial_expired || 0}</p>
                </div>

                <div className="bg-[#1C1C1E] rounded-2xl p-4 border border-[#2C2C2E]">
                  <p className="text-xs text-[#8E8E93] mb-1">Taxa de Conversão</p>
                  <p className="text-xl font-bold text-green-500">{conversionRate}%</p>
                </div>

                <div className="bg-[#1C1C1E] rounded-2xl p-4 border border-[#2C2C2E]">
                  <p className="text-xs text-[#8E8E93] mb-1">Taxa de Abandono</p>
                  <p className="text-xl font-bold text-red-500">{abandonRate}%</p>
                </div>
              </div>
            </div>

            {/* Section: Gestão de Códigos */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-[#007AFF]" />
                  <h2 className="text-lg font-semibold">Códigos de Influencers</h2>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={fetchData}
                    size="sm"
                    className="rounded-full border-[#2C2C2E]"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                  
                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="rounded-full bg-[#007AFF] hover:bg-[#0051D5]">
                        <Plus className="w-4 h-4 mr-1" />
                        Criar Código
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-[#1C1C1E] border-[#2C2C2E] text-white rounded-3xl">
                      <DialogHeader>
                        <DialogTitle>Criar Código de Influencer</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <label className="block text-sm text-[#8E8E93] mb-2">
                            Nome do Influencer
                          </label>
                          <Input
                            value={newInfluencerName}
                            onChange={(e) => setNewInfluencerName(e.target.value)}
                            placeholder="Ex: João Silva"
                            className="bg-black border-[#2C2C2E] rounded-xl"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-[#8E8E93] mb-2">
                            Nota (opcional)
                          </label>
                          <Textarea
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            placeholder="Ex: Parceria YouTube 2025..."
                            className="bg-black border-[#2C2C2E] rounded-xl min-h-[80px]"
                          />
                        </div>
                        <Button
                          onClick={handleCreateCode}
                          disabled={creating || !newInfluencerName.trim()}
                          className="w-full rounded-xl bg-[#007AFF] hover:bg-[#0051D5]"
                        >
                          {creating ? 'A criar...' : 'Gerar Código'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Codes Summary */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-[#2C2C2E]/50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold">{totalCodes}</p>
                  <p className="text-xs text-[#8E8E93]">Total</p>
                </div>
                <div className="bg-[#007AFF]/10 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-[#007AFF]">{activeCodes}</p>
                  <p className="text-xs text-[#8E8E93]">Ativos</p>
                </div>
                <div className="bg-green-500/10 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-green-500">{usedCodes}</p>
                  <p className="text-xs text-[#8E8E93]">Usados</p>
                </div>
              </div>

              {/* Codes Table */}
              <div className="bg-[#1C1C1E] rounded-2xl border border-[#2C2C2E] overflow-hidden">
                {codes.length === 0 ? (
                  <div className="p-8 text-center text-[#8E8E93]">
                    <Ticket className="w-10 h-10 mx-auto mb-3 opacity-50" />
                    <p>Nenhum código criado</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-[#2C2C2E]/50">
                        <tr>
                          <th className="text-left text-xs text-[#8E8E93] font-medium px-4 py-3">Código</th>
                          <th className="text-left text-xs text-[#8E8E93] font-medium px-4 py-3">Influencer</th>
                          <th className="text-left text-xs text-[#8E8E93] font-medium px-4 py-3">Estado</th>
                          <th className="text-left text-xs text-[#8E8E93] font-medium px-4 py-3">Data</th>
                          <th className="text-right text-xs text-[#8E8E93] font-medium px-4 py-3">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#2C2C2E]">
                        {codes.map((code) => (
                          <tr key={code.id} className="hover:bg-[#2C2C2E]/30">
                            <td className="px-4 py-3">
                              <span className="font-mono font-semibold">{code.code}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm">{code.influencer_name || '-'}</span>
                              {code.notes && (
                                <p className="text-xs text-[#8E8E93] mt-1">📝 {code.notes}</p>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <Badge className={code.is_used 
                                ? 'bg-green-500/20 text-green-500' 
                                : 'bg-[#007AFF]/20 text-[#007AFF]'
                              }>
                                {code.is_used ? 'Usado' : 'Ativo'}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-sm text-[#8E8E93]">
                              {code.is_used && code.used_at 
                                ? new Date(code.used_at).toLocaleDateString('pt-PT')
                                : new Date(code.created_at).toLocaleDateString('pt-PT')
                              }
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-end gap-1">
                                {!code.is_used && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => copyCode(code.code)}
                                      className="h-8 w-8 p-0 rounded-full hover:bg-[#007AFF]/10"
                                      title="Copiar"
                                    >
                                      <Copy className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeactivateCode(code.id)}
                                      className="h-8 w-8 p-0 rounded-full hover:bg-orange-500/10 text-orange-500"
                                      title="Desativar"
                                    >
                                      <XCircle className="w-4 h-4" />
                                    </Button>
                                  </>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => startEditNote(code)}
                                  className="h-8 w-8 p-0 rounded-full hover:bg-[#007AFF]/10 text-[#007AFF]"
                                  title="Editar nota"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteCode(code.id, code.code)}
                                  className="h-8 w-8 p-0 rounded-full hover:bg-red-500/10 text-red-500"
                                  title="Apagar"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Edit Note Dialog */}
              {editingCodeId && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                  <div className="bg-[#1C1C1E] rounded-3xl p-6 w-full max-w-md border border-[#2C2C2E]">
                    <h3 className="text-lg font-semibold mb-4">Editar Nota</h3>
                    <Textarea
                      value={editNote}
                      onChange={(e) => setEditNote(e.target.value)}
                      placeholder="Escrever nota..."
                      className="bg-black border-[#2C2C2E] rounded-xl min-h-[100px] mb-4"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleSaveNote(editingCodeId)}
                        className="flex-1 rounded-xl bg-[#007AFF] hover:bg-[#0051D5]"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Guardar
                      </Button>
                      <Button
                        onClick={() => setEditingCodeId(null)}
                        variant="outline"
                        className="rounded-xl border-[#2C2C2E]"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Privacy Notice */}
            <div className="bg-[#1C1C1E] rounded-2xl p-4 border border-[#2C2C2E]">
              <div className="flex items-center gap-2 text-sm text-[#8E8E93]">
                <Shield className="w-4 h-4 text-green-500" />
                <span>Dashboard seguro • Sem dados pessoais • Apenas métricas anónimas agregadas</span>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
