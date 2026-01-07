import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Check if Redis credentials are available
const hasRedisCredentials = !!(
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN
);

// Initialize Redis client from environment variables (if available)
const redis = hasRedisCredentials ? Redis.fromEnv() : null;

// Rate limiter for viewing public forms
// Limit: 60 requests per minute per IP
export const formViewRatelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(60, "1 m"),
      analytics: true,
      prefix: "ratelimit:form:view",
    })
  : null;

// Rate limiter for submitting form responses
// Limit: 5 submissions per hour per IP
export const formSubmitRatelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 h"),
      analytics: true,
      prefix: "ratelimit:form:submit",
    })
  : null;

// Rate limiter for AI assistance requests (future feature)
// Limit: 20 requests per hour per IP
export const formAiAssistRatelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, "1 h"),
      analytics: true,
      prefix: "ratelimit:form:ai-assist",
    })
  : null;

/**
 * Extract client IP address from Next.js request
 * Checks x-forwarded-for and x-real-ip headers
 * Falls back to 'unknown' if no IP found
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");

  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwarded.split(",")[0].trim();
  }

  return realIp || "unknown";
}

/**
 * Helper to check rate limit and return standardized response
 * Usage in API routes:
 *
 * const { success } = await checkRateLimit(formSubmitRatelimit, request);
 * if (!success) {
 *   return NextResponse.json(
 *     { error: 'Rate limit exceeded. Please try again later.' },
 *     { status: 429 }
 *   );
 * }
 *
 * If rate limiter is null (Redis not configured), returns success: true
 * This allows graceful degradation in development/test environments
 */
export async function checkRateLimit(
  ratelimiter: Ratelimit | null,
  request: Request
): Promise<{ success: boolean; limit?: number; remaining?: number; reset?: number }> {
  // If no rate limiter configured, always allow (dev/test mode)
  if (!ratelimiter) {
    return { success: true };
  }

  const ip = getClientIp(request);
  const { success, limit, remaining, reset } = await ratelimiter.limit(ip);

  return { success, limit, remaining, reset };
}
