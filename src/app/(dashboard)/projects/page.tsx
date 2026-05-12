import Link from "next/link";
import { Plus, FolderOpen, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listProjects } from "@/lib/services/projects";
import { getProjectStats } from "@/lib/services/projects";
import { CreateProjectDialog } from "@/components/projects/create-project-dialog";

const statusConfig: Record<string, { label: string; dot: string }> = {
  active: { label: "Active", dot: "bg-emerald-400" },
  on_hold: { label: "On Hold", dot: "bg-amber-400" },
  completed: { label: "Completed", dot: "bg-blue-400" },
  archived: { label: "Archived", dot: "bg-zinc-500" },
};

export default async function ProjectsPage() {
  const projects = await listProjects();
  const statsMap = new Map(
    await Promise.all(
      projects.map(async (p) => [p.id, await getProjectStats(p.id)] as const),
    ),
  );

  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {projects.length} project{projects.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <CreateProjectDialog
          trigger={
            <Button className="gap-2 rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600">
              <Plus className="size-4" />
              New project
            </Button>
          }
        />
      </header>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border/60 bg-card/50 px-6 py-16 text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-emerald-500/10">
            <FolderOpen className="size-7 text-emerald-400" />
          </div>
          <div>
            <p className="font-medium">No projects yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Create your first project to start tracking tasks.
            </p>
          </div>
          <CreateProjectDialog
            trigger={
              <Button className="mt-2 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600">
                Create your first project
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => {
            const stats = statsMap.get(p.id);
            const progress =
              stats && stats.totalTasks > 0
                ? Math.round((stats.doneTasks / stats.totalTasks) * 100)
                : 0;
            const sc = statusConfig[p.status] ?? statusConfig.active;

            return (
              <Link key={p.id} href={`/projects/${p.id}`} className="group block">
                <div className="relative h-full overflow-hidden rounded-2xl border border-border/60 bg-card p-5 transition-all duration-200 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5">
                  {/* Status dot */}
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-base font-semibold">{p.name}</h3>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {p.description ?? "No description"}
                      </p>
                    </div>
                    <ArrowRight className="ml-2 size-4 shrink-0 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:text-emerald-400 group-hover:opacity-100" />
                  </div>

                  {/* Progress bar */}
                  {stats && stats.totalTasks > 0 && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium text-emerald-400">{progress}%</span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className={`size-2 rounded-full ${sc.dot}`} />
                      <span className="text-xs text-muted-foreground">{sc.label}</span>
                    </div>
                    {stats && (
                      <span className="text-xs text-muted-foreground">
                        {stats.doneTasks}/{stats.totalTasks} tasks
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
