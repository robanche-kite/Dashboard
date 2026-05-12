import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  ListTodo,
  Flag,
  Target,
} from "lucide-react";
import { getProject, getProjectStats } from "@/lib/services/projects";
import { listTasksByProject } from "@/lib/services/tasks";
import { listMilestonesByProject } from "@/lib/services/milestones";
import { TaskList } from "@/components/tasks/task-list";
import { MilestoneList } from "@/components/milestones/milestone-list";
import { DeleteProjectButton } from "@/components/projects/delete-project-button";

const statusConfig: Record<string, { label: string; dot: string }> = {
  active: { label: "Active", dot: "bg-emerald-400" },
  on_hold: { label: "On Hold", dot: "bg-amber-400" },
  completed: { label: "Completed", dot: "bg-blue-400" },
  archived: { label: "Archived", dot: "bg-zinc-500" },
};

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [project, stats, tasks, milestones] = await Promise.all([
    getProject(id),
    getProjectStats(id),
    listTasksByProject(id),
    listMilestonesByProject(id),
  ]);

  if (!project) notFound();

  const sc = statusConfig[project.status] ?? statusConfig.active;
  const taskProgress =
    stats.totalTasks > 0
      ? Math.round((stats.doneTasks / stats.totalTasks) * 100)
      : 0;

  return (
    <div className="space-y-8">
      {/* Back link */}
      <Link
        href="/projects"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-emerald-600"
      >
        <ArrowLeft className="size-4" />
        All projects
      </Link>

      {/* Header */}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium">
              <span className={`size-2 rounded-full ${sc.dot}`} />
              {sc.label}
            </span>
          </div>
          {project.description && (
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {project.description}
            </p>
          )}
        </div>
        <DeleteProjectButton id={project.id} />
      </header>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<ListTodo className="size-5" />}
          iconBg="bg-blue-500/15"
          iconColor="text-blue-400"
          label="Total Tasks"
          value={stats.totalTasks}
        />
        <StatCard
          icon={<CheckCircle2 className="size-5" />}
          iconBg="bg-emerald-500/15"
          iconColor="text-emerald-600"
          label="Completed"
          value={stats.doneTasks}
          accent={
            stats.totalTasks > 0 ? (
              <span className="text-xs font-medium text-emerald-600">{taskProgress}%</span>
            ) : null
          }
        />
        <StatCard
          icon={<Flag className="size-5" />}
          iconBg="bg-amber-500/15"
          iconColor="text-amber-400"
          label="Milestones"
          value={stats.totalMilestones}
        />
        <StatCard
          icon={<Target className="size-5" />}
          iconBg="bg-purple-500/15"
          iconColor="text-purple-400"
          label="Reached"
          value={stats.reachedMilestones}
        />
      </div>

      {/* Overall progress bar */}
      {stats.totalTasks > 0 && (
        <div className="rounded-2xl border border-border/60 bg-card p-5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Overall Progress</span>
            <span className="font-semibold text-emerald-600">{taskProgress}%</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${taskProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Tasks */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Tasks</h2>
        <TaskList projectId={project.id} tasks={tasks} />
      </section>

      {/* Milestones */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Milestones</h2>
        <MilestoneList projectId={project.id} milestones={milestones} />
      </section>
    </div>
  );
}

function StatCard({
  icon,
  iconBg,
  iconColor,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  label: string;
  value: number;
  accent?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5">
      <div className="flex items-center justify-between">
        <div className={`flex size-10 items-center justify-center rounded-xl ${iconBg}`}>
          <span className={iconColor}>{icon}</span>
        </div>
        {accent}
      </div>
      <p className="mt-3 text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
