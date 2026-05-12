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
      <p className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
        Add tasks with dates or milestones to see a timeline.
      </p>
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
      <div className="overflow-x-auto rounded-md border">
        <div className="min-w-[720px] p-3">
          <div className="relative h-6 border-b">
            {monthMarkers.map((m) => (
              <div
                key={m.label}
                className="absolute top-0 text-[10px] text-muted-foreground"
                style={{ left: `${(m.offset / totalDays) * 100}%` }}
              >
                <div className="h-3 w-px bg-border" />
                <span className="ml-1">{m.label}</span>
              </div>
            ))}
          </div>

          <div className="space-y-3 pt-3">
            {projects.map((project) => {
              const projectTasks = tasks.filter((t) => t.projectId === project.id);
              const projectMilestones = milestones.filter((m) => m.projectId === project.id);
              if (projectTasks.length === 0 && projectMilestones.length === 0) return null;

              return (
                <div key={project.id} className="space-y-1">
                  <Link
                    href={`/projects/${project.id}`}
                    className="text-sm font-medium hover:underline"
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
                      <div key={task.id} className="relative h-7">
                        <div
                          className={`absolute top-1 flex h-5 items-center overflow-hidden rounded px-2 text-[11px] text-white ${
                            task.status === "done"
                              ? "bg-emerald-500/80"
                              : task.status === "blocked"
                                ? "bg-rose-500/80"
                                : task.status === "in_progress"
                                  ? "bg-blue-500/80"
                                  : "bg-zinc-500/70"
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
