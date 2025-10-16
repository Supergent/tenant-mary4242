/**
 * Database Layer: UserPreferences
 *
 * This is the ONLY file that directly accesses the userPreferences table using ctx.db.
 * Handles user-specific settings and preferences.
 */

import { QueryCtx, MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

// CREATE
export async function createUserPreferences(
  ctx: MutationCtx,
  args: {
    userId: string;
    theme: "light" | "dark" | "system";
    defaultView: "list" | "board";
    sortBy: "created" | "updated" | "priority" | "dueDate" | "custom";
    sortOrder: "asc" | "desc";
    showCompleted: boolean;
    enableAI: boolean;
  }
) {
  const now = Date.now();
  return await ctx.db.insert("userPreferences", {
    ...args,
    createdAt: now,
    updatedAt: now,
  });
}

// READ - Get by ID
export async function getUserPreferencesById(
  ctx: QueryCtx,
  id: Id<"userPreferences">
) {
  return await ctx.db.get(id);
}

// READ - Get preferences by user
export async function getUserPreferencesByUser(ctx: QueryCtx, userId: string) {
  return await ctx.db
    .query("userPreferences")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .first();
}

// UPDATE
export async function updateUserPreferences(
  ctx: MutationCtx,
  id: Id<"userPreferences">,
  args: {
    theme?: "light" | "dark" | "system";
    defaultView?: "list" | "board";
    sortBy?: "created" | "updated" | "priority" | "dueDate" | "custom";
    sortOrder?: "asc" | "desc";
    showCompleted?: boolean;
    enableAI?: boolean;
  }
) {
  return await ctx.db.patch(id, {
    ...args,
    updatedAt: Date.now(),
  });
}

// DELETE
export async function deleteUserPreferences(
  ctx: MutationCtx,
  id: Id<"userPreferences">
) {
  return await ctx.db.delete(id);
}

// UTILITY - Get or create default preferences
export async function getOrCreateUserPreferences(
  ctx: MutationCtx,
  userId: string
) {
  const existing = await getUserPreferencesByUser(ctx, userId);

  if (existing) {
    return existing;
  }

  // Create with defaults
  const id = await createUserPreferences(ctx, {
    userId,
    theme: "system",
    defaultView: "list",
    sortBy: "created",
    sortOrder: "desc",
    showCompleted: true,
    enableAI: true,
  });

  return await ctx.db.get(id);
}
