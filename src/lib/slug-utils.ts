/**
 * Utility functions for slugifying titles and user inputs for URL safety.
 * Supports Persian/Arabic letters, Latin characters, numbers, and hyphens.
 * Automatically converts spaces, underscores, and slashes to hyphens (-).
 */
export function formatToSlug(input: string): string {
  if (!input) return '';
  return input
    .toLowerCase()
    // Replace any whitespace, tabs, underscores, or slashes with hyphens
    .replace(/[\s_/\\]+/g, '-')
    // Allow Persian/Arabic unicode (\u0600-\u06FF), english letters (a-z), digits (0-9), and hyphens (-)
    .replace(/[^\u0600-\u06FFa-z0-9-]/g, '')
    // Collapse consecutive hyphens into a single hyphen
    .replace(/-+/g, '-');
}

/**
 * Clean slug for database submission (strips leading and trailing hyphens).
 */
export function cleanSlugForSubmit(input: string, fallbackPrefix = 'proc'): string {
  const formatted = formatToSlug(input).replace(/^-+|-+$/g, '');
  return formatted || `${fallbackPrefix}-${Date.now()}`;
}
