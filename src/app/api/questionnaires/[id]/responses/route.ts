import { NextRequest, NextResponse } from "next/server";
import { getResponsesForQuestionnaire } from "@/lib/api/responses";

/**
 * GET /api/questionnaires/[id]/responses
 * List all responses for a specific questionnaire
 *
 * Only accessible to questionnaire owner (RLS enforced)
 *
 * Returns:
 * - 200: Array of responses
 * - 401: Not authenticated
 * - 403: Access denied (not questionnaire owner)
 * - 500: Server error
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const responses = await getResponsesForQuestionnaire(id);

    return NextResponse.json(responses, { status: 200 });
  } catch (error) {
    console.error("Error fetching responses:", error);
    return NextResponse.json(
      { error: "Failed to fetch responses" },
      { status: 500 }
    );
  }
}
