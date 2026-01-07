import { NextRequest, NextResponse } from "next/server";
import { getQuestionnaires, createQuestionnaire } from "@/lib/api/questionnaires";
import { QuestionnaireInsertSchema } from "@/types/questionnaire";
import { ZodError } from "zod";

/**
 * GET /api/questionnaires
 * List all questionnaires for authenticated user
 *
 * Returns:
 * - 200: Array of questionnaires
 * - 401: Not authenticated
 * - 500: Server error
 */
export async function GET() {
  try {
    const questionnaires = await getQuestionnaires();
    return NextResponse.json(questionnaires, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    console.error("Error fetching questionnaires:", error);
    return NextResponse.json(
      { error: "Failed to fetch questionnaires" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/questionnaires
 * Create a new questionnaire
 *
 * Request body:
 * {
 *   title: string,
 *   description?: string,
 *   slug: string,
 *   questions: Question[],
 *   is_active?: boolean,
 *   auto_extract?: boolean
 * }
 *
 * Returns:
 * - 201: Created questionnaire
 * - 400: Validation error or duplicate slug
 * - 401: Not authenticated
 * - 500: Server error
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    let validated;
    try {
      validated = QuestionnaireInsertSchema.parse(body);
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

    // Create questionnaire
    const questionnaire = await createQuestionnaire(validated);

    return NextResponse.json(questionnaire, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Authentication required") {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      }

      if (error.message.includes("slug already exists")) {
        return NextResponse.json(
          { error: "A questionnaire with this slug already exists" },
          { status: 400 }
        );
      }
    }

    console.error("Error creating questionnaire:", error);
    return NextResponse.json(
      { error: "Failed to create questionnaire" },
      { status: 500 }
    );
  }
}
