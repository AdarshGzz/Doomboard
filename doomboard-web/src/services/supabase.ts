import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase Environment Variables');
}

// Custom storage adapter to use Cookies instead of localStorage
// This allows the browser extension to detect the session
const CookieStorage = {
    getItem: (key: string) => {
        const name = `${key}=`;
        const decodedCookie = decodeURIComponent(document.cookie);
        const ca = decodedCookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length);
            }
        }
        return null;
    },
    setItem: (key: string, value: string) => {
        const d = new Date();
        d.setTime(d.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days
        const expires = "expires=" + d.toUTCString();
        // Path=/ ensures it is available across the site
        // Domain= is not set to allow it on localhost
        document.cookie = `${key}=${value};${expires};path=/;SameSite=Lax`;
    },
    removeItem: (key: string) => {
        document.cookie = `${key}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
    },
};

export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        storage: CookieStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
});
