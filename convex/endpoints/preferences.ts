/**
 * Endpoint Layer: User Preferences
 *
 * Business logic for user settings and preferences.
 */

import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { authComponent } from "../auth";
import { rateLimiter } from "../rateLimiter";
import * as UserPreferences from "../db/userPreferences";

/**
 * Get user preferences (or create with defaults)
 */
export const get = query({
  handler: async (ctx) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    // Get existing preferences
    const prefs = await UserPreferences.getUserPreferencesByUser(
      ctx,
      authUser._id
    );

    // Return existing or default values
    return prefs || {
      theme: "system" as const,
      defaultView: "list" as const,
      sortBy: "created" as const,
      sortOrder: "desc" as const,
      showCompleted: true,
      enableAI: true,
    };
  },
});

/**
 * Update user preferences
 */
export const update = mutation({
  args: {
    theme: v.optional(
      v.union(v.literal("light"), v.literal("dark"), v.literal("system"))
    ),
    defaultView: v.optional(v.union(v.literal("list"), v.literal("board"))),
    sortBy: v.optional(
      v.union(
        v.literal("created"),
        v.literal("updated"),
        v.literal("priority"),
        v.literal("dueDate"),
        v.literal("custom")
      )
    ),
    sortOrder: v.optional(v.union(v.literal("asc"), v.literal("desc"))),
    showCompleted: v.optional(v.boolean()),
    enableAI: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    // Rate limiting
    const status = await rateLimiter.limit(ctx, "updatePreferences", {
      key: authUser._id,
    });
    if (!status.ok) {
      throw new Error(
        `Rate limit exceeded. Retry after ${status.retryAfter}ms`
      );
    }

    // Get or create preferences
    const prefs = await UserPreferences.getOrCreateUserPreferences(
      ctx,
      authUser._id
    );

    if (!prefs) {
      throw new Error("Failed to get user preferences");
    }

    // Update preferences
    await UserPreferences.updateUserPreferences(ctx, prefs._id, args);

    return prefs._id;
  },
});
