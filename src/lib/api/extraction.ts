/**
 * Extraction Service
 * Handles AI-powered extraction of ideas from questionnaire responses
 * Uses service role authentication to bypass RLS and create ideas for intended owners
 */

import { createClient } from "@supabase/supabase-js";
import { extractIdeasFromResponse } from "@/lib/ai/extract";
import {
  getResponse,
  updateExtractionStatus,
  linkIdeaToResponse,
} from "./responses";
import { getQuestionnaire } from "./questionnaires";
import type { DbIdea } from "@/types/database";
import type { ExtractedIdea } from "@/types/questionnaire";

/**
 * Create a Supabase client with service role privileges
 * This bypasses RLS and is used for server-side operations only
 * NEVER expose service role key to client!
 */
function getServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase service role credentials");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Convert AI-extracted idea to database insert format
 */
function extractedIdeaToDbInsert(
  extracted: ExtractedIdea,
  questionnaireOwnerId: string,
  responseId: string
): Omit<DbIdea, "id" | "created_at" | "updated_at"> {
  return {
    user_id: questionnaireOwnerId, // Will be ignored, using intended_owner_id instead
    intended_owner_id: questionnaireOwnerId, // Form creator sees this idea
    source_type: "questionnaire",
    source_id: responseId,

    title: extracted.title,
    description: extracted.description,
    status: "new",

    pain_points: extracted.pain_points ?? null,
    desired_outcome: extracted.desired_outcome ?? null,
    frequency: extracted.frequency ?? null,
    time_spent: extracted.time_spent ?? null,
    owner: extracted.owner ?? null,

    // Default values
    archived: false,
    position: 0,
    owner_id: null,
    team_id: null,
    effort_estimate: null,
    horizon: null,
    started_at: null,
    completed_at: null,
    content_type: null,

    // RICE scoring fields (null for extracted ideas)
    rice_reach: null,
    rice_impact: null,
    rice_confidence: null,
    rice_effort: null,
    rice_score: null,
  };
}

/**
 * Extract ideas from a questionnaire response using AI
 * Creates ideas in the database and links them to the response
 *
 * @param responseId - The questionnaire response to extract ideas from
 * @returns Array of created ideas with their extraction confidence scores
 *
 * Process:
 * 1. Mark response as "processing"
 * 2. Fetch response and questionnaire data
 * 3. Call AI to extract ideas
 * 4. Create ideas using service role (bypassing RLS)
 * 5. Link ideas to response via junction table
 * 6. Mark response as "complete" or "failed"
 */
export async function processExtraction(
  responseId: string
): Promise<Array<DbIdea & { extraction_confidence: number }>> {
  try {
    // Step 1: Mark as processing
    await updateExtractionStatus(responseId, "processing");

    // Step 2: Fetch response and questionnaire
    const response = await getResponse(responseId);
    if (!response) {
      throw new Error("Response not found");
    }

    const questionnaire = await getQuestionnaire(response.questionnaire_id);
    if (!questionnaire) {
      throw new Error("Questionnaire not found");
    }

    // Step 3: Extract ideas using AI
    const extractedIdeas = await extractIdeasFromResponse(response);

    if (extractedIdeas.length === 0) {
      // No ideas extracted - mark as complete with 0 ideas
      await updateExtractionStatus(responseId, "complete", {
        ideasExtracted: 0,
      });
      return [];
    }

    // Step 4: Create ideas using service role
    const serviceSupabase = getServiceRoleClient();
    const createdIdeas: Array<DbIdea & { extraction_confidence: number }> = [];

    for (const extractedIdea of extractedIdeas) {
      const ideaData = extractedIdeaToDbInsert(
        extractedIdea,
        questionnaire.user_id,
        responseId
      );

      // Insert using service role (bypasses RLS)
      const { data, error } = await serviceSupabase
        .from("ideas")
        .insert(ideaData)
        .select()
        .single();

      if (error) {
        console.error("Failed to create extracted idea:", error);
        throw new Error(`Failed to create idea: ${error.message}`);
      }

      const createdIdea = data as DbIdea;

      // Step 5: Link idea to response
      await linkIdeaToResponse(
        responseId,
        createdIdea.id,
        extractedIdea.confidence
      );

      createdIdeas.push({
        ...createdIdea,
        extraction_confidence: extractedIdea.confidence,
      });
    }

    // Step 6: Mark as complete
    await updateExtractionStatus(responseId, "complete", {
      ideasExtracted: createdIdeas.length,
    });

    return createdIdeas;
  } catch (error) {
    // Mark as failed with error message
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    await updateExtractionStatus(responseId, "failed", {
      error: errorMessage,
    });

    throw error;
  }
}

/**
 * Batch process pending extractions
 * Useful for scheduled jobs or manual trigger for multiple responses
 *
 * @param limit - Maximum number of responses to process in this batch
 * @returns Number of successfully processed responses
 */
export async function processBatchExtractions(limit: number = 10): Promise<number> {
  const { getPendingExtractions } = await import("./responses");
  const pendingResponses = await getPendingExtractions(limit);

  let successCount = 0;

  for (const response of pendingResponses) {
    try {
      await processExtraction(response.id);
      successCount++;
    } catch (error) {
      console.error(`Failed to process extraction for response ${response.id}:`, error);
      // Continue with next response even if this one fails
    }
  }

  return successCount;
}
