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
                "group flex flex-col gap-4 rounded-3xl p-4 transition-all duration-300",
                "bg-zinc-900/40 border-2 border-transparent",
                isOver ? "bg-primary/5 border-primary/20 ring-4 ring-primary/5" : "hover:bg-zinc-900/60"
            )}
        >
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "h-2 w-2 rounded-full",
                        id === 'applied' ? "bg-blue-500" :
                        id === 'assignment' ? "bg-amber-500" :
                        id === 'interview' ? "bg-purple-500" : "bg-green-500"
                    )} />
                    <h3 className="font-display text-sm font-black uppercase tracking-[0.15em] text-zinc-400">
                        {title}
                    </h3>
                </div>
                <div className="bg-white/5 px-2 py-0.5 rounded-lg text-[10px] font-black text-zinc-500 font-mono border border-white/5">
                    {jobs.length}
                </div>
            </div>

            <SortableContext items={jobs.map(j => j.id)} strategy={verticalListSortingStrategy}>
                <div className="flex flex-col gap-3 min-h-[150px] custom-scrollbar overflow-y-auto">
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
    return (
        <div className={cn(
            "group/card relative bg-zinc-900/80 border border-white/5 p-4 rounded-2xl shadow-sm transition-all duration-200",
            "flex flex-col gap-3 backdrop-blur-sm",
            !disabled && "cursor-grab active:cursor-grabbing hover:border-primary/30 hover:bg-zinc-800/90 hover:shadow-xl",
            isDragging && !isOverlay && "opacity-20 grayscale",
            className
        )}>
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <h4 className="font-display font-black text-sm text-zinc-100 leading-tight group-hover/card:text-primary transition-colors truncate">
                        {job.title || "Untitled Position"}
                    </h4>
                    <div className="text-[11px] font-bold text-zinc-500 mt-1 uppercase tracking-wider truncate">
                        {job.company || "Stealth Startup"}
                    </div>
                </div>
                {!disabled && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onClick?.();
                        }}
                        className="p-1.5 rounded-lg hover:bg-primary/10 text-zinc-700 hover:text-primary transition-all outline-none shrink-0"
                    >
                        <Eye className="h-4 w-4" />
                    </button>
                )}
            </div>

            <div className="flex items-center justify-between gap-2 mt-1">
                <div className="flex flex-wrap gap-1.5">
                    {job.skills?.slice(0, 2).map((s, i) => (
                        <span key={i} className="text-[9px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded bg-white/5 text-zinc-500 border border-white/5">
                            {s}
                        </span>
                    ))}
                    {job.skills && job.skills.length > 2 && (
                        <span className="text-[9px] font-black text-zinc-700 self-center px-1">
                            +{job.skills.length - 2}
                        </span>
                    )}
                </div>
                <GripVertical className="h-3 w-3 text-zinc-800 group-hover/card:text-zinc-600 transition-colors" />
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
