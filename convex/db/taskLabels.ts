/**
 * Database Layer: TaskLabels
 *
 * This is the ONLY file that directly accesses the taskLabels table using ctx.db.
 * Handles the many-to-many relationship between tasks and labels.
 */

import { QueryCtx, MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

// CREATE
export async function createTaskLabel(
  ctx: MutationCtx,
  args: {
    taskId: Id<"tasks">;
    labelId: Id<"labels">;
    userId: string;
  }
) {
  const now = Date.now();
  return await ctx.db.insert("taskLabels", {
    ...args,
    createdAt: now,
  });
}

// READ - Get labels for a task
export async function getLabelsForTask(ctx: QueryCtx, taskId: Id<"tasks">) {
  return await ctx.db
    .query("taskLabels")
    .withIndex("by_task", (q) => q.eq("taskId", taskId))
    .collect();
}

// READ - Get tasks for a label
export async function getTasksForLabel(ctx: QueryCtx, labelId: Id<"labels">) {
  return await ctx.db
    .query("taskLabels")
    .withIndex("by_label", (q) => q.eq("labelId", labelId))
    .collect();
}

// READ - Get all task labels by user
export async function getTaskLabelsByUser(ctx: QueryCtx, userId: string) {
  return await ctx.db
    .query("taskLabels")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();
}

// READ - Check if task-label relationship exists
export async function taskLabelExists(
  ctx: QueryCtx,
  taskId: Id<"tasks">,
  labelId: Id<"labels">
): Promise<boolean> {
  const existing = await ctx.db
    .query("taskLabels")
    .withIndex("by_task", (q) => q.eq("taskId", taskId))
    .collect();

  return existing.some((tl) => tl.labelId === labelId);
}

// DELETE - Remove specific task-label relationship
export async function deleteTaskLabel(
  ctx: MutationCtx,
  taskId: Id<"tasks">,
  labelId: Id<"labels">
) {
  const taskLabel = await ctx.db
    .query("taskLabels")
    .withIndex("by_task", (q) => q.eq("taskId", taskId))
    .collect();

  const toDelete = taskLabel.find((tl) => tl.labelId === labelId);
  if (toDelete) {
    await ctx.db.delete(toDelete._id);
  }
}

// DELETE - Remove all labels from a task
export async function deleteAllLabelsFromTask(
  ctx: MutationCtx,
  taskId: Id<"tasks">
) {
  const taskLabels = await ctx.db
    .query("taskLabels")
    .withIndex("by_task", (q) => q.eq("taskId", taskId))
    .collect();

  await Promise.all(taskLabels.map((tl) => ctx.db.delete(tl._id)));
}

// DELETE - Remove all tasks from a label
export async function deleteAllTasksFromLabel(
  ctx: MutationCtx,
  labelId: Id<"labels">
) {
  const taskLabels = await ctx.db
    .query("taskLabels")
    .withIndex("by_label", (q) => q.eq("labelId", labelId))
    .collect();

  await Promise.all(taskLabels.map((tl) => ctx.db.delete(tl._id)));
}
