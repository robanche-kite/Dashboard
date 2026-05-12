import { listProjects } from "@/lib/services/projects";
import { listAllTasks } from "@/lib/services/tasks";
import { listAllMilestones } from "@/lib/services/milestones";
import { GanttChart } from "@/components/gantt/gantt-chart";

export default async function TimelinePage() {
  const [projects, tasks, milestones] = await Promise.all([
    listProjects(),
    listAllTasks(),
    listAllMilestones(),
  ]);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Timeline</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gantt view of tasks and milestones across all projects.
        </p>
      </header>
      <GanttChart projects={projects} tasks={tasks} milestones={milestones} />
    </div>
  );
}
