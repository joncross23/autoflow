import { createClient } from "@/lib/supabase/client";
import type { DbAiEvaluation } from "@/types/database";

function transformEvaluation(data: Record<string, unknown>): DbAiEvaluation {
  return {
    ...data,
    recommendations: Array.isArray(data.recommendations)
      ? data.recommendations
      : typeof data.recommendations === 'string'
        ? JSON.parse(data.recommendations)
        : [],
    risks: Array.isArray(data.risks)
      ? data.risks
      : typeof data.risks === 'string'
        ? JSON.parse(data.risks)
        : [],
  } as DbAiEvaluation;
}

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

  return (data || []).map(transformEvaluation);
}

export async function getLatestEvaluation(ideaId: string): Promise<DbAiEvaluation | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("ai_evaluations")
    .select("*")
    .eq("idea_id", ideaId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? transformEvaluation(data) : null;
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
