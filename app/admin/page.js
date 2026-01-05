'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { Eye, EyeOff, Lock } from 'lucide-react'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  // Check if already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push('/admin/dashboard')
      } else {
        setCheckingAuth(false)
      }
    }
    checkSession()
  }, [router])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        toast({
          title: 'Erro',
          description: 'Email ou password incorretos',
          variant: 'destructive'
        })
        return
      }

      toast({
        title: 'Sucesso',
        description: 'Login efetuado com sucesso'
      })
      
      router.push('/admin/dashboard')
    } catch (error) {
      console.error('Login error:', error)
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao fazer login',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007AFF]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-4xl font-bold bg-gradient-to-r from-[#007AFF] to-[#00D4FF] bg-clip-text text-transparent mb-2">
            Memor.ia
          </div>
          <p className="text-[#8E8E93] text-sm">Admin Dashboard</p>
        </div>

        {/* Login Form */}
        <div className="bg-[#1C1C1E] rounded-3xl p-8 border border-[#2C2C2E]">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-[#007AFF]/20 flex items-center justify-center">
              <Lock className="w-8 h-8 text-[#007AFF]" />
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-[#8E8E93] mb-2">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@exemplo.com"
                className="bg-black border-[#2C2C2E] rounded-xl focus:border-[#007AFF]"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-[#8E8E93] mb-2">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-black border-[#2C2C2E] rounded-xl focus:border-[#007AFF] pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8E8E93] hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#007AFF] hover:bg-[#0051D5] h-12 text-base font-semibold"
            >
              {loading ? 'A entrar...' : 'Entrar'}
            </Button>
          </form>
        </div>

        <p className="text-center text-[#8E8E93] text-xs mt-6">
          Acesso restrito a administradores
        </p>
      </div>
    </div>
  )
}
