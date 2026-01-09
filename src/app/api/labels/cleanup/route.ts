/**
 * ONE-TIME CLEANUP ROUTE
 * Visit /api/labels/cleanup to reset your labels to 6 defaults
 * DELETE THIS FILE AFTER RUNNING ONCE
 */

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const DEFAULT_COLORS = [
  "#ef4444", // Red
  "#f97316", // Orange
  "#eab308", // Yellow
  "#22c55e", // Green
  "#3b82f6", // Blue
  "#06b6d4", // Cyan
];

export async function GET() {
  const supabase = await createClient();

  try {
    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get all current labels
    const { data: existingLabels, error: fetchError } = await supabase
      .from("labels")
      .select("*")
      .eq("user_id", user.id);

    if (fetchError) {
      return NextResponse.json(
        { error: `Failed to fetch labels: ${fetchError.message}` },
        { status: 500 }
      );
    }

    // Delete all existing labels (cascade will remove assignments)
    if (existingLabels && existingLabels.length > 0) {
      const { error: deleteError } = await supabase
        .from("labels")
        .delete()
        .eq("user_id", user.id);

      if (deleteError) {
        return NextResponse.json(
          { error: `Failed to delete labels: ${deleteError.message}` },
          { status: 500 }
        );
      }
    }

    // Create 6 default labels
    const defaultLabels = DEFAULT_COLORS.map((color) => ({
      user_id: user.id,
      name: "",
      color: color,
    }));

    const { data: newLabels, error: insertError } = await supabase
      .from("labels")
      .insert(defaultLabels)
      .select();

    if (insertError) {
      return NextResponse.json(
        { error: `Failed to create default labels: ${insertError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Labels reset successfully",
      deletedCount: existingLabels?.length || 0,
      newLabels: newLabels,
    });
  } catch (error) {
    console.error("Error in cleanup route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
