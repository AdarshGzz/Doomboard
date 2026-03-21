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
    status: 'collected' | 'processing' | 'finalized' | 'error' | 'applied' | 'assignment' | 'interview_r1' | 'interview_r2' | 'interview_r3' | 'hr' | 'offer' | 'rejected' | 'ghosted';
    resume_used_id?: string;
    is_deleted: boolean;
    skills?: string[];
    notes?: string;
    source?: string;
    resumes?: { name: string; file_url: string; created_at: string } | null;
    created_at: string;
}

export interface Resume {
    id: string;
    name: string;
    file_url: string;
    created_at: string;
}

export interface AppConfig {
    id: number;
    passcode_hash: string;
}
