/**
 * Security Sanitisation Utilities
 *
 * Provides functions to sanitise user input for safe use in:
 * - SQL/ILIKE queries (preventing SQL injection)
 * - AI prompts (preventing prompt injection)
 */

// ============================================
// SQL/ILIKE Escaping
// ============================================

/**
 * Escape special characters for safe use in ILIKE patterns.
 * Prevents SQL injection by escaping wildcards and escape characters.
 *
 * Characters escaped:
 * - % (matches any sequence of characters in ILIKE)
 * - _ (matches any single character in ILIKE)
 * - \ (escape character itself)
 *
 * @param input - The raw user input to escape
 * @returns The escaped string safe for use in ILIKE patterns
 */
export function escapeIlikePattern(input: string): string {
  if (!input) return "";

  return input
    // Escape backslash first (must be done before escaping other chars)
    .replace(/\\/g, "\\\\")
    // Escape percent sign (multi-character wildcard)
    .replace(/%/g, "\\%")
    // Escape underscore (single-character wildcard)
    .replace(/_/g, "\\_");
}

/**
 * Escape special characters for safe use in PostgreSQL text matching.
 * This is a broader escape that handles more edge cases.
 *
 * @param input - The raw user input to escape
 * @returns The escaped string
 */
export function escapePostgresText(input: string): string {
  if (!input) return "";

  return input
    // Escape backslash first
    .replace(/\\/g, "\\\\")
    // Escape single quotes (though parameterised queries handle this)
    .replace(/'/g, "''")
    // Escape ILIKE wildcards
    .replace(/%/g, "\\%")
    .replace(/_/g, "\\_");
}

// ============================================
// Prompt Injection Prevention
// ============================================

/**
 * Patterns that may indicate prompt injection attempts.
 * These are used for detection/logging, not removal.
 */
const SUSPICIOUS_PATTERNS = [
  /ignore\s+(previous|all|above)\s+instructions?/gi,
  /disregard\s+(previous|all|above)/gi,
  /forget\s+(everything|all|previous)/gi,
  /you\s+are\s+now\s+a/gi,
  /new\s+instructions?:/gi,
  /system\s*prompt/gi,
  /\[INST\]/gi,
  /\[\/INST\]/gi,
  /<\|im_start\|>/gi,
  /<\|im_end\|>/gi,
  /<<SYS>>/gi,
  /<\/SYS>/gi,
];

/**
 * Characters that should be escaped or removed from user content
 * to prevent breaking out of XML-style delimiters.
 */
const DELIMITER_CHARS: Record<string, string> = {
  "<": "&lt;",
  ">": "&gt;",
  "&": "&amp;",
};

/**
 * Escape characters that could break XML-style delimiters in prompts.
 *
 * @param input - The raw user input
 * @returns The escaped string
 */
function escapeDelimiterChars(input: string): string {
  if (!input) return "";

  let result = input;
  for (const [char, replacement] of Object.entries(DELIMITER_CHARS)) {
    result = result.split(char).join(replacement);
  }
  return result;
}

/**
 * Check if user input contains suspicious prompt injection patterns.
 * This is for logging/monitoring purposes.
 *
 * @param input - The user input to check
 * @returns True if suspicious patterns are detected
 */
export function containsSuspiciousPatterns(input: string): boolean {
  if (!input) return false;

  return SUSPICIOUS_PATTERNS.some((pattern) => pattern.test(input));
}

/**
 * Sanitise user content for safe inclusion in AI prompts.
 *
 * This function:
 * 1. Escapes XML-like characters to prevent delimiter breaking
 * 2. Trims excessive whitespace
 * 3. Limits length to prevent prompt stuffing
 *
 * @param input - The raw user input
 * @param maxLength - Maximum allowed length (default: 10000)
 * @returns The sanitised string
 */
export function sanitiseForPrompt(input: string, maxLength = 10000): string {
  if (!input) return "";

  // Trim and limit length
  let sanitised = input.trim();

  if (sanitised.length > maxLength) {
    sanitised = sanitised.slice(0, maxLength) + "... [truncated]";
  }

  // Escape delimiter characters
  sanitised = escapeDelimiterChars(sanitised);

  // Normalise excessive whitespace (but preserve paragraph structure)
  sanitised = sanitised
    .replace(/[ \t]+/g, " ") // Collapse horizontal whitespace
    .replace(/\n{3,}/g, "\n\n"); // Limit consecutive newlines

  return sanitised;
}

/**
 * Wrap user content in XML-style delimiters for clear boundaries.
 * Combined with the system prompt instruction, this helps prevent
 * prompt injection by clearly marking user data as data.
 *
 * @param tagName - The tag name to use (e.g., "user_title")
 * @param content - The user content to wrap
 * @param maxLength - Maximum content length (default: 10000)
 * @returns The wrapped and sanitised content
 */
export function wrapInDelimiter(
  tagName: string,
  content: string | null | undefined,
  maxLength = 10000
): string {
  const sanitised = sanitiseForPrompt(content || "", maxLength);
  return `<${tagName}>${sanitised}</${tagName}>`;
}

/**
 * Log a security warning if suspicious patterns are detected.
 * Does not block the request, just logs for monitoring.
 *
 * @param context - Description of where this check is occurring
 * @param input - The user input being checked
 */
export function logIfSuspicious(context: string, input: string): void {
  if (containsSuspiciousPatterns(input)) {
    console.warn(
      `[SECURITY] Suspicious prompt pattern detected in ${context}:`,
      {
        timestamp: new Date().toISOString(),
        context,
        inputLength: input.length,
        // Do not log the actual content for privacy
      }
    );
  }
}
