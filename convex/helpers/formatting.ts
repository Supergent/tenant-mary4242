/**
 * Formatting Helpers
 *
 * Pure utility functions for data formatting.
 * NO database access, NO ctx parameter.
 */

/**
 * Format date to relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (weeks < 4) return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;
  return `${years} year${years > 1 ? "s" : ""} ago`;
}

/**
 * Format due date status
 */
export function getDueDateStatus(dueDate: number | undefined): "overdue" | "due-soon" | "normal" | null {
  if (!dueDate) return null;

  const now = Date.now();
  const diff = dueDate - now;

  if (diff < 0) return "overdue";
  if (diff < 24 * 60 * 60 * 1000) return "due-soon"; // Within 24 hours
  return "normal";
}

/**
 * Get priority color class
 */
export function getPriorityColor(priority: "low" | "medium" | "high"): string {
  switch (priority) {
    case "high":
      return "#ef4444"; // red
    case "medium":
      return "#f59e0b"; // amber
    case "low":
      return "#10b981"; // emerald
  }
}

/**
 * Get status color class
 */
export function getStatusColor(status: "todo" | "in_progress" | "completed"): string {
  switch (status) {
    case "todo":
      return "#64748b"; // slate
    case "in_progress":
      return "#0ea5e9"; // sky
    case "completed":
      return "#22c55e"; // green
  }
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

/**
 * Format task summary for AI context
 */
export function formatTaskForAI(task: {
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: number;
}): string {
  let summary = `Task: ${task.title}\n`;
  summary += `Status: ${task.status}\n`;
  summary += `Priority: ${task.priority}\n`;

  if (task.description) {
    summary += `Description: ${task.description}\n`;
  }

  if (task.dueDate) {
    const date = new Date(task.dueDate);
    summary += `Due: ${date.toLocaleDateString()}\n`;
  }

  return summary;
}
