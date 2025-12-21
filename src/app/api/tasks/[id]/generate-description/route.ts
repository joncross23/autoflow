import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface GenerateDescriptionResponse {
  description: string;
  generatedAt: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, prompt } = body;

    if (!title) {
      return NextResponse.json({ error: "Task title required" }, { status: 400 });
    }

    if (!prompt) {
      return NextResponse.json({ error: "Brief notes required" }, { status: 400 });
    }

    // Build context for AI
    const context = `
Task Title: ${title}
Brief Notes: ${prompt}
    `.trim();

    // Call Claude API for description generation
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `You are helping write a task description for a project management system. Based on the task title and brief notes, write a clear, well-structured description.

${context}

Guidelines:
- Expand the brief notes into a clear, actionable description
- Include relevant context and acceptance criteria if applicable
- Use bullet points for multiple items or steps
- Keep it concise but comprehensive (2-4 paragraphs maximum)
- Use British English spelling (e.g., analyse, organise, colour)
- Do NOT include the task title in the description
- Do NOT use markdown headers or bold formatting

Write the description directly, no preamble or explanation.`,
        },
      ],
    });

    // Extract response text
    const description = message.content[0].type === "text"
      ? message.content[0].text.trim()
      : "";

    const response: GenerateDescriptionResponse = {
      description,
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Description generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Generation failed" },
      { status: 500 }
    );
  }
}
