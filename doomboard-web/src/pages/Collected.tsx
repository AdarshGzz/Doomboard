import { useState, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import { JobCard } from "@/components/features/JobCard";
import { JobDetailsModal } from "@/components/features/JobDetailsModal";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { getCollectedJobs, softDeleteJob, applyJob } from "@/services/jobService";
import type { Job } from "@/types";

import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";

export function CollectedPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [jobToView, setJobToView] = useState<Job | null>(null);
    const [confirmConfig, setConfirmConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        type: 'danger' | 'info';
        isLoading?: boolean;
        confirmText?: string;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        type: 'info'
    });

    useEffect(() => {
        loadJobs();
    }, []);

    useRealtimeSubscription({
        table: 'jobs',
        filter: undefined,
        onInsert: (newJob) => {
            const isTracked = ["collected", "processing", "finalized", "error"].includes(newJob.status);
            if (isTracked && !newJob.is_deleted) {
                setJobs(prev => [newJob, ...prev]);
            }
        },
        onUpdate: (updatedJob) => {
            setJobs(prev => {
                const exists = prev.find(j => j.id === updatedJob.id);
                const isTracked = ["collected", "processing", "finalized", "error"].includes(updatedJob.status);

                if (!isTracked || updatedJob.is_deleted) {
                    return prev.filter(j => j.id !== updatedJob.id);
                }
                if (!exists) {
                    return [updatedJob, ...prev];
                }
                return prev.map(j => j.id === updatedJob.id ? updatedJob : j);
            });

            if (jobToView?.id === updatedJob.id) {
                setJobToView(updatedJob);
            }
        },
        onDelete: (oldJob) => {
            setJobs(prev => prev.filter(j => j.id !== oldJob.id));
            if (jobToView?.id === oldJob.id) setJobToView(null);
        }
    });

    const loadJobs = async () => {
        try {
            const data = await getCollectedJobs();
            setJobs(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleApplyClick = (job: Job) => {
        setConfirmConfig({
            isOpen: true,
            title: "Move to Dashboard",
            message: `Mark "${job.title}" as applied and move to your active board?`,
            type: 'info',
            onConfirm: async () => {
                setConfirmConfig(prev => ({ ...prev, isLoading: true }));
                try {
                    await applyJob(job.id);
                    setJobs(prev => prev.filter(j => j.id !== job.id));
                    setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                } catch (err) {
                    console.error("Failed to apply", err);
                } finally {
                    setConfirmConfig(prev => ({ ...prev, isLoading: false }));
                }
            }
        });
    };

    const handleDelete = (job: Job) => {
        setConfirmConfig({
            isOpen: true,
            title: "Remove Lead",
            message: `Are you sure you want to remove this job from your collection?`,
            type: 'danger',
            confirmText: "Remove",
            onConfirm: async () => {
                setConfirmConfig(prev => ({ ...prev, isLoading: true }));
                try {
                    await softDeleteJob(job.id);
                    setJobs(prev => prev.filter(j => j.id !== job.id));
                    setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                } catch (err) {
                    console.error("Failed to delete", err);
                } finally {
                    setConfirmConfig(prev => ({ ...prev, isLoading: false }));
                }
            }
        });
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-20">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between px-2 pt-4">
                <div className="space-y-1">
                    <h1 className="font-display text-4xl font-black tracking-tight text-gradient-hero">Collected Jobs</h1>
                    <p className="text-muted-foreground font-medium">Auto-extracted job leads waiting for your application.</p>
                </div>
            </div>

            {loading ? (
                <div className="flex min-h-[400px] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : jobs.length === 0 ? (
                <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 p-12 text-center glass shadow-2xl">
                    <div className="bg-primary/10 p-5 rounded-2xl mb-6 btn-glow-sm shadow-[0_0_20px_hsla(38,90%,55%,0.2)]">
                        <Search className="h-10 w-10 text-primary" />
                    </div>
                    <p className="text-2xl font-black text-gradient-hero mb-3">No leads yet</p>
                    <p className="text-muted-foreground max-w-xs font-medium leading-relaxed">
                        Use the DOOMBOARD browser extension to track jobs directly from LinkedIn, Indeed, and more.
                    </p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {jobs.map(job => (
                        <JobCard
                            key={job.id}
                            job={job}
                            onApply={handleApplyClick}
                            onDelete={handleDelete}
                            onClick={setJobToView}
                        />
                    ))}
                </div>
            )}

            <JobDetailsModal
                job={jobToView}
                onClose={() => setJobToView(null)}
                onUpdate={loadJobs}
            />

            <ConfirmationModal
                isOpen={confirmConfig.isOpen}
                onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmConfig.onConfirm}
                title={confirmConfig.title}
                message={confirmConfig.message}
                type={confirmConfig.type}
                isLoading={confirmConfig.isLoading}
                confirmText={confirmConfig.confirmText}
            />
        </div>
    );
}
