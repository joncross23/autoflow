import { NextRequest, NextResponse } from "next/server";
import { getResponse } from "@/lib/api/responses";
import { processExtraction } from "@/lib/api/extraction";

/**
 * POST /api/responses/[id]/extract
 * Manually trigger AI extraction for a response
 *
 * Only accessible to questionnaire owner (RLS enforced on getResponse)
 *
 * Returns:
 * - 200: Extraction completed successfully
 * - 400: Response already processed or processing
 * - 401: Not authenticated
 * - 403: Access denied (not questionnaire owner)
 * - 404: Response not found
 * - 500: Server error or extraction failed
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verify response exists and user has access
    const response = await getResponse(id);

    if (!response) {
      return NextResponse.json(
        { error: "Response not found or access denied" },
        { status: 404 }
      );
    }

    // Check if already processed or processing
    if (response.extraction_status === "complete") {
      return NextResponse.json(
        {
          error: "Response already processed",
          extractedIdeas: response.ideas_extracted,
          extractedAt: response.extracted_at,
        },
        { status: 400 }
      );
    }

    if (response.extraction_status === "processing") {
      return NextResponse.json(
        {
          error: "Extraction already in progress",
          processingStartedAt: response.processing_started_at,
        },
        { status: 400 }
      );
    }

    // Trigger extraction
    const extractedIdeas = await processExtraction(id);

    return NextResponse.json(
      {
        success: true,
        responseId: id,
        ideasExtracted: extractedIdeas.length,
        ideas: extractedIdeas.map((idea) => ({
          id: idea.id,
          title: idea.title,
          confidence: idea.extraction_confidence,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error triggering extraction:", error);
    return NextResponse.json(
      {
        error: "Failed to extract ideas",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
