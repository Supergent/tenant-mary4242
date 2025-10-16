/**
 * Rate Limiter Configuration
 *
 * Defines rate limits for all user-facing mutations.
 * Uses token bucket for smooth rate limiting with burst capacity.
 */

import { RateLimiter, MINUTE, HOUR } from "@convex-dev/rate-limiter";
import { components } from "./_generated/api";

export const rateLimiter = new RateLimiter(components.rateLimiter, {
  // Task Operations
  createTask: {
    kind: "token bucket",
    rate: 30, // 30 tasks per minute
    period: MINUTE,
    capacity: 5, // Allow burst of 5
  },
  updateTask: {
    kind: "token bucket",
    rate: 60, // 60 updates per minute
    period: MINUTE,
    capacity: 10,
  },
  deleteTask: {
    kind: "token bucket",
    rate: 30, // 30 deletes per minute
    period: MINUTE,
    capacity: 5,
  },

  // Label Operations
  createLabel: {
    kind: "token bucket",
    rate: 20, // 20 labels per minute
    period: MINUTE,
    capacity: 3,
  },
  updateLabel: {
    kind: "token bucket",
    rate: 30,
    period: MINUTE,
    capacity: 5,
  },
  deleteLabel: {
    kind: "token bucket",
    rate: 20,
    period: MINUTE,
    capacity: 3,
  },

  // Task-Label Associations
  addLabelToTask: {
    kind: "token bucket",
    rate: 50, // 50 associations per minute
    period: MINUTE,
    capacity: 10,
  },
  removeLabelFromTask: {
    kind: "token bucket",
    rate: 50,
    period: MINUTE,
    capacity: 10,
  },

  // Comment Operations
  createComment: {
    kind: "token bucket",
    rate: 30, // 30 comments per minute
    period: MINUTE,
    capacity: 5,
  },
  deleteComment: {
    kind: "token bucket",
    rate: 30,
    period: MINUTE,
    capacity: 5,
  },

  // User Preferences
  updatePreferences: {
    kind: "token bucket",
    rate: 20, // 20 preference updates per minute
    period: MINUTE,
    capacity: 5,
  },

  // AI Chat Operations (more restrictive due to cost)
  createThread: {
    kind: "token bucket",
    rate: 10, // 10 threads per hour
    period: HOUR,
    capacity: 2,
  },
  sendMessage: {
    kind: "token bucket",
    rate: 30, // 30 messages per hour
    period: HOUR,
    capacity: 5,
  },
  deleteThread: {
    kind: "token bucket",
    rate: 20,
    period: MINUTE,
    capacity: 3,
  },
});
