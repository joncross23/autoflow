import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const reorderSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().uuid(),
      position: z.number().int().min(0),
    })
  ).min(1),
});

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = reorderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { items } = parsed.data;

    // Update positions (RLS ensures user can only update their own ideas)
    const updates = items.map(({ id, position }) =>
      supabase
        .from("ideas")
        .update({ position, updated_at: new Date().toISOString() })
        .eq("id", id)
    );

    const results = await Promise.all(updates);

    const firstError = results.find((r) => r.error);
    if (firstError?.error) {
      return NextResponse.json(
        { error: firstError.error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reorder error:", error);
    return NextResponse.json(
      { error: "Failed to reorder ideas" },
      { status: 500 }
    );
  }
}
