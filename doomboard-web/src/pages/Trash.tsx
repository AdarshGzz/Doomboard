import { useState, useEffect } from "react";
import { getTrashJobs, restoreJob, deleteJobForever } from "@/services/jobService";
import type { Job } from "@/types";

import { Button } from "@/components/ui/Button";
import { RotateCcw, Trash2 } from "lucide-react";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";

export function TrashPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [confirmConfig, setConfirmConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        isLoading?: boolean;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { }
    });

    useEffect(() => {
        loadJobs();
    }, []);

    useRealtimeSubscription({
        table: 'jobs',
        filter: undefined,
        onInsert: (newJob) => {
            if (newJob.is_deleted) {
                setJobs(prev => [newJob, ...prev]);
            }
        },
        onUpdate: (updatedJob) => {
            setJobs(prev => {
                const exists = prev.find(j => j.id === updatedJob.id);
                const shouldBeHere = updatedJob.is_deleted;

                if (!shouldBeHere) {
                    return prev.filter(j => j.id !== updatedJob.id);
                }
                if (!exists) {
                    return [updatedJob, ...prev];
                }
                return prev.map(j => j.id === updatedJob.id ? updatedJob : j);
            });
        },
        onDelete: (oldJob) => {
            setJobs(prev => prev.filter(j => j.id !== oldJob.id));
        }
    });

    const loadJobs = async () => {
        try {
            const data = await getTrashJobs();
            setJobs(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async (job: Job) => {
        try {
            await restoreJob(job.id);
            setJobs(jobs.filter(j => j.id !== job.id));
        } catch (err) {
            console.error("Failed to restore", err);
        }
    };

    const handleDeleteForever = (job: Job) => {
        setConfirmConfig({
            isOpen: true,
            title: "Delete Forever?",
            message: `Are you sure you want to permanently delete "${job.title}"? This action cannot be undone.`,
            onConfirm: async () => {
                setConfirmConfig(prev => ({ ...prev, isLoading: true }));
                try {
                    await deleteJobForever(job.id);
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
        <div className="space-y-8 max-w-7xl mx-auto pb-20 px-2">
            <div className="space-y-1">
                <h1 className="font-display text-4xl font-black tracking-tight text-white">Trash</h1>
                <p className="text-zinc-500 font-medium">Permanently delete or restore your discarded job leads.</p>
            </div>

            {loading ? (
                <div className="flex min-h-[400px] items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" />
                </div>
            ) : jobs.length === 0 ? (
                <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 p-12 text-center bg-white/[0.02]">
                    <div className="bg-zinc-800 p-4 rounded-full mb-4">
                        <Trash2 className="h-8 w-8 text-zinc-600" />
                    </div>
                    <p className="text-xl font-bold text-white mb-2">Trash is empty</p>
                    <p className="text-zinc-500 max-w-xs">Jobs you remove from your collection will appear here for 30 days.</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {jobs.map(job => (
                        <div key={job.id} className="group relative flex flex-col gap-4 rounded-xl border border-border bg-card/50 p-6 backdrop-blur-sm transition-all hover:bg-card">
                            <div className="space-y-1.5 min-w-0 flex-1">
                                <h3 className="font-display text-xl font-bold leading-tight tracking-tight text-zinc-100 truncate">
                                    {job.title || "Untitled Job"}
                                </h3>
                                <div className="text-sm font-medium text-zinc-500 truncate">
                                    {job.company || "Unknown Company"}
                                </div>
                            </div>
                            
                            <div className="flex gap-3 mt-auto pt-4 border-t border-white/5">
                                <Button 
                                    size="sm" 
                                    variant="secondary" 
                                    className="flex-1 font-bold rounded-xl"
                                    onClick={() => handleRestore(job)}
                                >
                                    <RotateCcw className="mr-2 h-4 w-4" />
                                    Restore
                                </Button>
                                <Button 
                                    size="sm" 
                                    variant="destructive" 
                                    className="flex-1 font-bold rounded-xl"
                                    onClick={() => handleDeleteForever(job)}
                                >
                                    Delete
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <ConfirmationModal
                isOpen={confirmConfig.isOpen}
                onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmConfig.onConfirm}
                title={confirmConfig.title}
                message={confirmConfig.message}
                type="danger"
                isLoading={confirmConfig.isLoading}
                confirmText="Delete Forever"
            />
        </div>
    );
}
