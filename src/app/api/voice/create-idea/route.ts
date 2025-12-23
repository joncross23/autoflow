import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

function getAnthropicClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }
  return new Anthropic({ apiKey });
}

interface CreateIdeaResponse {
  title: string;
  description: string;
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    const body = await request.json();
    const { transcript } = body;

    if (!transcript || typeof transcript !== "string") {
      return NextResponse.json(
        { error: "Transcript is required" },
        { status: 400 }
      );
    }

    // Validate transcript length
    if (transcript.length < 5) {
      return NextResponse.json(
        { error: "Transcript too short to generate idea" },
        { status: 400 }
      );
    }

    if (transcript.length > 5000) {
      return NextResponse.json(
        { error: "Transcript too long. Please keep recordings under 2 minutes." },
        { status: 400 }
      );
    }

    // Call Claude API to generate structured idea
    const anthropic = getAnthropicClient();
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `You are helping capture an automation idea from spoken input. The user has spoken an idea that was transcribed.

Transcript: "${transcript}"

Based on this spoken idea, create a structured automation idea with:
1. A concise, action-oriented title (maximum 80 characters)
2. A clear description expanding on the idea (2-4 sentences)

Guidelines:
- Title should start with an action verb (e.g., "Automate", "Create", "Set up", "Streamline", "Integrate")
- Title should be specific about what's being automated or improved
- Description should explain the "what" and "why" of the automation opportunity
- Focus on the business value or time savings
- Use British English spelling (analyse, organise, colour, behaviour)
- Do NOT include implementation details or technical specifics
- Keep the tone professional but accessible

Respond ONLY with valid JSON in this exact format:
{
  "title": "Your title here",
  "description": "Your description here"
}`,
        },
      ],
    });

    // Extract response text
    const responseText =
      message.content[0].type === "text" ? message.content[0].text.trim() : "";

    // Parse JSON response
    let parsed: CreateIdeaResponse;
    try {
      // Handle potential markdown code blocks
      const cleanJson = responseText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      parsed = JSON.parse(cleanJson);
    } catch {
      console.error("Failed to parse AI response:", responseText);
      return NextResponse.json(
        { error: "Failed to generate idea. Please try again." },
        { status: 500 }
      );
    }

    // Validate response structure
    if (!parsed.title || !parsed.description) {
      console.error("Invalid AI response structure:", parsed);
      return NextResponse.json(
        { error: "Failed to generate idea. Please try again." },
        { status: 500 }
      );
    }

    // Enforce title length limit
    const title =
      parsed.title.length > 80 ? parsed.title.slice(0, 77) + "..." : parsed.title;

    return NextResponse.json({
      title,
      description: parsed.description,
    });
  } catch (error) {
    console.error("Idea generation error:", error);

    // Handle missing API key
    if (error instanceof Error && error.message.includes("ANTHROPIC_API_KEY")) {
      return NextResponse.json(
        { error: "AI service is not configured" },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate idea. Please try again." },
      { status: 500 }
    );
  }
}
