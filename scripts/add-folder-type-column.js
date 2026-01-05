#!/usr/bin/env node

// Script to add folderType column to folders table
// This should be run once to update the database schema

import { supabase } from '../lib/supabase.js'

async function addFolderTypeColumn() {
  try {
    console.log('Adding folderType column to folders table...')
    
    // First, let's check if the column already exists
    const { data: columns, error: columnError } = await supabase
      .from('folders')
      .select('*')
      .limit(1)
    
    if (columnError) {
      console.error('Error checking table structure:', columnError)
      return
    }
    
    // Try to add the column using a raw SQL query
    const { error } = await supabase.rpc('add_folder_type_column')
    
    if (error) {
      console.error('Error adding column:', error)
      console.log('You may need to run this SQL manually in your Supabase dashboard:')
      console.log('ALTER TABLE folders ADD COLUMN IF NOT EXISTS "folderType" TEXT DEFAULT \'link\';')
      console.log('UPDATE folders SET "folderType" = \'link\' WHERE "folderType" IS NULL;')
    } else {
      console.log('Successfully added folderType column!')
    }
    
  } catch (error) {
    console.error('Script error:', error)
    console.log('\nManual SQL to run in Supabase dashboard:')
    console.log('ALTER TABLE folders ADD COLUMN IF NOT EXISTS "folderType" TEXT DEFAULT \'link\';')
    console.log('UPDATE folders SET "folderType" = \'link\' WHERE "folderType" IS NULL;')
  }
}

addFolderTypeColumn()