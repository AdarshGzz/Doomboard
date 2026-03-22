import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://saxgnrkwbxrioomdwrsp.supabase.co';
const supabaseAnonKey = 'sb_publishable_qCyv96oOeWWYO_oARhQAXQ_MPLaDvjP';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
