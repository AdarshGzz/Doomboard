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
            case 'processing': return { label: 'AI Processing', className: 'text-amber-500 border-amber-500/20 bg-amber-500/5 shadow-[0_0_10px_hsla(38,90%,55%,0.1)]' };
            case 'finalized': return { label: 'Tracked', className: 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5 shadow-[0_0_10px_hsla(160,50%,45%,0.1)]' };
            case 'error': return { label: 'Scrape Failed', className: 'text-destructive border-destructive/20 bg-destructive/5' };
            case 'collected': return { label: 'Waiting', className: 'text-muted-foreground border-white/10 bg-white/5' };
            default: return null;
        }
    };

    const statusConfig = getStatusConfig(job.status);

    return (
        <div
            onClick={() => onClick?.(job)}
            className={cn(
                "group relative flex flex-col gap-4 rounded-3xl p-6 transition-all duration-300",
                "glass-card border border-white/5",
                "hover:glow-border hover:shadow-[0_0_30px_hsla(38,90%,55%,0.1)] hover:scale-[1.01] cursor-pointer"
            )}
        >
            <div className="flex items-start justify-between gap-4 overflow-hidden">
                <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                        <h3 className="font-display text-xl font-black leading-tight tracking-tight text-foreground group-hover:text-primary transition-colors truncate min-w-0" title={job.title || "Untitled Job"}>
                            {job.title || "Untitled Job"}
                        </h3>
                        {statusConfig && (
                            <span className={cn("text-[9px] font-black uppercase tracking-[0.1em] px-2 py-1 rounded-lg border shrink-0", statusConfig.className)}>
                                {statusConfig.label}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground/80 overflow-hidden font-medium">
                        <div className="flex items-center gap-1.5 min-w-0">
                            <Building2 className="h-4 w-4 shrink-0 text-primary" />
                            <span className="truncate">{job.company || "Unknown Company"}</span>
                        </div>
                        <span className="w-1 h-1 rounded-full bg-border shrink-0" />
                        <span className="text-xs tracking-wide uppercase opacity-70 shrink-0 font-bold">{job.source || "Web"}</span>
                    </div>
                </div>
                <div className="flex gap-2 opacity-0 transition-all duration-300 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0">
                    <Button
                        variant="secondary"
                        size="icon"
                        className="h-10 w-10 rounded-xl glass hover:bg-primary/20 text-primary border-primary/10 shadow-lg"
                        onClick={(e) => {
                            e.stopPropagation();
                            window.open(job.normalized_url, '_blank')
                        }}
                    >
                        <ExternalLink className="h-4.5 w-4.5" />
                    </Button>
                </div>
            </div>

            {job.skills && job.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                    {job.skills.slice(0, 3).map((skill, i) => (
                        <span key={i} className="inline-flex items-center rounded-lg glass px-3 py-1 text-[10px] font-black uppercase tracking-tighter text-muted-foreground border border-white/5">
                            {skill}
                        </span>
                    ))}
                    {job.skills.length > 3 && (
                        <span className="text-[10px] font-black text-muted-foreground/50 self-center ml-1">
                            +{job.skills.length - 3}
                        </span>
                    )}
                </div>
            )}

            <div className="flex items-center justify-between pt-5 mt-auto border-t border-white/5">
                <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                    <Calendar className="h-3.5 w-3.5 text-primary/40" />
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
                        className="h-9 px-4 text-[11px] font-black uppercase tracking-wider text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
                    >
                        <Trash2 className="mr-2 h-3.5 w-3.5" />
                        Remove
                    </Button>
                    {showApply && (
                        <Button
                            size="sm"
                            className="h-9 px-4 text-[11px] font-black uppercase tracking-wider btn-glow bg-primary text-primary-foreground hover:bg-primary/90 transition-all active:scale-[0.98] rounded-xl"
                            onClick={(e) => {
                                e.stopPropagation();
                                onApply(job);
                            }}
                        >
                            <Check className="mr-2 h-4 w-4" />
                            Applied
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
