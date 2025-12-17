import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { evaluateIdea } from "@/lib/ai/evaluate";
import type { DbIdea } from "@/types/database";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch the idea (RLS ensures user can only access their own)
    const { data: idea, error: ideaError } = await supabase
      .from("ideas")
      .select("*")
      .eq("id", id)
      .single();

    if (ideaError || !idea) {
      return NextResponse.json({ error: "Idea not found" }, { status: 404 });
    }

    // Run AI evaluation
    const evaluation = await evaluateIdea(idea as DbIdea);

    // Store evaluation in database
    const { data: savedEvaluation, error: insertError } = await supabase
      .from("ai_evaluations")
      .insert({
        idea_id: id,
        complexity_score: evaluation.complexity_score,
        complexity_rationale: evaluation.complexity_rationale,
        roi_score: evaluation.roi_score,
        roi_rationale: evaluation.roi_rationale,
        time_saved_hours: evaluation.time_saved_hours,
        time_saved_rationale: evaluation.time_saved_rationale,
        recommendations: evaluation.recommendations,
        risks: evaluation.risks,
        overall_priority: evaluation.overall_priority,
        overall_summary: evaluation.overall_summary,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Failed to save evaluation:", insertError);
      return NextResponse.json(
        { error: "Failed to save evaluation" },
        { status: 500 }
      );
    }

    // Optionally update idea status to "evaluating"
    await supabase
      .from("ideas")
      .update({ status: "evaluating", updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("status", "new"); // Only update if still "new"

    return NextResponse.json({ evaluation: savedEvaluation });
  } catch (error) {
    console.error("Evaluation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Evaluation failed" },
      { status: 500 }
    );
  }
}
