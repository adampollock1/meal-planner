import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// #region agent log
fetch('http://127.0.0.1:7249/ingest/24630c7d-265b-4884-88b6-481174deff54',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'supabase.ts:init',message:'Supabase env vars',data:{hasUrl:!!supabaseUrl,hasKey:!!supabaseAnonKey,urlPrefix:supabaseUrl?.substring(0,30),keyPrefix:supabaseAnonKey?.substring(0,10),urlIncludesSupabase:supabaseUrl?.includes('supabase.co'),keyStartsWithEyJ:supabaseAnonKey?.startsWith('eyJ')},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H6'})}).catch(()=>{});
// #endregion

// Check if Supabase is properly configured
export const isSupabaseConfigured = !!(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.includes('supabase.co') &&
  supabaseAnonKey.startsWith('eyJ')
);

if (!isSupabaseConfigured) {
  console.warn(
    'Supabase credentials not properly configured. Please add valid VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.',
    '\nExpected URL format: https://xxxxx.supabase.co',
    '\nExpected key format: eyJ... (JWT token from Supabase dashboard)'
  );
}

// Create client only if configured, otherwise create a dummy client
export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDY5MzMxNzAsImV4cCI6MTk2MjUwOTE3MH0.placeholder');

// Database types for type safety
export interface DbMeal {
  id: string;
  user_id: string;
  name: string;
  meal_type: string;
  day: string;
  date: string;
  ingredients: Array<{
    id: string;
    name: string;
    quantity: number;
    unit: string;
    category: string;
  }>;
  created_at: string;
}

export interface DbFavorite {
  id: string;
  user_id: string;
  name: string;
  meal_type: string;
  ingredients: Array<{
    id: string;
    name: string;
    quantity: number;
    unit: string;
    category: string;
  }>;
  created_at: string;
}

export interface DbConversation {
  id: string;
  user_id: string;
  title: string;
  messages: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    meals?: DbMeal[];
    timestamp: string;
  }>;
  created_at: string;
  updated_at: string;
}

export interface DbUserSettings {
  id: string;
  theme: 'light' | 'dark' | 'system';
  default_servings: number;
  week_starts_on: 'Sunday' | 'Monday';
  notifications: boolean;
  created_at: string;
}
