import { createClient } from "@/lib/supabase/client";
import type { DbAiEvaluation } from "@/types/database";

export async function getEvaluationsForIdea(ideaId: string): Promise<DbAiEvaluation[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("ai_evaluations")
    .select("*")
    .eq("idea_id", ideaId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data as DbAiEvaluation[];
}

export async function getLatestEvaluation(ideaId: string): Promise<DbAiEvaluation | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("ai_evaluations")
    .select("*")
    .eq("idea_id", ideaId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No rows returned
      return null;
    }
    throw new Error(error.message);
  }

  return data as DbAiEvaluation;
}

export async function deleteEvaluation(id: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("ai_evaluations")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}
