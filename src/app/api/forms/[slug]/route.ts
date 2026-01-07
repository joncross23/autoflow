import { NextRequest, NextResponse } from "next/server";
import { getQuestionnaireBySlug } from "@/lib/api/questionnaires";
import { checkRateLimit, formViewRatelimit } from "@/lib/ratelimit";

/**
 * GET /api/forms/[slug]
 * Fetch an active questionnaire by slug (public endpoint, no auth required)
 *
 * Rate limit: 60 requests per minute per IP
 *
 * Returns:
 * - 200: Questionnaire data
 * - 404: Questionnaire not found or inactive
 * - 429: Rate limit exceeded
 * - 500: Server error
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Check rate limit (60/min per IP)
    const { success, limit, remaining, reset } = await checkRateLimit(
      formViewRatelimit,
      request
    );

    if (!success) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Please try again later.",
          limit,
          remaining: 0,
          reset,
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": String(limit),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(reset),
          },
        }
      );
    }

    const { slug } = await params;

    // Fetch questionnaire (only returns if active)
    const questionnaire = await getQuestionnaireBySlug(slug);

    if (!questionnaire) {
      return NextResponse.json(
        { error: "Questionnaire not found or inactive" },
        { status: 404 }
      );
    }

    // Return questionnaire with rate limit headers
    return NextResponse.json(questionnaire, {
      status: 200,
      headers: {
        "X-RateLimit-Limit": String(limit),
        "X-RateLimit-Remaining": String(remaining),
        "X-RateLimit-Reset": String(reset),
      },
    });
  } catch (error) {
    console.error("Error fetching questionnaire:", error);
    return NextResponse.json(
      { error: "Failed to fetch questionnaire" },
      { status: 500 }
    );
  }
}
