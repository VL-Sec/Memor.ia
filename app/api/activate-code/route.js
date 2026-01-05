import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// POST - Activate a code
export async function POST(request) {
  try {
    const { code, deviceId } = await request.json()

    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 })
    }

    // Find the code
    const { data: codeData, error: findError } = await supabase
      .from('activation_codes')
      .select('*')
      .eq('code', code.toUpperCase().trim())
      .single()

    if (findError || !codeData) {
      return NextResponse.json({ 
        success: false, 
        error: 'invalid',
        message: 'Código inválido' 
      }, { status: 400 })
    }

    // Check if already used
    if (codeData.is_used) {
      return NextResponse.json({ 
        success: false, 
        error: 'used',
        message: 'Este código já foi utilizado' 
      }, { status: 400 })
    }

    // Mark as used
    const { error: updateError } = await supabase
      .from('activation_codes')
      .update({
        is_used: true,
        used_at: new Date().toISOString(),
        device_id: deviceId || null
      })
      .eq('id', codeData.id)

    if (updateError) {
      console.error('Error updating code:', updateError)
      return NextResponse.json({ 
        success: false, 
        error: 'update_failed',
        message: 'Erro ao ativar código' 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Premium ativado com sucesso!',
      code: codeData.code
    })

  } catch (error) {
    console.error('Activation error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'server_error',
      message: 'Erro interno do servidor' 
    }, { status: 500 })
  }
}

// GET - Check if a code is valid (without activating)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('activation_codes')
      .select('code, is_used')
      .eq('code', code.toUpperCase().trim())
      .single()

    if (error || !data) {
      return NextResponse.json({ valid: false, reason: 'not_found' })
    }

    if (data.is_used) {
      return NextResponse.json({ valid: false, reason: 'already_used' })
    }

    return NextResponse.json({ valid: true })

  } catch (error) {
    console.error('Check code error:', error)
    return NextResponse.json({ valid: false, reason: 'error' }, { status: 500 })
  }
}
