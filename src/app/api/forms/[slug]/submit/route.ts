import { NextRequest, NextResponse } from "next/server";
import { getQuestionnaireBySlug } from "@/lib/api/questionnaires";
import { createResponse } from "@/lib/api/responses";
import { processExtraction } from "@/lib/api/extraction";
import { checkRateLimit, formSubmitRatelimit } from "@/lib/ratelimit";
import { QuestionnaireSubmissionSchema } from "@/types/questionnaire";
import { ZodError } from "zod";

/**
 * POST /api/forms/[slug]/submit
 * Submit a questionnaire response (public endpoint, no auth required)
 *
 * Rate limit: 5 requests per hour per IP
 *
 * Request body:
 * {
 *   answers: Record<string, string | number>,
 *   respondent_email?: string,
 *   respondent_name?: string
 * }
 *
 * Returns:
 * - 201: Response created successfully
 * - 400: Validation error or questionnaire inactive
 * - 404: Questionnaire not found
 * - 429: Rate limit exceeded
 * - 500: Server error
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Check rate limit (5/hour per IP)
    const { success, limit, remaining, reset } = await checkRateLimit(
      formSubmitRatelimit,
      request
    );

    if (!success) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded. You can submit 5 responses per hour.",
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

    // Parse and validate request body
    const body = await request.json();

    let validated;
    try {
      validated = QuestionnaireSubmissionSchema.parse(body);
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json(
          {
            error: "Validation error",
            details: error.errors.map((e) => ({
              path: e.path.join("."),
              message: e.message,
            })),
          },
          { status: 400 }
        );
      }
      throw error;
    }

    // Validate that all required questions are answered
    const requiredQuestions = questionnaire.questions.filter((q) => q.required);
    const missingAnswers = requiredQuestions.filter(
      (q) => !validated.answers[q.id] || validated.answers[q.id] === ""
    );

    if (missingAnswers.length > 0) {
      return NextResponse.json(
        {
          error: "Missing required answers",
          details: missingAnswers.map((q) => ({
            questionId: q.id,
            label: q.label,
          })),
        },
        { status: 400 }
      );
    }

    // Create response with questions snapshot
    const response = await createResponse(
      questionnaire.id,
      questionnaire.questions, // Snapshot questions at submission time
      validated.answers,
      {
        respondent_email: validated.respondent_email ?? undefined,
        respondent_name: validated.respondent_name ?? undefined,
      }
    );

    // If auto-extract is enabled, trigger extraction asynchronously
    // Don't wait for completion to return success response
    if (questionnaire.auto_extract) {
      // Fire and forget - extraction runs in background
      processExtraction(response.id).catch((error) => {
        console.error("Background extraction failed:", error);
      });
    }

    // Return success with response ID
    return NextResponse.json(
      {
        success: true,
        responseId: response.id,
        message: "Thank you for your submission",
        extractionQueued: questionnaire.auto_extract,
      },
      {
        status: 201,
        headers: {
          "X-RateLimit-Limit": String(limit),
          "X-RateLimit-Remaining": String(remaining),
          "X-RateLimit-Reset": String(reset),
        },
      }
    );
  } catch (error) {
    console.error("Error submitting response:", error);
    return NextResponse.json(
      {
        error: "Failed to submit response",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
