/**
 * Database Layer: TaskActivity
 *
 * This is the ONLY file that directly accesses the taskActivity table using ctx.db.
 * Handles activity logging for tasks.
 */

import { QueryCtx, MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

// CREATE
export async function createTaskActivity(
  ctx: MutationCtx,
  args: {
    userId: string;
    taskId: Id<"tasks">;
    action:
      | "created"
      | "updated"
      | "completed"
      | "deleted"
      | "status_changed"
      | "priority_changed";
    oldValue?: any;
    newValue?: any;
  }
) {
  const now = Date.now();
  return await ctx.db.insert("taskActivity", {
    ...args,
    createdAt: now,
  });
}

// READ - Get by task
export async function getActivityByTask(ctx: QueryCtx, taskId: Id<"tasks">) {
  return await ctx.db
    .query("taskActivity")
    .withIndex("by_task", (q) => q.eq("taskId", taskId))
    .order("desc")
    .collect();
}

// READ - Get by user
export async function getActivityByUser(ctx: QueryCtx, userId: string) {
  return await ctx.db
    .query("taskActivity")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .order("desc")
    .collect();
}

// READ - Get recent activity by user (with limit)
export async function getRecentActivityByUser(
  ctx: QueryCtx,
  userId: string,
  limit: number = 20
) {
  const activities = await ctx.db
    .query("taskActivity")
    .withIndex("by_user_and_created", (q) => q.eq("userId", userId))
    .order("desc")
    .take(limit);

  return activities;
}

// DELETE
export async function deleteTaskActivity(
  ctx: MutationCtx,
  id: Id<"taskActivity">
) {
  return await ctx.db.delete(id);
}

// DELETE - Remove all activity for a task
export async function deleteAllActivityForTask(
  ctx: MutationCtx,
  taskId: Id<"tasks">
) {
  const activities = await ctx.db
    .query("taskActivity")
    .withIndex("by_task", (q) => q.eq("taskId", taskId))
    .collect();

  await Promise.all(activities.map((activity) => ctx.db.delete(activity._id)));
}
