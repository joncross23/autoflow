import { createClient } from "@/lib/supabase/server";
import type { DbQuestionnaire } from "@/types/questionnaire";
import { QuestionnaireInsertSchema, QuestionnaireUpdateSchema } from "@/types/questionnaire";

/**
 * Get all questionnaires for the authenticated user
 * Ordered by updated_at DESC (most recently updated first)
 */
export async function getQuestionnaires(): Promise<DbQuestionnaire[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("questionnaires")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch questionnaires:", error);
    throw new Error(`Failed to fetch questionnaires: ${error.message}`);
  }

  return data as DbQuestionnaire[];
}

/**
 * Get a single questionnaire by ID
 * Only returns if user owns the questionnaire (RLS enforced)
 */
export async function getQuestionnaire(id: string): Promise<DbQuestionnaire | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("questionnaires")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // Not found or no access
      return null;
    }
    console.error("Failed to fetch questionnaire:", error);
    throw new Error(`Failed to fetch questionnaire: ${error.message}`);
  }

  return data as DbQuestionnaire;
}

/**
 * Get a questionnaire by slug (public access if active)
 * Does NOT require authentication for active questionnaires
 */
export async function getQuestionnaireBySlug(slug: string): Promise<DbQuestionnaire | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("questionnaires")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // Not found or not active
      return null;
    }
    console.error("Failed to fetch questionnaire by slug:", error);
    throw new Error(`Failed to fetch questionnaire: ${error.message}`);
  }

  return data as DbQuestionnaire;
}

/**
 * Create a new questionnaire
 * Requires authentication (user_id set automatically by RLS)
 */
export async function createQuestionnaire(
  data: {
    title: string;
    description?: string | null;
    slug: string;
    questions: DbQuestionnaire["questions"];
    is_active: boolean;
    auto_extract: boolean;
  }
): Promise<DbQuestionnaire> {
  const supabase = await createClient();

  // Validate input
  const validated = QuestionnaireInsertSchema.parse(data);

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Authentication required");
  }

  const { data: questionnaire, error } = await supabase
    .from("questionnaires")
    .insert({
      user_id: user.id,
      title: validated.title,
      description: validated.description ?? null,
      slug: validated.slug,
      questions: validated.questions,
      is_active: validated.is_active,
      auto_extract: validated.auto_extract,
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to create questionnaire:", error);

    // Handle unique constraint violation on slug
    if (error.code === "23505") {
      throw new Error("A questionnaire with this slug already exists");
    }

    throw new Error(`Failed to create questionnaire: ${error.message}`);
  }

  return questionnaire as DbQuestionnaire;
}

/**
 * Update an existing questionnaire
 * Only allows updates if user owns the questionnaire (RLS enforced)
 */
export async function updateQuestionnaire(
  id: string,
  updates: Partial<Omit<DbQuestionnaire, "id" | "user_id" | "response_count" | "last_response_at" | "created_at" | "updated_at">>
): Promise<DbQuestionnaire> {
  const supabase = await createClient();

  // Validate input
  const validated = QuestionnaireUpdateSchema.parse(updates);

  const { data, error } = await supabase
    .from("questionnaires")
    .update(validated)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Failed to update questionnaire:", error);

    // Handle unique constraint violation on slug
    if (error.code === "23505") {
      throw new Error("A questionnaire with this slug already exists");
    }

    throw new Error(`Failed to update questionnaire: ${error.message}`);
  }

  return data as DbQuestionnaire;
}

/**
 * Delete a questionnaire
 * Only allows deletion if user owns the questionnaire (RLS enforced)
 * Note: ON DELETE RESTRICT on responses prevents deletion if responses exist
 */
export async function deleteQuestionnaire(id: string): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("questionnaires")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Failed to delete questionnaire:", error);

    // Handle foreign key constraint (responses exist)
    if (error.code === "23503") {
      throw new Error("Cannot delete questionnaire with existing responses");
    }

    throw new Error(`Failed to delete questionnaire: ${error.message}`);
  }

  return true;
}

/**
 * Duplicate an existing questionnaire
 * Creates a new questionnaire with same questions but new slug
 */
export async function duplicateQuestionnaire(
  id: string,
  newTitle: string,
  newSlug: string
): Promise<DbQuestionnaire> {
  const supabase = await createClient();

  // Get original questionnaire
  const original = await getQuestionnaire(id);
  if (!original) {
    throw new Error("Questionnaire not found");
  }

  // Create duplicate with new title and slug
  return createQuestionnaire({
    title: newTitle,
    description: original.description,
    slug: newSlug,
    questions: original.questions,
    is_active: false, // Start as inactive
    auto_extract: original.auto_extract,
  });
}

/**
 * Validate that a slug is available (not already in use)
 */
export async function validateSlug(slug: string): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("questionnaires")
    .select("id")
    .eq("slug", slug)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Failed to validate slug:", error);
    throw new Error(`Failed to validate slug: ${error.message}`);
  }

  // Slug is available if no data returned
  return !data;
}
