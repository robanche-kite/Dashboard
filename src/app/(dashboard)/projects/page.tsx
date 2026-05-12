import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listProjects } from "@/lib/services/projects";
import { CreateProjectDialog } from "@/components/projects/create-project-dialog";

export default async function ProjectsPage() {
  const projects = await listProjects();

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Projects</h1>
          <p className="text-sm text-muted-foreground">
            All projects you&apos;re tracking.
          </p>
        </div>
        <CreateProjectDialog
          trigger={
            <Button>
              <Plus className="size-4" />
              New project
            </Button>
          }
        />
      </header>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <p className="text-muted-foreground">No projects yet.</p>
            <CreateProjectDialog trigger={<Button>Create your first project</Button>} />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <Link key={p.id} href={`/projects/${p.id}`} className="block">
              <Card className="h-full transition hover:border-foreground/30">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base">{p.name}</CardTitle>
                    <Badge variant="secondary" className="capitalize">
                      {p.status.replace("_", " ")}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-3 text-sm text-muted-foreground">
                    {p.description ?? "No description."}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
