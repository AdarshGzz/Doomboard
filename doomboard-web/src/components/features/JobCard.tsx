import { formatDistanceToNow, isValid } from "date-fns";
import { Building2, Calendar, Check, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { Job } from "@/types";

const safeDate = (dateString: string | undefined) => {
    if (!dateString) return "recently";
    const date = new Date(dateString);
    return isValid(date) ? formatDistanceToNow(date, { addSuffix: true }) : "recently";
};

interface JobCardProps {
    job: Job;
    onApply: (job: Job) => void;
    onDelete: (job: Job) => void;
    onClick?: (job: Job) => void;
    showApply?: boolean;
}

export function JobCard({ job, onApply, onDelete, onClick, showApply = true }: JobCardProps) {
    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'processing': return { label: 'AI Processing', className: 'bg-amber-500/10 text-amber-500 border-amber-500/20' };
            case 'finalized': return { label: 'Tracked', className: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' };
            case 'error': return { label: 'Scrape Failed', className: 'bg-destructive/10 text-destructive border-destructive/20' };
            case 'collected': return { label: 'Waiting', className: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' };
            default: return null;
        }
    };

    const statusConfig = getStatusConfig(job.status);

    return (
        <div
            onClick={() => onClick?.(job)}
            className={cn(
                "group relative flex flex-col gap-4 rounded-xl border border-border bg-card p-6 transition-all",
                "hover:border-primary/50 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
            )}
        >
            <div className="flex items-start justify-between">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                        <h3 className="font-display text-xl font-bold leading-tight tracking-tight text-foreground group-hover:text-primary transition-colors">
                            {job.title || "Untitled Job"}
                        </h3>
                        {statusConfig && (
                            <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border", statusConfig.className)}>
                                {statusConfig.label}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground/80">
                        <div className="flex items-center gap-1.5">
                            <Building2 className="h-4 w-4" />
                            <span className="font-medium text-muted-foreground">{job.company || "Unknown Company"}</span>
                        </div>
                        <span className="text-zinc-800 mx-0.5">•</span>
                        <span className="text-xs opacity-80">{job.source || "Web"}</span>
                    </div>
                </div>
                <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                        variant="secondary"
                        size="icon"
                        className="h-9 w-9 rounded-full"
                        onClick={(e) => {
                            e.stopPropagation();
                            window.open(job.normalized_url, '_blank')
                        }}
                    >
                        <ExternalLink className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {job.skills && job.skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {job.skills.slice(0, 4).map((skill, i) => (
                        <span key={i} className="inline-flex items-center rounded-md bg-zinc-900/50 px-2.5 py-1 text-xs font-medium text-zinc-300 border border-border/50">
                            {skill}
                        </span>
                    ))}
                    {job.skills.length > 4 && (
                        <span className="text-xs text-muted-foreground self-center ml-1 font-mono">
                            +{job.skills.length - 4} More
                        </span>
                    )}
                </div>
            )}

            <div className="flex items-center justify-between pt-4 mt-auto border-t border-border/40">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground/70">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Added {safeDate(job.created_at)}</span>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(job);
                        }}
                        className="h-8 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                        <Trash2 className="mr-2 h-3.5 w-3.5" />
                        Remove
                    </Button>
                    {showApply && (
                        <Button
                            size="sm"
                            className="h-8 text-xs shadow-sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onApply(job);
                            }}
                        >
                            <Check className="mr-2 h-3.5 w-3.5" />
                            Applied
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
