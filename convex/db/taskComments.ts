/**
 * Database Layer: TaskComments
 *
 * This is the ONLY file that directly accesses the taskComments table using ctx.db.
 * Handles user notes and AI suggestions on tasks.
 */

import { QueryCtx, MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

// CREATE
export async function createTaskComment(
  ctx: MutationCtx,
  args: {
    taskId: Id<"tasks">;
    userId: string;
    content: string;
    type: "user_note" | "ai_suggestion" | "ai_insight";
  }
) {
  const now = Date.now();
  return await ctx.db.insert("taskComments", {
    ...args,
    createdAt: now,
  });
}

// READ - Get by task
export async function getCommentsByTask(ctx: QueryCtx, taskId: Id<"tasks">) {
  return await ctx.db
    .query("taskComments")
    .withIndex("by_task", (q) => q.eq("taskId", taskId))
    .order("asc")
    .collect();
}

// READ - Get by user
export async function getCommentsByUser(ctx: QueryCtx, userId: string) {
  return await ctx.db
    .query("taskComments")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .order("desc")
    .collect();
}

// DELETE
export async function deleteTaskComment(
  ctx: MutationCtx,
  id: Id<"taskComments">
) {
  return await ctx.db.delete(id);
}

// DELETE - Remove all comments from a task
export async function deleteAllCommentsFromTask(
  ctx: MutationCtx,
  taskId: Id<"tasks">
) {
  const comments = await ctx.db
    .query("taskComments")
    .withIndex("by_task", (q) => q.eq("taskId", taskId))
    .collect();

  await Promise.all(comments.map((comment) => ctx.db.delete(comment._id)));
}
