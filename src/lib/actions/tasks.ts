"use server";

import { revalidatePath } from "next/cache";
import { taskInputSchema } from "@/lib/validators/task";
import { taskStatuses, type TaskStatus } from "@/lib/db/schema";
import {
  createTask,
  deleteTask,
  setTaskStatus,
  updateTask,
} from "@/lib/services/tasks";
import type { ActionResult } from "./projects";

export async function createTaskAction(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const parsed = taskInputSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      ok: false,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }
  const task = await createTask(parsed.data);
  revalidatePath(`/projects/${parsed.data.projectId}`);
  revalidatePath("/timeline");
  return { ok: true, data: { id: task.id } };
}

export async function updateTaskAction(
  id: string,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const parsed = taskInputSchema.partial().safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      ok: false,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }
  await updateTask(id, parsed.data);
  if (parsed.data.projectId) revalidatePath(`/projects/${parsed.data.projectId}`);
  revalidatePath("/timeline");
  return { ok: true, data: { id } };
}

export async function setTaskStatusAction(id: string, status: string): Promise<void> {
  if (!(taskStatuses as readonly string[]).includes(status)) {
    throw new Error(`Invalid status: ${status}`);
  }
  const task = await setTaskStatus(id, status as TaskStatus);
  revalidatePath(`/projects/${task.projectId}`);
  revalidatePath("/timeline");
}

export async function deleteTaskAction(id: string, projectId: string): Promise<void> {
  await deleteTask(id);
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/timeline");
}
