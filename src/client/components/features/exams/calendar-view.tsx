"use client";

import { useState } from "react";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import { format } from "date-fns";
import { parse } from "date-fns";
import { startOfWeek } from "date-fns";
import { getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import { clsx } from "clsx";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = {
    "en-US": enUS,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});
import { ScheduledExam } from './types';

interface CalendarViewProps {
    exams: ScheduledExam[];
}

export function CalendarView({ exams }: CalendarViewProps) {
    const router = useRouter();
    const [view, setView] = useState(Views.MONTH);
    const [date, setDate] = useState(new Date());

    // Transform exams to calendar events
    const events = exams
        .filter((exam) => exam.scheduled_date)
        .map((exam) => {
            // Handle missing scheduled_time
            const timeStr = exam.scheduled_time || "00:00";
            const start = new Date(`${exam.scheduled_date}T${timeStr}:00`);
            // Default duration to 60 mins if not provided, or use exam duration
            const durationMs = (exam.duration_minutes || 60) * 60 * 1000;
            const end = new Date(start.getTime() + durationMs);

            return {
                id: exam.id,
                title: exam.name_en,
                start,
                end,
                resource: exam,
            };
        });

    const handleNavigate = (newDate: Date) => {
        setDate(newDate);
    };

    const handleViewChange = (newView: any) => {
        setView(newView);
    };

    const handleSelectEvent = (event: any) => {
        router.push(`/dashboard/scheduled-exams/${event.id}`);
    };

    // Custom Toolbar Component
    const CustomToolbar = (toolbar: any) => {
        const goToBack = () => {
            toolbar.onNavigate("PREV");
        };

        const goToNext = () => {
            toolbar.onNavigate("NEXT");
        };

        const goToCurrent = () => {
            toolbar.onNavigate("TODAY");
        };

        const label = () => {
            const date = toolbar.date;
            return (
                <span className="text-lg font-semibold text-neutral-900 dark:text-white capitalize">
                    {format(date, view === Views.MONTH ? "MMMM yyyy" : "MMM d, yyyy")}
                </span>
            );
        };

        return (
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 rounded-lg border border-neutral-200 bg-white p-1 dark:border-neutral-700 dark:bg-neutral-800">
                        <button
                            onClick={goToBack}
                            className="rounded-md p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                        >
                            <ChevronLeft className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                        </button>
                        <button
                            onClick={goToCurrent}
                            className="px-3 text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                        >
                            Today
                        </button>
                        <button
                            onClick={goToNext}
                            className="rounded-md p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                        >
                            <ChevronRight className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                        </button>
                    </div>
                    {label()}
                </div>

                <div className="flex rounded-lg border border-neutral-200 bg-white p-1 dark:border-neutral-700 dark:bg-neutral-800">
                    {[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA].map((v) => (
                        <button
                            key={v}
                            onClick={() => toolbar.onView(v)}
                            className={clsx(
                                "rounded-md px-3 py-1.5 text-sm font-medium capitalize",
                                view === v
                                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                                    : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-700"
                            )}
                        >
                            {v}
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    // Custom Event Component
    const CustomEvent = ({ event }: any) => {
        const exam = event.resource as ScheduledExam;

        // Status colors
        const statusColors: Record<string, string> = {
            draft: "bg-neutral-100 text-neutral-700 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700",
            scheduled: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
            active: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
            completed: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
            cancelled: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
            published: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
        };

        const colorClass = statusColors[exam.status] || statusColors.draft;

        return (
            <div className={clsx(
                "h-full w-full overflow-hidden rounded-md border px-2 py-1 text-xs transition-all hover:brightness-95",
                colorClass
            )}>
                <p className="font-semibold truncate">{exam.name_en}</p>
                {view !== Views.MONTH && (
                    <div className="mt-1 flex flex-col gap-0.5 opacity-80">
                        <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{exam.duration_minutes}m</span>
                        </div>
                        {exam.class_level && (
                            <div className="flex items-center gap-1 truncate">
                                <Users className="h-3 w-3" />
                                <span>{exam.class_level.name_en}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="h-[700px] rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
            <style jsx global>{`
        .rbc-calendar {
            font-family: inherit;
        }
        .rbc-header {
            padding: 12px 4px;
            font-weight: 600;
            font-size: 0.875rem;
            color: #525252;
            border-bottom: 1px solid #e5e5e5;
        }
        .dark .rbc-header {
            color: #a3a3a3;
            border-bottom-color: #404040;
        }
        .rbc-month-view, .rbc-time-view, .rbc-agenda-view {
            border: none;
        }
        .rbc-month-row {
            border-top: 1px solid #e5e5e5;
        }
        .dark .rbc-month-row {
            border-top-color: #404040;
        }
        .rbc-day-bg + .rbc-day-bg {
            border-left: 1px solid #e5e5e5;
        }
        .dark .rbc-day-bg + .rbc-day-bg {
            border-left-color: #404040;
        }
        .rbc-off-range-bg {
            background-color: #f9fafb;
        }
        .dark .rbc-off-range-bg {
            background-color: #171717;
        }
        .rbc-today {
            background-color: #eff6ff;
        }
        .dark .rbc-today {
            background-color: #1e3a8a33;
        }
        .rbc-event {
            background: none;
            padding: 0;
            border: none;
            outline: none;
        }
        .rbc-event:focus {
            outline: none;
        }
        .rbc-date-cell {
            padding: 8px;
            font-size: 0.875rem;
        }
        .rbc-show-more {
            background-color: transparent;
            color: #2563eb;
            font-weight: 500;
            font-size: 0.75rem;
        }
        .dark .rbc-show-more {
            color: #60a5fa;
        }
      `}</style>
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: "100%" }}
                view={view}
                onView={handleViewChange}
                date={date}
                onNavigate={handleNavigate}
                components={{
                    toolbar: CustomToolbar,
                    event: CustomEvent,
                }}
                onSelectEvent={handleSelectEvent}
            />
        </div>
    );
}
