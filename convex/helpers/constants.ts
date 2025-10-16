/**
 * Application Constants
 *
 * Centralized constants used throughout the application.
 */

// Task Management
export const MAX_TASK_TITLE_LENGTH = 200;
export const MAX_TASK_DESCRIPTION_LENGTH = 2000;
export const MAX_LABEL_NAME_LENGTH = 50;
export const MAX_COMMENT_LENGTH = 5000;
export const MAX_MESSAGE_LENGTH = 10000;
export const MAX_THREAD_TITLE_LENGTH = 200;

// Pagination
export const DEFAULT_PAGE_SIZE = 50;
export const MAX_PAGE_SIZE = 100;

// Activity Log
export const MAX_RECENT_ACTIVITIES = 20;

// Default Colors for Labels
export const DEFAULT_LABEL_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#f59e0b", // amber
  "#eab308", // yellow
  "#84cc16", // lime
  "#22c55e", // green
  "#10b981", // emerald
  "#14b8a6", // teal
  "#06b6d4", // cyan
  "#0ea5e9", // sky
  "#3b82f6", // blue
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#a855f7", // purple
  "#d946ef", // fuchsia
  "#ec4899", // pink
  "#f43f5e", // rose
];

// Task Statuses
export const TASK_STATUSES = ["todo", "in_progress", "completed"] as const;

// Task Priorities
export const TASK_PRIORITIES = ["low", "medium", "high"] as const;

// Valid Status Transitions
export const STATUS_TRANSITIONS: Record<
  string,
  Array<"todo" | "in_progress" | "completed">
> = {
  todo: ["in_progress", "completed"],
  in_progress: ["todo", "completed"],
  completed: ["todo", "in_progress"],
};

// Theme Options
export const THEME_OPTIONS = ["light", "dark", "system"] as const;

// View Options
export const VIEW_OPTIONS = ["list", "board"] as const;

// Sort Options
export const SORT_OPTIONS = [
  "created",
  "updated",
  "priority",
  "dueDate",
  "custom",
] as const;

// AI Settings
export const AI_MAX_CONTEXT_LENGTH = 4000;
export const AI_MAX_MESSAGES_IN_THREAD = 100;
