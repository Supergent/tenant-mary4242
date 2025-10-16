/**
 * Database Layer: Labels
 *
 * This is the ONLY file that directly accesses the labels table using ctx.db.
 * All label-related database operations are defined here as pure async functions.
 */

import { QueryCtx, MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

// CREATE
export async function createLabel(
  ctx: MutationCtx,
  args: {
    userId: string;
    name: string;
    color: string;
  }
) {
  const now = Date.now();
  return await ctx.db.insert("labels", {
    ...args,
    createdAt: now,
  });
}

// READ - Get by ID
export async function getLabelById(ctx: QueryCtx, id: Id<"labels">) {
  return await ctx.db.get(id);
}

// READ - Get all labels by user
export async function getLabelsByUser(ctx: QueryCtx, userId: string) {
  return await ctx.db
    .query("labels")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .order("desc")
    .collect();
}

// READ - Get label by user and name
export async function getLabelByUserAndName(
  ctx: QueryCtx,
  userId: string,
  name: string
) {
  return await ctx.db
    .query("labels")
    .withIndex("by_user_and_name", (q) => q.eq("userId", userId))
    .filter((label) => label.name === name)
    .first();
}

// UPDATE
export async function updateLabel(
  ctx: MutationCtx,
  id: Id<"labels">,
  args: {
    name?: string;
    color?: string;
  }
) {
  return await ctx.db.patch(id, args);
}

// DELETE
export async function deleteLabel(ctx: MutationCtx, id: Id<"labels">) {
  return await ctx.db.delete(id);
}