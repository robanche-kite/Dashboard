import { z } from "zod";

const optionalString = (max: number) =>
  z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string().trim().max(max).optional(),
  );

export const milestoneInputSchema = z.object({
  projectId: z.string().min(1, "Project is required"),
  title: z.string().trim().min(1, "Title is required").max(200),
  description: optionalString(2000),
  date: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
});

export type MilestoneInput = z.infer<typeof milestoneInputSchema>;
