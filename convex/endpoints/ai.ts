/**
 * Endpoint Layer: AI Chat
 *
 * Business logic for AI conversation threads and messages.
 */

import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { authComponent } from "../auth";
import { rateLimiter } from "../rateLimiter";
import * as Threads from "../db/threads";
import * as Messages from "../db/messages";
import {
  isValidThreadTitle,
  isValidMessageContent,
  sanitizeString,
} from "../helpers/validation";

/**
 * List all threads for the authenticated user
 */
export const listThreads = query({
  args: {
    status: v.optional(v.union(v.literal("active"), v.literal("archived"))),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    if (args.status) {
      return await Threads.getThreadsByUserAndStatus(
        ctx,
        authUser._id,
        args.status
      );
    }

    return await Threads.getThreadsByUser(ctx, authUser._id);
  },
});

/**
 * Get a single thread with its messages
 */
export const getThread = query({
  args: { threadId: v.id("threads") },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    const thread = await Threads.getThreadById(ctx, args.threadId);
    if (!thread) {
      throw new Error("Thread not found");
    }

    if (thread.userId !== authUser._id) {
      throw new Error("Not authorized to view this thread");
    }

    const messages = await Messages.getMessagesByThread(ctx, args.threadId);

    return {
      thread,
      messages,
    };
  },
});

/**
 * Create a new conversation thread
 */
export const createThread = mutation({
  args: {
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    // Rate limiting
    const status = await rateLimiter.limit(ctx, "createThread", {
      key: authUser._id,
    });
    if (!status.ok) {
      throw new Error(
        `Rate limit exceeded. Retry after ${status.retryAfter}ms`
      );
    }

    // Validation
    if (args.title && !isValidThreadTitle(args.title)) {
      throw new Error("Invalid thread title (max 200 characters)");
    }

    // Create the thread
    const threadId = await Threads.createThread(ctx, {
      userId: authUser._id,
      title: args.title ? sanitizeString(args.title) : undefined,
      status: "active",
    });

    return threadId;
  },
});

/**
 * Send a message in a thread
 */
export const sendMessage = mutation({
  args: {
    threadId: v.id("threads"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    // Rate limiting
    const status = await rateLimiter.limit(ctx, "sendMessage", {
      key: authUser._id,
    });
    if (!status.ok) {
      throw new Error(
        `Rate limit exceeded. Retry after ${status.retryAfter}ms`
      );
    }

    // Verify thread ownership
    const thread = await Threads.getThreadById(ctx, args.threadId);
    if (!thread) {
      throw new Error("Thread not found");
    }

    if (thread.userId !== authUser._id) {
      throw new Error("Not authorized to send messages in this thread");
    }

    // Validation
    const content = sanitizeString(args.content);
    if (!isValidMessageContent(content)) {
      throw new Error("Invalid message content (must be 1-10000 characters)");
    }

    // Create user message
    const messageId = await Messages.createMessage(ctx, {
      threadId: args.threadId,
      userId: authUser._id,
      role: "user",
      content,
    });

    // TODO: In a real implementation, you would:
    // 1. Call the AI agent here (using the Agent component)
    // 2. Generate a response based on the conversation history
    // 3. Create an assistant message with the response
    //
    // For now, we'll just return the user message ID
    // You can integrate the @convex-dev/agent component here

    return messageId;
  },
});

/**
 * Update thread title or status
 */
export const updateThread = mutation({
  args: {
    threadId: v.id("threads"),
    title: v.optional(v.string()),
    status: v.optional(v.union(v.literal("active"), v.literal("archived"))),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    // Verify thread ownership
    const thread = await Threads.getThreadById(ctx, args.threadId);
    if (!thread) {
      throw new Error("Thread not found");
    }

    if (thread.userId !== authUser._id) {
      throw new Error("Not authorized to update this thread");
    }

    // Validation
    if (args.title && !isValidThreadTitle(args.title)) {
      throw new Error("Invalid thread title (max 200 characters)");
    }

    // Prepare update data
    const updateData: any = {};
    if (args.title !== undefined)
      updateData.title = args.title ? sanitizeString(args.title) : undefined;
    if (args.status) updateData.status = args.status;

    // Update the thread
    await Threads.updateThread(ctx, args.threadId, updateData);

    return args.threadId;
  },
});

/**
 * Delete a thread and all its messages
 */
export const deleteThread = mutation({
  args: { threadId: v.id("threads") },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    // Rate limiting
    const status = await rateLimiter.limit(ctx, "deleteThread", {
      key: authUser._id,
    });
    if (!status.ok) {
      throw new Error(
        `Rate limit exceeded. Retry after ${status.retryAfter}ms`
      );
    }

    // Verify thread ownership
    const thread = await Threads.getThreadById(ctx, args.threadId);
    if (!thread) {
      throw new Error("Thread not found");
    }

    if (thread.userId !== authUser._id) {
      throw new Error("Not authorized to delete this thread");
    }

    // Delete all messages first
    await Messages.deleteAllMessagesInThread(ctx, args.threadId);

    // Delete the thread
    await Threads.deleteThread(ctx, args.threadId);

    return args.threadId;
  },
});
