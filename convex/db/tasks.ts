/**
 * Database Layer: Tasks
 *
 * This is the ONLY file that directly accesses the tasks table using ctx.db.
 * All task-related database operations are defined here as pure async functions.
 */

import { QueryCtx, MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

// CREATE
export async function createTask(
  ctx: MutationCtx,
  args: {
    userId: string;
    title: string;
    description?: string;
    status: "todo" | "in_progress" | "completed";
    priority: "low" | "medium" | "high";
    dueDate?: number;
    order: number;
  }
) {
  const now = Date.now();
  return await ctx.db.insert("tasks", {
    ...args,
    createdAt: now,
    updatedAt: now,
  });
}

// READ - Get by ID
export async function getTaskById(ctx: QueryCtx, id: Id<"tasks">) {
  return await ctx.db.get(id);
}

// READ - Get all tasks by user
export async function getTasksByUser(ctx: QueryCtx, userId: string) {
  return await ctx.db
    .query("tasks")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .order("desc")
    .collect();
}

// READ - Get tasks by user and status
export async function getTasksByUserAndStatus(
  ctx: QueryCtx,
  userId: string,
  status: "todo" | "in_progress" | "completed"
) {
  return await ctx.db
    .query("tasks")
    .withIndex("by_user_and_status", (q) =>
      q.eq("userId", userId).eq("status", status)
    )
    .collect();
}

// READ - Get tasks by user with status ordered by custom order
export async function getTasksByUserStatusOrdered(
  ctx: QueryCtx,
  userId: string,
  status: "todo" | "in_progress" | "completed"
) {
  return await ctx.db
    .query("tasks")
    .withIndex("by_user_status_order", (q) =>
      q.eq("userId", userId).eq("status", status)
    )
    .collect();
}

// READ - Get tasks by user ordered by due date
export async function getTasksByUserDueDate(ctx: QueryCtx, userId: string) {
  return await ctx.db
    .query("tasks")
    .withIndex("by_user_and_due_date", (q) => q.eq("userId", userId))
    .collect();
}

// UPDATE
export async function updateTask(
  ctx: MutationCtx,
  id: Id<"tasks">,
  args: {
    title?: string;
    description?: string;
    status?: "todo" | "in_progress" | "completed";
    priority?: "low" | "medium" | "high";
    dueDate?: number;
    order?: number;
    completedAt?: number;
  }
) {
  return await ctx.db.patch(id, {
    ...args,
    updatedAt: Date.now(),
  });
}

// DELETE
export async function deleteTask(ctx: MutationCtx, id: Id<"tasks">) {
  return await ctx.db.delete(id);
}

// UTILITY - Get max order for user and status (for new tasks)
export async function getMaxOrderForStatus(
  ctx: QueryCtx,
  userId: string,
  status: "todo" | "in_progress" | "completed"
): Promise<number> {
  const tasks = await ctx.db
    .query("tasks")
    .withIndex("by_user_status_order", (q) =>
      q.eq("userId", userId).eq("status", status)
    )
    .collect();

  if (tasks.length === 0) return 0;

  return Math.max(...tasks.map((t) => t.order));
}

// UTILITY - Count tasks by status
export async function countTasksByStatus(
  ctx: QueryCtx,
  userId: string,
  status: "todo" | "in_progress" | "completed"
): Promise<number> {
  const tasks = await getTasksByUserAndStatus(ctx, userId, status);
  return tasks.length;
}