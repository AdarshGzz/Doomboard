import { supabase } from '../lib/supabase';

export interface JobResponse {
    success: boolean;
    error?: string;
    duplicate?: boolean;
    job?: any;
}

export const collectJob = async (link: string): Promise<JobResponse> => {
    try {
        // Basic duplicate check
        const { data: existingJobs } = await supabase
            .from('jobs')
            .select('id, title, company, status')
            .eq('normalized_url', link)
            .single();

        if (existingJobs) {
            return {
                success: false,
                duplicate: true,
                job: existingJobs
            };
        }

        // Insert new job link
        const { error } = await supabase
            .from('jobs')
            .insert([
                {
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
