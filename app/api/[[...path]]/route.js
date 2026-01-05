import { NextResponse } from 'next/server'
import { supabase, generateId } from '../../../lib/supabase.js'
import { headers } from 'next/headers'

// Helper to extract meta tags from URL
async function scrapeMetaTags(url) {
  try {
    // Ensure URL has protocol
    let fullUrl = url
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      fullUrl = 'https://' + url
    }
    
    const response = await fetch(fullUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Memoria/1.0)'
      }
    })
    const html = await response.text()
    
    // Extract og:title
    const titleMatch = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]*)"/i) ||
                      html.match(/<meta[^>]*name="twitter:title"[^>]*content="([^"]*)"/i) ||
                      html.match(/<title>([^<]*)<\/title>/i)
    
    // Extract og:image
    const imageMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]*)"/i) ||
                      html.match(/<meta[^>]*name="twitter:image"[^>]*content="([^"]*)"/i)
    
    return {
      title: titleMatch ? titleMatch[1].trim() : new URL(fullUrl).hostname,
      imageUrl: imageMatch ? imageMatch[1].trim() : null
    }
  } catch (error) {
    console.error('Scraping error:', error)
    // Fallback: try to extract hostname
    try {
      let fullUrl = url
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        fullUrl = 'https://' + url
      }
      return {
        title: new URL(fullUrl).hostname,
        imageUrl: null
      }
    } catch {
      return {
        title: url,
        imageUrl: null
      }
    }
  }
}

// Auto-categorize based on URL
function autoCategorizeTags(url, content = null) {
  const tags = []
  
  if (content && content.startsWith('#')) {
    tags.push('Hashtags')
  }
  
  if (url) {
    try {
      const urlLower = url.toLowerCase()
      
      if (urlLower.includes('youtube.com') || urlLower.includes('vimeo.com') || urlLower.includes('tiktok.com')) {
        tags.push('Video')
      }
      if (urlLower.includes('medium.com') || urlLower.includes('blog') || urlLower.includes('article')) {
        tags.push('Reading')
      }
      if (urlLower.includes('github.com') || urlLower.includes('stackoverflow.com')) {
        tags.push('Code')
      }
      if (urlLower.includes('linkedin.com') || urlLower.includes('twitter.com') || urlLower.includes('instagram.com')) {
        tags.push('Social')
      }
    } catch (error) {
      console.error('Error in autoCategorizeTags:', error)
    }
  }
  
  return tags.length > 0 ? tags : ['General']
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const contentType = searchParams.get('contentType')
    const favorite = searchParams.get('favorite')
    
    // Get single link by ID
    if (id) {
      const { data, error } = await supabase
        .from('links')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      
      return NextResponse.json(data)
    }
    
    // Build query
    let query = supabase.from('links').select('*').order('createdAt', { ascending: false })
    
    // Filter by content type
    if (contentType) {
      query = query.eq('contentType', contentType)
    }
    
    // Filter by favorite
    if (favorite === 'true') {
      query = query.eq('isFavorite', true)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Error fetching links:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json(data || [])
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { url, title, content, contentType = 'link', tags = [] } = body
    
    // For links, scrape metadata
    let finalTitle = title
    let imageUrl = null
    let finalTags = tags
    
    if (contentType === 'link' && url) {
      const scraped = await scrapeMetaTags(url)
      finalTitle = finalTitle || scraped.title
      imageUrl = scraped.imageUrl
      
      // Auto-categorize if no tags provided
      if (tags.length === 0) {
        finalTags = autoCategorizeTags(url)
      }
    } else if (contentType === 'text' && tags.length === 0) {
      finalTags = autoCategorizeTags(null, content)
    }
    
    const newLink = {
      id: generateId(),
      userId: 'demo_user', // For MVP without auth
      url: url || null,
      title: finalTitle || 'Untitled',
      imageUrl: imageUrl,
      tags: finalTags,
      isFavorite: false,
      contentType: contentType,
      content: content || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    const { data, error } = await supabase
      .from('links')
      .insert([newLink])
      .select()
      .single()
    
    if (error) {
      console.error('Error inserting link:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json()
    const { id, isFavorite, title, tags } = body
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }
    
    const updateData = {
      updatedAt: new Date().toISOString()
    }
    
    if (isFavorite !== undefined) updateData.isFavorite = isFavorite
    if (title !== undefined) updateData.title = title
    if (tags !== undefined) updateData.tags = tags
    
    const { data, error } = await supabase
      .from('links')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating link:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }
    
    const { error } = await supabase
      .from('links')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting link:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
