import { NextResponse } from 'next/server'
import { supabase, generateId } from '../../../lib/supabase.js'

// GET all folders
export async function GET(request) {
  try {
    const { data, error } = await supabase
      .from('folders')
      .select('*')
      .order('createdAt', { ascending: true })
    
    if (error) {
      console.error('Error fetching folders:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json(data || [])
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST new folder
export async function POST(request) {
  try {
    const body = await request.json()
    const { name, icon = '📁' } = body
    
    if (!name) {
      return NextResponse.json({ error: 'Folder name is required' }, { status: 400 })
    }
    
    const newFolder = {
      id: generateId(),
      userId: 'demo_user',
      name,
      icon,
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    const { data, error } = await supabase
      .from('folders')
      .insert([newFolder])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating folder:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH update folder
export async function PATCH(request) {
  try {
    const body = await request.json()
    const { id, name, icon } = body
    
    if (!id) {
      return NextResponse.json({ error: 'Folder ID is required' }, { status: 400 })
    }
    
    const updateData = {
      updatedAt: new Date().toISOString()
    }
    
    if (name !== undefined) updateData.name = name
    if (icon !== undefined) updateData.icon = icon
    
    const { data, error } = await supabase
      .from('folders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating folder:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE folder
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Folder ID is required' }, { status: 400 })
    }
    
    // Check if it's a default folder
    const { data: folder } = await supabase
      .from('folders')
      .select('isDefault')
      .eq('id', id)
      .single()
    
    if (folder?.isDefault) {
      return NextResponse.json({ error: 'Cannot delete default folder' }, { status: 400 })
    }
    
    // Move links from this folder to General
    const { data: generalFolder } = await supabase
      .from('folders')
      .select('id')
      .eq('isDefault', true)
      .single()
    
    if (generalFolder) {
      await supabase
        .from('links')
        .update({ folderId: generalFolder.id })
        .eq('folderId', id)
    }
    
    // Delete folder
    const { error } = await supabase
      .from('folders')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting folder:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
