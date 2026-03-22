import { useState, useEffect, useCallback } from "react";
import { X, ExternalLink, Trash2, Check, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import type { Job } from "@/types";
import { softDeleteJob, updateJobNotes } from "@/services/jobService";
import { cn } from "@/lib/utils";
import { debounce } from "lodash";

interface JobDetailsModalProps {
    job: Job | null;
    onClose: () => void;
    onUpdate: () => void;
}

export function JobDetailsModal({ job, onClose, onUpdate }: JobDetailsModalProps) {
    const [notes, setNotes] = useState("");
    const [saving, setSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        // Initialize from prop only when job ID changes
        if (job?.id) {
            setNotes(job.notes || "");
            setLastSaved(null);
        }
    }, [job?.id]);

    // Use a persistent debounced function
    const debouncedSave = useCallback(
        debounce(async (id: string, newNotes: string) => {
            setSaving(true);
            try {
                await updateJobNotes(id, newNotes);
                setLastSaved(new Date());
                onUpdate(); // Update parent state so it has the latest notes
            } catch (err) {
                console.error("Save failed", err);
            } finally {
                setSaving(false);
            }
        }, 500),
        [onUpdate]
    );

    // Cleanup or flush on unmount
    useEffect(() => {
        return () => {
            debouncedSave.cancel();
        };
    }, [debouncedSave]);

    const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        setNotes(val);
        if (job) {
            debouncedSave(job.id, val);
        }
    };

    if (!job) return null;

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await softDeleteJob(job.id);
            onUpdate();
            onClose();
        } catch (err) {
            console.error("Delete failed", err);
        } finally {
            setIsDeleting(false);
            setIsConfirmOpen(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
            <div className="absolute inset-0 bg-background/60 backdrop-blur-xl" onClick={onClose} />
            
            {/* Ambient Glows */}
            <div className="absolute top-1/4 -right-20 w-96 h-96 bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-accent/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="relative w-full max-w-5xl h-full max-h-[90vh] flex flex-col rounded-[2.5rem] border border-white/10 glass-card shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row items-start justify-between gap-6 border-b border-white/5 p-8 sm:p-10 bg-gradient-to-b from-white/5 to-transparent relative overflow-hidden">
                    <div className="space-y-4 flex-1 w-full min-w-0">
                        <div className="flex items-center gap-3">
                            <span className={cn(
                                "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm",
                                job.status === 'collected' ? "text-blue-400 border-blue-500/20 bg-blue-500/5" :
                                job.status === 'processing' ? "text-amber-500 border-amber-500/20 bg-amber-500/5 shadow-[0_0_15px_hsla(38,90%,55%,0.1)]" :
                                job.status === 'interview' ? "text-purple-400 border-purple-500/20 bg-purple-500/5" :
                                job.status === 'error' ? "text-destructive border-destructive/20 bg-destructive/5" :
                                "text-emerald-500 border-emerald-500/20 bg-emerald-500/5"
                            )}>
                                {job.status.replace('_', ' ')}
                            </span>
                            {job.source && (
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 border border-white/5 px-2 py-1 rounded-lg">
                                    {job.source}
                                </span>
                            )}
                        </div>
                        <h2 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-gradient-hero leading-[1.1] break-words">
                            {job.title || "Untitled Position"}
                        </h2>
                        <div className="flex flex-wrap items-center gap-4 text-base sm:text-lg text-muted-foreground font-medium">
                            <span className="text-foreground font-bold flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_hsla(38,90%,55%,0.5)]" />
                                {job.company || "Stealth Startup"}
                            </span>
                            <span className="hidden sm:inline opacity-30">|</span>
                            <a
                                href={job.normalized_url}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center text-primary/80 hover:text-primary transition-all hover:underline underline-offset-4 group"
                            >
                                View Listing 
                                <ExternalLink className="ml-2 h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </a>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="absolute top-6 right-6 sm:relative sm:top-0 sm:right-0 rounded-2xl h-12 w-12 glass hover:bg-white/10 text-muted-foreground hover:text-white transition-all order-first sm:order-last"
                    >
                        <X className="h-6 w-6" />
                    </Button>
                </div>

                {/* Content Section */}
                <div className="flex-1 overflow-y-auto p-8 sm:p-10 custom-scrollbar bg-gradient-to-b from-transparent to-black/20">
                    <div className="grid grid-cols-12 gap-8 sm:gap-12">
                        {/* Summary Column */}
                        <div className="col-span-12 lg:col-span-4 space-y-10">
                            <div className="space-y-6">
                                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-primary/60 pl-1">Essentials</h3>
                                <div className="grid grid-cols-1 gap-4">
                                    {[
                                        { label: 'Location', value: job.location },
                                        { label: 'Salary Range', value: job.salary },
                                        { label: 'Work Type', value: job.work_type },
                                        { label: 'Date Collected', value: job.created_at ? new Date(job.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : null }
                                    ].map((item, i) => item.value ? (
                                        <div key={i} className="flex flex-col gap-2 p-5 rounded-3xl glass border border-white/5 hover:border-white/10 transition-colors">
                                            <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/50">{item.label}</span>
                                            <span className="text-base font-bold text-foreground leading-snug">{item.value}</span>
                                        </div>
                                    ) : null)}
                                </div>
                            </div>

                            {job.skills && job.skills.length > 0 && (
                                <div className="space-y-6">
                                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-primary/60 pl-1">Target Skills</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {job.skills.map((skill, i) => (
                                            <span
                                                key={i}
                                                className="px-4 py-2 rounded-xl glass text-muted-foreground text-[11px] font-black uppercase tracking-tight border border-white/5 hover:border-primary/40 hover:text-primary transition-all duration-300"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Description & Notes Column */}
                        <div className="col-span-12 lg:col-span-8 space-y-10">
                            <div className="space-y-6">
                                <div className="flex items-center justify-between pl-1">
                                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-primary/60">Description</h3>
                                    <span className="text-[9px] font-black text-muted-foreground/30 font-mono tracking-widest">AI ANALYSIS READY</span>
                                </div>
                                <div className="relative p-8 rounded-[2rem] glass border border-white/5 min-h-[200px]">
                                    <div className="prose prose-invert prose-amber max-w-none text-muted-foreground/90 leading-relaxed font-medium text-lg">
                                        {job.description || "Synthesizing details..."}
                                    </div>
                                    {job.status === 'processing' && (
                                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm rounded-[2rem] flex items-center justify-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <RefreshCw className="h-8 w-8 text-primary animate-spin" />
                                                <span className="text-xs font-black uppercase tracking-widest text-primary animate-pulse">Analyzing...</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-6 pt-4">
                                <div className="flex items-center justify-between pl-1">
                                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-primary/60">Strategy Notes</h3>
                                    <div className="flex items-center gap-2 text-[10px] font-bold transition-all duration-300">
                                        {saving ? (
                                            <span className="text-primary flex items-center gap-1.5 animate-pulse">
                                                <RefreshCw className="h-3 w-3 animate-spin" /> SYNCING...
                                            </span>
                                        ) : lastSaved ? (
                                            <span className="text-emerald-500/60 flex items-center gap-1.5">
                                                <Check className="h-3 w-3" /> PERSISTED
                                            </span>
                                        ) : null}
                                    </div>
                                </div>
                                <textarea
                                    className="w-full min-h-[200px] rounded-[2rem] glass border border-white/5 p-8 text-foreground text-lg font-medium focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/40 transition-all placeholder:text-muted-foreground/20 outline-none resize-none"
                                    placeholder="Click to strategist your approach..."
                                    value={notes}
                                    onChange={handleNotesChange}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Footer */}
                <div className="border-t border-white/5 p-8 bg-black/40 backdrop-blur-md flex flex-col sm:flex-row justify-between items-center gap-6">
                    <Button
                        variant="ghost"
                        onClick={() => setIsConfirmOpen(true)}
                        className="text-muted-foreground/60 hover:text-red-400 hover:bg-red-500/10 transition-all font-black uppercase tracking-widest text-xs rounded-xl h-12 px-6"
                    >
                        <Trash2 className="mr-3 h-4.5 w-4.5" />
                        Trash Lead
                    </Button>
                    <div className="flex gap-4 w-full sm:w-auto">
                        <Button
                            onClick={onClose}
                            className="w-full sm:w-auto btn-glow bg-primary text-primary-foreground font-black uppercase tracking-widest px-12 h-14 rounded-2xl transition-all active:scale-95 text-sm"
                        >
                            Close Details
                        </Button>
                    </div>
                </div>
            </div>

            <ConfirmationModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleDelete}
                title="Move to Trash"
                message={`Are you sure you want to discard "${job.title}"?`}
                type="danger"
                isLoading={isDeleting}
                confirmText="Discard Lead"
            />
        </div>
    );
}
