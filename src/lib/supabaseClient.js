import { createClient } from '@supabase/supabase-js'
import config from './supabase-config.example.json'

export async function getSupabaseClient() {
    return createClient(config.supabaseUrl, config.supabaseAnonKey, {
      auth: {
        persistSession: false,
      },
    })
}