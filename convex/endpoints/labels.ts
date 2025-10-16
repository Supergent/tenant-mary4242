/**
 * Endpoint Layer: Labels
 *
 * Business logic for label management and task-label associations.
 * Composes database operations from the db layer.
 * Handles authentication, authorization, and rate limiting.
 */

import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { authComponent } from "../auth";
import { rateLimiter } from "../rateLimiter";
import * as Labels from "../db/labels";
import * as TaskLabels from "../db/taskLabels";
import * as Tasks from "../db/tasks";
import {
  isValidLabelName,
  isValidHexColor,
  sanitizeString,
} from "../helpers/validation";

/**
 * List all labels for the authenticated user
 */
export const list = query({
  handler: async (ctx) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    return await Labels.getLabelsByUser(ctx, authUser._id);
  },
});

/**
 * Get a single label by ID
 */
export const get = query({
  args: { id: v.id("labels") },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    const label = await Labels.getLabelById(ctx, args.id);
    if (!label) {
      throw new Error("Label not found");
    }

    if (label.userId !== authUser._id) {
      throw new Error("Not authorized to view this label");
    }

    return label;
  },
});

/**
 * Create a new label
 */
export const create = mutation({
  args: {
    name: v.string(),
    color: v.string(),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    // Rate limiting
    const status = await rateLimiter.limit(ctx, "createLabel", {
      key: authUser._id,
    });
    if (!status.ok) {
      throw new Error(
        `Rate limit exceeded. Retry after ${status.retryAfter}ms`
      );
    }

    // Validation
    const name = sanitizeString(args.name);
    if (!isValidLabelName(name)) {
      throw new Error("Invalid label name (must be 1-50 characters)");
    }

    if (!isValidHexColor(args.color)) {
      throw new Error("Invalid color (must be a hex color code like #6366f1)");
    }

    // Check for duplicate name
    const existing = await Labels.getLabelByUserAndName(ctx, authUser._id, name);
    if (existing) {
      throw new Error("A label with this name already exists");
    }

    // Create the label
    const labelId = await Labels.createLabel(ctx, {
      userId: authUser._id,
      name,
      color: args.color,
    });

    return labelId;
  },
});

/**
 * Update an existing label
 */
export const update = mutation({
  args: {
    id: v.id("labels"),
    name: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    // Rate limiting
    const status = await rateLimiter.limit(ctx, "updateLabel", {
      key: authUser._id,
    });
    if (!status.ok) {
      throw new Error(
        `Rate limit exceeded. Retry after ${status.retryAfter}ms`
      );
    }

    // Verify ownership
    const label = await Labels.getLabelById(ctx, args.id);
    if (!label) {
      throw new Error("Label not found");
    }

    if (label.userId !== authUser._id) {
      throw new Error("Not authorized to update this label");
    }

    // Validation
    if (args.name) {
      const name = sanitizeString(args.name);
      if (!isValidLabelName(name)) {
        throw new Error("Invalid label name (must be 1-50 characters)");
      }

      // Check for duplicate name (if name is changing)
      if (name !== label.name) {
        const existing = await Labels.getLabelByUserAndName(
          ctx,
          authUser._id,
          name
        );
        if (existing) {
          throw new Error("A label with this name already exists");
        }
      }
    }

    if (args.color && !isValidHexColor(args.color)) {
      throw new Error("Invalid color (must be a hex color code like #6366f1)");
    }

    // Prepare update data
    const updateData: any = {};
    if (args.name) updateData.name = sanitizeString(args.name);
    if (args.color) updateData.color = args.color;

    // Update the label
    await Labels.updateLabel(ctx, args.id, updateData);

    return args.id;
  },
});

/**
 * Delete a label
 */
