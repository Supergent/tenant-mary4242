/**
 * Database Layer: Messages
 *
 * This is the ONLY file that directly accesses the messages table using ctx.db.
 * Handles messages in AI conversation threads.
 */

import { QueryCtx, MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

// CREATE
export async function createMessage(
  ctx: MutationCtx,
  args: {
    threadId: Id<"threads">;
    userId: string;
    role: "user" | "assistant";
    content: string;
  }
) {
  const now = Date.now();
  return await ctx.db.insert("messages", {
    ...args,
    createdAt: now,
  });
}

// READ - Get by ID
export async function getMessageById(ctx: QueryCtx, id: Id<"messages">) {
  return await ctx.db.get(id);
}

// READ - Get all messages in a thread
export async function getMessagesByThread(
  ctx: QueryCtx,
  threadId: Id<"threads">
) {
  return await ctx.db
    .query("messages")
    .withIndex("by_thread", (q) => q.eq("threadId", threadId))
    .order("asc")
    .collect();
}

// READ - Get all messages by user
export async function getMessagesByUser(ctx: QueryCtx, userId: string) {
  return await ctx.db
    .query("messages")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .order("desc")
    .collect();
}

// DELETE
export async function deleteMessage(ctx: MutationCtx, id: Id<"messages">) {
  return await ctx.db.delete(id);
}

// DELETE - Remove all messages from a thread
export async function deleteAllMessagesInThread(
  ctx: MutationCtx,
  threadId: Id<"threads">
) {
  const messages = await ctx.db
    .query("messages")
    .withIndex("by_thread", (q) => q.eq("threadId", threadId))
    .collect();

  await Promise.all(messages.map((msg) => ctx.db.delete(msg._id)));
}
