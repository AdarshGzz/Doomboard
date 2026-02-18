import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://saxgnrkwbxrioomdwrsp.supabase.co';
const supabaseAnonKey = 'sb_publishable_qCyv96oOeWWYO_oARhQAXQ_MPLaDvjP';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