export const remove = mutation({
  args: { id: v.id("labels") },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    // Rate limiting
    const status = await rateLimiter.limit(ctx, "deleteLabel", {
      key: authUser._id,
    });
    if (!status.ok) {
      throw new Error(
        `Rate limit exceeded. Retry after ${status.retryAfter}ms`
      );
    }

    // Verify ownership
    const label = await Labels.getLabelById(ctx, args.id);
    if (!label) {
      throw new Error("Label not found");
    }

    if (label.userId !== authUser._id) {
      throw new Error("Not authorized to delete this label");
    }

    // Delete all task associations first
    await TaskLabels.deleteAllTasksFromLabel(ctx, args.id);

    // Delete the label
    await Labels.deleteLabel(ctx, args.id);

    return args.id;
  },
});

/**
 * Add a label to a task
 */
export const addToTask = mutation({
  args: {
    taskId: v.id("tasks"),
    labelId: v.id("labels"),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    // Rate limiting
    const status = await rateLimiter.limit(ctx, "addLabelToTask", {
      key: authUser._id,
    });
    if (!status.ok) {
      throw new Error(
        `Rate limit exceeded. Retry after ${status.retryAfter}ms`
      );
    }

    // Verify task ownership
    const task = await Tasks.getTaskById(ctx, args.taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    if (task.userId !== authUser._id) {
      throw new Error("Not authorized to modify this task");
    }

    // Verify label ownership
    const label = await Labels.getLabelById(ctx, args.labelId);
    if (!label) {
      throw new Error("Label not found");
    }

    if (label.userId !== authUser._id) {
      throw new Error("Not authorized to use this label");
    }

    // Check if already associated
    const exists = await TaskLabels.taskLabelExists(
      ctx,
      args.taskId,
      args.labelId
    );
    if (exists) {
      throw new Error("This label is already added to the task");
    }

    // Create the association
    const taskLabelId = await TaskLabels.createTaskLabel(ctx, {
      taskId: args.taskId,
      labelId: args.labelId,
      userId: authUser._id,
    });

    return taskLabelId;
  },
});

/**
 * Remove a label from a task
 */
export const removeFromTask = mutation({
  args: {
    taskId: v.id("tasks"),
    labelId: v.id("labels"),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    // Rate limiting
    const status = await rateLimiter.limit(ctx, "removeLabelFromTask", {
      key: authUser._id,
    });
    if (!status.ok) {
      throw new Error(
        `Rate limit exceeded. Retry after ${status.retryAfter}ms`
      );
    }

    // Verify task ownership
    const task = await Tasks.getTaskById(ctx, args.taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    if (task.userId !== authUser._id) {
      throw new Error("Not authorized to modify this task");
    }

    // Remove the association
    await TaskLabels.deleteTaskLabel(ctx, args.taskId, args.labelId);

    return { taskId: args.taskId, labelId: args.labelId };
  },
});

/**
 * Get all labels for a specific task
 */
export const getLabelsForTask = query({
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
      throw new Error("Not authorized to view this task");
    }

    // Get task-label associations
    const taskLabels = await TaskLabels.getLabelsForTask(ctx, args.taskId);

    // Fetch full label data
    const labels = await Promise.all(
      taskLabels.map(async (tl) => {
        const label = await Labels.getLabelById(ctx, tl.labelId);
        return label;
      })
    );

    return labels.filter((l) => l !== null);
  },
});

/**
 * Get all tasks for a specific label
 */
export const getTasksForLabel = query({
  args: { labelId: v.id("labels") },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    // Verify label ownership
    const label = await Labels.getLabelById(ctx, args.labelId);
    if (!label) {
      throw new Error("Label not found");
    }

    if (label.userId !== authUser._id) {
      throw new Error("Not authorized to view this label");
    }

    // Get task-label associations
    const taskLabels = await TaskLabels.getTasksForLabel(ctx, args.labelId);

    // Fetch full task data
    const tasks = await Promise.all(
      taskLabels.map(async (tl) => {
        const task = await Tasks.getTaskById(ctx, tl.taskId);
        return task;
      })
    );

    return tasks.filter((t) => t !== null);
  },
});
