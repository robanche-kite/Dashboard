import "server-only";
import { eq, asc } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "@/lib/db/client";
import { milestones, type Milestone } from "@/lib/db/schema";
import type { MilestoneInput } from "@/lib/validators/milestone";

export async function listMilestonesByProject(projectId: string): Promise<Milestone[]> {
  return db
    .select()
    .from(milestones)
    .where(eq(milestones.projectId, projectId))
    .orderBy(asc(milestones.date))
    .all();
}

export async function listAllMilestones(): Promise<Milestone[]> {
  return db.select().from(milestones).orderBy(asc(milestones.date)).all();
}

export async function createMilestone(input: MilestoneInput): Promise<Milestone> {
  const id = nanoid(12);
  const now = new Date().toISOString();
  db.insert(milestones)
    .values({ id, ...input, createdAt: now, updatedAt: now })
    .run();
  const row = db.select().from(milestones).where(eq(milestones.id, id)).get();
  if (!row) throw new Error("Failed to create milestone");
  return row;
}

export async function toggleMilestoneReached(id: string): Promise<Milestone> {
  const row = db.select().from(milestones).where(eq(milestones.id, id)).get();
  if (!row) throw new Error("Milestone not found");
  const now = new Date().toISOString();
  const reachedAt = row.reachedAt ? null : now;
  db.update(milestones).set({ reachedAt, updatedAt: now }).where(eq(milestones.id, id)).run();
  const updated = db.select().from(milestones).where(eq(milestones.id, id)).get();
  return updated!;
}

export async function deleteMilestone(id: string): Promise<void> {
  db.delete(milestones).where(eq(milestones.id, id)).run();
}
