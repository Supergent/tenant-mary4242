/**
 * Endpoint Layer: Task Activity
 *
 * Business logic for viewing task activity history.
 */

import { v } from "convex/values";
import { query } from "../_generated/server";
import { authComponent } from "../auth";
import * as TaskActivity from "../db/taskActivity";
import * as Tasks from "../db/tasks";

/**
 * Get activity for a specific task
 */
export const getByTask = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    // Verify task ownership
    const task = await Tasks.getTaskById(ctx, args.taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    if (task.userId !== authUser._id) {
      throw new Error("Not authorized to view activity for this task");
    }

    return await TaskActivity.getActivityByTask(ctx, args.taskId);
  },
});

/**
 * Get recent activity for the user
 */
export const getRecent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    return await TaskActivity.getRecentActivityByUser(
      ctx,
      authUser._id,
      args.limit
    );
  },
});

/**
 * Get all activity for the user
 */
export const getAll = query({
  handler: async (ctx) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    return await TaskActivity.getActivityByUser(ctx, authUser._id);
  },
});
