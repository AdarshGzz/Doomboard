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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-md" onClick={onClose} />
            <div className="relative w-full max-w-5xl h-[90vh] flex flex-col rounded-3xl border border-white/10 bg-zinc-900 shadow-2xl overflow-hidden ring-1 ring-white/5 animate-in fade-in zoom-in duration-300">
                {/* Header Section */}
                <div className="flex items-start justify-between border-b border-white/5 p-8 bg-gradient-to-b from-white/5 to-transparent">
                    <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                            <span className={cn(
                                "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter border",
                                job.status === 'collected' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                                    job.status === 'processing' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                        job.status === 'interview' ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                                            "bg-green-500/10 text-green-400 border-green-500/20"
                            )}>
                                {job.status.replace('_', ' ')}
                            </span>
                        </div>
                        <h2 className="text-4xl font-black font-display tracking-tight text-white leading-tight">
                            {job.title}
                        </h2>
                        <div className="flex items-center gap-3 text-lg text-zinc-400 font-medium">
                            <span className="text-white">{job.company}</span>
                            <span className="text-zinc-800">•</span>
                            <a
                                href={job.normalized_url}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center text-primary/80 hover:text-primary transition-colors hover:underline"
                            >
                                View Job Listing <ExternalLink className="ml-1.5 h-4 w-4" />
                            </a>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="rounded-full h-12 w-12 hover:bg-white/10 text-white/50 hover:text-white transition-all"
                    >
                        <X className="h-6 w-6" />
                    </Button>
                </div>

                {/* Content Section */}
                <div className="flex-1 overflow-y-auto p-8 pt-0 custom-scrollbar">
                    <div className="grid grid-cols-12 gap-10 pt-8">
                        {/* Summary Column */}
                        <div className="col-span-4 space-y-10">
                            <div className="space-y-6">
                                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-600">Job Essentials</h3>
                                <div className="grid grid-cols-1 gap-6">
                                    {[
                                        { label: 'Location', value: job.location },
                                        { label: 'Salary Range', value: job.salary },
                                        { label: 'Work Type', value: job.work_type },
                                        { label: 'Date Collected', value: job.created_at ? new Date(job.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : null }
                                    ].map((item, i) => item.value ? (
                                        <div key={i} className="flex flex-col gap-1.5 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                                            <span className="text-[10px] uppercase font-black tracking-widest text-zinc-700">{item.label}</span>
                                            <span className="text-base font-bold text-zinc-100">{item.value}</span>
                                        </div>
                                    ) : null)}

                                </div>
                            </div>

                            {job.skills && job.skills.length > 0 && (
                                <div className="space-y-6">
                                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-600">Skills Required</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {job.skills.map((skill, i) => (
                                            <span
                                                key={i}
                                                className="px-3 py-1.5 rounded-lg bg-zinc-800/50 text-zinc-300 text-xs font-bold border border-white/5 hover:border-primary/30 transition-colors"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Description & Notes Column */}
                        <div className="col-span-8 space-y-10 pr-4">
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-600">Job Description</h3>
                                    <span className="text-[10px] font-bold text-zinc-800 font-mono">AI PROCESSED</span>
                                </div>
                                <div className="relative p-8 rounded-3xl bg-white/[0.02] border border-white/5">
                                    <div className="prose prose-invert prose-lg max-w-none text-zinc-400 leading-relaxed font-medium">
                                        {job.description || "No description available."}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6 pt-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-600">Notes</h3>
                                    <div className="flex items-center gap-2 text-[10px] font-bold transition-all duration-300">
                                        {saving ? (
                                            <span className="text-primary flex items-center gap-1.5 animate-pulse">
                                                <RefreshCw className="h-3 w-3 animate-spin" /> SAVING...
                                            </span>
                                        ) : lastSaved ? (
                                            <span className="text-zinc-600 flex items-center gap-1.5">
                                                <Check className="h-3 w-3" /> SAVED
                                            </span>
                                        ) : null}
                                    </div>
                                </div>
                                <textarea
                                    className="w-full min-h-[200px] rounded-3xl bg-zinc-950/50 border border-white/5 p-6 text-zinc-200 text-lg font-medium focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/40 transition-all placeholder:text-zinc-800 outline-none"
                                    placeholder="Click to start typing personal notes..."
                                    value={notes}
                                    onChange={handleNotesChange}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Footer */}
                <div className="border-t border-white/5 p-8 bg-zinc-950/50 flex justify-between items-center">
                    <Button
                        variant="ghost"
                        onClick={() => setIsConfirmOpen(true)}
                        className="text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-all font-bold text-sm"
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Move to Trash
                    </Button>
                    <div className="flex gap-4">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="bg-zinc-800 border-white/5 hover:bg-zinc-700 text-white font-bold px-8 h-12 rounded-xl transition-all"
                        >
                            Close
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
