export interface Job {
    id: string;
    normalized_url: string;
    title: string;
    company: string;
    description?: string;
    location?: string;
    salary?: string;
    posted_at?: string;
    work_type?: string;
    status: 'collected' | 'processing' | 'finalized' | 'error' | 'applied' | 'assignment' | 'interview' | 'offer' | 'rejected' | 'ghosted';
    is_deleted: boolean;
    skills?: string[];
    notes?: string;
    source?: string;
    created_at: string;
}


export interface AppConfig {
    id: number;
    passcode_hash: string;
}
