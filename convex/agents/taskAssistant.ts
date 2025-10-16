import { Agent } from "@convex-dev/agent";
import { internal } from "../_generated/api";
import { v } from "convex/values";
import { ActionCtx, QueryCtx } from "../_generated/server";

/**
 * Task Assistant Agent
 *
 * An AI assistant specialized in helping users manage their tasks.
 * Features multi-step reasoning and can perform CRUD operations.
 */
export const taskAssistant = new Agent(
  {
    name: "Task Assistant",
    description: "Helps users manage and organize their tasks",

    tools: [
      {
        name: "list_tasks",
        description: "Get all user's tasks",
        parameters: {
          userId: v.id("users"),
          limit: v.optional(v.number())
        },
        handler: async (ctx: QueryCtx, { userId, limit = 20 }: { userId: any; limit?: number }) => {
          const items = await ctx.db
            .query("tasks")
            .withIndex("by_user", (q: any) => q.eq("userId", userId))
            .take(limit);

          return items;
        }
      },
      {
        name: "create_task",
        description: "Create a new task",
        parameters: {
          userId: v.id("users"),
          title: v.string(),
          description: v.optional(v.string())
        },
        handler: async (ctx: ActionCtx, args: { userId: any; title: string; description?: string }) => {
          const id = await ctx.db.insert("tasks", {
            userId: args.userId,
            title: args.title,
            description: args.description,
            createdAt: Date.now()
          });

          return { id, success: true };
        }
      },
      {
        name: "analyze_tasks",
        description: "Analyze user's tasks and provide insights",
        parameters: {
userId: v.id("users")
        },
        handler: async (ctx: QueryCtx, { userId }: { userId: any }) => {
          const items = await ctx.db
            .query("tasks")
            .withIndex("by_user", (q: any) => q.eq("userId", userId))
            .collect();

          const total = items.length;
          const recent = items.filter((item: any) =>
            item.createdAt > Date.now() - 7 * 24 * 60 * 60 * 1000
          ).length;

          return {
            total,
            recentCount: recent,
            insights: {
              activity: recent > 0 ? "active" : "inactive",
              recommendation: total === 0
                ? "Get started by creating your first task"
                : `You have ${total} tasks total`
            }
          };
        }
      }
    ],

    systemPrompt: `You are a helpful task management assistant.

You help users with their tasks by:
1. Listing and searching tasks
2. Creating new tasks
3. Analyzing patterns and providing insights
4. Making recommendations for better organization

When responding:
- Be proactive and suggest actions
- Provide context and reasoning
- Keep responses concise but informative
- Use the tools available to fetch real data

If a user asks about their tasks, always check the current state first using list_tasks.`,
  },
  internal.agent.taskAssistant
);