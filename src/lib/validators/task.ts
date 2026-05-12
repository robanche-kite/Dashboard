import { z } from "zod";
import { taskPriorities, taskStatuses } from "@/lib/db/schema";

const optionalString = (max: number) =>
  z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string().trim().max(max).optional(),
  );

const optionalIsoDate = z.preprocess(
  (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
  z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
    .optional(),
);

const optionalIntHours = z.preprocess(
  (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
  z.coerce.number().int().min(0).max(10_000).optional(),
);

export const taskInputSchema = z.object({
  projectId: z.string().min(1, "Project is required"),
  title: z.string().trim().min(1, "Title is required").max(200),
  description: optionalString(4000),
  status: z.enum(taskStatuses).default("todo"),
  priority: z.enum(taskPriorities).default("medium"),
  startDate: optionalIsoDate,
  dueDate: optionalIsoDate,
  estimateHours: optionalIntHours,
});

export type TaskInput = z.infer<typeof taskInputSchema>;
