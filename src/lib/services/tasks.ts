import "server-only";
import { eq, asc } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "@/lib/db/client";
import { tasks, type Task, type TaskStatus } from "@/lib/db/schema";
import type { TaskInput } from "@/lib/validators/task";

export async function listTasksByProject(projectId: string): Promise<Task[]> {
  return db
    .select()
    .from(tasks)
    .where(eq(tasks.projectId, projectId))
    .orderBy(asc(tasks.orderIndex), asc(tasks.createdAt))
    .all();
}

export async function listAllTasks(): Promise<Task[]> {
  return db.select().from(tasks).orderBy(asc(tasks.dueDate)).all();
}

export async function getTask(id: string): Promise<Task | null> {
  return db.select().from(tasks).where(eq(tasks.id, id)).get() ?? null;
}

export async function createTask(input: TaskInput): Promise<Task> {
  const id = nanoid(12);
  const now = new Date().toISOString();
  const completedAt = input.status === "done" ? now : null;
  db.insert(tasks)
    .values({ id, ...input, completedAt, createdAt: now, updatedAt: now })
    .run();
  const row = db.select().from(tasks).where(eq(tasks.id, id)).get();
  if (!row) throw new Error("Failed to create task");
  return row;
}

export async function updateTask(id: string, input: Partial<TaskInput>): Promise<Task> {
  const now = new Date().toISOString();
  const patch: Record<string, unknown> = { ...input, updatedAt: now };
  if (input.status !== undefined) {
    patch.completedAt = input.status === "done" ? now : null;
  }
  db.update(tasks).set(patch).where(eq(tasks.id, id)).run();
  const row = db.select().from(tasks).where(eq(tasks.id, id)).get();
  if (!row) throw new Error("Task not found");
  return row;
}

export async function setTaskStatus(id: string, status: TaskStatus): Promise<Task> {
  return updateTask(id, { status });
}

export async function deleteTask(id: string): Promise<void> {
  db.delete(tasks).where(eq(tasks.id, id)).run();
}
