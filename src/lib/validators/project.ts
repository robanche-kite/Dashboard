import { z } from "zod";
import { projectStatuses } from "@/lib/db/schema";

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

const optionalHexColor = z.preprocess(
  (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
  z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, "Use a hex color like #3b82f6")
    .optional(),
);

export const projectInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  description: optionalString(2000),
  status: z.enum(projectStatuses).default("active"),
  color: optionalHexColor,
  startDate: optionalIsoDate,
  endDate: optionalIsoDate,
});

export type ProjectInput = z.infer<typeof projectInputSchema>;
