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
} from "@dnd-kit/core";
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { Eye } from "lucide-react";
import type { Job } from "@/types";
import { updateJobStatus } from "@/services/jobService";

// Column Definitions
const COLUMNS = [
    { id: 'applied', title: 'Applied' },
    { id: 'assignment', title: 'Assignment' },
    { id: 'interview_r1', title: 'Interview R1' },
    { id: 'interview_r2', title: 'Interview R2' },
    { id: 'interview_r3', title: 'Interview R3' },
    { id: 'hr', title: 'HR' },
    { id: 'offer', title: 'Offer' }
];

interface KanbanBoardProps {
    jobs: Job[];
    onJobUpdate: () => void;
    onJobClick: (job: Job) => void;
}

export function KanbanBoard({ jobs, onJobUpdate, onJobClick }: KanbanBoardProps) {
    const [activeId, setActiveId] = useState<string | null>(null);

    // Group jobs by column
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
        useSensor(PointerSensor),
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

        // Find active and over containers
        const activeContainer = findContainer(activeIdStr);
        const overContainer = findContainer(overIdStr);

        if (!activeContainer || !overContainer || activeContainer === overContainer) {
            return;
        }

        setColumns((prev) => {
            const activeItems = prev[activeContainer];
            const overItems = prev[overContainer];

            // Find indexes
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
            // Update status of the moved item locally for immediate feedback
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
        return Object.keys(columns).find((key) => columns[key].find((item) => item.id === id));
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
                await updateJobStatus(activeJob.id, overContainer);
                onJobUpdate(); // Refresh from source of truth
            } catch (err) {
                console.error("Move failed", err);
                onJobUpdate(); // Revert on failure
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
            <div className="flex bg-zinc-950 h-full overflow-x-auto gap-6 pb-8 px-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
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
                duration: 250,
                easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
            }}>
                {activeId && activeJob ? (
                    <div className="w-80 rotate-[2deg] scale-105 transition-transform duration-200">
                        <div className={cn(
                            "bg-zinc-800 border-2 border-primary/50 p-4 rounded-xl shadow-2xl",
                            "flex flex-col gap-2"
                        )}>
                            <div className="flex items-start justify-between gap-2">
                                <div className="font-bold text-sm text-white line-clamp-2 leading-snug">
                                    {activeJob.title || "Untitled Job"}
                                </div>
                            </div>
                            <div className="text-[11px] font-medium text-zinc-300">
                                {activeJob.company || "Unknown Company"}
                            </div>
                        </div>
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}

function KanbanColumn({ id, title, jobs, onJobClick }: { id: string, title: string, jobs: Job[], onJobClick: (j: Job) => void }) {
    const { setNodeRef } = useSortable({ id });

    return (
        <div
            ref={setNodeRef}
            className="flex-shrink-0 w-80 flex flex-col gap-3 rounded-lg bg-zinc-900/50 p-3 border border-zinc-800"
        >
            <div className="flex items-center justify-between px-1">
                <h3 className="font-semibold text-sm text-zinc-400 uppercase tracking-wider">
                    {title}
                </h3>
                <span className="text-xs text-zinc-600 font-mono">{jobs.length}</span>
            </div>

            <SortableContext items={jobs.map(j => j.id)} strategy={verticalListSortingStrategy}>
                <div className="flex flex-col gap-3 min-h-[100px]">
                    {jobs.map(job => (
                        <SortableJobCard key={job.id} job={job} onClick={() => onJobClick(job)} />
                    ))}
                </div>
            </SortableContext>
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
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={() => onClick()}
            className="group outline-none"
        >
            {isDragging ? (
                <div className="h-[100px] rounded-xl border-2 border-dashed border-white/10 bg-white/[0.02]" />
            ) : (
                <div className={cn(
                    "cursor-grab active:cursor-grabbing bg-zinc-900 border border-white/5 p-4 rounded-xl shadow-sm transition-all",
                    "hover:border-primary/40 hover:bg-zinc-800/80 hover:shadow-md",
                    "flex flex-col gap-2"
                )}>
                    <div className="flex items-start justify-between gap-2">
                        <div className="font-bold text-sm text-zinc-100 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                            {job.title || "Untitled Job"}
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onClick();
                            }}
                            onPointerDown={(e) => e.stopPropagation()}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-500 hover:text-white transition-all outline-none"
                            title="View Details"
                        >
                            <Eye className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="flex flex-col gap-1.5 mt-1">
                        <div className="text-[11px] font-medium text-zinc-400 flex items-center gap-1.5">
                            <span className="truncate">{job.company || "Unknown Company"}</span>
                        </div>
                    </div>

                    {job.skills && job.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1 drop-shadow-sm">
                            {job.skills.slice(0, 2).map((s, i) => (
                                <span key={i} className="text-[9px] font-bold uppercase tracking-tighter px-1.5 py-0.5 rounded bg-white/5 text-zinc-500 border border-white/5">
                                    {s}
                                </span>
                            ))}
                            {job.skills.length > 2 && (
                                <span className="text-[9px] text-zinc-700 font-bold self-center">
                                    +{job.skills.length - 2}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
