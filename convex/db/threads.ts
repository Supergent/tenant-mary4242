/**
 * Database Layer: Threads
 *
 * This is the ONLY file that directly accesses the threads table using ctx.db.
 * Handles AI conversation threads for task assistance.
 */

import { QueryCtx, MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

// CREATE
export async function createThread(
  ctx: MutationCtx,
  args: {
    userId: string;
    title?: string;
    status: "active" | "archived";
  }
) {
  const now = Date.now();
  return await ctx.db.insert("threads", {
    ...args,
    createdAt: now,
    updatedAt: now,
  });
}

// READ - Get by ID
export async function getThreadById(ctx: QueryCtx, id: Id<"threads">) {
  return await ctx.db.get(id);
}

// READ - Get all threads by user
export async function getThreadsByUser(ctx: QueryCtx, userId: string) {
  return await ctx.db
    .query("threads")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .order("desc")
    .collect();
}

// READ - Get threads by user and status
export async function getThreadsByUserAndStatus(
  ctx: QueryCtx,
  userId: string,
  status: "active" | "archived"
) {
  return await ctx.db
    .query("threads")
    .withIndex("by_user_and_status", (q) =>
      q.eq("userId", userId).eq("status", status)
    )
    .order("desc")
    .collect();
}

// UPDATE
export async function updateThread(
  ctx: MutationCtx,
  id: Id<"threads">,
  args: {
    title?: string;
    status?: "active" | "archived";
  }
) {
  return await ctx.db.patch(id, {
    ...args,
    updatedAt: Date.now(),
  });
}

// DELETE
export async function deleteThread(ctx: MutationCtx, id: Id<"threads">) {
  return await ctx.db.delete(id);
}