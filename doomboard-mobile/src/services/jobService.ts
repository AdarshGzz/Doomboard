import { supabase } from '../lib/supabase';

export interface JobResponse {
    success: boolean;
    error?: string;
    duplicate?: boolean;
    job?: any;
}

export const collectJob = async (link: string, userId: string): Promise<JobResponse> => {
    try {
        if (!userId) throw new Error('User not authenticated');

        // Basic duplicate check SCOPED TO USER
        const { data: existingJobs } = await supabase
            .from('jobs')
            .select('id, title, company, status')
            .eq('normalized_url', link)
            .eq('user_id', userId)
            .eq('is_deleted', false)
            .maybeSingle();

        if (existingJobs) {
            return {
                success: false,
                duplicate: true,
                job: existingJobs
            };
        }

        // Insert new job link with user_id
        const { error } = await supabase
            .from('jobs')
            .insert([
                {
                    user_id: userId,
                    normalized_url: link,
                    title: 'Mobile Clip',
                    company: 'Pending Source',
                    status: 'collected',
                    source: 'Mobile'
                }
            ]);

        if (error) throw error;

        return { success: true };
    } catch (err: any) {
        console.error('Mobile Collect Error:', err);
        return {
            success: false,
            error: err.message || 'Failed to collect link'
        };
    }
};
