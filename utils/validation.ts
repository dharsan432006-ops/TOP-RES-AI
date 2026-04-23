// Utility functions for input validation and sanitization

/**
 * Sanitizes user input by trimming whitespace and removing potentially harmful characters
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';

  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .slice(0, 1000); // Limit length to prevent abuse
}

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates that a string contains only alphanumeric characters and spaces
 */
export function isAlphanumeric(input: string): boolean {
  const alphanumericRegex = /^[a-zA-Z0-9\s]+$/;
  return alphanumericRegex.test(input);
}

/**
 * Sanitizes candidate names (allows letters, spaces, hyphens, apostrophes)
 */
export function sanitizeCandidateName(name: string): string {
  if (typeof name !== 'string') return '';

  return name
    .trim()
    .replace(/[^a-zA-Z\s\-']/g, '') // Only allow letters, spaces, hyphens, apostrophes
    .slice(0, 100); // Reasonable length limit
}