/**
 * Validation Helpers
 *
 * Pure functions for input validation.
 * NO database access, NO ctx parameter.
 */

/**
 * Validate task title
 */
export function isValidTaskTitle(title: string): boolean {
  return title.trim().length > 0 && title.trim().length <= 200;
}

/**
 * Validate task description
 */
export function isValidTaskDescription(description: string | undefined): boolean {
  if (!description) return true; // Optional field
  return description.length <= 2000;
}

/**
 * Validate label name
 */
export function isValidLabelName(name: string): boolean {
  return name.trim().length > 0 && name.trim().length <= 50;
}

/**
 * Validate hex color code
 */
export function isValidHexColor(color: string): boolean {
  const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexPattern.test(color);
}

/**
 * Validate due date (must be in the future or undefined)
 */
export function isValidDueDate(dueDate: number | undefined): boolean {
  if (!dueDate) return true; // Optional field
  return dueDate > Date.now();
}

/**
 * Validate message content
 */
export function isValidMessageContent(content: string): boolean {
  return content.trim().length > 0 && content.trim().length <= 10000;
}

/**
 * Validate comment content
 */
export function isValidCommentContent(content: string): boolean {
  return content.trim().length > 0 && content.trim().length <= 5000;
}

/**
 * Validate thread title
 */
export function isValidThreadTitle(title: string | undefined): boolean {
  if (!title) return true; // Optional field
  return title.trim().length > 0 && title.trim().length <= 200;
}

/**
 * Sanitize string input (trim whitespace)
 */
export function sanitizeString(input: string): string {
  return input.trim();
}
