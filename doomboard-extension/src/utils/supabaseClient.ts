import { createClient } from '@supabase/supabase-js';

// TODO: Replace with actual project values
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        persistSession: false, // We rely on the web app's session or manual token handling
        autoRefreshToken: false,
    }
});
