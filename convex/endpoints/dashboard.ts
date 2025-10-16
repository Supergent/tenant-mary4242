/**
 * Endpoint Layer: Dashboard
 *
 * Aggregated data and metrics for the dashboard view.
 */

import { query } from "../_generated/server";
import { authComponent } from "../auth";
import * as Tasks from "../db/tasks";
import * as Labels from "../db/labels";
import * as TaskActivity from "../db/taskActivity";
import type { DataModel } from "../_generated/dataModel";

/**
 * Dashboard summary with key metrics
 */
export const summary = query({
  handler: async (ctx) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    // Get task counts by status
    const [todoCount, inProgressCount, completedCount, totalLabels] =
      await Promise.all([
        Tasks.countTasksByStatus(ctx, authUser._id, "todo"),
        Tasks.countTasksByStatus(ctx, authUser._id, "in_progress"),
        Tasks.countTasksByStatus(ctx, authUser._id, "completed"),
        Labels.getLabelsByUser(ctx, authUser._id).then((labels) => labels.length),
      ]);

    return {
      tasks: {
        todo: todoCount,
        inProgress: inProgressCount,
        completed: completedCount,
        total: todoCount + inProgressCount + completedCount,
      },
      labels: totalLabels,
    };
  },
});

/**
 * Recent tasks for the dashboard table view
 */
export const recent = query({
  args: {},
  handler: async (ctx) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    // Get all tasks and sort by updatedAt
    const tasks = await Tasks.getTasksByUser(ctx, authUser._id);

    // Sort by updatedAt descending and take first 10
    const recentTasks = tasks
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 10);

    return recentTasks;
  },
});

/**
 * Recent activity for dashboard
 */
export const recentActivity = query({
  handler: async (ctx) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    return await TaskActivity.getRecentActivityByUser(ctx, authUser._id, 10);
  },
});

/**
 * Load summary for all tables (for debugging/admin)
 */
export const loadSummary = query({
  handler: async (ctx) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    const TABLES = [
      "tasks",
      "taskComments",
      "taskActivity",
      "userPreferences",
      "labels",
      "taskLabels",
      "threads",
      "messages",
    ] as const;

    const perTable: Record<string, number> = {};

    for (const table of TABLES) {
      // Use type assertion for dynamic table queries
      const records = await ctx.db
        .query(table as keyof DataModel)
        .collect();

      const scopedRecords = records.filter(
        (record: any) => record.userId === authUser._id
      );
      perTable[table] = scopedRecords.length;
    }

    const totalRecords = Object.values(perTable).reduce((a, b) => a + b, 0);

    return { perTable, totalRecords };
  },
});
