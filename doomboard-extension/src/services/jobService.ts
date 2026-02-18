import { supabase } from '../utils/supabaseClient';

export interface JobSubmission {
    url: string;
    title: string;
    company: string;
    source: string;
}

export interface JobResponse {
    success?: boolean;
    duplicate?: boolean;
    job?: {
        title: string;
        company: string;
        status: string;
    };
    error?: string;
}

/**
 * Direct Job Collection
 * This performs a direct database insert into Supabase with 'collected' status.
 * The backend scraper-service worker will pick this up via Realtime.
 */
export const collectJob = async (jobDetails: JobSubmission): Promise<JobResponse> => {
    try {
        const { data, error } = await supabase
            .from('jobs')
            .insert({
                normalized_url: jobDetails.url,
                title: jobDetails.title,
                company: jobDetails.company,
                source: jobDetails.source,
                status: 'collected' // Trigger for background worker
            })
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                const { data: existing } = await supabase
                    .from('jobs')
                    .select('title, company, status')
                    .eq('normalized_url', jobDetails.url)
                    .eq('is_deleted', false)
                    .single();

                return {
                    duplicate: true,
                    job: existing || { title: jobDetails.title, company: jobDetails.company, status: 'tracked' }
                };
            }
            throw error;
        }

        return {
            success: true,
            job: {
                title: data.title || jobDetails.title,
                company: data.company || jobDetails.company,
                status: data.status
            }
        };
    } catch (err: any) {
        console.error('Error collecting job:', err);
        return { error: err.message || 'Failed to save job' };
    }
};
