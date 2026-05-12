import "server-only";
import { eq, desc } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "@/lib/db/client";
import { projects, tasks, milestones, type Project } from "@/lib/db/schema";
import type { ProjectInput } from "@/lib/validators/project";

export async function listProjects(): Promise<Project[]> {
  return db.select().from(projects).orderBy(desc(projects.updatedAt)).all();
}

export async function getProject(id: string): Promise<Project | null> {
  const row = db.select().from(projects).where(eq(projects.id, id)).get();
  return row ?? null;
}

export async function createProject(input: ProjectInput): Promise<Project> {
  const id = nanoid(12);
  const now = new Date().toISOString();
  db.insert(projects)
    .values({ id, ...input, createdAt: now, updatedAt: now })
    .run();
  const row = db.select().from(projects).where(eq(projects.id, id)).get();
  if (!row) throw new Error("Failed to create project");
  return row;
}

export async function updateProject(id: string, input: Partial<ProjectInput>): Promise<Project> {
  const now = new Date().toISOString();
  db.update(projects).set({ ...input, updatedAt: now }).where(eq(projects.id, id)).run();
  const row = db.select().from(projects).where(eq(projects.id, id)).get();
  if (!row) throw new Error("Project not found");
  return row;
}

export async function deleteProject(id: string): Promise<void> {
  db.delete(projects).where(eq(projects.id, id)).run();
}

export type ProjectStats = {
  totalTasks: number;
  doneTasks: number;
  totalMilestones: number;
  reachedMilestones: number;
};

export async function getProjectStats(id: string): Promise<ProjectStats> {
  const projectTasks = db.select().from(tasks).where(eq(tasks.projectId, id)).all();
  const projectMilestones = db.select().from(milestones).where(eq(milestones.projectId, id)).all();
  return {
    totalTasks: projectTasks.length,
    doneTasks: projectTasks.filter((t) => t.status === "done").length,
    totalMilestones: projectMilestones.length,
    reachedMilestones: projectMilestones.filter((m) => m.reachedAt != null).length,
  };
}
