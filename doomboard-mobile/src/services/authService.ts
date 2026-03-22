import { supabase } from '../lib/supabase';

const SCRAPER_URL = 'http://localhost:3001'; // Fallback; change to Mac IP for real device testing

export interface AuthResponse {
    success: boolean;
    error?: string;
    session_url?: string;
}

export const sendOtp = async (email: string): Promise<AuthResponse> => {
    try {
        const response = await fetch(`${SCRAPER_URL}/api/auth/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to send OTP');
        return { success: true };
    } catch (err: any) {
        console.error('Send OTP Error:', err);
        return { success: false, error: err.message };
    }
};

export const verifyOtp = async (email: string, otp: string): Promise<AuthResponse> => {
    try {
        const response = await fetch(`${SCRAPER_URL}/api/auth/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Invalid OTP');
        return { success: true, session_url: data.session_url };
    } catch (err: any) {
        console.error('Verify OTP Error:', err);
        return { success: false, error: err.message };
    }
};

/**
 * Custom hook or helper to handle the Magic Link -> Supabase Session transition
 * In mobile, we fetch the magic link and extract the tokens.
 */
export const signInWithMagicLink = async (link: string) => {
    try {
        // Fetch the link but don't follow redirects to extract the tokens from the final URL
        const response = await fetch(link, { redirect: 'follow' });
        const finalUrl = response.url;
        
        // Extract access_token and refresh_token from the hash fragment
        const params = new URLSearchParams(finalUrl.split('#')[1]);
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');

        if (access_token && refresh_token) {
            const { error } = await supabase.auth.setSession({
                access_token,
                refresh_token,
            });
            if (error) throw error;
            return { success: true };
        }
        throw new Error('Could not extract session from link');
    } catch (err: any) {
        console.error('Magic Link Sign In Error:', err);
        return { success: false, error: err.message };
    }
};
