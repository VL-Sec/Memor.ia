import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vczmygfrsmxzkyzzckfu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjem15Z2Zyc214emt5enpja2Z1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2MTA5ODQsImV4cCI6MjA4MzE4Njk4NH0.qj0kSBcZpdLYxCLWY-fKchxLKJeBhUBoOAe13Sk4I2Q';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const generateId = () => {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
};
