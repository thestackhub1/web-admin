"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import {
    MoreHorizontal,
    Plus,
    Calendar,
    Clock,
    Users,
    AlertCircle,
    CheckCircle2,
    FileText,
    PlayCircle,
    Archive,
    Loader2
} from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { useUpdateScheduledExamStatus } from "@/client/hooks/use-scheduled-exams";
import { ScheduledExam } from './types';

// ============================================
// Types
// ============================================

interface ScheduledExamsKanbanProps {
    exams: ScheduledExam[];
}

// ============================================
// Constants
// ============================================

const COLUMNS = [
    {
        id: "draft",
        label: "Draft",
        icon: FileText,
        color: "text-neutral-500",
        bgColor: "bg-neutral-100 dark:bg-neutral-800",
        borderColor: "border-neutral-200 dark:border-neutral-700",
    },
    {
        id: "scheduled",
        label: "Scheduled",
        icon: Calendar,
        color: "text-blue-500",
        bgColor: "bg-blue-50 dark:bg-blue-900/20",
        borderColor: "border-blue-200 dark:border-blue-800",
    },
    {
        id: "active",
        label: "Active",
        icon: PlayCircle,
        color: "text-amber-500",
        bgColor: "bg-amber-50 dark:bg-amber-900/20",
        borderColor: "border-amber-200 dark:border-amber-800",
    },
    {
        id: "completed",
        label: "Completed",
        icon: CheckCircle2,
        color: "text-emerald-500",
        bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
        borderColor: "border-emerald-200 dark:border-emerald-800",
    },
];

// ============================================
// Components
// ============================================

function KanbanCard({ exam, index }: { exam: ScheduledExam; index: number }) {
    const formatDate = (date: string | null) => {
        if (!date) return null;
        return new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        });
    };

    return (
        <Draggable draggableId={exam.id} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{ ...provided.draggableProps.style }}
                    className={clsx(
                        "group block rounded-xl border p-3 transition-all",
                        "bg-white dark:bg-neutral-900",
                        snapshot.isDragging
                            ? "border-blue-500 shadow-lg shadow-blue-500/10 rotate-2 z-50 ring-2 ring-blue-500/20"
                            : "border-neutral-200 hover:border-blue-300 dark:border-neutral-700 dark:hover:border-blue-700 hover:shadow-md hover:shadow-blue-500/5"
                    )}
                >
                    <Link href={`/dashboard/scheduled-exams/${exam.id}`} className="block">
                        <div className="flex items-start justify-between gap-2">
                            <h4 className="line-clamp-2 text-sm font-semibold text-neutral-900 group-hover:text-blue-600 dark:text-neutral-100 dark:group-hover:text-blue-400">
                                {exam.name_en}
                            </h4>
                            <button className="opacity-0 transition-opacity group-hover:opacity-100">
                                <MoreHorizontal className="h-4 w-4 text-neutral-400 hover:text-neutral-600" />
                            </button>
                        </div>

                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                            <span className="rounded-md bg-neutral-100 px-1.5 py-0.5 dark:bg-neutral-800">
                                {exam.class_level?.name_en || "No Class"}
                            </span>
                            <span className="rounded-md bg-neutral-100 px-1.5 py-0.5 dark:bg-neutral-800">
                                {exam.subject?.name_en || "No Subject"}
                            </span>
                        </div>

                        <div className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-2 text-xs dark:border-neutral-800">
                            <div className="flex items-center gap-2 text-neutral-500">
                                {exam.scheduled_date ? (
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        <span>{formatDate(exam.scheduled_date)}</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1 text-amber-600 dark:text-amber-500">
                                        <AlertCircle className="h-3 w-3" />
                                        <span>Unscheduled</span>
                                    </div>
                                )}
                            </div>

                            {exam.attempts_count ? (exam.attempts_count > 0 && (
                                <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                                    <Users className="h-3 w-3" />
                                    <span className='font-medium'>{exam.attempts_count}</span>
                                </div>
                            )) : null}
                        </div>
                    </Link>
                </div>
            )}
        </Draggable>
    );
}

