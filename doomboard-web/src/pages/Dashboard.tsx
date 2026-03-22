import { useState, useEffect } from "react";
import { KanbanBoard } from "@/components/features/KanbanBoard";
import { JobDetailsModal } from "@/components/features/JobDetailsModal";
import { getDashboardJobs } from "@/services/jobService";
import type { Job } from "@/types";
import { Loader2 } from "lucide-react";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";

export function DashboardPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);

    useEffect(() => {
        loadJobs();
    }, []);

    useRealtimeSubscription({
        table: 'jobs',
        filter: undefined,
        onInsert: (newJob) => {
            const isAutomated = ["collected", "processing", "finalized", "error"].includes(newJob.status);
            if (!isAutomated && !newJob.is_deleted) {
                setJobs(prev => [newJob, ...prev]);
            }
        },
        onUpdate: (updatedJob) => {
            setJobs(prev => {
                const exists = prev.find(j => j.id === updatedJob.id);
                const isAutomated = ["collected", "processing", "finalized", "error"].includes(updatedJob.status);
                const shouldBeHere = !isAutomated && !updatedJob.is_deleted;

                if (!shouldBeHere) {
                    return prev.filter(j => j.id !== updatedJob.id);
                }
                if (!exists) {
                    return [updatedJob, ...prev];
                }
                return prev.map(j => j.id === updatedJob.id ? updatedJob : j);
            });
            // Update modal if open
            if (selectedJob?.id === updatedJob.id) {
                setSelectedJob(updatedJob);
            }
        },
        onDelete: (oldJob) => {
            setJobs(prev => prev.filter(j => j.id !== oldJob.id));
            if (selectedJob?.id === oldJob.id) setSelectedJob(null);
        }
    });

    const loadJobs = async () => {
        try {
            const data = await getDashboardJobs();
            setJobs(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleJobUpdate = () => {
        loadJobs();
    };

    const activeStages = ['applied', 'assignment', 'interview', 'offer'];
    const activeJobsCount = jobs.filter(j => activeStages.includes(j.status)).length;

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col space-y-6 w-full px-6">
            <div className="flex items-end justify-between pt-4">
                <div className="space-y-1">
                    <h1 className="font-display text-4xl font-black tracking-tight text-gradient-hero leading-none">Dashboard</h1>
                    <p className="text-muted-foreground font-medium tracking-tight">Manage and advance your active applications.</p>
                </div>
                <div className="glass px-4 py-2 rounded-xl text-xs font-black text-muted-foreground border border-white/5 flex items-center gap-2">
                    <span className="text-primary font-bold text-lg leading-none">{activeJobsCount}</span>
                    <span className="uppercase tracking-[0.1em]">Active Jobs</span>
                </div>
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <div className="flex-1 overflow-hidden">
                    <KanbanBoard
                        jobs={jobs}
                        onJobUpdate={handleJobUpdate}
                        onJobClick={setSelectedJob}
                    />
                </div>
            )}

            {selectedJob && (
                <JobDetailsModal
                    job={selectedJob}
                    onClose={() => setSelectedJob(null)}
                    onUpdate={handleJobUpdate}
                />
            )}
        </div>
    );
}
