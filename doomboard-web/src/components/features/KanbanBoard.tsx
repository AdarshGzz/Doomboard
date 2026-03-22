import { useState, useEffect } from "react";
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
    type DragStartEvent,
    useDroppable,
} from "@dnd-kit/core";
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { Eye, GripVertical } from "lucide-react";
import type { Job } from "@/types";
import { updateJobStatus } from "@/services/jobService";

// Column Definitions
const COLUMNS = [
    { id: 'applied', title: 'Applied' },
    { id: 'assignment', title: 'Assignment' },
    { id: 'interview', title: 'Interview' },
    { id: 'offer', title: 'Offer' }
];

interface KanbanBoardProps {
    jobs: Job[];
    onJobUpdate: () => void;
    onJobClick: (job: Job) => void;
}

export function KanbanBoard({ jobs, onJobUpdate, onJobClick }: KanbanBoardProps) {
    const [activeId, setActiveId] = useState<string | null>(null);
    const [columns, setColumns] = useState<Record<string, Job[]>>({});

    useEffect(() => {
        const newColumns: Record<string, Job[]> = {};
        COLUMNS.forEach(col => newColumns[col.id] = []);
        jobs.forEach(job => {
            if (newColumns[job.status]) {
                newColumns[job.status].push(job);
            }
        });
        setColumns(newColumns);
    }, [jobs]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragOver = (event: any) => {
        const { active, over } = event;
        if (!over) return;

        const activeIdStr = active.id as string;
        const overIdStr = over.id as string;

        const activeContainer = findContainer(activeIdStr);
        const overContainer = findContainer(overIdStr);

        if (!activeContainer || !overContainer || activeContainer === overContainer) {
            return;
        }

        setColumns((prev) => {
            const activeItems = prev[activeContainer];
            const overItems = prev[overContainer];

            const activeIndex = activeItems.findIndex((item) => item.id === activeIdStr);
            const overIndex = overItems.findIndex((item) => item.id === overIdStr);

            let newIndex;
            if (COLUMNS.find(c => c.id === overIdStr)) {
                newIndex = overItems.length + 1;
            } else {
                const isBelowOverItem =
                    over &&
                    active.rect.current.translated &&
                    active.rect.current.translated.top >
                    over.rect.top + over.rect.height;

                const modifier = isBelowOverItem ? 1 : 0;
                newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
            }

            const itemToMove = activeItems[activeIndex];
            const updatedItem = { ...itemToMove, status: overContainer as Job["status"] };

            return {
                ...prev,
                [activeContainer]: activeItems.filter((item) => item.id !== activeIdStr),
                [overContainer]: [
                    ...overItems.slice(0, newIndex),
                    updatedItem,
                    ...overItems.slice(newIndex, overItems.length)
                ],
            };
        });
    };

    const findContainer = (id: string) => {
        if (columns[id]) return id;
        return Object.keys(columns).find((key) => columns[key].some((item) => item.id === id));
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const activeIdStr = active.id as string;
        const overIdStr = over.id as string;

        const overContainer = findContainer(overIdStr);
        const activeJob = jobs.find(j => j.id === activeIdStr);

        if (activeJob && overContainer && activeJob.status !== overContainer) {
            try {
                await updateJobStatus(activeJob.id, overContainer as Job["status"]);
                onJobUpdate();
            } catch (err) {
                console.error("Move failed", err);
                onJobUpdate();
            }
        }
    };

    const activeJob = jobs.find(j => j.id === activeId);

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="grid grid-cols-4 h-full gap-6 pb-12 px-2 overflow-hidden">
                {COLUMNS.map(col => (
                    <KanbanColumn
                        key={col.id}
                        id={col.id}
                        title={col.title}
                        jobs={columns[col.id] || []}
                        onJobClick={onJobClick}
                    />
                ))}
            </div>
            <DragOverlay dropAnimation={{
                duration: 200,
                easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
            }}>
                {activeId && activeJob ? (
                    <div className="w-full max-w-[calc(25vw-2rem)]">
                        <KanbanCard 
                            job={activeJob} 
                            isDragging 
                            disabled 
                            className="rotate-[3deg] scale-[1.02] shadow-2xl border-primary/40 ring-4 ring-primary/10"
                        />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}

function KanbanColumn({ id, title, jobs, onJobClick }: { id: string, title: string, jobs: Job[], onJobClick: (j: Job) => void }) {
    const { setNodeRef, isOver } = useDroppable({ id });

    return (
        <div
            ref={setNodeRef}
            className={cn(
                "group flex flex-col gap-4 rounded-3xl p-5 transition-all duration-300",
                "glass border-2 border-transparent",
                isOver ? "bg-primary/10 border-primary/30 shadow-[0_0_30px_hsla(38,90%,55%,0.1)]" : "hover:bg-zinc-900/40"
            )}
        >
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "h-2.5 w-2.5 rounded-full shadow-[0_0_10px_currentColor]",
                        id === 'applied' ? "text-blue-400 bg-blue-400" :
                        id === 'assignment' ? "text-primary bg-primary" :
                        id === 'interview' ? "text-purple-400 bg-purple-400" : "text-accent bg-accent"
                    )} />
                    <h3 className="font-display text-sm font-black uppercase tracking-[0.2em] text-muted-foreground group-hover:text-foreground transition-colors">
                        {title}
                    </h3>
                </div>
                <div className="glass px-2.5 py-1 rounded-lg text-[10px] font-black text-primary font-mono border border-primary/10">
                    {jobs.length}
                </div>
            </div>

            <SortableContext items={jobs.map(j => j.id)} strategy={verticalListSortingStrategy}>
                <div className="flex flex-col gap-3.5 min-h-[200px] custom-scrollbar overflow-y-auto">
                    {jobs.map(job => (
                        <SortableJobCard key={job.id} job={job} onClick={() => onJobClick(job)} />
                    ))}
                </div>
            </SortableContext>
        </div>
    );
}

function KanbanCard({ 
    job, 
    onClick, 
    className, 
    isDragging, 
    isOverlay,
    disabled = false
}: { 
    job: Job, 
    onClick?: () => void, 
    className?: string, 
    isDragging?: boolean,
    isOverlay?: boolean,
    disabled?: boolean
}) {
    // Determine card accent color
    const accentColor = job.status === 'applied' ? "hsla(210, 100%, 50%, 0.5)" :
                       job.status === 'assignment' ? "hsla(38, 90%, 55%, 0.5)" :
                       job.status === 'interview' ? "hsla(280, 80%, 60%, 0.5)" : "hsla(160, 50%, 45%, 0.5)";

    return (
        <div className={cn(
            "group/card relative glass-card p-4 rounded-2xl transition-all duration-300",
            "flex flex-col gap-3",
            !disabled && "cursor-grab active:cursor-grabbing hover:translate-y-[-2px] hover:glow-border hover:shadow-xl",
            isDragging && !isOverlay && "opacity-20 grayscale",
            className
        )}
        style={{ borderLeft: `3px solid ${accentColor}` }}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <h4 className="font-display font-black text-sm text-foreground leading-tight group-hover/card:text-primary transition-colors truncate">
                        {job.title || "Untitled Position"}
                    </h4>
                    <div className="text-[11px] font-bold text-muted-foreground mt-1.5 uppercase tracking-wider truncate flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-border" />
                        {job.company || "Stealth Startup"}
                    </div>
                </div>
                {!disabled && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onClick?.();
                        }}
                        className="p-2 rounded-xl glass hover:bg-primary/20 text-muted-foreground hover:text-primary transition-all outline-none shrink-0"
                    >
                        <Eye className="h-4 w-4" />
                    </button>
                )}
            </div>

            <div className="flex items-center justify-between gap-2 mt-2">
                <div className="flex flex-wrap gap-1.5">
                    {job.skills?.slice(0, 2).map((s, i) => (
                        <span key={i} className="text-[9px] font-black uppercase tracking-tighter px-2 py-1 rounded-lg glass text-muted-foreground border border-white/5">
                            {s}
                        </span>
                    ))}
                    {job.skills && job.skills.length > 2 && (
                        <span className="text-[9px] font-black text-muted-foreground self-center px-1">
                            +{job.skills.length - 2}
                        </span>
                    )}
                </div>
                <GripVertical className="h-3.5 w-3.5 text-muted-foreground/30 group-hover/card:text-muted-foreground/60 transition-colors" />
            </div>
        </div>
    );
}

function SortableJobCard({ job, onClick }: { job: Job, onClick: () => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: job.id });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={() => onClick()}
            className="outline-none"
        >
            <KanbanCard 
                job={job} 
                onClick={onClick} 
                isDragging={isDragging}
            />
        </div>
    );
}
