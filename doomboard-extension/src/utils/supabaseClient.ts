import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const WEB_APP_URL = import.meta.env.VITE_WEB_APP_URL || 'http://localhost:5173';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        persistSession: false,
        autoRefreshToken: true,
    }
});

/**
 * Syncs the Supabase session from the Web App's cookies.
 * This ensures the extension uses the same user account.
 */
export const syncSession = async (): Promise<boolean> => {
    return new Promise((resolve) => {
        if (typeof chrome === 'undefined' || !chrome.cookies) {
            console.warn("Chrome Cookies API not available (not in extension context)");
            resolve(false);
            return;
        }

        // The cookie name format: sb-[project-id]-auth-token
        const projectId = SUPABASE_URL.split('.')[0].replace('https://', '');
        const cookieName = `sb-${projectId}-auth-token`;

        chrome.cookies.get({
            url: WEB_APP_URL,
            name: cookieName
        }, async (cookie) => {
            if (cookie && cookie.value) {
                try {
                    const sessionData = JSON.parse(decodeURIComponent(cookie.value));
                    const { error } = await supabase.auth.setSession({
                        access_token: sessionData.access_token,
                        refresh_token: sessionData.refresh_token
                    });
                    
                    if (error) throw error;
                    console.log("Extension session synced successfully!");
                    resolve(true);
                } catch (err) {
                    console.error("Failed to parse/set session cookie:", err);
                    resolve(false);
                }
            } else {
                console.log("No auth cookie found for web app.");
                resolve(false);
            }
        });
    });
};
