import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

export const taskStatuses = ["todo", "in_progress", "blocked", "done"] as const;
export type TaskStatus = (typeof taskStatuses)[number];

export const taskPriorities = ["low", "medium", "high", "urgent"] as const;
export type TaskPriority = (typeof taskPriorities)[number];

export const projectStatuses = ["active", "on_hold", "completed", "archived"] as const;
export type ProjectStatus = (typeof projectStatuses)[number];

const timestamps = {
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
};

export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status", { enum: projectStatuses }).notNull().default("active"),
  color: text("color"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  ...timestamps,
});

export const tasks = sqliteTable("tasks", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status", { enum: taskStatuses }).notNull().default("todo"),
  priority: text("priority", { enum: taskPriorities }).notNull().default("medium"),
  startDate: text("start_date"),
  dueDate: text("due_date"),
  completedAt: text("completed_at"),
  estimateHours: integer("estimate_hours"),
  orderIndex: integer("order_index").notNull().default(0),
  ...timestamps,
});

export const milestones = sqliteTable("milestones", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  date: text("date").notNull(),
  reachedAt: text("reached_at"),
  ...timestamps,
});

export const taskDeps = sqliteTable(
  "task_deps",
  {
    taskId: text("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    dependsOn: text("depends_on")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.taskId, t.dependsOn] })],
);

export const projectsRelations = relations(projects, ({ many }) => ({
  tasks: many(tasks),
  milestones: many(milestones),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  project: one(projects, { fields: [tasks.projectId], references: [projects.id] }),
}));

export const milestonesRelations = relations(milestones, ({ one }) => ({
  project: one(projects, { fields: [milestones.projectId], references: [projects.id] }),
}));

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type Milestone = typeof milestones.$inferSelect;
export type NewMilestone = typeof milestones.$inferInsert;
