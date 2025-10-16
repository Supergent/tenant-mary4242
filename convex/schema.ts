import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ============================================================================
  // CORE TASK MANAGEMENT TABLES
  // ============================================================================

  tasks: defineTable({
    userId: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(
      v.literal("todo"),
      v.literal("in_progress"),
      v.literal("completed")
    ),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high")
    ),
    dueDate: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    order: v.number(), // For user-defined ordering
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_status", ["userId", "status"])
    .index("by_user_and_due_date", ["userId", "dueDate"])
    .index("by_user_status_order", ["userId", "status", "order"]),

  // Task labels/tags for organization
  labels: defineTable({
    userId: v.string(),
    name: v.string(),
    color: v.string(), // Hex color code
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_name", ["userId", "name"]),

  // Many-to-many relationship between tasks and labels
  taskLabels: defineTable({
    taskId: v.id("tasks"),
    labelId: v.id("labels"),
    userId: v.string(),
    createdAt: v.number(),
  })
    .index("by_task", ["taskId"])
    .index("by_label", ["labelId"])
    .index("by_user", ["userId"]),

  // ============================================================================
  // AI AGENT TABLES (for Agent Component)
  // ============================================================================

  // AI conversation threads for task assistance
  threads: defineTable({
    userId: v.string(),
    title: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("archived")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_status", ["userId", "status"]),

  // Messages in AI conversation threads
  messages: defineTable({
    threadId: v.id("threads"),
    userId: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    createdAt: v.number(),
  })
    .index("by_thread", ["threadId"])
    .index("by_user", ["userId"]),

  // ============================================================================
  // USER PREFERENCES
  // ============================================================================

  userPreferences: defineTable({
    userId: v.string(),
    theme: v.union(v.literal("light"), v.literal("dark"), v.literal("system")),
    defaultView: v.union(v.literal("list"), v.literal("board")),
    sortBy: v.union(
      v.literal("created"),
      v.literal("updated"),
      v.literal("priority"),
      v.literal("dueDate"),
      v.literal("custom")
    ),
    sortOrder: v.union(v.literal("asc"), v.literal("desc")),
    showCompleted: v.boolean(),
    enableAI: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"]),

  // ============================================================================
  // ACTIVITY LOG (for analytics and user history)
  // ============================================================================

  taskActivity: defineTable({
    userId: v.string(),
    taskId: v.id("tasks"),
    action: v.union(
      v.literal("created"),
      v.literal("updated"),
      v.literal("completed"),
      v.literal("deleted"),
      v.literal("status_changed"),
      v.literal("priority_changed")
    ),
    oldValue: v.optional(v.any()),
    newValue: v.optional(v.any()),
    createdAt: v.number(),
  })
    .index("by_task", ["taskId"])
    .index("by_user", ["userId"])
    .index("by_user_and_created", ["userId", "createdAt"]),

  // ============================================================================
  // TASK COMMENTS (for notes and AI suggestions)
  // ============================================================================

  taskComments: defineTable({
    taskId: v.id("tasks"),
    userId: v.string(),
    content: v.string(),
    type: v.union(
      v.literal("user_note"),
      v.literal("ai_suggestion"),
      v.literal("ai_insight")
    ),
    createdAt: v.number(),
  })
    .index("by_task", ["taskId"])
    .index("by_user", ["userId"]),
});
