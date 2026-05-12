import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getProject, getProjectStats } from "@/lib/services/projects";
import { listTasksByProject } from "@/lib/services/tasks";
import { listMilestonesByProject } from "@/lib/services/milestones";
import { TaskList } from "@/components/tasks/task-list";
import { MilestoneList } from "@/components/milestones/milestone-list";
import { DeleteProjectButton } from "@/components/projects/delete-project-button";

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

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/projects"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          All projects
        </Link>
      </div>

      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold">{project.name}</h1>
            <Badge variant="secondary" className="capitalize">
              {project.status.replace("_", " ")}
            </Badge>
          </div>
          {project.description && (
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              {project.description}
            </p>
          )}
        </div>
        <DeleteProjectButton id={project.id} />
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        <StatCard label="Tasks" value={`${stats.doneTasks} / ${stats.totalTasks}`} />
        <StatCard
          label="Milestones"
          value={`${stats.reachedMilestones} / ${stats.totalMilestones}`}
        />
      </div>

      <Separator />

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Tasks</h2>
        <TaskList projectId={project.id} tasks={tasks} />
      </section>

      <Separator />

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Milestones</h2>
        <MilestoneList projectId={project.id} milestones={milestones} />
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}
