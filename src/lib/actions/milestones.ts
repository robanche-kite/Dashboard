"use server";

import { revalidatePath } from "next/cache";
import { milestoneInputSchema } from "@/lib/validators/milestone";
import {
  createMilestone,
  deleteMilestone,
  toggleMilestoneReached,
} from "@/lib/services/milestones";
import type { ActionResult } from "./projects";

export async function createMilestoneAction(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const parsed = milestoneInputSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      ok: false,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }
  const milestone = await createMilestone(parsed.data);
  revalidatePath(`/projects/${parsed.data.projectId}`);
  revalidatePath("/timeline");
  return { ok: true, data: { id: milestone.id } };
}

export async function toggleMilestoneAction(id: string, projectId: string): Promise<void> {
  await toggleMilestoneReached(id);
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/timeline");
}

export async function deleteMilestoneAction(id: string, projectId: string): Promise<void> {
  await deleteMilestone(id);
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/timeline");
}
