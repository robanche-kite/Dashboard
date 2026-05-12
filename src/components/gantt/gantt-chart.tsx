"use client";

import Link from "next/link";
import { addDays, differenceInCalendarDays, format, max, min, parseISO } from "date-fns";
import type { Milestone, Project, Task } from "@/lib/db/schema";

type Span = { start: Date; end: Date };

function spanFromTask(t: Task): Span | null {
  const start = t.startDate ? parseISO(t.startDate) : t.dueDate ? parseISO(t.dueDate) : null;
  const end = t.dueDate ? parseISO(t.dueDate) : t.startDate ? parseISO(t.startDate) : null;
  if (!start || !end) return null;
  return { start, end: end < start ? start : end };
}

export function GanttChart({
  projects,
  tasks,
  milestones,
}: {
  projects: Project[];
  tasks: Task[];
  milestones: Milestone[];
}) {
  const allDates: Date[] = [];
  for (const t of tasks) {
    const span = spanFromTask(t);
    if (span) allDates.push(span.start, span.end);
  }
  for (const m of milestones) allDates.push(parseISO(m.date));

  if (allDates.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border/60 bg-card/50 px-6 py-16 text-center">
        <p className="text-sm text-muted-foreground">
          Add tasks with dates or milestones to see a timeline.
        </p>
      </div>
    );
  }

  const rangeStart = min(allDates);
  const rangeEnd = max(allDates);
  const totalDays = Math.max(1, differenceInCalendarDays(rangeEnd, rangeStart) + 1);

  const monthMarkers: { offset: number; label: string }[] = [];
  let cursor = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), 1);
  while (cursor <= rangeEnd) {
    const offset = differenceInCalendarDays(cursor, rangeStart);
    if (offset >= 0) monthMarkers.push({ offset, label: format(cursor, "MMM yyyy") });
    cursor = addDays(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1), 0);
  }

  return (
    <div className="space-y-4">
      <div className="text-xs text-muted-foreground">
        {format(rangeStart, "MMM d, yyyy")} → {format(rangeEnd, "MMM d, yyyy")} ({totalDays} days)
      </div>
      <div className="overflow-x-auto rounded-2xl border border-border/60 bg-card">
        <div className="min-w-[720px] p-4">
          <div className="relative h-7 border-b border-border/40">
            {monthMarkers.map((m) => (
              <div
                key={m.label}
                className="absolute top-0 text-[10px] text-muted-foreground"
                style={{ left: `${(m.offset / totalDays) * 100}%` }}
              >
                <div className="h-3 w-px bg-border/60" />
                <span className="ml-1 font-medium">{m.label}</span>
              </div>
            ))}
          </div>

          <div className="space-y-4 pt-4">
            {projects.map((project) => {
              const projectTasks = tasks.filter((t) => t.projectId === project.id);
              const projectMilestones = milestones.filter((m) => m.projectId === project.id);
              if (projectTasks.length === 0 && projectMilestones.length === 0) return null;

              return (
                <div key={project.id} className="space-y-1.5">
                  <Link
                    href={`/projects/${project.id}`}
                    className="text-sm font-semibold text-foreground transition-colors hover:text-emerald-600"
                  >
                    {project.name}
                  </Link>
                  {projectTasks.map((task) => {
                    const span = spanFromTask(task);
                    if (!span) return null;
                    const left = differenceInCalendarDays(span.start, rangeStart) / totalDays;
                    const width =
                      Math.max(1, differenceInCalendarDays(span.end, span.start) + 1) /
                      totalDays;
                    return (
                      <div key={task.id} className="relative h-8">
                        <div
                          className={`absolute top-1 flex h-6 items-center overflow-hidden rounded-lg px-2.5 text-[11px] font-medium text-white shadow-sm ${
                            task.status === "done"
                              ? "bg-emerald-500/90"
                              : task.status === "blocked"
                                ? "bg-red-500/80"
                                : task.status === "in_progress"
                                  ? "bg-blue-500/80"
                                  : "bg-zinc-600/70"
                          }`}
                          style={{
                            left: `${left * 100}%`,
                            width: `${width * 100}%`,
                            minWidth: "8px",
                          }}
                          title={`${task.title} (${span.start.toDateString()} – ${span.end.toDateString()})`}
                        >
                          <span className="truncate">{task.title}</span>
                        </div>
                      </div>
                    );
                  })}
                  {projectMilestones.map((m) => {
                    const date = parseISO(m.date);
                    const left = differenceInCalendarDays(date, rangeStart) / totalDays;
                    return (
                      <div key={m.id} className="relative h-6">
                        <div
                          className="absolute top-1 flex items-center gap-1 text-[11px]"
                          style={{ left: `${left * 100}%`, transform: "translateX(-50%)" }}
                          title={`${m.title} – ${m.date}`}
                        >
                          <span
                            className={`inline-block size-3 rotate-45 ${
                              m.reachedAt ? "bg-emerald-500" : "bg-amber-500"
                            }`}
                          />
                          <span className="whitespace-nowrap">{m.title}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
