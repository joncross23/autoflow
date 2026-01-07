import { createClient } from "@/lib/supabase/server";
import type { DbQuestionnaireResponse, DbResponseIdea } from "@/types/questionnaire";
import type { DbIdea } from "@/types/database";
import { QuestionnaireSubmissionSchema } from "@/types/questionnaire";

/**
 * Get all responses for a specific questionnaire
 * Only returns if user owns the questionnaire (RLS enforced)
 * Ordered by submitted_at DESC (most recent first)
 */
export async function getResponsesForQuestionnaire(
  questionnaireId: string
): Promise<DbQuestionnaireResponse[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("questionnaire_responses")
    .select("*")
    .eq("questionnaire_id", questionnaireId)
    .order("submitted_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch responses:", error);
    throw new Error(`Failed to fetch responses: ${error.message}`);
  }

  return data as DbQuestionnaireResponse[];
}

/**
 * Get a single response by ID
 * Only returns if user owns the parent questionnaire (RLS enforced)
 */
export async function getResponse(id: string): Promise<DbQuestionnaireResponse | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("questionnaire_responses")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // Not found or no access
      return null;
    }
    console.error("Failed to fetch response:", error);
    throw new Error(`Failed to fetch response: ${error.message}`);
  }

  return data as DbQuestionnaireResponse;
}

/**
 * Create a new response (public endpoint - no authentication required)
 *
 * IMPORTANT: This uses a public Supabase client without authentication
 * RLS policy "Anyone can submit responses" allows INSERT without auth
 */
export async function createResponse(
  questionnaireId: string,
  questionsSnapshot: DbQuestionnaireResponse["questions_snapshot"],
  answers: Record<string, string | number>,
  metadata?: {
    respondent_email?: string;
    respondent_name?: string;
  }
): Promise<DbQuestionnaireResponse> {
  const supabase = await createClient();

  // Validate input
  const validated = QuestionnaireSubmissionSchema.parse({
    answers,
    respondent_email: metadata?.respondent_email,
    respondent_name: metadata?.respondent_name,
  });

  const { data, error } = await supabase
    .from("questionnaire_responses")
    .insert({
      questionnaire_id: questionnaireId,
      questions_snapshot: questionsSnapshot,
      answers: validated.answers,
      respondent_email: validated.respondent_email ?? null,
      respondent_name: validated.respondent_name ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to create response:", error);
    throw new Error(`Failed to create response: ${error.message}`);
  }

  return data as DbQuestionnaireResponse;
}

/**
 * Update extraction status for a response
 * Used internally by extraction process
 */
export async function updateExtractionStatus(
  responseId: string,
  status: DbQuestionnaireResponse["extraction_status"],
  options?: {
    error?: string;
    ideasExtracted?: number;
  }
): Promise<void> {
  const supabase = await createClient();

  const updateData: Record<string, unknown> = {
    extraction_status: status,
  };

  if (status === "processing") {
    updateData.processing_started_at = new Date().toISOString();
  }

  if (status === "complete") {
    updateData.extracted_at = new Date().toISOString();
    updateData.ideas_extracted = options?.ideasExtracted ?? 0;
  }

  if (status === "failed" && options?.error) {
    updateData.extraction_error = options.error;
  }

  const { error } = await supabase
    .from("questionnaire_responses")
    .update(updateData)
    .eq("id", responseId);

  if (error) {
    console.error("Failed to update extraction status:", error);
    throw new Error(`Failed to update extraction status: ${error.message}`);
  }
}

/**
 * Get ideas that were extracted from a specific response
 * Returns ideas with extraction confidence scores
 */
export async function getExtractedIdeas(responseId: string): Promise<Array<DbIdea & { extraction_confidence: number }>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("response_ideas")
    .select(`
      extraction_confidence,
      ideas (*)
    `)
    .eq("response_id", responseId);

  if (error) {
    console.error("Failed to fetch extracted ideas:", error);
    throw new Error(`Failed to fetch extracted ideas: ${error.message}`);
  }

  // Flatten the nested structure
  return data.map((item: any) => ({
    ...item.ideas,
    extraction_confidence: item.extraction_confidence,
  })) as Array<DbIdea & { extraction_confidence: number }>;
}

/**
 * Link an idea to a response (junction table operation)
 * Used after creating ideas during extraction process
 */
export async function linkIdeaToResponse(
  responseId: string,
  ideaId: string,
  confidence: number
): Promise<DbResponseIdea> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("response_ideas")
    .insert({
      response_id: responseId,
      idea_id: ideaId,
      extraction_confidence: confidence,
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to link idea to response:", error);
    throw new Error(`Failed to link idea to response: ${error.message}`);
  }

  return data as DbResponseIdea;
}

/**
 * Get responses with pending extraction status
 * Used for batch processing queue
 */
export async function getPendingExtractions(limit: number = 10): Promise<DbQuestionnaireResponse[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("questionnaire_responses")
    .select("*")
    .eq("extraction_status", "pending")
    .order("submitted_at", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("Failed to fetch pending extractions:", error);
    throw new Error(`Failed to fetch pending extractions: ${error.message}`);
  }

  return data as DbQuestionnaireResponse[];
}
