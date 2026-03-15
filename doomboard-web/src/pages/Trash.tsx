import { useState, useEffect } from "react";
import { getTrashJobs, restoreJob, deleteJobForever } from "@/services/jobService";
import type { Job } from "@/types";

import { Button } from "@/components/ui/Button";
import { RotateCcw } from "lucide-react";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";

export function TrashPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);

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

    const handleDeleteForever = async (job: Job) => {
        if (!confirm("Delete forever? This action cannot be undone.")) return;
        try {
            await deleteJobForever(job.id);
            setJobs(jobs.filter(j => j.id !== job.id));
        } catch (err) {
            console.error("Failed to delete", err);
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div>
                <h1 className="font-display text-3xl font-bold">Trash</h1>
                <p className="text-muted-foreground">Manage deleted jobs.</p>
            </div>

            {loading ? (
                <div>Loading...</div>
            ) : jobs.length === 0 ? (
                <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
                    <p>Trash is empty.</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {jobs.map(job => (
                        <div key={job.id} className="relative">
                            {/* Reuse JobCard but override actions */}
                            {/* Actually JobCard has specific actions. We might need a TrashJobCard or just custom renderer */}
                            {/* Let's construct a simple card here for Trash */}
                            <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5 opacity-75">
                                <h3 className="font-display text-lg font-semibold">{job.title}</h3>
                                <div className="text-sm text-muted-foreground">{job.company}</div>
                                <div className="flex gap-2 mt-auto pt-2">
                                    <Button size="sm" variant="outline" onClick={() => handleRestore(job)}>
                                        <RotateCcw className="mr-2 h-4 w-4" />
                                        Restore
                                    </Button>
                                    <Button size="sm" variant="destructive" onClick={() => handleDeleteForever(job)}>
                                        Delete Forever
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
