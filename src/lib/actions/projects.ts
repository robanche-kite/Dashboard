"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { projectInputSchema } from "@/lib/validators/project";
import {
  createProject,
  deleteProject,
  updateProject,
} from "@/lib/services/projects";

export type ActionResult<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function createProjectAction(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const parsed = projectInputSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      ok: false,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }
  const project = await createProject(parsed.data);
  revalidatePath("/projects");
  return { ok: true, data: { id: project.id } };
}

export async function updateProjectAction(
  id: string,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const parsed = projectInputSchema.partial().safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      ok: false,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }
  await updateProject(id, parsed.data);
  revalidatePath("/projects");
  revalidatePath(`/projects/${id}`);
  return { ok: true, data: { id } };
}

export async function deleteProjectAction(id: string): Promise<void> {
  await deleteProject(id);
  revalidatePath("/projects");
  redirect("/projects");
}