export function ScheduledExamsKanban({ exams: initialExams }: ScheduledExamsKanbanProps) {
    const [exams, setExams] = useState<ScheduledExam[]>(initialExams);
    const [isClient, setIsClient] = useState(false);

    // Sync props to state, but only if not currently dragging/etc (simple sync for now)
    // Using simple useEffect might overwrite optimistic updates if rapid re-fetch happens, 
    // but typically re-fetch happens after mutation success.
    useEffect(() => {
        setExams(initialExams);
    }, [initialExams]);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const { mutate: updateStatus, loading: isUpdating } = useUpdateScheduledExamStatus();

    // Group exams by status
    const groupedExams = useMemo(() => {
        const groups: Record<string, ScheduledExam[]> = {
            draft: [],
            scheduled: [],
            active: [],
            completed: [],
        };

        exams.forEach((exam) => {
            // Map 'published' to 'scheduled' for Kanban simplicity
            const statusKey = exam.status === "published" ? "scheduled" : exam.status;
            if (groups[statusKey]) {
                groups[statusKey].push(exam);
            } else {
                // Fallback: put cancelled/others in draft or ignore? 
                // Let's put them in draft for visibility if they exist
                if (exam.status === 'cancelled') groups.draft.push(exam);
            }
        });

        return groups;
    }, [exams]);

    const onDragEnd = async (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        const newStatus = destination.droppableId;

        // Optimistic Update
        const updatedExams = exams.map(exam => {
            if (exam.id === draggableId) {
                // Handle 'scheduled' mapping back to 'published' if needed, OR just use 'scheduled' 
                // The API should handle 'scheduled' status status correctly or we map it.
                // Our system uses 'published' but Kanban uses 'scheduled'. 
                // Let's send 'published' if the column is 'scheduled' to be consistent with other parts of the app?
                // Actually, the API/Type supports both or 'published'.
                // Let's check statusConfig in parent. It has 'scheduled' AND 'published'.
                // If the column ID is 'scheduled', we should probably save as 'scheduled' or 'published'.
                // Let's use 'scheduled' as the status and ensure API handles it.
                // Re-checking types.ts: status is string.
                return { ...exam, status: newStatus as any };
            }
            return exam;
        });

        setExams(updatedExams);

        try {
            // If dragging to 'scheduled', we might want to default to 'published' if that's the canonical status
            // But let's stick to the column ID for now.
            let statusToSend = newStatus;
            if (newStatus === 'scheduled') statusToSend = 'published'; // Standardizing on published for "Scheduled" state often used in LMS

            await updateStatus({ id: draggableId, status: statusToSend });

            // Success notification could go here
        } catch (error) {
            console.error("Failed to update status", error);
            // Revert on error
            setExams(initialExams);
            // Show toast error here if toaster process available
        }
    };

    if (!isClient) return null; // Avoid hydration mismatch for DnD

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex h-full gap-4 overflow-x-auto pb-4 items-start">
                {COLUMNS.map((col) => {
                    const Icon = col.icon;
                    const colExams = groupedExams[col.id] || [];

                    return (
                        <div
                            key={col.id}
                            className="flex h-full min-w-[280px] flex-1 flex-col rounded-2xl bg-neutral-50/50 p-3 dark:bg-neutral-900/50"
                        >
                            {/* Column Header */}
                            <div className="mb-3 flex items-center justify-between px-1">
                                <div className="flex items-center gap-2">
                                    <div
                                        className={clsx(
                                            "flex h-6 w-6 items-center justify-center rounded-md border bg-white shadow-sm dark:bg-black",
                                            col.color,
                                            col.borderColor
                                        )}
                                    >
                                        <Icon className="h-3.5 w-3.5" />
                                    </div>
                                    <span className="font-semibold text-neutral-700 dark:text-neutral-200">
                                        {col.label}
                                    </span>
                                    <span className="ml-1 rounded-full bg-neutral-200 px-1.5 py-0.5 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                                        {colExams.length}
                                    </span>
                                </div>
                                <button className="rounded-md p-1 hover:bg-neutral-200 dark:hover:bg-neutral-800">
                                    <MoreHorizontal className="h-4 w-4 text-neutral-500" />
                                </button>
                            </div>

                            {/* Cards Container */}
                            <Droppable droppableId={col.id}>
                                {(provided, snapshot) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className={clsx(
                                            "flex flex-1 flex-col gap-3 overflow-y-auto pr-1 scrollbar-hide min-h-[150px] transition-colors rounded-xl",
                                            snapshot.isDraggingOver && "bg-neutral-100/50 dark:bg-neutral-800/50"
                                        )}
                                    >
                                        {colExams.map((exam, index) => (
                                            <KanbanCard key={exam.id} exam={exam} index={index} />
                                        ))}
                                        {provided.placeholder}

                                        {col.id === "draft" && (
                                            <Link href="/dashboard/class-levels" className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-300 py-3 text-sm font-medium text-neutral-500 transition-colors hover:border-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:border-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-300">
                                                <Plus className="h-4 w-4" />
                                                Add Draft
                                            </Link>
                                        )}

                                        {colExams.length === 0 && col.id !== "draft" && !snapshot.isDraggingOver && (
                                            <div className="flex h-24 flex-col items-center justify-center rounded-xl border border-dashed border-neutral-200 bg-neutral-50/50 text-center dark:border-neutral-800 dark:bg-neutral-900/20">
                                                <span className="text-sm text-neutral-400">No exams</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    );
                })}
            </div>
        </DragDropContext>
    );
}
