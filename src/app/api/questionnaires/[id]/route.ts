import { NextRequest, NextResponse } from "next/server";
import {
  getQuestionnaire,
  updateQuestionnaire,
  deleteQuestionnaire,
} from "@/lib/api/questionnaires";
import { QuestionnaireUpdateSchema } from "@/types/questionnaire";
import { ZodError } from "zod";

/**
 * GET /api/questionnaires/[id]
 * Get a single questionnaire with full details
 *
 * Returns:
 * - 200: Questionnaire data
 * - 401: Not authenticated
 * - 404: Questionnaire not found or access denied
 * - 500: Server error
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const questionnaire = await getQuestionnaire(id);

    if (!questionnaire) {
      return NextResponse.json(
        { error: "Questionnaire not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(questionnaire, { status: 200 });
  } catch (error) {
    console.error("Error fetching questionnaire:", error);
    return NextResponse.json(
      { error: "Failed to fetch questionnaire" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/questionnaires/[id]
 * Update an existing questionnaire
 *
 * Request body: Partial questionnaire data
 *
 * Returns:
 * - 200: Updated questionnaire
 * - 400: Validation error or duplicate slug
 * - 401: Not authenticated
 * - 404: Questionnaire not found or access denied
 * - 500: Server error
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate request body
    let validated;
    try {
      validated = QuestionnaireUpdateSchema.parse(body);
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

    // Update questionnaire
    const questionnaire = await updateQuestionnaire(id, validated);

    return NextResponse.json(questionnaire, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("slug already exists")) {
        return NextResponse.json(
          { error: "A questionnaire with this slug already exists" },
          { status: 400 }
        );
      }
    }

    console.error("Error updating questionnaire:", error);
    return NextResponse.json(
      { error: "Failed to update questionnaire" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/questionnaires/[id]
 * Delete a questionnaire
 *
 * Note: Will fail if responses exist (database constraint)
 *
 * Returns:
 * - 204: Deleted successfully
 * - 400: Cannot delete (responses exist)
 * - 401: Not authenticated
 * - 404: Questionnaire not found or access denied
 * - 500: Server error
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteQuestionnaire(id);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("Cannot delete questionnaire with existing responses")) {
        return NextResponse.json(
          {
            error: "Cannot delete questionnaire with existing responses",
            suggestion: "Archive the questionnaire instead or delete responses first",
          },
          { status: 400 }
        );
      }
    }

    console.error("Error deleting questionnaire:", error);
    return NextResponse.json(
      { error: "Failed to delete questionnaire" },
      { status: 500 }
    );
  }
}
