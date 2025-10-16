/**
 * Endpoint Layer: Tasks
 *
 * Business logic for task management.
 * Composes database operations from the db layer.
 * Handles authentication, authorization, and rate limiting.
 */

import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { authComponent } from "../auth";
import { rateLimiter } from "../rateLimiter";
import * as Tasks from "../db/tasks";
import * as TaskActivity from "../db/taskActivity";
import * as TaskLabels from "../db/taskLabels";
import * as TaskComments from "../db/taskComments";
import {
  isValidTaskTitle,
  isValidTaskDescription,
  sanitizeString,
} from "../helpers/validation";

/**
 * List all tasks for the authenticated user
 */
export const list = query({
  handler: async (ctx) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    return await Tasks.getTasksByUser(ctx, authUser._id);
  },
});

/**
 * List tasks by status
 */
export const listByStatus = query({
  args: {
    status: v.union(
      v.literal("todo"),
      v.literal("in_progress"),
      v.literal("completed")
    ),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    return await Tasks.getTasksByUserStatusOrdered(
      ctx,
      authUser._id,
      args.status
    );
  },
});

/**
 * Get a single task by ID
 */
export const get = query({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    const task = await Tasks.getTaskById(ctx, args.id);
    if (!task) {
      throw new Error("Task not found");
    }

    if (task.userId !== authUser._id) {
      throw new Error("Not authorized to view this task");
    }

    return task;
  },
});

/**
 * Create a new task
 */
export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    dueDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    // Rate limiting
    const status = await rateLimiter.limit(ctx, "createTask", {
      key: authUser._id,
    });
    if (!status.ok) {
      throw new Error(
        `Rate limit exceeded. Retry after ${status.retryAfter}ms`
      );
    }

    // Validation
    const title = sanitizeString(args.title);
    if (!isValidTaskTitle(title)) {
      throw new Error("Invalid task title (must be 1-200 characters)");
    }

    if (args.description && !isValidTaskDescription(args.description)) {
      throw new Error("Invalid description (max 2000 characters)");
    }

    // Get the next order number for todo status
    const maxOrder = await Tasks.getMaxOrderForStatus(ctx, authUser._id, "todo");

    // Create the task
    const taskId = await Tasks.createTask(ctx, {
      userId: authUser._id,
      title,
      description: args.description,
      status: "todo",
      priority: args.priority,
      dueDate: args.dueDate,
      order: maxOrder + 1,
    });

    // Log activity
    await TaskActivity.createTaskActivity(ctx, {
      userId: authUser._id,
      taskId,
      action: "created",
      newValue: { title, priority: args.priority },
    });

    return taskId;
  },
});

/**
 * Update an existing task
 */
export const update = mutation({
  args: {
    id: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("todo"),
        v.literal("in_progress"),
        v.literal("completed")
      )
    ),
    priority: v.optional(
      v.union(v.literal("low"), v.literal("medium"), v.literal("high"))
    ),
    dueDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    // Rate limiting
    const status = await rateLimiter.limit(ctx, "updateTask", {
      key: authUser._id,
    });
    if (!status.ok) {
      throw new Error(
        `Rate limit exceeded. Retry after ${status.retryAfter}ms`
      );
    }

    // Verify ownership
    const task = await Tasks.getTaskById(ctx, args.id);
    if (!task) {
      throw new Error("Task not found");
    }

    if (task.userId !== authUser._id) {
      throw new Error("Not authorized to update this task");
    }

    // Validation
    if (args.title) {
      const title = sanitizeString(args.title);
      if (!isValidTaskTitle(title)) {
        throw new Error("Invalid task title (must be 1-200 characters)");
      }
    }

    if (args.description && !isValidTaskDescription(args.description)) {
      throw new Error("Invalid description (max 2000 characters)");
    }

    // Prepare update data
    const updateData: any = {};
    if (args.title) updateData.title = sanitizeString(args.title);
    if (args.description !== undefined)
      updateData.description = args.description;
    if (args.priority) updateData.priority = args.priority;
    if (args.dueDate !== undefined) updateData.dueDate = args.dueDate;

    // Handle status change
    if (args.status && args.status !== task.status) {
      updateData.status = args.status;

      // If completing the task, set completedAt
      if (args.status === "completed") {
        updateData.completedAt = Date.now();
      } else {
        updateData.completedAt = undefined;
      }

      // Log status change activity
      await TaskActivity.createTaskActivity(ctx, {
        userId: authUser._id,
        taskId: args.id,
        action: "status_changed",
        oldValue: task.status,
        newValue: args.status,
      });
    }

    // Log priority change
    if (args.priority && args.priority !== task.priority) {
      await TaskActivity.createTaskActivity(ctx, {
        userId: authUser._id,
        taskId: args.id,
        action: "priority_changed",
        oldValue: task.priority,
        newValue: args.priority,
      });
    }

    // Update the task
    await Tasks.updateTask(ctx, args.id, updateData);

    // Log general update activity (if not status or priority change)
    if (!args.status && !args.priority) {
      await TaskActivity.createTaskActivity(ctx, {
        userId: authUser._id,
        taskId: args.id,
        action: "updated",
      });
    }

    return args.id;
  },
});

/**
 * Reorder tasks (update order field)
 */
export const reorder = mutation({
  args: {
    id: v.id("tasks"),
    newOrder: v.number(),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    // Rate limiting (using updateTask limit)
    const status = await rateLimiter.limit(ctx, "updateTask", {
      key: authUser._id,
    });
    if (!status.ok) {
      throw new Error(
        `Rate limit exceeded. Retry after ${status.retryAfter}ms`
      );
    }

    // Verify ownership
    const task = await Tasks.getTaskById(ctx, args.id);
    if (!task) {
      throw new Error("Task not found");
    }

    if (task.userId !== authUser._id) {
      throw new Error("Not authorized to update this task");
    }

    // Update order
    await Tasks.updateTask(ctx, args.id, { order: args.newOrder });

    return args.id;
  },
});

/**
 * Delete a task
 */
export const remove = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    // Rate limiting
    const status = await rateLimiter.limit(ctx, "deleteTask", {
      key: authUser._id,
    });
    if (!status.ok) {
      throw new Error(
        `Rate limit exceeded. Retry after ${status.retryAfter}ms`
      );
    }

    // Verify ownership
    const task = await Tasks.getTaskById(ctx, args.id);
    if (!task) {
      throw new Error("Task not found");
    }

    if (task.userId !== authUser._id) {
      throw new Error("Not authorized to delete this task");
    }

    // Log deletion activity before deleting
    await TaskActivity.createTaskActivity(ctx, {
      userId: authUser._id,
      taskId: args.id,
      action: "deleted",
      oldValue: { title: task.title },
    });

    // Delete related data
    await TaskLabels.deleteAllLabelsFromTask(ctx, args.id);
    await TaskComments.deleteAllCommentsFromTask(ctx, args.id);
    // Note: We keep activity logs even after task deletion for history

    // Delete the task
    await Tasks.deleteTask(ctx, args.id);

    return args.id;
  },
});

/**
 * Get task counts by status
 */
export const getCounts = query({
  handler: async (ctx) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    const [todoCount, inProgressCount, completedCount] = await Promise.all([
      Tasks.countTasksByStatus(ctx, authUser._id, "todo"),
      Tasks.countTasksByStatus(ctx, authUser._id, "in_progress"),
      Tasks.countTasksByStatus(ctx, authUser._id, "completed"),
    ]);

    return {
      todo: todoCount,
      in_progress: inProgressCount,
      completed: completedCount,
      total: todoCount + inProgressCount + completedCount,
    };
  },
});
