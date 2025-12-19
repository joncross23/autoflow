import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface TaskAnalysis {
  suggestions: {
    type: "subtask" | "blocker" | "tip";
    text: string;
  }[];
  complexity: "low" | "medium" | "high";
  generatedAt: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description } = body;

    if (!title) {
      return NextResponse.json({ error: "Task title required" }, { status: 400 });
    }

    // Build context for AI
    const context = `
Task Title: ${title}
${description ? `Description: ${description}` : "No description provided."}
    `.trim();

    // Call Claude API for task analysis
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `You are analysing a task for a project management system. Based on the task details, provide practical suggestions.

${context}

Respond in JSON format with this structure:
{
  "suggestions": [
    { "type": "subtask", "text": "Break this down into: ..." },
    { "type": "blocker", "text": "Watch out for: ..." },
    { "type": "tip", "text": "Consider: ..." }
  ],
  "complexity": "low|medium|high"
}

Guidelines:
- Provide 2-5 actionable suggestions
- subtask: specific steps or sub-tasks to complete this work
- blocker: potential issues or dependencies to be aware of
- tip: helpful advice or best practices
- Be concise and practical
- Assess complexity based on scope, dependencies, and technical difficulty

Respond with ONLY the JSON, no markdown or extra text.`,
        },
      ],
    });

    // Parse AI response
    const responseText = message.content[0].type === "text" ? message.content[0].text : "";

    // Clean the response (remove any markdown code blocks if present)
    const cleanedResponse = responseText
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .trim();

    let analysis: TaskAnalysis;
    try {
      const parsed = JSON.parse(cleanedResponse);
      analysis = {
        suggestions: parsed.suggestions || [],
        complexity: parsed.complexity || "medium",
        generatedAt: new Date().toISOString(),
      };
    } catch (parseError) {
      console.error("Failed to parse AI response:", cleanedResponse);
      // Return default response if parsing fails
      analysis = {
        suggestions: [
          { type: "tip", text: "Break this task into smaller, manageable steps." },
        ],
        complexity: "medium",
        generatedAt: new Date().toISOString(),
      };
    }

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Task analysis error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Analysis failed" },
      { status: 500 }
    );
  }
}
